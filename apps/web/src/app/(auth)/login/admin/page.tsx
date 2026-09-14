import React from 'react';
import type { Metadata } from 'next';
import { CategoryLoginForm } from '@/components/auth/category-login-form';

export const metadata: Metadata = {
  title: 'Platform Administrator Login | Land Governance Platform',
  description: 'Privileged administration portal for user approvals, organizational governance, and platform security audits.',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <CategoryLoginForm portal="admin" />
    </div>
  );
}
