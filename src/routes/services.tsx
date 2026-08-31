import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { ServiceAccordion } from "@/components/site/ServiceAccordion";
import { PartnerGrid } from "@/components/site/PartnerGrid";

const title = "IT Services — Networks, Servers, Wireless & Cabling | EvaroTech";
const description =
  "Network and server installation, wireless, structured cabling, cameras, backup and workstation support for businesses in Trenton and Eastern Ontario.";

export const Route = createFileRoute("/services")({
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
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHeader
        index="02"
        section="Services"
        title="What we install, configure and maintain."
        intro="Don't see what you need? Ask — most requests fall inside this work."
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
                <span>Technology partners</span>
              </p>
              <h2 className="display-lg mt-5">Platforms we work with.</h2>
              <p className="mt-5 text-muted-foreground">
                Click a platform to see the logo, what it does and how we work with it to build
                dependable systems.
              </p>
            </div>
            <PartnerGrid />
          </Reveal>

          <Reveal className="mt-14">
            <Link
              to="/contact"
              className="bracket hover-glow inline-block font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              Book a free assessment
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
