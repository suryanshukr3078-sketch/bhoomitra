'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader2 } from 'lucide-react';

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
    [key: string]: any;
  };
}

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
  };
  className?: string;
}

// Built-in seed cadastral features over India (Delhi, Bhopal, Pune, Bangalore)
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
    },
  },
  {
    id: 'PAR-BPL-74',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.408, 23.256],
          [77.419, 23.256],
          [77.419, 23.265],
          [77.408, 23.265],
          [77.408, 23.256],
        ],
      ],
    },
    properties: {
      surveyNumber: 'Survey MP-BPL/74',
      owner: 'Madhya Pradesh State Land Revenue Dept',
      areaHa: 8.5,
      tenureType: 'Municipal Land Trust',
      jurisdiction: 'Madhya Pradesh (Bhopal)',
      mutationDate: '10 July 2026',
      name: 'Bhopal Urban Cadastral Division',
    },
  },
  {
    id: 'PAR-44029',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [73.854, 18.518],
          [73.861, 18.518],
          [73.861, 18.524],
          [73.854, 18.524],
          [73.854, 18.518],
        ],
      ],
    },
    properties: {
      surveyNumber: 'Survey 142/3A',
      owner: 'Ramesh K. Joshi & Co-owners',
      areaHa: 4.85,
      tenureType: 'Freehold Agricultural',
      jurisdiction: 'Maharashtra (Pune)',
      mutationDate: '12 August 2026',
      name: 'Pune Agricultural Parcel 142/3A',
    },
  },
  {
    id: 'PAR-12093',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.591, 12.968],
          [77.601, 12.968],
          [77.601, 12.975],
          [77.591, 12.975],
          [77.591, 12.968],
        ],
      ],
    },
    properties: {
      surveyNumber: 'Survey 88/1',
      owner: 'Bangalore Metropolitan Land Trust',
      areaHa: 12.4,
      tenureType: 'Communal Forest Buffer',
      jurisdiction: 'Karnataka (Bangalore Rural)',
      mutationDate: '24 July 2026',
      name: 'Bangalore Ecological Buffer 88/1',
    },
  },
];

// OpenStreetMap Raster Tile Style Specification for MapLibre GL
export const OSM_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function MapView({
  features = [],
  selectedFeatureId = null,
  onSelectFeature,
  center = [78.9629, 22.5937], // Default India center [lng, lat]
  zoom = 5,
  activeLayers = {
    polygons: true,
    surveyPoints: true,
    satellite: false,
    disputedZones: false,
  },
  className = 'w-full h-full min-h-[400px]',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Combine provided features with seed features if features is empty
  const allFeatures = features.length > 0 ? features : SEED_SPATIAL_FEATURES;

  const featureCollection = React.useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: allFeatures as any,
    }),
    [allFeatures]
  );

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_RASTER_STYLE,
      center,
      zoom,
      attributionControl: false, // We add custom configured AttributionControl below
    });

    // Add Attribution Control with required OSM attribution text
    map.addControl(
      new maplibregl.AttributionControl({
        compact: false,
        customAttribution: '© OpenStreetMap contributors | LandGov Cadastre',
      }),
      'bottom-right'
    );

    // Add Navigation & Zoom Controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      // Add Cadastral Features Source
      map.addSource('cadastral-features', {
        type: 'geojson',
        data: featureCollection,
      });

      // Layer 1: Polygon Fills (Cadastral Boundary Parcels)
      map.addLayer({
        id: 'cadastral-polygons-fill',
        type: 'fill',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            '#047857', // Highlight emerald-700
            '#059669', // Default emerald-600
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            0.55,
            0.35,
          ],
        },
      });

      // Layer 2: Polygon Boundaries / Outline Lines
      map.addLayer({
        id: 'cadastral-polygons-line',
        type: 'line',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            '#064e3b', // Darker emerald-900 when selected
            '#047857', // Emerald-700
          ],
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedFeatureId || ''],
            3.5,
            2,
          ],
        },
      });

      // Layer 3: Corner Survey Markers (Points)
      map.addLayer({
        id: 'cadastral-survey-points',
        type: 'circle',
        source: 'cadastral-features',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#10b981',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Interactions: Click on parcel polygon
      map.on('click', 'cadastral-polygons-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const clickedFeature = e.features[0];
        const props = clickedFeature.properties || {};
        const featId = clickedFeature.id?.toString() || props.id || props.external_id || 'PARCEL';

        // Call parent handler
        if (onSelectFeature) {
          onSelectFeature({
            id: featId,
            type: 'Feature',
            geometry: clickedFeature.geometry as any,
            properties: props,
          });
        }

        // Show MapLibre Popup
        if (popupRef.current) {
          popupRef.current.remove();
        }

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px 6px; font-size: 12px; color: #0f172a;">
            <div style="font-weight: 700; color: #047857; font-size: 13px; margin-bottom: 4px;">
              ${props.name || featId}
            </div>
            <div><strong>Survey No:</strong> ${props.surveyNumber || 'N/A'}</div>
            <div><strong>Holder:</strong> ${props.owner || 'N/A'}</div>
            <div><strong>Area:</strong> ${props.areaHa ? `${props.areaHa} Ha` : 'N/A'}</div>
            <div><strong>Tenure:</strong> ${props.tenureType || 'N/A'}</div>
            <div><strong>Jurisdiction:</strong> ${props.jurisdiction || 'N/A'}</div>
          </div>
        `;

        popupRef.current = new maplibregl.Popup({ offset: 10 })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(map);
      });

      // Hover cursor
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
      if (popupRef.current) {
        popupRef.current.remove();
      }
      map.remove();
      mapRef.current = null;
    };
    // Map instance is intentionally initialized once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update GeoJSON source when features change
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
  }, [activeLayers, mapLoaded]);

  // Update center and zoom when props change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    mapRef.current.flyTo({
      center,
      zoom,
      essential: true,
      duration: 1200,
    });
  }, [center, zoom, mapLoaded]);

  // Update highlight on selected parcel
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    if (map.getLayer('cadastral-polygons-fill')) {
      map.setPaintProperty('cadastral-polygons-fill', 'fill-color', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        '#047857',
        '#059669',
      ]);
      map.setPaintProperty('cadastral-polygons-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'id'], selectedFeatureId || ''],
        0.6,
        0.35,
      ]);
    }
  }, [selectedFeatureId, mapLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden shadow-inner" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm text-emerald-400 z-10">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2.5 text-xs font-semibold text-slate-200">
            Initializing OpenStreetMap GIS Tiles...
          </span>
        </div>
      )}
    </div>
  );
}
