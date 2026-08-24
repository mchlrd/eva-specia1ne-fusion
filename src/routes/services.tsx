import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { services } from "@/components/site/data";

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
          <ol className="border-t border-border">
            {services.map((s, i) => (
              <Reveal
                as="li"
                key={s.title}
                variant="right"
                delay={Math.min(i, 6) * 70}
                className="group hover-slide grid gap-4 border-b border-border py-8 md:grid-cols-12 md:items-baseline md:gap-8"
              >
                <span className="label-mono md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="display-md transition-colors group-hover:text-signal md:col-span-5">
                  {s.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground md:col-span-6">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </ol>

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
