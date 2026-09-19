'use client';

import React from 'react';

export function AshokaEmblem({ className = 'w-9 h-11' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 120"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="State Emblem of India"
    >
      {/* Central Lion */}
      <path
        d="M 50 15 C 44 15 40 20 40 26 C 40 32 43 35 45 37 C 42 39 38 43 38 48 C 38 54 42 59 47 61 L 47 68 L 53 68 L 53 61 C 58 59 62 54 62 48 C 62 43 58 39 55 37 C 57 35 60 32 60 26 C 60 20 56 15 50 15 Z"
        fill="#334155"
      />
      {/* Left Lion Head & Mane */}
      <path
        d="M 37 25 C 33 25 29 29 29 34 C 29 39 32 42 35 44 C 31 46 27 50 27 55 C 27 60 30 64 35 66 L 37 72 L 42 72 L 40 65 C 36 63 34 60 34 56 C 34 52 37 49 40 48 Z"
        fill="#475569"
      />
      {/* Right Lion Head & Mane */}
      <path
        d="M 63 25 C 67 25 71 29 71 34 C 71 39 68 42 65 44 C 69 46 73 50 73 55 C 73 60 70 64 65 66 L 63 72 L 58 72 L 60 65 C 64 63 66 60 66 56 C 66 52 63 49 60 48 Z"
        fill="#475569"
      />
      {/* Abacus Base Platform */}
      <rect x="22" y="72" width="56" height="8" rx="2" fill="#334155" />
      {/* Ashoka Chakra in Center of Abacus */}
      <circle cx="50" cy="88" r="7" stroke="#334155" strokeWidth="1.8" fill="none" />
      <circle cx="50" cy="88" r="1.5" fill="#334155" />
      {/* Bull & Horse */}
      <ellipse cx="32" cy="88" rx="5" ry="3.5" fill="#475569" opacity="0.8" />
      <ellipse cx="68" cy="88" rx="5" ry="3.5" fill="#475569" opacity="0.8" />
      {/* Bell Base */}
      <path
        d="M 26 96 C 30 96 35 105 50 105 C 65 105 70 96 74 96 C 76 96 78 98 77 101 C 74 108 65 112 50 112 C 35 112 26 108 23 101 C 22 98 24 96 26 96 Z"
        fill="#334155"
      />
      <text
        x="50"
        y="118"
        textAnchor="middle"
        fontSize="6"
        fontWeight="bold"
        fill="#334155"
        fontFamily="serif"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}

export function BhoomitraMyGovLogo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <AshokaEmblem className="w-8 h-10 sm:w-9 sm:h-11 shrink-0" />
      <div className="flex flex-col">
        <div className="flex items-baseline font-black leading-none tracking-tight">
          <span className="text-[#00838f] text-2xl sm:text-[28px] font-extrabold lowercase font-sans">bhoo</span>
          <span className="text-[#e65100] text-2xl sm:text-[28px] font-black uppercase font-heading ml-0.5">MITRA</span>
        </div>
        <div className="text-[10px] sm:text-[11px] font-bold text-[#00838f] tracking-wide mt-0.5 leading-none">
          मेरी सरकार <span className="text-slate-400 font-normal">|</span> भारत सरकार
        </div>
      </div>
    </div>
  );
}

export function DigitalIndiaLogo({ className = 'h-8' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 font-bold tracking-tighter ${className}`}>
      <span className="text-[#0066b2] text-sm sm:text-base font-extrabold">Digital</span>
      <span className="text-[#ff9933] text-sm sm:text-base font-extrabold">India</span>
    </div>
  );
}
