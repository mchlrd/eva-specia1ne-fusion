import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ManagedPackages } from "@/components/site/ManagedPackages";
import { Reveal } from "@/components/site/Reveal";

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

      <section className="bg-secondary">
        <div className="shell py-16 md:py-24">
          <p className="label-mono mb-10 flex items-center gap-3">
            <span className="text-signal">01</span>
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
