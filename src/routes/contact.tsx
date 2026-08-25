import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { company } from "@/components/site/data";
import tim from "@/assets/tim-kroekenstoel.png";

const title = "Contact EvaroTech — Free On-Site IT Assessment in Trenton, ON";
const description =
  "Book a free on-site assessment and no-obligation quote with Tim Kroekenstoel, C.Tech. Call, email or send an enquiry from the form.";

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <PageHeader
        index="06"
        section="Contact"
        title="Book a free assessment and no-obligation quote."
        intro="We will come to you, assess your business technology needs and recommend what to do next."
      />

      <section className="rule-top">
        <div className="shell grid gap-14 py-16 md:grid-cols-12 md:py-24">
          <Reveal variant="left" className="md:col-span-7">
            <h2 className="display-md">Send an enquiry</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </Reveal>

          <div className="md:col-span-5">
            <Reveal variant="scale" className="hover-zoom">
              <img
                src={tim}
                alt={`${company.owner}, owner and operator of ${company.name}`}
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
                  <dt className="label-mono">Phone</dt>
                  <dd className="mt-2 text-sm">
                    <a href={company.phoneHref} className="link-underline">
                      {company.phone}
                    </a>
                  </dd>
                </div>
                <div className="border-b border-border py-5">
                  <dt className="label-mono">Email</dt>
                  <dd className="mt-2 text-sm">
                    <a href={`mailto:${company.email}`} className="link-underline">
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div className="border-b border-border py-5">
                  <dt className="label-mono">Address</dt>
                  <dd className="mt-2 text-sm leading-relaxed">
                    {company.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="border-b border-border py-5">
                  <dt className="label-mono">Coverage</dt>
                  <dd className="mt-2 text-sm">
                    Trenton, Quinte West, Belleville and surrounding Eastern Ontario
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
