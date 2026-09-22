// Which theme the site wears, and how that choice is remembered.
//
// The decision is made once, before the first frame, by the inline script in the
// document head (THEME_BOOTSTRAP below): it reads the saved choice, falls back to
// the operating system, and stamps `data-theme` on <html>. Everything here reads
// that attribute back rather than deciding again, so the control in the header
// and the colours on the page can never disagree — and a page load never shows
// the wrong theme for a frame.
//
// This module is deliberately free of React: the control is `ThemeToggle.tsx`.

export type Theme = "light" | "dark";

/** What the visitor asked for. `system` means "whatever this device says". */
export type ThemeChoice = Theme | "system";

/** localStorage key, shared with the head script. */
export const THEME_STORAGE_KEY = "evarotech-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * The colour the mobile browser paints its own chrome with, matched to `--paper`
 * in each theme. Kept in step with the stylesheet's paper values.
 */
export const THEME_BAR_COLOR: Record<Theme, string> = {
  light: "#f9fafb", // oklch(0.985 0.002 230)
  dark: "#0a1013", // oklch(0.168 0.012 235)
};

/**
 * Runs in <head> before anything paints. A string, not a module, because it has
 * to be inlined into the document — and it lives here so the storage key and the
 * attribute it writes sit next to the reader that depends on them.
 *
 * Wrapped in try/catch on purpose: storage throws in some privacy configurations,
 * and a theme preference is never worth breaking the page for.
 */
export const THEME_BOOTSTRAP = `!function(){try{var k="${THEME_STORAGE_KEY}",s=localStorage.getItem(k),t=s==="light"||s==="dark"?s:window.matchMedia&&window.matchMedia("${DARK_QUERY}").matches?"dark":"light",r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;var m=document.querySelector("meta[name=theme-color]");m&&m.setAttribute("content",t==="dark"?"${THEME_BAR_COLOR.dark}":"${THEME_BAR_COLOR.light}")}catch(e){}}();`;

type Snapshot = { choice: ThemeChoice; theme: Theme };

/** What the prerender shows: light, and following the device. */
const SERVER_SNAPSHOT: Snapshot = { choice: "system", theme: "light" };

const listeners = new Set<() => void>();
let wired = false;

function storedChoice(): ThemeChoice {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    // Storage unavailable: the choice simply doesn't outlive this page.
    return "system";
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
}

/** The theme actually on screen, which the head script has already put on <html>. */
function appliedTheme(): Theme {
  return document.documentElement.dataset["theme"] === "dark" ? "dark" : "light";
}

function readSnapshot(): Snapshot {
  if (typeof document === "undefined") return SERVER_SNAPSHOT;
  return { choice: storedChoice(), theme: appliedTheme() };
}

let snapshot: Snapshot = readSnapshot();

function paint(theme: Theme) {
  const root = document.documentElement;
  root.dataset["theme"] = theme;
  root.style.colorScheme = theme;
  document.querySelector("meta[name=theme-color]")?.setAttribute("content", THEME_BAR_COLOR[theme]);
}

function publish() {
  snapshot = readSnapshot();
  for (const listener of listeners) listener();
}

/**
 * Applies a choice: paints it, remembers it, and tells every control on the page.
 * `system` is stored as the absence of a choice, so a visitor who never touches
 * the control keeps following their device even after the OS flips.
 */
export function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Storage unavailable — the theme still applies to this page view.
  }
  paint(choice === "system" ? systemTheme() : choice);
  publish();
}

function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;

  // The device changed while the page was open. Only worth following while
  // nobody has expressed a preference — an explicit choice outranks the OS.
  window.matchMedia?.(DARK_QUERY).addEventListener("change", () => {
    if (snapshot.choice !== "system") return;
    paint(systemTheme());
    publish();
  });

  // Another tab changed it: follow, so two open tabs don't disagree.
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    const choice = storedChoice();
    paint(choice === "system" ? systemTheme() : choice);
    publish();
  });
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  wire();
  return () => {
    listeners.delete(listener);
  };
}

/** Stable between changes, which is what `useSyncExternalStore` requires. */
export const themeSnapshot = (): Snapshot => snapshot;

export const themeServerSnapshot = (): Snapshot => SERVER_SNAPSHOT;

/** Order the switch offers them in: follow the device first, then the two by hand. */
export const themeChoices: readonly ThemeChoice[] = ["system", "light", "dark"];
