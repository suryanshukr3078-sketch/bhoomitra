'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  FileCode,
  CheckCircle2,
  FileText,
  MapPin,
  GitFork,
  Hash,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProvenanceNode {
  id: string;
  type: 'upstream' | 'downstream' | 'current';
  relation: string;
  title: string;
  resourceType: string;
  timestamp: string;
  author: string;
  hash: string;
  confidence?: number;
}

const SAMPLE_TRACE: ProvenanceNode[] = [
  // Upstream
  {
    id: 'up-01',
    type: 'upstream',
    relation: 'USES_DATA',
    title: 'Pune Metropolitan 10cm Drone Photogrammetry Survey (Sept 2026)',
    resourceType: 'Spatial GIS Dataset',
    timestamp: 'September 2, 2026',
    author: 'State Survey Directorate',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    confidence: 0.998,
  },
  {
    id: 'up-02',
    type: 'upstream',
    relation: 'CITES',
    title: 'Maharashtra Land Revenue Code 1966 (Sec. 148 Cadastral Boundary Mandate)',
    resourceType: 'Statutory Policy',
    timestamp: 'August 15, 2026',
    author: 'Department of Revenue',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    confidence: 1.0,
  },
  // Current Node
  {
    id: 'curr-01',
    type: 'current',
    relation: 'TARGET_VERSION',
    title: 'Cadastral Parcel Mutation Record #MUT-8941 (PAR-44029-MH)',
    resourceType: 'Cadastral Mutation Deed',
    timestamp: 'September 11, 2026',
    author: 'Licensed Surveyor K. Patel (Accreditation #4412)',
    hash: '5d41402abc4b2a76b9719d911017c592b5e28a47ff96be95d43e2e8311394f72',
    confidence: 0.995,
  },
  // Downstream
  {
    id: 'down-01',
    type: 'downstream',
    relation: 'VALIDATES',
    title: 'Subdivision Geometric Topology Verification (0.00% Overlap)',
    resourceType: 'PostGIS Automated Verification',
    timestamp: 'September 11, 2026',
    author: 'Automated PostGIS Cadastral Invariant Daemon',
    hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    confidence: 1.0,
  },
  {
    id: 'down-02',
    type: 'downstream',
    relation: 'SUPERSEDES',
    title: 'Historical Parent Title Deed PAR-44000 (1998 Freehold)',
    resourceType: 'Superseded Title Deed',
    timestamp: 'September 11, 2026',
    author: 'Sub-Registrar of Land Titles',
    hash: '7d793037a0760186574b0282f2f435e70817c9197a17726a849767ee9796016e',
    confidence: 0.985,
  },
];

export default function EvidencePage() {
  const [searchHash, setSearchHash] = useState('5d41402abc4b2a76b9719d911017c592');
  const { toast } = useToast();

  const handleCopy = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    toast({
      title: 'Provenance Hash Copied',
      description: `${hash.slice(0, 16)}... copied to clipboard.`,
      variant: 'success',
      duration: 2000,
    });
  };

  const upstreamNodes = SAMPLE_TRACE.filter((n) => n.type === 'upstream');
  const currentNode = SAMPLE_TRACE.find((n) => n.type === 'current')!;
  const downstreamNodes = SAMPLE_TRACE.filter((n) => n.type === 'downstream');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            Append-Only Provenance Ledger
          </div>
          <Badge variant="outline" className="border-amber-400 text-amber-900 bg-amber-50">
            Synthetic Audit Trail (Demo)
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cryptographic Provenance & Evidence Trace
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Inspect the complete upstream (antecedent survey datasets, base laws) and downstream (subdivisions, topological certifications) audit chain for any cadastral parcel or policy mutation.
        </p>

        {/* Hash Search Input */}
        <div className="pt-3">
          <div className="relative max-w-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="Search by mutation SHA256 hash or parcel ID (e.g. PAR-44029)..."
              className="w-full pl-10 pr-24 py-2.5 font-mono text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <button
              type="button"
              onClick={() =>
                toast({
                  title: 'Provenance Trail Loaded',
                  description: 'Loaded 5 DAG nodes linked to verified parcel mutation.',
                  variant: 'success',
                })
              }
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Audit Trace
            </button>
          </div>
        </div>
      </div>

      {/* DAG Visualizer Pipeline */}
      <div className="space-y-8">
        {/* Upstream Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            Upstream Antecedents (Input Datasets, Primary Statutes)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upstreamNodes.map((node) => (
              <div
                key={node.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 relative hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    RELATION: {node.relation}
                  </Badge>
                  {node.confidence !== undefined && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Confidence: {(node.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{node.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Author: {node.author}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{node.hash.slice(0, 18)}...</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(node.hash)}
                    className="hover:text-slate-700 p-1 rounded"
                    aria-label="Copy hash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Node in Focus */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
              Audit Focus Target
            </span>
            <span className="text-xs text-emerald-200">Certified {currentNode.timestamp}</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold">{currentNode.title}</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90">{currentNode.author}</p>
          </div>

          <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 space-y-1 text-xs font-mono">
            <div className="text-emerald-300 font-semibold text-[10px] uppercase">
              SHA256 Cryptographic Audit Hash:
            </div>
            <div className="flex items-center justify-between break-all">
              <span className="text-slate-200 text-xs">{currentNode.hash}</span>
              <button
                type="button"
                onClick={() => handleCopy(currentNode.hash)}
                className="ml-2 text-emerald-300 hover:text-white shrink-0 p-1"
                aria-label="Copy current node hash"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Downstream Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            Downstream Certifications & Consequences (Validations, Replacements)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downstreamNodes.map((node) => (
              <div
                key={node.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 relative hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="font-mono text-[10px]">
                    RELATION: {node.relation}
                  </Badge>
                  {node.confidence !== undefined && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Confidence: {(node.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{node.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Verifier: {node.author}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{node.hash.slice(0, 18)}...</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(node.hash)}
                    className="hover:text-slate-700 p-1 rounded"
                    aria-label="Copy hash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
