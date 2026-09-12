'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, ShieldCheck, Scale, Database, FileCheck2, ArrowRight } from 'lucide-react';
import { StaggerContainer, StaggerItem, MotionCard } from '@/components/motion/motion-primitives';

export function HeroCTAButtons() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
      <motion.div
        whileHover={prefersReduced ? undefined : { scale: 1.04, y: -1 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/maps"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <MapPin className="w-4 h-4" aria-hidden="true" />
          Explore Cadastral Map
        </Link>
      </motion.div>

      <motion.div
        whileHover={prefersReduced ? undefined : { scale: 1.04, y: -1 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/policies"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <FileCheck2 className="w-4 h-4" aria-hidden="true" />
          Policy Documents
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          whileHover={prefersReduced ? undefined : { scale: 1.03, y: -2 }}
          transition={{ duration: 0.15 }}
          className="text-center p-2 sm:p-4 rounded-xl hover:bg-slate-50/80 transition-colors"
        >
          <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {stat.value}
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            {stat.label}
          </div>
        </motion.div>
      ))}
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
  },
  {
    icon: ShieldCheck,
    title: 'Tamper-Evident Provenance',
    description:
      'Every title mutation, surveyor validation, and deed transfer is recorded in an immutable append-only provenance graph.',
    href: '/research',
    cta: 'Audit Provenance Trail',
  },
  {
    icon: Scale,
    title: 'Tenure Rights Protection',
    description:
      'Full lifecycle governance protecting Freehold, Leasehold, Customary, Communal, and Forest Rights land records.',
    href: '/policies',
    cta: 'View Land Policies',
  },
  {
    icon: Database,
    title: 'Open Spatial Data Catalog',
    description:
      'Downloadable GeoJSON, Shapefiles, and Cloud-Optimized GeoTIFFs (COGs) with standardized metadata schema.',
    href: '/datasets',
    cta: 'Browse GIS Datasets',
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
            <MotionCard className="h-full flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-sm">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="pt-6">
                <motion.div
                  whileHover={prefersReduced ? undefined : { x: 3 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block"
                >
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    {feature.cta}
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
        whileHover={prefersReduced ? undefined : { scale: 1.04 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/register"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors text-center"
        >
          Create Account
        </Link>
      </motion.div>
      <motion.div
        whileHover={prefersReduced ? undefined : { scale: 1.04 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="w-full sm:w-auto"
      >
        <Link
          href="/assistant"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-xl transition-colors text-center"
        >
          Ask AI Assistant
        </Link>
      </motion.div>
    </div>
  );
}
