'use client';

import { useState, useEffect, FormEvent } from 'react';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { Announcement } from '@/types';

export default function HRAnnouncementsPage() {
  const { session } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const items = await getAnnouncements();
      setAnnouncements(items);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        link: link.trim() || undefined,
        createdBy: session.displayName,
      });
      setTitle('');
      setContent('');
      setLink('');
      loadData();
    } catch (err) {
      console.error('Failed to create announcement:', err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  return (
    <AppShell allowedRoles={['physician', 'admin']}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Manage Announcements</h2>

        {/* Create Form */}
        <div className="card mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
            Post New Announcement
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-field"
                placeholder="Announcement title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Content *</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="input-field min-h-[120px] resize-y"
                placeholder="Write your announcement here..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Link (optional)</label>
              <input
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>

        {/* Announcements List */}
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Existing Announcements ({announcements.length})
        </h3>

        {loading ? (
          <p className="text-gray-400">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No announcements yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white truncate">{ann.title}</h4>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">
                      {ann.content.length > 300
                        ? ann.content.slice(0, 300) + '...'
                        : ann.content}
                    </p>
                    {ann.link && (
                      <a
                        href={ann.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-400 hover:text-red-300 underline break-all"
                      >
                        {ann.link}
                      </a>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Posted by: {ann.createdBy}</span>
                      <span>{formatDate(ann.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="btn-danger !py-1 !px-3 !text-xs shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
