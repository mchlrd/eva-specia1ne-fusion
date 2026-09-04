import { useState } from "react";

import { services } from "./data";

export function ServiceAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ol className="border-t border-border">
      {services.map((s, i) => {
        const isOpen = open === i;
        const num = String(i + 1).padStart(2, "0");
        return (
          <li key={s.title} className="group border-b border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`service-panel-${i}`}
              className="relative flex w-full items-center justify-center px-10 py-8 text-center transition-colors duration-300 hover:bg-signal/[0.06]"
            >
              <span className="label-mono absolute left-0 top-1/2 -translate-y-1/2">
                {num}
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
              id={`service-panel-${i}`}
              role="region"
              aria-label={s.title}
              className={`grid transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-x-12 gap-y-8 pb-14 pt-1 md:grid-cols-11 md:items-center md:pb-16">
                  {/* Description on the left column at desktop, below the photo on mobile. */}
                  <div
                    className={`md:col-span-5 ${
                      isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)", transitionDelay: isOpen ? "0.05s" : "0s" }}
                  >
                    <p className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground md:text-base">
                      {s.body}
                    </p>
                    <ul className="mt-7 space-y-3 border-t border-border pt-6">
                      {s.points.map((point) => (
                        <li key={point} className="grid grid-cols-[auto_1fr] gap-x-3 text-sm leading-snug text-muted-foreground">
                          <span aria-hidden="true" className="label-mono pt-px text-signal">
                            +
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Photo first on mobile; right column on desktop. */}
                  <figure
                    className={`order-first md:order-none md:col-span-6 ${
                      isOpen ? "opacity-100 blur-0" : "opacity-0 blur-[6px]"
                    }`}
                    style={{ transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1)", transitionDelay: isOpen ? "0.12s" : "0s" }}
                  >
                    <div className="hover-zoom overflow-hidden rounded-md border border-border">
                      <img
                        src={s.image}
                        alt={s.alt}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[3/2] w-full object-cover"
                      />
                    </div>
                    <figcaption className="label-mono mt-3 flex items-baseline gap-2.5">
                      <span className="text-ember">Fig. {num}</span>
                      <span aria-hidden="true">/</span>
                      <span>{s.caption}</span>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
