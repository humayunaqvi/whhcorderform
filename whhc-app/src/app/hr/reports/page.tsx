'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { getPayrollReport, closePayPeriod, getPayPeriods } from '@/lib/db';
import { getAllUsers } from '@/lib/auth';
import { formatTime, formatDate, formatDuration } from '@/lib/utils';
import type { User, TimeEntry, VacationRequest, PayPeriod } from '@/types';

export default function PayrollReportsPage() {
  const { session } = useAuth();

  // Date range defaults to last 2 weeks
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const defaultStart = twoWeeksAgo.toISOString().slice(0, 10);
  const defaultEnd = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [ptoEntries, setPtoEntries] = useState<VacationRequest[]>([]);
  const [summaryByUser, setSummaryByUser] = useState<
    Record<string, { displayName: string; totalHours: number; totalBreakMinutes: number; entries: number; ptoHours: number; ptoEntries: number }>
  >({});
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    getAllUsers().then(setUsers);
    getPayPeriods().then(setPayPeriods);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const report = await getPayrollReport(startDate, endDate);
    let filteredEntries = report.entries;
    let filteredPto = report.ptoEntries;
    let filteredSummary = report.summaryByUser;

    if (employeeFilter !== 'all') {
      filteredEntries = filteredEntries.filter((e) => e.userId === employeeFilter);
      filteredPto = filteredPto.filter((p) => p.userId === employeeFilter);
      const filtered: typeof filteredSummary = {};
      if (filteredSummary[employeeFilter]) {
        filtered[employeeFilter] = filteredSummary[employeeFilter];
      }
      filteredSummary = filtered;
    }

    setEntries(filteredEntries);
    setPtoEntries(filteredPto);
    setSummaryByUser(filteredSummary);
    setGenerated(true);
    setLoading(false);
  };

  const formatPtoTime = (pto: VacationRequest): string => {
    if (pto.timeSlot === 'full_day') return 'Full Day (8h)';
    if (pto.ptoStartTime && pto.ptoEndTime) {
      const [sh, sm] = pto.ptoStartTime.split(':').map(Number);
      const [eh, em] = pto.ptoEndTime.split(':').map(Number);
      const hrs = (eh + em / 60) - (sh + sm / 60);
      return `${pto.ptoStartTime} – ${pto.ptoEndTime} (${hrs.toFixed(1)}h)`;
    }
    return pto.timeSlot === 'morning' ? 'Morning (4h)' : 'Afternoon (4h)';
  };

  const handleExportCSV = () => {
    const headers = ['Employee', 'Date', 'Type', 'Clock In', 'Clock Out', 'Break (min)', 'Hours', 'PTO Hours', 'Reason'];
    const clockRows = entries.map((e) => [
      e.displayName,
      e.date,
      'Clock',
      formatTime(e.clockIn),
      e.clockOut ? formatTime(e.clockOut) : '',
      Math.round(e.totalBreakMinutes).toString(),
      e.totalHours ? e.totalHours.toFixed(2) : '0',
      '',
      '',
    ]);
    const ptoRows = ptoEntries.map((p) => {
      let hrs = 0;
      if (p.timeSlot === 'full_day') hrs = 8;
      else if (p.ptoStartTime && p.ptoEndTime) {
        const [sh, sm] = p.ptoStartTime.split(':').map(Number);
        const [eh, em] = p.ptoEndTime.split(':').map(Number);
        hrs = (eh + em / 60) - (sh + sm / 60);
      } else hrs = 4;
      return [
        p.displayName,
        p.startDate,
        'PTO',
        p.ptoStartTime || '',
        p.ptoEndTime || '',
        '',
        '',
        hrs.toFixed(2),
        p.reason || '',
      ];
    });

    // Summary rows
    const summaryHeaders = ['', '', '', '', '', '', '', '', ''];
    const summaryTitle = ['--- SUMMARY ---', '', '', '', '', '', '', '', ''];
    const sumHeaders = ['Employee', '', '', '', '', 'Break (min)', 'Clock Hours', 'PTO Hours', 'Total Hours'];
    const summaryRows = Object.entries(summaryByUser).map(([, data]) => {
      const total = data.totalHours + data.ptoHours;
      return [
        data.displayName,
        '',
        '',
        '',
        '',
        Math.round(data.totalBreakMinutes).toString(),
        data.totalHours.toFixed(2),
        data.ptoHours.toFixed(2),
        total.toFixed(2),
      ];
    });

    const allRows = [headers, ...clockRows, ...ptoRows, summaryHeaders, summaryTitle, sumHeaders, ...summaryRows];
    const csvContent = allRows
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClosePayPeriod = async () => {
    if (!session) return;
    const confirmed = confirm(
      `Close pay period from ${formatDate(startDate)} to ${formatDate(endDate)}? This action marks the period as finalized.`
    );
    if (!confirmed) return;

    await closePayPeriod(startDate, endDate, session.username);
    const updated = await getPayPeriods();
    setPayPeriods(updated);
    alert('Pay period closed successfully.');
  };

  return (
    <AppShell allowedRoles={['physician', 'admin']}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Payroll Reports</h2>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Employee</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Employees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {generated && (
          <>
            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleExportCSV} className="btn-primary">
                Export to Excel (CSV)
              </button>
              <button onClick={handleClosePayPeriod} className="btn-primary bg-amber-600 hover:bg-amber-700">
                Close Pay Period
              </button>
            </div>

            {/* Summary Table */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
              {Object.keys(summaryByUser).length === 0 ? (
                <p className="text-gray-500">No completed time entries or PTO found for this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Clock Hours</th>
                        <th>PTO Hours</th>
                        <th>Total Hours</th>
                        <th>Break Minutes</th>
                        <th># Clock Entries</th>
                        <th># PTO Entries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summaryByUser).map(([userId, data]) => {
                        const totalHrs = data.totalHours + data.ptoHours;
                        return (
                          <tr key={userId}>
                            <td className="font-medium">{data.displayName}</td>
                            <td>{formatDuration(data.totalHours)}</td>
                            <td className={data.ptoHours > 0 ? 'text-purple-400' : ''}>{formatDuration(data.ptoHours)}</td>
                            <td className="font-semibold text-green-400">{formatDuration(totalHrs)}</td>
                            <td>{Math.round(data.totalBreakMinutes)} min</td>
                            <td>{data.entries}</td>
                            <td className={data.ptoEntries > 0 ? 'text-purple-400' : ''}>{data.ptoEntries}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Clock Entries Detail Table */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Clock-In Details</h3>
              {entries.length === 0 ? (
                <p className="text-gray-500">No clock entries found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Break</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => (
                        <tr key={e.id}>
                          <td className="font-medium">{e.displayName}</td>
                          <td>{formatDate(e.date)}</td>
                          <td>{formatTime(e.clockIn)}</td>
                          <td>{e.clockOut ? formatTime(e.clockOut) : '---'}</td>
                          <td>{Math.round(e.totalBreakMinutes)} min</td>
                          <td>{e.totalHours ? formatDuration(e.totalHours) : '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* PTO Detail Table */}
            {ptoEntries.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  PTO Details
                  <span className="ml-2 text-sm font-normal text-purple-400">({ptoEntries.length} entries)</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ptoEntries.map((p) => (
                        <tr key={p.id}>
                          <td className="font-medium">{p.displayName}</td>
                          <td>{formatDate(p.startDate)}</td>
                          <td className="text-purple-400">{formatPtoTime(p)}</td>
                          <td className="text-sm text-gray-400">{p.reason || '—'}</td>
                          <td>
                            {p.source === 'same_day' ? (
                              <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">Same-Day</span>
                            ) : (
                              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">Requested</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Closed Pay Periods History */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Closed Pay Periods</h3>
          {payPeriods.length === 0 ? (
            <p className="text-gray-500">No closed pay periods yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Closed By</th>
                    <th>Closed At</th>
                    <th>Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {payPeriods.map((pp) => (
                    <tr key={pp.id}>
                      <td className="font-medium">
                        {formatDate(pp.startDate)} &mdash; {formatDate(pp.endDate)}
                      </td>
                      <td>{pp.closedBy}</td>
                      <td className="text-sm text-gray-400">{formatDate(pp.closedAt)}</td>
                      <td>{Object.keys(pp.summary).length}</td>
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
