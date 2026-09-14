'use client';

import React from 'react';
import Link from 'next/link';
import { Map, Compass, CheckCircle2, ChevronRight, Download, ShieldCheck, Layers, Cpu } from 'lucide-react';
import { GeospatialMetrics, RolePermissions } from '../types';

export function GeospatialTab({
  data,
  permissions,
}: {
  data: GeospatialMetrics;
  permissions: RolePermissions;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Geospatial Insights & Cadastral Precision</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vectorized parcel records, RTK GPS geo-referencing accuracy, and multi-CRS topological integrity.
          </p>
        </div>
        <Link
          href="/maps"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
        >
          Open GIS Explorer
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-slate-900">
            {data.total_parcels_digitized.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Digitized Parcels</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-blue-700">
            {data.total_surveyed_sq_km.toLocaleString()}
            <span className="text-xs text-slate-500 font-normal"> km²</span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Surveyed Coverage</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">
            {data.rtk_gps_precision_pct}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">RTK GPS Precision</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-purple-700">
            {data.boundary_topology_consistency_pct}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Topology Integrity</div>
        </div>
      </div>

      {/* Cadastral Specs & CRS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Supported Coordinate Reference Systems (CRS)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.coordinate_reference_systems.map((crs) => (
              <span
                key={crs}
                className="px-2.5 py-1 text-xs font-mono font-semibold bg-white border border-slate-200 text-slate-800 rounded-lg shadow-2xs"
              >
                {crs}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Automated reprojection pipeline supporting global WGS84 and localized Survey of India grid parameters.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Vector Layers & Boundary Mutations
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-lg font-extrabold text-slate-900">{data.active_map_layers_count}</div>
              <div className="text-[10px] text-slate-500">Active GIS Layers</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-lg font-extrabold text-emerald-700">
                {data.boundary_mutations_processed.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">Mutations Validated</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Real-time topology validation prevents parcel overlap and polygon sliver creation.
          </p>
        </div>
      </div>

      {/* Export & Data Access Governance */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            High-Resolution Spatial Export Gateway
          </div>
          <p className="text-xs text-slate-600">
            {permissions.can_export_raw_geospatial
              ? 'Authorized tier: You have verified permissions to export raw cadastral boundaries in GeoJSON, Shapefile, and GeoTIFF.'
              : 'Public tier: Vector geometry is restricted to web visualizer tiles. Full GeoJSON export requires verified Researcher or Official credentials.'}
          </p>
        </div>

        <div>
          {permissions.can_export_raw_geospatial ? (
            <Link
              href="/maps"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export Geospatial Data
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
            >
              Sign In to Request Access
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
