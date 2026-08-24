import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { testimonials } from "@/components/site/data";

const title = "Clients — What Businesses Say About EvaroTech";
const description =
  "Testimonials from businesses across Ontario about emergency support, same-day service and honest, reliable IT work from EvaroTech.";

export const Route = createFileRoute("/clients")({
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
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <SiteLayout>
      <PageHeader
        index="05"
        section="Clients"
        title="The work, described by the people who called."
      />

      <section className="bg-primary text-primary-foreground">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal
                as="blockquote"
                key={t.name}
                variant="up"
                delay={i * 110}
                className="hover-lift border-t border-ember pt-6"
              >
                <p className="text-base leading-relaxed">{t.quote}</p>
                <footer className="label-mono mt-6 text-primary-foreground/70">
                  {t.name} — {t.where}
                </footer>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14">
        <Link
          to="/contact"
          className="bracket hover-glow inline-block font-display text-2xl font-bold tracking-tight md:text-3xl"
        >
          Become the next one
        </Link>
      </section>
    </SiteLayout>
  );
}
