import type { ReactElement } from 'react';

/** Minimal single-stroke glyphs, one per RAVA-world category. */
const ICONS: Record<string, ReactElement> = {
  container: (
    <>
      <rect x="5" y="14" width="38" height="20" rx="1" />
      <path d="M13 14v20M21 14v20M29 14v20M37 14v20" />
    </>
  ),
  truck: (
    <>
      <path d="M4 31V15h20v16M24 21h8l6 6v4H24" />
      <circle cx="14" cy="35" r="3" />
      <circle cx="32" cy="35" r="3" />
    </>
  ),
  bolt: <path d="M27 5 12 27h10l-3 16 17-25H23l4-13Z" />,
  gear: (
    <>
      <circle cx="24" cy="24" r="6" />
      <path d="M24 9V5M24 43v-4M39 24h4M5 24h4M34.6 34.6l2.8 2.8M10.6 10.6l2.8 2.8M34.6 13.4l2.8-2.8M10.6 37.4l2.8-2.8" />
    </>
  ),
  wrench: <path d="M32 11a7.5 7.5 0 0 0-9.9 9L9 33l6 6 13-13.1A7.5 7.5 0 0 0 37 16l-4.5 4.5-4-4L33 12Z" />,
  clock: (
    <>
      <circle cx="24" cy="24" r="15" />
      <path d="M24 15v9.5l6.5 4" />
    </>
  ),
};

/**
 * A small branded tile that swings open in 3D (rotateY, hinged on its left edge)
 * with a left-to-right clip wipe on the glyph as its `.world-item` scrolls into
 * view. Reveal is CSS-driven off the parent `.is-in` class.
 */
export function SpinReveal({ icon }: { icon: string }) {
  return (
    <div className="spin-reveal" aria-hidden="true">
      <div className="spin-reveal__tile">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICONS[icon] ?? ICONS.container}
        </svg>
      </div>
    </div>
  );
}
