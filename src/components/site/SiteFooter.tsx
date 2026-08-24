import { Link } from "@tanstack/react-router";

import { company, nav } from "./data";
import logo from "@/assets/evarotech-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="rule-top">
      <div className="shell grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <img
            src={logo.url}
            alt="EvaroTech Network Solutions logo"
            width={72}
            height={72}
            loading="lazy"
            className="size-16 object-contain"
          />
          <p className="display-md mt-5 max-w-sm">{company.name}</p>
          <p className="label-mono mt-4">{company.tagline}</p>
        </div>

        <div className="md:col-span-3">
          <p className="label-mono mb-4">Pages</p>
          <ul className="space-y-2">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-underline text-sm">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="label-mono mb-4">Reach us</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={company.phoneHref} className="link-underline">
                {company.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="link-underline">
                {company.email}
              </a>
            </li>
            <li className="text-muted-foreground">{company.address.join(" · ")}</li>
            <li>
              <a
                href={company.facebook}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-3 border-t border-border py-6">
        <p className="label-mono">
          <span className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-ember" />
          Serving Trenton, Quinte West & Eastern Ontario
        </p>
        <p className="label-mono">
          © {new Date().getFullYear()} {company.short}
        </p>
      </div>
    </footer>
  );
}
