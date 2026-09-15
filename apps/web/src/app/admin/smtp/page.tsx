'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Server,
  ShieldCheck,
  Key,
  Globe,
  Lock,
  Layers,
  ExternalLink,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';

interface SmtpStatus {
  configured: boolean;
  provider: string;
  host: string;
  port: number;
  protocol: string;
  from_email: string;
  from_name: string;
  auth_user?: string | null;
  ssl: boolean;
  tls: boolean;
  simulated_mode: boolean;
  outbox_count: number;
}

interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  html_body: string;
  status: 'sent' | 'simulated' | 'failed' | string;
  message: string;
  channel: string;
  created_at: string;
  details?: Record<string, any>;
}

type ProviderKey = 'resend' | 'gmail' | 'brevo' | 'sendgrid' | 'custom';

interface ProviderPreset {
  id: ProviderKey;
  name: string;
  badge: string;
  isRecommended?: boolean;
  description: string;
  host: string;
  port: number;
  ssl: boolean;
  tls: boolean;
  defaultUser?: string;
  keyLabel: string;
  keyPlaceholder: string;
  helpLink?: string;
  helpText: string;
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'resend',
    name: 'Resend (HTTP API)',
    badge: 'Recommended for Vercel',
    isRecommended: true,
    description: 'Bypasses all cloud port blocks via HTTPS (port 443). Fast, reliable serverless delivery with 3,000 free emails/month.',
    host: 'api.resend.com',
    port: 443,
    ssl: true,
    tls: false,
    keyLabel: 'Resend API Key',
    keyPlaceholder: 're_123456789abcdef...',
    helpLink: 'https://resend.com/api-keys',
    helpText: 'Generate a free API key at resend.com and paste it here. For custom domains, verify your domain in Resend DNS.',
  },
  {
    id: 'gmail',
    name: 'Gmail SMTP Relay',
    badge: 'Google Workspace / Gmail',
    description: 'Uses Google SMTP with 16-character App Passwords. Supports automatic port 587 (TLS) and 465 (SSL) failover.',
    host: 'smtp.gmail.com',
    port: 587,
    ssl: false,
    tls: true,
    keyLabel: '16-Character Google App Password',
    keyPlaceholder: 'abcd efgh ijkl mnop',
    helpLink: 'https://myaccount.google.com/apppasswords',
    helpText: 'Requires 2-Step Verification enabled in your Google Account. Regular Google account passwords will be rejected by Google with code 535.',
  },
  {
    id: 'brevo',
    name: 'Brevo / Sendinblue',
    badge: '300 Free Emails / Day',
    description: 'Enterprise mail relay with dedicated European IPs. Supports both direct REST API and high-speed SMTP relay.',
    host: 'smtp-relay.brevo.com',
    port: 587,
    ssl: false,
    tls: true,
    keyLabel: 'Brevo API Key (xkeysib-...) or SMTP Key',
    keyPlaceholder: 'xkeysib-7a8b9c...',
    helpLink: 'https://app.brevo.com/settings/keys/api',
    helpText: 'Grab your Master SMTP key or REST API key from Brevo dashboard > SMTP & API.',
  },
  {
    id: 'sendgrid',
    name: 'Twilio SendGrid',
    badge: 'Cloud Infrastructure',
    description: 'Global cloud delivery platform using authenticated SMTP relay with API token authentication.',
    host: 'smtp.sendgrid.net',
    port: 587,
    ssl: false,
    tls: true,
    defaultUser: 'apikey',
    keyLabel: 'SendGrid API Key',
    keyPlaceholder: 'SG.xxxxxxxxxxxxxx...',
    helpLink: 'https://app.sendgrid.com/settings/api_keys',
    helpText: 'Use username "apikey" and your SendGrid API key with Mail Send permissions.',
  },
  {
    id: 'custom',
    name: 'Custom SMTP Server',
    badge: 'Government / Private Relay',
    description: 'Connect directly to state government mail relays (e.g. NIC / mail.gov.in) or custom self-hosted Postfix/Haraka servers.',
    host: 'mail.gov.in',
    port: 587,
    ssl: false,
    tls: true,
    keyLabel: 'SMTP Password',
    keyPlaceholder: '••••••••••••••••',
    helpText: 'Specify your institutional host, port, security mode, and credentials.',
  },
];

export default function SmtpManagementPage() {
  const { user } = useAuth();

  // Status & Logs state
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);

  // Active form configuration state
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('resend');
  const [host, setHost] = useState<string>('api.resend.com');
  const [port, setPort] = useState<number>(443);
  const [username, setUsername] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [useSsl, setUseSsl] = useState<boolean>(false);
  const [useTls, setUseTls] = useState<boolean>(true);
  const [fromEmail, setFromEmail] = useState<string>('notifications@bhoomitra.gov.in');
  const [fromName, setFromName] = useState<string>('Bhoomitra Land Governance Platform');

  // Test email state
  const [testRecipient, setTestRecipient] = useState<string>('');
  const [testSubject, setTestSubject] = useState<string>('Bhoomitra SMTP Diagnostic Verification');
  const [persistOnTest, setPersistOnTest] = useState<boolean>(true);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: string;
    message: string;
    details?: any;
  } | null>(null);

  // Configuration save state
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal inspection state
  const [previewLog, setPreviewLog] = useState<EmailLog | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Initialize recipient from current user
  useEffect(() => {
    if (user?.email && !testRecipient) {
      setTestRecipient(user.email);
    }
  }, [user, testRecipient]);

  // Load Status
  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const data = await apiRequest<SmtpStatus>('/auth/smtp-status');
      setSmtpStatus(data);
    } catch (err: any) {
      console.error('Failed to load SMTP status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Load Logs
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await apiRequest<{ count: number; logs: EmailLog[] }>('/auth/email-logs');
      setEmailLogs(data.logs || []);
    } catch (err: any) {
      console.error('Failed to load email logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchLogs();
  }, [fetchStatus, fetchLogs]);

  // Handle preset selection
  const handleSelectPreset = (presetKey: ProviderKey) => {
    setSelectedProvider(presetKey);
    const preset = PROVIDER_PRESETS.find((p) => p.id === presetKey);
    if (preset) {
      setHost(preset.host);
      setPort(preset.port);
      setUseSsl(preset.ssl);
      setUseTls(preset.tls);
      if (preset.defaultUser) {
        setUsername(preset.defaultUser);
      } else if (presetKey === 'gmail' && !username) {
        setUsername(user?.email || '');
      }
    }
    setTestResult(null);
    setSaveNotice(null);
  };

  // Save Configuration directly
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setSaveNotice(null);
    try {
      const payload: any = {
        provider: selectedProvider,
        smtp_host: host,
        smtp_port: port,
        smtp_user: username || null,
        smtp_ssl: useSsl,
        smtp_tls: useTls,
        from_email: fromEmail,
        from_name: fromName,
      };

      if (selectedProvider === 'resend' || selectedProvider === 'brevo') {
        payload.api_key = secretKey;
      } else {
        payload.smtp_password = secretKey;
      }

      const res = await apiRequest<any>('/auth/configure-smtp', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSaveNotice({
          type: 'success',
          message: 'Relay credentials saved to platform runtime. New registrations will use this delivery channel immediately.',
        });
        await fetchStatus();
      } else {
        setSaveNotice({
          type: 'error',
          message: res.message || 'Failed to save configuration.',
        });
      }
    } catch (err: any) {
      setSaveNotice({
        type: 'error',
        message: err.message || 'Error occurred while saving configuration.',
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Reset to Defaults
  const handleResetConfig = async () => {
    if (!window.confirm('Reset runtime email settings to server defaults?')) return;
    setIsSavingConfig(true);
    setSaveNotice(null);
    try {
      await apiRequest<any>('/auth/configure-smtp', {
        method: 'POST',
        body: JSON.stringify({ reset: true }),
      });
      setSaveNotice({
        type: 'success',
        message: 'Runtime configuration reset to system defaults.',
      });
      setSecretKey('');
      await fetchStatus();
    } catch (err: any) {
      setSaveNotice({
        type: 'error',
        message: err.message || 'Failed to reset settings.',
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Dispatch Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      setTestResult({
        success: false,
        status: 'invalid',
        message: 'Please provide a valid recipient email address.',
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const payload: any = {
        to_email: testRecipient,
        subject: testSubject,
        provider: selectedProvider,
        smtp_host: host,
        smtp_port: port,
        smtp_user: username || null,
        smtp_ssl: useSsl,
        smtp_tls: useTls,
        from_email: fromEmail,
        from_name: fromName,
        persist: persistOnTest,
      };

      if (selectedProvider === 'resend' || selectedProvider === 'brevo') {
        payload.api_key = secretKey || null;
      } else {
        payload.smtp_password = secretKey || null;
      }

      const res = await apiRequest<any>('/auth/test-smtp', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setTestResult(res);
      await fetchStatus();
      await fetchLogs();
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'error',
        message: err.message || 'Failed to connect to SMTP relay server.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Resend Email from Ledger
  const handleResend = async (emailId: string) => {
    setResendingId(emailId);
    try {
      const res = await apiRequest<any>(`/auth/resend-email/${emailId}`, {
        method: 'POST',
      });
      if (res.success) {
        alert('Email re-dispatched successfully!');
        await fetchLogs();
      } else {
        alert(`Resend failed: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Resend failed: ${err.message || 'Unknown error'}`);
    } finally {
      setResendingId(null);
    }
  };

  const currentPreset = PROVIDER_PRESETS.find((p) => p.id === selectedProvider) || PROVIDER_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">Email & SMTP Command Center</h2>
                {isLoadingStatus ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking
                  </span>
                ) : smtpStatus?.configured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Operational & Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Standby (Simulated Outbox Mode)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Configure authenticated mail transport, test real-time relay handshakes, and inspect outgoing registration welcome notifications in the audit ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchStatus();
                fetchLogs();
              }}
              disabled={isLoadingStatus || isLoadingLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus || isLoadingLogs ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Live Status Indicators Ribbon */}
        {smtpStatus && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Relay Provider</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block capitalize">
                {smtpStatus.provider || 'Default SMTP'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Protocol / Port</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {smtpStatus.protocol} ({smtpStatus.port})
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Active Sender Address</span>
              <span className="text-sm font-semibold text-emerald-700 mt-0.5 block truncate" title={smtpStatus.from_email}>
                {smtpStatus.from_email || 'Not configured'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Outbox Audit Ledger</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {emailLogs.length} Records Tracked
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Provider Selector Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" /> Select Delivery Protocol & Provider Preset
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose a provider preset to auto-populate port, encryption protocol, and connection instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PROVIDER_PRESETS.map((preset) => {
            const isSelected = selectedProvider === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                    {preset.isRecommended && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        Best
                      </span>
                    )}
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded mb-2">
                    {preset.badge}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Port {preset.port}</span>
                  <span className={isSelected ? 'text-emerald-700 font-bold' : ''}>
                    {isSelected ? '✓ Selected' : 'Select →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Panel: Config Form & Live Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Relay Configuration Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-700" /> {currentPreset.name} Settings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure connection parameters and authentication credentials.
              </p>
            </div>
            {currentPreset.helpLink && (
              <a
                href={currentPreset.helpLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Help Banner for chosen preset */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">{currentPreset.name} Setup Guidance:</p>
              <p className="mt-0.5">{currentPreset.helpText}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Host & Port */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relay Host / API Endpoint
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. smtp.gmail.com or api.resend.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value, 10) || 587)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono"
                />
              </div>
            </div>

            {/* Username / Account (if not Resend) */}
            {selectedProvider !== 'resend' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SMTP Username / Account Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={selectedProvider === 'sendgrid' ? 'apikey' : 'your-account@gmail.com'}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            )}

            {/* Secret Key / App Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>{currentPreset.keyLabel}</span>
                <span className="text-[11px] text-slate-400 font-normal">Encrypted in memory</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder={currentPreset.keyPlaceholder}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono"
                />
              </div>
            </div>

            {/* Sender From Address & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender From Address
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="e.g. notifications@bhoomitra.gov.in"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Bhoomitra Land Governance Platform"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Protocol Security Checkboxes */}
            {selectedProvider !== 'resend' && (
              <div className="flex items-center gap-6 pt-1 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTls}
                    onChange={(e) => {
                      setUseTls(e.target.checked);
                      if (e.target.checked) setUseSsl(false);
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>STARTTLS (Standard for Port 587)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSsl}
                    onChange={(e) => {
                      setUseSsl(e.target.checked);
                      if (e.target.checked) setUseTls(false);
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Direct SSL/TLS (Port 465)</span>
                </label>
              </div>
            )}
          </div>

          {/* Feedback banner */}
          {saveNotice && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                saveNotice.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {saveNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{saveNotice.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetConfig}
              disabled={isSavingConfig}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all"
            >
              {isSavingConfig ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Diagnostic Test Dispatcher */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" /> Live Relay Diagnostic Test
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Send an immediate test message through the configured credentials to verify deliverability.
              </p>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Test Address
                </label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  A verification receipt will be dispatched to this inbox.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnostic Subject
                </label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={persistOnTest}
                    onChange={(e) => setPersistOnTest(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Save as active runtime configuration if test succeeds</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition-all disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    Executing Live Relay Handshake...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Live Diagnostic Test
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Test Execution Result Box */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 mt-4 transition-all ${
                testResult.success
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/70 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Relay Dispatch Succeeded
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" /> Relay Dispatch Failed
                    </>
                  )}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/70 border border-current">
                  {testResult.status}
                </span>
              </div>

              <p className="text-xs leading-relaxed font-medium">
                {testResult.message}
              </p>

              {testResult.details && Object.keys(testResult.details).length > 0 && (
                <div className="pt-2 border-t border-current/10 font-mono text-[10px] text-slate-600 bg-white/50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(testResult.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Outgoing Email Audit Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" /> Outgoing Email Audit Ledger & Outbox
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live log of all registration welcome emails, statutory verification notices, and diagnostic tests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
              {emailLogs.length} Total Messages
            </span>
            <button
              type="button"
              onClick={fetchLogs}
              disabled={isLoadingLogs}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {isLoadingLogs ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs">Loading ledger entries...</span>
          </div>
        ) : emailLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Mail className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No outgoing emails dispatched yet.</p>
            <p className="text-xs text-slate-400">
              Send a diagnostic test email or register a new account to view outbox messages here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.map((log) => {
                  const isSent = log.status === 'sent';
                  const isSimulated = log.status === 'simulated';
                  const isFailed = log.status === 'failed';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {log.to_email}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-700" title={log.subject}>
                        {log.subject}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 font-mono">
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Dispatched
                          </span>
                        ) : isSimulated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" /> Simulated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View HTML
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResend(log.id)}
                          disabled={resendingId === log.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {resendingId === log.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          Resend
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HTML Email Preview Modal */}
      {previewLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-base font-bold text-slate-900">{previewLog.subject}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recipient: <span className="font-semibold text-slate-800">{previewLog.to_email}</span> • Status: <span className="font-semibold uppercase">{previewLog.status}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body with rendered HTML frame */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
              <div
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: previewLog.html_body }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] text-slate-400 font-mono">
                Log ID: {previewLog.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResend(previewLog.id)}
                  disabled={resendingId === previewLog.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Resend Now
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLog(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
