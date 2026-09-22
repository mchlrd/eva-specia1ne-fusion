// The React layer over the content file: fetch it once per page load, merge an
// edited copy over the built-in values, and tell whoever edited it when
// something in it was rejected. The parsing and merging rules live in
// `content-store.ts`.
/* eslint-disable react-refresh/only-export-components -- the provider and the hooks
   that read it belong together; splitting them would scatter one context over
   three files for no gain. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  CONTENT_UPDATING_EVENT,
  defaults,
  mergeContent,
  parseContentFile,
  type ContentProblem,
  type SiteContent,
} from "./content-store";

const CONTENT_URL = "/content.json";

type ContentValue = { content: SiteContent; problems: ContentProblem[]; version: number };

const ContentContext = createContext<ContentValue>({ content: defaults, problems: [], version: 0 });

async function loadContentFile(): Promise<
  { ok: true; text: string } | { ok: false; message: string }
> {
  try {
    const response = await fetch(`${CONTENT_URL}?v=${Date.now()}`, {
      cache: "no-store",
      headers: { accept: "application/json, text/plain, */*" },
    });
    if (!response.ok) {
      return { ok: false, message: `could not be loaded (HTTP ${response.status})` };
    }
    // Decoded explicitly: this file is written in Notepad and carries em dashes
    // and curly quotes, so it must never be read as the system codepage.
    const text = new TextDecoder("utf-8").decode(await response.arrayBuffer());
    return { ok: true, text };
  } catch (error) {
    return {
      ok: false,
      message: `could not be loaded (${error instanceof Error ? error.message : "network error"})`,
    };
  }
}

/**
 * Starts from the built-in text — identical to what the server rendered, so
 * hydration matches — and applies the deployed file once it arrives. A visitor
 * on a slow connection sees the built-in copy and then the edited copy, never a
 * broken page.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaults);
  const [problems, setProblems] = useState<ContentProblem[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const file = await loadContentFile();
      if (cancelled) return;

      if (!file.ok) {
        setProblems([
          { path: CONTENT_URL, message: `${file.message} — showing the built-in text` },
        ]);
        return;
      }

      const parsed = parseContentFile(file.text);
      if (!parsed.ok) {
        setProblems([
          { path: CONTENT_URL, message: `${parsed.message} — showing the built-in text` },
        ]);
        return;
      }

      const merged = mergeContent(defaults, parsed.value);
      setProblems(merged.problems);

      // An unedited file is the common case: nothing to re-render, so leave the
      // page exactly as it was built.
      if (JSON.stringify(merged.content) === JSON.stringify(defaults)) return;

      window.dispatchEvent(new Event(CONTENT_UPDATING_EVENT));
      setContent(merged.content);
      setVersion((applied) => applied + 1);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ content, problems, version }), [content, problems, version]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** The site's copy: built-in values with anything edited on the server applied. */
export function useContent(): SiteContent {
  return useContext(ContentContext).content;
}

export function useContentProblems(): ContentProblem[] {
  return useContext(ContentContext).problems;
}

/**
 * Increases each time an edited content file is applied. Work that has to react
 * to the words on the page — the letter-glow split — watches this.
 */
export function useContentVersion(): number {
  return useContext(ContentContext).version;
}

const PAGE_KEYS = ["home", "services", "managed", "approach", "contact"] as const;

function pageKeyFor(pathname: string): (typeof PAGE_KEYS)[number] {
  const first = pathname.replace(/^\/+/, "").split("/")[0] ?? "";
  return PAGE_KEYS.find((key) => key === first) ?? "home";
}

/**
 * Keeps the tab title and meta description in step with an edited file, since
 * those two are the only head fields a visitor can see change. Search results and
 * social previews still come from the build, which is why a rebuild is
 * recommended after a title change.
 */
export function PageMetaSync({ pathname }: { pathname: string }) {
  const content = useContent();

  useEffect(() => {
    const page = content.pages[pageKeyFor(pathname)];
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", page.description);
  }, [content, pathname]);

  return null;
}

/**
 * Tells the person who edited the file that something in it was rejected, and
 * which line. Renders nothing at all when the file is absent or clean, so it is
 * invisible to visitors in the normal case. Dismissible for the session so it
 * never sits on top of the site after it has been read.
 */
export function ContentNotice() {
  const problems = useContentProblems();
  const [dismissed, setDismissed] = useState(false);

  if (problems.length === 0 || dismissed) return null;

  const shown = problems.slice(0, 5);
  const hidden = problems.length - shown.length;

  return (
    <aside
      role="status"
      className="fixed bottom-3 left-3 z-[70] max-w-[min(30rem,calc(100vw-1.5rem))] border border-ember bg-primary px-4 py-3 text-primary-foreground shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="label-mono text-ember">content.json</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss content file warning"
          className="label-mono leading-none text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          ✕
        </button>
      </div>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
        {shown.map((problem) => (
          <li key={`${problem.path}:${problem.message}`}>
            <span className="label-mono text-primary-foreground/70">{problem.path}</span>{" "}
            {problem.message}
          </li>
        ))}
      </ul>
      {hidden > 0 && <p className="mt-2 text-xs text-primary-foreground/70">and {hidden} more…</p>}
      <p className="mt-2 text-xs text-primary-foreground/70">
        The site is showing its built-in text for those values.
      </p>
    </aside>
  );
}
