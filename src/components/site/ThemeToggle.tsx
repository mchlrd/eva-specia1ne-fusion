// The theme control. Two shapes of one state: a three-way switch — follow the
// device, or pin light or dark — where the header has room for it, and a compact
// flip in the narrow bar, where three taps' worth of hit area does not fit.
//
// Neither decides anything itself. `theme-store.ts` owns the state, and the
// inline script in the document head owns the first paint, so the control can
// never be out of step with the colours on the page.
import { useSyncExternalStore, type ReactElement } from "react";

import {
  setThemeChoice,
  subscribeTheme,
  themeChoices,
  themeServerSnapshot,
  themeSnapshot,
  type Theme,
  type ThemeChoice,
} from "./theme-store";

const LABELS: Record<ThemeChoice, string> = {
  system: "Match device",
  light: "Light",
  dark: "Dark",
};

function useTheme() {
  return useSyncExternalStore(subscribeTheme, themeSnapshot, themeServerSnapshot);
}

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M20.1 14.6A8.5 8.5 0 0 1 9.4 3.9a8.5 8.5 0 1 0 10.7 10.7Z" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <rect x="2.8" y="4.4" width="18.4" height="12.2" rx="1.4" />
      <path d="M9 20.2h6M12 16.6v3.6" />
    </svg>
  );
}

const ICONS: Record<ThemeChoice, () => ReactElement> = {
  system: DeviceIcon,
  light: SunIcon,
  dark: MoonIcon,
};

/**
 * Three-way switch. `className` carries the layout, because the stylesheet
 * deliberately leaves `display` to whoever places it.
 */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { choice } = useTheme();

  return (
    <div className={`theme-switch ${className}`} role="group" aria-label="Theme">
      {themeChoices.map((option) => {
        const Icon = ICONS[option];
        return (
          <button
            key={option}
            type="button"
            className="theme-switch__option"
            aria-pressed={choice === option}
            title={LABELS[option]}
            onClick={() => setThemeChoice(option)}
          >
            <Icon />
            <span className="sr-only">{LABELS[option]}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact two-state flip for the narrow header. Picking a theme by hand is a
 * choice, so this leaves "follow the device" behind — the three-way switch is
 * where that is offered, and it is one tap away in the menu.
 */
export function ThemeFlip({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const next: Theme = isDark ? "light" : "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className={`theme-flip ${className}`}
      data-theme={theme}
      title={label}
      aria-label={label}
      onClick={() => setThemeChoice(next)}
    >
      <span className="theme-flip__ghost" aria-hidden="true">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
      <span className="theme-flip__thumb" aria-hidden="true">
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
