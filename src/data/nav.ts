export interface NavItem {
  label: string;
  href: string;
  index: string;
}

export const navItems: NavItem[] = [
  { label: 'Solutions', href: '#solutions', index: '01' },
  { label: 'Products', href: '#products', index: '02' },
  { label: 'Industries', href: '#industries', index: '03' },
  { label: 'Rent / Buy', href: '#rent-buy', index: '04' },
  { label: 'Service', href: '#service', index: '05' },
  { label: 'About', href: '#about', index: '06' },
];

export const primaryCta = { label: 'Get a Quote', href: '#quote' };
export const secondaryCta = { label: 'Talk to RAVA', href: `tel:+18008285318` };
