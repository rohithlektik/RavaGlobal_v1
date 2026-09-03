/**
 * RAVA product catalogue — data-driven so pages and the mega-menu render from
 * one source. This is a PROTOTYPE: ~3 representative products per category, with
 * category and product names taken from the live RAVA site. Specifications are
 * indicative and easy to extend/replace.
 *
 * Live reference: https://www.ravagroupcontainers.com/
 */

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string[]; // display lines, e.g. ['10′ Refrigerated', 'Container']
  short: string;
  keySpec: Spec;
  specs: Spec[];
  image: string;
  gallery: string[];
}

export interface Category {
  slug: string;
  /** short label used in the mega-menu list */
  label: string;
  /** display name, split into lines for the category hero */
  name: string[];
  eyebrow: string;
  intro: string;
  image: string;
  products: Product[];
}

const IMG = {
  reefer: '/industries/food-after.jpg',
  dry: '/industries/energy-after.jpg',
  pharma: '/industries/pharma-after.jpg',
  line: '/industries/food-before.jpg',
  yard: '/industries/energy-before.jpg',
};

export const categories: Category[] = [
  {
    slug: 'refrigerated-containers',
    label: 'Refrigerated Containers',
    name: ['Refrigerated', 'Containers'],
    eyebrow: 'Products',
    intro:
      'Reliable cold storage wherever your operation needs it — units that hold temperature through power swings, heat and constant door traffic, for rent or purchase, new or used.',
    image: IMG.reefer,
    products: [
      {
        slug: '10ft-refrigerated-container',
        name: ["10′ Refrigerated", 'Container'],
        short: 'Compact cold storage for tight sites and lower volumes — ground-level, plug-and-run.',
        keySpec: { label: 'Set point', value: '+25°C → −30°C' },
        specs: [
          { label: 'Length', value: "10′" },
          { label: 'Set point', value: '+25°C → −30°C' },
          { label: 'Power', value: '230V 1PH' },
          { label: 'Condition', value: 'New / Used' },
        ],
        image: IMG.reefer,
        gallery: [IMG.reefer, IMG.line, IMG.pharma],
      },
      {
        slug: '20ft-refrigerated-container',
        name: ["20′ Refrigerated", 'Container'],
        short: 'The workhorse reefer — the balance of capacity and footprint most operations start with.',
        keySpec: { label: 'Set point', value: '+25°C → −30°C' },
        specs: [
          { label: 'Length', value: "20′" },
          { label: 'Set point', value: '+25°C → −30°C' },
          { label: 'Power', value: '230V 1PH / 460V 3PH' },
          { label: 'Profile', value: 'Standard / High Cube' },
        ],
        image: IMG.reefer,
        gallery: [IMG.reefer, IMG.line, IMG.pharma],
      },
      {
        slug: '40ft-refrigerated-container',
        name: ["40′ Refrigerated", 'Container'],
        short: 'Maximum on-site cold capacity in a single drop — for processors, distributors and surge.',
        keySpec: { label: 'Set point', value: '+25°C → −30°C' },
        specs: [
          { label: 'Length', value: "40′ High Cube" },
          { label: 'Set point', value: '+25°C → −30°C' },
          { label: 'Power', value: '460V 3PH' },
          { label: 'Condition', value: 'New / Used' },
        ],
        image: IMG.reefer,
        gallery: [IMG.reefer, IMG.line, IMG.pharma],
      },
    ],
  },
  {
    slug: 'dry-containers',
    label: 'Dry Shipping Containers',
    name: ['Dry Shipping', 'Containers'],
    eyebrow: 'Products',
    intro:
      'Wind- and water-tight storage for equipment, inventory and materials — ground-level access, no dock required, new or used.',
    image: IMG.dry,
    products: [
      {
        slug: '20ft-dry-container',
        name: ["20′ Dry", 'Container'],
        short: 'Secure ground-level storage that arrives ready to load.',
        keySpec: { label: 'Length', value: "20′" },
        specs: [
          { label: 'Length', value: "20′" },
          { label: 'Profile', value: 'Standard' },
          { label: 'Access', value: 'Ground level' },
          { label: 'Condition', value: 'New / Used' },
        ],
        image: IMG.dry,
        gallery: [IMG.dry, IMG.yard, IMG.reefer],
      },
      {
        slug: '40ft-dry-container',
        name: ["40′ Dry", 'Container'],
        short: 'Double the footprint for bulk storage and staging.',
        keySpec: { label: 'Length', value: "40′ High Cube" },
        specs: [
          { label: 'Length', value: "40′ High Cube" },
          { label: 'Profile', value: 'High Cube' },
          { label: 'Access', value: 'Ground level' },
          { label: 'Condition', value: 'New / Used' },
        ],
        image: IMG.dry,
        gallery: [IMG.dry, IMG.yard, IMG.reefer],
      },
      {
        slug: 'dry-office-container',
        name: ['Dry Office', 'Container'],
        short: 'A converted container fitted out as on-site workspace.',
        keySpec: { label: 'Use', value: 'Workspace / storage' },
        specs: [
          { label: 'Length', value: "20′ / 40′" },
          { label: 'Fit-out', value: 'Office / combo' },
          { label: 'Access', value: 'Ground level' },
          { label: 'Condition', value: 'New / Used' },
        ],
        image: IMG.dry,
        gallery: [IMG.dry, IMG.yard, IMG.reefer],
      },
    ],
  },
  {
    slug: 'gensets',
    label: 'Gensets',
    name: ['Gensets'],
    eyebrow: 'Products',
    intro:
      'Diesel gensets sized to the load so refrigerated equipment runs where grid power is unavailable, unreliable or still being connected.',
    image: IMG.yard,
    products: [
      {
        slug: 'clip-on-genset',
        name: ['Clip-On', 'Genset'],
        short: 'Mounts to the front of a reefer container for road or yard power.',
        keySpec: { label: 'Mount', value: 'Clip-on' },
        specs: [
          { label: 'Mount', value: 'Clip-on' },
          { label: 'Runtime', value: 'Extended tank' },
          { label: 'Role', value: 'Primary / backup' },
          { label: 'Monitoring', value: 'Available' },
        ],
        image: IMG.yard,
        gallery: [IMG.yard, IMG.dry, IMG.reefer],
      },
      {
        slug: 'underslung-genset',
        name: ['Underslung', 'Genset'],
        short: 'Fits beneath the chassis for a clean over-the-road profile.',
        keySpec: { label: 'Mount', value: 'Underslung' },
        specs: [
          { label: 'Mount', value: 'Underslung' },
          { label: 'Runtime', value: 'Extended tank' },
          { label: 'Role', value: 'Transport power' },
          { label: 'Monitoring', value: 'Available' },
        ],
        image: IMG.yard,
        gallery: [IMG.yard, IMG.dry, IMG.reefer],
      },
      {
        slug: 'diesel-power-genset',
        name: ['Diesel Power', 'Genset'],
        short: 'Standalone site power for reefers, tools and temporary facilities.',
        keySpec: { label: 'Role', value: 'Site power' },
        specs: [
          { label: 'Mount', value: 'Skid / trailer' },
          { label: 'Runtime', value: 'Extended tank' },
          { label: 'Role', value: 'Primary / backup' },
          { label: 'Monitoring', value: 'Available' },
        ],
        image: IMG.yard,
        gallery: [IMG.yard, IMG.dry, IMG.reefer],
      },
    ],
  },
  {
    slug: 'chassis',
    label: 'Chassis',
    name: ['Chassis'],
    eyebrow: 'Products',
    intro:
      'Road-legal chassis and transport so a unit can be repositioned between sites as the operation changes.',
    image: IMG.dry,
    products: [
      {
        slug: '20ft-chassis',
        name: ["20′", 'Chassis'],
        short: 'For moving a single 20′ container between sites.',
        keySpec: { label: 'Type', value: "20′ tandem" },
        specs: [
          { label: 'Type', value: "20′ tandem" },
          { label: 'Rating', value: 'DOT compliant' },
          { label: 'Service', value: 'Delivery / swap' },
          { label: 'Coverage', value: 'Regional' },
        ],
        image: IMG.dry,
        gallery: [IMG.dry, IMG.yard, IMG.reefer],
      },
      {
        slug: '40ft-chassis',
        name: ["40′", 'Chassis'],
        short: 'Tri-axle / gooseneck chassis for 40′ units.',
        keySpec: { label: 'Type', value: 'Tri-axle / gooseneck' },
        specs: [
          { label: 'Type', value: 'Tri-axle / gooseneck' },
          { label: 'Rating', value: 'DOT compliant' },
          { label: 'Service', value: 'Delivery / swap' },
          { label: 'Coverage', value: 'Regional' },
        ],
        image: IMG.dry,
        gallery: [IMG.dry, IMG.yard, IMG.reefer],
      },
      {
        slug: 'dock-high-chassis',
        name: ['Dock High', 'Chassis'],
        short: 'Raises the container to dock height for direct loading.',
        keySpec: { label: 'Type', value: 'Dock high' },
        specs: [
          { label: 'Type', value: 'Dock high' },
          { label: 'Rating', value: 'DOT compliant' },
          { label: 'Service', value: 'Delivery / swap' },
          { label: 'Coverage', value: 'Regional' },
        ],
        image: IMG.dry,
        gallery: [IMG.dry, IMG.yard, IMG.reefer],
      },
    ],
  },
  {
    slug: 'refrigeration-units',
    label: 'Refrigeration Units',
    name: ['Refrigeration', 'Units'],
    eyebrow: 'Products',
    intro:
      'Reefer machinery from the major OEMs — supplied, installed and serviced by RAVA’s factory-trained technicians.',
    image: IMG.pharma,
    products: [
      {
        slug: 'carrier-reefer-unit',
        name: ['Carrier', 'Reefer Unit'],
        short: 'Container refrigeration units from Carrier.',
        keySpec: { label: 'Brand', value: 'Carrier' },
        specs: [
          { label: 'Brand', value: 'Carrier' },
          { label: 'Application', value: 'Container' },
          { label: 'Service', value: 'In-house technicians' },
          { label: 'Parts', value: 'In-house depot' },
        ],
        image: IMG.pharma,
        gallery: [IMG.pharma, IMG.reefer, IMG.line],
      },
      {
        slug: 'thermo-king-reefer-unit',
        name: ['Thermo King', 'Reefer Unit'],
        short: 'Container refrigeration units from Thermo King.',
        keySpec: { label: 'Brand', value: 'Thermo King' },
        specs: [
          { label: 'Brand', value: 'Thermo King' },
          { label: 'Application', value: 'Container' },
          { label: 'Service', value: 'In-house technicians' },
          { label: 'Parts', value: 'In-house depot' },
        ],
        image: IMG.pharma,
        gallery: [IMG.pharma, IMG.reefer, IMG.line],
      },
      {
        slug: 'daikin-reefer-unit',
        name: ['Daikin', 'Reefer Unit'],
        short: 'Container refrigeration units from Daikin.',
        keySpec: { label: 'Brand', value: 'Daikin' },
        specs: [
          { label: 'Brand', value: 'Daikin' },
          { label: 'Application', value: 'Container' },
          { label: 'Service', value: 'In-house technicians' },
          { label: 'Parts', value: 'In-house depot' },
        ],
        image: IMG.pharma,
        gallery: [IMG.pharma, IMG.reefer, IMG.line],
      },
    ],
  },
  {
    slug: 'truck-units',
    label: 'Truck Units',
    name: ['Truck', 'Units'],
    eyebrow: 'Products',
    intro: 'Truck and trailer refrigeration for temperature-controlled distribution.',
    image: IMG.reefer,
    products: [
      {
        slug: 'single-temp-truck-unit',
        name: ['Single-Temp', 'Truck Unit'],
        short: 'One temperature zone for straight cold or frozen loads.',
        keySpec: { label: 'Zones', value: 'Single' },
        specs: [
          { label: 'Zones', value: 'Single temperature' },
          { label: 'Application', value: 'Truck / trailer' },
          { label: 'Service', value: 'In-house technicians' },
          { label: 'Parts', value: 'In-house depot' },
        ],
        image: IMG.reefer,
        gallery: [IMG.reefer, IMG.line, IMG.pharma],
      },
      {
        slug: 'multi-temp-truck-unit',
        name: ['Multi-Temp', 'Truck Unit'],
        short: 'Multiple zones for mixed cold, frozen and ambient on one vehicle.',
        keySpec: { label: 'Zones', value: 'Multi' },
        specs: [
          { label: 'Zones', value: 'Multi temperature' },
          { label: 'Application', value: 'Truck / trailer' },
          { label: 'Service', value: 'In-house technicians' },
          { label: 'Parts', value: 'In-house depot' },
        ],
        image: IMG.reefer,
        gallery: [IMG.reefer, IMG.line, IMG.pharma],
      },
      {
        slug: 'electric-standby-truck-unit',
        name: ['Electric Standby', 'Truck Unit'],
        short: 'Plug-in standby holds temperature without running the engine.',
        keySpec: { label: 'Standby', value: 'Electric' },
        specs: [
          { label: 'Standby', value: 'Electric' },
          { label: 'Application', value: 'Truck / trailer' },
          { label: 'Service', value: 'In-house technicians' },
          { label: 'Parts', value: 'In-house depot' },
        ],
        image: IMG.reefer,
        gallery: [IMG.reefer, IMG.line, IMG.pharma],
      },
    ],
  },
  {
    slug: 'power-packs',
    label: 'Power Packs',
    name: ['Power', 'Packs'],
    eyebrow: 'Products',
    intro: 'Portable and standby power to keep refrigerated equipment running.',
    image: IMG.yard,
    products: [
      {
        slug: 'portable-power-pack',
        name: ['Portable', 'Power Pack'],
        short: 'Moves with the equipment for day-one power on any site.',
        keySpec: { label: 'Role', value: 'Portable' },
        specs: [
          { label: 'Role', value: 'Portable' },
          { label: 'Runtime', value: 'Extended tank' },
          { label: 'Use', value: 'Primary / backup' },
          { label: 'Monitoring', value: 'Available' },
        ],
        image: IMG.yard,
        gallery: [IMG.yard, IMG.dry, IMG.reefer],
      },
      {
        slug: 'standby-power-pack',
        name: ['Standby', 'Power Pack'],
        short: 'Holds the load when grid power drops.',
        keySpec: { label: 'Role', value: 'Standby' },
        specs: [
          { label: 'Role', value: 'Standby' },
          { label: 'Transfer', value: 'Automatic' },
          { label: 'Use', value: 'Backup' },
          { label: 'Monitoring', value: 'Available' },
        ],
        image: IMG.yard,
        gallery: [IMG.yard, IMG.dry, IMG.reefer],
      },
      {
        slug: 'container-power-pack',
        name: ['Container', 'Power Pack'],
        short: 'Containerised power for larger or multi-unit sites.',
        keySpec: { label: 'Role', value: 'Site power' },
        specs: [
          { label: 'Role', value: 'Site power' },
          { label: 'Runtime', value: 'Extended tank' },
          { label: 'Use', value: 'Primary / backup' },
          { label: 'Monitoring', value: 'Available' },
        ],
        image: IMG.yard,
        gallery: [IMG.yard, IMG.dry, IMG.reefer],
      },
    ],
  },
  {
    slug: 'parts',
    label: 'Parts',
    name: ['Parts'],
    eyebrow: 'Products',
    intro:
      'Refrigeration, genset, chassis and structural parts on the shelf — Carrier, Thermo King, Daikin, Star Cool and Taylor. Send a photo of the label; RAVA identifies it.',
    image: IMG.line,
    products: [
      {
        slug: 'reefer-parts',
        name: ['Reefer', 'Parts'],
        short: 'Compressors, controllers, sensors and consumables for reefer units.',
        keySpec: { label: 'Stock', value: 'In-house' },
        specs: [
          { label: 'Stock', value: 'In-house depot' },
          { label: 'Brands', value: '5 major OEMs' },
          { label: 'Lookup', value: 'By photo' },
          { label: 'Dispatch', value: 'Same day' },
        ],
        image: IMG.line,
        gallery: [IMG.line, IMG.pharma, IMG.reefer],
      },
      {
        slug: 'genset-parts',
        name: ['Genset', 'Parts'],
        short: 'Engine, alternator and control parts for clip-on and underslung gensets.',
        keySpec: { label: 'Stock', value: 'In-house' },
        specs: [
          { label: 'Stock', value: 'In-house depot' },
          { label: 'Brands', value: 'Major OEMs' },
          { label: 'Lookup', value: 'By photo' },
          { label: 'Dispatch', value: 'Same day' },
        ],
        image: IMG.line,
        gallery: [IMG.line, IMG.pharma, IMG.reefer],
      },
      {
        slug: 'structural-chassis-parts',
        name: ['Structural &', 'Chassis Parts'],
        short: 'Doors, seals, flooring, castings, tyres and running gear.',
        keySpec: { label: 'Stock', value: 'In-house' },
        specs: [
          { label: 'Stock', value: 'In-house depot' },
          { label: 'Scope', value: 'Structural / chassis' },
          { label: 'Lookup', value: 'By photo' },
          { label: 'Dispatch', value: 'Same day' },
        ],
        image: IMG.line,
        gallery: [IMG.line, IMG.pharma, IMG.reefer],
      },
    ],
  },
  {
    slug: 'remote-monitoring',
    label: 'Remote Monitoring & Global Tracking',
    name: ['Remote Monitoring', '& Global Tracking'],
    eyebrow: 'Products',
    intro:
      'Know where every unit is and what temperature it is holding — telematics and tracking across the fleet.',
    image: IMG.pharma,
    products: [
      {
        slug: 'reefer-telematics',
        name: ['Reefer', 'Telematics'],
        short: 'Live set point, return air and alarm status from each reefer.',
        keySpec: { label: 'Data', value: 'Temperature + status' },
        specs: [
          { label: 'Data', value: 'Set point / return air' },
          { label: 'Alerts', value: 'Threshold alarming' },
          { label: 'Access', value: 'Web / mobile' },
          { label: 'History', value: 'Logged' },
        ],
        image: IMG.pharma,
        gallery: [IMG.pharma, IMG.reefer, IMG.line],
      },
      {
        slug: 'gps-container-tracking',
        name: ['GPS Container', 'Tracking'],
        short: 'Location and movement history for every container in the field.',
        keySpec: { label: 'Data', value: 'Location + movement' },
        specs: [
          { label: 'Data', value: 'Location / movement' },
          { label: 'Geofencing', value: 'Available' },
          { label: 'Access', value: 'Web / mobile' },
          { label: 'History', value: 'Logged' },
        ],
        image: IMG.pharma,
        gallery: [IMG.pharma, IMG.reefer, IMG.line],
      },
      {
        slug: 'temperature-alarming',
        name: ['Temperature', 'Alarming'],
        short: 'Configurable alerts before product is at risk.',
        keySpec: { label: 'Alerts', value: 'Configurable' },
        specs: [
          { label: 'Alerts', value: 'Configurable thresholds' },
          { label: 'Channels', value: 'Email / SMS' },
          { label: 'Access', value: 'Web / mobile' },
          { label: 'History', value: 'Logged' },
        ],
        image: IMG.pharma,
        gallery: [IMG.pharma, IMG.reefer, IMG.line],
      },
    ],
  },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const findProduct = (categorySlug: string, productSlug: string) => {
  const cat = categoryBySlug(categorySlug);
  const product = cat?.products.find((p) => p.slug === productSlug);
  return product ? { cat, product } : null;
};
