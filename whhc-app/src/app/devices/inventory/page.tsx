'use client';

import { useState, useEffect, FormEvent } from 'react';
import AppShell from '@/components/ui/AppShell';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { getAllDevices, addDevice, updateDevice, deleteDevice, onDevicesChange } from '@/lib/db';
import type { Device, DeviceType, DeviceStatus } from '@/types';

export default function InventoryPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);

  // Form fields
  const [formType, setFormType] = useState<DeviceType>('Holter Monitor');
  const [formSerial, setFormSerial] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    const unsub = onDevicesChange(setDevices);
    return unsub;
  }, []);

  const filtered = devices.filter(d => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  const openAdd = () => {
    setEditDevice(null);
    setFormType('Holter Monitor');
    setFormSerial('');
    setFormNotes('');
    setModalOpen(true);
  };

  const openEdit = (d: Device) => {
    setEditDevice(d);
    setFormType(d.type);
    setFormSerial(d.serialNumber);
    setFormNotes(d.notes);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editDevice) {
      await updateDevice(editDevice.id, { type: formType, serialNumber: formSerial, notes: formNotes });
    } else {
      await addDevice({ type: formType, serialNumber: formSerial, status: 'Available', notes: formNotes });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this device?')) {
      await deleteDevice(id);
    }
  };

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Device Inventory</h2>
          <button onClick={openAdd} className="btn-primary">+ Add Device</button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="select-field w-auto">
            <option value="all">All Types</option>
            <option value="Holter Monitor">Holter Monitor</option>
            <option value="Ambulatory BP Monitor">Ambulatory BP Monitor</option>
            <option value="MCT Monitor">MCT Monitor</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select-field w-auto">
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Device Type</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">No devices found</td></tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id}>
                    <td className="font-mono text-sm">{d.serialNumber}</td>
                    <td>{d.type}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>{d.assignedTo || '—'}</td>
                    <td className="text-gray-400 text-xs">{d.notes || '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)} className="btn-secondary !py-1 !px-2 !text-xs">Edit</button>
                        {d.status === 'Available' && (
                          <button onClick={() => handleDelete(d.id)} className="btn-danger !py-1 !px-2 !text-xs">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editDevice ? 'Edit Device' : 'Add New Device'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Device Type</label>
              <select value={formType} onChange={e => setFormType(e.target.value as DeviceType)} className="select-field" required>
                <option value="Holter Monitor">Holter Monitor</option>
                <option value="Ambulatory BP Monitor">Ambulatory BP Monitor</option>
                <option value="MCT Monitor">MCT Monitor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Serial Number</label>
              <input type="text" value={formSerial} onChange={e => setFormSerial(e.target.value)} className="input-field" required placeholder="Enter serial number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
              <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input-field" placeholder="Brand, model, condition..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Device</button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
