import React from 'react';
import type { Metadata } from 'next';
import { CategoryLoginForm } from '@/components/auth/category-login-form';

export const metadata: Metadata = {
  title: 'Government Agency Login | Land Governance Platform',
  description: 'Authentication portal for Government Officials, Revenue Departments, and Cadastral Surveyors.',
};

export default function GovernmentLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <CategoryLoginForm portal="government" />
    </div>
  );
}
