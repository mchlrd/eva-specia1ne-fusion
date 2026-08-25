import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { company, nav, services } from "@/components/site/data";
import logo from "@/assets/evarotech-logo-transparent.png";

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
    <SiteLayout>
      {/* Hero */}
      <section className="shell flex min-h-[92svh] flex-col justify-between pb-12 pt-28">
        <div className="rise">
          <p className="label-mono flex items-center gap-3">
            <span className="text-signal">01</span>
            <span aria-hidden="true">/</span>
            <span>Signal</span>
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <img
              src={logo}
              alt="EvaroTech Network Solutions logo"
              width={160}
              height={160}
              className="size-24 object-contain md:size-32"
            />
            <h1 className="display-xl max-w-[19ch]">
              Networks, servers and backups—kept working for your business.
            </h1>
          </div>
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

      {/* Services teaser */}
      <section className="rule-top">
        <div className="shell py-20 md:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-mono flex items-center gap-3">
                <span className="text-signal">02</span>
                <span aria-hidden="true">/</span>
                <span>Services</span>
              </p>
              <h2 className="display-lg mt-6 max-w-[24ch]">
                What we install, configure and maintain.
              </h2>
            </div>
            <Link to="/services" className="label-mono link-underline">
              All services →
            </Link>
          </Reveal>

          <ul className="mt-14 border-t border-border">
            {services.slice(0, 4).map((s, i) => (
              <Reveal
                as="li"
                key={s.title}
                variant="right"
                delay={i * 70}
                className="group hover-slide grid gap-4 border-b border-border py-8 md:grid-cols-12 md:items-baseline md:gap-8"
              >
                <span className="label-mono md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display-md transition-colors group-hover:text-signal md:col-span-5">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground md:col-span-6">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Page index */}
      <section className="bg-secondary">
        <div className="shell py-20 md:py-28">
          <Reveal>
            <p className="label-mono flex items-center gap-3">
              <span className="text-signal">03</span>
              <span aria-hidden="true">/</span>
              <span>Index</span>
            </p>
            <h2 className="display-lg mt-6 max-w-[24ch]">Where to go next.</h2>
          </Reveal>

          <nav className="mt-12 border-t border-border">
            {nav.map((item, i) => (
              <Reveal as="div" key={item.to} variant="left" delay={i * 80}>
                <Link
                  to={item.to}
                  className="hover-slide flex items-baseline justify-between border-b border-border py-6"
                >
                  <span className="display-md">{item.label}</span>
                  <span className="label-mono text-ember">0{i + 2}</span>
                </Link>
              </Reveal>
            ))}
          </nav>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </SiteLayout>
  );
}
