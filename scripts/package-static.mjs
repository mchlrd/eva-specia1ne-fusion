// Packs ./static-export into a zip for whoever hosts the site. Run through
// `npm run package:static`, which builds the export first.
//
//   node scripts/package-static.mjs            full package
//     handoff/evarotech-site-<date>.zip
//       READ-ME-FIRST.txt   the install note (deploy/HANDOFF-README.txt)
//       site/               the website's contents, ready to copy into IIS
//
//   node scripts/package-static.mjs --pages    page update only
//     handoff/evarotech-pages-<date>.zip
//       UPDATE-NOTE.txt     the update note (deploy/PAGES-NOTE.txt)
//       site/               the same files MINUS contact.ashx and web.config
//
// The pages-only zip exists because those two files on the live server carry
// hand corrections nothing in the repository has; overwriting them is what broke
// the contact form. An update therefore ships every page, its assets and the
// editable text, and nothing else.
//
// The note deliberately sits BESIDE site/ rather than inside it: anything at the
// site root gets published to the web, and the note has no business being there.
import { spawnSync } from "node:child_process";
import { access, cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { handlerProblem } from "./check-handler.mjs";

const root = path.resolve(import.meta.dirname, "..");
const siteDir = path.join(root, "static-export");
const handoffDir = path.join(root, "handoff");
const pagesOnly = process.argv.includes("--pages");

const noteSource = path.join(root, "deploy", pagesOnly ? "PAGES-NOTE.txt" : "HANDOFF-README.txt");
const noteName = pagesOnly ? "UPDATE-NOTE.txt" : "READ-ME-FIRST.txt";
const stagingDir = path.join(handoffDir, pagesOnly ? "pages-staging" : "staging");

/** Files that must be in the export, or real visitors get a broken site. */
const required = pagesOnly
  ? [
      "index.html",
      "services/index.html",
      "managed/index.html",
      "approach/index.html",
      "contact/index.html",
      "content.json",
      "404.html",
    ]
  : [
      "index.html",
      "services/index.html",
      "managed/index.html",
      "approach/index.html",
      "contact/index.html",
      "content.json",
      "contact.ashx",
      "web.config",
      "404.html",
    ];

/** Never shipped in a page update: these are corrected by hand on the server. */
const excludedFromPagesZip = /(contact\.ashx|web\.config)$/i;

function fail(message) {
  console.error(`\nPackaging failed: ${message}`);
  process.exit(1);
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function zip(source, destination) {
  if (process.platform === "win32") {
    // Compress-Archive ships with PowerShell 5+, i.e. every supported Windows.
    const result = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path '${source}\\\\*' -DestinationPath '${destination}' -Force`,
      ],
      { stdio: "inherit" },
    );
    if (result.status === 0) return;
    fail("PowerShell Compress-Archive did not succeed.");
  }

  const result = spawnSync("zip", ["-r", "-q", destination, "."], {
    cwd: source,
    stdio: "inherit",
  });
  if (result.status !== 0)
    fail("Neither PowerShell nor the `zip` command could create the archive.");
}

const date = new Date().toISOString().slice(0, 10);
const zipPath = path.join(
  handoffDir,
  `${pagesOnly ? "evarotech-pages" : "evarotech-site"}-${date}.zip`,
);

if (!(await exists(siteDir))) fail("static-export/ is missing — run `npm run build:static` first.");
if (!(await exists(noteSource))) fail(`${path.relative(root, noteSource)} is missing.`);

const missing = [];
for (const file of required) {
  if (!(await exists(path.join(siteDir, file)))) missing.push(file);
}
if (missing.length > 0) fail(`the export is incomplete, missing: ${missing.join(", ")}`);

// Refuse to pack a handler that would fail on the server. A full package carries
// contact.ashx, and the last time one did, it did not compile there: every page
// loaded and the contact form answered 500 to everybody who used it. Cheap to
// check here, expensive to discover from a customer.
const handlerIssue = handlerProblem(path.join(root, "deploy", "iis-static", "contact.ashx"));
if (handlerIssue !== null) {
  fail(
    `the contact-form handler would fail on IIS:\n    ${handlerIssue}\n\n    Fix deploy/iis-static/contact.ashx (see the header comment in that file), then package again.`,
  );
}
console.log("contact.ashx checked: pure ASCII, and it compiles with the C# 5 compiler IIS uses.");

await rm(stagingDir, { recursive: true, force: true });
await mkdir(stagingDir, { recursive: true });
await cp(noteSource, path.join(stagingDir, noteName));
await cp(siteDir, path.join(stagingDir, "site"), {
  recursive: true,
  filter: pagesOnly ? (source) => !excludedFromPagesZip.test(source) : undefined,
});

await rm(zipPath, { force: true });
await zip(stagingDir, zipPath);
await rm(stagingDir, { recursive: true, force: true });

const { size } = await stat(zipPath);
const note = await readFile(noteSource, "utf8");
console.log(
  `\nPacked ./static-export (${required.length} essential files verified, note ${(note.length / 1024).toFixed(1)} kB)`,
);
console.log(`${path.relative(root, zipPath)} — ${(size / 1024 / 1024).toFixed(2)} MB`);
console.log(
  pagesOnly
    ? "Send that single file; it contains UPDATE-NOTE.txt and site/, without contact.ashx or web.config."
    : "Send that single file; it contains READ-ME-FIRST.txt and site/.",
);
