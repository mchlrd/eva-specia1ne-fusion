import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { company, nav, testimonials } from "@/components/site/data";

const title = "EvaroTech Network Solutions — Managed IT in Trenton, Ontario";
const description =
  "EvaroTech Network Solutions designs, installs and manages networks, servers, wireless, backups and Microsoft 365 for businesses in Trenton and Eastern Ontario. Free on-site assessment.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    telephone: company.phone,
    email: company.email,
    url: "https://evarotech.ca/",
    sameAs: [company.facebook],
    description,
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="shell flex min-h-[92svh] flex-col justify-between pb-12 pt-28">
        <div className="rise">
          <p className="label-mono flex items-center gap-3">
            <span className="text-signal">01</span>
            <span aria-hidden="true">/</span>
            <span>Signal</span>
          </p>
          <h1 className="display-xl mt-8 max-w-[19ch]">

            Networks, servers and backups—kept working for your business.
          </h1>
          <p className="mt-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            EvaroTech Network Solutions is a certified independent practice in Trenton, Ontario. We
            assess your technology on site, put the right systems in place, and manage them so the
            business keeps moving.
          </p>
        </div>

        <Reveal delay={150} className="mt-16 flex flex-wrap items-end justify-between gap-6">
          <p className="label-mono">
            <span className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-ember" />
            Rebranded from Consumer Computing Services
          </p>
          <Link
            to="/contact"
            className="bracket hover-glow font-display text-2xl font-bold tracking-tight md:text-3xl"
          >
            Free on-site assessment
          </Link>
        </Reveal>
      </section>

      {/* Questions band */}
      <section className="rule-top bg-primary text-primary-foreground">
        <div className="shell grid gap-px py-0 md:grid-cols-3">
          {[
            "Do you have the right solutions in place to protect your business?",
            "Are you confident in the integrity and security of your data?",
            "Is your network running effectively and efficiently?",
          ].map((q, i) => (
            <Reveal
              key={q}
              variant="up"
              delay={i * 120}
              className="flex flex-col gap-6 py-12 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <span className="label-mono text-ember">0{i + 1}</span>
              <p className="display-md max-w-[22ch]">{q}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Page index */}
      <section className="bg-secondary">
        <div className="shell py-20 md:py-28">
          <Reveal once>
            <p className="label-mono flex items-center gap-3">
              <span className="text-signal">02</span>
              <span aria-hidden="true">/</span>
              <span>Index</span>
            </p>
            <h2 className="display-lg mt-6 max-w-[24ch]">Where to go next.</h2>
          </Reveal>

          <nav className="mt-12 border-t border-border" aria-label="Next pages">
            {nav.map((item, i) => (
              <Reveal as="div" key={item.to} variant="left" delay={i * 80} once>
                <Link
                  to={item.to}
                  className="hover-slide flex items-baseline justify-between border-b border-border py-6"
                >
                  <span className="display-md">{item.label}</span>
                  <span className="label-mono text-ember">0{i + 1}</span>
                </Link>
              </Reveal>
            ))}
          </nav>
        </div>
      </section>

      {/* Client feedback */}
      <section className="bg-primary text-primary-foreground">
        <div className="shell py-20 md:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-mono flex items-center gap-3">
                <span className="text-ember">03</span>
                <span aria-hidden="true">/</span>
                <span>Client Feedback</span>
              </p>
              <h2 className="display-lg mt-6 max-w-[24ch]">
                The work, described by the people who called.
              </h2>
            </div>
            <Link to="/contact" className="label-mono link-underline">
              Become the next one →
            </Link>
          </Reveal>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal
                as="blockquote"
                key={t.name}
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
