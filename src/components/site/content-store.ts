// The words on the site, and the rules for reading an edited copy of them.
//
// `src/content/site-content.json` is the built-in text: it is compiled into the
// bundle and rendered into the prerendered HTML, so search engines and the first
// paint see the full page. At runtime the same file is fetched from the site root
// (/content.json) and merged over those built-in values, which is what makes the
// wording editable on IIS with no rebuild.
//
// Two different standards apply, on purpose:
//   * the repository file is strict, complete JSON — TypeScript infers its shape,
//     so a typo in a field name fails the build;
//   * the deployed file is read leniently — `//` comments and trailing commas are
//     allowed, and anything missing, blank or the wrong type keeps the built-in
//     value instead of breaking the page.
//
// This module is deliberately free of React: the React layer is `content.tsx`.
import siteContent from "@/content/site-content.json";

export type SiteContent = typeof siteContent;

/** Longest a single editable string may be, so one paste can't wreck a layout. */
const MAX_TEXT = 4000;

export const defaults: SiteContent = siteContent;

export type ContentProblem = { path: string; message: string };

/**
 * Fired just before an edited content file is applied. Anything that took text
 * nodes away from React (the letter-glow split) listens for this and hands them
 * back first, so the new words are written into nodes that are in the document.
 * See LetterGlow.
 */
export const CONTENT_UPDATING_EVENT = "evarotech:content-updating";

// ---------------------------------------------------------------------------
// Reading the file the way a person writes it
// ---------------------------------------------------------------------------

/**
 * Blanks out `//` and `/* *\/` comments. Every removed character becomes a space
 * so the result is exactly as long as the file: a parse error's position therefore
 * points at the same line and column in the file the editor was looking at.
 */
function stripComments(input: string): string {
  const out = input.split("");
  let inString = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inString) {
      if (char === "\\") i++;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "/" && input[i + 1] === "/") {
      while (i < input.length && input[i] !== "\n") out[i++] = " ";
      i--;
      continue;
    }

    if (char === "/" && input[i + 1] === "*") {
      out[i] = " ";
      out[i + 1] = " ";
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) {
        if (input[i] !== "\n") out[i] = " ";
        i++;
      }
      if (i < input.length) {
        out[i] = " ";
        out[i + 1] = " ";
        i++;
      }
    }
  }

  if (out[0] === "\uFEFF") out[0] = " ";
  return out.join("");
}

/** Blanks a comma that sits immediately before a closing brace or bracket. */
function stripTrailingCommas(input: string): string {
  const out = input.split("");
  let inString = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inString) {
      if (char === "\\") i++;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === ",") {
      let j = i + 1;
      while (j < input.length && /\s/.test(input[j] as string)) j++;
      if (input[j] === "}" || input[j] === "]") out[i] = " ";
    }
  }

  return out.join("");
}

function lineColumn(text: string, position: number): { line: number; column: number } {
  const before = text.slice(0, position);
  return {
    line: before.split("\n").length,
    column: position - (before.lastIndexOf("\n") + 1) + 1,
  };
}

/**
 * Turns a JSON parse error into something worth reading, with the line and
 * column of the file the editor was looking at. Positions are preserved by the
 * sanitiser, so they point at the right place even with comments in the file.
 */
function describeParseFailure(raw: string, text: string): string {
  const reason = raw
    .replace(/ in JSON at position \d+/, "")
    .replace(/ at position \d+/, "")
    .replace(/ \(line \d+ column \d+\)/, "")
    .trim();

  const located = /line (\d+) column (\d+)/.exec(raw);
  if (located) return `could not be read — line ${located[1]}, column ${located[2]}: ${reason}`;

  const position = /position (\d+)/.exec(raw);
  if (position) {
    const { line, column } = lineColumn(text, Number(position[1]));
    return `could not be read — line ${line}, column ${column}: ${reason}`;
  }

  return `could not be read: ${reason}`;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; message: string };

/** Parses the deployed file: JSON with comments and trailing commas tolerated. */
export function parseContentFile(text: string): ParseResult {
  const sanitized = stripTrailingCommas(stripComments(text));
  try {
    return { ok: true, value: JSON.parse(sanitized) as unknown };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message: describeParseFailure(message, sanitized) };
  }
}

// ---------------------------------------------------------------------------
// Merging an edit over the built-in text
// ---------------------------------------------------------------------------

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

type Context = {
  problems: ContentProblem[];
  unknown: string[];
  /**
   * Set while merging a list entry that has no built-in counterpart. Built-in
   * entries may leave fields out (that means "keep what the site already says"),
   * but a new entry has nothing to fall back on, so every field must be there.
   */
  requireComplete: boolean;
};

function isUrlLike(sample: string): boolean {
  return /^https?:\/\//i.test(sample);
}

function pickString(sample: string, value: unknown, path: string, ctx: Context): string {
  if (value === undefined) {
    if (ctx.requireComplete) ctx.problems.push({ path, message: "is missing" });
    return sample;
  }
  if (typeof value !== "string") {
    ctx.problems.push({ path, message: "needs to be text — keeping the built-in value" });
    return sample;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    ctx.problems.push({ path, message: "is empty — keeping the built-in value" });
    return sample;
  }
  if (trimmed.length > MAX_TEXT) {
    ctx.problems.push({
      path,
      message: `is longer than ${MAX_TEXT} characters — keeping the built-in value`,
    });
    return sample;
  }
  if (isUrlLike(sample) && !isUrlLike(trimmed)) {
    ctx.problems.push({
      path,
      message: "needs to start with https:// — keeping the built-in value",
    });
    return sample;
  }
  return trimmed;
}

/** The same shape with every string emptied, used to test a brand-new list entry. */
function blankShape(sample: unknown): unknown {
  if (typeof sample === "string") return "";
  if (Array.isArray(sample)) return [];
  if (isPlainObject(sample)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(sample)) out[key] = blankShape(sample[key]);
    return out;
  }
  return sample;
}

function pickArray(sample: unknown[], value: unknown, path: string, ctx: Context): unknown[] {
  if (!Array.isArray(value)) {
    ctx.problems.push({ path, message: "needs to be a list — keeping the built-in entries" });
    return sample;
  }
  if (value.length === 0) {
    ctx.problems.push({ path, message: "is empty — keeping the built-in entries" });
    return sample;
  }

  const model = sample[0];
  const entries: unknown[] = [];
  const seenIds = new Set<string>();
  let dropped = 0;

  value.forEach((entry, index) => {
    const id = isPlainObject(entry) && typeof entry["id"] === "string" ? entry["id"] : undefined;
    const entryPath = id ? `${path}[${id}]` : `${path}[${index}]`;

    if (id && seenIds.has(id)) {
      ctx.problems.push({ path: entryPath, message: "is a duplicate id" });
      dropped++;
      return;
    }
    if (id) seenIds.add(id);

    const built =
      id && isPlainObject(model)
        ? sample.find((s) => isPlainObject(s) && s["id"] === id)
        : undefined;

    // A known entry falls back to its own built-in text; a new one must be
    // complete, because inheriting a field from an unrelated built-in entry
    // would silently put the wrong words on the page.
    const isNewEntry = built === undefined && isPlainObject(model);
    const base = built ?? (isPlainObject(model) ? blankShape(model) : model);

    const before = ctx.problems.length;
    const outerRequirement = ctx.requireComplete;
    ctx.requireComplete = isNewEntry;
    const merged = pickValue(base, entry, entryPath, ctx);
    ctx.requireComplete = outerRequirement;

    if (isNewEntry && ctx.problems.length > before) {
      dropped++;
      return;
    }
    entries.push(merged);
  });

  if (entries.length === 0) {
    ctx.problems.push({ path, message: "has no usable entries — keeping the built-in entries" });
    return sample;
  }
  if (dropped > 0) {
    ctx.problems.push({
      path,
      message: `${dropped} ${dropped === 1 ? "entry was" : "entries were"} left out — see above`,
    });
  }
  return entries;
}

function pickObject(
  sample: Record<string, unknown>,
  value: unknown,
  path: string,
  ctx: Context,
): Record<string, unknown> {
  if (!isPlainObject(value)) {
    ctx.problems.push({ path, message: "needs to be an object — keeping the built-in values" });
    return sample;
  }
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(sample)) {
    out[key] = pickValue(sample[key], value[key], path ? `${path}.${key}` : key, ctx);
  }
  for (const key of Object.keys(value)) {
    if (!(key in sample)) ctx.unknown.push(path ? `${path}.${key}` : key);
  }
  return out;
}

function pickValue(sample: unknown, value: unknown, path: string, ctx: Context): unknown {
  if (typeof sample === "string") return pickString(sample, value, path, ctx);
  if (Array.isArray(sample)) return pickArray(sample, value, path, ctx);
  if (isPlainObject(sample)) return pickObject(sample, value, path, ctx);
  return sample;
}

/**
 * Merges an edited file over the built-in content. Every problem reported leaves
 * that one value at its built-in setting, so a half-broken file still renders a
 * complete site.
 */
export function mergeContent(
  base: SiteContent,
  patch: unknown,
): { content: SiteContent; problems: ContentProblem[] } {
  const ctx: Context = { problems: [], unknown: [], requireComplete: false };
  const content = pickValue(base, patch, "", ctx) as SiteContent;

  if (ctx.unknown.length > 0) {
    const shown = ctx.unknown.slice(0, 3).join(", ");
    const rest = ctx.unknown.length - 3;
    ctx.problems.push({
      path: "",
      message: `ignored ${ctx.unknown.length} field${ctx.unknown.length === 1 ? "" : "s"} the site doesn't use (${shown}${rest > 0 ? `, +${rest} more` : ""})`,
    });
  }

  return { content, problems: ctx.problems };
}

// ---------------------------------------------------------------------------
// Tokens and small helpers
// ---------------------------------------------------------------------------

/** Fills `{{tokens}}` in editable text; an unknown token is left visible. */
export function tokens(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{\s*([A-Za-z]+)\s*\}\}/g, (match, key: string) => values[key] ?? match);
}

export function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? "";
}

/** Turns a display phone number into the `tel:` link the site uses. */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length > 0
    ? `tel:+${digits}`
    : `tel:+${defaults.company.phone.replace(/[^0-9]/g, "")}`;
}
