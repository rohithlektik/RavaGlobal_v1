interface Props {
  name: 'rent' | 'buy';
  className?: string;
}

/**
 * A matched pair of line glyphs for the Rent / Buy paths — the same corrugated
 * container, shown in two contexts: Rent wrapped in a turnaround arrow (comes
 * and goes), Buy set on permanent footings (rooted, built on).
 */
export function RentBuyGlyph({ name, className }: Props) {
  const common = {
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  if (name === 'rent') {
    return (
      <svg {...common}>
        <rect x="7" y="26" width="38" height="21" rx="1.5" />
        <path d="M15 26v21M23 26v21M31 26v21M39 26v21" />
        <path d="M44 14a14 14 0 1 1-13-5" />
        <path d="M45 7v8h-8" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="13" y="12" width="38" height="21" rx="1.5" />
      <path d="M21 12v21M29 12v21M37 12v21M45 12v21" />
      <path d="M9 39h46" />
      <path d="M16 39v11M27 39v11M38 39v11M49 39v11" />
    </svg>
  );
}
