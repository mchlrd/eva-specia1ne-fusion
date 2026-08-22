import { useEffect, useState } from "react";
import { company, nav } from "./data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between border-b border-border">
        <a href="#top" className="font-display text-lg font-bold tracking-tight">
          {company.short}
          <span className="text-signal">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="label-mono link-underline">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a href={company.phoneHref} className="label-mono hidden link-underline sm:inline">
            {company.phone}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="label-mono flex items-center gap-2 text-foreground md:hidden"
          >
            {open ? "Close" : "Menu"}
            <span className="grid grid-cols-2 gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="size-1.5 bg-signal" />
              ))}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="shell flex h-[calc(100dvh-4rem)] flex-col justify-between bg-background pb-10 pt-10 md:hidden">
          <nav className="flex flex-col">
            {nav.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between border-b border-border py-5"
              >
                <span className="display-md">{item.label}</span>
                <span className="label-mono text-signal">0{i + 1}</span>
              </a>
            ))}
          </nav>
          <div className="label-mono space-y-1">
            <p>{company.phone}</p>
            <p>{company.email}</p>
          </div>
        </div>
      )}
    </header>
  );
}
