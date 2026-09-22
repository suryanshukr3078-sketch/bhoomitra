'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Loader2,
  Satellite,
  Mountain,
  Map as MapIcon,
  Moon,
  Layers,
  Ruler,
  Compass,
  X,
  Crosshair,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

export interface SpatialFeatureItem {
  id: string;
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'Point' | 'LineString' | string;
    coordinates: any;
  };
  properties: {
    surveyNumber?: string;
    owner?: string;
    areaHa?: number | string;
    tenureType?: string;
    jurisdiction?: string;
    mutationDate?: string;
    external_id?: string;
    name?: string;
    fillColor?: string;
    ulpin?: string;
    soilType?: string;
    category?: string;
    [key: string]: any;
  };
}

export type BasemapStyleKey = 'hybrid' | 'satellite' | 'topo' | 'streets' | 'carto_light' | 'dark';

export interface MapViewProps {
  features?: SpatialFeatureItem[];
  selectedFeatureId?: string | null;
  onSelectFeature?: (feature: SpatialFeatureItem) => void;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  activeLayers?: {
    polygons?: boolean;
    surveyPoints?: boolean;
    satellite?: boolean;
    disputedZones?: boolean;
    landUse?: boolean;
    climateVulnerability?: boolean;
    infrastructure?: boolean;
    fraTenure?: boolean;
  };
  className?: string;
  initialBasemap?: BasemapStyleKey;
}

// Built-in seed cadastral features over India
export const SEED_SPATIAL_FEATURES: SpatialFeatureItem[] = [
  {
    id: 'PAR-DEL-01',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.205, 28.611],
          [77.215, 28.611],
          [77.215, 28.618],
          [77.205, 28.618],
          [77.205, 28.611],
        ],
      ],
    },
    properties: {
      surveyNumber: 'Survey DL-01/Central',
      owner: 'Delhi Development Authority & Public Estate',
      areaHa: 6.2,
      tenureType: 'Institutional Freehold',
      jurisdiction: 'Delhi (Central District)',
      mutationDate: '15 August 2026',
      name: 'Delhi Central Cadastral Zone',
      fillColor: '#059669',
      ulpin: 'INDL000177202861',
    },
  },
];

// Multi-Source Basemap Style Specification for MapLibre GL
export const COMPOSITE_ADVANCED_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri World Imagery, Maxar, Earthstar Geographics',
      maxzoom: 19,
    },
    'hybrid-labels-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri World Boundaries & Places',
      maxzoom: 19,
    },
    'topo-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri World Topo Map & Natural Earth',
      maxzoom: 19,
    },
    'carto-light-tiles': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      ],
      tileSize: 256,
      attribution: '© CartoDB, OpenStreetMap contributors',
      maxzoom: 19,
    },
    'dark-tiles': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© CartoDB Dark Matter',
      maxzoom: 19,
    },
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'base-satellite',
      type: 'raster',
      source: 'satellite-tiles',
      layout: { visibility: 'visible' },
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'base-topo',
      type: 'raster',
      source: 'topo-tiles',
      layout: { visibility: 'none' },
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'base-carto-light',
      type: 'raster',
      source: 'carto-light-tiles',
      layout: { visibility: 'none' },
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'base-dark',
      type: 'raster',
      source: 'dark-tiles',
      layout: { visibility: 'none' },
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'base-osm',
      type: 'raster',
      source: 'osm-tiles',
      layout: { visibility: 'none' },
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'base-hybrid-labels',
      type: 'raster',
      source: 'hybrid-labels-tiles',
      layout: { visibility: 'visible' },
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Geodesic calculation helpers
function calculateDistanceMeters(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculatePolygonAreaSqMeters(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const R = 6371000;
  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[(i + 1) % coords.length];
    const x1 = ((lon1 * Math.PI) / 180) * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180) * R;
    const y1 = ((lat1 * Math.PI) / 180) * R;
    const x2 = ((lon2 * Math.PI) / 180) * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180) * R;
    const y2 = ((lat2 * Math.PI) / 180) * R;
    total += x1 * y2 - x2 * y1;
  }
  return Math.abs(total / 2);
}

export function MapView({
  features = [],
  selectedFeatureId = null,
  onSelectFeature,
  center = [77.209, 28.6139],
  zoom = 13.5,
  activeLayers = {
    polygons: true,
    surveyPoints: true,
    satellite: true,
    disputedZones: false,
    landUse: false,
    climateVulnerability: false,
    infrastructure: false,
    fraTenure: false,
  },
  className = 'w-full h-full min-h-[400px]',
  initialBasemap = 'hybrid',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Basemap Switcher State
  const [currentBasemap, setCurrentBasemap] = useState<BasemapStyleKey>(initialBasemap);

  // Live HUD Coordinates
  const [cursorCoords, setCursorCoords] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  // Measurement Tool State
  const [measureMode, setMeasureMode] = useState<'none' | 'distance' | 'area'>('none');
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number>(0);
  const [measuredArea, setMeasuredArea] = useState<number>(0);

  // Combine provided features with seed features
  const allFeatures = features.length > 0 ? features : SEED_SPATIAL_FEATURES;

  const featureCollection = React.useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: allFeatures as any,
    }),
    [allFeatures]
  );

  // Measurement GeoJSON source data
  const measurementGeoJSON = React.useMemo<GeoJSON.FeatureCollection>(() => {
    if (measurePoints.length === 0) {
      return { type: 'FeatureCollection', features: [] };
    }

    const feats: any[] = [];

    // Points
    measurePoints.forEach((pt, idx) => {
      feats.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: pt },
        properties: { index: idx + 1 },
      });
    });

    // Line
    if (measurePoints.length >= 2) {
      feats.push({
        type: 'Feature',
        geometry: {
          type: measureMode === 'area' && measurePoints.length >= 3 ? 'Polygon' : 'LineString',
          coordinates:
            measureMode === 'area' && measurePoints.length >= 3
              ? [[...measurePoints, measurePoints[0]]]
              : measurePoints,
        },
        properties: {},
      });
    }

    return { type: 'FeatureCollection', features: feats };
  }, [measurePoints, measureMode]);

  // Apply basemap visibility to MapLibre layers
  const applyBasemap = useCallback((basemap: BasemapStyleKey) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const layersConfig: Record<string, boolean> = {
      'base-satellite': basemap === 'satellite' || basemap === 'hybrid',
      'base-hybrid-labels': basemap === 'hybrid',
      'base-topo': basemap === 'topo',
      'base-carto-light': basemap === 'carto_light',
      'base-dark': basemap === 'dark',
      'base-osm': basemap === 'streets',
    };

    Object.entries(layersConfig).forEach(([layerId, visible]) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    });

    setCurrentBasemap(basemap);
  }, []);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: COMPOSITE_ADVANCED_MAP_STYLE,
      center,
      zoom,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: '© Esri Satellite | OpenStreetMap | Survey of India | Bhoomitra Cadastre',
      }),
      'bottom-right'
    );

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 140, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // 1. Cadastral Features Source
      map.addSource('cadastral-features', {
        type: 'geojson',
        data: featureCollection,
      });

      // 2. Drone Flight Corridor Grid Source (simulated survey lines)
      map.addSource('drone-survey-grid', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [center[0] - 0.015, center[1] - 0.008],
                  [center[0] + 0.015, center[1] - 0.008],
                ],
              },
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [center[0] - 0.015, center[1] + 0.008],
                  [center[0] + 0.015, center[1] + 0.008],
                ],
              },
            },
          ],
        },
      });

      // 3. Measurement Source
      map.addSource('measurement-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Layer: Drone Survey Flight Path (Dashed lines)
      map.addLayer({
        id: 'drone-survey-lines',
        type: 'line',
        source: 'drone-survey-grid',
        layout: { visibility: 'visible', 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#38bdf8', // Sky blue
          'line-width': 1.5,
          'line-dasharray': [3, 2],
          'line-opacity': 0.7,
        },
      });

      // Layer: Cadastral Polygons Fill
      map.addLayer({
        id: 'cadastral-polygons-fill',
        type: 'fill',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            '#10b981', // Highlight emerald-500
            ['has', 'fillColor'],
            ['get', 'fillColor'],
            '#059669', // Default emerald-600
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            0.65,
            0.4,
          ],
        },
      });

      // Layer: Cadastral Polygons Outer Boundary Line
      map.addLayer({
        id: 'cadastral-polygons-line',
        type: 'line',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            '#ffffff', // White glow when selected
            '#34d399', // Bright emerald outline
          ],
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            3.5,
            2,
          ],
        },
      });

      // Layer: Survey GCP Points & Corner Pins
      map.addLayer({
        id: 'cadastral-survey-points',
        type: 'circle',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 6.5,
          'circle-color': '#f59e0b', // Amber GCP marker
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Layer: Measurement Fill & Line
      map.addLayer({
        id: 'measurement-area-fill',
        type: 'fill',
        source: 'measurement-source',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.35,
        },
      });

      map.addLayer({
        id: 'measurement-line',
        type: 'line',
        source: 'measurement-source',
        filter: ['in', '$type', 'LineString', 'Polygon'],
        paint: {
          'line-color': '#2563eb',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });

      map.addLayer({
        id: 'measurement-nodes',
        type: 'circle',
        source: 'measurement-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#2563eb',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Mouse Move: Track cursor coordinates for Live HUD
      map.on('mousemove', (e) => {
        setCursorCoords([e.lngLat.lng, e.lngLat.lat]);
      });

      map.on('zoom', () => {
        setCurrentZoom(parseFloat(map.getZoom().toFixed(1)));
      });

      // Click on cadastral parcel polygon
      map.on('click', 'cadastral-polygons-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const clickedFeature = e.features[0];
        const props = clickedFeature.properties || {};
        const featId = clickedFeature.id?.toString() || props.id || props.external_id || 'PARCEL';

        if (onSelectFeature) {
          onSelectFeature({
            id: featId,
            type: 'Feature',
            geometry: clickedFeature.geometry as any,
            properties: props,
          });
        }

        if (popupRef.current) {
          popupRef.current.remove();
        }

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px 8px; font-size: 12px; color: #0f172a; min-width: 180px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 800; color: #059669; font-size: 13px;">${props.surveyNumber || featId}</span>
              <span style="background: #ecfdf5; color: #047857; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; border: 1px solid #a7f3d0;">Verified</span>
            </div>
            ${props.ulpin ? `<div style="font-family: monospace; font-size: 10px; color: #64748b; margin-bottom: 4px;">ULPIN: ${props.ulpin}</div>` : ''}
            <div style="margin-bottom: 2px;"><strong>Holder:</strong> ${props.owner || 'Registered Landholder'}</div>
            <div style="margin-bottom: 2px;"><strong>Area:</strong> ${props.areaHa ? `${props.areaHa} Hectares` : 'N/A'}</div>
            <div style="margin-bottom: 2px;"><strong>Tenure:</strong> ${props.tenureType || 'Freehold'}</div>
            <div><strong>Jurisdiction:</strong> ${props.jurisdiction || 'N/A'}</div>
          </div>
        `;

        popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(map);
      });

      // Hover cursor changes
      map.on('mouseenter', 'cadastral-polygons-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'cadastral-polygons-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      if (popupRef.current) popupRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Measurement click handler
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || measureMode === 'none') return;
    const map = mapRef.current;

    const handleMapMeasureClick = (e: maplibregl.MapMouseEvent) => {
      const newPt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setMeasurePoints((prev) => {
        const updated = [...prev, newPt];

        if (measureMode === 'distance' && updated.length >= 2) {
          let dist = 0;
          for (let i = 0; i < updated.length - 1; i++) {
            dist += calculateDistanceMeters(updated[i], updated[i + 1]);
          }
          setMeasuredDistance(dist);
        } else if (measureMode === 'area' && updated.length >= 3) {
          const area = calculatePolygonAreaSqMeters(updated);
          setMeasuredArea(area);
        }

        return updated;
      });
    };

    map.on('click', handleMapMeasureClick);
    return () => {
      map.off('click', handleMapMeasureClick);
    };
  }, [mapLoaded, measureMode]);

  // Update measurement source
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const src = mapRef.current.getSource('measurement-source') as GeoJSONSource;
    if (src) {
      src.setData(measurementGeoJSON);
    }
  }, [measurementGeoJSON, mapLoaded]);

  // Update GeoJSON features when prop changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const source = mapRef.current.getSource('cadastral-features') as GeoJSONSource;
    if (source) {
      source.setData(featureCollection);
    }
  }, [featureCollection, mapLoaded]);

  // Update layer visibility when activeLayers prop changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (map.getLayer('cadastral-polygons-fill')) {
      map.setLayoutProperty(
        'cadastral-polygons-fill',
        'visibility',
        activeLayers.polygons !== false ? 'visible' : 'none'
      );
    }
    if (map.getLayer('cadastral-polygons-line')) {
      map.setLayoutProperty(
        'cadastral-polygons-line',
        'visibility',
        activeLayers.polygons !== false ? 'visible' : 'none'
      );
    }
    if (map.getLayer('cadastral-survey-points')) {
      map.setLayoutProperty(
        'cadastral-survey-points',
        'visibility',
        activeLayers.surveyPoints !== false ? 'visible' : 'none'
      );
    }
    if (map.getLayer('drone-survey-lines')) {
      map.setLayoutProperty(
        'drone-survey-lines',
        'visibility',
        activeLayers.infrastructure ? 'visible' : 'none'
      );
    }
  }, [activeLayers, mapLoaded]);

  // Center / flyTo updates
  const centerLng = center?.[0];
  const centerLat = center?.[1];
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || centerLng === undefined || centerLat === undefined) return;
    mapRef.current.flyTo({
      center: [centerLng, centerLat],
      zoom: zoom ?? 13.5,
      essential: true,
      duration: 1400,
    });
  }, [centerLng, centerLat, zoom, mapLoaded]);

  // Highlight selected feature
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    if (map.getLayer('cadastral-polygons-fill')) {
      map.setPaintProperty('cadastral-polygons-fill', 'fill-color', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        '#10b981',
        ['has', 'fillColor'],
        ['get', 'fillColor'],
        '#059669',
      ]);
      map.setPaintProperty('cadastral-polygons-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        0.65,
        0.4,
      ]);
    }
    if (map.getLayer('cadastral-polygons-line')) {
      map.setPaintProperty('cadastral-polygons-line', 'line-color', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        '#ffffff',
        '#34d399',
      ]);
      map.setPaintProperty('cadastral-polygons-line', 'line-width', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        3.5,
        2,
      ]);
    }
  }, [selectedFeatureId, mapLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden shadow-inner" />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm text-emerald-400 z-20">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-3 text-xs font-semibold text-slate-200">
            Initializing High-Resolution Spatial Imagery &amp; Cadastral Layers...
          </span>
        </div>
      )}

      {/* Floating Basemap Selector Toolbar (High-Res Satellite, Hybrid, Topo, Streets, Dark) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 p-1 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md transition-all">
        <button
          type="button"
          onClick={() => applyBasemap('hybrid')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentBasemap === 'hybrid'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Satellite Imagery with Road & Place Labels"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hybrid Satellite</span>
        </button>

        <button
          type="button"
          onClick={() => applyBasemap('satellite')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentBasemap === 'satellite'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Pure High-Resolution Aerial & Satellite"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Satellite</span>
        </button>

        <button
          type="button"
          onClick={() => applyBasemap('topo')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentBasemap === 'topo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Topographic Elevation & Contour Map"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Topo / Terrain</span>
        </button>

        <button
          type="button"
          onClick={() => applyBasemap('carto_light')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentBasemap === 'carto_light'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Clean Government Cadastral Light"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cadastral Light</span>
        </button>

        <button
          type="button"
          onClick={() => applyBasemap('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentBasemap === 'dark'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="High-Contrast Night GIS Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dark GIS</span>
        </button>
      </div>

      {/* Floating Measurement & Inspection Tool */}
      <div className="absolute top-16 left-4 z-20 flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md text-xs">
        <button
          type="button"
          onClick={() => {
            if (measureMode === 'distance') {
              setMeasureMode('none');
              setMeasurePoints([]);
              setMeasuredDistance(0);
            } else {
              setMeasureMode('distance');
              setMeasurePoints([]);
              setMeasuredDistance(0);
            }
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
            measureMode === 'distance'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Click points on map to measure linear boundary distance"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Measure Line</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (measureMode === 'area') {
              setMeasureMode('none');
              setMeasurePoints([]);
              setMeasuredArea(0);
            } else {
              setMeasureMode('area');
              setMeasurePoints([]);
              setMeasuredArea(0);
            }
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
            measureMode === 'area'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Click polygon vertices to measure land plot area"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Measure Area</span>
        </button>

        {measureMode !== 'none' && (
          <button
            type="button"
            onClick={() => {
              setMeasureMode('none');
              setMeasurePoints([]);
              setMeasuredDistance(0);
              setMeasuredArea(0);
            }}
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear measurement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Measurement Readout Toast / Badge */}
      {measureMode !== 'none' && measurePoints.length > 0 && (
        <div className="absolute top-28 left-4 z-20 p-2.5 bg-slate-900/95 border border-blue-500/50 rounded-xl shadow-2xl backdrop-blur-md text-xs text-white space-y-1">
          <div className="font-bold text-blue-400 flex items-center gap-1">
            <Ruler className="w-3 h-3" />
            {measureMode === 'distance' ? 'Linear Distance:' : 'Polygon Area:'}
          </div>
          {measureMode === 'distance' ? (
            <div className="font-mono text-sm font-extrabold">
              {measuredDistance > 1000
                ? `${(measuredDistance / 1000).toFixed(2)} km`
                : `${measuredDistance.toFixed(1)} meters`}
              <span className="text-[10px] text-slate-400 font-normal ml-1">
                ({measurePoints.length} points)
              </span>
            </div>
          ) : (
            <div className="space-y-0.5 font-mono">
              <div className="text-sm font-extrabold text-emerald-400">
                {(measuredArea / 10000).toFixed(2)} Hectares
              </div>
              <div className="text-[11px] text-slate-300">
                {(measuredArea * 0.000247105).toFixed(2)} Acres &bull; {measuredArea.toFixed(0)} m²
              </div>
            </div>
          )}
          <p className="text-[10px] text-slate-400">Click on map to add vertex</p>
        </div>
      )}

      {/* Live Map Heads-Up Display (HUD) */}
      <div className="absolute bottom-3 left-32 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl backdrop-blur-md text-[11px] text-slate-300 font-mono shadow-md pointer-events-none">
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <Compass className="w-3.5 h-3.5" />
          {cursorCoords[1].toFixed(4)}° N, {cursorCoords[0].toFixed(4)}° E
        </span>
        <span className="text-slate-600">|</span>
        <span>Zoom: {currentZoom}</span>
        <span className="text-slate-600">|</span>
        <span>Datum: WGS 84 (EPSG:4326)</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 capitalize">{currentBasemap} Layer</span>
      </div>
    </div>
  );
}
