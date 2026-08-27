import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import { LetterGlow } from "./LetterGlow";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { PageTransition } from "./PageTransition";

export function SiteLayout({ children }: { children: ReactNode }) {
  // Keying the page wrapper by pathname gives each navigation a fresh mount,
  // so the destination starts hidden and blurs into focus as the curtain lifts.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div id="top" className="min-h-screen">
      <SiteHeader />
      <LetterGlow as="main" className="overflow-x-clip">
        <PageTransition key={pathname}>{children}</PageTransition>
      </LetterGlow>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  index,
  section,
  title,
  intro,
}: {
  index: string;
  section: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="shell pb-14 pt-32 md:pb-20 md:pt-40">
      <div className="rise">
        <p className="label-mono flex items-center gap-3">
          <span className="text-signal">{index}</span>
          <span aria-hidden="true">/</span>
          <span>{section}</span>
        </p>
        <h1 className="display-xl mt-8 max-w-[20ch]">{title}</h1>
        {intro && (
          <p className="mt-9 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
