# Deploying the website as static files (IIS, no Node)

This is the deployment that matches how evarotech.ca is hosted today: IIS serves
a folder of files. There is **no Node installation, no Windows service, no
reverse proxy, no URL Rewrite, no ARR, and no open port** behind IIS. You copy
files in, and that is the deployment.

```
   visitor
      │  https://evarotech.ca  (and https://www.evarotech.ca)
      ▼
┌──────────────────────────────────────────────┐
│  IIS  (ports 80 + 443, existing certificate) │
│                                              │
│   index.html  services/  managed/            │  ← plain files, cached by IIS
│   approach/   contact/   assets/  404.html   │
│                                              │
│   contact.ashx  ─────────────────────────┐   │  ← the only server-side piece
└──────────────────────────────────────────┼───┘
                                           ▼
                            SMTP (Microsoft 365, port 587)
```

Every page is a finished HTML file. The animations, the page transition, the
overlays and the hover effects are all part of the page itself, so they work
exactly as they do on the hosted version.

> There is a second deployment shape available — running the site as a Node
> server behind IIS as a reverse proxy. It needs URL Rewrite + ARR and a Windows
> service, so unless you want to run Node on this server, use this guide. It is
> in `deploy/SELF-HOSTING.md`.

---

## 1. The one prerequisite: ASP.NET 4.x

The contact form needs something server-side to send mail, so it posts to
`contact.ashx` — a single self-contained file in the site root. IIS compiles it
on the first request; there is nothing to build and no DLL to deploy.

The **ASP.NET 4.x** feature ships with Windows Server; it just has to be enabled
once, as Administrator:

```powershell
Install-WindowsFeature Web-Asp-Net45
```

Or in **Server Manager** → *Add Roles and Features* → *Web Server (IIS)* →
*Application Development* → tick **ASP.NET 4.x**.

If you would rather not enable it, tell us — the form needs a replacement, and
the Node deployment in `deploy/SELF-HOSTING.md` is the alternative.

---

## 2. Copy the files in

The publishable folder is produced by whoever holds the repository
(`npm run build:static`). Its contents are the whole website:

```
index.html  services/  managed/  approach/  contact/     ← one folder per page
assets/     favicon.png  robots.txt                       ← images, scripts, styles
404.html                                                  ← the site's own not-found page
contact.ashx  web.config                                  ← the form handler + site settings
```

Back up what is there now, then copy the folder's **contents** into the site's
existing physical path (the folder your `evarotech.ca` site already points at):

```cmd
xcopy C:\inetpub\wwwroot C:\inetpub\wwwroot-backup-<date>\ /E /I
```

Two things to avoid: keep the same folder the site already uses (so bindings,
certificate and router forwarding are untouched), and do not put these files in
a *virtual directory* underneath the site — the 404 handling in `web.config`
only applies at the site root.

Nothing about DNS or email changes. MX and SPF records stay exactly as they are.

---

## 3. Tell the form where to send

The handler reads its settings from environment variables first, then
`web.config`. Environment variables are preferable, because the password then
lives **outside the web root** entirely.

As Administrator on the server:

```cmd
setx EVAROTECH_SMTP_USER "no-reply@evarotech.ca" /M
setx EVAROTECH_SMTP_PASS "<the mailbox password>" /M
setx EVAROTECH_SMTP_TO "service@evarotech.ca" /M
```

Environment variables are read when the IIS worker process starts, so restart
IIS afterwards (`iisreset`), or just recycle the application pool.

`SMTP_HOST` (`smtp.office365.com`) and `SMTP_PORT` (`587`) already default to the
right values and only need setting if something changes. If you prefer keeping
everything in one file, put the values in `web.config`'s `<appSettings>` instead
— the handler accepts either.

The mailbox itself needs **SMTP AUTH enabled** in the Microsoft 365 admin centre.
Microsoft disables it by default on newer tenants.

---

## 4. Test it before announcing anything

From a browser **on the server**:

```
https://localhost/contact.ashx?selftest=1
```

It answers with JSON: the host, port, user, whether a password is configured,
and the result of a real send. A successful test looks like
`"ok":true` and an email arrives at the address in `SMTP_TO`. Anything else
reports the reason directly, which is usually one of:

- credentials not picked up yet (restart IIS),
- SMTP AUTH disabled on the mailbox,
- outbound port 587 blocked by the firewall — check with
  `Test-NetConnection smtp.office365.com -Port 587`.

This self test only answers when called **from the server itself**, on purpose —
it can send mail, so it must not be reachable from the internet.

Then submit a real enquiry through `https://evarotech.ca/contact` and confirm it
arrives.

---

## 5. Go-live checklist

- [ ] `https://evarotech.ca` and `https://www.evarotech.ca` show the new site
- [ ] `http://evarotech.ca` redirects to HTTPS
- [ ] Every page loads: `/`, `/services`, `/managed`, `/approach`, `/contact`
- [ ] Images, logos and the page transition all work
- [ ] The self test in step 4 succeeded, and a real enquiry arrived
- [ ] A wrong address (e.g. `/does-not-exist`) shows the site's own 404 page
- [ ] `https://evarotech.ca/web.config` returns an error, not the file
- [ ] `https://evarotech.ca/contact.ashx` returns `{"error":"POST only."}`, not code

---

## 6. Updating the site later

Because the styles and scripts carry a content hash in their filenames
(`assets/styles-C6M7QLqN.css`), an update is just a new set of files: old pages
keep working while new ones are copied in.

1. Rebuild the export folder (`npm run build:static` in the repository).
2. Copy the new `index.html` and the five page folders plus `assets/` over the
   existing ones.
3. Nothing to restart — there is no service to cycle, and visitors get the new
   pages immediately (only `/assets` is cached long-term; HTML is always
   re-validated).

---

## 7. Rollback

Copy the backed-up files back into the site folder, or point the site's physical
path at the backup folder. Nothing outside that folder was changed: no DNS, no
mail settings, no IIS bindings, no installed services.

---

## 8. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| **Form says "We couldn't send your message"** | The handler didn't answer. Check step 1 (ASP.NET enabled), step 3 (settings + IIS restarted), and outbound 587. The reason is written to `C:\inetpub\logs\evarotech-enquiries.log`. |
| **`/contact.ashx` downloads or shows source code** | ASP.NET 4.x isn't enabled, so IIS treats the file as content. Enable the feature and retest. |
| **404 page shows IIS's default, not ours** | `web.config` isn't in the site root, or the site is nested as a virtual directory. The `<httpErrors>` section only applies at the site level. |
| **Pages load but look unstyled** | The `assets/` folder wasn't copied, or wasn't copied to the site root. |
| **`/services` becomes `/services/` in the address bar** | Normal IIS behaviour for a folder with an `index.html`. Harmless; links inside the site don't go through it. |
| **"The self test is only available on the server itself"** | Working as intended — open it from a browser on the server. |
| **Enquiries work, then stop** | The mailbox password was changed. Update `EVAROTECH_SMTP_PASS` and restart IIS. |
| **Site refuses every enquiry** | The per-visitor limit is 6 per 15 minutes, which is deliberate (a static site has no other spam protection). It's per IP address, so a whole office behind one address shares it. |

---

## 9. Security notes

- **The form cannot be used to send mail to anyone else.** The recipient is fixed
  in configuration, never taken from the request, and every field is validated
  and length-capped in the handler.
- **Prefer the environment variable for the password.** If you do put it in
  `web.config`, note that IIS refuses to serve `.config` files, and the config
  also declares that denial explicitly.
- **`.ashx` needs ASP.NET to be a real handler.** If it is ever served as a
  static file, that is a misconfiguration — check step 1.
- **The handler keeps its own log** (`C:\inetpub\logs\evarotech-enquiries.log`):
  one line per enquiry and per failure, no message bodies.
- Unrelated to this deployment, but worth closing while this machine is the
  public face of the business: **FTP on port 21 is reachable from the internet**
  (cleartext credentials, heavily attacked), the **network controller's admin
  pages answer on ports 8080 and 8443** from outside, and the **TLS certificate
  expires 30 December 2026**.

---

## 10. Files this deployment uses

| File | Purpose |
| --- | --- |
| `static-export/` | The finished website: one HTML file per route, plus `assets/`, `404.html`, `favicon.png`, `robots.txt` |
| `deploy/iis-static/contact.ashx` | The contact form's server-side handler (the site's only server code) |
| `deploy/iis-static/web.config` | 404 handling, `.config` denial, `index.html` as the default document, long caching for `assets/` |
| `vite.static.config.ts`, `scripts/export-static.mjs` | How the folder is produced — not needed on this server |
| `deploy/SELF-HOSTING.md` | The alternative (Node + IIS reverse proxy) if the form should run there instead |
