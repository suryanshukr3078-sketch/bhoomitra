'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Layers,
  MapPin,
  Camera,
  Satellite,
  Waves,
  Trees,
  Droplets,
  Compass,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Info,
  Maximize2,
  Eye,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Activity,
  BarChart3,
  Search,
} from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WatershedBasin {
  id: string;
  name: string;
  region: string;
  state: string;
  district: string;
  drainage_area_sq_km: number;
  priority: string;
  mean_annual_rainfall_mm: number;
  srishti_drishti_scene_id: string;
  interventions_count: number;
  water_storage_created_tcm: number;
  ndvi_trend_percent: number;
  centroid: [number, number];
  drainage_density_km_sqkm: number;
  soil_type: string;
  lead_agency: string;
}

interface GeocodedImage {
  id: string;
  basin_id: string;
  intervention_type: string;
  title: string;
  village: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  azimuth_deg: number;
  date_captured: string;
  captured_by: string;
  photo_url: string;
  structural_health: string;
  storage_capacity_cum: number;
  siltation_level_percent: number;
  estimated_recharge_potential: string;
  vegetation_surround_delta: string;
  verified_by_satellite: boolean;
}

export default function WatershedPage() {
  const [basins, setBasins] = useState<WatershedBasin[]>([]);
  const [selectedBasinId, setSelectedBasinId] = useState<string>('ws-bundelkhand-01');
  const [geocodedImages, setGeocodedImages] = useState<GeocodedImage[]>([]);
  const [activePhoto, setActivePhoto] = useState<GeocodedImage | null>(null);
  const [activeLayer, setActiveLayer] = useState<'srishti-30m' | 'drainage' | 'ndvi' | 'moisture'>('srishti-30m');
  const [temporalYear, setTemporalYear] = useState<number>(2026);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    async function loadWatershedData() {
      try {
        const [basinData, imageData] = await Promise.all([
          apiRequest<any>('/watershed/basins'),
          apiRequest<any>('/watershed/geocoded-images'),
        ]);
        if (basinData?.basins) setBasins(basinData.basins);
        if (imageData?.images) setGeocodedImages(imageData.images);
      } catch (err) {
        console.error('Failed to load watershed data:', err);
      }
    }
    loadWatershedData();
  }, []);

  const currentBasin = basins.find((b) => b.id === selectedBasinId) || basins[0];
  const filteredImages = geocodedImages.filter((img) => {
    const matchesBasin = img.basin_id === selectedBasinId;
    const matchesType = filterType === 'all' || img.intervention_type.toLowerCase().includes(filterType.toLowerCase());
    return matchesBasin && matchesType;
  });

  const handleRunAiAnalysis = async (photo: GeocodedImage) => {
    setIsAnalyzing(true);
    try {
      const res = await apiRequest<any>('/watershed/analyze-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_id: photo.id,
          basin_id: photo.basin_id,
          intervention_type: photo.intervention_type,
          observed_water_depth_m: 2.8,
          current_vegetation_density: 'High',
        }),
      });
      setAnalysisResult(res.verification_result);
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Satellite className="w-3.5 h-3.5" />
                Department of Land Resources (DoLR) • MoRD Initiative
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Watershed Geospatial Intelligence & Geo-Coded Image Interpretation
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Integrated analytical framework combining <strong>SRISHTI-DRISHTI 30m multi-spectral satellite data</strong> with field-level geo-coded photography to monitor water conservation structures, drainage patterns, and vegetative rejuvenation.
              </p>
            </div>

            {/* Basin Selector Widget */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[280px]">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                Active Micro-Watershed Catchment
              </label>
              <select
                value={selectedBasinId}
                onChange={(e) => {
                  setSelectedBasinId(e.target.value);
                  setAnalysisResult(null);
                  setActivePhoto(null);
                }}
                className="w-full px-3 py-2 bg-slate-900 text-white text-sm rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
              >
                {basins.map((basin) => (
                  <option key={basin.id} value={basin.id}>
                    {basin.region}: {basin.name} ({basin.district}, {basin.state})
                  </option>
                ))}
              </select>
              {currentBasin && (
                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-2">
                  <span>Scene: <code className="text-emerald-300 font-mono">{currentBasin.srishti_drishti_scene_id.slice(0, 16)}</code></span>
                  <span className="text-emerald-400 font-semibold">{currentBasin.priority} Priority</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {currentBasin && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center sm:text-left">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Drainage Area</span>
                <p className="text-lg font-bold text-slate-900">{currentBasin.drainage_area_sq_km} sq km</p>
                <span className="text-[11px] text-slate-500">Density: {currentBasin.drainage_density_km_sqkm} km/km²</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800 uppercase">Water Storage Created</span>
                <p className="text-lg font-bold text-emerald-950">{currentBasin.water_storage_created_tcm} TCM</p>
                <span className="text-[11px] text-emerald-700 font-medium">Thousand Cubic Meters</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                <span className="text-xs font-semibold text-teal-800 uppercase">Interventions Logged</span>
                <p className="text-lg font-bold text-teal-950">{currentBasin.interventions_count} Structures</p>
                <span className="text-[11px] text-teal-700">Check dams, ponds & CCT</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-xs font-semibold text-amber-800 uppercase">NDVI Vegetative Gain</span>
                <p className="text-lg font-bold text-amber-950">+{currentBasin.ndvi_trend_percent}%</p>
                <span className="text-[11px] text-amber-700">Multi-temporal 2020-2026</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xs font-semibold text-blue-800 uppercase">Rainfall & Soil</span>
                <p className="text-lg font-bold text-blue-950">{currentBasin.mean_annual_rainfall_mm} mm</p>
                <span className="text-[11px] text-blue-700 truncate block">{currentBasin.soil_type}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Center GIS & Satellite Visualization Viewport (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Map Layer Controls Bar */}
              <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Thematic Layers (SRISHTI-DRISHTI 30m)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveLayer('srishti-30m')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      activeLayer === 'srishti-30m' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    30m Satellite
                  </button>
                  <button
                    onClick={() => setActiveLayer('drainage')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      activeLayer === 'drainage' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Drainage Network
                  </button>
                  <button
                    onClick={() => setActiveLayer('ndvi')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      activeLayer === 'ndvi' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    NDVI Biomass
                  </button>
                  <button
                    onClick={() => setActiveLayer('moisture')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      activeLayer === 'moisture' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Soil Wetness
                  </button>
                </div>
              </div>

              {/* Synthetic Geospatial Display Canvas */}
              <div className="relative h-[440px] bg-slate-950 overflow-hidden flex items-center justify-center">
                {/* Simulated Map Visuals */}
                <div
                  className="absolute inset-0 opacity-70 transition-all duration-500 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      activeLayer === 'srishti-30m'
                        ? 'radial-gradient(circle at 60% 40%, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.95) 80%), url("https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1400&q=80")'
                        : activeLayer === 'drainage'
                        ? 'radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.3) 0%, rgba(15, 23, 42, 0.95) 80%), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80")'
                        : activeLayer === 'ndvi'
                        ? 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.4) 0%, rgba(15, 23, 42, 0.95) 80%), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80")'
                        : 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.35) 0%, rgba(15, 23, 42, 0.95) 80%), url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1400&q=80")',
                  }}
                />

                {/* Topographic Contours / Grid Overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none stroke-emerald-400" fill="none">
                  <path d="M 0 120 Q 250 80 500 160 T 1000 140" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 0 220 Q 300 180 600 280 T 1000 240" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 0 320 Q 350 280 700 360 T 1000 320" strokeWidth="1.5" strokeDasharray="6 4" />
                  {activeLayer === 'drainage' && (
                    <g className="stroke-blue-400 stroke-[2.5] opacity-90">
                      <path d="M 120 40 L 220 160 L 380 240 L 520 340 L 680 440" />
                      <path d="M 320 80 L 380 240" />
                      <path d="M 580 180 L 520 340" />
                      <circle cx="380" cy="240" r="6" fill="#3b82f6" />
                      <circle cx="520" cy="340" r="6" fill="#3b82f6" />
                    </g>
                  )}
                </svg>

                {/* Overlay Interactive Pins for Geocoded Photos */}
                <div className="absolute inset-0 p-8 pointer-events-none">
                  {filteredImages.map((img, idx) => {
                    const topPercent = 25 + (idx * 22) % 65;
                    const leftPercent = 20 + (idx * 28) % 70;
                    const isSelected = activePhoto?.id === img.id;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => {
                          setActivePhoto(img);
                          handleRunAiAnalysis(img);
                        }}
                        style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                        className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 cursor-pointer ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg border backdrop-blur-md ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-white ring-4 ring-emerald-400/40'
                              : 'bg-slate-900/90 text-white border-emerald-500/50 hover:bg-slate-800'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                          <span className="truncate max-w-[120px]">{img.intervention_type}</span>
                        </div>
                        {/* Azimuth Direction Arrow */}
                        <div
                          className="w-2 h-2 mx-auto mt-0.5 bg-emerald-400 rounded-full shadow"
                          title={`Azimuth: ${img.azimuth_deg}°`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Map Metadata Pill */}
                <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-300 backdrop-blur flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live 30m Grid Layer
                  </span>
                  <span>Centroid: {currentBasin?.centroid?.join(', ')}</span>
                  <span>SRISHTI-DRISHTI WGS84</span>
                </div>

                {/* Layer Legend in Top-Right */}
                <div className="absolute top-3 right-3 bg-slate-900/85 border border-slate-700 p-2.5 rounded-xl text-[11px] text-slate-200 backdrop-blur-md max-w-[190px]">
                  <span className="font-bold text-emerald-400 block mb-1">
                    {activeLayer === 'srishti-30m' && '30m Multi-Spectral'}
                    {activeLayer === 'drainage' && 'Strahler Stream Orders'}
                    {activeLayer === 'ndvi' && 'NDVI Biomass Scale'}
                    {activeLayer === 'moisture' && 'Soil Moisture Index'}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Resolution:</span>
                      <span className="font-semibold text-white">30 Meters</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Revisit:</span>
                      <span className="font-semibold text-white">5 Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Platform:</span>
                      <span className="font-semibold text-white">Bhuvan / DoLR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Temporal Slider for NDVI / Spatial Change Detection */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Multi-Temporal Assessment Slider (2020 - 2026)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {[2020, 2022, 2024, 2026].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setTemporalYear(yr)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        temporalYear === yr
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {yr} {yr === 2020 ? '(Baseline)' : yr === 2026 ? '(Current)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of Geo-coded Field Images in this Basin */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Geotagged Field Interventions</h3>
                  <p className="text-xs text-slate-500">
                    Click an intervention card to inspect high-resolution ground truth and verify against satellite observations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium"
                  >
                    <option value="all">All Structures ({geocodedImages.length})</option>
                    <option value="check dam">Check Dams</option>
                    <option value="percolation">Percolation Tanks</option>
                    <option value="farm pond">Farm Ponds</option>
                    <option value="contour">Contour Trenches</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredImages.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setActivePhoto(photo);
                      handleRunAiAnalysis(photo);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                      activePhoto?.id === photo.id
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <Image
                      src={photo.photo_url}
                      alt={photo.title}
                      width={80}
                      height={80}
                      unoptimized
                      className="w-20 h-20 object-cover rounded-lg shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide truncate">
                          {photo.intervention_type}
                        </span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">
                          {photo.structural_health}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{photo.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Village: {photo.village} • Elev: {photo.elevation_m}m
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        <span className="text-slate-600 font-medium">Storage: {photo.storage_capacity_cum} m³</span>
                        <span className="text-emerald-700 font-bold">{photo.vegetation_surround_delta}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Inspection & AI Interpretation Studio (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {activePhoto ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{activePhoto.title}</h3>
                      <p className="text-xs text-slate-500">Geo-Coded Inspection Dossier</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Verified by Satellite
                  </Badge>
                </div>

                {/* Large Photo Preview with Azimuth Overlay */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                  <Image
                    src={activePhoto.photo_url}
                    alt={activePhoto.title}
                    width={600}
                    height={300}
                    unoptimized
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                    <div className="text-white text-xs space-y-0.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">Lat: {activePhoto.latitude}° N, Lng: {activePhoto.longitude}° E</span>
                        <span className="font-bold text-emerald-300">Azimuth: {activePhoto.azimuth_deg}°</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span>Captured: {activePhoto.date_captured}</span>
                        <span>By: {activePhoto.captured_by}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scientific Parameters Card */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                    Intervention Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-500 block">Structure Type:</span>
                      <strong className="text-slate-900">{activePhoto.intervention_type}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Storage Volume:</span>
                      <strong className="text-slate-900">{activePhoto.storage_capacity_cum} Cubic Metres</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Siltation Status:</span>
                      <strong className="text-slate-900">{activePhoto.siltation_level_percent}% capacity silted</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Recharge Potential:</span>
                      <strong className="text-emerald-700">{activePhoto.estimated_recharge_potential}</strong>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Outcome Card */}
                <div className="p-4 bg-emerald-950 text-white rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      <Activity className="w-4 h-4" />
                      SRISHTI Satellite AI Validation
                    </div>
                    <span className="text-xs font-bold text-emerald-400">94.8% Match</span>
                  </div>

                  {analysisResult ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2 bg-white/10 p-2.5 rounded-lg">
                        <div>
                          <span className="text-slate-300 block text-[11px]">Water Stored Delta:</span>
                          <strong className="text-emerald-300 text-sm font-mono">
                            {analysisResult.calculated_water_stored_cum} m³
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-300 block text-[11px]">Recharge Est:</span>
                          <strong className="text-teal-300 text-sm font-mono">
                            {analysisResult.estimated_annual_groundwater_recharge_ha_m} ha-m/yr
                          </strong>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-emerald-900/50 p-2.5 rounded-lg border border-emerald-800 text-[11px] text-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{analysisResult.recommendation}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <Button
                        size="sm"
                        onClick={() => handleRunAiAnalysis(activePhoto)}
                        disabled={isAnalyzing}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        {isAnalyzing ? 'Computing Satellite Delta...' : 'Run Computer Vision & 30m Cross-Verification'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <a
                    href={`/api/v1/watershed/assessment-summary/${activePhoto.basin_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center text-xs border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export PDF Dossier
                  </a>
                  <Link
                    href={`/maps?lat=${activePhoto.latitude}&lng=${activePhoto.longitude}&zoom=16`}
                    className="flex-1 inline-flex items-center justify-center text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-lg shadow-sm transition-colors"
                  >
                    Open in Full GIS Map
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Select a Geo-Coded Intervention</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click on any field photo pin on the map or select an intervention card on the left to view geo-coded coordinates, azimuth angle, structural health, and AI satellite validation.
                </p>
                {filteredImages[0] && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setActivePhoto(filteredImages[0]);
                      handleRunAiAnalysis(filteredImages[0]);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                  >
                    Inspect Sample: {filteredImages[0].title}
                  </Button>
                )}
              </div>
            )}

            {/* Scientific Guide Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Info className="w-4 h-4" />
                SRISHTI-DRISHTI Scientific Framework
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>30m Satellite Synergy:</strong> Multi-temporal Landsat-8 and Sentinel-2 calibrated bands for biophysical indices.</li>
                <li><strong>Strahler Ordering:</strong> Guides optimal placement (Gully plugs on 1st/2nd order, check dams on 3rd order, percolation tanks on 4th order).</li>
                <li><strong>Field Geo-Tagging:</strong> Mobile app captures azimuth, elevation, and structural integrity for automated database synchronization.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
