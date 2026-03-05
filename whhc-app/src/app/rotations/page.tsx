'use client';

import { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/ui/AppShell';
import Modal from '@/components/ui/Modal';
import { onStudentsChange, saveStudent, deleteStudent, clearAllStudents } from '@/lib/rotation-db';
import {
  SPECIALTIES,
  getAvailableMonths,
  getPeriods,
  getPeriodBookingCounts,
  generateOfferLetterPDF,
} from '@/lib/rotation-helpers';
import type { RotationStudent, RotationPeriod } from '@/types/rotation';

export default function RotationManagementPage() {
  const [students, setStudents] = useState<RotationStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [csvResult, setCsvResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    duration: '2',
    month: '',
    periods: [] as RotationPeriod[],
  });

  const months = getAvailableMonths();

  useEffect(() => {
    const unsubscribe = onStudentsChange((list) => {
      setStudents(list);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Filtered students
  const activeMonths = [...new Set(students.map((s) => s.month).filter(Boolean))];
  const monthsWithData = months.filter((m) => activeMonths.includes(m.key));
  const filtered = filterMonth === 'all' ? students : students.filter((s) => s.month === filterMonth);

  // Schedule grid data
  const schedule: Record<string, { period: RotationPeriod; students: RotationStudent[] }> = {};
  filtered.forEach((s) => {
    if (s.periods) {
      s.periods.forEach((p) => {
        if (!schedule[p.id]) schedule[p.id] = { period: p, students: [] };
        schedule[p.id].students.push(s);
      });
    }
  });
  const unscheduled = filtered.filter((s) => !s.periods || s.periods.length === 0);

  // Stats
  const totalStudents = students.length;
  const confirmed = students.filter((s) => s.periods && s.periods.length > 0).length;
  const awaiting = students.filter((s) => !s.periods || s.periods.length === 0).length;
  const specialtyCount = new Set(students.map((s) => s.specialty).filter(Boolean)).size;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    await deleteStudent(id);
  };

  const handleClearAll = async () => {
    if (!confirm('Clear ALL student data? This cannot be undone.')) return;
    await clearAllStudents();
  };

  const handleAddStudent = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      alert('Name and email are required.');
      return;
    }
    setAddSaving(true);
    const student: RotationStudent = {
      id: Date.now().toString(),
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      phone: addForm.phone.trim(),
      specialty: addForm.specialty || 'Not specified',
      registeredAt: new Date().toISOString(),
      month: addForm.month || null,
      periods: addForm.periods.length > 0 ? addForm.periods : null,
      duration: addForm.periods.length > 0 ? parseInt(addForm.duration) : null,
    };
    await saveStudent(student);
    setAddForm({ name: '', email: '', phone: '', specialty: '', duration: '2', month: '', periods: [] });
    setAddSaving(false);
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Specialty', 'Duration', 'Period(s)', 'Status', 'Registered']];
    students.forEach((s) =>
      rows.push([
        s.name,
        s.email,
        s.phone,
        s.specialty,
        s.duration ? s.duration + ' weeks' : '',
        s.periods ? s.periods.map((p) => p.label).join(' | ') : '',
        s.periods ? 'Confirmed' : 'Awaiting',
        new Date(s.registeredAt).toLocaleDateString(),
      ])
    );
    const csv = rows.map((r) => r.map((c) => '"' + c + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'whhc-rotation-roster.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvResult(null);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      alert('CSV must have a header row and at least one data row.');
      return;
    }

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else cur += ch;
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const findCol = (keywords: string[]) => headers.findIndex((h) => keywords.some((k) => h.includes(k)));
    const nameIdx = findCol(['name', 'fullname', 'studentname']);
    const emailIdx = findCol(['email', 'emailaddress']);
    const phoneIdx = findCol(['phone', 'telephone', 'mobile', 'phonenumber']);
    const specIdx = findCol(['specialty', 'speciality', 'interest', 'medicalspecialty']);
    const durIdx = findCol(['duration', 'weeks', 'durationweeks']);
    const periodIdx = findCol(['period', 'rotationperiod', 'rotationperiods', 'dates']);
    const startIdx = findCol(['start', 'rotationstart', 'startdate']);
    const endIdx = findCol(['end', 'rotationend', 'enddate']);

    if (nameIdx === -1 || emailIdx === -1) {
      alert("CSV must have at least 'Name' and 'Email' columns.");
      return;
    }

    // Build all periods for matching
    const allPeriods: Record<string, RotationPeriod> = {};
    const allMonths = getAvailableMonths();
    allMonths.forEach((m) => {
      getPeriods(m.key).forEach((p) => {
        allPeriods[p.id] = p;
      });
    });
    const periodList = Object.values(allPeriods);

    const matchPeriod = (dateStr: string): RotationPeriod | undefined => {
      if (!dateStr) return undefined;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return undefined;
      return periodList.find((p) => {
        const ps = new Date(p.start);
        const pe = new Date(p.end);
        return d >= ps && d <= pe;
      });
    };

    const matchPeriodLabel = (label: string): RotationPeriod[] => {
      if (!label) return [];
      return periodList.filter((p) => label.includes(p.label) || label.includes(p.label.split(' – ')[0]));
    };

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const name = (cols[nameIdx] || '').replace(/^["']|["']$/g, '').trim();
      const email = (cols[emailIdx] || '').replace(/^["']|["']$/g, '').trim();
      if (!name || !email) {
        skipped++;
        continue;
      }

      const phone = phoneIdx >= 0 ? (cols[phoneIdx] || '').replace(/^["']|["']$/g, '').trim() : '';
      const spec = specIdx >= 0 ? (cols[specIdx] || '').replace(/^["']|["']$/g, '').trim() : 'Not specified';
      let dur = 2;
      if (durIdx >= 0) {
        const dv = parseInt((cols[durIdx] || '').replace(/[^0-9]/g, ''));
        if (dv === 4) dur = 4;
      }

      let matched: RotationPeriod[] = [];
      if (periodIdx >= 0) matched = matchPeriodLabel((cols[periodIdx] || '').replace(/^["']|["']$/g, ''));
      if (matched.length === 0 && startIdx >= 0) {
        const mp = matchPeriod((cols[startIdx] || '').replace(/^["']|["']$/g, ''));
        if (mp) matched.push(mp);
      }
      if (matched.length === 0 && endIdx >= 0) {
        const mp = matchPeriod((cols[endIdx] || '').replace(/^["']|["']$/g, ''));
        if (mp && !matched.find((x) => x.id === mp.id)) matched.push(mp);
      }

      let month: string | null = null;
      if (matched.length > 0) month = matched[0].id.split('-P')[0];

      if (students.find((s) => s.email.toLowerCase() === email.toLowerCase())) {
        skipped++;
        continue;
      }

      const s: RotationStudent = {
        id: Date.now().toString() + '-' + i,
        name,
        email,
        phone,
        specialty: spec,
        registeredAt: new Date().toISOString(),
        month,
        periods: matched.length > 0 ? matched : null,
        duration: matched.length > 0 ? dur : null,
      };
      try {
        await saveStudent(s);
        added++;
      } catch {
        errors.push(name);
      }
    }

    setCsvResult({ added, skipped, errors });
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  // Add modal: period picker
  const addFormPeriods = addForm.month ? getPeriods(addForm.month) : [];
  const addFormMaxPeriods = addForm.duration === '4' ? 2 : 1;
  const bookingCounts = getPeriodBookingCounts(students);

  const toggleAddPeriod = (period: RotationPeriod) => {
    const exists = addForm.periods.find((p) => p.id === period.id);
    if (exists) {
      setAddForm({ ...addForm, periods: addForm.periods.filter((p) => p.id !== period.id) });
    } else if (addForm.periods.length < addFormMaxPeriods) {
      setAddForm({ ...addForm, periods: [...addForm.periods, period] });
    }
  };

  if (loading) {
    return (
      <AppShell allowedRoles={['physician', 'admin', 'clinical']}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-4xl mb-4">🎓</div>
            <p className="text-gray-400 animate-pulse">Loading rotation data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Rotation Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalStudents} registration{totalStudents !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              + Add Student
            </button>
            <button onClick={handleExportCSV} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
              Export CSV
            </button>
            <label className="btn-primary bg-blue-600 hover:bg-blue-700 cursor-pointer inline-flex items-center gap-1">
              Upload CSV
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
            {students.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn-primary bg-red-700 hover:bg-red-800"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* CSV Import Result */}
        {csvResult && (
          <div className={`card mb-4 border ${csvResult.errors.length > 0 ? 'border-amber-600' : 'border-emerald-600'}`}>
            <div className="flex items-center justify-between">
              <p className={csvResult.errors.length > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                <strong>CSV Import Complete:</strong> {csvResult.added} added, {csvResult.skipped} skipped
                {csvResult.errors.length > 0 && ` · Failed: ${csvResult.errors.join(', ')}`}
              </p>
              <button onClick={() => setCsvResult(null)} className="text-gray-500 hover:text-gray-300">
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
            <div className="text-xs text-gray-500 mt-1">Total Registered</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-emerald-400">{confirmed}</div>
            <div className="text-xs text-gray-500 mt-1">Confirmed</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-amber-400">{awaiting}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting Schedule</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-purple-400">{specialtyCount}</div>
            <div className="text-xs text-gray-500 mt-1">Specialties</div>
          </div>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-gray-400">Filter:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Months</option>
            {monthsWithData.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Overview Grid */}
        {Object.keys(schedule).length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Schedule Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(schedule)
                .sort((a, b) => a.period.start.localeCompare(b.period.start))
                .map(({ period, students: ps }) => (
                  <div key={period.id} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white text-sm">{period.label}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          ps.length >= 2
                            ? 'bg-red-900/50 text-red-300'
                            : 'bg-emerald-900/50 text-emerald-300'
                        }`}
                      >
                        {ps.length}/2
                      </span>
                    </div>
                    {ps.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 mb-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-900/40 flex items-center justify-center text-red-300 text-xs font-bold">
                          {s.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{s.name}</div>
                          <div className="text-xs text-gray-500">
                            {s.specialty} · {s.duration}wk
                          </div>
                        </div>
                      </div>
                    ))}
                    {ps.length < 2 && (
                      <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3 border border-dashed border-gray-700">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-600 text-xs">
                          ?
                        </div>
                        <span className="text-sm text-gray-600 italic">Open spot</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Awaiting Schedule */}
        {unscheduled.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
              Awaiting Schedule ({unscheduled.length})
            </h3>
            {unscheduled.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3 border-t border-gray-800 first:border-t-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-300 text-xs font-bold">
                    {s.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{s.name}</div>
                    <div className="text-xs text-gray-500">
                      {s.email} · {s.phone} · {s.specialty}
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">Awaiting</span>
              </div>
            ))}
          </div>
        )}

        {/* All Registrations Table */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">All Registrations</h3>
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No registrations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialty</th>
                    <th>Duration</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.name}</td>
                      <td className="text-sm">{s.email}</td>
                      <td>
                        <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">
                          {s.specialty}
                        </span>
                      </td>
                      <td>{s.duration ? `${s.duration}wk` : '—'}</td>
                      <td className="text-xs text-gray-400">
                        {s.periods ? s.periods.map((p) => p.label).join(', ') : '—'}
                      </td>
                      <td>
                        {s.periods ? (
                          <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full">
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">
                            Awaiting
                          </span>
                        )}
                      </td>
                      <td className="text-sm text-gray-500">
                        {new Date(s.registeredAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {s.periods && (
                            <button
                              onClick={() => generateOfferLetterPDF(s)}
                              className="text-blue-400 hover:text-blue-300 text-xs"
                              title="Download Offer Letter"
                            >
                              PDF
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="text-red-400 hover:text-red-300 text-sm"
                            title="Delete"
                          >
                            &times;
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
      </div>

      {/* Add Student Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Student Registration" maxWidth="max-w-xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
            <input
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="input-field"
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
            <input
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              className="input-field"
              placeholder="jane@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
            <input
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              className="input-field"
              placeholder="+1 555-1234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Specialty</label>
            <select
              value={addForm.specialty}
              onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
              className="input-field"
            >
              <option value="">Select...</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
            <select
              value={addForm.duration}
              onChange={(e) => setAddForm({ ...addForm, duration: e.target.value, periods: [] })}
              className="input-field"
            >
              <option value="2">2 Weeks</option>
              <option value="4">4 Weeks</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Month</label>
            <select
              value={addForm.month}
              onChange={(e) => setAddForm({ ...addForm, month: e.target.value, periods: [] })}
              className="input-field"
            >
              <option value="">Select month...</option>
              {months.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Period picker */}
        {addForm.month && addFormPeriods.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Period{addFormMaxPeriods > 1 ? 's' : ''}{' '}
              <span className="text-gray-600">
                ({addForm.periods.length}/{addFormMaxPeriods})
              </span>
            </label>
            <div className="space-y-2">
              {addFormPeriods.map((period) => {
                const count = bookingCounts[period.id] || 0;
                const full = count >= 2;
                const selected = addForm.periods.find((p) => p.id === period.id);
                return (
                  <button
                    key={period.id}
                    onClick={() => !full && toggleAddPeriod(period)}
                    disabled={full}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      full
                        ? 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
                        : selected
                        ? 'border-primary-500 bg-primary-600/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 cursor-pointer'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium text-white">{period.label}</span>
                      <span className="text-xs text-gray-500 ml-2">({count}/2 filled)</span>
                    </div>
                    {full && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">Full</span>
                    )}
                    {selected && (
                      <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
            Cancel
          </button>
          <button onClick={handleAddStudent} disabled={addSaving} className="btn-primary">
            {addSaving ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
