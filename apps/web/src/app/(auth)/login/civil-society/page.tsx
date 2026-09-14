import React from 'react';
import type { Metadata } from 'next';
import { CategoryLoginForm } from '@/components/auth/category-login-form';

export const metadata: Metadata = {
  title: 'Civil Society & Advocate Login | Land Governance Platform',
  description: 'Authentication portal for Civil Society Organisations, NGOs, and Independent Land Advocates.',
};

export default function CivilSocietyLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <CategoryLoginForm portal="civil-society" />
    </div>
  );
}
