import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ManagedPackages } from "@/components/site/ManagedPackages";
import { Reveal } from "@/components/site/Reveal";
import { defaults } from "@/components/site/content-store";
import { useContent } from "@/components/site/content";
import managedOffice from "@/assets/managed-office.jpg";
import managedMonitoring from "@/assets/managed-monitoring.jpg";

type ManagedSearch = { pkg?: number };

/**
 * Accept ?pkg=N so the home page teasers can deep-link to a package. The upper
 * bound is deliberately loose: how many packages exist is editable text, so a
 * value past the end is ignored by the packages list rather than rejected here.
 */
const validateSearch = (search: Record<string, unknown>): ManagedSearch => {
  const n = Number(search["pkg"]);
  return Number.isInteger(n) && n >= 1 && n <= 99 ? { pkg: n } : {};
};

export const Route = createFileRoute("/managed")({
  validateSearch,
  head: () => {
    const { title, description } = defaults.pages.managed;
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
  component: ManagedPage,
});

function ManagedPage() {
  const { pkg } = Route.useSearch();
  const { managed, company } = useContent();
  const { header, why, expect, packages } = managed;

  return (
    <SiteLayout>
      <PageHeader
        index={header.index}
        section={header.section}
        title={header.heading}
        intro={header.intro}
      />

      {/* Why managed */}
      <section className="rule-top">
        <div className="shell grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
          <Reveal variant="up" className="md:col-span-6">
            <p className="label-mono flex items-center gap-3">
              <span className="text-signal">01</span>
              <span aria-hidden="true">/</span>
              <span>{why.eyebrow}</span>
            </p>
            <h2 className="display-md mt-6 max-w-[20ch]">{why.heading}</h2>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
              {why.body}
            </p>
            <ul className="mt-8 space-y-3">
              {why.points.map((point) => (
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

          <Reveal variant="scale" delay={120} className="hover-zoom md:col-span-6">
            <img
              src={managedOffice}
              alt={`IT technician working at a desk with monitors and a laptop at ${company.short}`}
              width={1600}
              height={1067}
              loading="lazy"
              className="w-full object-cover"
            />
            <p className="label-mono mt-4">{why.caption}</p>
          </Reveal>
        </div>
      </section>

      {/* What you can expect */}
      <section className="bg-primary text-primary-foreground">
        <div className="shell grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
          <Reveal variant="scale" className="hover-zoom md:col-span-5">
            <img
              src={managedMonitoring}
              alt="Laptop screen showing system monitoring dashboards and charts"
              width={1600}
              height={1067}
              loading="lazy"
              className="w-full object-cover"
            />
            <p className="label-mono mt-4 text-primary-foreground/60">{expect.caption}</p>
          </Reveal>

          <div className="md:col-span-7">
            <Reveal>
              <p className="label-mono flex items-center gap-3">
                <span className="text-ember">02</span>
                <span aria-hidden="true">/</span>
                <span>{expect.eyebrow}</span>
              </p>
              <h2 className="display-md mt-6 max-w-[18ch]">{expect.heading}</h2>
            </Reveal>

            <div className="mt-10 border-t border-primary-foreground/15">
              {expect.items.map((item, i) => (
                <Reveal
                  key={item.id}
                  as="div"
                  variant="right"
                  delay={i * 90}
                  className="hover-slide grid gap-2 border-b border-primary-foreground/15 py-7 md:grid-cols-12 md:gap-8"
                >
                  <span className="label-mono text-ember md:col-span-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-md transition-colors duration-300 hover:text-ember md:col-span-3">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-primary-foreground/70 md:col-span-7">
                    {item.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-secondary">
        <div className="shell py-16 md:py-24">
          <p className="label-mono mb-10 flex items-center gap-3">
            <span className="text-signal">03</span>
            <span aria-hidden="true">/</span>
            <span>{packages.eyebrow}</span>
          </p>

          <ManagedPackages autoOpen={pkg ? pkg - 1 : undefined} />

          <Reveal className="mt-14">
            <Link
              to="/contact"
              className="bracket hover-glow inline-block font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              {packages.cta}
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
