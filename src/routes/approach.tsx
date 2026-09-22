import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ApproachSteps } from "@/components/site/ApproachSteps";
import { Reveal } from "@/components/site/Reveal";
import { defaults } from "@/components/site/content-store";
import { useContent } from "@/components/site/content";
import approachSite from "@/assets/approach-site.jpg";

export const Route = createFileRoute("/approach")({
  head: () => {
    const { title, description } = defaults.pages.approach;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ApproachPage,
});

function ApproachPage() {
  const { approach, company } = useContent();
  const { header, intro } = approach;

  return (
    <SiteLayout>
      <PageHeader index={header.index} section={header.section} title={header.heading} />

      <section className="rule-top">
        <div className="shell grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
          <Reveal variant="up" className="md:col-span-6">
            <p className="label-mono flex items-center gap-3">
              <span className="text-signal">01</span>
              <span aria-hidden="true">/</span>
              <span>{intro.eyebrow}</span>
            </p>
            <h2 className="display-md mt-6 max-w-[18ch]">{intro.heading}</h2>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
              {intro.body}
            </p>
          </Reveal>

          <Reveal variant="scale" delay={120} className="hover-zoom md:col-span-6">
            <img
              src={approachSite}
              alt={`IT technician working at a computer inside a server room at ${company.short}`}
              width={1600}
              height={1068}
              loading="lazy"
              className="w-full object-cover"
            />
            <p className="label-mono mt-4">{intro.caption}</p>
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
            {approach.cta}
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
