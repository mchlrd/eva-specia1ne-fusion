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
│   content.json  ← every word, editable here  │
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

The publishable folder is produced by whoever holds the repository. `npm run
package:static` builds it and packs it into a single zip — `handoff/
evarotech-site-<date>.zip` — containing `READ-ME-FIRST.txt` and the `site/` folder
to copy from; `npm run build:static` just produces the folder. Its contents are
the whole website:

```
index.html  services/  managed/  approach/  contact/     ← one folder per page
assets/     favicon.png  robots.txt                       ← images, scripts, styles
404.html                                                  ← the site's own not-found page
content.json                                              ← every word on the site
contact.ashx  web.config                                  ← the form handler + site settings
```

`content.json` is the file to edit for wording changes — see section 6. It
explains itself at the top, and the pages read it on every load.

Every page also carries a `<meta name="ev-content-file">` tag saying whether this
build ships that file: the export stamps `yes`, a build that has no writable disk
leaves the placeholder. That is not decoration. It is how the site knows that a
missing `content.json` *here* is a fault worth warning about, while a hosted build
that was never meant to have the file — and a development server — stay quiet
instead of showing the warning panel to every visitor. Leave the tag in place.

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

The site is bound to `evarotech.ca` and `www.evarotech.ca`, so the `localhost` name
matches no binding and `https://localhost/...` fails at the TLS handshake. Run this
**on the server** instead — it connects to the site locally while still presenting
the real hostname, which is what the self test requires:

```cmd
curl.exe --resolve evarotech.ca:443:127.0.0.1 https://evarotech.ca/contact.ashx?selftest=1
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
it can send mail, so it must not be reachable from the internet. It also refuses
any request that arrived with a proxy's forwarding headers, because IIS sees one
of those as local: a proxy running on this same machine (ARR, or whatever fronts
the site) would otherwise hand the public internet a way to send mail as
`no-reply@evarotech.ca`. It is throttled like a real enquiry for the same reason.
(`curl.exe` ships with Windows 10 and Server 2019+. On older builds, add
`127.0.0.1 evarotech.ca` to `C:\Windows\System32\drivers\etc\hosts`, open the same
URL in a browser, then remove the line again. Beware that going through the public
URL from your own desk will now be refused — that request arrives through the
proxy, so do not read the refusal as a broken setting.)

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
- [ ] `https://evarotech.ca/content.json` loads, and changing a value in it
      changes that wording on the page with no rebuild
- [ ] The theme control in the header switches the site between light and dark,
      and the choice survives a reload

---

## 6. Changing the words on the site

There are two kinds of change, and they are not the same. Copy/wording changes
need nothing from us; anything structural arrives as a rebuild.

### Text you can change yourself, on the server: `content.json`

Every word on the site lives in `content.json` in the site root, next to
`index.html`. To change the wording:

1. Open `content.json` in Notepad (it explains itself at the top).
2. Change only what is between the quotes, `"like this"`.
3. Save as UTF-8 (Notepad's default), then press Ctrl+F5 in the browser.

Nothing is restarted, rebuilt or copied, and the change applies to every page at
once — one phone number, one footer line, one headline, in one place.

What the file tolerates: `//` comment lines, blank lines, and a trailing comma
before a closing brace or bracket. What it will not accept: a missing quote or
comma, or an empty `""` value.

**When something in it is wrong, nothing breaks.** The site keeps its built-in
text for the values it could not read, and a small panel appears at the bottom
left of the page naming the value and the line to look at. That panel is only
visible when there is a problem — and only on a deployment that is supposed to
have the file, which is this one. Seeing it at all means `content.json` is
missing from the site root, is being served as a page instead of as the file, or
has a real mistake in it.

The same rules apply to list entries (testimonials, services, packages,
platforms): reorder them, delete them, or add a new one with a fresh `id`. A new
entry has to be complete, because it has no built-in text to fall back on; an
incomplete one is left out and reported in that panel.

Placeholders you can use inside the text: `{{platformCount}}`, `{{name}}`,
`{{firstName}}`, `{{phone}}`. Leaving them in is usually the right thing.

What the file does **not** change: photos and logos (those are files in
`assets/`), page layout, and the contact form's validation messages. Search
results and social previews also come from the build, so a changed page title or
description shows up on the page immediately but in Google or a Facebook preview
after the next rebuild.

**Light and dark.** The header carries a theme control: follow the device, or pin
light or dark by hand. A visitor's choice is remembered in their own browser, and
a first-time visitor is shown whichever theme their own device is set to — which
is why the site may open dark on a machine running dark mode. Nothing about it is
configurable on the server and nothing needs copying; it is part of the page.

### Anything else: a rebuild, sent as files

Because the styles and scripts carry a content hash in their filenames
(`assets/styles-DH9Xmtb3.css`), an update is just a new set of files: old pages
keep working while new ones are copied in.

1. Rebuild the export folder (`npm run build:static` in the repository).
2. Copy the new `index.html`, the five page folders, `assets/` and `content.json`
   over the existing ones — together, in one pass.
3. Nothing to restart — there is no service to cycle, and visitors get the new
   pages immediately (only `/assets` is cached long-term; HTML is always
   re-validated).

`npm run package:static -- --pages` packs exactly those files, leaving
`contact.ashx` and `web.config` out on purpose: the copies on the server carry
hand corrections the repository does not, and overwriting them is what broke the
contact form once already. The full package (`npm run package:static`) is for a
first-time install.

Either package is refused if `contact.ashx` fails two checks that run before it
is packed: that the file is pure ASCII with no byte-order mark, and that it
compiles with the same C# 5 compiler IIS uses, on the same codepage. Both are
failures that have already taken the live form down once — a typographic dash in
an email subject, and a comment block that the .ashx compiler treats as code —
and neither is visible to anybody until a customer submits the form. The check
also runs on its own: `node scripts/check-handler.mjs`.

If `content.json` has been edited on the server, copy it back into the
repository (or hand it over) before rebuilding, or that work is replaced by
whatever the repository says.

---

## 7. Rollback

Copy the backed-up files back into the site folder, or point the site's physical
path at the backup folder. Nothing outside that folder was changed: no DNS, no
mail settings, no IIS bindings, no installed services.

---

## 8. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| **Every page returns HTTP 500** ("There is a problem with the resource you are looking for, and it cannot be displayed") | That text is IIS's generic page for a *remote* visitor — it deliberately hides the real reason. Open the site **in a browser on the server itself** and you get the full error instead: Module, Notification, Handler, **Error Code**, Config Error and **Config Source** (the exact line of `web.config` at fault). Take that Error Code to the rows below. From a command line the sub-status is in the last column of the newest file in `C:\inetpub\logs\LogFiles\W3SVC1\` — `500 19`, `500 21`, `500 24`, `500 50`. |
| **500.19 / Error Code `0x800700b7` / "Cannot add duplicate collection entry of type 'add'…"** | `web.config` re-adds a collection entry that already exists in IIS's own `applicationHost.config`. The stock defaults already deny the `.config` extension and already hide the `web.config` segment, so repeating either one is an error rather than an override. The shipped `web.config` guards both with `<remove>` first; if the copy on the server predates that, delete the `<security>` block from it — IIS does the same thing by default. |
| **500.19 / Error Code `0x80070005` / "Cannot read configuration file"** | NTFS permissions. The application pool identity (`IIS AppPool\<pool name>`, or `IUSR`) needs **Read** on the site folder and its contents. Typical when the files were copied from a profile folder such as `C:\Users\<you>\Downloads`. |
| **500.19 / Error Code `0x8007000d`** | `web.config` is not well-formed XML, or references a section the server doesn't know. Usually a truncated copy of the file. |
| **500 pointing at the `<system.web>` line** | The site's application pool has .NET CLR version set to **No Managed Code**. The contact form needs `v4.0` anyway, so set the pool's .NET CLR version to `v4.0`, then recycle the pool. |
| **Need to know whether `web.config` is the problem at all** | Fastest bisect: rename it to `web.config.bak` and reload. The site works without it — `index.html` is already in IIS's default document list, and `.config` files are already blocked by default. You lose only the site's own 404 page and the long-term caching for `assets/`. If it still returns 500 with the file renamed, the cause is not configuration: check the app pool (above), or leftover files from the previous site. |
| **Form says "We couldn't send your message"** | The handler didn't answer. Check step 1 (ASP.NET enabled), step 3 (settings + IIS restarted), and outbound 587. The reason is written to `C:\inetpub\logs\evarotech-enquiries.log`. |
| **`/contact.ashx` downloads or shows source code** | ASP.NET 4.x isn't enabled, so IIS treats the file as content. Enable the feature and retest. |
| **404 page shows IIS's default, not ours** | `web.config` isn't in the site root, or the site is nested as a virtual directory. The `<httpErrors>` section only applies at the site level. |
| **Pages load but look unstyled** | The `assets/` folder wasn't copied, or wasn't copied to the site root. |
| **A hand edit to `index.html` (or `assets/*.js`) had no effect** | Expected — those files are not where the words live. Each page is a prerendered React document, and the scripts in `assets/` redraw it a moment after it loads, so anything edited into the HTML is thrown away, and a hand-edited bundle is cached for a year by filename anyway. Edit `content.json` for wording; ask us for anything else. |
| **`content.json` edited, page unchanged** | Three things to check, in order: the file is in the site root next to `index.html`; it saved as `content.json` and not `content.txt`; and the browser did a real reload (Ctrl+F5) rather than showing a cached page. If the file could not be read at all, a panel appears at the bottom left saying so. |
| **A panel at the bottom left names a line in `content.json`** | The file has a problem at that line — usually a missing quote or comma, or an empty value — and the site is showing its built-in wording for those values. Fix that line, save, reload. Everything else in the file still applies. |
| **The panel says `did not come back as the text file — the server sent a page instead`** | The request for `/content.json` was answered with an HTML page rather than the file — normally IIS's own error page for a path it could not match, which is what it does when the file is not in the site root. Check that `content.json` is sitting next to `index.html`, spelled exactly that way, and not `content.txt`. |
| **`/content.json` gives a 404 or a 404.3** | The file is missing from the site root, or IIS has no MIME type for `.json` (rare — IIS 8 and newer have it). Copy the file in; if the MIME type really is missing, add it with `<remove fileExtension=".json" />` followed by `<add fileExtension=".json" mimeType="application/json" />` inside `<staticContent>`, guarding the `<add>` with the `<remove>` so the entry can't collide with IIS's own. |
| **`/services` becomes `/services/` in the address bar** | Normal IIS behaviour for a folder with an `index.html`. Harmless; links inside the site don't go through it. |
| **"The self test is only available on the server itself"** | Working as intended. Run the `curl.exe --resolve` command from step 4 on the server; browsing it from another machine — or through the router, which arrives from the router's address — can never be local. The same answer appears for a request that came through a proxy, even from the server's own desk: the forwarding headers give it away, and that is the check doing its job. |
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
| `deploy/HANDOFF-README.txt` | The `READ-ME-FIRST.txt` shipped inside the zip; this guide is the long version of it |
| `vite.static.config.ts`, `scripts/export-static.mjs`, `scripts/package-static.mjs` | How the folder and the zip are produced — not needed on this server |
| `deploy/SELF-HOSTING.md` | The alternative (Node + IIS reverse proxy) if the form should run there instead |
