'use client';

import { useState, useEffect, FormEvent } from 'react';
import AppShell from '@/components/ui/AppShell';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { getAllUsers, addUser, deleteUser, changePassword, updateUser, getUserData } from '@/lib/auth';
import type { User, UserRole } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  physician: 'Physician',
  admin: 'Admin',
  clinical: 'Clinical Coordinator',
  staff: 'Staff',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Add user form
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [ptoBalance, setPtoBalance] = useState('15');
  const [error, setError] = useState('');

  // Change password form
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');

  // Edit user form
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('staff');
  const [editPhone, setEditPhone] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editYearsExperience, setEditYearsExperience] = useState('');
  const [editPtoBalance, setEditPtoBalance] = useState('');
  const [editPtoUsed, setEditPtoUsed] = useState('');

  const loadUsers = async () => {
    const u = await getAllUsers();
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPw) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    const success = await addUser(username, displayName, password, role);
    if (success) {
      // Update HR fields
      await updateUser(username.toLowerCase(), {
        phone: phone || undefined,
        dateOfBirth: dateOfBirth || undefined,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
        ptoBalance: ptoBalance ? parseInt(ptoBalance) : 15,
        ptoUsed: 0,
        ptoYear: new Date().getFullYear(),
      });
      setModalOpen(false);
      setUsername(''); setDisplayName(''); setPassword(''); setConfirmPw('');
      setPhone(''); setDateOfBirth(''); setYearsExperience(''); setPtoBalance('15');
      loadUsers();
    } else {
      setError('Failed to add user');
    }
  };

  const handleDelete = async (u: User) => {
    if (u.username === 'naqvi@htxheart.com') { alert('Cannot delete the primary admin account.'); return; }
    if (confirm(`Delete user "${u.displayName}"?`)) {
      await deleteUser(u.username);
      loadUsers();
    }
  };

  const openPwModal = (u: User) => {
    setSelectedUser(u);
    setNewPw('');
    setConfirmNewPw('');
    setError('');
    setPwModal(true);
  };

  const openEditModal = async (u: User) => {
    setSelectedUser(u);
    setError('');
    // Load full user data including HR fields
    const fullData = await getUserData(u.username);
    setEditDisplayName(u.displayName);
    setEditRole(u.role);
    setEditPhone(fullData?.phone || '');
    setEditDateOfBirth(fullData?.dateOfBirth || '');
    setEditYearsExperience(fullData?.yearsExperience?.toString() || '');
    setEditPtoBalance(fullData?.ptoBalance?.toString() || '15');
    setEditPtoUsed(fullData?.ptoUsed?.toString() || '0');
    setEditModal(true);
  };

  const handleEditUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await updateUser(selectedUser.username, {
      displayName: editDisplayName,
      role: editRole,
      phone: editPhone || undefined,
      dateOfBirth: editDateOfBirth || undefined,
      yearsExperience: editYearsExperience ? parseInt(editYearsExperience) : undefined,
      ptoBalance: editPtoBalance ? parseInt(editPtoBalance) : undefined,
      ptoUsed: editPtoUsed ? parseInt(editPtoUsed) : undefined,
    });
    setEditModal(false);
    loadUsers();
  };

  const handleChangePw = async (e: FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmNewPw) { setError('Passwords do not match'); return; }
    if (!selectedUser) return;
    await changePassword(selectedUser.username, newPw);
    setPwModal(false);
  };

  return (
    <AppShell allowedRoles={['physician', 'admin']}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <button onClick={() => { setError(''); setModalOpen(true); }} className="btn-primary">+ Add User</button>
        </div>

        <div className="card overflow-x-auto !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Display Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Phone</th>
                <th>PTO</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-8">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-8">No users</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.username}>
                    <td className="font-medium">{u.displayName}</td>
                    <td className="font-mono text-sm">{u.username}</td>
                    <td><StatusBadge status={ROLE_LABELS[u.role] || u.role} /></td>
                    <td className="text-xs text-gray-400">{u.phone || '—'}</td>
                    <td className="text-xs text-gray-400">
                      {u.ptoBalance !== undefined ? `${u.ptoUsed || 0}/${u.ptoBalance}` : '—'}
                    </td>
                    <td className="text-xs text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="text-xs text-gray-400">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(u)} className="btn-secondary !py-1 !px-2 !text-xs">Edit</button>
                        <button onClick={() => openPwModal(u)} className="btn-secondary !py-1 !px-2 !text-xs">Change PW</button>
                        {u.username !== 'naqvi@htxheart.com' && (
                          <button onClick={() => handleDelete(u)} className="btn-danger !py-1 !px-2 !text-xs">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New User">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Name *</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="input-field" required placeholder="e.g., Dr. Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username *</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" required placeholder="e.g., dsmith" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password *</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="input-field" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role *</label>
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="select-field" required>
                  <option value="physician">Physician</option>
                  <option value="admin">Admin</option>
                  <option value="clinical">Clinical Coordinator</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="(555) 123-4567" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Years Experience</label>
                <input type="number" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">PTO Days/Year</label>
                <input type="number" value={ptoBalance} onChange={e => setPtoBalance(e.target.value)} className="input-field" min="0" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add User</button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit User - ${selectedUser?.displayName}`}>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                <input type="text" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)} className="select-field" required>
                  <option value="physician">Physician</option>
                  <option value="admin">Admin</option>
                  <option value="clinical">Clinical Coordinator</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="input-field" placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                <input type="date" value={editDateOfBirth} onChange={e => setEditDateOfBirth(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Years Experience</label>
                <input type="number" value={editYearsExperience} onChange={e => setEditYearsExperience(e.target.value)} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">PTO Balance</label>
                <input type="number" value={editPtoBalance} onChange={e => setEditPtoBalance(e.target.value)} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">PTO Used</label>
                <input type="number" value={editPtoUsed} onChange={e => setEditPtoUsed(e.target.value)} className="input-field" min="0" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>

        {/* Change Password Modal */}
        <Modal open={pwModal} onClose={() => setPwModal(false)} title={`Change Password - ${selectedUser?.displayName}`}>
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
              <input type="password" value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)} className="input-field" required />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPwModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Change Password</button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
