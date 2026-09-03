import { categories } from './catalog';

/**
 * Global navigation model, shared by the header, the full-screen mega-menu and
 * the footer. Sub-groups that carry an image + description power the mega-menu's
 * hover preview. All links are real routes — no homepage scroll anchors.
 */

export interface MegaLink {
  label: string;
  to: string;
  description?: string;
  image?: string;
}

export interface MegaSection {
  label: string;
  to: string;
  /** true => a "+" affordance; the panel expands its links */
  expandable: boolean;
  description: string;
  image: string;
  links?: MegaLink[];
}

const IMG = {
  reefer: '/industries/food-after.jpg',
  dry: '/industries/energy-after.jpg',
  pharma: '/industries/pharma-after.jpg',
  yard: '/industries/energy-before.jpg',
};

export const megaSections: MegaSection[] = [
  {
    label: 'Products',
    to: '/products',
    expandable: true,
    description: 'Refrigerated and dry containers, gensets, chassis, reefer units and parts.',
    image: IMG.reefer,
    links: categories.map((c) => ({
      label: c.label,
      to: `/products/${c.slug}`,
      description: c.intro,
      image: c.image,
    })),
  },
  {
    label: 'Rentals',
    to: '/rentals',
    expandable: true,
    description: 'Short- or long-term equipment, delivered ready to run, backed 24/7.',
    image: IMG.dry,
    links: [
      {
        label: 'Refrigerated Container Rentals',
        to: '/rentals#refrigerated',
        description: 'On-site cold storage for spikes, seasons and emergencies.',
        image: IMG.reefer,
      },
      {
        label: 'Dry Container Rentals',
        to: '/rentals#dry',
        description: 'Secure ground-level storage on flexible terms.',
        image: IMG.dry,
      },
      {
        label: 'Rental Process',
        to: '/rentals#process',
        description: 'From first call to delivery in four steps.',
        image: IMG.yard,
      },
      {
        label: 'Rental FAQ',
        to: '/rentals#faq',
        description: 'Terms, delivery, service and what happens at end of lease.',
        image: IMG.pharma,
      },
    ],
  },
  {
    label: 'Company',
    to: '/company',
    expandable: true,
    description: 'Who RAVA is, how we work and the people who keep equipment running.',
    image: IMG.yard,
    links: [
      { label: 'About RAVA', to: '/company', description: 'Built around what matters.', image: IMG.yard },
      { label: 'Services', to: '/services', description: 'Keeping your operation moving, 24/7.', image: IMG.pharma },
      { label: 'Resources', to: '/company#resources', description: 'Guidance for specifying and running the equipment.', image: IMG.dry },
      { label: 'Careers', to: '/company#careers', description: 'Join the technicians and logistics team.', image: IMG.reefer },
    ],
  },
  {
    label: 'Request A Quote',
    to: '/quote',
    expandable: false,
    description: 'Get a quote for containers, rentals, parts or services.',
    image: IMG.reefer,
  },
  {
    label: 'Contact',
    to: '/contact',
    expandable: false,
    description: 'Talk to RAVA — Miami office, Medley depot, phone and email.',
    image: IMG.dry,
  },
];

/** Compact list for the header bar + footer. */
export const primaryNav = megaSections.map((s) => ({ label: s.label, to: s.to }));
