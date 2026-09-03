import { useEffect, useMemo, useState } from 'react';
import { coverageLocations, highlightedStates } from '@/data/coverage';

/**
 * Static, WebGL-free stand-in for the Section 08 coverage globe. Renders the
 * same slimmed US-states GeoJSON as a flat SVG map with the RAVA coverage
 * states lifted and depot pins marked. Only mounted when `hasWebGL()` is false.
 */

const W = 960;
const H = 600;
// lower-48 bounding box — Alaska / Hawaii / PR are clipped, which is fine here
const LON_MIN = -125;
const LON_MAX = -66;
const LAT_MIN = 24;
const LAT_MAX = 50;

const project = (lon: number, lat: number): [number, number] => [
  ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W,
  ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H,
];

type Feat = {
  properties: { name: string };
  geometry:
    | { type: 'Polygon'; coordinates: number[][][] }
    | { type: 'MultiPolygon'; coordinates: number[][][][] };
};

function toPath(f: Feat): string {
  const polys =
    f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  let d = '';
  for (const poly of polys) {
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
      });
      d += 'Z ';
    }
  }
  return d;
}

export function CoverageFallback() {
  const [feats, setFeats] = useState<Feat[] | null>(null);
  const hi = useMemo(() => new Set(highlightedStates), []);

  useEffect(() => {
    let alive = true;
    fetch('/geo/us-states.json')
      .then((r) => r.json())
      .then((g) => alive && setFeats(g.features))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="coverage-fallback" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {feats?.map((f) => (
          <path
            key={f.properties.name}
            d={toPath(f)}
            fill={hi.has(f.properties.name) ? 'rgba(140,201,235,0.14)' : 'transparent'}
            stroke={hi.has(f.properties.name) ? 'rgba(140,201,235,0.75)' : 'rgba(59,80,112,0.4)'}
            strokeWidth={hi.has(f.properties.name) ? 1.1 : 0.6}
          />
        ))}
        {coverageLocations.map((l, i) => {
          const [x, y] = project(l.lon, l.lat);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={l.hub ? 9 : 6} fill="rgba(140,201,235,0.18)" />
              <circle cx={x} cy={y} r={l.hub ? 3 : 2.2} fill="#ffffff" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
