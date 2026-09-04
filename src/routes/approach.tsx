import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ApproachSteps } from "@/components/site/ApproachSteps";
import { Reveal } from "@/components/site/Reveal";
import approachSite from "@/assets/approach-site.jpg";

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
        section="Client Approach"
        title="Assessed on site. Built to keep running."
      />

      <section className="rule-top">
        <div className="shell grid gap-14 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="label-mono mb-8 flex items-center gap-3">
              <span className="text-signal">01</span>
              <span aria-hidden="true">/</span>
              <span>Steps</span>
              <span aria-hidden="true">/</span>
              <span>Select one to see how it works</span>
            </p>
            <ApproachSteps />
          </div>

          <Reveal variant="scale" className="hover-zoom md:pt-6">
            <img
              src={approachSite}
              alt="IT technician working at a computer inside a server room"
              width={1600}
              height={1068}
              loading="lazy"
              className="w-full object-cover"
            />
            <p className="label-mono mt-4">
              Fig. 01 — Working on site, from assessment to ongoing care
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
