// Renders every route of the built site once and writes the result as plain
// HTML files, so it can be published to any web server (including IIS serving a
// folder) with no Node runtime on the host.
//
// Run through `npm run build:static`, which builds first. Re-runnable on its own
// (`node scripts/export-static.mjs`) if you only want to refresh the export.
//
//   static-export/
//     index.html  services/index.html  managed/index.html
//     approach/index.html  contact/index.html      <- one file per route
//     assets/  favicon.png  robots.txt 404.html    <- copied from the build
//     contact.ashx  web.config                     <- the form's handler
//     content.json                                 <- the editable text, + notes
import { spawn } from "node:child_process";
import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const serverEntry = path.join(root, ".output", "server", "index.mjs");
const publicDir = path.join(root, ".output", "public");
const outDir = path.join(root, "static-export");
const handlerDir = path.join(root, "deploy", "iis-static");
const contentSource = path.join(root, "src", "content", "site-content.json");
const contentNotes = path.join(root, "deploy", "content-notes.txt");

/** Every page that must exist on the static host. A missing one is a 404 live. */
const ROUTES = [
  { url: "/", file: "index.html" },
  { url: "/services", file: "services/index.html" },
  { url: "/managed", file: "managed/index.html" },
  { url: "/approach", file: "approach/index.html" },
  { url: "/contact", file: "contact/index.html" },
];

async function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const port = probe.address().port;
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(origin, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${origin}/`, { redirect: "manual" });
      if (res.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `The built server did not answer on ${origin} within ${timeoutMs}ms. ` +
      "Run `npm run build:static` first — this script needs the Node server that it builds.",
  );
}

async function main() {
  try {
    await access(serverEntry);
  } catch {
    throw new Error(
      `Missing ${path.relative(root, serverEntry)} — run \`npm run build:static\` instead, which builds first.`,
    );
  }

  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [serverEntry], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production", HOST: "127.0.0.1", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const serverOutput = [];
  server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

  try {
    await waitForServer(origin);

    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    // 1. Every route, captured as HTML.
    for (const route of ROUTES) {
      const res = await fetch(`${origin}${route.url}`);
      const html = await res.text();
      if (!res.ok) {
        throw new Error(`${route.url} returned ${res.status} — refusing to export a broken page.`);
      }
      if (!html.toLowerCase().includes("<!doctype html")) {
        throw new Error(`${route.url} did not return an HTML document.`);
      }
      const target = path.join(outDir, route.file);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, html);
      console.log(
        `  ${route.url.padEnd(10)} -> ${route.file} (${(html.length / 1024).toFixed(0)} kB)`,
      );
    }

    // 2. Assets, favicon, robots.txt, 404.html — everything the build put in public/.
    await cp(publicDir, outDir, { recursive: true });

    // 3. The contact form's server-side handler, so one folder is the whole deploy.
    await cp(handlerDir, outDir, { recursive: true });

    // 3b. The editable text: the same values the build just rendered, plus a
    // header written for whoever opens the file on the server. This is the file
    // that makes wording changeable without a rebuild — see the content runtime.
    const json = await readFile(contentSource, "utf8");
    try {
      JSON.parse(json);
    } catch (error) {
      throw new Error(
        `src/content/site-content.json is not valid JSON: ${error instanceof Error ? error.message : error}`,
      );
    }
    const notes = await readFile(contentNotes, "utf8");
    await writeFile(path.join(outDir, "content.json"), `${notes.trimEnd()}\n${json}`);

    // 4. Fail loudly if a route is missing, rather than shipping a silent 404.
    const required = [...ROUTES.map((route) => route.file), "content.json"];
    const missing = [];
    for (const file of required) {
      try {
        await access(path.join(outDir, file));
      } catch {
        missing.push(file);
      }
    }
    if (missing.length > 0) throw new Error(`Export is incomplete, missing: ${missing.join(", ")}`);

    console.log(
      `\nExported ${ROUTES.length} pages to ./static-export — publish that folder's contents.`,
    );
  } finally {
    server.kill();
    if (serverOutput.length > 0 && process.env["DEBUG_STATIC_EXPORT"]) {
      console.log(serverOutput.join(""));
    }
  }
}

main().catch((error) => {
  console.error(`\nStatic export failed: ${error.message}`);
  process.exit(1);
});
