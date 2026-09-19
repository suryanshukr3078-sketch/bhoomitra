'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Download,
  ArrowRight,
} from 'lucide-react';

export function MyGovAppConnect() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-3xl bg-[#14233c] text-white p-6 sm:p-10 border border-slate-700 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff9933]/20 border border-[#ff9933]/40 text-xs font-bold text-[#ff9933]">
            <Smartphone className="w-3.5 h-3.5" />
            <span>CITIZEN ACCESSIBILITY EVERYWHERE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading leading-tight">
            Access Land Records on Mobile, WhatsApp &amp; UMANG
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Download your RoR (Jamabandi/Khasra), track land mutation status, and receive SMS alerts directly on your phone with biometric 2FA authentication.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff9933] hover:bg-[#e68a00] text-slate-950 font-bold text-xs transition-colors shadow-md"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>Open Citizen Portal</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Chatbot</span>
            </a>
          </div>
        </div>

        {/* Team CodeNova Logo & Digital India Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-700/80">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-md mb-2 overflow-hidden">
              <Image
                src="/images/team-codenova-logo.png"
                alt="Team CodeNova"
                width={60}
                height={60}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-xs font-bold text-white">TEAM CODENOVA</div>
            <div className="text-[10px] text-slate-400">Engineering &amp; Innovation</div>
          </div>

          <div className="hidden sm:block h-12 w-px bg-slate-700" />

          <div className="text-center sm:text-left space-y-1">
            <div className="text-xs font-bold text-amber-300">2FA &amp; GIGW Certified</div>
            <div className="text-[11px] text-slate-300">Open-source PostGIS 3.3 Stack</div>
            <div className="text-[10px] text-slate-400">Zero-vulnerability architecture</div>
          </div>
        </div>
      </div>
    </section>
  );
}
