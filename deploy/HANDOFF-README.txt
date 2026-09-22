EvaroTech website - what is in this package
===========================================

  READ-ME-FIRST.txt   this file. Read it, do NOT copy it to the server.
  site/               the website. Copy its CONTENTS into the IIS folder.

Nothing here needs Node, a service, a reverse proxy, URL Rewrite or ARR.
IIS serves these files exactly like the site you host today.


Before you copy anything
------------------------

1. Back up the folder your evarotech.ca site points at today:

     xcopy C:\inetpub\wwwroot C:\inetpub\wwwroot-backup-<date>\ /E /I

2. Enable ASP.NET 4.x once - the contact form needs it. As Administrator:

     Install-WindowsFeature Web-Asp-Net45

   (Or Server Manager -> Add Roles and Features -> Web Server (IIS) ->
    Application Development -> ASP.NET 4.x)

3. Set the mail settings as machine environment variables, so the mailbox
   password never sits inside the website folder:

     setx EVAROTECH_SMTP_USER "no-reply@evarotech.ca" /M
     setx EVAROTECH_SMTP_PASS "<the mailbox password>" /M
     setx EVAROTECH_SMTP_TO   "service@evarotech.ca" /M

   Then restart IIS (iisreset) so the worker process picks them up.
   If you would rather keep everything in one file, the same values can go in
   site\web.config under <appSettings> instead.


Copying it in
-------------

Copy everything INSIDE site\ into the folder the site already uses, overwriting
the existing files. Keep that same folder: your bindings, certificate and router
forwarding stay as they are, and neither DNS nor your mail records are touched.


If the site returns "HTTP 500 - There is a problem with the resource you are
looking for, and it cannot be displayed"
-------------------------------------------------------------------------------

That message is IIS's generic page for a remote visitor and it hides the real
reason on purpose. Two things to know:

First, open the site in a browser ON THE SERVER. IIS shows the full error to a
local request only: a Module, an Error Code, a Config Error line and a Config
Source block that points at the exact offending line of web.config.

Second, the fastest test of whether web.config is to blame at all: rename it to
web.config.bak and reload. The site works without it - index.html is already in
IIS's default document list, and IIS already refuses to serve .config files. You
lose only the site's own 404 page and the long-term caching of assets\.

If the Error Code is 0x800700b7 ("Cannot add duplicate collection entry"), the
web.config on the server is an older copy: it re-adds two entries that already
exist in IIS's own defaults. Delete the whole <security>...</security> block from
it (IIS already does exactly that by default) or replace it with the fixed file
from site\web.config in this package.

If the Error Code is 0x80070005 ("Cannot read configuration file"), it is NTFS
permissions - the application pool identity needs Read on the site folder.

If the error points at the <system.web> line, set the site's application pool
.NET CLR version to v4.0 (not "No Managed Code") and recycle the pool. The
contact form needs v4.0 in any case.


Testing it
----------

The site is bound to evarotech.ca and www.evarotech.ca, so https://localhost/...
matches no binding and fails at the TLS handshake. Run this on the server instead:

     curl.exe --resolve evarotech.ca:443:127.0.0.1 https://evarotech.ca/contact.ashx?selftest=1

It connects to the site locally while still presenting the real hostname, which is
what the self test requires. It reports the settings it found and sends a real test
message, so you know the credentials and TLS work. It only answers when called from
the server itself.

(curl.exe ships with Windows 10 and Server 2019 and newer. On anything older, add
 127.0.0.1 evarotech.ca to C:\Windows\System32\drivers\etc\hosts, open the same URL
 in a browser, then remove that line again.)

If it fails it is almost always one of three things: IIS was not restarted after
step 3, SMTP AUTH is disabled on the no-reply mailbox in the Microsoft 365 admin
centre, or the firewall blocks outbound port 587 - check with:

     Test-NetConnection smtp.office365.com -Port 587

Then submit one real enquiry through https://evarotech.ca/contact.


Worth checking once it is live
------------------------------

  - https://evarotech.ca and https://www.evarotech.ca both load the new site
  - http://evarotech.ca redirects to https
  - all five pages work: /, /services, /managed, /approach, /contact
  - images, logos and the page transition all appear
  - a wrong address (e.g. /does-not-exist) shows OUR 404 page, not IIS's
  - /web.config returns an error rather than the file
  - /contact.ashx answers {"error":"POST only."} rather than showing code
  - /content.json loads (that file is the site's text - see below)


Changing the words on the site
------------------------------

content.json, in the site root next to index.html, holds the text of every page:
headlines, paragraphs, service descriptions, testimonials, the phone number, the
footer - the lot. It explains itself at the top.

To change wording: open it in Notepad, change only what sits between the quotes,
save as UTF-8, then press Ctrl+F5 in the browser. Nothing is restarted or
rebuilt, and the change applies to every page at once.

The file tolerates // comments, blank lines and a trailing comma. If something in
it is wrong, nothing breaks: the site keeps its built-in wording and shows a
small panel at the bottom left naming the line to look at.

What it does not change: photos, logos, page layout, and the form's validation
messages. Those come with an update from us.

One thing that will never work: editing index.html or the files in assets\ by
hand. Each page is built by the scripts in assets\, which redraw it a moment
after it loads, so a hand edit in the HTML is thrown away immediately.


Updating it later
-----------------

Updates are file copies: a new index.html, the page folders, assets\ and
content.json are copied over the existing ones, all in one pass. Nothing needs
restarting. Only assets\ is cached long-term (those filenames carry a hash, so old
and new coexist), while HTML and content.json are always re-checked, so visitors
get new pages straight away. Keep contact.ashx and web.config out of an update -
the copies on the server are the ones that work.


Rolling back
------------

Copy the backup folder from step 1 back, or point the site's physical path at it.


The full step-by-step version of this, including a troubleshooting table for every
error you might see, is in the repository at deploy/STATIC-HOSTING.md.
