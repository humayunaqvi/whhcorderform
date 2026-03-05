'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { getDocuments } from '@/lib/db';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { HRDocument } from '@/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<HRDocument[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const items = await getDocuments();
        setDocuments(items);
        // Extract unique categories
        const cats = Array.from(new Set(items.map((d) => d.category))).sort();
        setCategories(cats);
      } catch (err) {
        console.error('Documents load error:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredDocs =
    selectedCategory === 'All'
      ? documents
      : documents.filter((d) => d.category === selectedCategory);

  const handleDownload = (doc: HRDocument) => {
    try {
      // Convert base64 to blob and trigger download
      const byteCharacters = atob(doc.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Company Documents</h2>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-auto"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : filteredDocs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No documents available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="card flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{doc.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-900/30 text-primary-400 whitespace-nowrap flex-shrink-0">
                      {doc.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{doc.fileName}</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-shrink-0 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
