'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface OtpVerificationDialogProps {
  isOpen: boolean;
  email: string;
  action: 'login' | 'register';
  debugOtp?: string | null;
  onSuccess: (authData: any) => void;
  onCancel: () => void;
}

export function OtpVerificationDialog({
  isOpen,
  email,
  action,
  debugOtp,
  onSuccess,
  onCancel,
}: OtpVerificationDialogProps) {
  const [otp, setOtp] = useState('');
  const [activeDebugOtp, setActiveDebugOtp] = useState<string | null>(debugOtp || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const { setUser, refreshUser } = useAuth();

  useEffect(() => {
    if (debugOtp) {
      setActiveDebugOtp(debugOtp);
    }
  }, [debugOtp]);

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Resend countdown timer
  useEffect(() => {
    if (!isOpen) return;
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<any>('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: cleanOtp,
          action,
        }),
      });

      if (response.token?.access_token) {
        setAuthToken(response.token.access_token);
      }

      if (response.user) {
        setUser(response.user);
      } else {
        await refreshUser();
      }

      toast({
        title: action === 'login' ? '2FA Authentication Successful' : 'Account Verified Successfully',
        description: `Welcome to Bhoomitra, ${response.user?.full_name || email}.`,
        variant: 'success',
      });

      onSuccess(response);
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired OTP. Please try again.';
      setError(msg);
      toast({
        title: 'Verification Failed',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const res = await apiRequest<any>('/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          action,
        }),
      });

      if (res?.debug_otp) {
        setActiveDebugOtp(res.debug_otp);
      }

      setCountdown(60);

      toast({
        title: 'Verification Code Dispatched',
        description: `A fresh 6-digit code was sent to ${email}.`,
        variant: 'success',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code. Please wait a moment.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-dialog-title"
      aria-describedby="otp-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* TEAM CODENOVA Brand Banner */}
        <div className="bg-slate-900 p-6 pb-5 text-center text-white relative border-b-4 border-emerald-500">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white rounded-xl px-4 py-2 shadow-md">
              <Image
                src="/images/team-codenova-logo.png"
                alt="TEAM CODENOVA"
                width={160}
                height={36}
                className="h-9 w-auto object-contain mx-auto"
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Mandatory Two-Factor Authentication (2FA / दो-चरणीय प्रमाणीकरण)
          </div>
          <h2 id="otp-dialog-title" className="text-lg font-extrabold text-white mt-1.5 tracking-tight">
            {action === 'login' ? 'Sign-In Security Verification' : 'Email Verification'}
          </h2>
          <p id="otp-dialog-description" className="text-xs text-slate-300 mt-1">
            Enter the 6-digit security code dispatched to{' '}
            <strong className="text-emerald-400 font-semibold">{email}</strong>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>{error}</div>
            </div>
          )}

          {/* Simulated / Test OTP Banner */}
          {activeDebugOtp && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-950 animate-in fade-in">
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Simulation Code: <strong className="font-mono text-sm tracking-wider text-emerald-800 font-extrabold">{activeDebugOtp}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtp(activeDebugOtp);
                  setError(null);
                }}
                className="shrink-0 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] shadow-xs cursor-pointer transition-colors"
              >
                Auto-Fill
              </button>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="otp-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
                6-Digit Security Code
              </label>
              <div className="relative">
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(clean);
                    if (clean.length === 6) {
                      setError(null);
                    }
                  }}
                  placeholder="------"
                  autoFocus
                  className="w-full text-center tracking-[14px] text-2xl font-mono font-extrabold py-3.5 px-4 rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300 bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center font-medium">
                The code is valid for 10 minutes. Check your mail inbox or spam folder.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isLoading || otp.trim().length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    Confirm & Proceed
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Cancel / Go Back
                </button>

                <button
                  type="button"
                  disabled={countdown > 0 || isResending}
                  onClick={handleResend}
                  className={`font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                    countdown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Resend Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer info note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Powered by <strong>TEAM CODENOVA</strong> &bull; Bhoomitra National Cadastral Platform
          </p>
        </div>
      </div>
    </div>
  );
}
