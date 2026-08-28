import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { technologyPartners } from "./data";
import { LetterGlow } from "./LetterGlow";

const CLOSE_MS = 280;

export function PartnerGrid() {
  const [selected, setSelected] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const partner = selected === null ? null : technologyPartners[selected];

  const close = () => {
    setClosing((isClosing) => {
      if (isClosing) return isClosing;
      window.setTimeout(() => {
        setSelected(null);
        setClosing(false);
      }, CLOSE_MS);
      return true;
    });
  };

  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <>
      <ul className="partner-grid partner-grid--light" aria-label="Technology partners">
        {technologyPartners.map((item, i) => (
          <li key={item.name}>
            <button
              type="button"
              className="partner-card partner-card--light group"
              onClick={() => setSelected(i)}
              aria-label={`Learn more about ${item.name}`}
            >
              <span className="partner-card__front">
                <span className="label-mono text-signal">{String(i + 1).padStart(2, "0")}</span>
                <span className="partner-card__name">{item.name}</span>
                <span className="partner-card__mark" aria-hidden="true">↗</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {partner &&
        selected !== null &&
        createPortal(
          <div
            className="partner-modal"
            data-closing={closing ? "true" : undefined}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <section
              className="partner-modal__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="partner-modal-title"
            >
              <button
                type="button"
                className="partner-modal__close"
                onClick={close}
                aria-label="Close platform details"
                autoFocus
              >
                <span aria-hidden="true">×</span>
              </button>
              <LetterGlow>
                <p className="label-mono text-signal">
                  Platform / {String(selected + 1).padStart(2, "0")}
                </p>
                <div className="partner-modal__logo">
                  <img src={partner.logo} alt={`${partner.name} logo`} />
                </div>
                <h3 id="partner-modal-title" className="display-lg mt-8">
                  {partner.name}
                </h3>
                <p className="partner-modal__description">{partner.description}</p>
                <a
                  className="partner-modal__link"
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more at {new URL(partner.website).hostname.replace("www.", "")}
                  <span aria-hidden="true"> ↗</span>
                </a>
                <p className="label-mono mt-10">
                  Integrated, configured and supported by EvaroTech.
                </p>
              </LetterGlow>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
