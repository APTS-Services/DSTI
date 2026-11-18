import React, { useMemo, useState } from 'react';
import {
  Building2,
  FlaskConical,
  Map as MapIcon,
  MapPin,
  Table2,
} from 'lucide-react';

import { useCollection } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import apDistrictGeoJSON from '../../data/ap-districts-simplified.json';

// ============================================
// UNIQUE DISTRICT COLOURS
// ============================================

// Generate a repeatable colour from each district ID.
// New CMS districts receive a colour automatically.
function getDistrictColor(districtId) {
  const value = String(districtId || 'unknown');
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  const hue = hash % 360;
  const saturation = 48 + (hash % 15);
  const lightness = 76 + (hash % 7);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// ============================================
// DISTRICT MAP LABELS
// ============================================

const OFFICIAL_DISTRICT_NAMES = {
  allurisitharamaraju: 'Alluri Sitharama Raju',
  allurisithamararaju: 'Alluri Sitharama Raju',
  anakapalli: 'Anakapalli',
  ananthapuramu: 'Ananthapuramu',
  anantapuramu: 'Ananthapuramu',
  ananthapur: 'Ananthapuramu',
  annamayya: 'Annamayya',
  bapatla: 'Bapatla',
  chittoor: 'Chittoor',
  drbrambedkarkonaseema: 'Dr. B.R. Ambedkar Konaseema',
  konaseema: 'Dr. B.R. Ambedkar Konaseema',
  eastgodavari: 'East Godavari',
  eluru: 'Eluru',
  guntur: 'Guntur',
  kakinada: 'Kakinada',
  krishna: 'Krishna',
  kurnool: 'Kurnool',
  markapuram: 'Markapuram',
  nandyal: 'Nandyal',
  ntr: 'NTR',
  palnadu: 'Palnadu',
  parvathipurammanyam: 'Parvathipuram Manyam',
  parvathipuram: 'Parvathipuram Manyam',
  polavaram: 'Polavaram',
  prakasam: 'Prakasam',
  sripottisriramulunellore: 'Sri Potti Sriramulu Nellore',
  nellore: 'Sri Potti Sriramulu Nellore',
  srisathyasai: 'Sri Sathya Sai',
  srikakulam: 'Srikakulam',
  tirupati: 'Tirupati',
  tirupathi: 'Tirupati',
  visakhapatnam: 'Visakhapatnam',
  vizag: 'Visakhapatnam',
  vizianagaram: 'Vizianagaram',
  ysr: 'YSR',
  ysrkadapa: 'YSR',
};

// ============================================
// MAP DIMENSIONS
// ============================================

const MAP_WIDTH = 760;
const MAP_HEIGHT = 820;
const MAP_PADDING = 18;

// Admin-entered Map X / Map Y values use a 0-600 by 0-700
// coordinate range. Convert them into this SVG's viewBox.
function getAdminMapPosition(record) {
  const rawX =
    record.mapX ??
    record.map_x ??
    record.mapPosition?.x ??
    record.map_position?.x;

  const rawY =
    record.mapY ??
    record.map_y ??
    record.mapPosition?.y ??
    record.map_position?.y;

  if (
    rawX === null ||
    rawX === undefined ||
    rawX === '' ||
    rawY === null ||
    rawY === undefined ||
    rawY === ''
  ) {
    return null;
  }

  const x = Number(rawX);
  const y = Number(rawY);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    x < 0 ||
    x > 600 ||
    y < 0 ||
    y > 700
  ) {
    return null;
  }

  return [
    MAP_PADDING +
      (x / 600) * (MAP_WIDTH - MAP_PADDING * 2),
    MAP_PADDING +
      (y / 700) * (MAP_HEIGHT - MAP_PADDING * 2),
  ];
}

// ============================================
// DISTRICT NAME MATCHING
// ============================================

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const DISTRICT_ALIASES = {
  ananthapuram: 'anantapuramu',
  eastgodavari: 'eastgodavari',
  westgodavari: 'westgodavari',
  sripottisriramulunellore: 'nellore',
  srisathyasai: 'srisathyasai',
  ysr: 'ysrkadapa',
  konaseema: 'konaseema',
  // GeoJSON uses TIRUPATHI while the CMS may use Tirupati.
  tirupathi: 'tirupati',
};

function getDistrictRecord(feature, districts) {
  const rawName = normalizeName(
    feature.properties?.district
  );

  const alias = DISTRICT_ALIASES[rawName] || rawName;

  return districts.find((district) => {
    const id = normalizeName(district.id);

    const name = normalizeName(
      district.name?.en || district.name
    );

    return (
      id === alias ||
      name === alias ||
      id === rawName ||
      name === rawName
    );
  });
}

function getMapLabel(record, fallback, translate) {
  if (!record) {
    const normalizedFallback = normalizeName(fallback);
    return (
      OFFICIAL_DISTRICT_NAMES[normalizedFallback] ||
      fallback
    );
  }

  const translated = translate(record.name);

  // Keep the existing Telugu/localized display when Telugu is selected.
  if (/[^\u0000-\u007f]/.test(translated)) {
    return translated;
  }

  const normalizedId = normalizeName(record.id);
  const normalizedName = normalizeName(
    record.name?.en || record.name
  );
  const normalizedFallback = normalizeName(fallback);

  return (
    OFFICIAL_DISTRICT_NAMES[normalizedId] ||
    OFFICIAL_DISTRICT_NAMES[normalizedName] ||
    OFFICIAL_DISTRICT_NAMES[normalizedFallback] ||
    record.name?.en ||
    fallback
  );
}

// ============================================
// GEOJSON COORDINATES
// ============================================

function collectCoordinates(coordinates, points = []) {
  if (typeof coordinates[0] === 'number') {
    points.push(coordinates);
  } else {
    coordinates.forEach((item) => {
      collectCoordinates(item, points);
    });
  }

  return points;
}

const allCoordinates = apDistrictGeoJSON.features.flatMap(
  (feature) =>
    collectCoordinates(feature.geometry.coordinates)
);

const LONGITUDES = allCoordinates.map(
  (point) => point[0]
);

const LATITUDES = allCoordinates.map(
  (point) => point[1]
);

const MIN_LON = Math.min(...LONGITUDES);
const MAX_LON = Math.max(...LONGITUDES);
const MIN_LAT = Math.min(...LATITUDES);
const MAX_LAT = Math.max(...LATITUDES);

const MID_LAT = (MIN_LAT + MAX_LAT) / 2;

const COS_LAT = Math.cos(
  (MID_LAT * Math.PI) / 180
);

const PROJECTED_WIDTH =
  (MAX_LON - MIN_LON) * COS_LAT;

const PROJECTED_HEIGHT =
  MAX_LAT - MIN_LAT;

const SCALE = Math.min(
  (MAP_WIDTH - MAP_PADDING * 2) / PROJECTED_WIDTH,
  (MAP_HEIGHT - MAP_PADDING * 2) / PROJECTED_HEIGHT
);

const OFFSET_X =
  (MAP_WIDTH - PROJECTED_WIDTH * SCALE) / 2;

const OFFSET_Y =
  (MAP_HEIGHT - PROJECTED_HEIGHT * SCALE) / 2;

// ============================================
// GEOJSON PROJECTION
// ============================================

function projectCoordinate(coordinate) {
  const [longitude, latitude] = coordinate;

  return [
    OFFSET_X +
      (longitude - MIN_LON) * COS_LAT * SCALE,

    OFFSET_Y +
      (MAX_LAT - latitude) * SCALE,
  ];
}

function ringToPath(ring) {
  return (
    ring
      .map((coordinate, index) => {
        const [x, y] = projectCoordinate(coordinate);

        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ') + ' Z'
  );
}

function geometryToPath(geometry) {
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.coordinates;

  return polygons
    .map((polygon) =>
      polygon.map(ringToPath).join(' ')
    )
    .join(' ');
}

// ============================================
// DISTRICT LABEL POSITIONS
// ============================================

function ringCentroid(ring) {
  let area = 0;
  let x = 0;
  let y = 0;

  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];

    const cross = x1 * y2 - x2 * y1;

    area += cross;
    x += (x1 + x2) * cross;
    y += (y1 + y2) * cross;
  }

  if (Math.abs(area) < 1e-10) {
    const points = ring.slice(0, -1);

    return [
      points.reduce((sum, p) => sum + p[0], 0) /
        points.length,

      points.reduce((sum, p) => sum + p[1], 0) /
        points.length,
    ];
  }

  return [
    x / (3 * area),
    y / (3 * area),
  ];
}

function getLabelPosition(geometry) {
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.coordinates;

  const largestPolygon = polygons.reduce(
    (largest, polygon) => {
      return polygon[0].length > largest[0].length
        ? polygon
        : largest;
    },
    polygons[0]
  );

  return projectCoordinate(
    ringCentroid(largestPolygon[0])
  );
}

// ============================================
// LABEL COLLISION AVOIDANCE
// ============================================

function getLabelLayout(label) {
  const value = String(label || '');
  const fontSize = 10;
  const maxCharacters = 17;
  const lines = wrapLabel(value, maxCharacters);
  const lineHeight = 12;
  const textWidth = Math.max(
    44,
    Math.min(190, Math.max(...lines.map((line) => line.length)) * fontSize * 0.58 + 18)
  );
  const textHeight = Math.max(22, lines.length * lineHeight + 8);

  return { lines, fontSize, lineHeight, width: textWidth, height: textHeight };
}

function placeDistrictLabels(features) {
  const occupied = [];
  const positioned = new Map();

  // Build a dense set of possible label centres. Each label is assigned
  // the nearest free position, with a small safety gap around every box.
  // Unlike the previous best-effort layout, overlapping positions are
  // rejected completely.
  const gridPoints = [];
  const step = 12;

  for (let y = 28; y <= MAP_HEIGHT - 28; y += step) {
    for (let x = 28; x <= MAP_WIDTH - 28; x += step) {
      gridPoints.push([x, y]);
    }
  }

  // Place the largest labels first so short names cannot block them.
  const ordered = [...features].sort((a, b) => {
    const aLayout = getLabelLayout(a.label);
    const bLayout = getLabelLayout(b.label);
    return (bLayout.width * bLayout.height) -
      (aLayout.width * aLayout.height);
  });

  ordered.forEach((feature) => {
    const [baseX, baseY] = feature.labelPosition;
    const layout = getLabelLayout(feature.label);

    const candidates = [...gridPoints].sort((a, b) => {
      const distanceA = Math.hypot(a[0] - baseX, a[1] - baseY);
      const distanceB = Math.hypot(b[0] - baseX, b[1] - baseY);
      return distanceA - distanceB;
    });

    let chosen = null;

    for (const [x, y] of candidates) {
      const box = {
        left: x - layout.width / 2,
        right: x + layout.width / 2,
        top: y - layout.height / 2,
        bottom: y + layout.height / 2,
      };

      const hasOverlap = occupied.some((other) =>
        box.left < other.right + 7 &&
        box.right > other.left - 7 &&
        box.top < other.bottom + 7 &&
        box.bottom > other.top - 7
      );

      if (!hasOverlap) {
        chosen = { x, y, box };
        break;
      }
    }

    // The map has ample space for the current district count. This
    // fallback keeps a label visible if a future dataset becomes denser.
    if (!chosen) {
      const fallbackX = Math.max(
        layout.width / 2 + 5,
        Math.min(MAP_WIDTH - layout.width / 2 - 5, baseX)
      );
      const fallbackY = Math.max(
        layout.height / 2 + 5,
        Math.min(MAP_HEIGHT - layout.height / 2 - 5, baseY)
      );

      chosen = {
        x: fallbackX,
        y: fallbackY,
        box: {
          left: fallbackX - layout.width / 2,
          right: fallbackX + layout.width / 2,
          top: fallbackY - layout.height / 2,
          bottom: fallbackY + layout.height / 2,
        },
      };
    }

    occupied.push(chosen.box);
    positioned.set(feature.key, {
      ...feature,
      labelPosition: [chosen.x, chosen.y],
      labelAnchorPosition: [baseX, baseY],
      labelLayout: layout,
    });
  });

  return features.map((feature) =>
    positioned.get(feature.key) || feature
  );
}
// ============================================
// LABEL TEXT WRAPPING
// ============================================

function wrapLabel(label, maxCharacters) {
  const words = String(label).split(/\s+/);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (
      currentLine &&
      testLine.length > maxCharacters
    ) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// ============================================
// MAIN DISTRICT EXPLORER
// ============================================

export default function DistrictExplorer({
  initial,
  compact = false,
  showSummary = true,
  onDistrictSelect,
}) {
  const { t, tc } = useLanguage();

  const districts = useCollection('districts');
  const regions = useCollection('regions');

  const [view, setView] = useState('map');

  const [selected, setSelected] = useState(
    initial && districts.some((d) => d.id === initial)
      ? initial
      : districts[0]?.id
  );

  // ============================================
  // DISTRICT SELECTION
  // ============================================

  const handleDistrictSelect = (districtId) => {
    // Clicking the selected district again clears the selection.
    const nextDistrictId =
      selected === districtId ? null : districtId;

    setSelected(nextDistrictId);

    // Notify HomePage to show district details or Science Almanac.
    if (onDistrictSelect) {
      onDistrictSelect(nextDistrictId);
    }

    // Scroll only when a district is selected on the full explorer page.
    if (nextDistrictId && showSummary) {
      window.requestAnimationFrame(() => {
        document
          .getElementById('district-summary')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      });
    }
  };

  // ============================================
  // REGION LOOKUP
  // ============================================

  const regionOf = useMemo(
    () =>
      Object.fromEntries(
        regions.map((region) => [
          region.id,
          region,
        ])
      ),
    [regions]
  );

  // ============================================
  // SELECTED DISTRICT
  // ============================================

  const d =
    districts.find((district) => district.id === selected) ||
    districts[0];

  // ============================================
  // PREPARE MAP POLYGONS AND LABELS
  // ============================================

  const mapFeatures = useMemo(() => {
    const features = apDistrictGeoJSON.features.map((feature) => {
      const record = getDistrictRecord(feature, districts);
      const label = getMapLabel(
        record,
        feature.properties?.district || '',
        tc
      );
      const districtId = record?.id || feature.properties?.district;

      return {
        key: feature.properties?.objectid || feature.properties?.district,
        districtId: record?.id,
        label,
        path: geometryToPath(feature.geometry),
        labelPosition: getLabelPosition(feature.geometry),
        color: getDistrictColor(districtId),
      };
    });

    return placeDistrictLabels(features);
  }, [districts, tc]);

  // Districts added through the CMS may not have a GeoJSON boundary.
  // If Map X and Map Y are provided, show them as selectable map markers.
  const mapMarkers = useMemo(() => {
    const districtsWithMapShapes = new Set(
      mapFeatures
        .map((feature) => feature.districtId)
        .filter(Boolean)
    );

    return districts
      .filter(
        (district) =>
          !districtsWithMapShapes.has(district.id)
      )
      .map((district) => {
        const position = getAdminMapPosition(district);

        if (!position) return null;

        return {
          key: district.id,
          districtId: district.id,
          label: getMapLabel(
            district,
            district.name?.en || district.name || district.id,
            tc
          ),
          position,
          color: getDistrictColor(district.id),
        };
      })
      .filter(Boolean);
  }, [districts, mapFeatures, tc]);

  if (!d) return null;

  const region = regionOf[d.region];

  return (
    <div className="district-explorer">

      {/* MAP AND TABLE BUTTONS */}

      <div
        className="btn-group district-view-toggle mb-3"
        role="group"
        aria-label={t('districtExplorer')}
      >
        <button
          type="button"
          className={`btn btn-sm ${
            view === 'map'
              ? 'btn-dark'
              : 'btn-outline-dark'
          }`}
          aria-pressed={view === 'map'}
          onClick={() => setView('map')}
        >
          <MapIcon
            size={15}
            aria-hidden="true"
            className="me-1"
          />
          {t('mapView')}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${
            view === 'table'
              ? 'btn-dark'
              : 'btn-outline-dark'
          }`}
          aria-pressed={view === 'table'}
          onClick={() => setView('table')}
        >
          <Table2
            size={15}
            aria-hidden="true"
            className="me-1"
          />
          {t('tableView')}
        </button>
      </div>

      <div
        className={`row g-4 ${
          view === 'table' ? 'district-table-mode' : ''
        }`}
      >

        {/* MAP OR TABLE */}

        <div className="col-12">

          {view === 'map' ? (

            <div className="district-map district-geo-map">

              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                role="group"
                aria-label={t(
                  'districtExplorerDesc'
                ).replace(
                  '{n}',
                  String(districts.length)
                )}
                style={{
                  width: '100%',
                  height: 'auto',
                  overflow: 'visible',
                  maxHeight: compact ? 820 : 980,
                  display: 'block',
                }}
              >

                {/* DISTRICT POLYGONS AND NAMES */}

                {mapFeatures.map((feature) => {
                  const active =
                    feature.districtId === selected;

                  const [labelX, labelY] =
                    feature.labelPosition;

                  const layout = feature.labelLayout || getLabelLayout(feature.label);
                  const lines = layout.lines;
                  const firstLineY =
                    labelY - ((lines.length - 1) * layout.lineHeight) / 2;
                  const labelCenterY = labelY;

                  return (
                    <g
                      key={feature.key}
                      className={`district-geo-feature ${
                        active ? 'is-selected' : ''
                      }`}
                      role={
                        feature.districtId
                          ? 'button'
                          : undefined
                      }
                      tabIndex={
                        feature.districtId ? 0 : undefined
                      }
                      aria-label={feature.label}
                      aria-pressed={
                        feature.districtId
                          ? active
                          : undefined
                      }
                      onClick={() =>
                        feature.districtId &&
                        handleDistrictSelect(
                          feature.districtId
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          feature.districtId &&
                          (event.key === 'Enter' ||
                            event.key === ' ')
                        ) {
                          event.preventDefault();

                          handleDistrictSelect(
                            feature.districtId
                          );
                        }
                      }}
                      style={{
                        cursor: feature.districtId
                          ? 'pointer'
                          : 'default',
                      }}
                    >

                      {/* DISTRICT SHAPE */}

                      <path
                        d={feature.path}
                        fill={feature.color}
                        fillRule="evenodd"
                        stroke={
                          active ? '#243447' : '#FFFFFF'
                        }
                        strokeWidth={
                          active ? 3.5 : 2.2
                        }
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        pointerEvents="visiblePainted"
                        style={{
                          filter: active
                            ? 'brightness(1.06) drop-shadow(0 3px 5px rgba(30,45,60,.2))'
                            : 'none',
                          transition:
                            'filter 160ms ease',
                        }}
                      />


                    </g>
                  );
                })}

                {/* DRAW ALL LABELS AFTER ALL POLYGONS SO THEY STAY VISIBLE */}
                {mapFeatures.map((feature) => {
                  const active = feature.districtId === selected;
                  const [labelX, labelY] = feature.labelPosition;
                  const layout = feature.labelLayout || getLabelLayout(feature.label);
                  const lines = layout.lines;
                  const firstLineY =
                    labelY - ((lines.length - 1) * layout.lineHeight) / 2;
                  const [anchorX, anchorY] =
                    feature.labelAnchorPosition || feature.labelPosition;
                  const moved =
                    Math.hypot(labelX - anchorX, labelY - anchorY) > 12;

                  return (
                    <g
                      key={`label-${feature.key}`}
                      pointerEvents="all"
                      role={feature.districtId ? 'button' : undefined}
                      tabIndex={feature.districtId ? 0 : undefined}
                      aria-label={`Select ${feature.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (feature.districtId) {
                          handleDistrictSelect(feature.districtId);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          feature.districtId &&
                          (event.key === 'Enter' || event.key === ' ')
                        ) {
                          event.preventDefault();
                          handleDistrictSelect(feature.districtId);
                        }
                      }}
                      style={{ cursor: feature.districtId ? 'pointer' : 'default' }}
                    >
                      {moved && (
                        <line
                          x1={anchorX}
                          y1={anchorY}
                          x2={labelX}
                          y2={labelY}
                          stroke="#526477"
                          strokeWidth="1.4"
                          strokeOpacity="0.9"
                          strokeDasharray="3 2"
                          pointerEvents="none"
                        />
                      )}

                      <rect
                        x={labelX - layout.width / 2}
                        y={labelY - layout.height / 2}
                        width={layout.width}
                        height={layout.height}
                        rx="6"
                        fill="#FFFFFF"
                        fillOpacity="0.98"
                        stroke={active ? '#172B43' : '#8FA1B3'}
                        strokeWidth={active ? 2.2 : 1}
                      />

                      <text
                        x={labelX}
                        y={firstLineY}
                        textAnchor="middle"
                        fontSize={layout.fontSize}
                        fontWeight={active ? 800 : 700}
                        fill="#243447"
                        dominantBaseline="hanging"
                        pointerEvents="none"
                      >
                        {lines.map((line, index) => (
                          <tspan
                            key={index}
                            x={labelX}
                            dy={index === 0 ? 0 : layout.lineHeight}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}

                {/* CMS DISTRICTS WITHOUT GEOJSON BOUNDARIES */}
                {mapMarkers.map((marker) => {
                  const active =
                    marker.districtId === selected;

                  const [markerX, markerY] =
                    marker.position;

                  const labelWidth = Math.max(
                    48,
                    Math.min(
                      132,
                      String(marker.label).length * 6.2 + 18
                    )
                  );

                  const labelX = Math.min(
                    MAP_WIDTH - labelWidth / 2 - 4,
                    Math.max(
                      labelWidth / 2 + 4,
                      markerX
                    )
                  );

                  const labelY = Math.max(
                    16,
                    markerY - 28
                  );

                  return (
                    <g
                      key={`cms-${marker.key}`}
                      className={`district-geo-feature ${
                        active ? 'is-selected' : ''
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={marker.label}
                      aria-pressed={active}
                      onClick={() =>
                        handleDistrictSelect(marker.districtId)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault();
                          handleDistrictSelect(
                            marker.districtId
                          );
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={markerX}
                        cy={markerY}
                        r={active ? 11 : 9}
                        fill={marker.color}
                        stroke={active ? '#243447' : '#FFFFFF'}
                        strokeWidth={active ? 3 : 2}
                        vectorEffect="non-scaling-stroke"
                      />

                      <circle
                        cx={markerX}
                        cy={markerY}
                        r="3"
                        fill="#FFFFFF"
                        pointerEvents="none"
                      />

                      <rect
                        x={labelX - labelWidth / 2}
                        y={labelY - 10}
                        width={labelWidth}
                        height="20"
                        rx="5"
                        fill="#FFFFFF"
                        fillOpacity="0.96"
                        stroke={active ? '#243447' : '#D7E0E8'}
                        strokeWidth={active ? 1.5 : 0.8}
                        pointerEvents="none"
                      />

                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9.5"
                        fontWeight={active ? 800 : 700}
                        fill="#243447"
                        pointerEvents="none"
                      >
                        {marker.label}
                      </text>
                    </g>
                  );
                })}

              </svg>

              {/* DISTRICT COLOUR NOTE */}
              <p className="small text-muted-2 mt-2 mb-0 px-2">
                Each district has its own colour. Select a district on the map to view its details.
              </p>

            </div>

          ) : (

            /* TABLE VIEW */

            <div
              className="table-wrap"
              style={{
                maxHeight: compact ? 480 : 640,
              }}
            >
              <table className="table dst-table table-hover">

                <caption className="visually-hidden">
                  {t('districtExplorer')}
                </caption>

                <thead>
                  <tr>
                    <th scope="col">{t('district')}</th>
                    <th scope="col">{t('region')}</th>
                    <th scope="col">{t('headquarters')}</th>
                    <th scope="col" className="text-center">
                      {t('institutions')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {districts.map((x) => (
                    <tr
                      key={x.id}
                      className={
                        x.id === selected
                          ? 'table-active'
                          : ''
                      }
                    >
                      <th scope="row">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-start"
                          onClick={() =>
                            handleDistrictSelect(x.id)
                          }
                        >
                          {getMapLabel(x, x.name?.en || x.name || x.id, tc)}
                        </button>
                      </th>

                      <td>
                        {tc(regionOf[x.region]?.name)}
                      </td>

                      <td>{x.hq}</td>

                      <td className="text-center">
                        {(x.institutions || []).length}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        {/* SELECTED DISTRICT SUMMARY
            Hide on homepage when showSummary={false}.
            Keep on the full District Explorer page.
        */}

        {view === 'map' && showSummary && (
          <div className="col-12">

            <div
              id="district-summary"
              className="dst-card"
              aria-live="polite"
              style={{
                scrollMarginTop: '110px',
              }}
            >

              <p className="section-eyebrow d-flex align-items-center gap-1 mb-1">
                <MapPin size={14} aria-hidden="true" />
                {t('district')}
              </p>

              <h3 className="h3 fw-bold mb-1">
                {getMapLabel(d, d.name?.en || d.name || d.id, tc)}
              </h3>

              <p className="text-muted-2 small d-flex align-items-center gap-2">
                <span
                  className="legend-dot"
                  style={{
                    background: getDistrictColor(d.id),
                  }}
                />

                {tc(region?.name)} · {t('headquarters')}: {d.hq}
              </p>

              {/* INSTITUTIONS */}

              <h4 className="h6 fw-bold mt-4 d-flex align-items-center gap-2">
                <Building2 size={16} aria-hidden="true" />
                {t('institutions')}
              </h4>

              {(d.institutions || []).length ? (
                <ul className="list-unstyled d-grid gap-2 mb-0">
                  {d.institutions.map((inst, i) => (
                    <li
                      key={i}
                      className="d-flex justify-content-between gap-2 p-2 px-3 rounded-3 bg-soft"
                    >
                      <span className="small fw-medium">
                        {tc(inst.name)}
                      </span>

                      {inst.type && (
                        <span className="pill flex-shrink-0">
                          {inst.type}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="small text-muted-2">
                  {t('noDistrictData')}
                </p>
              )}

              {/* ACTIVITIES */}

              {(d.activities || []).length > 0 && (
                <>
                  <h4 className="h6 fw-bold mt-4 d-flex align-items-center gap-2">
                    <FlaskConical size={16} aria-hidden="true" />
                    {t('activities')}
                  </h4>

                  <ul className="small mb-0">
                    {d.activities.map((activity, i) => (
                      <li key={i}>
                        {tc(activity)}
                      </li>
                    ))}
                  </ul>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
