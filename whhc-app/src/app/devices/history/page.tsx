'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { getAllAssignments } from '@/lib/db';
import type { DeviceAssignment } from '@/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<DeviceAssignment[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAssignments().then(all => {
      setHistory(all.filter(a => a.status === 'returned').sort((a, b) =>
        (b.returnDate || '').localeCompare(a.returnDate || '')
      ));
      setLoading(false);
    });
  }, []);

  const filtered = history.filter(a => {
    if (typeFilter !== 'all' && a.deviceType !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return a.patientName.toLowerCase().includes(s) || a.serialNumber.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Assignment History</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field w-auto min-w-[250px]" placeholder="Search by patient or serial..." />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="select-field w-auto">
            <option value="all">All Types</option>
            <option value="Holter Monitor">Holter Monitor</option>
            <option value="Ambulatory BP Monitor">Ambulatory BP Monitor</option>
            <option value="MCT Monitor">MCT Monitor</option>
          </select>
        </div>

        <div className="card overflow-x-auto !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>MRN</th>
                <th>Device Type</th>
                <th>Serial #</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">No history records</td></tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.patientName}</td>
                    <td>{a.patientMRN || '—'}</td>
                    <td>{a.deviceType}</td>
                    <td className="font-mono text-xs">{a.serialNumber}</td>
                    <td>{a.assignDate}</td>
                    <td>{a.returnDate || '—'}</td>
                    <td>{a.returnCondition ? <StatusBadge status={a.returnCondition} /> : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
