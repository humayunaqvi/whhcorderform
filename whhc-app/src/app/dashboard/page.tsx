'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { getOrdersByDate, getAllOrders } from '@/lib/db';
import { getAllDevices, getActiveAssignments, getWaitlist } from '@/lib/db';
import { getActiveTimeEntry, getVacationRequests, getEmployeeRequests, getTimeEntries } from '@/lib/db';
import { getUserData } from '@/lib/auth';
import type { Order, Device, DeviceAssignment, WaitlistEntry, TimeEntry, VacationRequest, EmployeeRequest } from '@/types';

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function DashboardPage() {
  const { session } = useAuth();
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [assignments, setAssignments] = useState<DeviceAssignment[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  // HR state
  const [clockedIn, setClockedIn] = useState(false);
  const [ptoBalance, setPtoBalance] = useState(0);
  const [ptoUsed, setPtoUsed] = useState(0);
  const [pendingVacations, setPendingVacations] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeClockins, setActiveClockins] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [orders, devs, assigns, wl] = await Promise.all([
          getOrdersByDate(todayStr()),
          getAllDevices(),
          getActiveAssignments(),
          getWaitlist(),
        ]);
        setTodayOrders(orders);
        setDevices(devs);
        setAssignments(assigns);
        setWaitlist(wl);

        // HR data
        if (session) {
          const activeEntry = await getActiveTimeEntry(session.userId);
          setClockedIn(!!activeEntry);

          const userData = await getUserData(session.username);
          if (userData) {
            setPtoBalance(userData.ptoBalance || 0);
            setPtoUsed(userData.ptoUsed || 0);
          }

          // Admin HR stats
          if (session.role === 'admin' || session.role === 'physician') {
            const vacations = await getVacationRequests({ status: 'pending' });
            setPendingVacations(vacations.length);
            const requests = await getEmployeeRequests({ status: 'pending' });
            setPendingRequests(requests.length);
            // Count active clock-ins today
            const todayEntries = await getTimeEntries({ dateFrom: todayStr(), dateTo: todayStr() });
            setActiveClockins(todayEntries.filter(e => !e.clockOut).length);
          }
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
      setLoading(false);
    }
    load();
  }, [session]);

  const today = todayStr();
  const tomorrow = tomorrowStr();
  const overdueAssignments = assignments.filter(a => a.dueDate < today && a.status === 'active');
  const dueSoon = assignments.filter(a => (a.dueDate === today || a.dueDate === tomorrow) && a.status === 'active');
  const completedOrders = todayOrders.filter(o => o.completed).length;
  const availableDevices = devices.filter(d => d.status === 'Available').length;
  const assignedDevices = devices.filter(d => d.status === 'Assigned').length;

  // Device availability by type
  const deviceTypes = ['Holter Monitor', 'Ambulatory BP Monitor', 'MCT Monitor'] as const;
  const availability = deviceTypes.map(type => {
    const total = devices.filter(d => d.type === type).length;
    const avail = devices.filter(d => d.type === type && d.status === 'Available').length;
    return { type, total, available: avail };
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

        {loading ? (
          <p className="text-gray-400">Loading dashboard...</p>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="stat-card border-l-4 border-l-blue-500">
                <div className="text-2xl font-bold text-white">{todayOrders.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Today&apos;s Orders</div>
              </div>
              <div className="stat-card border-l-4 border-l-emerald-500">
                <div className="text-2xl font-bold text-white">{completedOrders}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Completed</div>
              </div>
              <div className="stat-card border-l-4 border-l-gray-500">
                <div className="text-2xl font-bold text-white">{devices.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Devices</div>
              </div>
              <div className="stat-card border-l-4 border-l-emerald-400">
                <div className="text-2xl font-bold text-white">{availableDevices}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Available</div>
              </div>
              <div className="stat-card border-l-4 border-l-red-500">
                <div className="text-2xl font-bold text-white">{overdueAssignments.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Overdue</div>
              </div>
              <div className="stat-card border-l-4 border-l-amber-500">
                <div className="text-2xl font-bold text-white">{waitlist.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">On Waitlist</div>
              </div>
            </div>

            {/* Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overdue Devices */}
              <div className="card">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                  Overdue Devices
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {overdueAssignments.length === 0 ? (
                    <p className="text-gray-600 text-sm italic text-center py-4">No overdue devices</p>
                  ) : (
                    overdueAssignments.map(a => (
                      <div key={a.id} className="bg-red-900/20 rounded-lg p-3">
                        <p className="text-sm font-medium text-white">{a.patientName}</p>
                        <p className="text-xs text-gray-400">{a.deviceType} - SN: {a.serialNumber}</p>
                        <p className="text-xs text-red-400">Due: {a.dueDate}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Due Soon */}
              <div className="card">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                  Due Today / Tomorrow
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dueSoon.length === 0 ? (
                    <p className="text-gray-600 text-sm italic text-center py-4">No devices due soon</p>
                  ) : (
                    dueSoon.map(a => (
                      <div key={a.id} className="bg-amber-900/20 rounded-lg p-3">
                        <p className="text-sm font-medium text-white">{a.patientName}</p>
                        <p className="text-xs text-gray-400">{a.deviceType} - SN: {a.serialNumber}</p>
                        <p className="text-xs text-amber-400">Due: {a.dueDate}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Device Availability */}
              <div className="card">
                <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                  Device Availability
                </h3>
                <div className="space-y-4">
                  {availability.map(a => (
                    <div key={a.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{a.type}</span>
                        <span className="text-gray-400">{a.available}/{a.total}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: a.total > 0 ? `${(a.available / a.total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* My Status (all roles) */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">My Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card border-l-4 border-l-cyan-500">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${clockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                    <div className="text-lg font-bold text-white">{clockedIn ? 'Clocked In' : 'Clocked Out'}</div>
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Clock Status</div>
                </div>
                <div className="stat-card border-l-4 border-l-indigo-500">
                  <div className="text-2xl font-bold text-white">{ptoBalance - ptoUsed}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">PTO Days Remaining</div>
                </div>
                <div className="stat-card border-l-4 border-l-purple-500">
                  <div className="text-2xl font-bold text-white">{ptoUsed} / {ptoBalance}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">PTO Used / Total</div>
                </div>
              </div>
            </div>

            {/* HR Overview (admin only) */}
            {(session?.role === 'admin' || session?.role === 'physician') && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">HR Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-card border-l-4 border-l-amber-400">
                    <div className="text-2xl font-bold text-white">{pendingVacations}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Pending Vacation Requests</div>
                  </div>
                  <div className="stat-card border-l-4 border-l-emerald-400">
                    <div className="text-2xl font-bold text-white">{activeClockins}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Active Clock-Ins Today</div>
                  </div>
                  <div className="stat-card border-l-4 border-l-orange-400">
                    <div className="text-2xl font-bold text-white">{pendingRequests}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Pending Employee Requests</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
