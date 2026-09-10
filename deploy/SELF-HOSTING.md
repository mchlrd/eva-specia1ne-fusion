# Self-hosting the website on Windows Server + IIS

This is the deployment for running the site on your own Windows Server, with IIS
as the public front door and Node running the application behind it.

```
   visitor
      │  https://evarotech.ca  (and https://www.evarotech.ca)
      ▼
┌───────────────────────────────┐
│  IIS  (ports 80 + 443)        │  TLS certificate · http→https redirect
│  deploy/iis/web.config        │  reverse proxy
└───────────────┬───────────────┘
                │  http://127.0.0.1:3000  (loopback only, never public)
                ▼
┌───────────────────────────────┐
│  Node process                 │  server-side rendering
│  .output/server/index.mjs     │  contact form → SMTP (Microsoft 365, port 587)
└───────────────────────────────┘
```

IIS never serves files from the application folder — it only proxies — so the
`.env.local` file holding the SMTP password is never reachable from the web.

---

## 1. What the server needs

| Item | Notes |
| --- | --- |
| Windows Server | Existing installation, with the IIS role |
| **Node.js 22 LTS (x64)** | 20.12 or newer is required; 22 LTS recommended |
| **URL Rewrite 2.1** | IIS module — required for the redirect and proxy rules |
| **ARR 3.0** (Application Request Routing) | IIS module — required, provides `<proxy>` |
| Administrator access | To install modules, bindings and the service |
| Free RAM / disk | Node process ~150 MB while serving; build needs ~1 GB free |

Both IIS modules are free Microsoft downloads:
`https://www.iis.net/downloads/microsoft/url-rewrite` and
`https://www.iis.net/downloads/microsoft/application-request-routing`

---

## 2. Install Node

1. Download the **Node 22 LTS x64** MSI from `https://nodejs.org/en/download`.
2. Install with default options (leave *Add to PATH* enabled).
3. Open a **new** Command Prompt and confirm:

```cmd
node -v
```

You should see `v22.` or newer. Note the folder it installed to
(`C:\Program Files\nodejs`) — you may need it for the service later.

---

## 3. Install the IIS modules, then the app

Install **URL Rewrite 2.1** first, then **ARR 3.0**. ARR's installer will ask to
enable the proxy — either answer works, because step 5 below sets it explicitly.

Then put the code on the server, e.g. in `C:\inetpub\evarotech-site`:

```cmd
cd /d C:\inetpub
git clone https://github.com/mchlrd/eva-specia1ne-fusion.git evarotech-site
cd evarotech-site
npm ci
```

`npm ci` (not `--production`) is correct — the build tooling lives in
devDependencies.

### SMTP credentials

The contact form needs the mail credentials, and `.env.local` is deliberately not
in the repository, so create it on the server:

```cmd
copy .env.example .env.local
notepad .env.local
```

Fill in:

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=no-reply@evarotech.ca
SMTP_PASS=<the mailbox password>
SMTP_TO=service@evarotech.ca
```

The password lives in the Microsoft 365 admin centre for the `no-reply` mailbox
(SMTP AUTH must stay enabled on that mailbox, and it must be a licensed account).

---

## 4. Build the site

```cmd
npm run build:selfhosted
```

This produces `.output\server\index.mjs` (the Node server) and `.output\public`
(the static assets). Confirm both exist before continuing.

> `npm run build` (without `:selfhosted`) is the *other* build target, used for
> the managed hosting setup. It produces a worker bundle that **cannot** run on
> Windows. Always use `build:selfhosted` on this server.

---

## 5. Start it and test it directly — before touching IIS

Do this first. It separates "the app is broken" from "the proxy is broken", which
saves a lot of time later.

```cmd
npm run start:selfhosted
```

You should see:

```
➜ Listening on: http://127.0.0.1:3000/
```

While it runs, open a browser **on the server** and check
`http://localhost:3000/` — the home page should appear, and
`http://localhost:3000/services`, `/managed`, `/approach`, `/contact` should all
work. Press `Ctrl+C` to stop it when you're happy.

If this step fails, fix it here before going on. Nothing below will work until
the app runs on its own.

---

## 6. Point IIS at it

### 6a. Create the folder IIS will serve

The IIS site's physical path must be an empty folder containing **only**
`web.config` — never the application folder.

```cmd
mkdir C:\inetpub\evarotech-proxy
copy C:\inetpub\evarotech-site\deploy\iis\web.config C:\inetpub\evarotech-proxy\
```

### 6b. Allow the two forwarded headers (required)

Without this, IIS answers **500.50** instead of proxying. Run as Administrator:

```cmd
%windir%\system32\inetsrv\appcmd.exe set config -section:system.webServer/rewrite/allowedServerVariables /+"[name='HTTP_X_FORWARDED_FOR']" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.webServer/rewrite/allowedServerVariables /+"[name='HTTP_X_FORWARDED_PROTO']" /commit:apphost
```

`X-Forwarded-For` is **not optional**: without it every visitor looks like
`127.0.0.1` to the application, and the contact form's per-IP rate limit becomes a
single shared bucket for the whole internet.

### 6c. Enable the ARR proxy

```cmd
%windir%\system32\inetsrv\appcmd.exe set config -section:system.webServer/proxy /enabled:"True" /commit:apphost
```

### 6d. Point the existing site at the proxy folder

In **IIS Manager** → *Sites* → your evarotech.ca site → **Basic Settings** →
set *Physical path* to `C:\inetpub\evarotech-proxy`. Keep the existing bindings
(the `evarotech.ca` and `www.evarotech.ca` HTTPS bindings, plus the plain HTTP
one for the redirect) and the existing certificate.

**Before you change the path**, take a copy of the current site folder:

```cmd
xcopy C:\inetpub\wwwroot C:\inetpub\wwwroot-backup-<date>\ /E /I
```

---

## 7. Run the Node app as a service

The app has to keep running without anyone logged in. Two options — pick one.

### Option A — Scheduled Task (nothing extra to download)

```cmd
schtasks /Create /TN "EvaroTech Website" /TR "C:\inetpub\evarotech-site\deploy\windows\start-site.cmd" /SC ONSTART /RU SYSTEM /RL HIGHEST /F
schtasks /Run /TN "EvaroTech Website"
```

No auto-restart if Node crashes. To add one: Task Scheduler → the task →
*Settings* → tick *If the task fails, restart every*, `1 minute`, up to `3` times.

### Option B — NSSM (auto-restarts, better service semantics)

Download NSSM from `https://nssm.cc/download`, then as Administrator:

```cmd
nssm install EvaroTechSite "C:\Program Files\nodejs\node.exe" ".output\server\index.mjs"
nssm set EvaroTechSite AppDirectory "C:\inetpub\evarotech-site"
nssm set EvaroTechSite AppEnvironmentExtra NODE_ENV=production HOST=127.0.0.1 PORT=3000
nssm set EvaroTechSite Start SERVICE_AUTO_START
nssm start EvaroTechSite
```

With NSSM, either put the SMTP values in `AppEnvironmentExtra` or leave them in
`.env.local` (the `AppDirectory` above is what makes that file findable).

Both options run the app with its working directory set to the app folder, which
is what allows `.env.local` to be read.

---

## 8. Go-live checklist

- [ ] Node service is running: `http://localhost:3000/` works **on the server**
- [ ] Router forwards **both** 80 and 443 to this server
- [ ] `https://evarotech.ca` and `https://www.evarotech.ca` both load the new site
- [ ] `http://evarotech.ca` redirects to HTTPS
- [ ] Every page loads: `/`, `/services`, `/managed`, `/approach`, `/contact`
- [ ] Images and the platform logos all appear
- [ ] **Outbound SMTP works from this server** (see below)
- [ ] **A real enquiry submitted through the contact form arrives** at the mailbox
- [ ] `.output` and `.env.local` are NOT reachable from the browser
      (e.g. `https://evarotech.ca/.env.local` must 404)

Outbound mail test — run on the server:

```powershell
Test-NetConnection smtp.office365.com -Port 587
```

`TcpTestSucceeded : True` means the firewall allows it. If it fails, ask whoever
manages the firewall to allow outbound TCP 587 to `smtp.office365.com` from this
server. (Port 25 is blocked by many firewalls and is **not** used here.)

---

## 9. Updating the site later

```cmd
cd /d C:\inetpub\evarotech-site
git pull
npm ci
npm run build:selfhosted
```

Then restart the service (`schtasks /End` + `/Run`, or `nssm restart EvaroTechSite`).
Expect a few seconds of downtime while the process restarts.

---

## 10. Rollback

Nothing about DNS or email is touched by this deployment, so rolling back is local
to this server:

1. Stop the Node service.
2. IIS Manager → the site → *Basic Settings* → point the physical path back to the
   original folder (e.g. `C:\inetpub\wwwroot`).
3. The original site files are untouched — either in place or in the
   `wwwroot-backup-<date>` copy.

You can also delete `web.config` from the old folder if the old site had none of
its own.

---

## 11. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| **500.50** | The forwarded headers aren't allowed — run the two `allowedServerVariables` commands in 6b. |
| **502 / 504 Bad Gateway** | Node isn't running, or is on a different port. Check the service and that the app logs `Listening on: http://127.0.0.1:3000/`. |
| **404 on every page** | The ARR proxy isn't enabled — run 6c. |
| **500.19 at startup** | IIS rejected `web.config`. Install URL Rewrite + ARR; if it persists, remove the `<proxy ... />` line and use 6c instead. |
| **Site loads but every page is unstyled** | Assets are being blocked — confirm the proxy rule is forwarding `/assets/*` (it forwards everything by default). |
| **"Forbidden" when submitting the form** | The POST was treated as cross-site. Only submit from `https://evarotech.ca` itself (posts from other domains are blocked on purpose). |
| **Form says "couldn't send … right now"** | SMTP problem: credentials in `.env.local`, SMTP AUTH enabled on the mailbox, or outbound 587 blocked. Check the service log for `[contact-form] failed to send enquiry`. |
| **"Too many enquiries" for everyone** | `X-Forwarded-For` is missing — see 6b. Every visitor is sharing one rate-limit bucket. |
| **Everything is slow for outside visitors** | The upload speed of the office internet connection is the limit. Optional: enable IIS *Dynamic Compression* for the site, and check Step 7's ARR timeout for long requests. |

Logs: the Node service writes to stdout — `[contact-form]` lines confirm sends and
failures. With **Option A** capture output with
`schtasks /Run` plus a redirect inside `start-site.cmd`, or with **Option B** let
NSSM log to a file (`nssm set EvaroTechSite AppStdout C:\inetpub\logs\site.log` and
the same for `AppStderr`).

---

## 12. Security notes for this server

Found while checking the public IP — worth fixing now that the box hosts the
public site:

- **FTP (port 21) is open to the internet.** FTP sends credentials in cleartext and
  is constantly brute-forced. Move uploads to SFTP, or restrict port 21 to known
  addresses only.
- **The network controller's admin pages are reachable from the internet**
  (ports 8080 and 8443, redirecting to `/manage`). Point those at a VPN or restrict
  them to your own addresses.
- **The TLS certificate expires 30 December 2026.** Renew it before then and update
  the HTTPS binding, or visitors will get a security warning.
- **Keep the Node port private.** `HOST=127.0.0.1` means port 3000 is only reachable
  from the server itself; don't forward it through the router.
- **Never point the IIS physical path at the application folder** — `.env.local`
  would become downloadable.
- Windows updates and Node updates on this box are now part of keeping the website
  online, because it is the public-facing machine.

---

## 13. Files this deployment added

| File | Purpose |
| --- | --- |
| `vite.selfhosted.config.ts` | Builds the app as a Node server (`node-server` preset) instead of the managed-hosting bundle |
| `package.json` → `build:selfhosted`, `start:selfhosted` | Build and run scripts used above |
| `deploy/iis/web.config` | IIS redirect + reverse proxy rules |
| `deploy/windows/start-site.cmd` | Starts the Node server with the right environment |
| `deploy/SELF-HOSTING.md` | This guide |

The default `npm run build` is unchanged, so the managed hosting deployment keeps
working exactly as before.
