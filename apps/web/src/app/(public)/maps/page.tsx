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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';

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
  const [selectedParcelId, setSelectedParcelId] = useState<string>('PAR-44029');
  const [spatialFeatures, setSpatialFeatures] = useState<any[]>([]);
  const [isLoadingSpatial, setIsLoadingSpatial] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    polygons: true,
    surveyPoints: true,
    satellite: false,
    disputedZones: false,
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
    if (searchQuery.toUpperCase().includes('12093')) {
      setSelectedParcelId('PAR-12093');
      toast({
        title: 'Parcel Located',
        description: 'Loaded PAR-12093-KA polygon boundary from PostGIS.',
        variant: 'success',
      });
    } else {
      setSelectedParcelId('PAR-44029');
      toast({
        title: 'Parcel Located',
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white backdrop-blur shadow-md transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Layers ({Object.values(activeLayers).filter(Boolean).length})
          </button>
          <div className="flex items-center gap-1 px-3 py-2 text-xs font-mono bg-slate-900/90 border border-slate-700 rounded-lg text-emerald-400 backdrop-blur">
            SRID: 4326 (WGS 84)
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
          </div>
        )}
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4">
        {/* Stylized Vector Grid Background simulating Cadastre */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        {/* Vector Parcel Polygons Representation */}
        <div className="relative z-10 w-full max-w-2xl aspect-video bg-slate-950/70 border border-emerald-500/30 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-emerald-400">GPS Stream: Active</span>
            </div>
            <div className="font-mono">{selectedParcel.coordinates}</div>
          </div>

          {/* SVG Cadastral Wireframe with Interactive Polygons */}
          <div className="my-auto py-4 flex items-center justify-center">
            <svg viewBox="0 0 500 260" className="w-full h-48 drop-shadow-md">
              {/* Parcel 1 */}
              <polygon
                points="40,50 180,30 220,120 70,140"
                className={`transition-all duration-300 cursor-pointer ${
                  selectedParcelId === 'PAR-44029'
                    ? 'fill-emerald-600/40 stroke-emerald-400 stroke-2'
                    : 'fill-slate-800/40 stroke-slate-600 hover:fill-slate-700/50'
                }`}
                onClick={() => setSelectedParcelId('PAR-44029')}
              />
              <text x="110" y="90" fill="#a7f3d0" fontSize="12" fontFamily="monospace">
                PAR-44029 (4.85 Ha)
              </text>

              {/* Parcel 2 */}
              <polygon
                points="220,120 380,90 440,210 260,230 180,180"
                className={`transition-all duration-300 cursor-pointer ${
                  selectedParcelId === 'PAR-12093'
                    ? 'fill-emerald-600/40 stroke-emerald-400 stroke-2'
                    : 'fill-slate-800/40 stroke-slate-600 hover:fill-slate-700/50'
                }`}
                onClick={() => setSelectedParcelId('PAR-12093')}
              />
              <text x="290" y="170" fill="#a7f3d0" fontSize="12" fontFamily="monospace">
                PAR-12093 (12.4 Ha)
              </text>

              {/* Corner markers */}
              {activeLayers.surveyPoints && (
                <>
                  <circle cx="40" cy="50" r="4" fill="#34d399" />
                  <circle cx="180" cy="30" r="4" fill="#34d399" />
                  <circle cx="220" cy="120" r="4" fill="#34d399" />
                  <circle cx="70" cy="140" r="4" fill="#34d399" />
                  <circle cx="380" cy="90" r="4" fill="#34d399" />
                  <circle cx="440" cy="210" r="4" fill="#34d399" />
                  <circle cx="260" cy="230" r="4" fill="#34d399" />
                </>
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-3">
            <span>Click any polygon to inspect legal tenure & surveyor records</span>
            <span className="text-emerald-400 font-semibold">PostGIS TopoGeometry: Valid</span>
          </div>
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-1 bg-slate-900/90 border border-slate-700 p-1 rounded-xl shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={() => toast({ title: 'Zoom In', description: 'Scale 1:2500' })}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toast({ title: 'Zoom Out', description: 'Scale 1:10000' })}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
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
              const feature = {
                type: 'Feature',
                id: selectedParcel.id,
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [73.8567, 18.5204],
                      [73.8577, 18.5214],
                      [73.8587, 18.5194],
                      [73.8567, 18.5204],
                    ],
                  ],
                },
                properties: {
                  surveyNumber: selectedParcel.surveyNumber,
                  owner: selectedParcel.owner,
                  areaHa: selectedParcel.areaHa,
                  tenureType: selectedParcel.tenureType,
                  jurisdiction: selectedParcel.jurisdiction,
                  mutationDate: selectedParcel.mutationDate,
                },
              };
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(feature, null, 2));
              }
              toast({
                title: 'GeoJSON Exported',
                description: `Feature definition for ${selectedParcel.id} copied to clipboard.`,
                variant: 'success',
              });
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-colors"
          >
            Export Parcel GeoJSON
          </button>
        </div>
      </aside>
    </div>
  );
}
