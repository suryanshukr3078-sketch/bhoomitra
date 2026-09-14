'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Scale,
  Layers,
  ShieldCheck,
  Gavel,
  Rocket,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { DashboardOverview, DimensionTab } from '../types';

export function OverviewTab({
  overview,
  onSelectTab,
}: {
  overview: DashboardOverview;
  onSelectTab: (tab: DimensionTab) => void;
}) {
  const cards = [
    {
      id: 'research' as DimensionTab,
      title: 'Research Outputs',
      icon: BookOpen,
      metric: `${overview.research.total_papers} Papers`,
      sub: `${overview.research.total_citations} academic citations`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: `${overview.research.peer_reviewed_count} Peer-Reviewed`,
    },
    {
      id: 'policy' as DimensionTab,
      title: 'Policy Performance',
      icon: Scale,
      metric: `${overview.policy.compliance_index_pct}% Index`,
      sub: `${overview.policy.enacted_count} enacted statutory acts`,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      badge: `${overview.policy.total_policies} Instruments`,
    },
    {
      id: 'land_use' as DimensionTab,
      title: 'Land Use Trends',
      icon: Layers,
      metric: `${(overview.land_use.total_area_hectares / 1000).toFixed(0)}k Hectares`,
      sub: `${overview.land_use.agricultural_pct}% agri · ${overview.land_use.forest_conservation_pct}% forest`,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      badge: '5-Yr Trajectory',
    },
    {
      id: 'climate' as DimensionTab,
      title: 'Climate Resilience',
      icon: ShieldCheck,
      metric: `${overview.climate.drought_resilience_score} Score`,
      sub: `${overview.climate.agro_ecological_protection_pct}% protected buffer`,
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      badge: `Rating ${overview.climate.soil_carbon_retention_rating}`,
    },
    {
      id: 'disputes' as DimensionTab,
      title: 'Land Dispute Statistics',
      icon: Gavel,
      metric: `${overview.disputes.resolution_rate_pct}% Resolved`,
      sub: `${overview.disputes.pending_disputes.toLocaleString()} pending litigation`,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      badge: overview.disputes.sensitive_details_masked ? 'Privacy Masked' : 'Hotspots Live',
    },
    {
      id: 'projects' as DimensionTab,
      title: 'Project Outcomes',
      icon: Rocket,
      metric: `${overview.projects.drone_survey_completion_pct}% Surveyed`,
      sub: `${overview.projects.property_cards_distributed.toLocaleString()} cards issued`,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badge: `${overview.projects.digital_mutation_avg_days}d Mutation`,
    },
    {
      id: 'geospatial' as DimensionTab,
      title: 'Geospatial Insights',
      icon: MapPin,
      metric: `${overview.geospatial.total_parcels_digitized.toLocaleString()}`,
      sub: `${overview.geospatial.rtk_gps_precision_pct}% RTK GPS precision`,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      badge: `${overview.geospatial.active_map_layers_count} Layers`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 7-Domain Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelectTab(c.id)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.badge}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {c.title}
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{c.metric}</div>
                <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
              </div>

              <div className="flex items-center justify-end text-xs font-bold text-emerald-700 mt-4 group-hover:translate-x-0.5 transition-transform">
                Explore Domain &rarr;
              </div>
            </button>
          );
        })}

        {/* Action card linking to GIS Map */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              GIS Cadastre Explorer
            </div>
            <div className="text-lg font-bold mt-1">Interactive Spatial Layers</div>
            <p className="text-xs text-slate-300 mt-1">
              Visualize boundary topology, zoning, land use transformations, and flood hazard overlays.
            </p>
          </div>
          <Link
            href="/maps"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors mt-4"
          >
            Launch Map Viewer
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
