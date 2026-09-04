import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const CLOSE_MS = 260;

/**
 * Shared overlay "page": opens over the current page (dimmed backdrop, panel
 * shadow) and hosts detail content. Close via the ×, clicking the backdrop
 * or pressing Escape — the panel animates out before unmounting.
 */
export function Overlay({
  open,
  onRequestClose,
  bar,
  labelledBy,
  closeLabel = "Close",
  children,
}: {
  open: boolean;
  onRequestClose: () => void;
  bar: ReactNode;
  labelledBy?: string;
  closeLabel?: string;
  children: ReactNode;
}) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  const requestClose = () => {
    if (closingRef.current || !open) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => {
      closingRef.current = false;
      setClosing(false);
      onRequestClose();
    }, CLOSE_MS);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted || (!open && !closing)) return null;

  return createPortal(
    <div
      className="pkg-modal"
      data-closing={closing ? "true" : undefined}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        className="pkg-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <div className="pkg-panel__bar">
          {bar}
          <button
            type="button"
            className="pkg-close"
            onClick={requestClose}
            aria-label={closeLabel}
            autoFocus
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="pkg-panel__scroll">
          <div className="pkg-panel__body">{children}</div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
