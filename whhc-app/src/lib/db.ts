import type {
  Order, Device, DeviceAssignment, WaitlistEntry, Task, DeviceType,
  TimeEntry, VacationRequest, VacationStatus, TimeSlot, PayPeriod,
  Announcement, EmployeeRequest, RequestStatus, WriteUp,
  HRDocument, AnonymousFeedback,
} from '@/types';

// ============================================================
// localStorage-based storage for development
// Will switch to Firebase when deployed with proper DB rules
// ============================================================

const STORE_KEYS = {
  orders: 'whhc_v2_orders',
  tasks: 'whhc_v2_tasks',
  devices: 'whhc_v2_devices',
  assignments: 'whhc_v2_assignments',
  waitlist: 'whhc_v2_waitlist',
  // HR / Practice Management
  timeEntries: 'whhc_v2_time_entries',
  vacations: 'whhc_v2_vacations',
  payPeriods: 'whhc_v2_pay_periods',
  announcements: 'whhc_v2_announcements',
  employeeRequests: 'whhc_v2_employee_requests',
  writeups: 'whhc_v2_writeups',
  documents: 'whhc_v2_documents',
  feedback: 'whhc_v2_feedback',
};

function getStore<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStore<T>(key: string, data: Record<string, T>): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Change listeners
type Listener<T> = (items: T[]) => void;
const listeners: Record<string, Set<Listener<any>>> = {};

function notify(storeKey: string) {
  const set = listeners[storeKey];
  if (!set) return;
  const data = getStore(storeKey);
  const items = Object.values(data);
  set.forEach(cb => {
    try { cb(items); } catch { /* ignore */ }
  });
}

function subscribe<T>(storeKey: string, cb: Listener<T>): () => void {
  if (!listeners[storeKey]) listeners[storeKey] = new Set();
  listeners[storeKey].add(cb);
  return () => { listeners[storeKey]?.delete(cb); };
}

// ============================================================
// Orders
// ============================================================

export async function saveOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const id = genId();
  const data: Order = { ...order, id, createdAt: new Date().toISOString() };
  const store = getStore<Order>(STORE_KEYS.orders);
  store[id] = data;
  setStore(STORE_KEYS.orders, store);
  notify(STORE_KEYS.orders);
  return id;
}

export async function getOrdersByDate(date: string): Promise<Order[]> {
  const store = getStore<Order>(STORE_KEYS.orders);
  return Object.values(store).filter(o => o.dateOfService === date);
}

export async function getAllOrders(): Promise<Order[]> {
  return Object.values(getStore<Order>(STORE_KEYS.orders));
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  const store = getStore<Order>(STORE_KEYS.orders);
  if (store[orderId]) {
    store[orderId] = { ...store[orderId], ...updates };
    setStore(STORE_KEYS.orders, store);
    notify(STORE_KEYS.orders);
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const store = getStore<Order>(STORE_KEYS.orders);
  return store[id] || null;
}

export function onOrdersChange(date: string, callback: (orders: Order[]) => void): () => void {
  // Initial call
  getOrdersByDate(date).then(callback);
  // Subscribe to changes
  const unsub = subscribe<Order>(STORE_KEYS.orders, (all) => {
    callback(all.filter(o => o.dateOfService === date));
  });
  return unsub;
}

// ============================================================
// Tasks
// ============================================================

export async function saveTasks(tasks: Omit<Task, 'id' | 'createdAt'>[]): Promise<void> {
  const store = getStore<Task>(STORE_KEYS.tasks);
  for (const task of tasks) {
    const id = genId();
    store[id] = { ...task, id, createdAt: new Date().toISOString() } as Task;
  }
  setStore(STORE_KEYS.tasks, store);
  notify(STORE_KEYS.tasks);
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const store = getStore<Task>(STORE_KEYS.tasks);
  return Object.values(store).filter(t => t.dateOfService === date);
}

export async function toggleTaskComplete(taskId: string, completed: boolean, completedBy?: string): Promise<void> {
  const store = getStore<Task>(STORE_KEYS.tasks);
  if (store[taskId]) {
    store[taskId] = {
      ...store[taskId],
      completed,
      completedBy: completed ? completedBy : undefined,
      completedAt: completed ? new Date().toISOString() : undefined,
    };
    setStore(STORE_KEYS.tasks, store);
    notify(STORE_KEYS.tasks);
  }
}

export function onTasksChange(date: string, callback: (tasks: Task[]) => void): () => void {
  getTasksByDate(date).then(callback);
  const unsub = subscribe<Task>(STORE_KEYS.tasks, (all) => {
    callback(all.filter(t => t.dateOfService === date));
  });
  return unsub;
}

// ============================================================
// Devices
// ============================================================

export async function addDevice(device: Omit<Device, 'id' | 'createdAt'>): Promise<string> {
  const id = genId();
  const store = getStore<Device>(STORE_KEYS.devices);
  store[id] = { ...device, id, createdAt: new Date().toISOString() } as Device;
  setStore(STORE_KEYS.devices, store);
  notify(STORE_KEYS.devices);
  return id;
}

export async function getAllDevices(): Promise<Device[]> {
  return Object.values(getStore<Device>(STORE_KEYS.devices));
}

export async function getAvailableDevices(type?: DeviceType): Promise<Device[]> {
  const devices = await getAllDevices();
  return devices.filter(d => d.status === 'Available' && (!type || d.type === type));
}

export async function updateDevice(deviceId: string, updates: Partial<Device>): Promise<void> {
  const store = getStore<Device>(STORE_KEYS.devices);
  if (store[deviceId]) {
    store[deviceId] = { ...store[deviceId], ...updates };
    setStore(STORE_KEYS.devices, store);
    notify(STORE_KEYS.devices);
  }
}

export async function deleteDevice(deviceId: string): Promise<void> {
  const store = getStore<Device>(STORE_KEYS.devices);
  delete store[deviceId];
  setStore(STORE_KEYS.devices, store);
  notify(STORE_KEYS.devices);
}

export function onDevicesChange(callback: (devices: Device[]) => void): () => void {
  getAllDevices().then(callback);
  return subscribe<Device>(STORE_KEYS.devices, callback);
}

// ============================================================
// Device Assignments
// ============================================================

export async function createAssignment(assignment: Omit<DeviceAssignment, 'id' | 'createdAt'>): Promise<string> {
  const id = genId();
  const store = getStore<DeviceAssignment>(STORE_KEYS.assignments);
  store[id] = { ...assignment, id, createdAt: new Date().toISOString() } as DeviceAssignment;
  setStore(STORE_KEYS.assignments, store);
  notify(STORE_KEYS.assignments);

  // Update device status
  await updateDevice(assignment.deviceId, {
    status: 'Assigned',
    assignedTo: assignment.patientName,
  });

  return id;
}

export async function getActiveAssignments(): Promise<DeviceAssignment[]> {
  const store = getStore<DeviceAssignment>(STORE_KEYS.assignments);
  return Object.values(store).filter(a => a.status === 'active' || a.status === 'overdue');
}

export async function getAllAssignments(): Promise<DeviceAssignment[]> {
  return Object.values(getStore<DeviceAssignment>(STORE_KEYS.assignments));
}

export async function returnDevice(
  assignmentId: string,
  deviceId: string,
  returnDate: string,
  returnCondition: 'Good' | 'Needs Maintenance' | 'Damaged',
  returnNotes?: string
): Promise<void> {
  const store = getStore<DeviceAssignment>(STORE_KEYS.assignments);
  if (store[assignmentId]) {
    store[assignmentId] = {
      ...store[assignmentId],
      status: 'returned',
      returnDate,
      returnCondition,
      returnNotes: returnNotes || '',
    };
    setStore(STORE_KEYS.assignments, store);
    notify(STORE_KEYS.assignments);
  }

  await updateDevice(deviceId, {
    status: returnCondition === 'Needs Maintenance' || returnCondition === 'Damaged' ? 'Maintenance' : 'Available',
    assignedTo: undefined,
  });
}

export function onAssignmentsChange(callback: (assignments: DeviceAssignment[]) => void): () => void {
  getAllAssignments().then(callback);
  return subscribe<DeviceAssignment>(STORE_KEYS.assignments, callback);
}

// ============================================================
// Waitlist
// ============================================================

export async function addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'position'>): Promise<string> {
  const existing = await getWaitlist();
  const maxPos = existing.length > 0 ? Math.max(...existing.map(e => e.position)) : 0;

  const id = genId();
  const store = getStore<WaitlistEntry>(STORE_KEYS.waitlist);
  store[id] = {
    ...entry,
    id,
    position: maxPos + 1,
    addedAt: new Date().toISOString(),
  } as WaitlistEntry;
  setStore(STORE_KEYS.waitlist, store);
  notify(STORE_KEYS.waitlist);
  return id;
}

export async function getWaitlist(): Promise<WaitlistEntry[]> {
  const store = getStore<WaitlistEntry>(STORE_KEYS.waitlist);
  return Object.values(store).sort((a, b) => a.position - b.position);
}

export async function removeFromWaitlist(entryId: string): Promise<void> {
  const store = getStore<WaitlistEntry>(STORE_KEYS.waitlist);
  delete store[entryId];
  setStore(STORE_KEYS.waitlist, store);
  notify(STORE_KEYS.waitlist);
}

export function onWaitlistChange(callback: (entries: WaitlistEntry[]) => void): () => void {
  getWaitlist().then(callback);
  return subscribe<WaitlistEntry>(STORE_KEYS.waitlist, (all) => {
    callback(all.sort((a, b) => a.position - b.position));
  });
}

// ============================================================
// Time Entries (Clock In/Out)
// ============================================================

export async function clockIn(userId: string, username: string, displayName: string): Promise<string> {
  const id = genId();
  const now = new Date().toISOString();
  const date = now.slice(0, 10);
  const entry: TimeEntry = {
    id, userId, username, displayName,
    clockIn: now,
    totalBreakMinutes: 0,
    date,
    createdAt: now,
  };
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  store[id] = entry;
  setStore(STORE_KEYS.timeEntries, store);
  notify(STORE_KEYS.timeEntries);
  return id;
}

export async function clockOut(entryId: string): Promise<void> {
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  const entry = store[entryId];
  if (!entry) return;

  const now = new Date().toISOString();
  const clockInMs = new Date(entry.clockIn).getTime();
  const clockOutMs = new Date(now).getTime();
  const totalMs = clockOutMs - clockInMs;
  const totalHours = (totalMs / (1000 * 60 * 60)) - (entry.totalBreakMinutes / 60);

  store[entryId] = { ...entry, clockOut: now, totalHours: Math.max(0, totalHours) };
  setStore(STORE_KEYS.timeEntries, store);
  notify(STORE_KEYS.timeEntries);
}

export async function startBreak(entryId: string): Promise<void> {
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  if (store[entryId]) {
    store[entryId] = { ...store[entryId], breakStart: new Date().toISOString() };
    setStore(STORE_KEYS.timeEntries, store);
    notify(STORE_KEYS.timeEntries);
  }
}

export async function endBreak(entryId: string): Promise<void> {
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  const entry = store[entryId];
  if (!entry || !entry.breakStart) return;

  const breakMs = new Date().getTime() - new Date(entry.breakStart).getTime();
  const breakMin = breakMs / (1000 * 60);

  store[entryId] = {
    ...entry,
    breakStart: undefined,
    breakEnd: new Date().toISOString(),
    totalBreakMinutes: (entry.totalBreakMinutes || 0) + breakMin,
  };
  setStore(STORE_KEYS.timeEntries, store);
  notify(STORE_KEYS.timeEntries);
}

export async function getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  const entries = Object.values(store);
  return entries.find(e => e.userId === userId && !e.clockOut) || null;
}

export async function getTimeEntries(filters?: { userId?: string; dateFrom?: string; dateTo?: string }): Promise<TimeEntry[]> {
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  let entries = Object.values(store);
  if (filters?.userId) entries = entries.filter(e => e.userId === filters.userId);
  if (filters?.dateFrom) entries = entries.filter(e => e.date >= filters.dateFrom!);
  if (filters?.dateTo) entries = entries.filter(e => e.date <= filters.dateTo!);
  return entries.sort((a, b) => b.clockIn.localeCompare(a.clockIn));
}

export async function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<void> {
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  if (store[entryId]) {
    store[entryId] = { ...store[entryId], ...updates };
    setStore(STORE_KEYS.timeEntries, store);
    notify(STORE_KEYS.timeEntries);
  }
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  delete store[entryId];
  setStore(STORE_KEYS.timeEntries, store);
  notify(STORE_KEYS.timeEntries);
}

export async function addManualTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>): Promise<string> {
  const id = genId();
  const store = getStore<TimeEntry>(STORE_KEYS.timeEntries);
  store[id] = { ...entry, id, createdAt: new Date().toISOString() } as TimeEntry;
  setStore(STORE_KEYS.timeEntries, store);
  notify(STORE_KEYS.timeEntries);
  return id;
}

export function onTimeEntriesChange(callback: (entries: TimeEntry[]) => void): () => void {
  getTimeEntries().then(callback);
  return subscribe<TimeEntry>(STORE_KEYS.timeEntries, callback);
}

// ============================================================
// Vacation Requests
// ============================================================

export async function createVacationRequest(req: Omit<VacationRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const id = genId();
  const store = getStore<VacationRequest>(STORE_KEYS.vacations);
  store[id] = { ...req, id, status: 'pending', createdAt: new Date().toISOString() } as VacationRequest;
  setStore(STORE_KEYS.vacations, store);
  notify(STORE_KEYS.vacations);
  return id;
}

export async function getVacationRequests(filters?: { userId?: string; status?: VacationStatus }): Promise<VacationRequest[]> {
  const store = getStore<VacationRequest>(STORE_KEYS.vacations);
  let requests = Object.values(store);
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
  const store = getStore<VacationRequest>(STORE_KEYS.vacations);
  if (store[requestId]) {
    store[requestId] = {
      ...store[requestId],
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNote,
    };
    setStore(STORE_KEYS.vacations, store);
    notify(STORE_KEYS.vacations);
  }
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
  const id = genId();
  const store = getStore<VacationRequest>(STORE_KEYS.vacations);
  store[id] = {
    id,
    userId: params.userId,
    username: params.username,
    displayName: params.displayName,
    startDate: params.date,
    endDate: params.date,
    timeSlot: params.timeSlot,
    ptoStartTime: params.ptoStartTime,
    ptoEndTime: params.ptoEndTime,
    reason: params.reason,
    countAsPto: params.countAsPto,
    status: 'approved',
    source: 'same_day',
    createdAt: new Date().toISOString(),
  };
  setStore(STORE_KEYS.vacations, store);
  notify(STORE_KEYS.vacations);

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
  const store = getStore<VacationRequest>(STORE_KEYS.vacations);
  if (store[requestId]) {
    store[requestId] = { ...store[requestId], ...updates };
    setStore(STORE_KEYS.vacations, store);
    notify(STORE_KEYS.vacations);
  }
}

export async function deleteVacationRequest(requestId: string): Promise<void> {
  const store = getStore<VacationRequest>(STORE_KEYS.vacations);
  const req = store[requestId];
  if (!req) return;

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

  delete store[requestId];
  setStore(STORE_KEYS.vacations, store);
  notify(STORE_KEYS.vacations);
}

export function onVacationsChange(callback: (requests: VacationRequest[]) => void): () => void {
  getVacationRequests().then(callback);
  return subscribe<VacationRequest>(STORE_KEYS.vacations, callback);
}

// ============================================================
// Pay Periods
// ============================================================

export async function closePayPeriod(startDate: string, endDate: string, closedBy: string): Promise<string> {
  const entries = await getTimeEntries({ dateFrom: startDate, dateTo: endDate });

  // Build summary by user
  const summary: PayPeriod['summary'] = {};
  for (const entry of entries) {
    if (!entry.clockOut) continue; // skip active entries
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

  const id = genId();
  const store = getStore<PayPeriod>(STORE_KEYS.payPeriods);
  store[id] = { id, startDate, endDate, closedBy, closedAt: new Date().toISOString(), summary };
  setStore(STORE_KEYS.payPeriods, store);
  notify(STORE_KEYS.payPeriods);
  return id;
}

export async function getPayPeriods(): Promise<PayPeriod[]> {
  const store = getStore<PayPeriod>(STORE_KEYS.payPeriods);
  return Object.values(store).sort((a, b) => b.closedAt.localeCompare(a.closedAt));
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

  // Include approved PTO in the report
  const allPto = await getVacationRequests({ status: 'approved' });
  const periodPto = allPto.filter(p => p.startDate >= startDate && p.startDate <= endDate && p.countAsPto);

  for (const pto of periodPto) {
    if (!summaryByUser[pto.userId]) {
      summaryByUser[pto.userId] = { displayName: pto.displayName, totalHours: 0, totalBreakMinutes: 0, entries: 0, ptoHours: 0, ptoEntries: 0 };
    }
    // Calculate PTO hours
    let ptoHrs = 0;
    if (pto.timeSlot === 'full_day') {
      ptoHrs = 8;
    } else if (pto.ptoStartTime && pto.ptoEndTime) {
      const [sh, sm] = pto.ptoStartTime.split(':').map(Number);
      const [eh, em] = pto.ptoEndTime.split(':').map(Number);
      ptoHrs = (eh + em / 60) - (sh + sm / 60);
    } else {
      ptoHrs = 4; // half-day default
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
  const id = genId();
  const store = getStore<Announcement>(STORE_KEYS.announcements);
  store[id] = { ...ann, id, createdAt: new Date().toISOString() };
  setStore(STORE_KEYS.announcements, store);
  notify(STORE_KEYS.announcements);
  return id;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const store = getStore<Announcement>(STORE_KEYS.announcements);
  return Object.values(store).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
  const store = getStore<Announcement>(STORE_KEYS.announcements);
  if (store[id]) {
    store[id] = { ...store[id], ...updates };
    setStore(STORE_KEYS.announcements, store);
    notify(STORE_KEYS.announcements);
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const store = getStore<Announcement>(STORE_KEYS.announcements);
  delete store[id];
  setStore(STORE_KEYS.announcements, store);
  notify(STORE_KEYS.announcements);
}

export function onAnnouncementsChange(callback: (items: Announcement[]) => void): () => void {
  getAnnouncements().then(callback);
  return subscribe<Announcement>(STORE_KEYS.announcements, callback);
}

// ============================================================
// Employee Requests
// ============================================================

export async function createEmployeeRequest(req: Omit<EmployeeRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const id = genId();
  const store = getStore<EmployeeRequest>(STORE_KEYS.employeeRequests);
  store[id] = { ...req, id, status: 'pending', createdAt: new Date().toISOString() } as EmployeeRequest;
  setStore(STORE_KEYS.employeeRequests, store);
  notify(STORE_KEYS.employeeRequests);
  return id;
}

export async function getEmployeeRequests(filters?: { userId?: string; status?: RequestStatus }): Promise<EmployeeRequest[]> {
  const store = getStore<EmployeeRequest>(STORE_KEYS.employeeRequests);
  let requests = Object.values(store);
  if (filters?.userId) requests = requests.filter(r => r.userId === filters.userId);
  if (filters?.status) requests = requests.filter(r => r.status === filters.status);
  return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateEmployeeRequest(id: string, updates: Partial<EmployeeRequest>): Promise<void> {
  const store = getStore<EmployeeRequest>(STORE_KEYS.employeeRequests);
  if (store[id]) {
    store[id] = { ...store[id], ...updates };
    setStore(STORE_KEYS.employeeRequests, store);
    notify(STORE_KEYS.employeeRequests);
  }
}

export function onEmployeeRequestsChange(callback: (items: EmployeeRequest[]) => void): () => void {
  getEmployeeRequests().then(callback);
  return subscribe<EmployeeRequest>(STORE_KEYS.employeeRequests, callback);
}

// ============================================================
// Write-Ups
// ============================================================

export async function createWriteUp(wu: Omit<WriteUp, 'id' | 'createdAt'>): Promise<string> {
  const id = genId();
  const store = getStore<WriteUp>(STORE_KEYS.writeups);
  store[id] = { ...wu, id, createdAt: new Date().toISOString() } as WriteUp;
  setStore(STORE_KEYS.writeups, store);
  notify(STORE_KEYS.writeups);
  return id;
}

export async function getWriteUps(employeeId?: string): Promise<WriteUp[]> {
  const store = getStore<WriteUp>(STORE_KEYS.writeups);
  let items = Object.values(store);
  if (employeeId) items = items.filter(w => w.employeeId === employeeId);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getWriteUp(id: string): Promise<WriteUp | null> {
  const store = getStore<WriteUp>(STORE_KEYS.writeups);
  return store[id] || null;
}

export function onWriteUpsChange(callback: (items: WriteUp[]) => void): () => void {
  getWriteUps().then(callback);
  return subscribe<WriteUp>(STORE_KEYS.writeups, callback);
}

// ============================================================
// HR Documents
// ============================================================

export async function uploadDocument(doc: Omit<HRDocument, 'id' | 'createdAt'>): Promise<string> {
  const id = genId();
  const store = getStore<HRDocument>(STORE_KEYS.documents);
  store[id] = { ...doc, id, createdAt: new Date().toISOString() } as HRDocument;
  setStore(STORE_KEYS.documents, store);
  notify(STORE_KEYS.documents);
  return id;
}

export async function getDocuments(category?: string): Promise<HRDocument[]> {
  const store = getStore<HRDocument>(STORE_KEYS.documents);
  let items = Object.values(store);
  if (category) items = items.filter(d => d.category === category);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteDocument(id: string): Promise<void> {
  const store = getStore<HRDocument>(STORE_KEYS.documents);
  delete store[id];
  setStore(STORE_KEYS.documents, store);
  notify(STORE_KEYS.documents);
}

export function onDocumentsChange(callback: (items: HRDocument[]) => void): () => void {
  getDocuments().then(callback);
  return subscribe<HRDocument>(STORE_KEYS.documents, callback);
}

// ============================================================
// Anonymous Feedback
// ============================================================

export async function submitFeedback(message: string, category: string): Promise<string> {
  const id = genId();
  const store = getStore<AnonymousFeedback>(STORE_KEYS.feedback);
  store[id] = { id, message, category, createdAt: new Date().toISOString() };
  setStore(STORE_KEYS.feedback, store);
  notify(STORE_KEYS.feedback);
  return id;
}

export async function getFeedback(): Promise<AnonymousFeedback[]> {
  const store = getStore<AnonymousFeedback>(STORE_KEYS.feedback);
  return Object.values(store).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function onFeedbackChange(callback: (items: AnonymousFeedback[]) => void): () => void {
  getFeedback().then(callback);
  return subscribe<AnonymousFeedback>(STORE_KEYS.feedback, callback);
}
