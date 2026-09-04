import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { principles } from "./data";
import { LetterGlow } from "./LetterGlow";
import { Overlay } from "./Overlay";

const pad = (n: number) => String(n).padStart(2, "0");

export function ApproachSteps() {
  const [selected, setSelected] = useState<number | null>(null);
  const step = selected === null ? null : principles[selected];

  return (
    <>
      <ol className="border-t border-border">
        {principles.map((p, i) => (
          <li key={p.title} className="group border-b border-border">
            <button
              type="button"
              onClick={() => setSelected(i)}
              aria-haspopup="dialog"
              className="relative flex w-full items-center justify-center px-10 py-8 text-center transition-colors duration-300 hover:bg-signal/[0.06]"
            >
              <span className="label-mono absolute left-0 top-1/2 -translate-y-1/2 text-ember">
                {pad(i + 1)}
              </span>
              <span className="display-md transition-colors duration-300 group-hover:text-signal">
                {p.title}
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

      {step && selected !== null && (
        <Overlay
          open
          onRequestClose={() => setSelected(null)}
          labelledBy={`step-title-${selected}`}
          closeLabel="Close step details"
          bar={
            <p className="label-mono flex items-center gap-3">
              <span className="text-ember">Client Approach</span>
              <span aria-hidden="true">/</span>
              <span>Step {pad(selected + 1)}</span>
            </p>
          }
        >
          <LetterGlow>
            <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-start">
              <div className="rise lg:col-span-7" style={{ animationDelay: "0.05s" }}>
                <h2 id={`step-title-${selected}`} className="display-xl max-w-[18ch]">
                  {step.title}
                </h2>
                <p className="mt-8 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                  {step.body}
                </p>
              </div>

              <div className="lg:col-span-5">
                <figure
                  className="rise overflow-hidden rounded-md border border-border"
                  style={{ animationDelay: "0.15s" }}
                >
                  <img
                    src={step.image}
                    alt={step.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/2] w-full object-cover"
                  />
                  <figcaption className="label-mono flex items-baseline gap-2.5 border-t border-border bg-secondary px-4 py-3">
                    <span className="text-ember">Fig. {pad(selected + 1)}</span>
                    <span aria-hidden="true">/</span>
                    <span>{step.caption}</span>
                  </figcaption>
                </figure>
              </div>
            </div>

            <div className="rise mt-12 md:mt-16" style={{ animationDelay: "0.25s" }}>
              <p className="label-mono flex items-center gap-3 border-t border-border pt-5">
                <span className="text-signal">In this step</span>
                <span aria-hidden="true">/</span>
                <span>{step.points.length} things</span>
              </p>
              <ul className="mt-5 grid gap-x-12 gap-y-4 md:grid-cols-3">
                {step.points.map((point) => (
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

            <div
              className="rise mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-border pt-8 md:mt-16"
              style={{ animationDelay: "0.32s" }}
            >
              <p className="label-mono max-w-md">
                Every engagement starts the same way — with a visit and an honest read of
                where things stand.
              </p>
              <Link
                to="/contact"
                className="bracket hover-glow font-display text-2xl font-bold tracking-tight md:text-3xl"
              >
                Start with an assessment
              </Link>
            </div>
          </LetterGlow>
        </Overlay>
      )}
    </>
  );
}
