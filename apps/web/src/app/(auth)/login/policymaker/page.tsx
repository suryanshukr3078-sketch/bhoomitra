import React from 'react';
import type { Metadata } from 'next';
import { CategoryLoginForm } from '@/components/auth/category-login-form';

export const metadata: Metadata = {
  title: 'Policy Maker & Analyst Login | Land Governance Platform',
  description: 'Authentication portal for Policy Makers, Legislative Analysts, and Land Reform Committees.',
};

export default function PolicyMakerLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <CategoryLoginForm portal="policymaker" />
    </div>
  );
}
