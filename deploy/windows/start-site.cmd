@echo off
rem ===========================================================================
rem  EvaroTech website - starts the Node server that IIS reverse-proxies to.
rem
rem  Run this on the server, or register it to run at startup (see
rem  deploy/SELF-HOSTING.md). Keep the window open while testing; press Ctrl+C
rem  to stop the site.
rem
rem  The app folder is two levels up from this script (deploy\windows\).
rem ===========================================================================
setlocal

set "APP_DIR=%~dp0..\.."
cd /d "%APP_DIR%" || (
  echo [start-site] Could not enter "%APP_DIR%".
  exit /b 1
)

rem Listen on loopback only: IIS on ports 80/443 is the only public door.
set "HOST=127.0.0.1"
set "PORT=3000"
set "NODE_ENV=production"

rem --- SMTP settings --------------------------------------------------------
rem Leave these commented out if you prefer to keep a .env.local file next to
rem package.json - the server loads it automatically when the values below are
rem not set. Set them here (or as system environment variables) when running as
rem a service, where the working directory may not be the app folder.
rem
rem   set "SMTP_HOST=smtp.office365.com"
rem   set "SMTP_PORT=587"
rem   set "SMTP_SECURE=false"
rem   set "SMTP_REQUIRE_TLS=true"
rem   set "SMTP_USER=no-reply@evarotech.ca"
rem   set "SMTP_PASS="
rem   set "SMTP_TO=service@evarotech.ca"
rem --------------------------------------------------------------------------

rem Full path to node.exe if it is not on the PATH, e.g.:
rem   set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not defined NODE_EXE set "NODE_EXE=node"

set "SERVER_FILE=.output\server\index.mjs"
if not exist "%SERVER_FILE%" (
  echo [start-site] "%SERVER_FILE%" not found. Build it first:
  echo [start-site]     npm ci
  echo [start-site]     npm run build:selfhosted
  exit /b 1
)

echo [start-site] Node version:
"%NODE_EXE%" --version
echo [start-site] Listening on http://%HOST%:%PORT%/  (Ctrl+C to stop)
"%NODE_EXE%" "%SERVER_FILE%"

echo [start-site] The server exited with code %ERRORLEVEL%.
exit /b %ERRORLEVEL%
