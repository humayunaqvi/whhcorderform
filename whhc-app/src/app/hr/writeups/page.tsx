'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { createWriteUp, getWriteUps } from '@/lib/db';
import { getAllUsers } from '@/lib/auth';
import { formatDate, todayStr } from '@/lib/utils';
import type { User, WriteUp, WriteUpType } from '@/types';

const WRITEUP_TYPE_LABELS: Record<WriteUpType, string> = {
  verbal_warning: 'Verbal Warning',
  written_warning: 'Written Warning',
  final_warning: 'Final Warning',
  suspension: 'Suspension',
  termination: 'Termination',
};

const WRITEUP_TYPE_COLORS: Record<WriteUpType, string> = {
  verbal_warning: 'bg-yellow-600/20 text-yellow-400',
  written_warning: 'bg-orange-600/20 text-orange-400',
  final_warning: 'bg-red-600/20 text-red-400',
  suspension: 'bg-red-700/20 text-red-300',
  termination: 'bg-red-900/30 text-red-200',
};

export default function WriteUpsPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [writeUps, setWriteUps] = useState<WriteUp[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState<WriteUpType>('verbal_warning');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr());
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [u, w] = await Promise.all([getAllUsers(), getWriteUps()]);
    setUsers(u);
    setWriteUps(w);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !employeeId) return;

    const employee = users.find((u) => u.id === employeeId);
    if (!employee) return;

    setSubmitting(true);
    await createWriteUp({
      employeeId,
      employeeName: employee.displayName,
      type,
      subject,
      description,
      date,
      issuedBy: session.displayName,
    });

    // Reset form
    setEmployeeId('');
    setType('verbal_warning');
    setSubject('');
    setDescription('');
    setDate(todayStr());
    setSubmitting(false);

    // Reload
    const updated = await getWriteUps();
    setWriteUps(updated);
  };

  return (
    <AppShell allowedRoles={['admin']}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Write-Up Management</h2>

        {/* Create Write-Up Form */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Write-Up</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Employee *</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select employee...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as WriteUpType)}
                  className="input-field"
                  required
                >
                  {(Object.entries(WRITEUP_TYPE_LABELS) as [WriteUpType, string][]).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Brief subject of the write-up"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[100px]"
                required
                placeholder="Detailed description of the incident or behavior..."
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Creating...' : 'Create Write-Up'}
              </button>
            </div>
          </form>
        </div>

        {/* Write-Ups List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Write-Up History</h3>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : writeUps.length === 0 ? (
            <p className="text-gray-500">No write-ups recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Issued By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {writeUps.map((wu) => (
                    <tr key={wu.id}>
                      <td className="font-medium">{wu.employeeName}</td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            WRITEUP_TYPE_COLORS[wu.type]
                          }`}
                        >
                          {WRITEUP_TYPE_LABELS[wu.type]}
                        </span>
                      </td>
                      <td>{wu.subject}</td>
                      <td className="text-sm text-gray-400">{formatDate(wu.date)}</td>
                      <td className="text-sm text-gray-400">{wu.issuedBy}</td>
                      <td>
                        <Link
                          href={`/hr/writeups/letter?id=${wu.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          View Letter
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
