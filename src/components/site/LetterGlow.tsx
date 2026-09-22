import { useCallback, useEffect, useRef, type ElementType, type ReactNode } from "react";

import { CONTENT_UPDATING_EVENT } from "./content-store";
import { useContentVersion } from "./content";

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "SVG",
  "CODE",
]);

type Split = {
  /** The element the text node lived in. */
  parent: Element;
  /** React's own text node, handed back before any content update. */
  node: Text;
  /** The per-character nodes that replaced it. */
  added: Node[];
};

/**
 * Wraps every character of the enclosed text in a span so that individual
 * letters can glow on hover (see the .glow-char utility in styles.css).
 * Splitting happens after mount to keep SSR output and hydration untouched.
 *
 * This replaces text nodes, which means React's reference to them goes stale and
 * a later text update would write to a detached node — the page would keep the
 * old words. So the split is reversible: just before an edited content file is
 * applied the text nodes are handed back to React, and they are split again
 * once the new words are in. Any dynamic text added inside a LetterGlow region
 * later needs the same treatment.
 */
export function LetterGlow({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const splits = useRef<Split[]>([]);
  const version = useContentVersion();

  const split = useCallback(() => {
    const root = ref.current;
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        // Already split: the walker would otherwise nest a span per character
        // again on every pass.
        if (parent.classList.contains("glow-char")) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-no-glow]")) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const targets: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      targets.push(current as Text);
      current = walker.nextNode();
    }

    const next: Split[] = [];
    for (const textNode of targets) {
      const parent = textNode.parentElement;
      if (!parent) continue;

      const text = textNode.nodeValue ?? "";
      const frag = document.createDocumentFragment();
      for (const char of text) {
        if (char === " " || char === "\n" || char === "\t") {
          frag.appendChild(document.createTextNode(char));
          continue;
        }
        const span = document.createElement("span");
        span.className = "glow-char";
        span.textContent = char;
        frag.appendChild(span);
      }

      const added = [...frag.childNodes];
      textNode.replaceWith(frag);
      next.push({ parent, node: textNode, added });
    }

    splits.current = next;
  }, []);

  /** Puts React's text nodes back, so React can update the words it owns. */
  const restore = useCallback(() => {
    for (const record of splits.current) {
      const { parent, node, added } = record;
      try {
        parent.insertBefore(node, added[0] ?? null);
        for (const element of added) element.parentNode?.removeChild(element);
      } catch (error) {
        // One unrecoverable record must not stop the rest of the page from
        // getting its new words.
        console.warn("letter-glow restore failed", error);
      }
    }
    splits.current = [];
  }, []);

  useEffect(() => {
    split();
  }, [split, version]);

  useEffect(() => {
    window.addEventListener(CONTENT_UPDATING_EVENT, restore);
    return () => window.removeEventListener(CONTENT_UPDATING_EVENT, restore);
  }, [restore]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
