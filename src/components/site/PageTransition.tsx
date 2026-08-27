import { useMemo, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import { nav } from "./data";

const order = ["/", ...nav.map((item) => item.to)];

function indexOfPath(pathname: string) {
  const exact = order.indexOf(pathname);
  if (exact !== -1) return exact;
  const nested = order.findIndex((p) => p !== "/" && pathname.startsWith(p));
  return nested === -1 ? 0 : nested;
}

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

/**
 * Sweeps an orange-to-green colour panel across the screen from the side the new
 * nav item sits on, relative to the page you were just on, then fades the new
 * page in behind it.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const dir = useMemo(() => {
    const last = readLastPath();
    writeLastPath(pathname);
    if (!last || last === pathname) return 0;
    return Math.sign(indexOfPath(pathname) - indexOfPath(last));
  }, [pathname]);

  const dirName = dir > 0 ? "right" : dir < 0 ? "left" : "none";

  return (
    <>
      <div key={pathname} data-page-enter={dirName}>
        {children}
      </div>
    </>
  );
}
