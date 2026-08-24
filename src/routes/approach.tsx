import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { principles } from "@/components/site/data";
import rackImage from "@/assets/network-rack.jpg";

const title = "Our Approach — Assessed On Site, Built To Keep Running | EvaroTech";
const description =
  "How EvaroTech works: an on-site assessment, right-sized solutions, certified execution and an ongoing managed partnership.";

export const Route = createFileRoute("/approach")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApproachPage,
});

function ApproachPage() {
  return (
    <SiteLayout>
      <PageHeader
        index="04"
        section="Approach"
        title="Assessed on site. Built to keep running."
      />

      <section className="rule-top">
        <div className="shell grid gap-14 py-16 md:grid-cols-2 md:py-24">
          <ol className="border-t border-border">
            {principles.map((p, i) => (
              <Reveal
                as="li"
                key={p.title}
                variant="left"
                delay={Math.min(i, 6) * 90}
                className="hover-slide border-b border-border py-6"
              >
                <div className="flex items-baseline gap-4">
                  <span className="label-mono text-ember">0{i + 1}</span>
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-tight">
                      {p.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal variant="scale" className="hover-zoom md:pt-6">
            <img
              src={rackImage}
              alt="Network cabinet with switches, patch panels and neatly bundled ethernet cabling"
              width={1600}
              height={1008}
              loading="lazy"
              className="w-full object-cover"
            />
            <p className="label-mono mt-4">
              Fig. 01 — Structured cabling and rack build, client site
            </p>
          </Reveal>
        </div>
      </section>

      <section className="rule-top">
        <div className="shell py-14">
          <Link
            to="/contact"
            className="bracket hover-glow inline-block font-display text-2xl font-bold tracking-tight md:text-3xl"
          >
            Start with an assessment
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
