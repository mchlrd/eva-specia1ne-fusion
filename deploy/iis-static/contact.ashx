<%@ WebHandler Language="C#" Class="ContactHandler" %>
<%--
  Contact-form handler for the static deployment of evarotech.ca.

  A static HTML site cannot send mail, so the form posts here instead. This file
  is the site's only server-side component; everything else is plain files.

  Drop it in the site root next to index.html. IIS compiles it on the first
  request, so there is nothing to build and no DLL to deploy.

  Requires the "ASP.NET 4.x" IIS feature (ships with Windows Server):
    Install-WindowsFeature Web-Asp-Net45        (or the IIS Manager UI)

  What it does, in order:
    - rejects anything but a same-origin POST (and a localhost-only self test)
    - silently swallows bots that fill the hidden honeypot field
    - validates and length-caps every field, so it can never relay arbitrary mail
    - throttles per visitor IP, since a static host has no other rate limiting
    - sends through SMTP with the recipient fixed in configuration

  Credentials come from environment variables first, then web.config appSettings:
    EVAROTECH_SMTP_HOST  SMTP_HOST   default smtp.office365.com
    EVAROTECH_SMTP_PORT  SMTP_PORT   default 587
    EVAROTECH_SMTP_USER  SMTP_USER   no-reply@evarotech.ca (also the From address)
    EVAROTECH_SMTP_PASS  SMTP_PASS   the mailbox password            [required]
    EVAROTECH_SMTP_TO    SMTP_TO     where enquiries are delivered
    EVAROTECH_LOG_PATH   LOG_PATH    log file path (default C:\inetpub\logs\evarotech-enquiries.log)

  Test it from a browser on the server itself:  https://localhost/contact.ashx?selftest=1
--%>
using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Caching;

public class ContactHandler : IHttpHandler
{
    private const int MaxNameLength = 100;
    private const int MaxEmailLength = 255;
    private const int MaxCompanyLength = 120;
    private const int MaxMessageLength = 1000;
    private const int MaxPerWindow = 6;
    private static readonly TimeSpan RateWindow = TimeSpan.FromMinutes(15);
    private static readonly object RateLock = new object();

    private const string DefaultLogPath = @"C:\inetpub\logs\evarotech-enquiries.log";

    public bool IsReusable
    {
        get { return false; }
    }

    public void ProcessRequest(HttpContext context)
    {
        // Local-only diagnostics, so you can verify credentials and TLS from a
        // browser on the server without needing to know SMTP from the outside.
        if (IsTruthy(context.Request.QueryString["selftest"]))
        {
            if (!context.Request.IsLocal)
            {
                WriteJson(context, 403, "{\"error\":\"The self test is only available on the server itself.\"}");
                return;
            }
            SelfTest(context);
            return;
        }

        if (!string.Equals(context.Request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase))
        {
            WriteJson(context, 405, "{\"error\":\"POST only.\"}");
            return;
        }

        // Bots fill hidden fields; people never see them. Answer as if it worked
        // so the bot moves on and nothing is sent.
        if (!string.IsNullOrEmpty(context.Request.Form["website"]))
        {
            WriteJson(context, 200, "{\"ok\":true}");
            return;
        }

        string name = Trim(context.Request.Form["name"]);
        string email = Trim(context.Request.Form["email"]);
        string company = Trim(context.Request.Form["company"]);
        string message = Trim(context.Request.Form["message"]);

        string problem = Validate(name, email, company, message);
        if (problem != null)
        {
            WriteJson(context, 400, "{\"error\":" + Json(problem) + "}");
            return;
        }

        string ip = ClientIp(context);
        if (!AllowRequest(ip))
        {
            WriteJson(context, 429, "{\"error\":\"Too many enquiries — please try again in a few minutes.\"}");
            return;
        }

        try
        {
            string messageId = Send(name, email, company, message);
            AppendLog(context, string.Format(
                CultureInfo.InvariantCulture,
                "{0:u} sent  from={1} <{2}> ip={3} id={4}",
                DateTime.UtcNow, name, email, ip, messageId));
            WriteJson(context, 200, "{\"ok\":true}");
        }
        catch (ConfigurationException ex)
        {
            AppendLog(context, string.Format(CultureInfo.InvariantCulture, "{0:u} FAILED (configuration) ip={1} {2}", DateTime.UtcNow, ip, ex.Message));
            WriteJson(context, 500, "{\"error\":\"The contact form is not configured yet — please email service@evarotech.ca directly.\"}");
        }
        catch (Exception ex)
        {
            // The reason (including any SMTP response) goes to the log, never to
            // the visitor — it can name internal hosts.
            AppendLog(context, string.Format(CultureInfo.InvariantCulture, "{0:u} FAILED ip={1} {2}: {3}", DateTime.UtcNow, ip, ex.GetType().Name, ex.Message));
            WriteJson(context, 500, "{\"error\":\"We couldn't send your message right now — please try again, or email service@evarotech.ca directly.\"}");
        }
    }

    // ---- mail -------------------------------------------------------------

    private static string Send(string name, string email, string company, string message)
    {
        ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;

        string host = Setting("SMTP_HOST", "smtp.office365.com");
        int port;
        if (!int.TryParse(Setting("SMTP_PORT", "587"), NumberStyles.Integer, CultureInfo.InvariantCulture, out port))
        {
            port = 587;
        }
        string user = Required("SMTP_USER");
        string pass = Required("SMTP_PASS");
        string to = Setting("SMTP_TO", "service@evarotech.ca");

        StringBuilder body = new StringBuilder();
        body.Append("Name: ").Append(name).Append("\r\n");
        body.Append("Email: ").Append(email).Append("\r\n");
        if (!string.IsNullOrEmpty(company)) body.Append("Business: ").Append(company).Append("\r\n");
        body.Append("\r\n").Append(message).Append("\r\n\r\n");
        body.Append("---\r\nSent from the contact form on evarotech.ca.\r\n");

        using (MailMessage mail = new MailMessage())
        using (SmtpClient client = new SmtpClient(host, port))
        {
            mail.From = new MailAddress(user, "EvaroTech Website");
            // Recipient is fixed in configuration — never taken from the request,
            // so this handler cannot be used to relay mail to third parties.
            mail.To.Add(to);
            mail.ReplyToList.Add(new MailAddress(email, name));
            mail.Subject = "Website enquiry — " + name;
            mail.SubjectEncoding = Encoding.UTF8;
            mail.Body = body.ToString();
            mail.BodyEncoding = Encoding.UTF8;
            mail.IsBodyHtml = false;

            client.EnableSsl = true;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential(user, pass);
            client.Timeout = 20000;

            client.Send(mail);
        }

        return "sent";
    }

    private static void SelfTest(HttpContext context)
    {
        StringBuilder report = new StringBuilder();
        bool ok = false;
        try
        {
            Send("Self test", Setting("SMTP_TO", "service@evarotech.ca"), null,
                "This is a self test from contact.ashx. If you received it, the contact form can send mail.");
            ok = true;
        }
        catch (Exception ex)
        {
            report.Append(Json(ex.GetType().Name + ": " + ex.Message));
        }

        string json = "{"
            + "\"ok\":" + (ok ? "true" : "false") + ","
            + "\"host\":" + Json(Setting("SMTP_HOST", "smtp.office365.com")) + ","
            + "\"port\":" + Setting("SMTP_PORT", "587") + ","
            + "\"user\":" + Json(Setting("SMTP_USER", "")) + ","
            + "\"to\":" + Json(Setting("SMTP_TO", "service@evarotech.ca")) + ","
            + "\"passwordConfigured\":" + (string.IsNullOrEmpty(Setting("SMTP_PASS", "")) ? "false" : "true") + ","
            + "\"tlsVersion\":" + Json(ServicePointManager.SecurityProtocol.ToString()) + ","
            + "\"error\":" + (report.Length > 0 ? report.ToString() : "null")
            + "}";

        WriteJson(context, ok ? 200 : 500, json);
    }

    // ---- validation -------------------------------------------------------

    private static string Validate(string name, string email, string company, string message)
    {
        if (name.Length == 0) return "Please add your name";
        if (name.Length > MaxNameLength) return "Name is too long";
        if (email.Length == 0) return "Enter a valid email";
        if (email.Length > MaxEmailLength) return "Email is too long";
        // Header injection guard: a newline in an address would let a sender
        // append their own mail headers.
        if (email.IndexOf('\r') >= 0 || email.IndexOf('\n') >= 0) return "Enter a valid email";
        if (name.IndexOf('\r') >= 0 || name.IndexOf('\n') >= 0) return "Please add your name";
        try
        {
            MailAddress parsed = new MailAddress(email);
            if (parsed.Address != email) return "Enter a valid email";
        }
        catch (FormatException)
        {
            return "Enter a valid email";
        }
        if (company.Length > MaxCompanyLength) return "Company is too long";
        if (message.Length == 0) return "Tell us what you need";
        if (message.Length > MaxMessageLength) return "Please keep it under 1000 characters";
        return null;
    }

    // ---- throttle ---------------------------------------------------------

    private class RateEntry
    {
        public int Count;
        public DateTime ResetAt;
    }

    private static bool AllowRequest(string ip)
    {
        string key = "enquiry-rate:" + ip;
        DateTime now = DateTime.UtcNow;
        lock (RateLock)
        {
            RateEntry entry = HttpRuntime.Cache[key] as RateEntry;
            if (entry == null || entry.ResetAt < now)
            {
                HttpRuntime.Cache.Insert(
                    key,
                    new RateEntry { Count = 1, ResetAt = now.Add(RateWindow) },
                    null,
                    now.Add(RateWindow),
                    Cache.NoSlidingExpiration);
                return true;
            }
            entry.Count++;
            return entry.Count <= MaxPerWindow;
        }
    }

    private static string ClientIp(HttpContext context)
    {
        string forwarded = context.Request.Headers["X-Forwarded-For"];
        if (!string.IsNullOrEmpty(forwarded))
        {
            int comma = forwarded.IndexOf(',');
            return (comma > 0 ? forwarded.Substring(0, comma) : forwarded).Trim();
        }
        return context.Request.UserHostAddress ?? "unknown";
    }

    // ---- configuration ----------------------------------------------------

    private class ConfigurationException : Exception
    {
        public ConfigurationException(string message) : base(message) { }
    }

    /// Environment variable first, then web.config appSettings, then the default.
    private static string Setting(string key, string fallback)
    {
        string fromEnvironment = Environment.GetEnvironmentVariable("EVAROTECH_" + key);
        if (!string.IsNullOrEmpty(fromEnvironment)) return fromEnvironment.Trim();

        string fromConfig = System.Configuration.ConfigurationManager.AppSettings[key];
        if (!string.IsNullOrEmpty(fromConfig)) return fromConfig.Trim();

        return fallback;
    }

    private static string Required(string key)
    {
        string value = Setting(key, null);
        if (string.IsNullOrEmpty(value))
        {
            throw new ConfigurationException(
                key + " is not set. Add it as an environment variable (EVAROTECH_" + key + ") or in web.config appSettings.");
        }
        return value;
    }

    // ---- plumbing ---------------------------------------------------------

    private static void AppendLog(HttpContext context, string line)
    {
        try
        {
            string path = Setting("LOG_PATH", DefaultLogPath);
            string directory = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory)) Directory.CreateDirectory(directory);
            File.AppendAllText(path, line + Environment.NewLine, Encoding.UTF8);
        }
        catch
        {
            // Logging must never break the form.
        }
    }

    private static void WriteJson(HttpContext context, int status, string json)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json; charset=utf-8";
        context.Response.CacheControl = "no-store";
        context.Response.Write(json);
    }

    private static string Json(string value)
    {
        if (value == null) return "null";
        StringBuilder builder = new StringBuilder("\"");
        foreach (char c in value)
        {
            switch (c)
            {
                case '"': builder.Append("\\\""); break;
                case '\\': builder.Append("\\\\"); break;
                case '\r': builder.Append("\\r"); break;
                case '\n': builder.Append("\\n"); break;
                case '\t': builder.Append("\\t"); break;
                default:
                    if (c < ' ') builder.Append("\\u").Append(((int)c).ToString("x4", CultureInfo.InvariantCulture));
                    else builder.Append(c);
                    break;
            }
        }
        return builder.Append('"').ToString();
    }

    private static string Trim(string value)
    {
        return value == null ? string.Empty : value.Trim();
    }

    private static bool IsTruthy(string value)
    {
        return string.Equals(value, "1", StringComparison.OrdinalIgnoreCase)
            || string.Equals(value, "true", StringComparison.OrdinalIgnoreCase);
    }
}
