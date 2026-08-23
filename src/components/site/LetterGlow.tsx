import { useEffect, useRef, type ReactNode } from "react";

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

/**
 * Wraps every character of the enclosed text in a span so that individual
 * letters can glow on hover (see the .glow-char utility in styles.css).
 * Splitting happens after mount to keep SSR output and hydration untouched.
 */
export function LetterGlow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.dataset["glowSplit"] === "true") return NodeFilter.FILTER_REJECT;
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

    for (const textNode of targets) {
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
      const holder = textNode.parentElement;
      textNode.replaceWith(frag);
      if (holder) holder.dataset["glowSplit"] = "true";
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
