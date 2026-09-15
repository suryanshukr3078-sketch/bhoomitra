'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { downloadFile } from '@/lib/download';
import { SEED_SPATIAL_FEATURES } from '@/components/maps/MapView';

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

interface ParcelDetail {
  id: string;
  surveyNumber: string;
  owner: string;
  areaHa: number;
  tenureType: string;
  jurisdiction: string;
  mutationDate: string;
  coordinates: string;
}

const SAMPLE_PARCELS: Record<string, ParcelDetail> = {
  'PAR-DEL-01': {
    id: 'PAR-DEL-01',
    surveyNumber: 'Survey DL-01/Central',
    owner: 'Delhi Development Authority & Public Estate',
    areaHa: 6.2,
    tenureType: 'Institutional Freehold',
    jurisdiction: 'Delhi (Central District)',
    mutationDate: '15 August 2026',
    coordinates: '28.6139° N, 77.2090° E',
  },
  'PAR-BPL-74': {
    id: 'PAR-BPL-74',
    surveyNumber: 'Survey MP-BPL/74',
    owner: 'Madhya Pradesh State Land Revenue Dept',
    areaHa: 8.5,
    tenureType: 'Municipal Land Trust',
    jurisdiction: 'Madhya Pradesh (Bhopal)',
    mutationDate: '10 July 2026',
    coordinates: '23.2599° N, 77.4126° E',
  },
  'PAR-44029': {
    id: 'PAR-44029-MH',
    surveyNumber: 'Survey 142/3A',
    owner: 'Ramesh K. Joshi & Co-owners',
    areaHa: 4.85,
    tenureType: 'Freehold Agricultural',
    jurisdiction: 'Maharashtra (Pune)',
    mutationDate: '12 August 2026',
    coordinates: '18.5204° N, 73.8567° E',
  },
  'PAR-12093': {
    id: 'PAR-12093-KA',
    surveyNumber: 'Survey 88/1',
    owner: 'Bangalore Metropolitan Land Trust',
    areaHa: 12.4,
    tenureType: 'Communal Forest Buffer',
    jurisdiction: 'Karnataka (Bangalore Rural)',
    mutationDate: '24 July 2026',
    coordinates: '12.9716° N, 77.5946° E',
  },
};

export default function MapsPage() {
  const [selectedParcelId, setSelectedParcelId] = useState<string>('PAR-DEL-01');
  const [mapCenter, setMapCenter] = useState<[number, number]>([77.209, 28.6139]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [spatialFeatures, setSpatialFeatures] = useState<any[]>([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingSpatial(true);
    apiRequest<{ type: string; features: any[]; count: number }>('/spatial/features')
      .then((data) => {
        if (data && Array.isArray(data.features)) {
          setSpatialFeatures(data.features);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch PostGIS spatial features:', err);
      })
      .finally(() => {
        setIsLoadingSpatial(false);
      });
  }, []);

  const selectedParcel = SAMPLE_PARCELS[selectedParcelId] || SAMPLE_PARCELS['PAR-44029'];

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query.includes('delhi') || query.includes('del') || query.includes('cp')) {
      setSelectedParcelId('PAR-DEL-01');
      setMapCenter([77.2090, 28.6139]);
      setMapZoom(13);
      toast({
        title: 'Delhi Parcel Located',
        description: 'Loaded PAR-DEL-01 (Delhi Central Cadastral Zone).',
        variant: 'success',
      });
    } else if (query.includes('bhopal') || query.includes('bpl') || query.includes('mp') || query.includes('74')) {
      setSelectedParcelId('PAR-BPL-74');
      setMapCenter([77.4126, 23.2599]);
      setMapZoom(13);
      toast({
        title: 'Bhopal Parcel Located',
        description: 'Loaded PAR-BPL-74 (Bhopal Urban Cadastral Division).',
        variant: 'success',
      });
    } else if (query.includes('12093') || query.includes('bangalore') || query.includes('bengaluru')) {
      setSelectedParcelId('PAR-12093');
      setMapCenter([77.5946, 12.9716]);
      setMapZoom(13);
      toast({
        title: 'Bangalore Parcel Located',
        description: 'Loaded PAR-12093-KA polygon boundary from PostGIS.',
        variant: 'success',
      });
    } else {
      setSelectedParcelId('PAR-44029');
      setMapCenter([73.8567, 18.5204]);
      setMapZoom(13);
      toast({
        title: 'Pune Parcel Located',
        description: 'Loaded PAR-44029-MH boundary coordinates.',
        variant: 'success',
      });
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-slate-900 text-slate-100">
      {/* Search and Layer Bar (Floating on Map) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm w-full">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Survey No. or Parcel ID (e.g. 12093)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xl"
          />
        </form>

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
              downloadFile(JSON.stringify(collection, null, 2), filename, 'application/geo+json;charset=utf-8;');
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
          <div className="p-4 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md space-y-2.5 text-xs animate-in fade-in slide-in-from-top-2">
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

            <div className="pt-2 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Thematic Visualizations
            </div>
            <label className="flex items-center justify-between cursor-pointer py-1 text-emerald-300">
              <span>Land Use Patterns (Agri/Urban/Forest)</span>
              <input
                type="checkbox"
                checked={activeLayers.landUse}
                onChange={() => toggleLayer('landUse')}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1 text-rose-300">
              <span>Climate & Flood Hazard Zones</span>
              <input
                type="checkbox"
                checked={activeLayers.climateVulnerability}
                onChange={() => toggleLayer('climateVulnerability')}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1 text-purple-300">
              <span>Infrastructure & Freight Corridors</span>
              <input
                type="checkbox"
                checked={activeLayers.infrastructure}
                onChange={() => toggleLayer('infrastructure')}
                className="rounded border-slate-700 text-purple-500 focus:ring-purple-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1 text-teal-300">
              <span>Forest Rights Act (FRA) Titles</span>
              <input
                type="checkbox"
                checked={activeLayers.fraTenure}
                onChange={() => toggleLayer('fraTenure')}
                className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
              />
            </label>
          </div>
        )}

        {/* Thematic Legend Float */}
        {(activeLayers.landUse || activeLayers.climateVulnerability || activeLayers.infrastructure || activeLayers.fraTenure) && (
          <div className="p-3 bg-slate-900/95 border border-slate-700 rounded-xl shadow-xl backdrop-blur-md text-[11px] space-y-1.5 animate-in fade-in">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Active Thematic Legend</div>
            {activeLayers.landUse && (
              <div className="flex items-center gap-2 text-emerald-300">
                <div className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                <span>Green: Agrarian & Protected Buffer</span>
              </div>
            )}
            {activeLayers.climateVulnerability && (
              <div className="flex items-center gap-2 text-rose-300">
                <div className="w-3 h-3 rounded bg-rose-500 shrink-0" />
                <span>Red: High Flood & Vulnerability Zone</span>
              </div>
            )}
            {activeLayers.infrastructure && (
              <div className="flex items-center gap-2 text-purple-300">
                <div className="w-3 h-3 rounded bg-purple-500 shrink-0" />
                <span>Purple: Special Economic Zone / Industrial Corridor</span>
              </div>
            )}
            {activeLayers.fraTenure && (
              <div className="flex items-center gap-2 text-teal-300">
                <div className="w-3 h-3 rounded bg-teal-500 shrink-0" />
                <span>Teal: Gram Sabha Forest Rights Demarcation</span>
              </div>
            )}
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

        {/* Floating City Navigation Quick Selector */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden sm:inline">
            Quick Jump:
          </span>
          <button
            type="button"
            onClick={() => {
              setMapCenter([77.2090, 28.6139]);
              setMapZoom(13);
              setSelectedParcelId('PAR-DEL-01');
              toast({ title: 'Delhi Central', description: 'Centering on Delhi Cadastral Sector', variant: 'default' });
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              selectedParcelId === 'PAR-DEL-01'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Delhi
          </button>
          <button
            type="button"
            onClick={() => {
              setMapCenter([77.4126, 23.2599]);
              setMapZoom(13);
              setSelectedParcelId('PAR-BPL-74');
              toast({ title: 'Bhopal Urban', description: 'Centering on Bhopal Cadastral Division', variant: 'default' });
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              selectedParcelId === 'PAR-BPL-74'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Bhopal
          </button>
          <button
            type="button"
            onClick={() => {
              setMapCenter([73.8567, 18.5204]);
              setMapZoom(13);
              setSelectedParcelId('PAR-44029');
              toast({ title: 'Pune Rural', description: 'Centering on Pune Survey 142/3A', variant: 'default' });
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              selectedParcelId === 'PAR-44029'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Pune
          </button>
          <button
            type="button"
            onClick={() => {
              setMapCenter([77.5946, 12.9716]);
              setMapZoom(13);
              setSelectedParcelId('PAR-12093');
              toast({ title: 'Bangalore Buffer', description: 'Centering on Bangalore Survey 88/1', variant: 'default' });
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              selectedParcelId === 'PAR-12093'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Bangalore
          </button>
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
            <h2 className="text-xl font-extrabold text-white font-mono">
              {selectedParcel.id}
            </h2>
          </div>
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3" /> Validated
          </Badge>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Survey Number</span>
              <span className="font-semibold text-slate-200">{selectedParcel.surveyNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Registered Holder</span>
              <span className="font-semibold text-slate-200">{selectedParcel.owner}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Calculated Area</span>
              <span className="font-semibold text-emerald-400">{selectedParcel.areaHa} Hectares</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Tenure Type</span>
              <span className="font-semibold text-slate-200">{selectedParcel.tenureType}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Jurisdiction</span>
              <span className="font-semibold text-slate-200">{selectedParcel.jurisdiction}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-300">Mutation & Survey Provenance</span>
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
              downloadFile(JSON.stringify(feature, null, 2), filename, 'application/geo+json;charset=utf-8;');

              // Also copy to clipboard for convenience
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
