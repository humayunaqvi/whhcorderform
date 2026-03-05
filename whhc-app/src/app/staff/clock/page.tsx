'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AppShell from '@/components/ui/AppShell';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth-context';
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getActiveTimeEntry,
  getTimeEntries,
  logSameDayPto,
  getVacationRequests,
} from '@/lib/db';
import { formatTime, formatDuration, formatDurationLive, todayStr } from '@/lib/utils';
import type { TimeEntry, VacationRequest } from '@/types';

export default function TimeClockPage() {
  const { session } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // PTO modal state
  const [showPtoModal, setShowPtoModal] = useState(false);
  const [showFullDayPto, setShowFullDayPto] = useState(false);
  const [ptoStartTime, setPtoStartTime] = useState('13:00');
  const [ptoEndTime, setPtoEndTime] = useState('17:00');
  const [ptoReason, setPtoReason] = useState('');
  const [ptoCountAsPto, setPtoCountAsPto] = useState(true);
  const [ptoSubmitting, setPtoSubmitting] = useState(false);
  const [todayPto, setTodayPto] = useState<VacationRequest[]>([]);

  // Live clock - updates every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTodayPto = useCallback(async () => {
    if (!session) return;
    const all = await getVacationRequests({ userId: session.userId });
    setTodayPto(all.filter(r => r.startDate === todayStr() && r.source === 'same_day'));
  }, [session]);

  // Load active entry and today's entries on mount
  useEffect(() => {
    if (!session) return;
    async function load() {
      try {
        const [active, entries] = await Promise.all([
          getActiveTimeEntry(session!.userId),
          getTimeEntries({ userId: session!.userId, dateFrom: todayStr(), dateTo: todayStr() }),
        ]);
        setActiveEntry(active);
        setTodayEntries(entries);
      } catch (err) {
        console.error('Time clock load error:', err);
      }
      setLoading(false);
    }
    load();
    loadTodayPto();
  }, [session, loadTodayPto]);

  // Live elapsed timer when clocked in
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (activeEntry && !activeEntry.clockOut) {
      const update = () => {
        const clockInMs = new Date(activeEntry.clockIn).getTime();
        const now = Date.now();
        const breakMs = activeEntry.breakStart
          ? now - new Date(activeEntry.breakStart).getTime()
          : 0;
        const totalBreakMs = (activeEntry.totalBreakMinutes || 0) * 60 * 1000 + breakMs;
        setElapsed(now - clockInMs - totalBreakMs);
      };
      update();
      timerRef.current = setInterval(update, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeEntry]);

  const refreshEntries = async () => {
    if (!session) return;
    const [active, entries] = await Promise.all([
      getActiveTimeEntry(session.userId),
      getTimeEntries({ userId: session.userId, dateFrom: todayStr(), dateTo: todayStr() }),
    ]);
    setActiveEntry(active);
    setTodayEntries(entries);
  };

  const handleClockIn = async () => {
    if (!session) return;
    await clockIn(session.userId, session.username, session.displayName);
    await refreshEntries();
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;
    await clockOut(activeEntry.id);
    await refreshEntries();

    // Show PTO modal — pre-fill times
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    setPtoStartTime(
      String(nextHour.getHours()).padStart(2, '0') + ':00'
    );
    setPtoEndTime('17:00');
    setPtoReason('');
    setPtoCountAsPto(true);
    setShowPtoModal(true);
  };

  const handleStartBreak = async () => {
    if (!activeEntry) return;
    await startBreak(activeEntry.id);
    await refreshEntries();
  };

  const handleEndBreak = async () => {
    if (!activeEntry) return;
    await endBreak(activeEntry.id);
    await refreshEntries();
  };

  const handleSubmitPto = async (fullDay: boolean) => {
    if (!session) return;
    setPtoSubmitting(true);
    try {
      await logSameDayPto({
        userId: session.userId,
        username: session.username,
        displayName: session.displayName,
        date: todayStr(),
        timeSlot: fullDay ? 'full_day' : 'afternoon',
        ptoStartTime: fullDay ? undefined : ptoStartTime,
        ptoEndTime: fullDay ? undefined : ptoEndTime,
        reason: ptoReason || (fullDay ? 'Full day PTO' : 'Partial day PTO'),
        countAsPto: ptoCountAsPto,
      });
      setShowPtoModal(false);
      setShowFullDayPto(false);
      await loadTodayPto();
    } catch (err) {
      console.error('Failed to log PTO:', err);
    }
    setPtoSubmitting(false);
  };

  const isClockedIn = !!activeEntry && !activeEntry.clockOut;
  const isOnBreak = isClockedIn && !!activeEntry?.breakStart;

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Time Clock</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            {/* Current Time & Status */}
            <div className="card text-center mb-6">
              <p className="text-5xl font-mono font-bold text-white mb-2">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </p>
              <p className="text-gray-400">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              {/* Status Indicator */}
              {isClockedIn && (
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      isOnBreak
                        ? 'bg-amber-900/30 text-amber-400'
                        : 'bg-emerald-900/30 text-emerald-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnBreak ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    {isOnBreak ? 'On Break' : 'Clocked In'}
                  </span>
                </div>
              )}

              {/* Live elapsed timer */}
              {isClockedIn && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                    Work Time
                  </p>
                  <p className="text-3xl font-mono font-bold text-primary-400">
                    {formatDurationLive(elapsed)}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-3 mb-8">
              {!isClockedIn ? (
                <>
                  <button onClick={handleClockIn} className="btn-primary px-8 py-3 text-lg">
                    Clock In
                  </button>
                  <button
                    onClick={() => {
                      setPtoReason('');
                      setPtoCountAsPto(true);
                      setShowFullDayPto(true);
                    }}
                    className="text-sm text-gray-400 hover:text-primary-400 underline transition-colors"
                  >
                    Log Full Day PTO Instead
                  </button>
                </>
              ) : (
                <div className="flex gap-4">
                  {!isOnBreak ? (
                    <button
                      onClick={handleStartBreak}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Start Break
                    </button>
                  ) : (
                    <button
                      onClick={handleEndBreak}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                    >
                      End Break
                    </button>
                  )}
                  <button
                    onClick={handleClockOut}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Clock Out
                  </button>
                </div>
              )}
            </div>

            {/* Today's Entries Table */}
            <div className="card mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                Today&apos;s Time Entries
              </h3>
              {todayEntries.length === 0 ? (
                <p className="text-gray-600 text-sm italic text-center py-6">
                  No time entries for today.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wide">
                        <th className="text-left pb-3">Clock In</th>
                        <th className="text-left pb-3">Clock Out</th>
                        <th className="text-left pb-3">Break</th>
                        <th className="text-left pb-3">Total</th>
                        <th className="text-left pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {todayEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="py-3 text-gray-200">{formatTime(entry.clockIn)}</td>
                          <td className="py-3 text-gray-200">
                            {entry.clockOut ? formatTime(entry.clockOut) : '--'}
                          </td>
                          <td className="py-3 text-gray-400">
                            {entry.totalBreakMinutes > 0
                              ? `${Math.round(entry.totalBreakMinutes)}m`
                              : '--'}
                          </td>
                          <td className="py-3 text-gray-200">
                            {entry.totalHours != null
                              ? formatDuration(entry.totalHours)
                              : '--'}
                          </td>
                          <td className="py-3">
                            {!entry.clockOut ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Today's PTO */}
            {todayPto.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                  Today&apos;s PTO
                </h3>
                <div className="space-y-3">
                  {todayPto.map((pto) => (
                    <div
                      key={pto.id}
                      className="flex items-center justify-between bg-purple-900/20 border border-purple-800/40 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400 font-medium text-sm">
                          {pto.timeSlot === 'full_day'
                            ? 'Full Day'
                            : `${pto.ptoStartTime || '--'} - ${pto.ptoEndTime || '--'}`}
                        </span>
                        {pto.reason && (
                          <span className="text-gray-400 text-sm">— {pto.reason}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {pto.countAsPto && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700/40">
                            Counts as PTO
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400">
                          Logged
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Clock-Out PTO Modal */}
      <Modal open={showPtoModal} onClose={() => setShowPtoModal(false)} title="Log PTO for Today?">
        <p className="text-gray-400 text-sm mb-5">
          Need to log PTO for the rest of the day? Fill in the times below, or skip if you don&apos;t need PTO.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">PTO Start Time</label>
            <input
              type="time"
              value={ptoStartTime}
              onChange={(e) => setPtoStartTime(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">PTO End Time</label>
            <input
              type="time"
              value={ptoEndTime}
              onChange={(e) => setPtoEndTime(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
          <input
            type="text"
            value={ptoReason}
            onChange={(e) => setPtoReason(e.target.value)}
            placeholder="e.g., Doctor appointment, Personal"
            className="input-field w-full"
          />
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={ptoCountAsPto}
            onChange={(e) => setPtoCountAsPto(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-gray-800"
          />
          <span className="text-sm text-gray-300">Count as PTO (deducts from balance)</span>
        </label>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowPtoModal(false)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Skip — No PTO
          </button>
          <button
            onClick={() => handleSubmitPto(false)}
            disabled={ptoSubmitting || !ptoStartTime || !ptoEndTime || ptoEndTime <= ptoStartTime}
            className="btn-primary !py-2 !px-5 disabled:opacity-50"
          >
            {ptoSubmitting ? 'Saving...' : 'Log PTO'}
          </button>
        </div>
      </Modal>

      {/* Full Day PTO Modal */}
      <Modal open={showFullDayPto} onClose={() => setShowFullDayPto(false)} title="Log Full Day PTO">
        <p className="text-gray-400 text-sm mb-5">
          Log a full day of PTO for today. This will not create a time entry.
        </p>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
          <input
            type="text"
            value={ptoReason}
            onChange={(e) => setPtoReason(e.target.value)}
            placeholder="e.g., Sick day, Personal day"
            className="input-field w-full"
          />
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={ptoCountAsPto}
            onChange={(e) => setPtoCountAsPto(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-gray-800"
          />
          <span className="text-sm text-gray-300">Count as PTO (deducts from balance)</span>
        </label>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowFullDayPto(false)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmitPto(true)}
            disabled={ptoSubmitting}
            className="btn-primary !py-2 !px-5 disabled:opacity-50"
          >
            {ptoSubmitting ? 'Saving...' : 'Log Full Day PTO'}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
