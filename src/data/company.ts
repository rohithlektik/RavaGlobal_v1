/**
 * Verified RAVA Group facts — the single place real company data lives.
 * Sourced from RAVA scoping material + brand guidelines. No invented claims.
 */
export const company = {
  name: 'RAVA Group',
  legalName: 'RAVA Group Container Services',
  phone: '(800) 828-5318',
  phoneHref: 'tel:+18008285318',
  support: '24/7 · 365 days a year',
  founders: ['Randy Vargas', 'Wendy Vargas'],
  hq: {
    label: 'Miami, Florida',
    address: '11149 NW 122nd St, Miami, FL 33178',
  },
  regions: [
    { name: 'Miami, FL', role: 'Headquarters & container depot', kind: 'hq' as const, x: 0.5, y: 0.62 },
    { name: 'Tampa, FL', role: 'Expansion on the horizon', kind: 'planned' as const, x: 0.44, y: 0.5 },
    { name: 'Dominican Republic', role: 'International operations', kind: 'intl' as const, x: 0.66, y: 0.44 },
    { name: 'Colombia', role: 'International operations', kind: 'intl' as const, x: 0.6, y: 0.12 },
    { name: 'Caribbean & South America', role: 'Distribution reach', kind: 'reach' as const, x: 0.7, y: 0.28 },
  ],
  equipmentBrands: ['Carrier', 'Thermo King', 'Daikin', 'Star Cool', 'Taylor'],
  trustedBy: [
    'Hospitals',
    'Supermarkets',
    'Pharmaceutical manufacturers',
    'Food manufacturers',
    'Nursing homes',
    'Government facilities',
    'American Red Cross',
    'FEMA',
  ],
} as const;
