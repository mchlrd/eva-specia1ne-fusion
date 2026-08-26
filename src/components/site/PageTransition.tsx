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
 * Slides each page in from the side the new nav item sits on, relative to the
 * page you were just on — Services (left of Managed) enters from the left,
 * Approach (right of Managed) enters from the right.
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

  return (
    <div
      key={state.key}
      data-page-enter={state.dir > 0 ? "right" : state.dir < 0 ? "left" : "none"}
    >
      {children}
    </div>
  );
}
