'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth-context';
import {
  getVacationRequests,
  updateVacationStatus,
  updateVacationRequest,
  deleteVacationRequest,
  logSameDayPto,
} from '@/lib/db';
import { updateUser, getUserData, getAllUsers } from '@/lib/auth';
import { formatDate, todayStr } from '@/lib/utils';
import type { VacationRequest, VacationStatus } from '@/types';

const STATUS_TABS: { label: string; value: VacationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Denied', value: 'denied' },
  { label: 'Cancelled', value: 'cancelled' },
];

const TIME_SLOT_LABELS: Record<string, string> = {
  full_day: 'Full Day',
  morning: 'Morning',
  afternoon: 'Afternoon',
};

function statusBadge(status: VacationStatus) {
  const styles: Record<VacationStatus, string> = {
    pending: 'bg-amber-900/30 text-amber-400 border border-amber-700/40',
    approved: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/40',
    denied: 'bg-red-900/30 text-red-400 border border-red-700/40',
    cancelled: 'bg-gray-800 text-gray-500 border border-gray-700/40',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function HRVacationsPage() {
  const { session } = useAuth();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VacationStatus | 'all'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  // Edit modal state
  const [editingReq, setEditingReq] = useState<VacationRequest | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editCountAsPto, setEditCountAsPto] = useState(true);
  const [editTimeSlot, setEditTimeSlot] = useState<string>('full_day');

  // Add manual PTO modal state
  const [showAddPto, setShowAddPto] = useState(false);
  const [addEmployee, setAddEmployee] = useState('');
  const [addDate, setAddDate] = useState(todayStr());
  const [addTimeSlot, setAddTimeSlot] = useState('full_day');
  const [addStartTime, setAddStartTime] = useState('13:00');
  const [addEndTime, setAddEndTime] = useState('17:00');
  const [addReason, setAddReason] = useState('');
  const [addCountAsPto, setAddCountAsPto] = useState(true);
  const [allUsers, setAllUsers] = useState<{ username: string; displayName: string; userId: string }[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await getVacationRequests();
      setRequests(all);
    } catch (err) {
      console.error('Failed to load vacation requests:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    getAllUsers().then(users => {
      setAllUsers(users.map(u => ({ username: u.username, displayName: u.displayName, userId: u.id })));
    });
  }, []);

  const filteredRequests = activeTab === 'all'
    ? requests
    : requests.filter(r => r.status === activeTab);

  const handleApprove = async (req: VacationRequest) => {
    if (!session) return;
    setProcessing(req.id);
    try {
      await updateVacationStatus(req.id, 'approved', session.displayName);

      // If countAsPto, update user PTO
      if (req.countAsPto) {
        const userData = await getUserData(req.username);
        if (userData) {
          const startDate = new Date(req.startDate + 'T00:00:00');
          const endDate = new Date(req.endDate + 'T00:00:00');
          const diffMs = endDate.getTime() - startDate.getTime();
          let days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
          if (req.timeSlot !== 'full_day') days = days * 0.5;

          const currentUsed = userData.ptoUsed || 0;
          await updateUser(req.username, { ptoUsed: currentUsed + days });
        }
      }

      loadData();
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
    setProcessing(null);
  };

  const handleDeny = async (req: VacationRequest) => {
    if (!session) return;
    setProcessing(req.id);
    try {
      await updateVacationStatus(req.id, 'denied', session.displayName);
      loadData();
    } catch (err) {
      console.error('Failed to deny request:', err);
    }
    setProcessing(null);
  };

  const openEdit = (req: VacationRequest) => {
    setEditingReq(req);
    setEditStartTime(req.ptoStartTime || '');
    setEditEndTime(req.ptoEndTime || '');
    setEditReason(req.reason);
    setEditCountAsPto(req.countAsPto);
    setEditTimeSlot(req.timeSlot);
  };

  const handleSaveEdit = async () => {
    if (!editingReq) return;
    setProcessing(editingReq.id);
    try {
      // If countAsPto changed, adjust PTO balance
      if (editingReq.countAsPto !== editCountAsPto && editingReq.status === 'approved') {
        const userData = await getUserData(editingReq.username);
        if (userData) {
          const days = editingReq.timeSlot === 'full_day' ? 1 : 0.5;
          const currentUsed = userData.ptoUsed || 0;
          if (editingReq.countAsPto && !editCountAsPto) {
            // Was counted, now not — refund
            await updateUser(editingReq.username, { ptoUsed: Math.max(0, currentUsed - days) });
          } else if (!editingReq.countAsPto && editCountAsPto) {
            // Was not counted, now is — deduct
            await updateUser(editingReq.username, { ptoUsed: currentUsed + days });
          }
        }
      }

      await updateVacationRequest(editingReq.id, {
        ptoStartTime: editTimeSlot === 'full_day' ? undefined : editStartTime || undefined,
        ptoEndTime: editTimeSlot === 'full_day' ? undefined : editEndTime || undefined,
        reason: editReason,
        countAsPto: editCountAsPto,
        timeSlot: editTimeSlot as 'full_day' | 'morning' | 'afternoon',
      });
      setEditingReq(null);
      loadData();
    } catch (err) {
      console.error('Failed to update request:', err);
    }
    setProcessing(null);
  };

  const handleDelete = async (req: VacationRequest) => {
    if (!confirm(`Delete this PTO entry for ${req.displayName}? This cannot be undone.`)) return;
    setProcessing(req.id);
    try {
      await deleteVacationRequest(req.id);
      loadData();
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
    setProcessing(null);
  };

  const handleAddPto = async () => {
    if (!addEmployee) return;
    const user = allUsers.find(u => u.username === addEmployee);
    if (!user) return;
    setProcessing('add');
    try {
      await logSameDayPto({
        userId: user.userId,
        username: user.username,
        displayName: user.displayName,
        date: addDate,
        timeSlot: addTimeSlot as 'full_day' | 'morning' | 'afternoon',
        ptoStartTime: addTimeSlot === 'full_day' ? undefined : addStartTime,
        ptoEndTime: addTimeSlot === 'full_day' ? undefined : addEndTime,
        reason: addReason || 'Admin-added PTO',
        countAsPto: addCountAsPto,
      });
      setShowAddPto(false);
      setAddEmployee('');
      setAddReason('');
      loadData();
    } catch (err) {
      console.error('Failed to add PTO:', err);
    }
    setProcessing(null);
  };

  return (
    <AppShell allowedRoles={['physician', 'admin']}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Vacation & PTO Management</h2>
          <button
            onClick={() => {
              setAddDate(todayStr());
              setAddTimeSlot('full_day');
              setAddStartTime('13:00');
              setAddEndTime('17:00');
              setAddReason('');
              setAddCountAsPto(true);
              setAddEmployee('');
              setShowAddPto(true);
            }}
            className="btn-primary !py-2 !px-4 !text-sm"
          >
            + Add PTO Entry
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800/50 rounded-lg p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.label}
              {tab.value === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Request Cards */}
        {loading ? (
          <p className="text-gray-400">Loading vacation requests...</p>
        ) : filteredRequests.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No {activeTab === 'all' ? '' : activeTab} vacation requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(req => (
              <div key={req.id} className="card">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">{req.displayName}</h3>
                      {statusBadge(req.status)}
                      {req.source === 'same_day' && (
                        <span className="bg-purple-900/30 text-purple-400 border border-purple-700/40 px-2 py-0.5 rounded text-xs font-medium">
                          Same-Day PTO
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>{' '}
                        <span className="text-gray-300">
                          {req.startDate === req.endDate
                            ? formatDate(req.startDate)
                            : `${formatDate(req.startDate)} — ${formatDate(req.endDate)}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time Slot:</span>{' '}
                        <span className="text-gray-300">{TIME_SLOT_LABELS[req.timeSlot] || req.timeSlot}</span>
                      </div>
                      {req.ptoStartTime && req.ptoEndTime && (
                        <div>
                          <span className="text-gray-500">PTO Hours:</span>{' '}
                          <span className="text-gray-300">{req.ptoStartTime} — {req.ptoEndTime}</span>
                        </div>
                      )}
                    </div>

                    {req.reason && (
                      <div className="text-sm">
                        <span className="text-gray-500">Reason:</span>{' '}
                        <span className="text-gray-300">{req.reason}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {req.countAsPto && (
                        <span className="bg-blue-900/30 text-blue-400 border border-blue-700/40 px-2 py-0.5 rounded">
                          Counts as PTO
                        </span>
                      )}
                      <span>Submitted: {formatDate(req.createdAt)}</span>
                      {req.reviewedBy && (
                        <span>Reviewed by: {req.reviewedBy}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={processing === req.id}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
                        >
                          {processing === req.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeny(req)}
                          disabled={processing === req.id}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                        >
                          {processing === req.id ? '...' : 'Deny'}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openEdit(req)}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(req)}
                      disabled={processing === req.id}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit PTO Modal */}
      <Modal open={!!editingReq} onClose={() => setEditingReq(null)} title="Edit PTO Entry">
        {editingReq && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              Editing PTO for <span className="text-white font-medium">{editingReq.displayName}</span> on {formatDate(editingReq.startDate)}
            </p>

            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Time Slot</label>
              <select
                value={editTimeSlot}
                onChange={(e) => setEditTimeSlot(e.target.value)}
                className="input-field w-full"
              >
                <option value="full_day">Full Day</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </div>

            {editTimeSlot !== 'full_day' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">PTO Start Time</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">PTO End Time</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Reason</label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="input-field w-full"
              />
            </div>

            <label className="flex items-center gap-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={editCountAsPto}
                onChange={(e) => setEditCountAsPto(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Count as PTO (deducts from balance)</span>
            </label>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditingReq(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={processing === editingReq.id}
                className="btn-primary !py-2 !px-5 disabled:opacity-50"
              >
                {processing === editingReq.id ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Add Manual PTO Modal */}
      <Modal open={showAddPto} onClose={() => setShowAddPto(false)} title="Add PTO Entry">
        <p className="text-gray-400 text-sm mb-4">
          Manually add a PTO entry for an employee.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Employee</label>
            <select
              value={addEmployee}
              onChange={(e) => setAddEmployee(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select employee...</option>
              {allUsers.map(u => (
                <option key={u.username} value={u.username}>{u.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Time Slot</label>
          <select
            value={addTimeSlot}
            onChange={(e) => setAddTimeSlot(e.target.value)}
            className="input-field w-full"
          >
            <option value="full_day">Full Day</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
        </div>

        {addTimeSlot !== 'full_day' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">PTO Start Time</label>
              <input
                type="time"
                value={addStartTime}
                onChange={(e) => setAddStartTime(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">PTO End Time</label>
              <input
                type="time"
                value={addEndTime}
                onChange={(e) => setAddEndTime(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
          <input
            type="text"
            value={addReason}
            onChange={(e) => setAddReason(e.target.value)}
            placeholder="e.g., Sick day, Personal"
            className="input-field w-full"
          />
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={addCountAsPto}
            onChange={(e) => setAddCountAsPto(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-gray-800"
          />
          <span className="text-sm text-gray-300">Count as PTO (deducts from balance)</span>
        </label>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowAddPto(false)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPto}
            disabled={processing === 'add' || !addEmployee}
            className="btn-primary !py-2 !px-5 disabled:opacity-50"
          >
            {processing === 'add' ? 'Adding...' : 'Add PTO Entry'}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
