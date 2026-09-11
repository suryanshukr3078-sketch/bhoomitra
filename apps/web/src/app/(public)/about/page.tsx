import React from 'react';
import {
  Landmark,
  ShieldAlert,
  Database,
  Layers,
  Scale,
  CheckCircle2,
  Users,
  Globe2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'About Us | Land Governance & Cadastral Administration',
  description:
    'Overview of the Land Governance Platform, architecture, open standards, and non-official data disclaimer.',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <Landmark className="w-3.5 h-3.5" />
          Open Governance Initiative
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Democratizing Land Tenure & Spatial Cadastral Integrity
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          The Land Governance Platform is a high-assurance, open-standard infrastructure engineered to unite GIS cadastral boundaries, statutory land policies, and peer-reviewed tenure research into a verifiable public audit trail.
        </p>
      </div>

      {/* Prominent Non-Official Data Disclaimer */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          Notice of Non-Official Synthetic Demonstration Data
        </div>
        <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
          This platform demonstrates open cadastral technology, cryptographic mutation graphs, and automated PostGIS topological validation. <strong>All sample parcels, boundary polygons, policy drafts, and mutation entries displayed across the platform are synthetic demonstration records</strong> created for research and evaluation purposes. Official land titles, legal ownership records, and cadastral survey certificates remain under the exclusive statutory purview of jurisdictional state revenue departments and national survey agencies.
        </p>
      </div>

      {/* Architectural Pillars */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Architectural Framework</h2>
          <p className="text-xs sm:text-sm text-slate-500">Built on strict open standards and cryptographic integrity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">PostGIS 3.6 Topology</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Enforces EPSG:4326 geometric invariants preventing overlapping parcel claims and surveyor coordinate discrepancies.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Append-Only Provenance</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every deed mutation, surveyor subdivision, and policy citation is immutably linked in a Directed Acyclic Graph (DAG).
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Open Spatial Data</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Provides open access to GeoJSON boundaries, Cloud-Optimized GeoTIFFs (COGs), and vector PMTiles under FAIR data standards.
            </p>
          </div>
        </div>
      </div>

      {/* Tenets & Values */}
      <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl space-y-6 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Guiding Governance Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Tenure Equity:</strong> Protecting customary, communal, and smallholder tenure alongside statutory titles.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Evidence-Driven Policy:</strong> Grounding legislative land reforms in empirical satellite data and academic research.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Zero Encroachment:</strong> Automated spatial intersection detection to halt unauthorized encroachment on public wetlands and forests.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Transparent Auditability:</strong> Publicly verifiable mutation histories preventing backdated administrative manipulations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
