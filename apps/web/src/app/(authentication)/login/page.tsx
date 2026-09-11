'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simulate / real auth flow
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({
        title: 'Authentication Successful',
        description: `Welcome back, ${data.email}. Redirecting to governance dashboard...`,
        variant: 'success',
      });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch {
      toast({
        title: 'Authentication Failed',
        description: 'Invalid credentials. Please verify your email and password.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <Landmark className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to LandGov
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Access cadastral administration, deed mutations, and policy records
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="surveyor@registry.gov"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs text-rose-600 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: 'Password Reset',
                    description: 'Please contact your cadastral jurisdiction administrator.',
                    variant: 'default',
                  });
                }}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.password
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-xs text-rose-600 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don&apos;t have an authenticated account?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
