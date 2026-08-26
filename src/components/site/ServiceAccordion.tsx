import { useState } from "react";

import { services } from "./data";

export function ServiceAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ol className="border-t border-border">
      {services.map((s, i) => {
        const isOpen = open === i;
        return (
          <li key={s.title} className="group border-b border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="relative flex w-full items-center justify-center px-10 py-8 text-center transition-colors duration-300 hover:bg-signal/[0.06]"
            >
              <span className="label-mono absolute left-0 top-1/2 -translate-y-1/2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`display-md transition-colors duration-300 group-hover:text-signal ${
                  isOpen ? "text-signal" : ""
                }`}
              >
                {s.title}
              </span>
              <span
                aria-hidden="true"
                className={`absolute right-0 top-1/2 -translate-y-1/2 text-signal transition-all duration-300 ${
                  isOpen
                    ? "translate-y-[-50%] rotate-180 opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="m6 9 6 6 6-6" strokeLinecap="square" />
                </svg>
              </span>
            </button>

            <div
              className={`grid transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="mx-auto max-w-2xl pb-10 text-center text-sm leading-relaxed text-muted-foreground md:text-base">
                  {s.body}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
