export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  kicker: string;
  summary: string;
  specs: ProductSpec[];
  /** container variant flags for the shared 3D anchor */
  variant: 'reefer' | 'freezer' | 'dry' | 'genset' | 'chassis' | 'parts';
}

export const products: Product[] = [
  {
    id: 'refrigerated',
    name: 'Refrigerated Containers',
    kicker: 'Reefer',
    summary:
      'On-site cold storage that holds temperature through power swings, heat and constant door traffic — for rent or purchase, new or used.',
    specs: [
      { label: 'Length', value: '10 – 45 FT' },
      { label: 'Set point', value: '+25°C → −30°C' },
      { label: 'Profile', value: 'STANDARD / HIGH CUBE' },
      { label: 'Power', value: '230V 1PH / 460V 3PH' },
    ],
    variant: 'reefer',
  },
  {
    id: 'blast-freezer',
    name: 'Blast Freezers',
    kicker: 'Rapid pull-down',
    summary:
      'High-capacity refrigeration that drives product through the danger zone fast — built for processors, caterers and seasonal surge.',
    specs: [
      { label: 'Set point', value: 'DOWN TO −40°C' },
      { label: 'Pull-down', value: 'RAPID' },
      { label: 'Airflow', value: 'HIGH-VELOCITY' },
      { label: 'Use', value: 'PROCESSING / SURGE' },
    ],
    variant: 'freezer',
  },
  {
    id: 'dry',
    name: 'Dry Containers',
    kicker: 'Secure storage',
    summary:
      'Wind- and water-tight storage for equipment, inventory and materials — ground-level access, no dock required.',
    specs: [
      { label: 'Length', value: '10 – 40 FT' },
      { label: 'Profile', value: 'STANDARD / HIGH CUBE' },
      { label: 'Access', value: 'GROUND LEVEL' },
      { label: 'Condition', value: 'NEW / USED' },
    ],
    variant: 'dry',
  },
  {
    id: 'gensets',
    name: 'Gensets & Power',
    kicker: 'Independent power',
    summary:
      'Diesel gensets sized to the load so refrigerated equipment runs where grid power is unavailable, unreliable or still being connected.',
    specs: [
      { label: 'Mount', value: 'CLIP-ON / UNDERSLUNG' },
      { label: 'Runtime', value: 'EXTENDED TANK' },
      { label: 'Role', value: 'PRIMARY / BACKUP' },
      { label: 'Monitoring', value: 'AVAILABLE' },
    ],
    variant: 'genset',
  },
  {
    id: 'chassis',
    name: 'Chassis & Transport',
    kicker: 'Move it',
    summary:
      'Road-legal chassis and transport so a unit can be repositioned between sites as the operation changes.',
    specs: [
      { label: 'Type', value: 'TRI-AXLE / GOOSENECK' },
      { label: 'Rating', value: 'DOT COMPLIANT' },
      { label: 'Service', value: 'DELIVERY / SWAP' },
      { label: 'Coverage', value: 'REGIONAL' },
    ],
    variant: 'chassis',
  },
  {
    id: 'parts',
    name: 'Parts & Accessories',
    kicker: 'In-house',
    summary:
      'Refrigeration, genset, chassis and structural parts on the shelf — Carrier, Thermo King, Daikin, Star Cool and Taylor. Send a photo of the label; RAVA identifies it.',
    specs: [
      { label: 'Stock', value: 'IN-HOUSE' },
      { label: 'Brands', value: '5 MAJOR OEMs' },
      { label: 'Lookup', value: 'BY PHOTO' },
      { label: 'Dispatch', value: 'SAME DAY' },
    ],
    variant: 'parts',
  },
];
