'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Layers,
  Scale,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';

export interface AssistantSource {
  id: string;
  title: string;
  resource_type: string;
  slug?: string;
  abstract?: string;
  publisher?: string;
  similarity_score?: number;
}

export interface AssistantResponse {
  question: string;
  answer: string;
  sources: AssistantSource[];
  disclaimer: string;
  provider: string;
}

export const SUGGESTED_QUERIES = [
  'How does PostGIS validate parcel polygon boundary topology and prevent disputes?',
  'What are the cadastral boundary resolution rules for tribal land tenure in Western Ghats?',
  'What are the requirements for high-resolution cadastral drone photogrammetry surveys?',
  'Spatial analytics of forest land rights and cadastral overlaps in Maharashtra',
];

export function getResourceDetailUrl(source: AssistantSource): string {
  const type = (source.resource_type || '').toLowerCase();
  const identifier = source.slug || source.id;
  if (type.includes('research') || type === 'paper') {
    return `/research/${identifier}`;
  }
  if (type.includes('policy') || type === 'statute' || type === 'legal') {
    return `/policies/${identifier}`;
  }
  if (type.includes('dataset') || type.includes('layer') || type.includes('spatial')) {
    return `/datasets/${identifier}`;
  }
  return `/resources/${identifier}`;
}

export function getResourceTypeMeta(type: string): { label: string; icon: React.ComponentType<{ className?: string }> } {
  const t = (type || '').toLowerCase();
  if (t.includes('research')) {
    return { label: 'Research Paper', icon: BookOpen };
  }
  if (t.includes('policy')) {
    return { label: 'Statutory Policy', icon: Scale };
  }
  if (t.includes('dataset') || t.includes('spatial') || t.includes('layer')) {
    return { label: 'Spatial Dataset', icon: Layers };
  }
  return { label: type.replace('_', ' ').toUpperCase(), icon: FileText };
}

/**
 * Minimal inline markdown renderer — no external package required.
 * Handles: ## headings, **bold**, * / - bullet lists, and newlines.
 * Returns an array of React nodes safe to embed inside any container.
 */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={key} className="list-disc list-outside pl-5 space-y-1 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInline = (raw: string, baseKey: string): React.ReactNode => {
    // Split on **...** bold markers
    const parts = raw.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${baseKey}-b${i}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, i) => {
    const key = `line-${i}`;

    // H2 heading: ## text
    if (/^##\s+/.test(line)) {
      flushList(`list-before-${i}`);
      nodes.push(
        <h2 key={key} className="text-base font-bold text-slate-900 mt-4 mb-1">
          {renderInline(line.replace(/^##\s+/, ''), key)}
        </h2>
      );
      return;
    }

    // H3 heading: ### text
    if (/^###\s+/.test(line)) {
      flushList(`list-before-${i}`);
      nodes.push(
        <h3 key={key} className="text-sm font-semibold text-slate-800 mt-3 mb-0.5">
          {renderInline(line.replace(/^###\s+/, ''), key)}
        </h3>
      );
      return;
    }

    // Bullet list item: * or -
    if (/^\*\s+/.test(line) || /^-\s+/.test(line)) {
      listItems.push(
        <li key={key} className="text-sm leading-relaxed">
          {renderInline(line.replace(/^[\*\-]\s+/, ''), key)}
        </li>
      );
      return;
    }

    // Blank line — flush pending list then add spacing
    if (line.trim() === '') {
      flushList(`list-at-${i}`);
      nodes.push(<div key={key} className="h-2" />);
      return;
    }

    // Regular paragraph line — flush list first
    flushList(`list-before-para-${i}`);
    nodes.push(
      <p key={key} className="text-sm sm:text-base leading-relaxed">
        {renderInline(line, key)}
      </p>
    );
  });

  // Flush any trailing list
  flushList('list-end');

  return nodes;
}

export function EvidenceAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const { toast } = useToast();

  const handleSearch = async (overrideQuery?: string) => {
    const textToSearch = (overrideQuery ?? query).trim();
    if (!textToSearch) return;

    if (overrideQuery) {
      setQuery(overrideQuery);
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<AssistantResponse>('/search/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: textToSearch,
          limit: 5,
        }),
      });

      setResult(data);
    } catch (err: any) {
      console.error('[EvidenceAssistant] Search error:', err);
      const errString = err?.message || String(err);
      if (errString.includes('429') || errString.toLowerCase().includes('rate limit')) {
        setError(
          'Rate limit reached (max 10 requests per minute). Please wait 60 seconds before submitting another inquiry.'
        );
        toast({
          title: 'Rate Limit Reached',
          description: 'Maximum 10 inquiries per minute. Please try again shortly.',
          variant: 'error',
        });
      } else {
        setError('Failed to generate answer. The assistant service may be temporarily unavailable.');
        toast({
          title: 'Assistant Request Failed',
          description: 'Could not complete RAG query. Please verify connection and retry.',
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    toast({
      title: 'Copied to Clipboard',
      description: 'AI answer with citations copied.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Evidence Search Assistant
                </h1>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50/60 gap-1 text-[11px] font-semibold py-0.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Gemini RAG
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Ask legal, spatial, or cadastral questions grounded strictly in Bhoomitra platform evidence. Every claim is cited directly from verified repository records.
              </p>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about revenue codes, PostGIS topology rules, CFR titles, or survey procedures..."
              disabled={loading}
              className="w-full px-4 py-3.5 pl-11 text-sm sm:text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 shadow-inner disabled:bg-slate-100 transition-all"
            />
            <Bot className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask Assistant</span>
              </>
            )}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearch(sq)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent text-slate-600 transition-all text-left"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-semibold text-amber-950">Inquiry Notice</p>
            <p className="text-amber-800 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            className="text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              <span className="text-sm font-semibold text-emerald-900">
                Retrieving 768-dim semantic vectors & synthesizing Gemini answer...
              </span>
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
          </div>
          <div className="h-16 bg-amber-50/60 border border-amber-100 rounded-xl" />
        </div>
      )}

      {/* AI Answer & Citations View */}
      {!loading && result && (
        <div className="space-y-6">
          {/* Prominent AI Answer Card */}
          <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-md shadow-emerald-500/5 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-white px-6 py-4 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  AI Grounded Synthesis
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                  &ldquo;{result.question}&rdquo;
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-white text-[11px]">
                  {result.provider === 'gemini' ? 'Google Gemini 2.5' : 'Platform Index'}
                </Badge>
                <button
                  type="button"
                  onClick={handleCopyAnswer}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                  title="Copy synthesized answer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Answer Content Body */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal selection:bg-emerald-100 space-y-2">
                {renderMarkdown(result.answer)}
              </div>


              {/* Persistent Legal Disclaimer Banner */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="rounded-xl bg-amber-50/90 border border-amber-200/90 p-3.5 sm:p-4 flex items-start gap-3 text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-xs leading-normal text-amber-900/90 font-medium">
                    {result.disclaimer ||
                      'This answer is AI-generated from platform data and is not an official government determination. Always verify with primary sources.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cited Source Evidence Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Grounding Sources & Primary Evidence ({result.sources.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Click any citation card to view the official record
              </span>
            </div>

            {result.sources.length === 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-sm">
                No indexed repository resources were identified for this query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sources.map((source, idx) => {
                  const meta = getResourceTypeMeta(source.resource_type);
                  const Icon = meta.icon;
                  const detailUrl = getResourceDetailUrl(source);

                  return (
                    <Link
                      key={source.id || idx}
                      href={detailUrl}
                      className="group bg-white rounded-xl border border-slate-200/90 hover:border-emerald-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        {/* Top Meta Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                              [{idx + 1}]
                            </span>
                            <Badge variant="outline" className="gap-1 text-[11px] font-medium py-0.5">
                              <Icon className="w-3 h-3 text-slate-500" />
                              {meta.label}
                            </Badge>
                          </div>

                          {typeof source.similarity_score === 'number' && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              {Math.round(source.similarity_score * 100)}% Match
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {source.title}
                        </h3>

                        {/* Publisher if available */}
                        {source.publisher && (
                          <p className="text-xs text-slate-500 font-medium">
                            Publisher: <span className="text-slate-700">{source.publisher}</span>
                          </p>
                        )}

                        {/* Abstract / Summary */}
                        {source.abstract && (
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {source.abstract}
                          </p>
                        )}
                      </div>

                      {/* Footer Link */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                        <span>View Verified Record</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EvidenceAssistant;
