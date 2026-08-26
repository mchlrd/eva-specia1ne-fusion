import { useEffect, useRef, useState, type ReactNode } from "react";
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
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const previous = useRef(pathname);
  const [state, setState] = useState({ key: pathname, dir: 0 });

  useEffect(() => {
    if (pathname === previous.current) return;
    const delta = indexOfPath(pathname) - indexOfPath(previous.current);
    previous.current = pathname;
    setState({ key: pathname, dir: Math.sign(delta) });
  }, [pathname]);

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
