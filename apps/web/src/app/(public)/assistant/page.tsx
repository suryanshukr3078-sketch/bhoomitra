'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  HelpCircle,
  CheckCircle2,
  Shield,
  Loader2,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citation?: {
    policyNumber: string;
    title: string;
  };
  timestamp: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am your Land Governance & Cadastral Policy AI Assistant. Ask me about land revenue codes, survey mutation requirements, Forest Rights regulations, or PostGIS spatial boundary standards.',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const suggestedPrompts = [
    'What are the mandatory requirements for cadastral parcel subdivision in Maharashtra?',
    'How does PostGIS enforce polygon boundary topological integrity?',
    'What protections apply to Customary Forest Rights under the 2006 Act?',
    'How do I file a boundary rectification dispute with the land registry?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI synthesis & legal citation
    setTimeout(() => {
      let assistantResponse: ChatMessage;

      if (textToSend.toLowerCase().includes('subdivision') || textToSend.toLowerCase().includes('maharashtra')) {
        assistantResponse = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: 'Under the Maharashtra Land Revenue Code (Sec. 148) and the 2026 Digital Cadastral Survey Mandate, any subdivision requires: (1) An accredited DGPS survey with EPSG:4326 coordinate submission, (2) TopoGeo polygon validation with 0% overlap tolerance against adjoining title deeds, and (3) Verification by the Taluka Inspector of Land Records (TILR).',
          citation: {
            policyNumber: 'GOV-MH-2026-08',
            title: 'Digital Cadastral Survey & Real-Time Mutation Mandate 2026',
          },
          timestamp: 'Just now',
        };
      } else if (textToSend.toLowerCase().includes('forest') || textToSend.toLowerCase().includes('customary')) {
        assistantResponse = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: 'Community Forest Rights (CFR) require Gram Sabha boundary resolution, GPS polygon demarcation verified by the Sub-Divisional Committee (SDLC), and recording in the digital cadastral layer as inalienable customary tenure.',
          citation: {
            policyNumber: 'GOV-AP-2026-DRAFT',
            title: 'Integrated Forest Rights & Tribal Tenure Digital Titling Policy',
          },
          timestamp: 'Just now',
        };
      } else {
        assistantResponse = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: 'The Land Governance Platform verifies all spatial features against PostgreSQL/PostGIS topological constraints and stores mutation events in immutable provenance graphs to prevent duplicate titles.',
          citation: {
            policyNumber: 'GOV-STD-2026-01',
            title: 'Unified National Land Cadastre Geometric Standard',
          },
          timestamp: 'Just now',
        };
      }

      setMessages((prev) => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Bot className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Land Governance Legal & Policy Assistant
            </h1>
            <p className="text-xs text-slate-500">
              Synthesizing 3,200+ indexed policies, revenue codes, and GIS regulations
            </p>
          </div>
        </div>
        <Badge variant="success">
          <Sparkles className="w-3 h-3" /> GPT-4o Cadastral RAG
        </Badge>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-lg p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
              }`}
            >
              <p>{msg.text}</p>
              {msg.citation && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Cited: {msg.citation.policyNumber} ({msg.citation.title})
                  </span>
                </div>
              )}
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Consulting indexed policy statutes and cadastral regulations...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Pill Row */}
      <div className="space-y-2 shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Suggested Inquiries:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs text-left whitespace-nowrap transition-colors shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about land revenue codes, survey laws, or title deed mutations..."
          className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
