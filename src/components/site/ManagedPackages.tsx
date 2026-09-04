import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { managed } from "./data";
import { LetterGlow } from "./LetterGlow";
import { Overlay } from "./Overlay";

const pad = (n: number) => String(n).padStart(2, "0");

export function ManagedPackages({ autoOpen }: { autoOpen?: number | undefined }) {
  const [selected, setSelected] = useState<number | null>(() =>
    autoOpen !== undefined && managed[autoOpen] ? autoOpen : null,
  );
  const pkg = selected === null ? null : managed[selected];

  return (
    <>
      <ol className="border-t border-border">
        {managed.map((m, i) => (
          <li key={m.title} className="group border-b border-border">
            <button
              type="button"
              onClick={() => setSelected(i)}
              aria-haspopup="dialog"
              className="relative flex w-full items-center justify-center px-10 py-8 text-center transition-colors duration-300 hover:bg-signal/[0.06]"
            >
              <span className="label-mono absolute left-0 top-1/2 -translate-y-1/2 text-ember">
                Pkg {pad(i + 1)}
              </span>
              <span className="display-md transition-colors duration-300 group-hover:text-signal">
                {m.title}
              </span>
              <span
                aria-hidden="true"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-signal opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              >
                ↗
              </span>
            </button>
          </li>
        ))}
      </ol>

      {pkg && selected !== null && (
        <Overlay
          open
          onRequestClose={() => setSelected(null)}
          labelledBy={`pkg-title-${selected}`}
          closeLabel="Close package details"
          bar={
            <p className="label-mono flex items-center gap-3">
              <span className="text-ember">Managed Services</span>
              <span aria-hidden="true">/</span>
              <span>Package {pad(selected + 1)}</span>
            </p>
          }
        >
          <LetterGlow>
            <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-start">
              <div className="rise lg:col-span-7" style={{ animationDelay: "0.05s" }}>
                <h2 id={`pkg-title-${selected}`} className="display-xl max-w-[18ch]">
                  {pkg.title}
                </h2>
              </div>

              <div className="lg:col-span-5">
                <div className="rise" style={{ animationDelay: "0.15s" }}>
                  <p className="max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                    {pkg.body}
                  </p>
                </div>
              </div>
            </div>

            <div className="rise mt-12 md:mt-16" style={{ animationDelay: "0.25s" }}>
              <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
                <div>
                  <p className="label-mono flex items-center gap-3 border-t border-border pt-5">
                    <span className="text-signal">Included</span>
                    <span aria-hidden="true">/</span>
                    <span>{pkg.points.length} areas</span>
                  </p>
                  <ul className="mt-5 space-y-3">
                    {pkg.points.map((point) => (
                      <li
                        key={point}
                        className="grid grid-cols-[auto_1fr] gap-x-3 text-sm leading-snug text-muted-foreground md:text-base"
                      >
                        <span aria-hidden="true" className="label-mono pt-px text-signal">
                          +
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="label-mono flex items-center gap-3 border-t border-border pt-5">
                    <span className="text-signal">Powered by</span>
                    <span aria-hidden="true">/</span>
                    <span>{pkg.software.map((s) => s.name).join(" · ")}</span>
                  </p>
                  <div className="mt-5 flex min-h-44 items-center justify-center gap-8 rounded-md border border-border bg-secondary px-6 py-10">
                    {pkg.software.map((s) => (
                      <img
                        key={s.name}
                        src={s.logo}
                        alt={`${s.name} logo`}
                        loading="lazy"
                        decoding="async"
                        className="max-h-20 w-auto max-w-[45%] object-contain md:max-h-24"
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
                    {pkg.software.map((s) => (
                      <a
                        key={s.name}
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline label-mono"
                      >
                        See {s.name} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rise mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-border pt-8 md:mt-16"
              style={{ animationDelay: "0.32s" }}
            >
              <p className="label-mono max-w-md">
                Every package is set up, monitored and supported by EvaroTech — no product
                juggling on your side.
              </p>
              <Link
                to="/contact"
                className="bracket hover-glow font-display text-2xl font-bold tracking-tight md:text-3xl"
              >
                Ask about this package
              </Link>
            </div>
          </LetterGlow>
        </Overlay>
      )}
    </>
  );
}
