import type { ReactElement } from 'react';

/** Single-stroke glyphs for the solution-finder options (viewBox 0 0 48 48). */
const ICONS: Record<string, ReactElement> = {
  food: (
    <>
      <path d="M24 13c3-6 12-6 13 2 1 9-6 18-13 20-7-2-14-11-13-20 1-8 10-8 13-2Z" />
      <path d="M24 13c0-3 2-6 5-7" />
    </>
  ),
  pharma: (
    <>
      <rect x="9" y="21" width="30" height="14" rx="7" />
      <path d="M24 21v14M9 28h30" />
    </>
  ),
  storage: (
    <>
      <rect x="7" y="19" width="16" height="16" rx="1" />
      <rect x="25" y="19" width="16" height="16" rx="1" />
      <rect x="16" y="9" width="16" height="10" rx="1" />
    </>
  ),
  construction: (
    <>
      <path d="M10 34a14 14 0 0 1 28 0" />
      <path d="M18 20c0-4 2-7 6-7s6 3 6 7v3H18v-3Z" />
      <path d="M7 34h34" />
    </>
  ),
  emergency: (
    <>
      <path d="M24 6 8 12v10c0 11 7 17 16 20 9-3 16-9 16-20V12L24 6Z" />
      <path d="M24 17v9M24 30v.5" />
    </>
  ),
  other: (
    <>
      <circle cx="14" cy="24" r="2" />
      <circle cx="24" cy="24" r="2" />
      <circle cx="34" cy="24" r="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="15" />
      <path d="M24 15v9.5l6.5 4" />
    </>
  ),
  calendar: (
    <>
      <rect x="9" y="12" width="30" height="27" rx="2" />
      <path d="M9 20h30M17 9v6M31 9v6" />
    </>
  ),
  infinity: (
    <path d="M16 24c0-4 3-7 7-7s5 3 8 7 5 7 8 7 7-3 7-7-3-7-7-7-5 3-8 7-5 7-8 7-7-3-7-7Z" />
  ),
  plug: (
    <>
      <path d="M18 8v10M30 8v10" />
      <path d="M13 18h22v4a11 11 0 0 1-22 0v-4Z" />
      <path d="M24 33v8" />
    </>
  ),
  generator: (
    <>
      <rect x="8" y="16" width="32" height="20" rx="2" />
      <path d="M15 16v-4h8v4M26 26l-4 6h6l-4 6" />
    </>
  ),
  nopower: (
    <>
      <path d="M26 6 14 26h9l-2 16 15-22h-9l3-14Z" />
      <path d="M9 9 39 39" />
    </>
  ),
};

export function FinderIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name] ?? ICONS.other}
    </svg>
  );
}
