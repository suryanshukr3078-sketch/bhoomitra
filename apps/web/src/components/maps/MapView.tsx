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
  Check,
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

export type BasemapStyleKey = 'streets' | 'hybrid' | 'satellite' | 'topo' | 'carto_light' | 'dark';

export interface MapViewProps {
  features?: SpatialFeatureItem[];
  selectedFeatureId?: string | null;
  onSelectFeature?: (feature: SpatialFeatureItem) => void;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  basemap?: BasemapStyleKey;
  onBasemapChange?: (basemap: BasemapStyleKey) => void;
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
      id: 'base-osm',
      type: 'raster',
      source: 'osm-tiles',
      layout: { visibility: 'visible' },
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'base-satellite',
      type: 'raster',
      source: 'satellite-tiles',
      layout: { visibility: 'none' },
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
      id: 'base-hybrid-labels',
      type: 'raster',
      source: 'hybrid-labels-tiles',
      layout: { visibility: 'none' },
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

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
  basemap,
  onBasemapChange,
  activeLayers = {
    polygons: true,
    surveyPoints: true,
    satellite: false,
    disputedZones: false,
    landUse: false,
    climateVulnerability: false,
    infrastructure: false,
    fraTenure: false,
  },
  className = 'w-full h-full min-h-[400px]',
  initialBasemap = 'streets',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Basemap State (defaulting to streets or hybrid)
  const [currentBasemap, setCurrentBasemap] = useState<BasemapStyleKey>(basemap || initialBasemap);
  const [showMapFlyout, setShowMapFlyout] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Live HUD Coordinates
  const [cursorCoords, setCursorCoords] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  // Measurement Tool State
  const [measureMode, setMeasureMode] = useState<'none' | 'distance' | 'area'>('none');
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number>(0);
  const [measuredArea, setMeasuredArea] = useState<number>(0);

  const allFeatures = features.length > 0 ? features : SEED_SPATIAL_FEATURES;

  const featureCollection = React.useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: allFeatures as any,
    }),
    [allFeatures]
  );

  const measurementGeoJSON = React.useMemo<GeoJSON.FeatureCollection>(() => {
    if (measurePoints.length === 0) {
      return { type: 'FeatureCollection', features: [] };
    }

    const feats: any[] = [];
    measurePoints.forEach((pt, idx) => {
      feats.push({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: pt },
      });
    });

    if (measurePoints.length >= 2) {
      feats.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: measureMode === 'area' && measurePoints.length >= 3 ? 'Polygon' : 'LineString',
          coordinates:
            measureMode === 'area' && measurePoints.length >= 3
              ? [[...measurePoints, measurePoints[0]]]
              : measurePoints,
        },
      });
    }

    return { type: 'FeatureCollection', features: feats };
  }, [measurePoints, measureMode]);

  // Apply basemap visibility to MapLibre layers
  const applyBasemap = useCallback(
    (b: BasemapStyleKey, labels: boolean = showLabels) => {
      if (!mapRef.current) return;
      const map = mapRef.current;

      const layersConfig: Record<string, boolean> = {
        'base-osm': b === 'streets',
        'base-satellite': b === 'satellite' || b === 'hybrid',
        'base-hybrid-labels': b === 'hybrid' || (b === 'satellite' && labels),
        'base-topo': b === 'topo',
        'base-carto-light': b === 'carto_light',
        'base-dark': b === 'dark',
      };

      Object.entries(layersConfig).forEach(([layerId, visible]) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        }
      });

      setCurrentBasemap(b);
      if (onBasemapChange) {
        onBasemapChange(b);
      }
    },
    [onBasemapChange, showLabels]
  );

  // Sync with external basemap prop if provided
  useEffect(() => {
    if (basemap && basemap !== currentBasemap) {
      applyBasemap(basemap);
    }
  }, [basemap, currentBasemap, applyBasemap]);

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
        customAttribution: '© OpenStreetMap | Esri Satellite | Survey of India | Bhoomitra',
      }),
      'bottom-right'
    );

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // Set initial layer visibility based on currentBasemap
      const initialB = basemap || initialBasemap;
      applyBasemap(initialB);

      // Sources
      map.addSource('cadastral-features', {
        type: 'geojson',
        data: featureCollection,
      });

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

      map.addSource('measurement-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Drone flight corridor
      map.addLayer({
        id: 'drone-survey-lines',
        type: 'line',
        source: 'drone-survey-grid',
        layout: { visibility: 'visible', 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0284c7',
          'line-width': 1.5,
          'line-dasharray': [3, 2],
          'line-opacity': 0.7,
        },
      });

      // Cadastral Polygons Fill
      map.addLayer({
        id: 'cadastral-polygons-fill',
        type: 'fill',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            '#10b981',
            ['has', 'fillColor'],
            ['get', 'fillColor'],
            '#059669',
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            0.6,
            0.35,
          ],
        },
      });

      // Cadastral Polygons Boundary Line
      map.addLayer({
        id: 'cadastral-polygons-line',
        type: 'line',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            '#ffffff',
            '#047857',
          ],
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            3.5,
            2,
          ],
        },
      });

      // Survey Corner Points / GCP Pins
      map.addLayer({
        id: 'cadastral-survey-points',
        type: 'circle',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#f59e0b',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Measurement Layers
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

      // Mouse Move: Track cursor coords
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

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const src = mapRef.current.getSource('measurement-source') as GeoJSONSource;
    if (src) {
      src.setData(measurementGeoJSON);
    }
  }, [measurementGeoJSON, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const source = mapRef.current.getSource('cadastral-features') as GeoJSONSource;
    if (source) {
      source.setData(featureCollection);
    }
  }, [featureCollection, mapLoaded]);

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
        0.6,
        0.35,
      ]);
    }
    if (map.getLayer('cadastral-polygons-line')) {
      map.setPaintProperty('cadastral-polygons-line', 'line-color', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        '#ffffff',
        '#047857',
      ]);
      map.setPaintProperty('cadastral-polygons-line', 'line-width', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        3.5,
        2,
      ]);
    }
  }, [selectedFeatureId, mapLoaded]);

  const isSatelliteActive = currentBasemap === 'satellite' || currentBasemap === 'hybrid';

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden shadow-inner" />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm text-emerald-400 z-20">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-3 text-xs font-semibold text-slate-200">
            Initializing Spatial Layers &amp; Basemaps...
          </span>
        </div>
      )}

      {/* GOOGLE MAPS STYLE BOTTOM-LEFT MAP TYPE SWITCHER */}
      <div className="absolute bottom-6 left-6 z-30 flex items-end gap-3 pointer-events-auto">
        <div
          className="relative"
          onMouseEnter={() => setShowMapFlyout(true)}
          onMouseLeave={() => setShowMapFlyout(false)}
        >
          {/* Main 1-Click Toggle Square Button (Like Google Maps) */}
          <button
            type="button"
            onClick={() => {
              // Toggle between the previous standard street map and the new high-res satellite map!
              if (isSatelliteActive) {
                applyBasemap('streets');
              } else {
                applyBasemap('hybrid');
              }
            }}
            className="group relative flex flex-col items-center justify-end w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title={
              isSatelliteActive
                ? 'Switch to Default Map (Previous OpenStreetMap view)'
                : 'Switch to High-Res Satellite View'
            }
          >
            {/* Visual Thumbnail: Displays a preview of the OTHER map style */}
            {isSatelliteActive ? (
              // On satellite: show mini street map thumbnail
              <div className="absolute inset-0 bg-[#e5e3df] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-80 bg-[linear-gradient(45deg,#f8f4f0_25%,transparent_25%),linear-gradient(-45deg,#f8f4f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8f4f0_75%),linear-gradient(-45deg,transparent_75%,#f8f4f0_75%)] [background-size:16px_16px]" />
                <div className="absolute h-2 w-full bg-[#fbd480] top-4 -rotate-12" />
                <div className="absolute h-1.5 w-full bg-white top-8 rotate-6" />
                <div className="absolute w-4 h-4 rounded-full bg-emerald-500/50 right-2 top-2" />
                <MapIcon className="w-5 h-5 text-slate-700 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              // On street map: show mini satellite thumbnail
              <div className="absolute inset-0 bg-[#1e293b] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 opacity-90" />
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px]" />
                <Satellite className="w-5 h-5 text-emerald-300 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Label Badge */}
            <div className="relative z-10 w-full bg-slate-950/85 backdrop-blur-xs py-1 text-center border-t border-white/20">
              <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-wide block leading-tight">
                {isSatelliteActive ? 'Default Map' : 'Satellite'}
              </span>
            </div>
          </button>

          {/* Expanded Map Types Menu on Hover/Click */}
          {showMapFlyout && (
            <div className="absolute bottom-22 left-0 p-3 bg-slate-900/98 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 z-40 w-64 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Base Map Style &bull; मानचित्र प्रकार
                </span>
                <span className="text-[10px] font-bold text-emerald-400">Google Style</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* 1. Standard Street Map (Previous OpenStreetMap) */}
                <button
                  type="button"
                  onClick={() => applyBasemap('streets')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    currentBasemap === 'streets'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <MapIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Default Map</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Previous standard street view (OSM)
                  </span>
                </button>

                {/* 2. Hybrid Satellite */}
                <button
                  type="button"
                  onClick={() => applyBasemap('hybrid')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    currentBasemap === 'hybrid'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hybrid Satellite</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    High-Res imagery with place labels
                  </span>
                </button>

                {/* 3. Pure Satellite */}
                <button
                  type="button"
                  onClick={() => applyBasemap('satellite')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    currentBasemap === 'satellite'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pure Satellite</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Raw aerial imagery only
                  </span>
                </button>

                {/* 4. Topo / Terrain */}
                <button
                  type="button"
                  onClick={() => applyBasemap('topo')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    currentBasemap === 'topo'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Mountain className="w-3.5 h-3.5 text-teal-400" />
                    <span>Topo / Terrain</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Elevation contours &amp; hills
                  </span>
                </button>
              </div>

              {/* Toggle: Show labels on satellite */}
              {isSatelliteActive && (
                <label className="flex items-center justify-between text-[11px] text-slate-300 pt-1.5 border-t border-slate-800 cursor-pointer">
                  <span>Show Road &amp; Village Labels</span>
                  <input
                    type="checkbox"
                    checked={currentBasemap === 'hybrid'}
                    onChange={(e) => {
                      const newB = e.target.checked ? 'hybrid' : 'satellite';
                      applyBasemap(newB);
                    }}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Measurement Button next to Map Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md text-xs">
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
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
              measureMode === 'distance'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Click points to measure distance (दूरी मापें)"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Measure</span>
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
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
              measureMode === 'area'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Click polygon vertices to measure land area (क्षेत्रफल मापें)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Area</span>
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
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear measurement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Measurement Readout Toast / Badge */}
      {measureMode !== 'none' && measurePoints.length > 0 && (
        <div className="absolute top-24 left-4 z-20 p-3 bg-slate-900/98 border border-blue-500/60 rounded-2xl shadow-2xl backdrop-blur-md text-xs text-white space-y-1 animate-in fade-in">
          <div className="font-bold text-blue-400 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              {measureMode === 'distance' ? 'Linear Perimeter:' : 'Enclosed Area:'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMeasureMode('none');
                setMeasurePoints([]);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {measureMode === 'distance' ? (
            <div className="font-mono text-sm font-extrabold text-blue-300">
              {measuredDistance > 1000
                ? `${(measuredDistance / 1000).toFixed(2)} km`
                : `${measuredDistance.toFixed(1)} meters`}
              <span className="text-[10px] text-slate-400 font-normal ml-1">
                ({measurePoints.length} vertices)
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
          <p className="text-[10px] text-slate-400">Click on map to add vertex point</p>
        </div>
      )}

      {/* Live Map Heads-Up Display (HUD) */}
      <div className="absolute bottom-2 left-64 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl backdrop-blur-md text-[11px] text-slate-300 font-mono shadow-md pointer-events-none">
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <Compass className="w-3.5 h-3.5" />
          {cursorCoords[1].toFixed(4)}° N, {cursorCoords[0].toFixed(4)}° E
        </span>
        <span className="text-slate-600">|</span>
        <span>Zoom: {currentZoom}</span>
        <span className="text-slate-600">|</span>
        <span>Datum: WGS 84 (EPSG:4326)</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 capitalize">
          {currentBasemap === 'streets' ? 'Standard Map (OSM)' : `${currentBasemap} Satellite`}
        </span>
      </div>
    </div>
  );
}
