'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { getEmployeeRequests, updateEmployeeRequest } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { EmployeeRequest, RequestStatus, RequestType } from '@/types';

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-yellow-600/20 text-yellow-400',
  reviewed: 'bg-blue-600/20 text-blue-400',
  resolved: 'bg-green-600/20 text-green-400',
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
};

const TYPE_COLORS: Record<RequestType, string> = {
  evaluation: 'bg-purple-600/20 text-purple-400',
  discussion: 'bg-cyan-600/20 text-cyan-400',
  other: 'bg-gray-600/20 text-gray-400',
};

const TYPE_LABELS: Record<RequestType, string> = {
  evaluation: 'Evaluation',
  discussion: 'Discussion',
  other: 'Other',
};

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const loadRequests = async () => {
    const items = await getEmployeeRequests(
      statusFilter === 'all' ? undefined : { status: statusFilter }
    );
    setRequests(items);
    // Initialize admin notes from existing data
    const notes: Record<string, string> = {};
    items.forEach((r) => {
      notes[r.id] = r.adminNotes || '';
    });
    setAdminNotes(notes);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusUpdate = async (requestId: string, newStatus: RequestStatus) => {
    await updateEmployeeRequest(requestId, {
      status: newStatus,
      adminNotes: adminNotes[requestId] || undefined,
    });
    await loadRequests();
  };

  const handleNoteSave = async (requestId: string) => {
    await updateEmployeeRequest(requestId, {
      adminNotes: adminNotes[requestId] || '',
    });
  };

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical']}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Employee Requests</h2>

        {/* Status Filter */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="card">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="card">
            <p className="text-gray-500 text-center py-8">
              No {statusFilter === 'all' ? '' : statusFilter} requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{req.displayName}</span>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        TYPE_COLORS[req.type]
                      }`}
                    >
                      {TYPE_LABELS[req.type]}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        STATUS_COLORS[req.status]
                      }`}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(req.createdAt)}</span>
                </div>

                <h4 className="text-sm font-semibold text-gray-200 mb-1">{req.subject}</h4>
                <p className="text-sm text-gray-400 mb-4 whitespace-pre-wrap">{req.description}</p>

                {/* Admin Notes */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Admin Notes</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={adminNotes[req.id] || ''}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      className="input-field flex-1 !py-1.5 !text-sm"
                      placeholder="Add notes..."
                    />
                    <button
                      onClick={() => handleNoteSave(req.id)}
                      className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600"
                    >
                      Save Note
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                {req.status !== 'resolved' && (
                  <div className="flex gap-2">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'reviewed')}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-600/30"
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    {(req.status === 'pending' || req.status === 'reviewed') && (
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'resolved')}
                        className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded text-xs font-medium hover:bg-green-600/30"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
