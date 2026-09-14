'use client';

import React from 'react';
import { EvidenceAssistant } from '@/components/EvidenceAssistant';

export default function AssistantPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <EvidenceAssistant />
    </div>
  );
}
