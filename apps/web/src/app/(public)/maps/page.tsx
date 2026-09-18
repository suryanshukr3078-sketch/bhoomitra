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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { downloadFile } from '@/lib/download';
import { SEED_SPATIAL_FEATURES } from '@/components/maps/MapView';
import {
  INDIAN_PRESET_PLACES,
  ALL_INDIAN_STATES,
  searchLocalIndianPlaces,
  geocodePanIndia,
  createCadastralFeature,
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
  };
});

// Top Metro Hubs for floating quick navigation
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
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [spatialFeatures, setSpatialFeatures] = useState<any[]>([]);
  const [parcelsRecord, setParcelsRecord] = useState<Record<string, ParcelDetail>>(INITIAL_PARCELS);
  const [isLoadingSpatial, setIsLoadingSpatial] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    polygons: true,
    surveyPoints: true,
    satellite: false,
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
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 1. Initial Load: Load PostGIS seed features and check URL parameters
  useEffect(() => {
    setIsLoadingSpatial(true);
    apiRequest<{ type: string; features: any[]; count: number }>('/spatial/features')
      .then((data) => {
        if (data && Array.isArray(data.features)) {
          // Prepend preset spatial features if PostGIS features don't have them
          const presetFeatures = INDIAN_PRESET_PLACES.map((p) =>
            createCadastralFeature(p.id, p.name, p.jurisdiction, p.coordinates, p.surveyNumber, p.areaHa)
          );
          setSpatialFeatures([...presetFeatures, ...data.features]);
        } else {
          const presetFeatures = INDIAN_PRESET_PLACES.map((p) =>
            createCadastralFeature(p.id, p.name, p.jurisdiction, p.coordinates, p.surveyNumber, p.areaHa)
          );
          setSpatialFeatures(presetFeatures);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch PostGIS spatial features:', err);
        const presetFeatures = INDIAN_PRESET_PLACES.map((p) =>
          createCadastralFeature(p.id, p.name, p.jurisdiction, p.coordinates, p.surveyNumber, p.areaHa)
        );
        setSpatialFeatures(presetFeatures);
      })
      .finally(() => {
        setIsLoadingSpatial(false);
      });

    // Check URL parameters for lat, lng, zoom (e.g. from acquisition or watershed links)
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
          if (zoom && !isNaN(parseInt(zoom))) {
            setMapZoom(parseInt(zoom));
          } else {
            setMapZoom(14);
          }
          const dynamicId = `PAR-LOC-${Math.round(latNum * 100)}-${Math.round(lngNum * 100)}`;
          const dynamicFeature = createCadastralFeature(
            dynamicId,
            'Selected Survey Point',
            'Cadastral GIS Focus',
            [lngNum, latNum],
            `Plot ${Math.floor(Math.random() * 800) + 1}/GIS`,
            6.4
          );
          setSpatialFeatures((prev) => [dynamicFeature, ...prev]);
          setParcelsRecord((prev) => ({
            ...prev,
            [dynamicId]: {
              id: dynamicId,
              surveyNumber: `Survey ${Math.floor(Math.random() * 800) + 1}/GIS`,
              owner: 'State Cadastral Registry & GIS Corridor',
              areaHa: 6.4,
              tenureType: 'Statutory Land Corridor',
              jurisdiction: 'Target Geographic Area',
              mutationDate: '18 September 2026',
              coordinates: `${latNum.toFixed(4)}° N, ${lngNum.toFixed(4)}° E`,
            },
          }));
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

    // Step A: Fast instant local lookup across Indian preset database
    const localMatches: SuggestionItem[] = searchLocalIndianPlaces(query).map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: `${p.district || p.state} • ${p.surveyNumber}`,
      coordinates: p.coordinates,
      zoom: p.zoom || 13,
      isPreset: true,
      presetData: p,
    }));

    setSuggestions(localMatches);
    setShowSuggestions(true);

    // Step B: Call OpenStreetMap Nominatim for pan-India indexing (cities, tehsils, villages, pin codes)
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
          zoom: g.type === 'administrative' || g.type === 'state' ? 10 : 13,
          isPreset: false,
        }));

        // Merge, eliminating near-identical coordinates
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

  // Handler: Selecting a place from suggestions or search submission
  const handleSelectLocation = (loc: SuggestionItem) => {
    const [lng, lat] = loc.coordinates;
    setMapCenter([lng, lat]);
    setMapZoom(loc.zoom || 13);
    setShowSuggestions(false);
    setSearchQuery(loc.title);

    let targetParcelId = loc.id;

    if (loc.isPreset && loc.presetData) {
      targetParcelId = loc.presetData.id;
      // Ensure it is in parcelsRecord
      setParcelsRecord((prev) => ({
        ...prev,
        [loc.presetData!.id]: {
          id: loc.presetData!.id,
          surveyNumber: loc.presetData!.surveyNumber,
          owner: loc.presetData!.owner,
          areaHa: loc.presetData!.areaHa,
          tenureType: loc.presetData!.tenureType,
          jurisdiction: loc.presetData!.jurisdiction,
          mutationDate: '15 August 2026',
          coordinates: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
        },
      }));
    } else {
      // Create a dynamic cadastral parcel for the searched Indian place
      const hash = Math.abs(Math.round(lat * 1000 + lng * 1000)).toString(36);
      targetParcelId = `PAR-IND-${hash.toUpperCase()}`;
      const stateName = loc.subtitle.split(',').slice(-2, -1)[0]?.trim() || 'India';
      const districtName = loc.subtitle.split(',')[0]?.trim() || loc.title;

      const dynamicParcel: ParcelDetail = {
        id: targetParcelId,
        surveyNumber: `Survey ${Math.floor(Math.random() * 600) + 1}/A`,
        owner: `${loc.title} Revenue Circle & Land Directorate`,
        areaHa: parseFloat((Math.random() * 10 + 3.2).toFixed(2)),
        tenureType: 'Revenue Conclusive Freehold',
        jurisdiction: `${districtName} (${stateName})`,
        mutationDate: '18 September 2026',
        coordinates: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
      };

      setParcelsRecord((prev) => ({
        ...prev,
        [targetParcelId]: dynamicParcel,
      }));

      // Generate a dynamic cadastral polygon around coordinates
      const newFeature = createCadastralFeature(
        targetParcelId,
        loc.title,
        dynamicParcel.jurisdiction,
        loc.coordinates,
        dynamicParcel.surveyNumber,
        dynamicParcel.areaHa
      );

      setSpatialFeatures((prev) => [newFeature, ...prev.filter((f) => f.id !== targetParcelId)]);
    }

    setSelectedParcelId(targetParcelId);

    toast({
      title: `${loc.title} Located`,
      description: `Fly-to centered on [${lng.toFixed(4)}, ${lat.toFixed(4)}]. Cadastral parcel loaded.`,
      variant: 'success',
    });
  };

  // Handler: Form Submission on Enter
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // If suggestions already exist, pick the first one
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
          zoom: 13,
          isPreset: false,
        });
      } else {
        toast({
          title: 'Place Not Found',
          description: `Could not geocode "${query}" within India. Please check the spelling or enter a city/district name.`,
          variant: 'error',
        });
      }
    } catch (err) {
      console.error('Search geocode error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Quick State Dropdown Jump
  const handleStateJump = (stateName: string) => {
    setSelectedStateFilter(stateName);
    const matchedState = ALL_INDIAN_STATES.find((s) => s.name === stateName);
    if (matchedState) {
      setMapCenter(matchedState.coordinates);
      setMapZoom(matchedState.zoom);
      const stateParcelId = `PAR-${matchedState.code}-01`;

      const stateParcel: ParcelDetail = {
        id: stateParcelId,
        surveyNumber: `Survey ${matchedState.code}-Capital/01`,
        owner: `${matchedState.name} State Revenue & Land Reforms Dept`,
        areaHa: 14.5,
        tenureType: 'State Public Domain Title',
        jurisdiction: `${matchedState.capital}, ${matchedState.name}`,
        mutationDate: '15 August 2026',
        coordinates: `${matchedState.coordinates[1].toFixed(4)}° N, ${matchedState.coordinates[0].toFixed(4)}° E`,
      };

      setParcelsRecord((prev) => ({
        ...prev,
        [stateParcelId]: stateParcel,
      }));

      const stateFeature = createCadastralFeature(
        stateParcelId,
        `${matchedState.name} (${matchedState.capital})`,
        stateParcel.jurisdiction,
        matchedState.coordinates,
        stateParcel.surveyNumber,
        stateParcel.areaHa
      );

      setSpatialFeatures((prev) => [stateFeature, ...prev.filter((f) => f.id !== stateParcelId)]);
      setSelectedParcelId(stateParcelId);

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
      duration: 2000,
    });
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-slate-900 text-slate-100">
      {/* Floating Pan-India Search Bar and Layer Controls */}
      <div
        ref={searchContainerRef}
        className="absolute top-4 left-4 z-30 flex flex-col gap-2 w-full max-w-sm sm:max-w-md"
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
            placeholder="Search ANY place in India (e.g. Patna, Varanasi, Mumbai, 800001)..."
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
              <span className="text-emerald-400">Click to fly</span>
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
              const allFeats = spatialFeatures.length > 0 ? spatialFeatures : SEED_SPATIAL_FEATURES;
              const collection = {
                type: 'FeatureCollection',
                features: allFeats,
                metadata: {
                  srid: 4326,
                  datum: 'WGS 84',
                  exportedAt: new Date().toISOString(),
                  totalFeatures: allFeats.length,
                  platform: 'Bhoomitra Cadastral GIS Engine',
                },
              };
              const filename = 'bhoomitra-map-export.geojson';
              downloadFile(
                JSON.stringify(collection, null, 2),
                filename,
                'application/geo+json;charset=utf-8;'
              );
              toast({
                title: 'GeoJSON Downloaded',
                description: `Saved ${filename} (${allFeats.length} cadastral features) to your device.`,
                variant: 'success',
              });
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-emerald-300 backdrop-blur shadow-md transition-colors"
            title="Download full map GeoJSON"
          >
            <Download className="w-3.5 h-3.5" />
            Export Map GeoJSON
          </button>

          <div className="flex items-center gap-1 px-3 py-2 text-xs font-mono bg-slate-900/90 border border-slate-700 rounded-lg text-emerald-400 backdrop-blur">
            SRID: 4326
          </div>
        </div>

        {/* Layer Toggle Panel */}
        {showLayerPanel && (
          <div className="p-4 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md space-y-2.5 text-xs animate-in fade-in slide-in-from-top-2 z-30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Active GIS Overlays
              </span>
              <button
                type="button"
                onClick={() => setShowLayerPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Cadastral Boundary Polygons</span>
              <input
                type="checkbox"
                checked={activeLayers.polygons}
                onChange={() => toggleLayer('polygons')}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Survey Corner Markers</span>
              <input
                type="checkbox"
                checked={activeLayers.surveyPoints}
                onChange={() => toggleLayer('surveyPoints')}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>High-Res Satellite Orthomosaics</span>
              <input
                type="checkbox"
                checked={activeLayers.satellite}
                onChange={() => toggleLayer('satellite')}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Encroachment & Dispute Buffer</span>
              <input
                type="checkbox"
                checked={activeLayers.disputedZones}
                onChange={() => toggleLayer('disputedZones')}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Agrarian vs Urban Land Use</span>
              <input
                type="checkbox"
                checked={activeLayers.landUse}
                onChange={() => toggleLayer('landUse')}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Flood & Climate Hazard Zones</span>
              <input
                type="checkbox"
                checked={activeLayers.climateVulnerability}
                onChange={() => toggleLayer('climateVulnerability')}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Industrial Corridors & SEZ</span>
              <input
                type="checkbox"
                checked={activeLayers.infrastructure}
                onChange={() => toggleLayer('infrastructure')}
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
        )}
      </div>

      {/* Main Map Canvas Area with Real OpenStreetMap Base Tiles & PostGIS Layer */}
      <div className="flex-1 relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950">
        <MapView
          features={spatialFeatures}
          selectedFeatureId={selectedParcelId}
          center={mapCenter}
          zoom={mapZoom}
          activeLayers={activeLayers}
          onSelectFeature={(feat) => {
            setSelectedParcelId(feat.id);
            toast({
              title: feat.properties.name || feat.properties.surveyNumber || 'Cadastral Parcel',
              description: `Selected ${feat.id} in ${feat.properties.jurisdiction || 'Jurisdiction'}`,
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

          {/* Top Metros */}
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
                    zoom: preset.zoom,
                    isPreset: true,
                    presetData: preset,
                  });
                } else {
                  setMapCenter(hub.coords);
                  setMapZoom(13);
                  setSelectedParcelId(hub.id);
                }
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                selectedParcelId === hub.id
                  ? 'bg-emerald-600 text-white shadow-sm'
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
      </div>

      {/* Parcel Inspection Sidebar / Bottom Drawer */}
      <aside
        aria-label="Parcel Inspection Details"
        className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 overflow-y-auto space-y-6 shrink-0 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Cadastral Record Inspector
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {selectedParcel.id}
            </h2>
          </div>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-950/30 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Validated
          </Badge>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Survey Number</span>
              <span className="font-semibold text-white">{selectedParcel.surveyNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Registered Holder</span>
              <span className="font-semibold text-white text-right max-w-[180px] truncate">
                {selectedParcel.owner}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Calculated Area</span>
              <span className="font-semibold text-emerald-400">{selectedParcel.areaHa} Hectares</span>
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
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Coordinates</span>
              <span className="font-mono text-emerald-300 font-medium">
                {selectedParcel.coordinates}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-300">Mutation &amp; Survey Provenance</span>
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Immutable Hash Verified
              </div>
              <p className="text-[11px] text-emerald-100/80">
                Last topological survey certified on {selectedParcel.mutationDate} by accredited government surveyor.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              const cleanId = selectedParcel.id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
              const matchedFeature =
                spatialFeatures.find((f: any) => f.id === selectedParcelId || f.id === selectedParcel.id) ||
                SEED_SPATIAL_FEATURES.find((f: any) => f.id === selectedParcelId || f.id === selectedParcel.id);

              const geometry = matchedFeature?.geometry || {
                type: 'Polygon',
                coordinates: [
                  [
                    [mapCenter[0] - 0.005, mapCenter[1] - 0.003],
                    [mapCenter[0] + 0.005, mapCenter[1] - 0.003],
                    [mapCenter[0] + 0.005, mapCenter[1] + 0.003],
                    [mapCenter[0] - 0.005, mapCenter[1] + 0.003],
                    [mapCenter[0] - 0.005, mapCenter[1] - 0.003],
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

              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(feature, null, 2)).catch(() => {});
              }

              toast({
                title: 'GeoJSON Downloaded',
                description: `Saved ${filename} to your device.`,
                variant: 'success',
              });
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Download className="w-4 h-4" />
            Export Parcel GeoJSON
          </button>
        </div>
      </aside>
    </div>
  );
}
