import React from 'react';
import { MyGovHeroSlider } from '@/components/home/mygov-hero-slider';
import { MyGovCitizenHub } from '@/components/home/mygov-citizen-hub';
import { MyGovStatsTicker } from '@/components/home/mygov-stats-ticker';
import { MyGovGisPreview } from '@/components/home/mygov-gis-preview';
import { MyGovSchemesGrid } from '@/components/home/mygov-schemes-grid';
import { MyGovNoticeBoard } from '@/components/home/mygov-notice-board';
import { MyGovAppConnect } from '@/components/home/mygov-app-connect';

export const metadata = {
  title: 'Home | Bhoomitra - National Land Governance & Cadastral Platform | Government of India',
  description:
    'Citizen engagement platform for transparent cadastral governance, Bhu-Aadhaar (ULPIN), SVAMITVA rural land property cards, and participatory spatial boundary administration.',
};

export default function HomePage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-8 sm:space-y-14 pb-16 bg-white">
      {/* 1. MyGov Full-Width Flagship Initiatives Hero Banner */}
      <MyGovHeroSlider />

      {/* 2. MyGov 5-Pillar Citizen Engagement: Do, Discuss, Poll, Blog, Talk */}
      <MyGovCitizenHub />

      {/* 3. National Cadastral Statistics Numbers */}
      <MyGovStatsTicker />

      {/* 4. Pan-India Cadastral GIS Explorer */}
      <MyGovGisPreview />

      {/* 5. Flagship Government Schemes & Portals */}
      <MyGovSchemesGrid />

      {/* 6. Gazette, Circulars & Tenders Notice Board */}
      <MyGovNoticeBoard />

      {/* 7. Citizen Mobile App & Community Connect */}
      <MyGovAppConnect />
    </div>
  );
}
