interface Props {
  variant?: 'white' | 'color';
  className?: string;
  height?: number;
}

/**
 * The real RAVA Group lockup, used verbatim from the supplied brand file.
 * `white` is the guidelines-sanctioned 1-colour treatment for dark surfaces.
 */
export function Logo({ variant = 'white', className = '', height = 44 }: Props) {
  const src = variant === 'white' ? '/brand/rava-logo-white.png' : '/brand/rava-logo.png';
  return (
    <img
      src={src}
      alt="RAVA Group"
      className={className}
      style={{ height, width: 'auto' }}
      decoding="async"
    />
  );
}
