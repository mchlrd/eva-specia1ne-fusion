import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ManagedPackages } from "@/components/site/ManagedPackages";
import { Reveal } from "@/components/site/Reveal";
import managedOffice from "@/assets/managed-office.jpg";
import managedMonitoring from "@/assets/managed-monitoring.jpg";

const title = "Managed IT Packages — Security, Backup & Microsoft 365 | EvaroTech";
const description =
  "Managed security, managed backup and Microsoft 365 mail and apps — monitored, patched and verified so your business keeps running.";

type ManagedSearch = { pkg?: number };

/** Accept ?pkg=N so the home page teasers can deep-link to a package. */
const validateSearch = (search: Record<string, unknown>): ManagedSearch => {
  const n = Number(search["pkg"]);
  return Number.isInteger(n) && n >= 1 && n <= 3 ? { pkg: n } : {};
};

export const Route = createFileRoute("/managed")({
  validateSearch,
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
  component: ManagedPage,
});

function ManagedPage() {
  const { pkg } = Route.useSearch();

  return (
    <SiteLayout>
      <PageHeader
        index="03"
        section="Managed Services"
        title="Managed packages that cover the whole business."
        intro="Ongoing services that keep systems patched, monitored and backed up long after install day."
      />

      {/* Why managed */}
      <section className="rule-top">
        <div className="shell grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
          <Reveal variant="up" className="md:col-span-6">
            <p className="label-mono flex items-center gap-3">
              <span className="text-signal">01</span>
              <span aria-hidden="true">/</span>
              <span>Managed</span>
              <span aria-hidden="true">/</span>
              <span>Why go managed</span>
            </p>
            <h2 className="display-md mt-6 max-w-[20ch]">
              Your IT, handled — so the business keeps moving.
            </h2>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
              A managed package turns technology from something you worry about into something that
              just works. We watch, patch and verify your systems on a schedule, and you always have
              a direct line to the person who knows your setup.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "One flat monthly rate — no surprise invoices",
                "Problems fixed before they interrupt work",
                "Backups verified so a restore is never a guess",
                "Direct access to a technician who knows your setup",
              ].map((point) => (
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
              alt="IT technician working at a desk with monitors and a laptop"
              width={1600}
              height={1067}
              loading="lazy"
              className="w-full object-cover"
            />
            <p className="label-mono mt-4">Fig. 01 — Your IT, watched and kept healthy</p>
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
            <p className="label-mono mt-4 text-primary-foreground/60">
              Fig. 02 — Monitored around the clock, from one screen
            </p>
          </Reveal>

          <div className="md:col-span-7">
            <Reveal>
              <p className="label-mono flex items-center gap-3">
                <span className="text-ember">02</span>
                <span aria-hidden="true">/</span>
                <span>Managed</span>
                <span aria-hidden="true">/</span>
                <span>What you can expect</span>
              </p>
              <h2 className="display-md mt-6 max-w-[18ch]">The same care, every month.</h2>
            </Reveal>

            <div className="mt-10 border-t border-primary-foreground/15">
              {[
                {
                  title: "Monitored",
                  body: "We watch your servers, workstations and backups around the clock — and we hear about problems before you do.",
                },
                {
                  title: "Maintained",
                  body: "Patches and updates are applied on a schedule that suits your business. No forced reboots mid-morning.",
                },
                {
                  title: "Supported",
                  body: "One call or email reaches Tim directly — worked remotely first, and on site when it needs to be.",
                },
              ].map((item, i) => (
                <Reveal
                  key={item.title}
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
            <span>Packages</span>
            <span aria-hidden="true">/</span>
            <span>Select one to open its details</span>
          </p>

          <ManagedPackages autoOpen={pkg ? pkg - 1 : undefined} />

          <Reveal className="mt-14">
            <Link
              to="/contact"
              className="bracket hover-glow inline-block font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              Ask which package fits
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}