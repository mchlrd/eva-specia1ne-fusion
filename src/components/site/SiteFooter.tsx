import { Link } from "@tanstack/react-router";

import { nav } from "./data";
import { phoneHref } from "./content-store";
import { useContent } from "./content";
import { LetterGlow } from "./LetterGlow";
import { Reveal } from "./Reveal";
import mark from "@/assets/evarotech-mark.png";

export function SiteFooter() {
  const { company, footer, nav: labels } = useContent();

  return (
    <LetterGlow as="footer" className="rule-top">
      <div className="shell py-12 md:py-16">
        {/* Brand band */}
        <Reveal
          as="div"
          variant="up"
          once
          className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-border pb-8"
        >
          <div className="flex items-center gap-4">
            <img
              src={mark}
              alt={`${company.short} logo`}
              width={112}
              height={92}
              loading="lazy"
              className="h-14 w-auto object-contain"
            />
            <p className="display-md">
              <span className="text-ember">{company.wordmark.lead}</span>
              <span className="text-signal">{company.wordmark.accent}</span>
            </p>
          </div>
          <p className="label-mono max-w-xs">{company.tagline}</p>
        </Reveal>

        {/* Page and contact links */}
        <div className="grid gap-8 pt-8 md:grid-cols-12">
          <Reveal as="div" variant="left" once delay={120} className="md:col-span-7">
            <p className="label-mono mb-4 flex items-center gap-3">
              <span className="text-signal">01</span>
              <span aria-hidden="true">/</span>
              <span>{footer.pages}</span>
            </p>
            <div className="grid grid-cols-2 gap-x-8">
              <ul className="space-y-1.5">
                {nav.slice(0, 3).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="link-underline text-sm">
                      {labels[item.key]}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-1.5">
                {nav.slice(3).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="link-underline text-sm">
                      {labels[item.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal as="div" variant="right" once delay={220} className="md:col-span-5">
            <p className="label-mono mb-4 flex items-center gap-3">
              <span className="text-signal">02</span>
              <span aria-hidden="true">/</span>
              <span>{footer.reachUs}</span>
            </p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <a href={phoneHref(company.phone)} className="link-underline">
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="link-underline">
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={company.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline"
                >
                  {footer.facebook} ↗
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>

      <Reveal
        as="div"
        variant="fade"
        once
        delay={320}
        className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-border py-5"
      >
        <p className="label-mono">
          <span className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-ember" />
          {company.coverageLine}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <button
            type="button"
            onClick={() => {
              const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
            }}
            className="label-mono link-underline inline-flex items-center gap-2"
          >
            {footer.backToTop}
            <span aria-hidden="true">↑</span>
          </button>
          <p className="label-mono">
            © {new Date().getFullYear()} <span className="text-ember">{company.wordmark.lead}</span>
            <span className="text-signal">{company.wordmark.accent}</span>
          </p>
        </div>
      </Reveal>
    </LetterGlow>
  );
}
