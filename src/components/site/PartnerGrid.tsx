import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { hostOf, platformLogos, type GroupItem } from "./data";
import { useContent } from "./content";
import { LetterGlow } from "./LetterGlow";
import { Reveal } from "./Reveal";

const CLOSE_MS = 280;

type Selection = {
  platform: GroupItem;
  /** The group the card was opened from, so the modal can say where it sits. */
  group: string;
};

export function PartnerGrid() {
  const { groups, note } = useContent().services.partners;
  const [selected, setSelected] = useState<Selection | null>(null);
  const [closing, setClosing] = useState(false);

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
  }, [selected]);

  const logo = selected ? platformLogos[selected.platform.id] : undefined;

  return (
    <>
      <div className="platform-groups">
        {groups.map((group, groupIndex) => (
          <Reveal
            key={group.id}
            variant="up"
            delay={groupIndex === 0 ? 0 : 60}
            className="platform-group"
          >
            <header className="platform-group__head">
              <h3 className="platform-group__name">
                <span className="text-signal">{String(groupIndex + 1).padStart(2, "0")}</span>
                <span aria-hidden="true">/</span>
                <span>{group.name}</span>
              </h3>
              <p className="platform-group__blurb">{group.blurb}</p>
            </header>

            <ul
              className="partner-grid partner-grid--light"
              data-columns={group.items.length}
              aria-label={`${group.name} platforms`}
            >
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="partner-card partner-card--light group"
                    onClick={() => setSelected({ platform: item, group: group.name })}
                    aria-label={`Learn more about ${item.name}`}
                  >
                    <span className="partner-card__front">
                      <span className="partner-card__name">{item.name}</span>
                      <span className="label-mono">{hostOf(item.website)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      {selected &&
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
                <p className="label-mono text-signal">{selected.group}</p>
                {logo && (
                  <div className="partner-modal__logo">
                    <img src={logo} alt={`${selected.platform.name} logo`} />
                  </div>
                )}
                <h3 id="partner-modal-title" className="display-lg mt-8">
                  {selected.platform.name}
                </h3>
                <p className="partner-modal__description">{selected.platform.description}</p>
                <a
                  className="partner-modal__link"
                  href={selected.platform.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more at {hostOf(selected.platform.website)}
                  <span aria-hidden="true"> ↗</span>
                </a>
                <p className="label-mono mt-10">{note}</p>
              </LetterGlow>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
