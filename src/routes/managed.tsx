import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { managed } from "@/components/site/data";

const title = "Managed IT Packages — Security, Backup & Microsoft 365 | EvaroTech";
const description =
  "Managed security, managed backup and Microsoft 365 mail and apps — monitored, patched and verified so your business keeps running.";

export const Route = createFileRoute("/managed")({
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
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {managed.map((m, i) => (
              <Reveal
                as="article"
                key={m.title}
                variant="scale"
                delay={Math.min(i, 6) * 90}
                className="hover-lift flex flex-col justify-between border-t-2 border-signal bg-card p-8 hover:border-ember"
              >
                <span className="label-mono">Package 0{i + 1}</span>
                <div className="mt-16">
                  <h2 className="display-md">{m.title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

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
