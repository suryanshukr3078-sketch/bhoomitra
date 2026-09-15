'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  Layers,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Server,
  Globe,
  Key,
  Webhook,
  Database,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  method: 'GET' | 'POST';
  path: string;
  category: string;
  summary: string;
  authRequired: boolean;
  rateLimit: string;
  responseSnippet: string;
  codeSnippets: {
    curl: string;
    python: string;
    typescript: string;
  };
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/spatial/features',
    category: 'Geospatial & PostGIS',
    summary: 'Retrieve validated cadastral boundary polygons and attributes as standard GeoJSON FeatureCollection.',
    authRequired: false,
    rateLimit: '60 req/min',
    responseSnippet: `{
  "type": "FeatureCollection",
  "count": 10,
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "geometry": { "type": "Polygon", "coordinates": [[[77.205, 28.611], ...]] },
      "properties": {
        "external_id": "PAR-DEL-01",
        "surveyNumber": "Survey DL-01/Central",
        "owner": "Delhi Development Authority",
        "areaHa": 6.2,
        "tenureType": "Institutional Freehold",
        "jurisdiction": "Delhi (Central District)"
      }
    }
  ]
}`,
    codeSnippets: {
      curl: `curl -X GET "https://land-governance-platform-virid.vercel.app/api/v1/spatial/features?limit=50" \\
  -H "Accept: application/json"`,
      python: `import requests

url = "https://land-governance-platform-virid.vercel.app/api/v1/spatial/features"
params = {"limit": 50, "offset": 0}
resp = requests.get(url, params=params)
geojson = resp.json()
print(f"Loaded {geojson['count']} cadastral parcels")`,
      typescript: `import axios from 'axios';

const res = await axios.get('https://land-governance-platform-virid.vercel.app/api/v1/spatial/features', {
  params: { limit: 50 }
});
console.log(res.data.features);`,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/search',
    category: 'Repository Search',
    summary: 'Search indexed policies, research papers, datasets, and legal instruments with full-text and thematic filters.',
    authRequired: false,
    rateLimit: '30 req/min',
    responseSnippet: `{
  "query": "drone",
  "count": 4,
  "items": [
    {
      "id": "70dd8a11-7c33-47f0-a2e7-feb35a3a82ba",
      "title": "National Cadastral Parcel Polygons and Boundary Reconciliations 2026",
      "resource_type": "dataset",
      "status": "published"
    }
  ]
}`,
    codeSnippets: {
      curl: `curl -X GET "https://land-governance-platform-virid.vercel.app/api/v1/search?q=cadastre&limit=10" \\
  -H "Accept: application/json"`,
      python: `import requests

resp = requests.get("https://land-governance-platform-virid.vercel.app/api/v1/search", params={"q": "cadastre"})
results = resp.json()["items"]
for item in results:
    print(item["title"], item["resource_type"])`,
      typescript: `const resp = await fetch('https://land-governance-platform-virid.vercel.app/api/v1/search?q=cadastre');
const data = await resp.json();
console.log(data.items);`,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/dashboard/metrics',
    category: 'Governance Metrics',
    summary: 'Query the 7-pillar platform indicators (research velocity, policy compliance, land use, disputes, SVAMITVA outcomes).',
    authRequired: false,
    rateLimit: '60 req/min',
    responseSnippet: `{
  "research": { "total_papers": 48, "peer_reviewed_count": 39 },
  "policy": { "total_policies": 26, "compliance_index_pct": 91.4 },
  "disputes": { "total_disputes": 1420, "resolution_rate_pct": 84.9 },
  "geospatial": { "total_parcels_digitized": 482600, "rtk_gps_precision_pct": 99.6 }
}`,
    codeSnippets: {
      curl: `curl -X GET "https://land-governance-platform-virid.vercel.app/api/v1/dashboard/metrics" \\
  -H "Accept: application/json"`,
      python: `import requests

metrics = requests.get("https://land-governance-platform-virid.vercel.app/api/v1/dashboard/metrics").json()
print("Digitized Parcels:", metrics["geospatial"]["total_parcels_digitized"])`,
      typescript: `const metrics = await fetch('https://land-governance-platform-virid.vercel.app/api/v1/dashboard/metrics').then(r => r.json());
console.log(metrics.policy.compliance_index_pct);`,
    },
  },
];

const STATE_ADAPTERS = [
  {
    state: 'Karnataka (Bhoomi)',
    system: 'Bhoomi RTC & Mutation Engine',
    format: 'JSON / XML over HTTPS',
    status: 'Standardized Adapter Ready',
    features: 'Auto-sync Record of Rights (Pahani), Mutated Survey Numbers, Encumbrance Flags',
  },
  {
    state: 'Maharashtra (Mahabhulekh & Bhunaksha)',
    system: 'Mahabhulekh 7/12 & Spatial Plot Engine',
    format: 'OGC WFS & GeoJSON Stream',
    status: 'Standardized Adapter Ready',
    features: '7/12 Village Extract, Gat Number Spatial Geometries, Revenue Village Demarcation',
  },
  {
    state: 'Telangana (Dharani)',
    system: 'Integrated Land Records Management System',
    format: 'RESTful API + Cryptographic Hash',
    status: 'Standardized Adapter Ready',
    features: 'Instant Agricultural Deed Registration, Pattadar Passbook Verification',
  },
  {
    state: 'Jharkhand (Jharbhoomi)',
    system: 'Digital Land Records Registry',
    format: 'JSON Microservices API',
    status: 'Standardized Adapter Ready',
    features: 'Khatian Verification, Plot Mutation Tracking, Tribal Land Alienation Safeguards',
  },
];

export default function DevelopersPage() {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0]);
  const [selectedLang, setSelectedLang] = useState<'curl' | 'python' | 'typescript'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sandboxApiKey, setSandboxApiKey] = useState<string>('bhmt_live_sandbx_994a28f1e7d3');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast({
      title: 'Copied to Clipboard',
      description: `Copied ${label} snippet.`,
      duration: 2000,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateNewKey = () => {
    const newKey = `bhmt_live_sandbx_${Math.random().toString(36).substring(2, 14)}`;
    setSandboxApiKey(newKey);
    toast({
      title: 'New Sandbox Key Generated',
      description: 'Your temporary sandbox API access token has been updated.',
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Code2 className="w-4 h-4" />
            <span>Developer Documentation & Integration Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Developer APIs & Government Integration
          </h1>
          <p className="text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            Open REST endpoints, OGC WMS/WFS spatial services, and standardized adapters
            for integrating state land revenue systems (Bhoomi, Mahabhulekh, Dharani) into the national cadastre.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="https://land-governance-platform-virid.vercel.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md"
            >
              <span>Open Interactive Swagger / OpenAPI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Base URL: <code>https://land-governance-platform-virid.vercel.app/api/v1</code></span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Sandbox API Key Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Public Sandbox API Key</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Use this token in the <code>Authorization: Bearer &lt;key&gt;</code> header to access rate-limited public endpoints.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <code className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 border border-slate-200 truncate max-w-xs">
              {sandboxApiKey}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(sandboxApiKey, 'API Key')}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Copy Key"
            >
              {copiedKey === 'API Key' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={generateNewKey}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Rotate Key
            </button>
          </div>
        </div>

        {/* API Explorer & Code Snippets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Endpoint Selector (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1">
              Core Endpoints
            </h2>
            <div className="space-y-2">
              {API_ENDPOINTS.map((ep) => (
                <button
                  key={ep.path}
                  type="button"
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedEndpoint.path === ep.path
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white">
                      {ep.method}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {ep.rateLimit}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 mt-2 truncate">
                    {ep.path}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {ep.summary}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Code & Response Preview (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header & Language Switcher */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-xs font-mono text-slate-200">
                    {selectedEndpoint.path}
                  </code>
                </div>

                <div className="flex items-center gap-1">
                  {(['curl', 'python', 'typescript'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        selectedLang === lang
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'TypeScript'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(selectedEndpoint.codeSnippets[selectedLang], 'Code')
                    }
                    className="ml-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    title="Copy Snippet"
                  >
                    {copiedKey === 'Code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed border-b border-slate-800">
                <pre>{selectedEndpoint.codeSnippets[selectedLang]}</pre>
              </div>

              {/* Response Preview */}
              <div className="p-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Sample JSON Response
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80">
                  <pre>{selectedEndpoint.responseSnippet}</pre>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Category: {selectedEndpoint.category}</span>
              <span>Authentication: {selectedEndpoint.authRequired ? 'Bearer Token' : 'Public / Optional'}</span>
            </div>
          </div>
        </div>

        {/* OGC & GIS Integration Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              OGC GIS Integration (QGIS, ArcGIS, MapLibre)
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consume live cadastral layers directly inside desktop GIS suites or web maps using OGC-compliant spatial streaming endpoints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">GeoJSON Stream / REST</div>
              <p className="text-slate-500">
                Direct GeoJSON vector feed for Leaflet, MapLibre GL, and OpenLayers.
              </p>
              <code className="block p-2 rounded bg-white border border-slate-200 font-mono text-[11px] text-emerald-800 truncate">
                https://land-governance-platform-virid.vercel.app/api/v1/spatial/features
              </code>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">QGIS WFS Vector Service</div>
              <p className="text-slate-500">
                Add as WFS layer in QGIS via Layer &gt; Add Layer &gt; Add WFS Layer.
              </p>
              <code className="block p-2 rounded bg-white border border-slate-200 font-mono text-[11px] text-emerald-800 truncate">
                https://land-governance-platform-virid.vercel.app/api/v1/ogc/wfs
              </code>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">ArcGIS Feature Server</div>
              <p className="text-slate-500">
                Connect via ArcGIS Pro Spatial Database connection for survey validation.
              </p>
              <code className="block p-2 rounded bg-white border border-slate-200 font-mono text-[11px] text-emerald-800 truncate">
                https://land-governance-platform-virid.vercel.app/api/v1/ogc/features
              </code>
            </div>
          </div>
        </div>

        {/* State Land Records System Integration (API Adapters) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              State Land Revenue System Adapters (API Specifications)
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standardized integration architecture allowing state land administration portals to mirror deeds, reconcile survey boundaries, and verify mutation DAG hashes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STATE_ADAPTERS.map((adapter) => (
              <div
                key={adapter.state}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{adapter.state}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {adapter.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {adapter.system} ({adapter.format})
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {adapter.features}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
