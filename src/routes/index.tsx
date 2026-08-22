import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  company,
  managed,
  principles,
  services,
  testimonials,
} from "@/components/site/data";
import rackImage from "@/assets/network-rack.jpg";

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

function SectionLabel({ index, name }: { index: string; name: string }) {
  return (
    <p className="label-mono flex items-center gap-3">
      <span className="text-signal">{index}</span>
      <span aria-hidden="true">/</span>
      <span>{name}</span>
    </p>
  );
}

function Index() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    telephone: company.phone,
    email: company.email,
    url: "https://evarotech.ca/",
    address: {
      "@type": "PostalAddress",
      streetAddress: "34 Cattail Crescent",
      addressLocality: "Trenton",
      addressRegion: "ON",
      postalCode: "K8V 0J4",
      addressCountry: "CA",
    },
    sameAs: [company.facebook],
    description,
  };

  return (
    <div id="top" className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="shell flex min-h-[92svh] flex-col justify-between pb-12 pt-28">
          <div className="rise">
            <SectionLabel index="01" name="Signal" />
            <h1 className="display-xl mt-10 max-w-[19ch]">
              Networks, servers and backups—kept working for your business.
            </h1>
            <p className="mt-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              EvaroTech Network Solutions is a certified independent practice in Trenton,
              Ontario. We assess your technology on site, put the right systems in place,
              and manage them so the business keeps moving.
            </p>
          </div>

          <div className="mt-16 flex flex-wrap items-end justify-between gap-6">
            <p className="label-mono">
              <span className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-signal" />
              Rebranded from Consumer Computing Services
            </p>
            <a
              href="#contact"
              className="bracket font-display text-2xl font-bold tracking-tight transition-colors hover:text-signal md:text-3xl"
            >
              Free on-site assessment
            </a>
          </div>
        </section>

        {/* Questions band */}
        <section className="rule-top bg-primary text-primary-foreground">
          <div className="shell grid gap-px py-0 md:grid-cols-3">
            {[
              "Do you have the right solutions in place to protect your business?",
              "Are you confident in the integrity and security of your data?",
              "Is your network running effectively and efficiently?",
            ].map((q, i) => (
              <div
                key={q}
                className="flex flex-col gap-6 py-12 md:px-8 md:first:pl-0 md:last:pr-0"
              >
                <span className="label-mono text-signal">0{i + 1}</span>
                <p className="display-md max-w-[22ch]">{q}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="rule-top scroll-mt-16">
          <div className="shell py-20 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel index="02" name="Services" />
                <h2 className="display-lg mt-6 max-w-[24ch]">
                  What we install, configure and maintain.
                </h2>
              </div>
              <p className="label-mono max-w-xs">
                Don't see what you need? Ask — most requests fall inside this work.
              </p>
            </div>

            <ol className="mt-14 border-t border-border">
              {services.map((s, i) => (
                <li
                  key={s.title}
                  className="group grid gap-4 border-b border-border py-8 md:grid-cols-12 md:items-baseline md:gap-8"
                >
                  <span className="label-mono md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-md md:col-span-5 transition-colors group-hover:text-signal">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:col-span-6">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Managed packages */}
        <section id="managed" className="scroll-mt-16 bg-secondary">
          <div className="shell py-20 md:py-28">
            <SectionLabel index="03" name="Managed" />
            <h2 className="display-lg mt-6 max-w-[26ch]">
              Managed packages that cover the whole business.
            </h2>

            <div className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {managed.map((m, i) => (
                <article
                  key={m.title}
                  className="flex flex-col justify-between border-t-2 border-foreground bg-card p-8 transition-colors hover:border-signal"
                >
                  <span className="label-mono">Package 0{i + 1}</span>
                  <div className="mt-16">
                    <h3 className="display-md">{m.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {m.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Approach + image */}
        <section id="approach" className="rule-top scroll-mt-16">
          <div className="shell grid gap-14 py-20 md:grid-cols-2 md:py-28">
            <div>
              <SectionLabel index="04" name="Approach" />
              <h2 className="display-lg mt-6 max-w-[20ch]">
                Assessed on site. Built to keep running.
              </h2>
              <ol className="mt-12 border-t border-border">
                {principles.map((p, i) => (
                  <li key={p.title} className="border-b border-border py-6">
                    <div className="flex items-baseline gap-4">
                      <span className="label-mono text-signal">0{i + 1}</span>
                      <div>
                        <h3 className="font-display text-lg font-semibold tracking-tight">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {p.body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="md:pt-16">
              <img
                src={rackImage}
                alt="Network cabinet with switches, patch panels and neatly bundled ethernet cabling"
                width={1600}
                height={1008}
                loading="lazy"
                className="w-full object-cover"
              />
              <p className="label-mono mt-4">
                Fig. 01 — Structured cabling and rack build, client site
              </p>
            </div>
          </div>
        </section>

        {/* Clients */}
        <section id="clients" className="scroll-mt-16 bg-primary text-primary-foreground">
          <div className="shell py-20 md:py-28">
            <SectionLabel index="05" name="Clients" />
            <h2 className="display-lg mt-6 max-w-[22ch]">
              The work, described by the people who called.
            </h2>

            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote key={t.name} className="border-t border-signal pt-6">
                  <p className="text-base leading-relaxed">{t.quote}</p>
                  <footer className="label-mono mt-6 text-primary-foreground/70">
                    {t.name} — {t.where}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="rule-top scroll-mt-16">
          <div className="shell py-20 md:py-28">
            <SectionLabel index="06" name="Contact" />
            <h2 className="display-lg mt-6 max-w-[22ch]">
              Book a free assessment and no-obligation quote.
            </h2>

            <div className="mt-14 grid gap-12 md:grid-cols-12">
              <div className="md:col-span-6">
                <a
                  href={`mailto:${company.email}`}
                  className="bracket font-display text-3xl font-bold tracking-tight transition-colors hover:text-signal md:text-5xl"
                >
                  Start a conversation
                </a>
                <p className="mt-8 text-sm text-muted-foreground">
                  Or call{" "}
                  <a href={company.phoneHref} className="link-underline text-foreground">
                    {company.phone}
                  </a>{" "}
                  — we will come to you, assess your business technology needs and
                  recommend what to do next.
                </p>
              </div>

              <dl className="grid gap-8 md:col-span-6 md:grid-cols-2">
                <div>
                  <dt className="label-mono">Owner and operator</dt>
                  <dd className="mt-2 text-sm">{company.owner}</dd>
                </div>
                <div>
                  <dt className="label-mono">Email</dt>
                  <dd className="mt-2 text-sm">
                    <a href={`mailto:${company.email}`} className="link-underline">
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="label-mono">Address</dt>
                  <dd className="mt-2 text-sm leading-relaxed">
                    {company.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="label-mono">Coverage</dt>
                  <dd className="mt-2 text-sm">
                    Trenton, Quinte West, Belleville and surrounding Eastern Ontario
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
