/**
 * RAVA coverage data for the Section 08 globe — kept separate from the render
 * logic so locations and highlighted states can be swapped without touching the
 * Three.js code.
 *
 *  - `coverageLocations` : depot / coverage nodes drawn as glowing pin points.
 *    `hub: true` marks the headquarters (Miami) for slightly stronger treatment.
 *  - `highlightedStates` : U.S. states given the subtle RAVA-blue illumination.
 *    Names must match `properties.name` in `public/geo/us-states.json`.
 *
 * Coordinates are approximate state / metro centroids — replace with real RAVA
 * facility coordinates when available.
 */

export interface CoverageLocation {
  /** display / lookup only — not rendered as a label */
  state: string;
  lat: number;
  lon: number;
  hub?: boolean;
}

export const coverageLocations: CoverageLocation[] = [
  { state: 'Florida', lat: 25.77, lon: -80.19, hub: true }, // Miami — HQ & depot
  { state: 'Florida', lat: 27.95, lon: -82.46 }, // Tampa
  { state: 'Georgia', lat: 33.75, lon: -84.39 }, // Atlanta
  { state: 'Texas', lat: 29.76, lon: -95.37 }, // Houston
  { state: 'Texas', lat: 32.78, lon: -96.8 }, // Dallas
  { state: 'Illinois', lat: 41.88, lon: -87.63 }, // Chicago
  { state: 'Colorado', lat: 39.74, lon: -104.99 }, // Denver
  { state: 'California', lat: 34.05, lon: -118.24 }, // Los Angeles
  { state: 'Washington', lat: 47.61, lon: -122.33 }, // Seattle
  { state: 'New York', lat: 40.71, lon: -74.01 }, // New York
  { state: 'North Carolina', lat: 35.23, lon: -80.84 }, // Charlotte
];

/** States lifted out of the subdued base map with RAVA-blue illumination. */
export const highlightedStates: string[] = [
  'Florida',
  'Georgia',
  'South Carolina',
  'North Carolina',
  'Texas',
  'Illinois',
  'Colorado',
  'California',
  'Washington',
  'New York',
  'Pennsylvania',
];

/** Great-circle context arcs radiate from this location (the HQ). */
export const coverageHub = coverageLocations.find((l) => l.hub) ?? coverageLocations[0];
