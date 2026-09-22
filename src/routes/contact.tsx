import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { defaults, phoneHref } from "@/components/site/content-store";
import { useContent } from "@/components/site/content";
import tim from "@/assets/tim-kroekenstoel.png";

export const Route = createFileRoute("/contact")({
  head: () => {
    const { title, description } = defaults.pages.contact;
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
  component: ContactPage,
});

function ContactPage() {
  const { company, contact } = useContent();
  const { header, details, form } = contact;

  return (
    <SiteLayout>
      <PageHeader
        index={header.index}
        section={header.section}
        title={header.heading}
        intro={header.intro}
      />

      <section className="rule-top">
        <div className="shell grid gap-14 py-16 md:grid-cols-12 md:py-24">
          <Reveal variant="left" className="md:col-span-7">
            <h2 className="display-md">{form.heading}</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </Reveal>

          <div className="md:col-span-5">
            <Reveal variant="scale" className="hover-zoom">
              <img
                src={tim}
                alt={`${company.owner}, ${company.role} at ${company.name}`}
                width={800}
                height={800}
                className="w-full object-cover"
              />
              <p className="label-mono mt-4">
                {company.owner} — {company.role}
              </p>
            </Reveal>

            <Reveal variant="up" delay={120}>
              <dl className="mt-10 border-t border-border">
                <div className="border-b border-border py-5">
                  <dt className="label-mono">{details.phone}</dt>
                  <dd className="mt-2 text-sm">
                    <a href={phoneHref(company.phone)} className="link-underline">
                      {company.phone}
                    </a>
                  </dd>
                </div>
                <div className="border-b border-border py-5">
                  <dt className="label-mono">{details.email}</dt>
                  <dd className="mt-2 text-sm">
                    <a href={`mailto:${company.email}`} className="link-underline">
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div className="border-b border-border py-5">
                  <dt className="label-mono">{details.coverage}</dt>
                  <dd className="mt-2 text-sm">{company.coverage}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
