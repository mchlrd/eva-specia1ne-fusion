import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import { nav } from "./data";

const order = ["/", ...nav.map((item) => item.to)];

function indexOfPath(pathname: string) {
  const exact = order.indexOf(pathname);
  if (exact !== -1) return exact;
  const nested = order.findIndex((p) => p !== "/" && pathname.startsWith(p));
  return nested === -1 ? 0 : nested;
}

/**
 * Sweeps an orange-to-green colour panel across the screen in the direction the
 * new nav item sits, relative to the page you were just on, then fades the new
 * page in behind it.
 */
// Each route renders its own layout, so the previous path is kept on the window
// to survive component remounts and module re-evaluation.
const KEY = "__evarotechLastPath";

function readLastPath(): string | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as Record<string, string | undefined>)[KEY] ?? null;
}

function writeLastPath(pathname: string) {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, string>)[KEY] = pathname;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState(() => {
    const lastPath = readLastPath();
    return {
      key: pathname,
      dir:
        lastPath === null || lastPath === pathname
          ? 0
          : Math.sign(indexOfPath(pathname) - indexOfPath(lastPath)),
    };
  });

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("PT effect", pathname, state.key, readLastPath());
    writeLastPath(pathname);
    if (pathname === state.key) return;
    setState({
      key: pathname,
      dir: Math.sign(indexOfPath(pathname) - indexOfPath(state.key)),
    });
  }, [pathname, state.key]);

  const dirName = state.dir > 0 ? "right" : state.dir < 0 ? "left" : "none";

  return (
    <>
      {state.dir !== 0 && (
        <div key={`wipe-${state.key}`} data-page-wipe={dirName} aria-hidden="true" />
      )}
      <div key={state.key} data-page-enter={dirName}>
        {children}
      </div>
    </>
  );
}
