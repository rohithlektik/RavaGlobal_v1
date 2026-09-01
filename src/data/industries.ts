export interface Industry {
  name: string;
  body: string;
  gear: string;
}

export const industries: Industry[] = [
  {
    name: 'Food & cold chain',
    body: 'Supermarkets, processors and distributors — capacity that holds set point through heat, power swings and constant door traffic.',
    gear: 'Reefer · Blast freezer',
  },
  {
    name: 'Pharmaceutical',
    body: 'Validated, continuously monitored temperature control with alarming, for manufacturers, hospitals and nursing homes.',
    gear: 'Reefer · Monitoring',
  },
  {
    name: 'Construction',
    body: 'Secure on-site storage and workspace that relocates as the site changes — ground-level access, no dock required.',
    gear: 'Dry · Office · Genset',
  },
  {
    name: 'Emergency & government',
    body: 'Rapid-deploy refrigeration and power, staged and ready — in use by facilities including the American Red Cross and FEMA.',
    gear: 'Reefer · Genset · Transport',
  },
  {
    name: 'Logistics',
    body: 'Overflow and buffer capacity at the dock, the yard or the port — positioned where the network needs it.',
    gear: 'Reefer · Dry · Chassis',
  },
];
