import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

import { nav } from "./data";

const CURTAIN_FLAG = "__evarotechCurtain";
const REVEAL_EVENT = "evarotech:page-revealed";
type Transition = { id: number; label: string; phase: "cover" | "reveal" };

function curtainActive(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as unknown as Record<string, unknown>)[CURTAIN_FLAG]);
}

/**
 * Wraps the route content. The overlay sets a window flag just before it
 * navigates under the curtain, so the freshly mounted destination starts out
 * hidden and blurred, then blurs/rises into focus once the curtain lifts.
 *
 * This component is keyed by pathname in SiteLayout, so each navigation gets
 * a fresh mount (and a fresh hidden state). Back/forward and reduced-motion
 * navigations never set the flag, so the page simply appears for those.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const curtained = curtainActive();
  const [revealed, setRevealed] = useState(!curtained);

  useEffect(() => {
    if (!curtained) return;

    const onReveal = (event: Event) => {
      const target = (event as CustomEvent<{ pathname?: string }>).detail?.pathname;
      if (target === undefined || target === pathname) setRevealed(true);
    };
    window.addEventListener(REVEAL_EVENT, onReveal);

    // Safety net: if the reveal signal is ever missed, never leave the page
    // hidden. Fires well before the curtain has finished lifting away.
    const fallback = window.setTimeout(() => setRevealed(true), 450);

    return () => {
      window.removeEventListener(REVEAL_EVENT, onReveal);
      window.clearTimeout(fallback);
    };
  }, [curtained, pathname]);

  return (
    <div data-page-enter={curtained ? "true" : "initial"} data-page-revealed={revealed ? "true" : "false"}>
      {children}
    </div>
  );
}

/**
 * Owns the navigation sequence. Internal link clicks are intercepted before
 * TanStack Router sees them, so the old page stays mounted and visible while
 * the curtain rises over it. Only after the curtain fully covers the viewport
 * is the route actually changed, and the new page is revealed as the curtain
 * lifts away.
 */
export function RouteTransitionOverlay() {
  const router = useRouter();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const curtainRef = useRef<HTMLDivElement>(null);
  const [transition, setTransition] = useState<Transition | null>(null);
  const idRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextPaint = () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const setCurtainFlag = (value: boolean) => {
      (window as unknown as Record<string, boolean>)[CURTAIN_FLAG] = value;
    };

    const runTransition = async (to: string) => {
      if (runningRef.current) return;
      runningRef.current = true;
      const id = ++idRef.current;
      setCurtainFlag(false);
      try {
        if (reduceMotion) {
          await router.navigate({ to });
          return;
        }

        const label =
          nav.find((item) => item.to === to)?.label ??
          (to === "/" ? "Home" : to.slice(1).replace(/-/g, " "));
        // Render the curtain (positioned off-screen below), then animate it up
        // over the OLD page, which is still mounted and visible.
        setTransition({ id, label, phase: "cover" });
        await nextPaint();

        const curtain = curtainRef.current;
        if (!curtain) {
          await router.navigate({ to });
          return;
        }

        const cover = curtain.animate(
          [{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }],
          { duration: 600, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" },
        );
        await cover.finished;
        if (id !== idRef.current) return;

        // Curtain fully covers the viewport now: swap the page underneath it.
        // The flag makes the freshly mounted destination start out hidden.
        setCurtainFlag(true);
        await router.navigate({ to });
        await nextPaint();
        if (id !== idRef.current) return;

        // Lift the curtain and tell the destination page to blur into focus.
        setTransition({ id, label, phase: "reveal" });
        window.dispatchEvent(new CustomEvent(REVEAL_EVENT, { detail: { pathname: to } }));
        const reveal = curtain.animate(
          [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
          { duration: 500, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" },
        );
        await reveal.finished;
        if (id !== idRef.current) return;
        setTransition(null);
      } finally {
        setCurtainFlag(false);
        runningRef.current = false;
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      const to = (href.split("#")[0] || "/").replace(/\/$/, "") || "/";
      if (to === currentPath) return;
      event.preventDefault();
      event.stopPropagation();
      void runTransition(to);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, currentPath]);

  if (!transition) return null;
  return (
    <div ref={curtainRef} className="route-curtain" data-phase={transition.phase} aria-hidden="true">
      <div className="route-curtain__inner">
        <span className="label-mono text-ember">EvaroTech / 01</span>
        <span className="route-curtain__label">{transition.label}</span>
      </div>
    </div>
  );
}
