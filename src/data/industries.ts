export interface Industry {
  id: string;
  index: string;
  /** headline split into display lines */
  name: string[];
  descriptor: string;
  /** one-line RAVA solution, revealed with the "after" state */
  solution: string;
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}

/**
 * Exactly three. Each is a Before -> After story: the industry's challenge on
 * the left of the stage, the RAVA solution revealed from within it on hover.
 *
 * Drop the six photographs into  public/industries/  with these exact names
 * (see public/industries/README.md). Until they are present the stage falls
 * back to a tinted panel so the layout still reads.
 */
export const industries: Industry[] = [
  {
    id: 'food',
    index: '01',
    name: ['Food &', 'Beverages'],
    descriptor: 'Temperature-controlled logistics',
    solution: 'Temperature-controlled storage and transport.',
    before: '/industries/food-before.jpg',
    after: '/industries/food-after.jpg',
    beforeAlt: 'A high-volume frozen-meal production line under temperature-controlled storage.',
    afterAlt: 'A RAVA refrigerated container loaded with palletised frozen product, doors open.',
  },
  {
    id: 'energy',
    index: '02',
    name: ['Energy &', 'Power'],
    descriptor: 'Mobile infrastructure for the field',
    solution: 'Reliable mobile infrastructure for demanding environments.',
    before: '/industries/energy-before.jpg',
    after: '/industries/energy-after.jpg',
    beforeAlt: 'Field crew working a remote substation with equipment staged on the wet ground.',
    afterAlt: 'A RAVA container fitted out as an on-site equipment and parts store beside the substation.',
  },
  {
    id: 'pharma',
    index: '03',
    name: ['Pharma-', 'ceuticals'],
    descriptor: 'Validated cold-chain environments',
    solution: 'Controlled environments for sensitive products.',
    before: '/industries/pharma-before.jpg',
    after: '/industries/pharma-after.jpg',
    beforeAlt: 'A pharmaceutical warehouse with technicians handling temperature-sensitive stock.',
    afterAlt: 'A RAVA refrigerated container serving as a validated cold store for pharmaceutical product.',
  },
];
