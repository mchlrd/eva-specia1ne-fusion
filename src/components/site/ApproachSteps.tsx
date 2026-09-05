import { principles } from "./data";
import { Reveal } from "./Reveal";

const pad = (n: number) => String(n).padStart(2, "0");

export function ApproachSteps() {
  return (
    <div className="relative">
      {/* Centre timeline rail (desktop) */}
      <span
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 top-6 hidden w-px -translate-x-1/2 bg-border md:block"
      />

      <ol>
        {principles.map((p, i) => {
          const reversed = i % 2 === 1;
          return (
            <li
              key={p.title}
              className="relative overflow-hidden border-t border-border py-16 md:py-24"
            >
              {/* Node on the rail */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_0_5px] shadow-signal/15 md:block"
              />

              {/* Ghost number */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-3 select-none bg-gradient-to-b from-ink/10 via-ink/[0.05] to-transparent bg-clip-text text-center font-display text-[6.5rem] font-bold leading-none tracking-tighter text-transparent md:text-[11rem]"
              >
                {pad(i + 1)}
              </span>

              <div className="shell relative grid items-center gap-x-14 gap-y-10 md:grid-cols-12">
                <Reveal
                  variant={reversed ? "right" : "left"}
                  className={
                    reversed
                      ? "md:col-span-5 md:col-start-7"
                      : "md:col-span-5"
                  }
                >
                  <p className="label-mono flex items-center gap-3">
                    <span className="text-ember">Step {pad(i + 1)}</span>
                    <span aria-hidden="true">/</span>
                    <span>{pad(i + 1)} of {pad(principles.length)}</span>
                  </p>
                  <h2 className="display-xl mt-5 max-w-[14ch]">{p.title}</h2>
                  <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                    {p.body}
                  </p>
                  <ul className="mt-8 grid gap-x-10 gap-y-3.5 md:grid-cols-2">
                    {p.points.map((point) => (
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
                </Reveal>

                <Reveal
                  variant={reversed ? "left" : "right"}
                  delay={140}
                  className={
                    reversed
                      ? "md:col-span-6 md:row-start-1"
                      : "md:col-span-6 md:col-start-7 md:row-start-1"
                  }
                >
                  <figure className="hover-zoom overflow-hidden rounded-md border border-border">
                    <img
                      src={p.image}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[3/2] w-full object-cover"
                    />
                    <figcaption className="label-mono flex items-baseline gap-2.5 border-t border-border bg-secondary px-4 py-3">
                      <span className="text-ember">Fig. {pad(i + 1)}</span>
                      <span aria-hidden="true">/</span>
                      <span>{p.caption}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}