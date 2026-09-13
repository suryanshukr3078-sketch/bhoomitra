import React from 'react';

export function HeroTopographicBg() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* 1. Deep Gradient Mesh Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -10%, #064e3b 0%, #032e24 45%, #0a1120 100%)',
        }}
      />

      {/* 2. Ambient Color Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-teal-500/15 blur-[120px]" />
      <div className="absolute top-[20%] right-[-5%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px]" />
      <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[300px] rounded-full bg-emerald-600/15 blur-[140px]" />

      {/* 3. Faint Topographic Map Contours SVG Pattern */}
      <svg
        className="absolute inset-0 w-full h-full text-emerald-400/[0.12]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern
            id="cadastral-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2,6"
              opacity="0.6"
            />
            <circle cx="64" cy="64" r="1" fill="currentColor" opacity="0.8" />
            <circle cx="0" cy="0" r="1" fill="currentColor" opacity="0.8" />
          </pattern>
        </defs>

        {/* Survey Cadastral Grid Layer */}
        <rect width="100%" height="100%" fill="url(#cadastral-grid)" />

        {/* Topographic Elevation Contours */}
        <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.85">
          {/* Contour Line 1 - Outer */}
          <path d="M -100,220 C 150,180 320,310 540,240 C 760,170 920,290 1140,220 C 1360,150 1500,280 1600,240" />
          {/* Contour Line 2 */}
          <path d="M -100,320 C 180,260 380,410 620,330 C 860,250 1020,390 1240,310 C 1440,240 1560,370 1650,330" />
          {/* Contour Line 3 - Index Contour (thicker) */}
          <path
            d="M -100,430 C 220,360 420,520 680,430 C 940,340 1120,500 1340,410 C 1500,340 1600,470 1700,420"
            strokeWidth="2"
            opacity="1"
          />
          {/* Contour Line 4 */}
          <path d="M -100,530 C 260,460 480,620 740,530 C 1000,440 1180,600 1420,510 C 1550,440 1650,560 1750,510" />
          {/* Contour Line 5 */}
          <path d="M -100,640 C 300,560 520,720 800,630 C 1080,540 1240,710 1500,610 C 1600,550 1700,650 1800,600" />
          
          {/* Topographic Valley / Hill Rings */}
          <path d="M 850,220 C 950,170 1080,180 1120,260 C 1160,340 1060,420 950,410 C 840,400 780,310 810,250 Z" />
          <path d="M 890,250 C 960,210 1040,220 1070,280 C 1100,340 1020,390 950,380 C 880,370 850,300 870,260 Z" />
          <path
            d="M 930,280 C 970,250 1020,260 1040,300 C 1060,340 1000,365 960,355 C 920,345 905,305 920,285 Z"
            strokeWidth="1.8"
          />

          {/* West Ridge Loop */}
          <path d="M 120,380 C 220,320 340,340 380,430 C 420,520 310,610 200,590 C 90,570 40,470 80,410 Z" />
          <path d="M 160,410 C 230,365 310,380 340,445 C 370,510 285,570 205,555 C 125,540 95,470 125,430 Z" />
        </g>

        {/* Elevation Markers / Survey Ticks */}
        <g fill="currentColor" opacity="0.6" fontSize="9" fontFamily="monospace">
          <text x="550" y="235">+ 180m</text>
          <text x="690" y="425">+ 160m (MSL)</text>
          <text x="750" y="525">+ 140m</text>
          <text x="965" y="348">▲ PT-42</text>
          <text x="210" y="548">▲ BM-09</text>
        </g>
      </svg>

      {/* 4. Soft Vignette Overlay to ensure seamless content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/80" />
    </div>
  );
}
