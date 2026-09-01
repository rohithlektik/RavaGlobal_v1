/**
 * The real RAVA ONE finder is a 9-step flow
 * (product -> temp -> capacity -> reason -> duration -> zip -> placement -> power -> access).
 * Here it is distilled into a short guided cinematic sequence; each answer
 * moves the camera and re-dresses the environment around the container.
 */
export interface FinderStep {
  id: string;
  question: string;
  options: FinderOption[];
}

export interface FinderOption {
  label: string;
  /** environment key the 3D world shifts to */
  env: 'cold' | 'pharma' | 'neutral' | 'construction' | 'emergency' | 'logistics';
  note: string;
}

export const finderSteps: FinderStep[] = [
  {
    id: 'solve',
    question: 'What are you trying to solve?',
    options: [
      { label: 'Food', env: 'cold', note: 'Cold-chain storage that holds set point through door traffic.' },
      { label: 'Pharmaceuticals', env: 'pharma', note: 'Validated, monitored temperature control with alarming.' },
      { label: 'Storage', env: 'neutral', note: 'Secure, ground-level dry or chilled capacity — fast.' },
      { label: 'Construction', env: 'construction', note: 'On-site storage and workspace that moves with the job.' },
      { label: 'Emergency', env: 'emergency', note: 'Rapid-deploy refrigeration and power, staged and ready.' },
      { label: 'Other', env: 'logistics', note: 'Tell RAVA the operation — the equipment follows.' },
    ],
  },
  {
    id: 'duration',
    question: 'How long will you need it?',
    options: [
      { label: 'Days to weeks', env: 'emergency', note: 'Short-term spikes favour rental — delivered ready to run.' },
      { label: '1 – 12 months', env: 'logistics', note: 'Seasonal and project capacity, rented for the window.' },
      { label: 'Permanent', env: 'neutral', note: 'Ongoing capacity often favours purchase — RAVA compares both.' },
    ],
  },
  {
    id: 'power',
    question: 'What power is available on site?',
    options: [
      { label: '230V / 460V grid', env: 'neutral', note: 'Plug-and-run once the disconnect is confirmed.' },
      { label: 'Generator', env: 'construction', note: 'RAVA sizes a genset to the load — primary or backup.' },
      { label: 'None yet', env: 'emergency', note: 'Clip-on power ships with the unit so day one is covered.' },
    ],
  },
];

export const finderResult = {
  title: 'Your RAVA solution',
  body:
    'A temperature-controlled RAVA unit, sized to usable operating capacity, matched to your duration, power and site — delivered, commissioned and backed by 24/7 service.',
  cta: 'Talk to RAVA',
};
