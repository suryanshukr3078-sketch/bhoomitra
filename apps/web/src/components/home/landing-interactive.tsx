'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Scale,
  Database,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Bot,
  Layers,
  Building2,
  FileText,
} from 'lucide-react';
import { StaggerContainer, StaggerItem, MotionCard } from '@/components/motion/motion-primitives';

export function HeroCTAButtons() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto">
      <motion.div
        whileHover={prefersReduced ? undefined : { scale: 1.04, y: -2 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/maps"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/20 border border-amber-300/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <MapPin className="w-4 h-4 text-slate-950 shrink-0" aria-hidden="true" />
          <span>Explore Cadastral Map</span>
        </Link>
      </motion.div>

      <motion.div
        whileHover={prefersReduced ? undefined : { scale: 1.04, y: -2 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/policies"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold rounded-xl backdrop-blur-md shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <FileCheck2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
          <span>Policy Documents</span>
        </Link>
      </motion.div>
    </div>
  );
}

interface StatItem {
  label: string;
  value: string;
}

export function StatsCounterGrid({ stats }: { stats: StatItem[] }) {
  const prefersReduced = useReducedMotion();

  const statIcons = [MapPin, ShieldCheck, FileText, Building2];
  const iconColors = [
    'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    'bg-teal-50 text-teal-700 border-teal-200/60',
    'bg-amber-50 text-amber-700 border-amber-200/60',
    'bg-sky-50 text-sky-700 border-sky-200/60',
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-200/85">
      {stats.map((stat, idx) => {
        const Icon = statIcons[idx % statIcons.length];
        const colorCls = iconColors[idx % iconColors.length];

        return (
          <motion.div
            key={stat.label}
            whileHover={prefersReduced ? undefined : { scale: 1.02, y: -2 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl hover:bg-slate-50/80 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 shadow-sm ${colorCls}`}>
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            </div>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              {stat.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

const FEATURES = [
  {
    icon: MapPin,
    title: 'GIS Cadastral Mapping',
    description:
      'Precise polygon boundaries with EPSG:4326 PostGIS verification preventing boundary overlap and illegal land encroachment.',
    href: '/maps',
    cta: 'Open Cadastral Map',
    badge: 'Spatial GIS',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    icon: ShieldCheck,
    title: 'Tamper-Evident Provenance',
    description:
      'Every title mutation, surveyor validation, and deed transfer is recorded in an immutable append-only provenance graph.',
    href: '/evidence',
    cta: 'Audit Provenance Trail',
    badge: 'Append-Only',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    icon: Scale,
    title: 'Tenure Rights Protection',
    description:
      'Full lifecycle governance protecting Freehold, Leasehold, Customary, Communal, and Forest Rights land records.',
    href: '/policies',
    cta: 'View Land Policies',
    badge: 'Statutory Law',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    icon: Database,
    title: 'Open Spatial Data Catalog',
    description:
      'Downloadable GeoJSON, Shapefiles, and Cloud-Optimized GeoTIFFs (COGs) with standardized metadata schema.',
    href: '/datasets',
    cta: 'Browse GIS Datasets',
    badge: 'Open Formats',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
];

export function FeaturesInteractiveGrid() {
  const prefersReduced = useReducedMotion();

  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {FEATURES.map((feature) => {
        const Icon = feature.icon;
        return (
          <StaggerItem key={feature.title}>
            <MotionCard className="h-full flex flex-col justify-between p-6 sm:p-7 bg-white rounded-2xl border border-slate-200/85 shadow-card hover:shadow-card-hover hover:border-emerald-400/60 transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-emerald-700 group-hover:to-teal-700 group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${feature.badgeColor}`}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-emerald-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6">
                <motion.div
                  whileHover={prefersReduced ? undefined : { x: 3 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block"
                >
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>{feature.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </motion.div>
              </div>
            </MotionCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

export function BottomCTAButtons() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
      <motion.div
        whileHover={prefersReduced ? undefined : { scale: 1.04, y: -2 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/register"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/20 border border-amber-300/40 transition-all text-center"
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4 text-slate-950" aria-hidden="true" />
        </Link>
      </motion.div>
      <motion.div
        whileHover={prefersReduced ? undefined : { scale: 1.04, y: -2 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/assistant"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white font-medium rounded-xl shadow-md transition-all text-center backdrop-blur-sm"
        >
          <Bot className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Ask AI Assistant</span>
        </Link>
      </motion.div>
    </div>
  );
}
