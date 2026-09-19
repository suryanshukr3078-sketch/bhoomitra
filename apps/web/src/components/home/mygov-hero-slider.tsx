'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  Layers,
  Award,
} from 'lucide-react';

interface Slide {
  id: string;
  tagEn: string;
  tagHi: string;
  titleEn: string;
  titleHi: string;
  description: string;
  stat: { value: string; label: string };
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  bgGradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 'svamitva',
    tagEn: 'FLAGSHIP NATIONAL INITIATIVE',
    tagHi: 'स्वामित्व योजना',
    titleEn: 'SVAMITVA: Digital Property Cards for Rural India',
    titleHi: 'ग्रामीण आबादी क्षेत्रों का ड्रोन आधारित डिजिटल सीमांकन',
    description:
      'Survey of Villages and Mapping with Improvised Technology in Village Areas using high-resolution survey drones and PostGIS cadastral boundary validation.',
    stat: { value: '6.4+ Lakh', label: 'Villages Covered' },
    primaryCta: { label: 'Explore Village Cadastres', href: '/maps?filter=svamitva' },
    secondaryCta: { label: 'Scheme Details', href: '/policies' },
    bgGradient: 'from-[#0b1c36] via-[#142d54] to-[#1a3c6e]',
  },
  {
    id: 'bhu-aadhaar',
    tagEn: 'ONE NATION, ONE CADASTRE',
    tagHi: 'भू-आधार (ULPIN)',
    titleEn: 'Bhu-Aadhaar: 14-Digit Unique Land Parcel Identifier',
    titleHi: 'प्रत्येक भूमि भूखंड की अद्वितीय डिजिटल पहचान',
    description:
      'Standardized geospatial coordinate geo-coding assigning every land parcel in India a verifiable cryptographic and spatial identity, preventing overlapping title claims.',
    stat: { value: '1.8+ Crore', label: 'ULPINs Generated' },
    primaryCta: { label: 'Verify Parcel Coordinates', href: '/maps' },
    secondaryCta: { label: 'Digitization Studio', href: '/digitization' },
    bgGradient: 'from-[#06261c] via-[#0b3d2e] to-[#142d54]',
  },
  {
    id: 'participatory-gis',
    tagEn: 'CITIZEN COLLABORATION',
    tagHi: 'सहभागी सीमा सत्यापन',
    titleEn: 'Citizen Boundary Review & Participatory Mapping',
    titleHi: 'नागरिक एवं ग्राम पंचायत द्वारा भू-अभिलेख सत्यापन',
    description:
      'Empowering landowners and gram panchayats to inspect high-resolution cadastral vector boundaries, raise spatial objections, and verify land ownership online.',
    stat: { value: '99.4%', label: 'Dispute Redressal' },
    primaryCta: { label: 'Participate in Survey', href: '/contribute' },
    secondaryCta: { label: 'Citizen Discussions', href: '/policies' },
    bgGradient: 'from-[#2b1807] via-[#4a280c] to-[#142d54]',
  },
  {
    id: 'srishti-watershed',
    tagEn: 'SPACE TECHNOLOGY & GIS',
    tagHi: 'सृष्टि-दृष्टि वाटरशेड',
    titleEn: 'SRISHTI-DRISHTI: Satellite Watershed Administration',
    titleHi: 'उपग्रह आधारित जलसंभर एवं प्राकृतिक संसाधन प्रबंधन',
    description:
      '30-meter multispectral satellite monitoring and automated DEM drainage flow vectors for ridge-to-valley rural watershed interventions under WDC-PMKSY 2.0.',
    stat: { value: '52,000+', label: 'Water Structures' },
    primaryCta: { label: 'View Watershed GIS', href: '/watershed' },
    secondaryCta: { label: 'Open GIS Datasets', href: '/datasets' },
    bgGradient: 'from-[#0c2438] via-[#10344f] to-[#1a3c6e]',
  },
];

export function MyGovHeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden text-white bg-slate-950">
      {/* Tricolor Ribbon Top Accent */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#ff9933]" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} flex items-center`}
          >
            {/* Subtle Map / Grid Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Text Content */}
                <div className="lg:col-span-8 space-y-4 text-left">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff9933]" />
                    <span>{slide.tagEn}</span>
                    <span className="opacity-40">|</span>
                    <span className="font-normal text-slate-200">{slide.tagHi}</span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-heading">
                    {slide.titleEn}
                  </h1>

                  <p className="text-amber-200/90 text-sm sm:text-base font-medium">
                    {slide.titleHi}
                  </p>

                  <p className="text-slate-200 text-xs sm:text-sm lg:text-base max-w-2xl leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Call to Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.primaryCta.href}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#ff9933] hover:bg-[#e68a00] text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-500/20"
                    >
                      <MapPin className="w-4 h-4 text-slate-950" />
                      <span>{slide.primaryCta.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
                    </Link>

                    <Link
                      href={slide.secondaryCta.href}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/25 transition-all backdrop-blur-sm"
                    >
                      <span>{slide.secondaryCta.label}</span>
                    </Link>
                  </div>
                </div>

                {/* Stat Highlight Card */}
                <div className="lg:col-span-4 flex justify-start lg:justify-end">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-xs shadow-2xl text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#ff9933]/20 border border-[#ff9933]/40 flex items-center justify-center mx-auto mb-3 text-[#ff9933]">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
                      {slide.stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
                      {slide.stat.label}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/15 text-[11px] text-amber-200">
                      National Cadastral Registry Live Data
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center transition-colors"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Navigation Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2 transition-all rounded-full ${
                current === idx ? 'w-8 bg-[#ff9933]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
