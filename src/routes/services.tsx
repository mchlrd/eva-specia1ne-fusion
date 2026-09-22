import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { ServiceAccordion } from "@/components/site/ServiceAccordion";
import { PartnerGrid } from "@/components/site/PartnerGrid";
import { defaults, tokens } from "@/components/site/content-store";
import { useContent } from "@/components/site/content";

export const Route = createFileRoute("/services")({
  head: () => {
    const { title, description } = defaults.pages.services;
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
  component: ServicesPage,
});

function ServicesPage() {
  const { services } = useContent();
  const { header, partners } = services;
  const platformCount = partners.groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <SiteLayout>
      <PageHeader
        index={header.index}
        section={header.section}
        title={header.heading}
        intro={header.intro}
      />

      <section className="rule-top">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <ServiceAccordion />
          </Reveal>

          <Reveal className="mt-20 md:mt-28">
            <div className="mb-10 max-w-2xl">
              <p className="label-mono flex items-center gap-3">
                <span className="text-signal">03</span>
                <span aria-hidden="true">/</span>
                <span>{partners.eyebrow}</span>
              </p>
              <h2 className="display-lg mt-5">{partners.heading}</h2>
              <p className="mt-5 text-muted-foreground">
                {tokens(partners.intro, { platformCount: String(platformCount) })}
              </p>
            </div>
            <PartnerGrid />
          </Reveal>

          <Reveal className="mt-14">
            <Link
              to="/contact"
              className="bracket hover-glow inline-block font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              {partners.cta}
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
