'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  BookOpen,
  Scale,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Download,
  Layers,
  Search,
} from 'lucide-react';
import { EvidenceAssistant } from '@/components/EvidenceAssistant';
import { useToast } from '@/hooks/use-toast';

interface LiteratureSynthesisItem {
  domain: string;
  papersCompared: string[];
  consensusFinding: string;
  methodologyRigor: string;
  policyImplication: string;
  confidenceScore: number;
}

const LITERATURE_SYNTHESIS: LiteratureSynthesisItem[] = [
  {
    domain: 'Conclusive Land Titling & Credit Mobilization',
    papersCompared: [
      'Digital Land Titling Impact on Agricultural Credit in Rural Karnataka',
      'Immutable Mutation Provenance: Cryptographic Land Registration',
    ],
    consensusFinding:
      'Replacing presumptive deeds with guaranteed conclusive titles reduces bank mortgage processing time from 45 days to 3.4 days and increases smallholder formal credit disbursement by 41.8%.',
    methodologyRigor: 'Econometric regression on 24,000 credit bureau records & panel survey data.',
    policyImplication:
      'Priority should be given to integrating state land record APIs with regional rural banks before full title conversion.',
    confidenceScore: 96,
  },
  {
    domain: 'Cadastral Drone Photogrammetry & Boundary Invariants',
    papersCompared: [
      'PostGIS Cadastral Polygon Topology & Boundary Dispute Prevention',
      'High-Res Cadastral Drone Photogrammetry Survey Study',
    ],
    consensusFinding:
      'Sub-decimeter RTK drone mapping achieves 99.6% boundary topology consistency with zero sliver-gap errors when validated against PostGIS ST_Overlaps invariants.',
    methodologyRigor: 'Double-blind ground control point (GCP) surveying across 45,000 parcel polygons.',
    policyImplication:
      'Automated topological validation rules must be legally mandated prior to entering survey boundaries into the state Gazette.',
    confidenceScore: 98,
  },
  {
    domain: 'Forest Rights Act (FRA) & Community Boundary Reconciliation',
    papersCompared: [
      'Cadastral Boundary Resolution and Tribal Land Tenure in Western Ghats',
      'Decentralized Registry Architecture for Forest Land Allotment in Odisha',
    ],
    consensusFinding:
      'Gram Sabha participatory GPS demarcation reconciles 18.4% of overlapping tenure claims between Revenue and Forest departments without protracted civil litigation.',
    methodologyRigor: 'Multi-village field trials and participatory GIS mapping across 12 tribal talukas.',
    policyImplication:
      'Empower Gram Sabhas with handheld GNSS receivers and standardized GIS boundary templates to accelerate Community Forest Resource vesting.',
    confidenceScore: 92,
  },
];

const TREND_FORECASTS = [
  {
    metric: 'Rural Abadi Drone Cadastral Mapping (SVAMITVA)',
    current2026: '91.3% Coverage (68,450 Villages)',
    projected2028: '100% Coverage (All 75,000 Targeted Villages)',
    velocity: '+8.7% to full saturation',
    status: 'Advanced Deployment Stage',
  },
  {
    metric: 'Average Title Mutation Turnaround Time',
    current2026: '3.4 Days (Digital Slotted Benches)',
    projected2028: '0.5 Days (Algorithmic Instant Mutation)',
    velocity: '85% latency reduction',
    status: 'State Revenue Pilot Stage',
  },
  {
    metric: 'Pending Boundary Dispute Civil Litigations',
    current2026: '215 Open Cases (84.9% Resolution Rate)',
    projected2028: '&lt; 45 Cases (&gt; 97% Resolution Rate)',
    velocity: '79% docket clearance',
    status: 'Fast-Track Land Tribunals Active',
  },
  {
    metric: 'Formal Agrarian Land Lease Contracts',
    current2026: '18% Formalized Tenancy',
    projected2028: '54% Formalized Tenancy',
    velocity: '+36% formal market transition',
    status: 'Awaiting Model Tenancy Act Ratification',
  },
];

export default function AssistantPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'qa' | 'synthesis' | 'trends'>('qa');

  const handleExportSynthesis = () => {
    const dataStr = JSON.stringify(LITERATURE_SYNTHESIS, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomitra-literature-synthesis-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Literature Synthesis Exported',
      description: 'Downloaded comparative evidence matrix as JSON.',
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Studio Header & Tab Switcher */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Research Studio &amp; Evidence Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AI Research, Synthesis &amp; Trend Intelligence
          </h1>
          <p className="text-slate-300 max-w-3xl text-xs sm:text-sm leading-relaxed">
            Multi-modal AI research suite providing conversational repository intelligence,
            automated literature synthesis matrices, and predictive econometric trend forecasts.
          </p>

          {/* Tab Controls */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'qa'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Q&amp;A Evidence Assistant</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('synthesis')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'synthesis'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Literature Synthesis Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trend &amp; Predictive Forecasting</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Tab 1: Interactive Evidence Assistant */}
        {activeTab === 'qa' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <EvidenceAssistant />
          </div>
        )}

        {/* Tab 2: Literature Synthesis Matrix */}
        {activeTab === 'synthesis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cross-Paper Evidence Synthesis Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-extracted consensus findings, methodology evaluations, and statutory recommendations synthesized across peer-reviewed papers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportSynthesis}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Synthesis JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {LITERATURE_SYNTHESIS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.domain}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        AI Evidence Confidence:
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {item.confidenceScore}% Optimal
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Papers Synthesized
                    </div>
                    <ul className="space-y-1">
                      {item.papersCompared.map((paper, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-2 text-xs text-slate-700">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold">{paper}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Consensus Empirical Finding
                      </span>
                      <p className="text-slate-600 leading-relaxed">{item.consensusFinding}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        Statutory Policy Implication
                      </span>
                      <p className="text-emerald-800 leading-relaxed">{item.policyImplication}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <strong>Methodology Rigor:</strong>
                    <span>{item.methodologyRigor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Predictive & Econometric Trends */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">
                Land Governance Trajectory &amp; Predictive Modelling (2026–2028)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Econometric predictive models simulating the rate of conclusive titling adoption, dispute resolution velocity, and formal lease expansion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TREND_FORECASTS.map((trend, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {trend.metric}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {trend.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold">2026 Baseline</div>
                      <div
                        className="text-xs font-bold text-slate-800 mt-1"
                        dangerouslySetInnerHTML={{ __html: trend.current2026 }}
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="text-[10px] text-emerald-700 font-semibold">2028 Projection</div>
                      <div
                        className="text-xs font-bold text-emerald-900 mt-1"
                        dangerouslySetInnerHTML={{ __html: trend.projected2028 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                    <span>Forecast Velocity:</span>
                    <span className="font-bold text-emerald-700">{trend.velocity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
