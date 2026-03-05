'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { getFeedback } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { AnonymousFeedback } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  workplace: 'bg-blue-600/20 text-blue-400',
  management: 'bg-purple-600/20 text-purple-400',
  suggestion: 'bg-green-600/20 text-green-400',
  other: 'bg-gray-600/20 text-gray-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  workplace: 'Workplace',
  management: 'Management',
  suggestion: 'Suggestion',
  other: 'Other',
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<AnonymousFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedback().then((items) => {
      setFeedback(items);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical']}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Anonymous Feedback</h2>

        {loading ? (
          <div className="card">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="card">
            <p className="text-gray-500 text-center py-8">
              No feedback submitted yet. Employees can submit anonymous feedback from their dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded ${
                      CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
                    }`}
                  >
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
