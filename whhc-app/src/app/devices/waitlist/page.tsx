'use client';

import { useState, useEffect, FormEvent } from 'react';
import AppShell from '@/components/ui/AppShell';
import Modal from '@/components/ui/Modal';
import { onWaitlistChange, addToWaitlist, removeFromWaitlist } from '@/lib/db';
import type { WaitlistEntry, DeviceType } from '@/types';

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mrn, setMrn] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('Holter Monitor');
  const [duration, setDuration] = useState<number | undefined>();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const unsub = onWaitlistChange(setEntries);
    return unsub;
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await addToWaitlist({
      patientName: name,
      patientPhone: phone,
      patientMRN: mrn,
      deviceType,
      studyDuration: duration,
      notes,
    });
    setModalOpen(false);
    setName(''); setPhone(''); setMrn(''); setNotes('');
  };

  const handleRemove = async (id: string) => {
    if (confirm('Remove this patient from the waitlist?')) {
      await removeFromWaitlist(id);
    }
  };

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Patient Waitlist</h2>
          <button onClick={() => setModalOpen(true)} className="btn-primary">+ Add to Waitlist</button>
        </div>

        <div className="card overflow-x-auto !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>MRN</th>
                <th>Device Type</th>
                <th>Duration</th>
                <th>Date Added</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-8">No patients on waitlist</td></tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td className="font-medium">{e.patientName}</td>
                    <td>{e.patientMRN || '—'}</td>
                    <td>{e.deviceType}</td>
                    <td>{e.studyDuration ? `${e.studyDuration} days` : '—'}</td>
                    <td>{new Date(e.addedAt).toLocaleDateString()}</td>
                    <td className="text-gray-400 text-xs">{e.notes || '—'}</td>
                    <td>
                      <button onClick={() => handleRemove(e.id)} className="btn-danger !py-1 !px-2 !text-xs">Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Patient to Waitlist">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Patient Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">MRN</label>
                <input type="text" value={mrn} onChange={e => setMrn(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Device Type *</label>
                <select value={deviceType} onChange={e => setDeviceType(e.target.value as DeviceType)} className="select-field" required>
                  <option value="Holter Monitor">Holter Monitor</option>
                  <option value="Ambulatory BP Monitor">Ambulatory BP Monitor</option>
                  <option value="MCT Monitor">MCT Monitor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Duration (days)</label>
                <input type="number" value={duration || ''} onChange={e => setDuration(parseInt(e.target.value) || undefined)} min={1} max={90} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add to Waitlist</button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
