'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  CornerDownRight,
  ShieldCheck,
  User,
  AlertCircle,
  Loader2,
  LogIn,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/providers/i18n-context';

export interface FeedbackItem {
  id: string;
  policy_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role?: string | null;
  parent_id?: string | null;
  comment: string;
  created_at: string;
  replies?: FeedbackItem[];
}

interface PolicyFeedbackSectionProps {
  policyId: string;
}

export function PolicyFeedbackSection({ policyId }: PolicyFeedbackSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { locale } = useTranslation();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<FeedbackItem | null>(null);

  const fetchFeedback = useCallback(async () => {
    if (!policyId) return;
    try {
      const data = await apiRequest<{
        policy_id: string;
        total_comments: number;
        items: FeedbackItem[];
      }>(`/policies/${policyId}/feedback`);

      setFeedbacks(data.items || []);
      setTotalComments(data.total_comments || 0);
    } catch (err: any) {
      // In demo/fallback mode if API is unreachable
      console.warn('Could not load policy feedback:', err);
    } finally {
      setIsLoading(false);
    }
  }, [policyId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (commentText.trim().length < 3) {
      toast({
        title: 'Comment too short',
        description: 'Feedback must be at least 3 characters.',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest<FeedbackItem>(`/policies/${policyId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          comment: commentText.trim(),
          parent_id: replyingTo ? replyingTo.id : null,
        }),
      });

      toast({
        title: 'Feedback Posted',
        description: 'Your contribution has been recorded in the policy discussion registry.',
        variant: 'success',
      });

      setCommentText('');
      setReplyingTo(null);
      await fetchFeedback();
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err.message || 'Failed to submit feedback.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="feedback-heading"
      className="mt-8 pt-8 border-t border-slate-200 space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="feedback-heading"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              {locale === 'hi' ? 'सार्वजनिक परामर्श एवं नागरिक विचार' : 'Public Consultation & Discussion'}
            </h2>
            <p className="text-xs text-slate-500">
              {locale === 'hi'
                ? 'इस नीति मसौदे पर अपने विचार और सुझाव साझा करें।'
                : 'Share observations, suggestions, and feedback on this statutory policy mandate.'}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      {/* Submission Form or Sign-in Prompt */}
      {isAuthenticated && user ? (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
        >
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs border border-emerald-200">
              <span className="flex items-center gap-1.5 font-medium">
                <CornerDownRight className="w-3.5 h-3.5 text-emerald-700" />
                Replying to <strong>{replyingTo.user_name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded"
                aria-label="Cancel reply"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div>
            <label htmlFor="policy-comment-input" className="sr-only">
              Your feedback or comment
            </label>
            <textarea
              id="policy-comment-input"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                replyingTo
                  ? `Write a reply to ${replyingTo.user_name}...`
                  : locale === 'hi'
                  ? 'इस नीति पर अपनी प्रतिक्रिया अथवा सुझाव दर्ज करें (न्यूनतम 3 अक्षर)...'
                  : 'Write your public feedback, amendment suggestions, or legal review (minimum 3 characters)...'
              }
              maxLength={2000}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors"
              aria-required="true"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              {commentText.length}/2000 characters
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              aria-label="Post public feedback comment"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{locale === 'hi' ? 'टिप्पणी भेजें' : 'Post Feedback'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-900">
            <User className="w-6 h-6 text-amber-600 shrink-0" aria-hidden="true" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">
                {locale === 'hi'
                  ? 'जन-परामर्श में भाग लेने हेतु प्रवेश करें'
                  : 'Citizen Authentication Required'}
              </p>
              <p className="text-amber-700 text-xs">
                {locale === 'hi'
                  ? 'टिप्पणी दर्ज करने हेतु कृपया प्रमाणित नागरिक अथवा अधिकारी के रूप में लॉगिन करें।'
                  : 'Please sign in with your verified government or citizen account to submit comments.'}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{locale === 'hi' ? 'लॉगिन करें' : 'Sign In to Participate'}</span>
          </Link>
        </div>
      )}

      {/* Discussion List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-slate-400 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading discussion thread...</span>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-1">
            <p className="font-semibold text-slate-700">
              {locale === 'hi' ? 'कोई सार्वजनिक टिप्पणी नहीं मिली' : 'No comments submitted yet'}
            </p>
            <p>
              {locale === 'hi'
                ? 'इस नीति पर विचार अथवा सुझाव साझा करने वाले पहले नागरिक बनें।'
                : 'Be the first citizen or stakeholder to share feedback on this policy.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {feedbacks.map((item) => (
              <FeedbackCard
                key={item.id}
                item={item}
                onReply={(target) => setReplyingTo(target)}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function FeedbackCard({
  item,
  onReply,
  isAuthenticated,
}: {
  item: FeedbackItem;
  onReply: (target: FeedbackItem) => void;
  isAuthenticated: boolean;
}) {
  const dateFormatted = new Date(item.created_at).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <li className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
      {/* Author and Date */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            {item.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-800">{item.user_name}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{item.user_role || 'Verified Citizen'}</span>
              <span>•</span>
              <span>{dateFormatted}</span>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => onReply(item)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
            aria-label={`Reply to ${item.user_name}`}
          >
            <CornerDownRight className="w-3 h-3" />
            <span>Reply</span>
          </button>
        )}
      </div>

      {/* Comment Body */}
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {item.comment}
      </p>

      {/* Nested Replies */}
      {item.replies && item.replies.length > 0 && (
        <ul className="mt-3 pl-4 border-l-2 border-emerald-200 space-y-2.5" role="list">
          {item.replies.map((reply) => {
            const replyDate = new Date(reply.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <li key={reply.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800">{reply.user_name}</div>
                  <span className="text-[10px] text-slate-400">{replyDate}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {reply.comment}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
