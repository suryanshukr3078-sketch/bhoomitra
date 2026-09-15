'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  TrendingUp,
  Scale,
  ShieldCheck,
  Building2,
  TreePine,
  AlertTriangle,
  RotateCcw,
  Download,
  Share2,
  Sparkles,
  Info,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimulationParameters {
  leasingDeregulation: number; // 0 to 100%
  cadastralTitlingTarget: number; // 10 to 100%
  stampDutyRate: number; // 1.0 to 10.0%
  disputeTribunals: number; // 1 to 25 benches per district
  fraExpeditedVesting: number; // 0 to 100%
  stateContext: string;
}

const PRESET_SCENARIOS: Record<
  string,
  { name: string; description: string; params: SimulationParameters }
> = {
  dilrmp: {
    name: 'DILRMP Conclusive Titling Push',
    description:
      'High-priority digital title conversion with active dispute resolution tribunals and balanced stamp duty.',
    params: {
      leasingDeregulation: 45,
      cadastralTitlingTarget: 95,
      stampDutyRate: 4.5,
      disputeTribunals: 16,
      fraExpeditedVesting: 60,
      stateContext: 'National Baseline',
    },
  },
  tribal_agro: {
    name: 'Agro-Ecological & Tribal Tenure First',
    description:
      'Maximum Forest Rights Act (FRA) vesting, community land protection, with controlled leasing deregulation.',
    params: {
      leasingDeregulation: 20,
      cadastralTitlingTarget: 75,
      stampDutyRate: 5.0,
      disputeTribunals: 12,
      fraExpeditedVesting: 95,
      stateContext: 'Western Ghats & Central Tribal Belt',
    },
  },
  market_growth: {
    name: 'Market-Driven Agrarian Leasing & Investment',
    description:
      'Aggressive leasing liberalization, low stamp duty to stimulate land consolidation and institutional credit.',
    params: {
      leasingDeregulation: 90,
      cadastralTitlingTarget: 85,
      stampDutyRate: 2.5,
      disputeTribunals: 20,
      fraExpeditedVesting: 40,
      stateContext: 'High-Growth Peri-Urban Corridors',
    },
  },
};

export default function PolicySimulationPage() {
  const { toast } = useToast();
  const [activePreset, setActivePreset] = useState<string>('dilrmp');
  const [params, setParams] = useState<SimulationParameters>(
    PRESET_SCENARIOS.dilrmp.params
  );
  const [selectedHorizonYear, setSelectedHorizonYear] = useState<number>(2028);

  const applyPreset = (key: string) => {
    setActivePreset(key);
    setParams(PRESET_SCENARIOS[key].params);
    toast({
      title: 'Scenario Loaded',
      description: `Applied ${PRESET_SCENARIOS[key].name} parameter set.`,
      duration: 2500,
    });
  };

  const updateParam = (key: keyof SimulationParameters, value: any) => {
    setActivePreset('custom');
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // Econometric & Geospatial Simulation Computation Model
  const simulationResults = useMemo(() => {
    const {
      leasingDeregulation,
      cadastralTitlingTarget,
      stampDutyRate,
      disputeTribunals,
      fraExpeditedVesting,
    } = params;

    // 1. Credit Expansion: Titling + Leasing elasticity
    const creditGrowthPct = Number(
      (
        cadastralTitlingTarget * 0.38 +
        leasingDeregulation * 0.22 -
        (stampDutyRate > 6 ? (stampDutyRate - 6) * 2.5 : 0)
      ).toFixed(1)
    );
    const incrementalCreditCrores = Math.round(creditGrowthPct * 485 + 1200);

    // 2. Dispute Backlog Reduction: Tribunals + Titling accuracy
    const disputeReductionPct = Number(
      Math.min(
        82,
        cadastralTitlingTarget * 0.42 +
          disputeTribunals * 1.8 +
          fraExpeditedVesting * 0.15
      ).toFixed(1)
    );
    const casesResolvedEst = Math.round(disputeReductionPct * 184);

    // 3. State Revenue Elasticity: Volume vs Rate
    // Lower rate (down to 3%) increases formal transaction volume by up to 40%
    const volumeMultiplier = 1 + Math.max(0, (6 - stampDutyRate) * 0.08);
    const simulatedRevenueCrores = Math.round(
      (stampDutyRate / 5.0) * volumeMultiplier * 14200
    );
    const revenueDeltaPct = Number(
      (((simulatedRevenueCrores - 14200) / 14200) * 100).toFixed(1)
    );

    // 4. Farmland Conversion Risk (ha/yr)
    const conversionRateHa = Math.round(
      1800 + leasingDeregulation * 18.5 - fraExpeditedVesting * 9.2
    );
    const speculativeRisk =
      conversionRateHa > 3200
        ? 'High Vulnerability'
        : conversionRateHa > 2400
        ? 'Moderate Managed Risk'
        : 'Low Speculative Pressure';

    // 5. Ecological & Community Tenure Index (0 - 100)
    const ecoIndex = Number(
      Math.min(
        100,
        fraExpeditedVesting * 0.65 +
          cadastralTitlingTarget * 0.25 -
          leasingDeregulation * 0.12 +
          15
      ).toFixed(1)
    );

    // Trajectory 2026 - 2030
    const trajectory = [2026, 2027, 2028, 2029, 2030].map((year, idx) => {
      const progression = (idx + 1) / 5;
      return {
        year,
        creditInflow: Math.round(creditGrowthPct * progression),
        disputeResolved: Math.round(disputeReductionPct * progression),
        revenueCrores: Math.round(14200 + (simulatedRevenueCrores - 14200) * progression),
        ecoScore: Math.round(ecoIndex * (0.8 + 0.2 * progression)),
      };
    });

    return {
      creditGrowthPct,
      incrementalCreditCrores,
      disputeReductionPct,
      casesResolvedEst,
      simulatedRevenueCrores,
      revenueDeltaPct,
      conversionRateHa,
      speculativeRisk,
      ecoIndex,
      trajectory,
    };
  }, [params]);

  const handleExportReport = () => {
    const reportData = {
      title: 'Bhoomitra Policy Simulation Outcome Report',
      generatedAt: new Date().toISOString(),
      scenario:
        activePreset === 'custom'
          ? 'Custom Policy Mix'
          : PRESET_SCENARIOS[activePreset].name,
      parameters: params,
      projectedOutcomes: simulationResults,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomitra-simulation-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Simulation Report Exported',
      description: 'Downloaded JSON forecast briefing with econometric projections.',
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Ex-Ante Policy Decision Support Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Policy Simulation Studio
          </h1>
          <p className="text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            Simulate the multi-year socio-economic, revenue, and tenure outcomes of
            proposed land reforms before implementation. Adjust cadastral titling,
            leasing deregulation, dispute tribunal density, and stamp duty rates.
          </p>

          {/* Preset Scenario Selector */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">
              Preset Scenarios:
            </span>
            {Object.entries(PRESET_SCENARIOS).map(([key, scenario]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activePreset === key
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                {scenario.name}
              </button>
            ))}
            {activePreset === 'custom' && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Custom Policy Configuration
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Simulation Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Levers (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Reform Levers
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => applyPreset('dilrmp')}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 transition-colors"
                  title="Reset to default baseline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Lever 1: Digital Titling Target */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Digital Cadastre Titling Target</span>
                  <span className="text-emerald-700 font-bold">
                    {params.cadastralTitlingTarget}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={params.cadastralTitlingTarget}
                  onChange={(e) =>
                    updateParam('cadastralTitlingTarget', Number(e.target.value))
                  }
                  className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Percentage of revenue villages converted from presumptive deeds to conclusive digital titles.
                </p>
              </div>

              {/* Lever 2: Leasing Deregulation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Agricultural Land Leasing Deregulation</span>
                  <span className="text-blue-700 font-bold">
                    {params.leasingDeregulation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={params.leasingDeregulation}
                  onChange={(e) =>
                    updateParam('leasingDeregulation', Number(e.target.value))
                  }
                  className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Degree of formal tenancy legalization without adverse possession risk for landowners.
                </p>
              </div>

              {/* Lever 3: Stamp Duty & Registration Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">State Stamp Duty & Registration Fee</span>
                  <span className="text-amber-700 font-bold">
                    {params.stampDutyRate.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.5"
                  value={params.stampDutyRate}
                  onChange={(e) =>
                    updateParam('stampDutyRate', Number(e.target.value))
                  }
                  className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Nominal rate levied on conveyance deeds (National median: 5.5%–7.0%).
                </p>
              </div>

              {/* Lever 4: Fast-Track Dispute Benches */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Fast-Track Land Dispute Benches</span>
                  <span className="text-purple-700 font-bold">
                    {params.disputeTribunals} Benches / Div
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={params.disputeTribunals}
                  onChange={(e) =>
                    updateParam('disputeTribunals', Number(e.target.value))
                  }
                  className="w-full accent-purple-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Specialized quasi-judicial benches dedicated to boundary reconciliation and summary trials.
                </p>
              </div>

              {/* Lever 5: FRA Community Title Expediting */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Forest Rights Act (FRA) Vesting Pace</span>
                  <span className="text-teal-700 font-bold">
                    {params.fraExpeditedVesting}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={params.fraExpeditedVesting}
                  onChange={(e) =>
                    updateParam('fraExpeditedVesting', Number(e.target.value))
                  }
                  className="w-full accent-teal-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Speed of Gram Sabha communal forest resource demarcation and title issuance.
                </p>
              </div>
            </div>

            {/* Export & Actions Card */}
            <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Executive Briefing Export</span>
              </h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Download a formalized simulation impact briefing with full econometric
                parameters for inter-ministerial review committees.
              </p>
              <button
                type="button"
                onClick={handleExportReport}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Export Simulation Report (JSON)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Projected Outcomes (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top KPI Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Metric 1: Credit Inflow */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Agri Credit Expansion
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    +{simulationResults.creditGrowthPct}%
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" /> High Impact
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Est. ₹{simulationResults.incrementalCreditCrores.toLocaleString()} Cr new formal loans
                </div>
              </div>

              {/* Metric 2: Dispute Backlog */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Dispute Backlog Decline
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    -{simulationResults.disputeReductionPct}%
                  </span>
                  <span className="text-xs text-purple-600 font-semibold flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Relief
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  ~{simulationResults.casesResolvedEst.toLocaleString()} litigation cases averted
                </div>
              </div>

              {/* Metric 3: Revenue Delta */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    State Registry Revenue
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{simulationResults.simulatedRevenueCrores.toLocaleString()} Cr
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center ${
                      simulationResults.revenueDeltaPct >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {simulationResults.revenueDeltaPct >= 0 ? '+' : ''}
                    {simulationResults.revenueDeltaPct}%
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Elasticity adjusted for formal registry volume
                </div>
              </div>
            </div>

            {/* Second Row: Multi-Year Trajectory Table & Graphic */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    5-Year Reform Implementation Trajectory (2026–2030)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simulated multi-year compounding effect of adopted administrative and statutory changes.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {[2026, 2027, 2028, 2029, 2030].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSelectedHorizonYear(y)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedHorizonYear === y
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trajectory Data Rows */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Year {selectedHorizonYear} Credit Inflow
                  </div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    +
                    {
                      simulationResults.trajectory.find(
                        (t) => t.year === selectedHorizonYear
                      )?.creditInflow
                    }
                    %
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Incremental bank debt to tenant farmers
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Year {selectedHorizonYear} Dispute Reduction
                  </div>
                  <div className="text-xl font-bold text-purple-700 mt-1">
                    -
                    {
                      simulationResults.trajectory.find(
                        (t) => t.year === selectedHorizonYear
                      )?.disputeResolved
                    }
                    %
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Reduction in civil court pending dockets
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Year {selectedHorizonYear} Revenue Flow
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    ₹
                    {simulationResults.trajectory
                      .find((t) => t.year === selectedHorizonYear)
                      ?.revenueCrores.toLocaleString()}{' '}
                    Cr
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Registration and stamp receipts
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Tenure & Eco Score
                  </div>
                  <div className="text-xl font-bold text-teal-700 mt-1">
                    {
                      simulationResults.trajectory.find(
                        (t) => t.year === selectedHorizonYear
                      )?.ecoScore
                    }{' '}
                    / 100
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Forest Rights & agrarian stability
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental & Speculative Risk Safeguard Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TreePine className="w-5 h-5 text-emerald-700" />
                <span>Ecological Safeguards & Land Conversion Dynamics</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">
                      Farmland to Non-Agri Conversion
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {simulationResults.conversionRateHa.toLocaleString()} ha/year
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (simulationResults.conversionRateHa / 3800) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-slate-500 leading-tight">
                    Assessment: <span className="font-semibold text-slate-800">{simulationResults.speculativeRisk}</span>.
                    {params.leasingDeregulation > 70 && (
                      <span className="text-amber-700 font-medium ml-1">
                        Consider implementing farmland retention zoning around urban perimeters.
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">
                      Community & Forest Tenure Rating
                    </span>
                    <span className="font-extrabold text-teal-700">
                      {simulationResults.ecoIndex} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{ width: `${simulationResults.ecoIndex}%` }}
                    />
                  </div>
                  <p className="text-slate-500 leading-tight">
                    {simulationResults.ecoIndex >= 70
                      ? 'Optimal balance: robust Gram Sabha rights protection against unilateral alienation.'
                      : 'Attention needed: accelerate FRA Gram Sabha demarcation to prevent boundary overlap disputes.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Support Recommendations */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Decision Support Insights</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Optimal Titling Window:</strong> Increasing cadastral titling from{' '}
                    {params.cadastralTitlingTarget}% towards 95% provides the highest marginal reduction in boundary litigations with an estimated{' '}
                    +{simulationResults.creditGrowthPct}% agricultural credit expansion.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Revenue Elasticity Sweet Spot:</strong> Maintaining stamp duty between 3.5%–4.5% optimizes state treasury revenue by expanding the formal deed registration base while eliminating incentives for undervaluation.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
