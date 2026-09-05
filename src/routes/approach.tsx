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
        <div className="shell grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
          <Reveal variant="up" className="md:col-span-6">
            <p className="label-mono flex items-center gap-3">
              <span className="text-signal">01</span>
              <span aria-hidden="true">/</span>
              <span>Steps</span>
              <span aria-hidden="true">/</span>
              <span>Four steps, one way of working</span>
            </p>
            <h2 className="display-md mt-6 max-w-[18ch]">
              Every engagement runs the same way — from the first visit to
              ongoing care.
            </h2>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
              No shortcuts, no surprises: we assess on site, size the solution
              to your operation, build it to vendor best practice, and stay
              with you afterwards. Scroll through the four steps below.
            </p>
          </Reveal>

          <Reveal variant="scale" delay={120} className="hover-zoom md:col-span-6">
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

      <ApproachSteps />

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
