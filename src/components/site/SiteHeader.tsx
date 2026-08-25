import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { company, nav } from "./data";
import logo from "@/assets/evarotech-logo-transparent.png";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-background/85 backdrop-blur-md transition-shadow duration-500 ${
        scrolled ? "shadow-[0_1px_0_0_var(--hairline),0_12px_32px_-28px_var(--ink)]" : ""
      }`}
    >
      <div className="shell flex h-16 items-center justify-between border-b border-border">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          data-no-glow
          className="flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5"
        >
          <img
            src={logo}
            alt="EvaroTech Network Solutions logo"
            width={40}
            height={40}
            className="size-9 object-contain"
          />
          <span className="font-display text-lg font-bold tracking-tight">
            {company.short}
            <span className="text-ember">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-signal" }}
              className="label-mono link-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a href={company.phoneHref} className="label-mono hidden link-underline sm:inline">
            {company.phone}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="label-mono flex items-center gap-2 text-foreground md:hidden"
          >
            {open ? "Close" : "Menu"}
            <span className="grid grid-cols-2 gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="size-1.5 bg-signal" />
              ))}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="shell flex h-[calc(100dvh-4rem)] flex-col justify-between bg-background pb-10 pt-10 md:hidden">
          <nav className="flex flex-col">
            {nav.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between border-b border-border py-5"
              >
                <span className="display-md">{item.label}</span>
                <span className="label-mono text-ember">0{i + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="label-mono space-y-1">
            <p>{company.phone}</p>
            <p>{company.email}</p>
          </div>
        </div>
      )}
    </header>
  );
}
