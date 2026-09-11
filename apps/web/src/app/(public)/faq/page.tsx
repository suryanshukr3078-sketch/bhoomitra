'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is the purpose of the Land Governance Platform?',
      answer:
        'The platform bridges the gap between field GIS cadastral surveys, legal deed mutation workflows, and peer-reviewed land policy research. It uses automated PostGIS spatial verification and cryptographic append-only DAG provenance trees to ensure that land records cannot be backdated or corrupted.',
    },
    {
      question: 'What does the "Synthetic Record (Demo)" label mean?',
      answer:
        'Per the platform\'s evidence-integrity requirement, all demo/seed parcels, policy documents, mutation entries, and GIS layers in this demonstration instance are synthetic test records. They illustrate system functionality and validation pipelines. They do NOT represent statutory legal land titles, which remain under the authority of official state revenue departments.',
    },
    {
      question: 'How does PostGIS guarantee topological integrity?',
      answer:
        'Every parcel boundary submitted to the registry is validated using PostGIS spatial functions (e.g., ST_IsValid, ST_Overlaps, ST_Intersection). When a surveyor registers a subdivision or boundary update, the system verifies that the polygon does not overlap adjacent registered parcels within a 0.00001-degree tolerance.',
    },
    {
      question: 'What is a Cadastral Mutation and how is it audited?',
      answer:
        'A mutation is any legal or physical alteration to a land parcel—such as a title deed sale, inheritance subdivision, boundary rectification, or lease renewal. Each mutation is appended to an immutable provenance graph with the certified surveyor\'s digital license, timestamp, and SHA256 checksum of the survey coordinates.',
    },
    {
      question: 'How are Customary and Forest Rights represented?',
      answer:
        'Unlike conventional freehold titles that only record individual private boundaries, our spatial models support multi-tiered tenure types (Freehold, Leasehold, Customary, Communal Forest Rights). This allows communities to register communal grazing lands and forest rights under the Scheduled Tribes and Other Traditional Forest Dwellers Act.',
    },
    {
      question: 'How can researchers and surveyors contribute data?',
      answer:
        'Surveyors and academic institutions can register an account, upload GeoJSON boundary datasets or peer-reviewed research papers through the Governance Dashboard, and link empirical findings directly to relevant statutory land policy documents.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <HelpCircle className="w-3.5 h-3.5" />
          Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Understand how our cadastral verification, spatial topology rules, and provenance graphs operate.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  {faq.question}
                </span>
                <span className="p-1 rounded-lg text-slate-400 bg-slate-100 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">Still have technical or governance questions?</h3>
          <p className="text-xs text-slate-500">Our engineering and cadastral policy team is available to assist.</p>
        </div>
        <a
          href="/contact"
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shrink-0"
        >
          Contact Team
        </a>
      </div>
    </div>
  );
}
