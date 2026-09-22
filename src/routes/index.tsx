import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { defaults } from "@/components/site/content-store";
import { useContent } from "@/components/site/content";

export const Route = createFileRoute("/")({
  head: () => {
    const { title, description } = defaults.pages.home;
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
  component: Index,
});

function Index() {
  const { company, home, pages } = useContent();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    telephone: company.phone,
    email: company.email,
    url: "https://evarotech.ca/",
    sameAs: [company.facebook],
    description: pages.home.description,
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="shell flex min-h-[92svh] flex-col justify-between pb-12 pt-28">
        <div className="rise">
          <p className="label-mono flex items-center gap-3">
            <span className="text-signal">01</span>
            <span aria-hidden="true">/</span>
            <span>{home.hero.eyebrow}</span>
          </p>
          <h1 className="display-xl mt-8 max-w-[19ch]">{home.hero.heading}</h1>
          <p className="mt-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {home.hero.intro}
          </p>
        </div>

        <Reveal delay={150} className="mt-16 flex flex-wrap items-end justify-between gap-6">
          <p className="label-mono">
            <span className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-ember" />
            {home.hero.note}
          </p>
          <Link
            to="/contact"
            className="bracket hover-glow font-display text-2xl font-bold tracking-tight md:text-3xl"
          >
            {home.hero.cta}
          </Link>
        </Reveal>
      </section>

      {/* Questions band */}
      <section className="rule-top bg-background">
        <div className="shell grid py-0 md:grid-cols-3 md:divide-x md:divide-border">
          {home.questions.map((q, i) => (
            <Reveal
              key={q}
              variant="up"
              delay={i * 120}
              className="flex flex-col gap-6 py-12 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <span className="label-mono text-ember">{String(i + 1).padStart(2, "0")}</span>
              <p className="display-md max-w-[22ch]">{q}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Client feedback */}
      <section className="bg-primary text-primary-foreground">
        <div className="shell py-20 md:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-mono flex items-center gap-3">
                <span className="text-ember">02</span>
                <span aria-hidden="true">/</span>
                <span>{home.feedback.section}</span>
              </p>
              <h2 className="display-lg mt-6 max-w-[24ch]">{home.feedback.heading}</h2>
            </div>
            <Link to="/contact" className="label-mono link-underline">
              {home.feedback.link} →
            </Link>
          </Reveal>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {home.feedback.items.map((t, i) => (
              <Reveal
                as="blockquote"
                key={t.id}
                variant="up"
                delay={i * 110}
                className="hover-lift border-t border-ember pt-6"
              >
                <span
                  aria-hidden="true"
                  className="block font-display text-5xl font-bold leading-none text-ember/90"
                >
                  “
                </span>
                <p className="mt-4 text-base leading-relaxed">{t.quote}</p>
                <footer className="label-mono mt-6 text-primary-foreground/70">
                  {t.name} — {t.where}
                </footer>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </SiteLayout>
  );
}
