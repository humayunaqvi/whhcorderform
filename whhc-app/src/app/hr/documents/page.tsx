'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { uploadDocument, getDocuments, deleteDocument } from '@/lib/db';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { HRDocument } from '@/types';

const CATEGORIES = ['Policy', 'Handbook', 'Form', 'Training', 'Other'] as const;

export default function HRDocumentsPage() {
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<HRDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload form
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<string>(CATEGORIES[0]);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileData, setFileData] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const items = await getDocuments();
      setDocuments(items);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setMimeType(file.type || 'application/octet-stream');

    // Auto-fill title if empty
    if (!docTitle.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setDocTitle(nameWithoutExt);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:...;base64, prefix
      const base64 = result.split(',')[1] || result;
      setFileData(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !fileData || !docTitle.trim()) return;

    setUploading(true);
    try {
      await uploadDocument({
        title: docTitle.trim(),
        category: docCategory,
        fileName,
        fileSize,
        fileData,
        mimeType,
        uploadedBy: session.displayName,
      });

      // Reset form
      setDocTitle('');
      setDocCategory(CATEGORIES[0]);
      setFileName('');
      setFileSize(0);
      setFileData('');
      setMimeType('');
      if (fileRef.current) fileRef.current.value = '';

      loadData();
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
    setUploading(false);
  };

  const handleDownload = (doc: HRDocument) => {
    try {
      const byteChars = atob(doc.fileData);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
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
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const categoryBadgeColor = (cat: string) => {
    const colors: Record<string, string> = {
      Policy: 'bg-blue-900/30 text-blue-400 border-blue-700/40',
      Handbook: 'bg-purple-900/30 text-purple-400 border-purple-700/40',
      Form: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40',
      Training: 'bg-amber-900/30 text-amber-400 border-amber-700/40',
      Other: 'bg-gray-800 text-gray-400 border-gray-700/40',
    };
    return colors[cat] || colors.Other;
  };

  return (
    <AppShell allowedRoles={['physician', 'admin']}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">HR Documents</h2>

        {/* Upload Form */}
        <div className="card mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
            Upload New Document
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="input-field"
                  placeholder="Document title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category *</label>
                <select
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value)}
                  className="input-field"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">File *</label>
              <input
                ref={fileRef}
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-gray-700 file:text-gray-300
                  hover:file:bg-gray-600
                  file:cursor-pointer file:transition-colors"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif"
                required
              />
              {fileName && (
                <p className="text-xs text-gray-500 mt-1">
                  {fileName} ({formatFileSize(fileSize)})
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !fileData || !docTitle.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>

        {/* Documents List */}
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Uploaded Documents ({documents.length})
        </h3>

        {loading ? (
          <p className="text-gray-400">Loading documents...</p>
        ) : documents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto !p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td className="font-medium">{doc.title}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${categoryBadgeColor(doc.category)}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="text-sm text-gray-400 max-w-[200px] truncate">{doc.fileName}</td>
                    <td className="text-sm text-gray-400">{formatFileSize(doc.fileSize)}</td>
                    <td>
                      <div className="text-xs text-gray-400">{formatDate(doc.createdAt)}</div>
                      <div className="text-xs text-gray-600">{doc.uploadedBy}</div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="btn-secondary !py-1 !px-2 !text-xs"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="btn-danger !py-1 !px-2 !text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
