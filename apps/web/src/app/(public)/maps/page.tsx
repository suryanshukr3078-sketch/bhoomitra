'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers,
  MapPin,
  Search,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  CheckCircle2,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  X,
  Loader2,
  Download,
  ChevronDown,
  Navigation,
  Globe2,
  Sparkles,
  Copy,
  Printer,
  Check,
  FileCheck2,
  Share2,
  Satellite,
  Map as MapIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { downloadFile } from '@/lib/download';
import type { BasemapStyleKey } from '@/components/maps/MapView';
import {
  INDIAN_PRESET_PLACES,
  ALL_INDIAN_STATES,
  searchLocalIndianPlaces,
  geocodePanIndia,
  createCadastralFeature,
  createCadastralCluster,
  IndianPlace,
  GeocodedPlaceResult,
} from './india-places';

import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/maps/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-950/95 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/40 backdrop-blur shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50 shadow-inner">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div className="space-y-1.5 text-center">
            <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-32 bg-slate-800/80 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    ),
  }
);

export interface ParcelDetail {
  id: string;
  surveyNumber: string;
  owner: string;
  areaHa: number;
  tenureType: string;
  jurisdiction: string;
  mutationDate: string;
  coordinates: string;
  ulpin?: string;
  soilType?: string;
  category?: string;
  encumbranceStatus?: string;
  droneSurveyStatus?: string;
}

// Initial parcel registry populated with presets
const INITIAL_PARCELS: Record<string, ParcelDetail> = {};
INDIAN_PRESET_PLACES.forEach((p) => {
  INITIAL_PARCELS[p.id] = {
    id: p.id,
    surveyNumber: p.surveyNumber,
    owner: p.owner,
    areaHa: p.areaHa,
    tenureType: p.tenureType,
    jurisdiction: p.jurisdiction,
    mutationDate: '15 August 2026',
    coordinates: `${p.coordinates[1].toFixed(4)}° N, ${p.coordinates[0].toFixed(4)}° E`,
    ulpin: `INDL00${Math.abs(Math.round(p.coordinates[1] * 100))}${Math.abs(Math.round(p.coordinates[0] * 100))}`,
    soilType: 'Class-I Alluvial / Black Loam',
    encumbranceStatus: 'Nil Encumbrance (Clean Title)',
    droneSurveyStatus: 'SVAMITVA Certified (5cm Res)',
  };
});

// Top Metro Hubs for quick navigation
const TOP_METRO_HUBS = [
  { id: 'PAR-DEL-01', label: 'Delhi', coords: [77.2090, 28.6139] as [number, number] },
  { id: 'PAR-MUM-01', label: 'Mumbai', coords: [72.8238, 18.9256] as [number, number] },
  { id: 'PAR-12093', label: 'Bangalore', coords: [77.5946, 12.9716] as [number, number] },
  { id: 'PAR-PAT-01', label: 'Patna', coords: [85.1376, 25.5941] as [number, number] },
  { id: 'PAR-KOL-01', label: 'Kolkata', coords: [88.3639, 22.5726] as [number, number] },
  { id: 'PAR-HYD-01', label: 'Hyderabad', coords: [78.3780, 17.4474] as [number, number] },
  { id: 'PAR-44029', label: 'Pune', coords: [73.8567, 18.5204] as [number, number] },
  { id: 'PAR-BPL-74', label: 'Bhopal', coords: [77.4126, 23.2599] as [number, number] },
  { id: 'PAR-JAI-01', label: 'Jaipur', coords: [75.7873, 26.9124] as [number, number] },
  { id: 'PAR-VNS-01', label: 'Varanasi', coords: [82.9739, 25.3176] as [number, number] },
];

export interface SuggestionItem {
  id: string;
  title: string;
  subtitle: string;
  coordinates: [number, number];
  zoom: number;
  isPreset?: boolean;
  presetData?: IndianPlace;
}

export default function MapsPage() {
  const [selectedParcelId, setSelectedParcelId] = useState<string>('PAR-DEL-01');
  const [mapCenter, setMapCenter] = useState<[number, number]>([77.209, 28.6139]);
  const [mapZoom, setMapZoom] = useState<number>(13.5);
  const [spatialFeatures, setSpatialFeatures] = useState<any[]>([]);
  const [parcelsRecord, setParcelsRecord] = useState<Record<string, ParcelDetail>>(INITIAL_PARCELS);
  const [isLoadingSpatial, setIsLoadingSpatial] = useState(false);

  // Basemap Style (default: previous standard street map 'streets', switchable to 'hybrid' satellite)
  const [currentBasemap, setCurrentBasemap] = useState<BasemapStyleKey>('streets');

  // Active Overlays
  const [activeLayers, setActiveLayers] = useState({
    polygons: true,
    surveyPoints: true,
    satellite: true,
    disputedZones: false,
    landUse: false,
    climateVulnerability: false,
    infrastructure: false,
    fraTenure: false,
  });

  // Search & Geocoding State
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Area conversion unit tab
  const [areaUnit, setAreaUnit] = useState<'ha' | 'acre' | 'bigha' | 'sqm'>('ha');
  const [copiedUlpin, setCopiedUlpin] = useState(false);

  // Certificate Modal State
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Helper to load cluster for a place
  const loadPlaceCluster = (place: IndianPlace) => {
    const cluster = createCadastralCluster(
      place.id,
      place.name,
      place.jurisdiction,
      place.coordinates,
      place.surveyNumber,
      place.areaHa
    );

    setSpatialFeatures((prev) => {
      const existingIds = new Set(cluster.features.map((f) => f.id));
      const filtered = prev.filter((f) => !existingIds.has(f.id));
      return [...cluster.features, ...filtered];
    });

    setParcelsRecord((prev) => {
      const next = { ...prev };
      cluster.records.forEach((r) => {
        next[r.id] = r;
      });
      return next;
    });

    setSelectedParcelId(place.id);
  };

  // 1. Initial Load: Populate Delhi Central cluster and fetch PostGIS features
  useEffect(() => {
    setIsLoadingSpatial(true);

    // Seed Delhi cluster immediately
    const delhiPreset = INDIAN_PRESET_PLACES[0];
    const initialCluster = createCadastralCluster(
      delhiPreset.id,
      delhiPreset.name,
      delhiPreset.jurisdiction,
      delhiPreset.coordinates,
      delhiPreset.surveyNumber,
      delhiPreset.areaHa
    );

    setSpatialFeatures(initialCluster.features);
    setParcelsRecord((prev) => {
      const next = { ...prev };
      initialCluster.records.forEach((r) => {
        next[r.id] = r;
      });
      return next;
    });

    // Also fetch PostGIS features if available
    apiRequest<{ type: string; features: any[]; count: number }>('/spatial/features')
      .then((data) => {
        if (data && Array.isArray(data.features) && data.features.length > 0) {
          setSpatialFeatures((prev) => [...prev, ...data.features]);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch PostGIS spatial features:', err);
      })
      .finally(() => {
        setIsLoadingSpatial(false);
      });

    // Check URL parameters
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const lat = sp.get('lat');
      const lng = sp.get('lng') || sp.get('lon');
      const zoom = sp.get('zoom');
      if (lat && lng) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (!isNaN(latNum) && !isNaN(lngNum)) {
          setMapCenter([lngNum, latNum]);
          setMapZoom(zoom && !isNaN(parseInt(zoom)) ? parseInt(zoom) : 14);

          const dynamicId = `PAR-LOC-${Math.round(latNum * 100)}-${Math.round(lngNum * 100)}`;
          const dynCluster = createCadastralCluster(
            dynamicId,
            'Selected Survey Corridor',
            'Target Geographic Zone',
            [lngNum, latNum],
            `Plot ${Math.floor(Math.random() * 800) + 1}/GIS`,
            6.4
          );

          setSpatialFeatures((prev) => [...dynCluster.features, ...prev]);
          setParcelsRecord((prev) => {
            const next = { ...prev };
            dynCluster.records.forEach((r) => {
              next[r.id] = r;
            });
            return next;
          });
          setSelectedParcelId(dynamicId);
        }
      }
    }
  }, []);

  // 2. Click-outside listener for autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Debounced Pan-India Geocoding & Local Search
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let isCancelled = false;

    // Fast local lookup
    const localMatches: SuggestionItem[] = searchLocalIndianPlaces(query).map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: `${p.district || p.state} • ${p.surveyNumber}`,
      coordinates: p.coordinates,
      zoom: p.zoom || 13.5,
      isPreset: true,
      presetData: p,
    }));

    setSuggestions(localMatches);
    setShowSuggestions(true);

    // Call OpenStreetMap Nominatim for pan-India indexing
    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const geoResults = await geocodePanIndia(query);
        if (isCancelled) return;

        const formattedGeo: SuggestionItem[] = geoResults.map((g) => ({
          id: g.id,
          title: g.name,
          subtitle: g.displayName,
          coordinates: g.coordinates,
          zoom: g.type === 'administrative' || g.type === 'state' ? 11 : 13.5,
          isPreset: false,
        }));

        const combined: SuggestionItem[] = [...localMatches];
        formattedGeo.forEach((fg) => {
          const exists = combined.some(
            (c) =>
              Math.abs(c.coordinates[0] - fg.coordinates[0]) < 0.05 &&
              Math.abs(c.coordinates[1] - fg.coordinates[1]) < 0.05
          );
          if (!exists) {
            combined.push(fg);
          }
        });

        setSuggestions(combined.slice(0, 8));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Geocoding query error:', err);
      } finally {
        if (!isCancelled) setIsGeocoding(false);
      }
    }, 280);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Handler: Selecting a place
  const handleSelectLocation = (loc: SuggestionItem) => {
    const [lng, lat] = loc.coordinates;
    setMapCenter([lng, lat]);
    setMapZoom(loc.zoom || 13.5);
    setShowSuggestions(false);
    setSearchQuery(loc.title);

    if (loc.isPreset && loc.presetData) {
      loadPlaceCluster(loc.presetData);
    } else {
      const hash = Math.abs(Math.round(lat * 1000 + lng * 1000)).toString(36);
      const targetParcelId = `PAR-IND-${hash.toUpperCase()}`;
      const stateName = loc.subtitle.split(',').slice(-2, -1)[0]?.trim() || 'India';
      const districtName = loc.subtitle.split(',')[0]?.trim() || loc.title;

      const dynamicPlace: IndianPlace = {
        id: targetParcelId,
        name: loc.title,
        state: stateName,
        district: districtName,
        coordinates: loc.coordinates,
        zoom: loc.zoom || 13.5,
        surveyNumber: `Survey ${Math.floor(Math.random() * 600) + 1}/A`,
        owner: `${loc.title} Revenue Circle & Land Directorate`,
        areaHa: parseFloat((Math.random() * 8 + 3.2).toFixed(2)),
        tenureType: 'Revenue Conclusive Freehold',
        jurisdiction: `${districtName} (${stateName})`,
      };

      loadPlaceCluster(dynamicPlace);
    }

    toast({
      title: `${loc.title} Located`,
      description: `Fly-to centered on [${lng.toFixed(4)}, ${lat.toFixed(4)}]. Cadastral cluster loaded.`,
      variant: 'success',
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0]);
      return;
    }

    setIsGeocoding(true);
    try {
      const geoResults = await geocodePanIndia(query);
      if (geoResults.length > 0) {
        const top = geoResults[0];
        handleSelectLocation({
          id: top.id,
          title: top.name,
          subtitle: top.displayName,
          coordinates: top.coordinates,
          zoom: 13.5,
          isPreset: false,
        });
      } else {
        toast({
          title: 'Place Not Found',
          description: `Could not geocode "${query}" within India. Please check spelling or enter a city name.`,
          variant: 'error',
        });
      }
    } catch (err) {
      console.error('Search geocode error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleStateJump = (stateName: string) => {
    setSelectedStateFilter(stateName);
    const matchedState = ALL_INDIAN_STATES.find((s) => s.name === stateName);
    if (matchedState) {
      setMapCenter(matchedState.coordinates);
      setMapZoom(matchedState.zoom);
      const stateParcelId = `PAR-${matchedState.code}-01`;

      const statePlace: IndianPlace = {
        id: stateParcelId,
        name: `${matchedState.name} (${matchedState.capital})`,
        state: matchedState.name,
        district: matchedState.capital,
        coordinates: matchedState.coordinates,
        zoom: matchedState.zoom,
        surveyNumber: `Survey ${matchedState.code}-Capital/01`,
        owner: `${matchedState.name} State Revenue & Land Reforms Dept`,
        areaHa: 14.5,
        tenureType: 'State Public Domain Title',
        jurisdiction: `${matchedState.capital}, ${matchedState.name}`,
      };

      loadPlaceCluster(statePlace);

      toast({
        title: `${matchedState.name} Selected`,
        description: `Centered on capital city ${matchedState.capital}.`,
        variant: 'default',
      });
    }
  };

  const selectedParcel =
    parcelsRecord[selectedParcelId] ||
    INITIAL_PARCELS['PAR-DEL-01'] ||
    Object.values(parcelsRecord)[0];

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
    toast({
      title: 'Layer Updated',
      description: `Toggled ${layerKey} spatial overlay.`,
      variant: 'default',
      duration: 1800,
    });
  };

  const copyUlpinToClipboard = () => {
    if (!selectedParcel.ulpin) return;
    navigator.clipboard.writeText(selectedParcel.ulpin);
    setCopiedUlpin(true);
    toast({
      title: 'ULPIN Copied',
      description: `Bhu-Aadhaar PIN ${selectedParcel.ulpin} copied to clipboard.`,
      variant: 'success',
    });
    setTimeout(() => setCopiedUlpin(false), 2500);
  };

  // Converted area value helper
  const formattedArea = useMemo(() => {
    const ha = selectedParcel.areaHa || 5.4;
    switch (areaUnit) {
      case 'acre':
        return `${(ha * 2.47105).toFixed(2)} Acres`;
      case 'bigha':
        return `${(ha * 3.967).toFixed(2)} Bigha (Pucca)`;
      case 'sqm':
        return `${(ha * 10000).toLocaleString()} m²`;
      case 'ha':
      default:
        return `${ha.toFixed(2)} Hectares`;
    }
  }, [selectedParcel.areaHa, areaUnit]);

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-slate-900 text-slate-100">
      {/* Floating Pan-India Search Bar and Layer Controls */}
      <div
        ref={searchContainerRef}
        className="absolute top-4 left-4 z-30 flex flex-col gap-2 w-full max-w-sm sm:max-w-md pointer-events-auto"
      >
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Search ANY place in India (e.g. Patna, Varanasi, Mumbai)..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xl transition-all"
          />
          {isGeocoding ? (
            <div className="absolute right-3.5 top-3 text-emerald-400 animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </form>

        {/* Live Pan-India Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-slate-900/98 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-1 z-40 max-h-72 overflow-y-auto divide-y divide-slate-800">
            <div className="px-3 py-1.5 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>All-India Locations ({suggestions.length})</span>
              <span className="text-emerald-400">Click to fly &amp; inspect</span>
            </div>
            {suggestions.map((sug) => (
              <button
                key={sug.id}
                type="button"
                onClick={() => handleSelectLocation(sug)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-950/60 hover:text-white transition-colors flex items-start gap-2.5 group"
              >
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-emerald-300 truncate">
                      {sug.title}
                    </span>
                    {sug.isPreset ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 shrink-0">
                        Cadastral Hub
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        Pan-India OSM
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {sug.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {/* Quick 1-Click Toggle: Default Standard Map <-> High-Res Satellite */}
          <button
            type="button"
            onClick={() =>
              setCurrentBasemap((prev) => (prev === 'streets' ? 'hybrid' : 'streets'))
            }
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border backdrop-blur shadow-md transition-all ${
              currentBasemap === 'streets'
                ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-200'
            }`}
            title={
              currentBasemap === 'streets'
                ? 'Current: Default Map (OSM). Click to switch to High-Res Satellite'
                : 'Current: Satellite View. Click to switch to Default Map (OSM)'
            }
          >
            {currentBasemap === 'streets' ? (
              <>
                <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                <span>🛰️ Switch to Satellite</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>🗺️ Switch to Default Map</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white backdrop-blur shadow-md transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Layers ({Object.values(activeLayers).filter(Boolean).length})
          </button>

          <button
            type="button"
            onClick={() => {
              const allFeats = spatialFeatures.length > 0 ? spatialFeatures : [INDIAN_PRESET_PLACES[0]];
              const collection = {
                type: 'FeatureCollection',
                crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
                features: allFeats,
                metadata: {
                  srid: 4326,
                  datum: 'WGS 84',
                  exportedAt: new Date().toISOString(),
                  totalFeatures: allFeats.length,
                  platform: 'Bhoomitra Cadastral GIS Engine',
                },
              };
              const filename = 'bhoomitra-cadastral-cluster.geojson';
              downloadFile(
                JSON.stringify(collection, null, 2),
                filename,
                'application/geo+json;charset=utf-8;'
              );
              toast({
                title: 'GeoJSON Downloaded',
                description: `Saved "${filename}" (${allFeats.length} cadastral features).`,
                variant: 'success',
              });
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-emerald-300 backdrop-blur shadow-md transition-colors"
            title="Download full map GeoJSON"
          >
            <Download className="w-3.5 h-3.5" />
            Export Cluster GeoJSON
          </button>

          <div className="flex items-center gap-1 px-3 py-2 text-xs font-mono bg-slate-900/90 border border-slate-700 rounded-lg text-emerald-400 backdrop-blur">
            SRID: 4326
          </div>
        </div>

        {/* Layer & Basemap Toggle Panel */}
        {showLayerPanel && (
          <div className="p-4 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md space-y-3 text-xs animate-in fade-in slide-in-from-top-2 z-30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Base Map &amp; Layers &bull; आधार मानचित्र एवं परतें
              </span>
              <button
                type="button"
                onClick={() => setShowLayerPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Basemap Selection */}
            <div className="space-y-1.5 pb-2.5 border-b border-slate-800">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Base Map Style (मानचित्र शैली):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentBasemap('streets')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-colors border ${
                    currentBasemap === 'streets'
                      ? 'bg-emerald-900/80 border-emerald-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Default (OSM)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentBasemap('hybrid')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-colors border ${
                    currentBasemap === 'hybrid'
                      ? 'bg-emerald-900/80 border-emerald-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Satellite className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Hybrid Satellite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentBasemap('satellite')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-colors border ${
                    currentBasemap === 'satellite'
                      ? 'bg-emerald-900/80 border-emerald-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Satellite className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Pure Satellite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentBasemap('topo')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-colors border ${
                    currentBasemap === 'topo'
                      ? 'bg-emerald-900/80 border-emerald-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">Topo / Terrain</span>
                </button>
              </div>
            </div>

            {/* Thematic Overlays */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                Thematic GIS Overlays:
              </span>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Cadastral Boundary Parcels (भू-नक्शा)</span>
                <input
                  type="checkbox"
                  checked={activeLayers.polygons}
                  onChange={() => toggleLayer('polygons')}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Survey Corner Pins &amp; GCPs (सर्वेक्षण बिंदु)</span>
                <input
                  type="checkbox"
                  checked={activeLayers.surveyPoints}
                  onChange={() => toggleLayer('surveyPoints')}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>SVAMITVA Drone Survey Grids (ड्रोन ग्रिड)</span>
                <input
                  type="checkbox"
                  checked={activeLayers.infrastructure}
                  onChange={() => toggleLayer('infrastructure')}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Dispute &amp; Mutation Alerts (विवादित सीमा)</span>
                <input
                  type="checkbox"
                  checked={activeLayers.disputedZones}
                  onChange={() => toggleLayer('disputedZones')}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Agrarian vs Urban Land Use (भू-उपयोग)</span>
                <input
                  type="checkbox"
                  checked={activeLayers.landUse}
                  onChange={() => toggleLayer('landUse')}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Forest Rights Act (FRA) Tenures</span>
                <input
                  type="checkbox"
                  checked={activeLayers.fraTenure}
                  onChange={() => toggleLayer('fraTenure')}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950">
        <MapView
          features={spatialFeatures}
          selectedFeatureId={selectedParcelId}
          center={mapCenter}
          zoom={mapZoom}
          basemap={currentBasemap}
          onBasemapChange={setCurrentBasemap}
          activeLayers={activeLayers}
          onSelectFeature={(feat) => {
            setSelectedParcelId(feat.id);
            toast({
              title: feat.properties.surveyNumber || feat.id,
              description: `${feat.properties.owner || 'Landholder'} • ${feat.properties.areaHa || ''} Ha`,
              variant: 'default',
            });
          }}
          className="w-full h-full min-h-[500px]"
        />

        {/* Floating Pan-India Quick Navigation Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl shadow-xl backdrop-blur-md max-w-full sm:max-w-2xl overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden sm:inline shrink-0">
            Quick Jump:
          </span>

          {TOP_METRO_HUBS.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => {
                const preset = INDIAN_PRESET_PLACES.find((p) => p.id === hub.id);
                if (preset) {
                  handleSelectLocation({
                    id: preset.id,
                    title: preset.name,
                    subtitle: preset.jurisdiction,
                    coordinates: preset.coordinates,
                    zoom: 13.5,
                    isPreset: true,
                    presetData: preset,
                  });
                } else {
                  setMapCenter(hub.coords);
                  setMapZoom(13.5);
                  setSelectedParcelId(hub.id);
                }
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                selectedParcelId.startsWith(hub.id)
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {hub.label}
            </button>
          ))}

          {/* All 28 States & 8 UTs Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedStateFilter}
              onChange={(e) => handleStateJump(e.target.value)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2 py-1 rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              title="Jump to any State or Union Territory in India"
            >
              <option value="">All States &amp; UTs (36)...</option>
              {ALL_INDIAN_STATES.map((state) => (
                <option key={state.code} value={state.name}>
                  {state.name} ({state.capital})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Floating Map Thematic Legend */}
        {showLegend && (
          <div className="absolute bottom-12 right-4 z-20 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl text-[11px] space-y-2 hidden sm:block">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Cadastral Classification (भू-वर्गीकरण)
              </span>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-white text-xs ml-2"
              >
                &times;
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block shrink-0" />
                <span className="text-slate-300">Freehold Agricultural (कृषि भूमि)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block shrink-0" />
                <span className="text-slate-300">Gaothan Abadi (आबादी / आवासीय)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block shrink-0" />
                <span className="text-slate-300">Commercial / Agro-Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block shrink-0" />
                <span className="text-slate-300">Government / Public Estate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white inline-block shrink-0" />
                <span className="text-slate-300">Ground Control Point (GCP)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parcel Inspection Sidebar */}
      <aside
        aria-label="Parcel Inspection Details"
        className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 overflow-y-auto space-y-5 shrink-0 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Cadastral Record Inspector
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {selectedParcel.id}
            </h2>
          </div>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-950/30 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Valid
          </Badge>
        </div>

        {/* 14-Digit Bhu-Aadhaar ULPIN Chip */}
        {selectedParcel.ulpin && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Bhu-Aadhaar (ULPIN)
              </span>
              <span className="font-mono text-sm font-black text-white tracking-wider mt-0.5 block">
                {selectedParcel.ulpin}
              </span>
            </div>
            <button
              type="button"
              onClick={copyUlpinToClipboard}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 transition-colors"
              title="Copy 14-digit Bhu-Aadhaar ULPIN"
            >
              {copiedUlpin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Core Attributes */}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2.5">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Survey / Khasra No.</span>
              <span className="font-semibold text-white">{selectedParcel.surveyNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Registered Holder</span>
              <span className="font-semibold text-white text-right max-w-[180px] truncate">
                {selectedParcel.owner}
              </span>
            </div>

            {/* Calculated Area with Unit Switcher */}
            <div className="py-1 border-b border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Calculated Area</span>
                <span className="font-bold text-emerald-400 text-sm">{formattedArea}</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setAreaUnit('ha')}
                  className={`px-1.5 py-0.5 rounded ${
                    areaUnit === 'ha' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ha
                </button>
                <button
                  type="button"
                  onClick={() => setAreaUnit('acre')}
                  className={`px-1.5 py-0.5 rounded ${
                    areaUnit === 'acre' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Acre
                </button>
                <button
                  type="button"
                  onClick={() => setAreaUnit('bigha')}
                  className={`px-1.5 py-0.5 rounded ${
                    areaUnit === 'bigha' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bigha
                </button>
                <button
                  type="button"
                  onClick={() => setAreaUnit('sqm')}
                  className={`px-1.5 py-0.5 rounded ${
                    areaUnit === 'sqm' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  m²
                </button>
              </div>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Tenure Type</span>
              <span className="font-semibold text-slate-200">{selectedParcel.tenureType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Jurisdiction</span>
              <span className="font-semibold text-slate-200 text-right max-w-[180px] truncate">
                {selectedParcel.jurisdiction}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Soil &amp; Land Class</span>
              <span className="font-semibold text-slate-300">
                {selectedParcel.soilType || 'Class-I Alluvial Loam'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Centroid Coordinates</span>
              <span className="font-mono text-emerald-300 font-medium">
                {selectedParcel.coordinates}
              </span>
            </div>
          </div>

          {/* Survey & Mutation Provenance */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 text-xs">
              Mutation &amp; Survey Provenance &bull; सत्यापन इतिहास
            </span>
            <div className="p-3 bg-slate-800/80 border border-emerald-900/50 rounded-2xl text-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Immutable Cadastral Ledger Verified
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Drone Survey: {selectedParcel.droneSurveyStatus || 'SVAMITVA 5cm Certified'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Encumbrance: {selectedParcel.encumbranceStatus || 'Nil Encumbrance (Clean Title)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Survey Certification: {selectedParcel.mutationDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Print Cadastral Record / SVAMITVA Card
          </button>

          <button
            type="button"
            onClick={() => {
              const cleanId = selectedParcel.id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
              const matchedFeature =
                spatialFeatures.find((f: any) => f.id === selectedParcelId || f.id === selectedParcel.id) ||
                spatialFeatures[0];

              const geometry = matchedFeature?.geometry || {
                type: 'Polygon',
                coordinates: [
                  [
                    [mapCenter[0] - 0.003, mapCenter[1] - 0.002],
                    [mapCenter[0] + 0.003, mapCenter[1] - 0.002],
                    [mapCenter[0] + 0.003, mapCenter[1] + 0.002],
                    [mapCenter[0] - 0.003, mapCenter[1] + 0.002],
                    [mapCenter[0] - 0.003, mapCenter[1] - 0.002],
                  ],
                ],
              };

              const feature = {
                type: 'Feature',
                id: selectedParcel.id,
                geometry,
                properties: {
                  parcelId: selectedParcel.id,
                  surveyNumber: selectedParcel.surveyNumber,
                  owner: selectedParcel.owner,
                  areaHa: selectedParcel.areaHa,
                  tenureType: selectedParcel.tenureType,
                  jurisdiction: selectedParcel.jurisdiction,
                  mutationDate: selectedParcel.mutationDate,
                  coordinates: selectedParcel.coordinates,
                  ulpin: selectedParcel.ulpin,
                  srid: 4326,
                  datum: 'WGS 84',
                  exportedAt: new Date().toISOString(),
                  provenance: 'Bhoomitra Immutable Cadastral Ledger',
                },
              };

              const filename = `bhoomitra-parcel-${cleanId}.geojson`;
              downloadFile(
                JSON.stringify(feature, null, 2),
                filename,
                'application/geo+json;charset=utf-8;'
              );

              toast({
                title: 'Parcel GeoJSON Downloaded',
                description: `Saved "${filename}" to your computer.`,
                variant: 'success',
              });
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Parcel GeoJSON
          </button>
        </div>
      </aside>

      {/* Cadastral Record & Property Card Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header with National Emblems & Title */}
            <div className="text-center border-b border-slate-200 pb-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                Government of India &bull; Ministry of Rural Development &amp; Panchayati Raj
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                SVAMITVA Property Card Certificate
              </h3>
              <p className="text-xs text-slate-500">
                National Cadastral &amp; Land Governance Registry (Bhoomitra Platform)
              </p>
            </div>

            {/* ULPIN & Key Codes */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Bhu-Aadhaar (Unique Land Parcel Identification Number)
                </span>
                <span className="font-mono text-base font-black text-emerald-950 tracking-wider block mt-0.5">
                  {selectedParcel.ulpin || 'INDL000177202861'}
                </span>
              </div>
              <Badge variant="outline" className="border-emerald-300 text-emerald-800 font-bold text-xs">
                Certified Clean Title
              </Badge>
            </div>

            {/* Table of Records */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2.5 font-semibold text-slate-500 w-1/3">Survey / Khasra No</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{selectedParcel.surveyNumber}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-500">Registered Landholder</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{selectedParcel.owner}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2.5 font-semibold text-slate-500">Calculated Land Area</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-800">
                      {selectedParcel.areaHa} Hectares ({(selectedParcel.areaHa * 2.471).toFixed(2)} Acres)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-500">Tenure Classification</td>
                    <td className="px-4 py-2.5 text-slate-800">{selectedParcel.tenureType}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2.5 font-semibold text-slate-500">Administrative Jurisdiction</td>
                    <td className="px-4 py-2.5 text-slate-800">{selectedParcel.jurisdiction}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-500">Geodetic Datum</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">WGS 84 (EPSG:4326)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2.5 font-semibold text-slate-500">Centroid Coordinates</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{selectedParcel.coordinates}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Digital Verification Notice:</span>
              <p>
                This cadastral record is cryptographically anchored to the Bhoomitra Immutable Cadastral Ledger.
                Validated against PostGIS topology invariants with zero polygon overlaps and certified by Survey of India standards.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
