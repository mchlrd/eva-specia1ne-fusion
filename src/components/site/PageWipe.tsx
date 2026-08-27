import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";

import { nav } from "./data";

const order = ["/", ...nav.map((item) => item.to)];

function indexOfPath(pathname: string) {
  const exact = order.indexOf(pathname);
  if (exact !== -1) return exact;
  const nested = order.findIndex((p) => p !== "/" && pathname.startsWith(p));
  return nested === -1 ? 0 : nested;
}

/**
 * Orange-to-green colour panel that sweeps across the screen on navigation, from
 * the side the destination sits on in the nav bar relative to the current page.
 * Lives in the root layout so it survives page (route) remounts.
 */
export function PageWipe() {
  const router = useRouter();
  const [wipe, setWipe] = useState<{ id: number; dir: "left" | "right" } | null>(null);

  useEffect(() => {
    let id = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = router.subscribe("onBeforeNavigate", ({ fromLocation, toLocation }) => {
      const from = fromLocation?.pathname;
      const to = toLocation?.pathname;
      if (!from || !to || from === to) return;
      const delta = indexOfPath(to) - indexOfPath(from);
      if (delta === 0) return;
      id += 1;
      setWipe({ id, dir: delta > 0 ? "right" : "left" });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setWipe(null), 900);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  if (!wipe) return null;

  return <div key={wipe.id} data-page-wipe={wipe.dir} aria-hidden="true" />;
}
