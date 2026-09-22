'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Star,
  Calendar,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';
import { AshokaEmblem } from '@/components/layout/gov-emblem';
import { useTranslation } from '@/providers/i18n-context';

interface Slide {
  id: string;
  badge: string;
  goldenTitle: string;
  subtitle: string;
  tagline: string;
  ctaText: string;
  ctaHref: string;
  bgGradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 'svamitva',
    badge: 'FLAGSHIP NATIONAL INITIATIVE',
    goldenTitle: 'SVAMITVA@2026',
    subtitle: 'Meri Sampatti, Mera Haq',
    tagline: 'Empowering 6.4+ Lakh Rural Villages with Drone-Mapped Digital Property Cards',
    ctaText: 'Explore Cadastral GIS',
    ctaHref: '/maps?filter=svamitva',
    bgGradient: 'radial-gradient(ellipse at 70% 50%, #1e3a8a 0%, #0c1c38 55%, #050b17 100%)',
  },
  {
    id: 'bhu-aadhaar',
    goldenTitle: 'Bhu-Aadhaar@14',
    badge: 'ONE NATION, ONE CADASTRE',
    subtitle: '14-Digit Unique Parcel ID (ULPIN)',
    tagline: 'Standardized Geospatial Coordinates for Transparent & Dispute-Free Land Ownership',
    ctaText: 'Verify Land Parcel',
    ctaHref: '/maps',
    bgGradient: 'radial-gradient(ellipse at 70% 50%, #064e3b 0%, #062b22 55%, #02120e 100%)',
  },
  {
    id: 'participatory-gis',
    badge: 'CITIZEN ENGAGEMENT',
    goldenTitle: 'Boundary Review',
    subtitle: 'Participatory Cadastral Survey',
    tagline: 'Review Village Drone Boundaries Online & Submit Spatial Feedback with Gram Panchayats',
    ctaText: 'Join Survey Consultation',
    ctaHref: '/contribute',
    bgGradient: 'radial-gradient(ellipse at 70% 50%, #78350f 0%, #3d1a04 55%, #180a02 100%)',
  },
  {
    id: 'srishti-watershed',
    badge: 'SPACE REMOTE SENSING',
    goldenTitle: 'SRISHTI-DRISHTI',
    subtitle: 'Satellite Watershed Administration',
    tagline: '30-Meter Satellite Remote Sensing & Drainage GIS Interventions under WDC-PMKSY',
    ctaText: 'View Watershed GIS',
    ctaHref: '/watershed',
    bgGradient: 'radial-gradient(ellipse at 70% 50%, #0e7490 0%, #083344 55%, #021217 100%)',
  },
];

export function MyGovHeroSlider() {
  const [current, setCurrent] = useState(0);
  const { locale, t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[current];

  const slideTitle =
    slide.id === 'bhu-aadhaar'
      ? t('hero.slide1_title', slide.goldenTitle)
      : slide.id === 'svamitva'
      ? t('hero.slide2_title', slide.goldenTitle)
      : slide.id === 'participatory-gis'
      ? t('hero.slide3_title', slide.goldenTitle)
      : slide.goldenTitle;

  const slideTagline =
    slide.id === 'bhu-aadhaar'
      ? t('hero.slide1_desc', slide.tagline)
      : slide.id === 'svamitva'
      ? t('hero.slide2_desc', slide.tagline)
      : slide.id === 'participatory-gis'
      ? t('hero.slide3_desc', slide.tagline)
      : slide.tagline;

  const slideCta =
    slide.id === 'bhu-aadhaar'
      ? t('hero.slide1_cta1', slide.ctaText)
      : slide.id === 'svamitva'
      ? t('hero.slide2_cta1', slide.ctaText)
      : slide.id === 'participatory-gis'
      ? t('hero.slide3_cta1', slide.ctaText)
      : slide.ctaText;

  return (
    <div className="relative w-full overflow-hidden text-white min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center"
          style={{ background: slide.bgGradient }}
        >
          {/* Subtle starry / sparkle effect like MyGov banner */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:32px_32px] pointer-events-none" />

          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 py-10 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Content Area */}
              <div className="lg:col-span-8 space-y-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff9933]" />
                  <span>{slide.badge}</span>
                </div>

                {/* Golden Display Title (Like MyGov's stylized text) */}
                <div className="space-y-1">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-heading drop-shadow-md bg-gradient-to-r from-[#ffe082] via-[#ffb300] to-[#ff8f00] bg-clip-text text-transparent">
                    {slideTitle}
                  </h1>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white font-serif italic drop-shadow">
                    {slide.subtitle}
                  </h2>
                </div>

                {/* Tagline */}
                <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed pt-1">
                  {slideTagline}
                </p>

                {/* Direct CTA */}
                <div className="pt-3">
                  <Link
                    href={slide.ctaHref}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#f37021] hover:bg-[#e05e10] text-white font-extrabold text-sm sm:text-base shadow-xl transition-all active:scale-95"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{slideCta}</span>
                  </Link>
                </div>
              </div>

              {/* Right Partner / Ministry Badge (Exactly like MyGov top-right badge in Screenshot 1) */}
              <div className="lg:col-span-4 hidden lg:flex justify-end">
                <div className="bg-white/95 rounded-xl shadow-2xl p-4 flex items-center gap-3 border border-white max-w-sm text-slate-800">
                  <AshokaEmblem className="w-9 h-11 text-slate-700 shrink-0" />
                  <div className="text-[11px] leading-tight border-r border-slate-200 pr-3">
                    <div className="font-bold text-slate-900">ग्रामीण विकास मंत्रालय</div>
                    <div className="text-[9px] text-slate-600 uppercase font-semibold">MINISTRY OF RURAL DEVELOPMENT</div>
                    <div className="text-[9px] text-slate-500 font-medium">Govt. of India</div>
                  </div>
                  <div className="flex flex-col text-left pl-1">
                    <span className="text-[#00838f] text-base font-extrabold lowercase">bhoo<span className="text-[#f37021] font-black uppercase">MITRA</span></span>
                    <span className="text-[9px] text-[#00838f] font-bold">मेरी सरकार</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next Circular Translucent Buttons (Matching Screenshot 1) */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Floating Right Side Quick-Action Widgets (Matching Screenshot 1) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-2.5">
        <Link
          href="/maps"
          title="Cadastral Maps"
          className="w-9 h-9 rounded-full bg-white hover:bg-amber-50 text-[#f37021] shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          <Star className="w-4 h-4 fill-current" />
        </Link>
        <Link
          href="/policies"
          title="Schemes & Calendar"
          className="w-9 h-9 rounded-full bg-white hover:bg-amber-50 text-[#f37021] shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          <Calendar className="w-4 h-4" />
        </Link>
        <Link
          href="/contribute"
          title="Participate in Survey"
          className="w-9 h-9 rounded-full bg-white hover:bg-amber-50 text-[#f37021] shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          <CheckSquare className="w-4 h-4" />
        </Link>
        <Link
          href="/contact"
          title="Citizen Helpdesk"
          className="w-9 h-9 rounded-full bg-white hover:bg-amber-50 text-[#f37021] shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
      </div>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`h-2 transition-all rounded-full ${
              current === idx ? 'w-6 bg-[#ff9933]' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
