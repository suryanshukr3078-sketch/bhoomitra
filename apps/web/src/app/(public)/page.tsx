import React from 'react';
import { MyGovHeroSlider } from '@/components/home/mygov-hero-slider';
import { MyGovStatsTicker } from '@/components/home/mygov-stats-ticker';
import { MyGovCitizenHub } from '@/components/home/mygov-citizen-hub';
import { MyGovGisPreview } from '@/components/home/mygov-gis-preview';
import { MyGovSchemesGrid } from '@/components/home/mygov-schemes-grid';
import { MyGovNoticeBoard } from '@/components/home/mygov-notice-board';
import { MyGovAppConnect } from '@/components/home/mygov-app-connect';

export const metadata = {
  title: 'Home | Bhoomitra - National Land Governance & Cadastral Platform',
  description:
    'Citizen engagement platform for transparent cadastral governance, Bhu-Aadhaar (ULPIN), SVAMITVA rural land property cards, and participatory spatial boundary administration.',
};

export default function HomePage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 sm:space-y-10 pb-16 bg-[#f8fafc]">
      {/* 1. MyGov Flagship Initiatives Hero Carousel */}
      <MyGovHeroSlider />

      {/* 2. Live National Cadastral Statistics Ticker */}
      <MyGovStatsTicker />

      {/* 3. MyGov 5-Pillar Citizen Engagement Hub: Do, Discuss, Poll, Blog, Talk */}
      <MyGovCitizenHub />

      {/* 4. Pan-India Cadastral GIS Quick Explorer */}
      <MyGovGisPreview />

      {/* 5. Flagship Government Schemes & Programs */}
      <MyGovSchemesGrid />

      {/* 6. Gazette, Circulars & Tenders Notice Board */}
      <MyGovNoticeBoard />

      {/* 7. Citizen App, WhatsApp & Community Connect */}
      <MyGovAppConnect />
    </div>
  );
}
