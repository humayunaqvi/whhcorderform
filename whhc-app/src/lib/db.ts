import { ref, push, get, set, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db, DB_PREFIX } from './firebase';
import type {
  Order, Device, DeviceAssignment, WaitlistEntry, Task, DeviceType,
  TimeEntry, VacationRequest, VacationStatus, TimeSlot, PayPeriod,
  Announcement, EmployeeRequest, RequestStatus, WriteUp,
  HRDocument, AnonymousFeedback,
} from '@/types';

// ============================================================
// Firebase Realtime Database storage
// All data is stored under the 'v2/' prefix
// ============================================================

function dbRef(path: string) {
  return ref(db, `${DB_PREFIX}/${path}`);
}

// ============================================================
// Orders
// ============================================================

export async function saveOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const newRef = push(dbRef('orders'));
  const id = newRef.key!;
  const data: Order = { ...order, id, createdAt: new Date().toISOString() };
  await set(newRef, data);
  return id;
}

export async function getOrdersByDate(date: string): Promise<Order[]> {
  const snap = await get(dbRef('orders'));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, Order>;
  return Object.values(all).filter(o => o.dateOfService === date);
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await get(dbRef('orders'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Order>);
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  await update(dbRef(`orders/${orderId}`), updates);
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await get(dbRef(`orders/${id}`));
  return snap.exists() ? (snap.val() as Order) : null;
}

export function onOrdersChange(date: string, callback: (orders: Order[]) => void): () => void {
  const unsub = onValue(dbRef('orders'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const all = snap.val() as Record<string, Order>;
    callback(Object.values(all).filter(o => o.dateOfService === date));
  }, (error) => {
    console.error('Firebase orders read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Tasks
// ============================================================

export async function saveTasks(tasks: Omit<Task, 'id' | 'createdAt'>[]): Promise<void> {
  for (const task of tasks) {
    const newRef = push(dbRef('tasks'));
    const id = newRef.key!;
    await set(newRef, { ...task, id, createdAt: new Date().toISOString() });
  }
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const snap = await get(dbRef('tasks'));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, Task>;
  return Object.values(all).filter(t => t.dateOfService === date);
}

export async function toggleTaskComplete(taskId: string, completed: boolean, completedBy?: string): Promise<void> {
  await update(dbRef(`tasks/${taskId}`), {
    completed,
    completedBy: completed ? completedBy : null,
    completedAt: completed ? new Date().toISOString() : null,
  });
}

export function onTasksChange(date: string, callback: (tasks: Task[]) => void): () => void {
  const unsub = onValue(dbRef('tasks'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const all = snap.val() as Record<string, Task>;
    callback(Object.values(all).filter(t => t.dateOfService === date));
  }, (error) => {
    console.error('Firebase tasks read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Devices
// ============================================================

export async function addDevice(device: Omit<Device, 'id' | 'createdAt'>): Promise<string> {
  const newRef = push(dbRef('devices'));
  const id = newRef.key!;
  await set(newRef, { ...device, id, createdAt: new Date().toISOString() });
  return id;
}

export async function getAllDevices(): Promise<Device[]> {
  const snap = await get(dbRef('devices'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Device>);
}

export async function getAvailableDevices(type?: DeviceType): Promise<Device[]> {
  const devices = await getAllDevices();
  return devices.filter(d => d.status === 'Available' && (!type || d.type === type));
}

export async function updateDevice(deviceId: string, updates: Partial<Device>): Promise<void> {
  // Replace undefined values with null for Firebase
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(updates)) {
    cleaned[k] = v === undefined ? null : v;
  }
  await update(dbRef(`devices/${deviceId}`), cleaned);
}

export async function deleteDevice(deviceId: string): Promise<void> {
  await remove(dbRef(`devices/${deviceId}`));
}

export function onDevicesChange(callback: (devices: Device[]) => void): () => void {
  const unsub = onValue(dbRef('devices'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, Device>));
  }, (error) => {
    console.error('Firebase devices read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Device Assignments
// ============================================================

export async function createAssignment(assignment: Omit<DeviceAssignment, 'id' | 'createdAt'>): Promise<string> {
  const newRef = push(dbRef('assignments'));
  const id = newRef.key!;
  await set(newRef, { ...assignment, id, createdAt: new Date().toISOString() });

  // Update device status
  await updateDevice(assignment.deviceId, {
    status: 'Assigned',
    assignedTo: assignment.patientName,
  });

  return id;
}

export async function getActiveAssignments(): Promise<DeviceAssignment[]> {
  const snap = await get(dbRef('assignments'));
  if (!snap.exists()) return [];
  const all = snap.val() as Record<string, DeviceAssignment>;
  return Object.values(all).filter(a => a.status === 'active' || a.status === 'overdue');
}

export async function getAllAssignments(): Promise<DeviceAssignment[]> {
  const snap = await get(dbRef('assignments'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, DeviceAssignment>);
}

export async function returnDevice(
  assignmentId: string,
  deviceId: string,
  returnDate: string,
  returnCondition: 'Good' | 'Needs Maintenance' | 'Damaged',
  returnNotes?: string
): Promise<void> {
  await update(dbRef(`assignments/${assignmentId}`), {
    status: 'returned',
    returnDate,
    returnCondition,
    returnNotes: returnNotes || '',
  });

  await updateDevice(deviceId, {
    status: returnCondition === 'Needs Maintenance' || returnCondition === 'Damaged' ? 'Maintenance' : 'Available',
    assignedTo: undefined,
  });
}

export function onAssignmentsChange(callback: (assignments: DeviceAssignment[]) => void): () => void {
  const unsub = onValue(dbRef('assignments'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, DeviceAssignment>));
  }, (error) => {
    console.error('Firebase assignments read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Waitlist
// ============================================================

export async function addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'position'>): Promise<string> {
  const existing = await getWaitlist();
  const maxPos = existing.length > 0 ? Math.max(...existing.map(e => e.position)) : 0;

  const newRef = push(dbRef('waitlist'));
  const id = newRef.key!;
  await set(newRef, {
    ...entry,
    id,
    position: maxPos + 1,
    addedAt: new Date().toISOString(),
  });
  return id;
}

export async function getWaitlist(): Promise<WaitlistEntry[]> {
  const snap = await get(dbRef('waitlist'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, WaitlistEntry>).sort((a, b) => a.position - b.position);
}

export async function removeFromWaitlist(entryId: string): Promise<void> {
  await remove(dbRef(`waitlist/${entryId}`));
}

export function onWaitlistChange(callback: (entries: WaitlistEntry[]) => void): () => void {
  const unsub = onValue(dbRef('waitlist'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, WaitlistEntry>).sort((a, b) => a.position - b.position));
  }, (error) => {
    console.error('Firebase waitlist read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Time Entries (Clock In/Out)
// ============================================================

export async function clockIn(userId: string, username: string, displayName: string): Promise<string> {
  const now = new Date().toISOString();
  const date = now.slice(0, 10);
  const newRef = push(dbRef('timeEntries'));
  const id = newRef.key!;
  const entry: TimeEntry = {
    id, userId, username, displayName,
    clockIn: now,
    totalBreakMinutes: 0,
    date,
    createdAt: now,
  };
  await set(newRef, entry);
  return id;
}

export async function clockOut(entryId: string): Promise<void> {
  const snap = await get(dbRef(`timeEntries/${entryId}`));
  if (!snap.exists()) return;
  const entry = snap.val() as TimeEntry;

  const now = new Date();
  const nowIso = now.toISOString();
  const clockInMs = new Date(entry.clockIn).getTime();
  const clockOutMs = now.getTime();
  const totalMs = clockOutMs - clockInMs;

  // If user clocks out while still on break, finalize the ongoing break
  let totalBreakMin = entry.totalBreakMinutes || 0;
  if (entry.breakStart) {
    const ongoingBreakMs = clockOutMs - new Date(entry.breakStart).getTime();
    totalBreakMin += ongoingBreakMs / (1000 * 60);
  }

  const totalHours = (totalMs / (1000 * 60 * 60)) - (totalBreakMin / 60);

  await update(dbRef(`timeEntries/${entryId}`), {
    clockOut: nowIso,
    totalHours: Math.max(0, totalHours),
    totalBreakMinutes: totalBreakMin,
    breakStart: null,
    breakEnd: entry.breakStart ? nowIso : (entry.breakEnd || null),
  });
}

export async function startBreak(entryId: string): Promise<void> {
  await update(dbRef(`timeEntries/${entryId}`), { breakStart: new Date().toISOString() });
}

export async function endBreak(entryId: string): Promise<void> {
  const snap = await get(dbRef(`timeEntries/${entryId}`));
  if (!snap.exists()) return;
  const entry = snap.val() as TimeEntry;
  if (!entry.breakStart) return;

  const breakMs = new Date().getTime() - new Date(entry.breakStart).getTime();
  const breakMin = breakMs / (1000 * 60);

  await update(dbRef(`timeEntries/${entryId}`), {
    breakStart: null,
    breakEnd: new Date().toISOString(),
    totalBreakMinutes: (entry.totalBreakMinutes || 0) + breakMin,
  });
}

export async function getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
  const snap = await get(dbRef('timeEntries'));
  if (!snap.exists()) return null;
  const all = snap.val() as Record<string, TimeEntry>;
  return Object.values(all).find(e => e.userId === userId && !e.clockOut) || null;
}

export async function getTimeEntries(filters?: { userId?: string; dateFrom?: string; dateTo?: string }): Promise<TimeEntry[]> {
  const snap = await get(dbRef('timeEntries'));
  if (!snap.exists()) return [];
  let entries = Object.values(snap.val() as Record<string, TimeEntry>);
  if (filters?.userId) entries = entries.filter(e => e.userId === filters.userId);
  if (filters?.dateFrom) entries = entries.filter(e => e.date >= filters.dateFrom!);
  if (filters?.dateTo) entries = entries.filter(e => e.date <= filters.dateTo!);
  return entries.sort((a, b) => b.clockIn.localeCompare(a.clockIn));
}

export async function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<void> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(updates)) {
    cleaned[k] = v === undefined ? null : v;
  }
  await update(dbRef(`timeEntries/${entryId}`), cleaned);
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  await remove(dbRef(`timeEntries/${entryId}`));
}

export async function addManualTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>): Promise<string> {
  const newRef = push(dbRef('timeEntries'));
  const id = newRef.key!;
  await set(newRef, { ...entry, id, createdAt: new Date().toISOString() });
  return id;
}

export function onTimeEntriesChange(callback: (entries: TimeEntry[]) => void): () => void {
  const unsub = onValue(dbRef('timeEntries'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, TimeEntry>));
  }, (error) => {
    console.error('Firebase time entries read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Vacation Requests
// ============================================================

export async function createVacationRequest(req: Omit<VacationRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const newRef = push(dbRef('vacations'));
  const id = newRef.key!;
  await set(newRef, { ...req, id, status: 'pending', createdAt: new Date().toISOString() });
  return id;
}

export async function getVacationRequests(filters?: { userId?: string; status?: VacationStatus }): Promise<VacationRequest[]> {
  const snap = await get(dbRef('vacations'));
  if (!snap.exists()) return [];
  let requests = Object.values(snap.val() as Record<string, VacationRequest>);
  if (filters?.userId) requests = requests.filter(r => r.userId === filters.userId);
  if (filters?.status) requests = requests.filter(r => r.status === filters.status);
  return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateVacationStatus(
  requestId: string,
  status: VacationStatus,
  reviewedBy: string,
  reviewNote?: string
): Promise<void> {
  await update(dbRef(`vacations/${requestId}`), {
    status,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
    reviewNote: reviewNote || null,
  });
}

export async function logSameDayPto(params: {
  userId: string;
  username: string;
  displayName: string;
  date: string;
  timeSlot: TimeSlot;
  ptoStartTime?: string;
  ptoEndTime?: string;
  reason: string;
  countAsPto: boolean;
}): Promise<string> {
  const newRef = push(dbRef('vacations'));
  const id = newRef.key!;
  await set(newRef, {
    id,
    userId: params.userId,
    username: params.username,
    displayName: params.displayName,
    startDate: params.date,
    endDate: params.date,
    timeSlot: params.timeSlot,
    ptoStartTime: params.ptoStartTime || null,
    ptoEndTime: params.ptoEndTime || null,
    reason: params.reason,
    countAsPto: params.countAsPto,
    status: 'approved',
    source: 'same_day',
    createdAt: new Date().toISOString(),
  });

  // Update PTO balance
  if (params.countAsPto) {
    const { getUserData, updateUser } = await import('./auth');
    const userData = await getUserData(params.username);
    if (userData) {
      const days = params.timeSlot === 'full_day' ? 1 : 0.5;
      const currentUsed = userData.ptoUsed || 0;
      await updateUser(params.username, { ptoUsed: currentUsed + days });
    }
  }

  return id;
}

export async function updateVacationRequest(
  requestId: string,
  updates: Partial<Pick<VacationRequest, 'ptoStartTime' | 'ptoEndTime' | 'reason' | 'countAsPto' | 'timeSlot' | 'startDate' | 'endDate'>>
): Promise<void> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(updates)) {
    cleaned[k] = v === undefined ? null : v;
  }
  await update(dbRef(`vacations/${requestId}`), cleaned);
}

export async function deleteVacationRequest(requestId: string): Promise<void> {
  const snap = await get(dbRef(`vacations/${requestId}`));
  if (!snap.exists()) return;
  const req = snap.val() as VacationRequest;

  // Refund PTO balance if it was counted
  if (req.countAsPto && req.status === 'approved') {
    const { getUserData, updateUser } = await import('./auth');
    const userData = await getUserData(req.username);
    if (userData) {
      const days = req.timeSlot === 'full_day' ? 1 : 0.5;
      const currentUsed = userData.ptoUsed || 0;
      await updateUser(req.username, { ptoUsed: Math.max(0, currentUsed - days) });
    }
  }

  await remove(dbRef(`vacations/${requestId}`));
}

export function onVacationsChange(callback: (requests: VacationRequest[]) => void): () => void {
  const unsub = onValue(dbRef('vacations'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, VacationRequest>));
  }, (error) => {
    console.error('Firebase vacations read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Pay Periods
// ============================================================

export async function closePayPeriod(startDate: string, endDate: string, closedBy: string): Promise<string> {
  const entries = await getTimeEntries({ dateFrom: startDate, dateTo: endDate });

  // Build summary by user
  const summary: PayPeriod['summary'] = {};
  for (const entry of entries) {
    if (!entry.clockOut) continue;
    if (!summary[entry.userId]) {
      summary[entry.userId] = { totalHours: 0, totalBreakMinutes: 0, entries: 0, ptoHours: 0, ptoEntries: 0 };
    }
    summary[entry.userId].totalHours += entry.totalHours || 0;
    summary[entry.userId].totalBreakMinutes += entry.totalBreakMinutes || 0;
    summary[entry.userId].entries += 1;
  }

  // Include approved PTO
  const allPto = await getVacationRequests({ status: 'approved' });
  const periodPto = allPto.filter(p => p.startDate >= startDate && p.startDate <= endDate && p.countAsPto);
  for (const pto of periodPto) {
    if (!summary[pto.userId]) {
      summary[pto.userId] = { totalHours: 0, totalBreakMinutes: 0, entries: 0, ptoHours: 0, ptoEntries: 0 };
    }
    let ptoHrs = 0;
    if (pto.timeSlot === 'full_day') {
      ptoHrs = 8;
    } else if (pto.ptoStartTime && pto.ptoEndTime) {
      const [sh, sm] = pto.ptoStartTime.split(':').map(Number);
      const [eh, em] = pto.ptoEndTime.split(':').map(Number);
      ptoHrs = (eh + em / 60) - (sh + sm / 60);
    } else {
      ptoHrs = 4;
    }
    summary[pto.userId].ptoHours = (summary[pto.userId].ptoHours || 0) + ptoHrs;
    summary[pto.userId].ptoEntries = (summary[pto.userId].ptoEntries || 0) + 1;
  }

  const newRef = push(dbRef('payPeriods'));
  const id = newRef.key!;
  await set(newRef, { id, startDate, endDate, closedBy, closedAt: new Date().toISOString(), summary });
  return id;
}

export async function getPayPeriods(): Promise<PayPeriod[]> {
  const snap = await get(dbRef('payPeriods'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, PayPeriod>).sort((a, b) => b.closedAt.localeCompare(a.closedAt));
}

export async function getPayrollReport(startDate: string, endDate: string): Promise<{
  entries: TimeEntry[];
  ptoEntries: VacationRequest[];
  summaryByUser: Record<string, { displayName: string; totalHours: number; totalBreakMinutes: number; entries: number; ptoHours: number; ptoEntries: number }>;
}> {
  const entries = await getTimeEntries({ dateFrom: startDate, dateTo: endDate });
  const summaryByUser: Record<string, { displayName: string; totalHours: number; totalBreakMinutes: number; entries: number; ptoHours: number; ptoEntries: number }> = {};

  for (const entry of entries) {
    if (!entry.clockOut) continue;
    if (!summaryByUser[entry.userId]) {
      summaryByUser[entry.userId] = { displayName: entry.displayName, totalHours: 0, totalBreakMinutes: 0, entries: 0, ptoHours: 0, ptoEntries: 0 };
    }
    summaryByUser[entry.userId].totalHours += entry.totalHours || 0;
    summaryByUser[entry.userId].totalBreakMinutes += entry.totalBreakMinutes || 0;
    summaryByUser[entry.userId].entries += 1;
  }

  const allPto = await getVacationRequests({ status: 'approved' });
  const periodPto = allPto.filter(p => p.startDate >= startDate && p.startDate <= endDate && p.countAsPto);

  for (const pto of periodPto) {
    if (!summaryByUser[pto.userId]) {
      summaryByUser[pto.userId] = { displayName: pto.displayName, totalHours: 0, totalBreakMinutes: 0, entries: 0, ptoHours: 0, ptoEntries: 0 };
    }
    let ptoHrs = 0;
    if (pto.timeSlot === 'full_day') {
      ptoHrs = 8;
    } else if (pto.ptoStartTime && pto.ptoEndTime) {
      const [sh, sm] = pto.ptoStartTime.split(':').map(Number);
      const [eh, em] = pto.ptoEndTime.split(':').map(Number);
      ptoHrs = (eh + em / 60) - (sh + sm / 60);
    } else {
      ptoHrs = 4;
    }
    summaryByUser[pto.userId].ptoHours += ptoHrs;
    summaryByUser[pto.userId].ptoEntries += 1;
  }

  return { entries: entries.filter(e => !!e.clockOut), ptoEntries: periodPto, summaryByUser };
}

// ============================================================
// Announcements
// ============================================================

export async function createAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
  const newRef = push(dbRef('announcements'));
  const id = newRef.key!;
  await set(newRef, { ...ann, id, createdAt: new Date().toISOString() });
  return id;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const snap = await get(dbRef('announcements'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Announcement>).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
  await update(dbRef(`announcements/${id}`), updates);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await remove(dbRef(`announcements/${id}`));
}

export function onAnnouncementsChange(callback: (items: Announcement[]) => void): () => void {
  const unsub = onValue(dbRef('announcements'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, Announcement>).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, (error) => {
    console.error('Firebase announcements read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Employee Requests
// ============================================================

export async function createEmployeeRequest(req: Omit<EmployeeRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const newRef = push(dbRef('employeeRequests'));
  const id = newRef.key!;
  await set(newRef, { ...req, id, status: 'pending', createdAt: new Date().toISOString() });
  return id;
}

export async function getEmployeeRequests(filters?: { userId?: string; status?: RequestStatus }): Promise<EmployeeRequest[]> {
  const snap = await get(dbRef('employeeRequests'));
  if (!snap.exists()) return [];
  let requests = Object.values(snap.val() as Record<string, EmployeeRequest>);
  if (filters?.userId) requests = requests.filter(r => r.userId === filters.userId);
  if (filters?.status) requests = requests.filter(r => r.status === filters.status);
  return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateEmployeeRequest(id: string, updates: Partial<EmployeeRequest>): Promise<void> {
  await update(dbRef(`employeeRequests/${id}`), updates);
}

export function onEmployeeRequestsChange(callback: (items: EmployeeRequest[]) => void): () => void {
  const unsub = onValue(dbRef('employeeRequests'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, EmployeeRequest>));
  }, (error) => {
    console.error('Firebase employee requests read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Write-Ups
// ============================================================

export async function createWriteUp(wu: Omit<WriteUp, 'id' | 'createdAt'>): Promise<string> {
  const newRef = push(dbRef('writeups'));
  const id = newRef.key!;
  await set(newRef, { ...wu, id, createdAt: new Date().toISOString() });
  return id;
}

export async function getWriteUps(employeeId?: string): Promise<WriteUp[]> {
  const snap = await get(dbRef('writeups'));
  if (!snap.exists()) return [];
  let items = Object.values(snap.val() as Record<string, WriteUp>);
  if (employeeId) items = items.filter(w => w.employeeId === employeeId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getWriteUp(id: string): Promise<WriteUp | null> {
  const snap = await get(dbRef(`writeups/${id}`));
  return snap.exists() ? (snap.val() as WriteUp) : null;
}

export function onWriteUpsChange(callback: (items: WriteUp[]) => void): () => void {
  const unsub = onValue(dbRef('writeups'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, WriteUp>));
  }, (error) => {
    console.error('Firebase writeups read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// HR Documents
// ============================================================

export async function uploadDocument(doc: Omit<HRDocument, 'id' | 'createdAt'>): Promise<string> {
  const newRef = push(dbRef('documents'));
  const id = newRef.key!;
  await set(newRef, { ...doc, id, createdAt: new Date().toISOString() });
  return id;
}

export async function getDocuments(category?: string): Promise<HRDocument[]> {
  const snap = await get(dbRef('documents'));
  if (!snap.exists()) return [];
  let items = Object.values(snap.val() as Record<string, HRDocument>);
  if (category) items = items.filter(d => d.category === category);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteDocument(id: string): Promise<void> {
  await remove(dbRef(`documents/${id}`));
}

export function onDocumentsChange(callback: (items: HRDocument[]) => void): () => void {
  const unsub = onValue(dbRef('documents'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, HRDocument>));
  }, (error) => {
    console.error('Firebase documents read error:', error);
    callback([]);
  });
  return unsub;
}

// ============================================================
// Anonymous Feedback
// ============================================================

export async function submitFeedback(message: string, category: string): Promise<string> {
  const newRef = push(dbRef('feedback'));
  const id = newRef.key!;
  await set(newRef, { id, message, category, createdAt: new Date().toISOString() });
  return id;
}

export async function getFeedback(): Promise<AnonymousFeedback[]> {
  const snap = await get(dbRef('feedback'));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, AnonymousFeedback>).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function onFeedbackChange(callback: (items: AnonymousFeedback[]) => void): () => void {
  const unsub = onValue(dbRef('feedback'), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    callback(Object.values(snap.val() as Record<string, AnonymousFeedback>));
  }, (error) => {
    console.error('Firebase feedback read error:', error);
    callback([]);
  });
  return unsub;
}
