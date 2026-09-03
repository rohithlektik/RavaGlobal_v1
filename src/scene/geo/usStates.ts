import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { FileLoader, Vector3 } from 'three';

/**
 * Loads and normalises `public/geo/us-states.json` (a slimmed low-res GeoJSON
 * FeatureCollection of the 50 states + DC + PR) into a flat list of named rings
 * ready to project onto the coverage globe. Suspends via `useLoader` while the
 * file downloads, so it must render inside a <Suspense> boundary.
 */

const GEO_URL = '/geo/us-states.json';
const D2R = Math.PI / 180;

export interface StateShape {
  name: string;
  /** outer boundary rings, each an array of [lon, lat] pairs */
  rings: number[][][];
  /** the single largest ring (for the fill triangulation) */
  outer: number[][];
}

/** Standard lat/lon → position on a sphere of radius `r`. */
export function latLonToVec3(lat: number, lon: number, r: number, target = new Vector3()): Vector3 {
  const phi = (90 - lat) * D2R;
  const theta = (lon + 180) * D2R;
  return target.set(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

type GeoJson = {
  features: {
    properties: { name: string };
    geometry:
      | { type: 'Polygon'; coordinates: number[][][] }
      | { type: 'MultiPolygon'; coordinates: number[][][][] };
  }[];
};

function ringArea(ring: number[][]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(a / 2);
}

export function useUSStates(): StateShape[] {
  const raw = useLoader(FileLoader, GEO_URL) as string;

  return useMemo(() => {
    const geo: GeoJson = JSON.parse(raw);
    return geo.features.map((f) => {
      const rings: number[][][] = [];
      if (f.geometry.type === 'Polygon') {
        rings.push(f.geometry.coordinates[0]);
      } else {
        for (const poly of f.geometry.coordinates) rings.push(poly[0]);
      }
      let outer = rings[0] ?? [];
      let best = -1;
      for (const r of rings) {
        const area = ringArea(r);
        if (area > best) {
          best = area;
          outer = r;
        }
      }
      return { name: f.properties.name, rings, outer };
    });
  }, [raw]);
}

useLoader.preload(FileLoader, GEO_URL);
