'use client';

import { useState, useEffect, FormEvent } from 'react';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { getTimeEntries, addManualTimeEntry, updateTimeEntry, deleteTimeEntry } from '@/lib/db';
import { getAllUsers } from '@/lib/auth';
import { formatTime, formatDate, formatDuration } from '@/lib/utils';
import type { TimeEntry, User } from '@/types';

function todayStr(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function weekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.getFullYear() + '-' + String(monday.getMonth() + 1).padStart(2, '0') + '-' + String(monday.getDate()).padStart(2, '0');
}

function weekEnd(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  const sunday = new Date(d.setDate(diff));
  return sunday.getFullYear() + '-' + String(sunday.getMonth() + 1).padStart(2, '0') + '-' + String(sunday.getDate()).padStart(2, '0');
}

function recalcHours(clockIn: string, clockOut: string, breakMin: number): number {
  const inMs = new Date(clockIn).getTime();
  const outMs = new Date(clockOut).getTime();
  const totalMs = outMs - inMs;
  return Math.max(0, (totalMs / (1000 * 60 * 60)) - (breakMin / 60));
}

export default function HRTimePage() {
  const { session } = useAuth();

  // Filters
  const [dateFrom, setDateFrom] = useState(weekStart());
  const [dateTo, setDateTo] = useState(weekEnd());
  const [userFilter, setUserFilter] = useState('');

  // Data
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Manual Entry
  const [showAddForm, setShowAddForm] = useState(false);
  const [addUserId, setAddUserId] = useState('');
  const [addDate, setAddDate] = useState(todayStr());
  const [addClockIn, setAddClockIn] = useState('09:00');
  const [addClockOut, setAddClockOut] = useState('17:00');
  const [addBreak, setAddBreak] = useState(30);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editBreak, setEditBreak] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, timeEntries] = await Promise.all([
        getAllUsers(),
        getTimeEntries({ userId: userFilter || undefined, dateFrom, dateTo }),
      ]);
      setUsers(allUsers);
      setEntries(timeEntries);
    } catch (err) {
      console.error('Failed to load time data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, userFilter]);

  const handleAddEntry = async (e: FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === addUserId);
    if (!user) return;

    const clockInISO = new Date(`${addDate}T${addClockIn}:00`).toISOString();
    const clockOutISO = new Date(`${addDate}T${addClockOut}:00`).toISOString();
    const totalHours = recalcHours(clockInISO, clockOutISO, addBreak);

    await addManualTimeEntry({
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      clockIn: clockInISO,
      clockOut: clockOutISO,
      totalBreakMinutes: addBreak,
      totalHours,
      date: addDate,
    });

    setShowAddForm(false);
    setAddUserId('');
    setAddDate(todayStr());
    setAddClockIn('09:00');
    setAddClockOut('17:00');
    setAddBreak(30);
    loadData();
  };

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    // Extract time portion for inputs
    const ciDate = new Date(entry.clockIn);
    setEditClockIn(
      String(ciDate.getHours()).padStart(2, '0') + ':' + String(ciDate.getMinutes()).padStart(2, '0')
    );
    if (entry.clockOut) {
      const coDate = new Date(entry.clockOut);
      setEditClockOut(
        String(coDate.getHours()).padStart(2, '0') + ':' + String(coDate.getMinutes()).padStart(2, '0')
      );
    } else {
      setEditClockOut('');
    }
    setEditBreak(entry.totalBreakMinutes || 0);
  };

  const saveEdit = async (entry: TimeEntry) => {
    const clockInISO = new Date(`${entry.date}T${editClockIn}:00`).toISOString();
    const clockOutISO = editClockOut ? new Date(`${entry.date}T${editClockOut}:00`).toISOString() : undefined;
    const totalHours = clockOutISO ? recalcHours(clockInISO, clockOutISO, editBreak) : undefined;

    await updateTimeEntry(entry.id, {
      clockIn: clockInISO,
      clockOut: clockOutISO,
      totalBreakMinutes: editBreak,
      totalHours,
    });

    setEditingId(null);
    loadData();
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) return;
    await deleteTimeEntry(entryId);
    loadData();
  };

  return (
    <AppShell allowedRoles={['physician', 'admin']}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Time Entry Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? 'Cancel' : '+ Add Manual Entry'}
          </button>
        </div>

        {/* Add Manual Entry Form */}
        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Add Manual Time Entry
            </h3>
            <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Employee</label>
                <select
                  value={addUserId}
                  onChange={e => setAddUserId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.displayName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={addDate}
                  onChange={e => setAddDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Clock In</label>
                <input
                  type="time"
                  value={addClockIn}
                  onChange={e => setAddClockIn(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Clock Out</label>
                <input
                  type="time"
                  value={addClockOut}
                  onChange={e => setAddClockOut(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Break (min)</label>
                <input
                  type="number"
                  value={addBreak}
                  onChange={e => setAddBreak(Number(e.target.value))}
                  className="input-field"
                  min={0}
                  max={480}
                />
              </div>
              <div>
                <button type="submit" className="btn-primary w-full">Add Entry</button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Employee</label>
              <select
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Employees</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.displayName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="card overflow-x-auto !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Break (min)</th>
                <th>Total Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">No time entries found</td></tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry.id}>
                    <td className="font-medium">{entry.displayName}</td>
                    <td className="text-sm text-gray-400">{formatDate(entry.date)}</td>

                    {editingId === entry.id ? (
                      <>
                        <td>
                          <input
                            type="time"
                            value={editClockIn}
                            onChange={e => setEditClockIn(e.target.value)}
                            className="input-field !py-1 !text-sm"
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            value={editClockOut}
                            onChange={e => setEditClockOut(e.target.value)}
                            className="input-field !py-1 !text-sm"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editBreak}
                            onChange={e => setEditBreak(Number(e.target.value))}
                            className="input-field !py-1 !text-sm w-20"
                            min={0}
                            max={480}
                          />
                        </td>
                        <td className="text-sm text-gray-400">--</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(entry)}
                              className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn-secondary !py-1 !px-2 !text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-sm">{formatTime(entry.clockIn)}</td>
                        <td className="text-sm">{entry.clockOut ? formatTime(entry.clockOut) : <span className="text-amber-400">Active</span>}</td>
                        <td className="text-sm">{Math.round(entry.totalBreakMinutes)}</td>
                        <td className="text-sm">{entry.totalHours != null ? formatDuration(entry.totalHours) : '--'}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(entry)}
                              className="btn-secondary !py-1 !px-2 !text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="btn-danger !py-1 !px-2 !text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {!loading && entries.length > 0 && (
          <div className="card mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Period Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase">Total Entries</div>
                <div className="text-lg font-bold text-white">{entries.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Completed</div>
                <div className="text-lg font-bold text-white">{entries.filter(e => e.clockOut).length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Total Hours</div>
                <div className="text-lg font-bold text-white">
                  {formatDuration(entries.reduce((sum, e) => sum + (e.totalHours || 0), 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Total Break</div>
                <div className="text-lg font-bold text-white">
                  {Math.round(entries.reduce((sum, e) => sum + (e.totalBreakMinutes || 0), 0))} min
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
