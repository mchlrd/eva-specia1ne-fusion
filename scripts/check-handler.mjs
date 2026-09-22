// Two guards for deploy/iis-static/contact.ashx, both of them failures that have
// already happened once on the live server and cost an afternoon:
//
//   1. it must be pure ASCII, with no byte-order mark. IIS compiles the file with
//      the C# 5 compiler, which reads a BOM-less file in the machine's own
//      codepage, so a dash typed into the subject line arrives at the mailbox as
//      three mojibake characters. Nothing else can see that until a customer does.
//
//   2. it must compile, with no server-side comment block before the code. A
//      .ashx file is compiled as raw C#, so an ASP.NET-style comment block (the
//      one that is a comment in a .aspx page) reaches the compiler and every
//      request answers 500 "CS1010: Newline in constant" - which is exactly what
//      the live site did.
//
// The compile check needs the .NET Framework compiler, so it only runs on
// Windows. Everywhere else the ASCII check still runs, and the compile check
// reports that it was skipped rather than pretending to have passed.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

/** The compiler IIS uses, in the two places Windows keeps it. */
function findCompiler() {
  if (process.platform !== "win32") return null;
  const windir = process.env["WINDIR"] ?? "C:\\Windows";
  const candidates = [
    path.join(windir, "Microsoft.NET", "Framework64", "v4.0.30319", "csc.exe"),
    path.join(windir, "Microsoft.NET", "Framework", "v4.0.30319", "csc.exe"),
  ];
  for (const candidate of candidates) {
    try {
      readFileSync(candidate);
      return candidate;
    } catch {
      // try the next one
    }
  }
  return null;
}

/**
 * @returns {{ ok: true } | { ok: false, problems: string[] } | { ok: "skipped", reason: string }}
 */
export function checkHandler(file) {
  const problems = [];

  let source;
  try {
    source = readFileSync(file);
  } catch (error) {
    return { ok: false, problems: [`could not be read: ${error.message}`] };
  }

  // 1. ASCII, no BOM.
  if (source.length >= 3 && source[0] === 0xef && source[1] === 0xbb && source[2] === 0xbf) {
    problems.push(
      "starts with a byte-order mark. Save it without one: the compiler reads the file in the machine's own codepage, and a BOM changes what it reads.",
    );
  }
  const text = source.toString("utf8");
  const offending = [...text]
    .map((char, index) => ({ char, index }))
    .filter((entry) => entry.char.charCodeAt(0) > 126)
    .slice(0, 5);
  if (offending.length > 0) {
    const where = offending
      .map((entry) => {
        const line = text.slice(0, entry.index).split("\n").length;
        return `line ${line}: ${JSON.stringify(entry.char)}`;
      })
      .join(", ");
    problems.push(
      `has ${offending.length === 5 ? "at least 5" : offending.length} non-ASCII character${offending.length === 1 ? "" : "s"} (${where}). Write " - " instead of a dash, and quote marks rather than curly ones.`,
    );
  }

  // 2. It compiles. The WebHandler directive is stripped first, because IIS
  //    removes it before compiling; the rest is compiled exactly as IIS does.
  const compiler = findCompiler();
  if (compiler === null) {
    return problems.length > 0
      ? { ok: false, problems }
      : { ok: "skipped", reason: "no .NET Framework compiler on this machine (not Windows)" };
  }

  const lines = text.split("\n");
  if (!lines[0]?.includes("WebHandler")) {
    problems.push("does not start with a WebHandler directive on line 1, which IIS requires.");
  }
  const body = lines[0]?.startsWith("<%@") ? lines.slice(1).join("\n") : text;

  const workDir = mkdtempSync(path.join(tmpdir(), "evarotech-handler-"));
  try {
    const sourcePath = path.join(workDir, "contact.cs");
    writeFileSync(sourcePath, body, "utf8");

    const frameworkDir = path.dirname(compiler);
    const references = [
      "System.Web.dll",
      "System.Configuration.dll",
      "System.Core.dll",
      "System.dll",
    ]
      .map((name) => path.join(frameworkDir, name))
      .flatMap((reference) => ["-r:" + reference]);

    // -codepage:1252 mirrors the server, where a BOM-less file is read as
    // Windows-1252; it makes any remaining non-ASCII text visible here too.
    const result = spawnSync(
      compiler,
      [
        "-nologo",
        "-t:library",
        "-codepage:1252",
        "-out:" + path.join(workDir, "contact.dll"),
        ...references,
        sourcePath,
      ],
      { encoding: "utf8" },
    );

    if (result.status !== 0) {
      // Diagnostics name the temporary copy, so match on the file plus a line
      // and column; everything else is the compiler's banner.
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /contact\.cs\(\d+,\d+\)/.test(line))
        // Drop the temporary path csc prints, keeping the line and column.
        .map((line) => line.replace(/^.*[\\/]contact\.cs\(/, `${path.basename(file)}(`))
        .slice(0, 6);
      problems.push(
        `does not compile with the C# 5 compiler IIS uses:\n      ${(output.length > 0 ? output : ["(no compiler output)"]).join("\n      ")}`,
      );
    }
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }

  return problems.length > 0 ? { ok: false, problems } : { ok: true };
}

/** Convenience wrapper for the packaging scripts: returns an error string, or null. */
export function handlerProblem(file) {
  const result = checkHandler(file);
  if (result.ok === true) return null;
  if (result.ok === "skipped") {
    console.warn(`  (compile check skipped: ${result.reason})`);
    return null;
  }
  return `${path.relative(process.cwd(), file)} ${result.problems.join("\n    ")}`;
}

// Run directly: `node scripts/check-handler.mjs [file]`
if (import.meta.filename === process.argv[1]) {
  const file = process.argv[2] ?? path.join("deploy", "iis-static", "contact.ashx");
  const problem = handlerProblem(file);
  if (problem === null) {
    console.log(`${file} is ASCII and compiles.`);
    process.exit(0);
  }
  console.error(`${file} would fail on IIS:\n    ${problem}`);
  process.exit(1);
}
