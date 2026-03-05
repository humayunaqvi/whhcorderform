'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { getAnnouncements } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const items = await getAnnouncements();
        setAnnouncements(items);
      } catch (err) {
        console.error('Announcements load error:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Announcements</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : announcements.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No announcements at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{ann.title}</h3>
                    <p className="text-gray-300 mt-2 whitespace-pre-wrap">{ann.content}</p>
                    {ann.link && (
                      <a
                        href={ann.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                      >
                        View Link
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                    {formatDate(ann.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
