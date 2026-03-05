'use client';

import { useState, useEffect, FormEvent } from 'react';
import AppShell from '@/components/ui/AppShell';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { onAssignmentsChange, returnDevice, getAvailableDevices, createAssignment } from '@/lib/db';
import type { DeviceAssignment, Device, DeviceType } from '@/types';

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<DeviceAssignment[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Return modal
  const [returnModal, setReturnModal] = useState(false);
  const [returning, setReturning] = useState<DeviceAssignment | null>(null);
  const [returnDate, setReturnDate] = useState(todayStr());
  const [returnCondition, setReturnCondition] = useState<'Good' | 'Needs Maintenance' | 'Damaged'>('Good');
  const [returnNotes, setReturnNotes] = useState('');

  // New assignment modal
  const [assignModal, setAssignModal] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [aPatientName, setAPatientName] = useState('');
  const [aPatientPhone, setAPatientPhone] = useState('');
  const [aPatientMRN, setAPatientMRN] = useState('');
  const [aDeviceType, setADeviceType] = useState<DeviceType>('Holter Monitor');
  const [aDuration, setADuration] = useState(1);
  const [aDeviceId, setADeviceId] = useState('');
  const [aAssignDate, setAAssignDate] = useState(todayStr());
  const [aNotes, setANotes] = useState('');

  useEffect(() => {
    const unsub = onAssignmentsChange((all) => {
      setAssignments(all.filter(a => a.status !== 'returned'));
    });
    return unsub;
  }, []);

  // Load available devices when type changes
  useEffect(() => {
    getAvailableDevices(aDeviceType).then(setAvailableDevices);
  }, [aDeviceType]);

  const today = todayStr();
  const filtered = assignments.filter(a => {
    if (filter === 'active' && a.dueDate >= today) return true;
    if (filter === 'overdue' && a.dueDate < today) return true;
    if (filter === 'all') return true;
    return false;
  }).filter(a => {
    if (typeFilter !== 'all' && a.deviceType !== typeFilter) return false;
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openReturn = (a: DeviceAssignment) => {
    setReturning(a);
    setReturnDate(todayStr());
    setReturnCondition('Good');
    setReturnNotes('');
    setReturnModal(true);
  };

  const handleReturn = async (e: FormEvent) => {
    e.preventDefault();
    if (!returning) return;
    await returnDevice(returning.id, returning.deviceId, returnDate, returnCondition, returnNotes);
    setReturnModal(false);
  };

  const handleNewAssignment = async (e: FormEvent) => {
    e.preventDefault();
    const device = availableDevices.find(d => d.id === aDeviceId);
    if (!device) return;

    await createAssignment({
      deviceId: device.id,
      deviceType: aDeviceType,
      serialNumber: device.serialNumber,
      patientName: aPatientName,
      patientPhone: aPatientPhone,
      patientMRN: aPatientMRN,
      studyDuration: aDuration,
      assignDate: aAssignDate,
      dueDate: addDays(aAssignDate, aDuration + 1),
      notes: aNotes,
      status: 'active',
    });
    setAssignModal(false);
    setAPatientName('');
    setAPatientPhone('');
    setAPatientMRN('');
    setANotes('');
  };

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Active Assignments</h2>
          <button onClick={() => setAssignModal(true)} className="btn-primary">+ Assign Device</button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={filter} onChange={e => setFilter(e.target.value as any)} className="select-field w-auto">
            <option value="all">All Active & Overdue</option>
            <option value="active">Active Only</option>
            <option value="overdue">Overdue Only</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="select-field w-auto">
            <option value="all">All Types</option>
            <option value="Holter Monitor">Holter Monitor</option>
            <option value="Ambulatory BP Monitor">Ambulatory BP Monitor</option>
            <option value="MCT Monitor">MCT Monitor</option>
          </select>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field w-auto min-w-[200px]" placeholder="Search patient..." />
        </div>

        {/* Table */}
        <div className="card overflow-x-auto !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>MRN</th>
                <th>Device Type</th>
                <th>Serial #</th>
                <th>Assigned</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-8">No active assignments</td></tr>
              ) : (
                filtered.map(a => {
                  const isOverdue = a.dueDate < today;
                  return (
                    <tr key={a.id} className={isOverdue ? 'bg-red-900/10' : ''}>
                      <td className="font-medium">{a.patientName}</td>
                      <td>{a.patientMRN || '—'}</td>
                      <td>{a.deviceType}</td>
                      <td className="font-mono text-xs">{a.serialNumber}</td>
                      <td>{a.assignDate}</td>
                      <td className={isOverdue ? 'text-red-400 font-medium' : ''}>{a.dueDate}</td>
                      <td><StatusBadge status={isOverdue ? 'overdue' : 'active'} /></td>
                      <td>
                        <button onClick={() => openReturn(a)} className="btn-success !py-1 !px-3 !text-xs">Return</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Return Modal */}
        <Modal open={returnModal} onClose={() => setReturnModal(false)} title="Return Device">
          {returning && (
            <form onSubmit={handleReturn} className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-3 text-sm">
                <p><strong className="text-gray-300">Patient:</strong> {returning.patientName}</p>
                <p><strong className="text-gray-300">Device:</strong> {returning.deviceType} - {returning.serialNumber}</p>
                <p><strong className="text-gray-300">Due:</strong> {returning.dueDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Return Date</label>
                <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Device Condition</label>
                <select value={returnCondition} onChange={e => setReturnCondition(e.target.value as any)} className="select-field">
                  <option value="Good">Good</option>
                  <option value="Needs Maintenance">Needs Maintenance</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                <textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} className="input-field" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setReturnModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm Return</button>
              </div>
            </form>
          )}
        </Modal>

        {/* New Assignment Modal */}
        <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Device to Patient" maxWidth="max-w-xl">
          <form onSubmit={handleNewAssignment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Patient Name *</label>
                <input type="text" value={aPatientName} onChange={e => setAPatientName(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" value={aPatientPhone} onChange={e => setAPatientPhone(e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">MRN / Patient ID</label>
              <input type="text" value={aPatientMRN} onChange={e => setAPatientMRN(e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Device Type *</label>
                <select value={aDeviceType} onChange={e => setADeviceType(e.target.value as DeviceType)} className="select-field">
                  <option value="Holter Monitor">Holter Monitor</option>
                  <option value="Ambulatory BP Monitor">Ambulatory BP Monitor</option>
                  <option value="MCT Monitor">MCT Monitor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Study Duration (days) *</label>
                <input type="number" value={aDuration} onChange={e => setADuration(parseInt(e.target.value) || 1)} min={1} max={90} className="input-field" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Assignment Date *</label>
                <input type="date" value={aAssignDate} onChange={e => setAAssignDate(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                <input type="text" value={addDays(aAssignDate, aDuration + 1)} className="input-field bg-gray-800 text-gray-500" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Select Device *</label>
              <select value={aDeviceId} onChange={e => setADeviceId(e.target.value)} className="select-field" required>
                <option value="">Select a device...</option>
                {availableDevices.map(d => (
                  <option key={d.id} value={d.id}>{d.serialNumber} - {d.type}</option>
                ))}
              </select>
              {availableDevices.length === 0 && (
                <p className="text-amber-400 text-xs mt-1">No devices of this type are available. Consider adding to waitlist.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
              <textarea value={aNotes} onChange={e => setANotes(e.target.value)} className="input-field" rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAssignModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={!aDeviceId} className="btn-primary">Assign Device</button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
