// ============================================================
// WHHC Clinic Management System - Type Definitions
// ============================================================

// --- Auth & Users ---
export type UserRole = 'physician' | 'admin' | 'clinical' | 'staff';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  // HR fields
  phone?: string;
  dateOfBirth?: string;
  yearsExperience?: number;
  ptoBalance?: number;
  ptoUsed?: number;
  ptoYear?: number;
}

export interface Session {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
  loginTime: number;
  expiresAt: number;
}

// --- Orders ---
export interface SelectedTest {
  name: string;
  category: string;
  details?: Record<string, string | number | boolean>;
}

export interface Order {
  id: string;
  patientName: string;
  patientDOB?: string;
  dateOfService: string;
  selectedTests: SelectedTest[];
  followup: string;
  referTo: string;
  instructions: string;
  pcp: boolean;
  mediterraneanDiet: boolean;
  exerciseRegimen: boolean;
  createdAt: string;
  createdBy: string;
  completed: boolean;
}

// --- Devices ---
export type DeviceType = 'Holter Monitor' | 'Ambulatory BP Monitor' | 'MCT Monitor';
export type DeviceStatus = 'Available' | 'Assigned' | 'Maintenance';

export interface Device {
  id: string;
  type: DeviceType;
  serialNumber: string;
  status: DeviceStatus;
  assignedTo?: string;
  notes: string;
  createdAt: string;
}

export interface DeviceAssignment {
  id: string;
  deviceId: string;
  deviceType: DeviceType;
  serialNumber: string;
  patientName: string;
  patientPhone?: string;
  patientDOB?: string;
  patientMRN?: string;
  studyDuration: number;
  assignDate: string;
  dueDate: string;
  returnDate?: string;
  returnCondition?: 'Good' | 'Needs Maintenance' | 'Damaged';
  returnNotes?: string;
  orderId?: string; // Links to an Order
  notes: string;
  status: 'active' | 'returned' | 'overdue';
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  patientPhone?: string;
  patientMRN?: string;
  deviceType: DeviceType;
  studyDuration?: number;
  notes: string;
  addedAt: string;
  position: number;
}

// --- Tasks (Staff To-Do) ---
export interface Task {
  id: string;
  orderId: string;
  patientName: string;
  dateOfService: string;
  category: string;
  taskName: string;
  details?: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
}

// --- Dashboard Stats ---
export interface OrderStats {
  total: number;
  completed: number;
  pending: number;
}

export interface DeviceStats {
  totalDevices: number;
  available: number;
  assigned: number;
  overdue: number;
  waitlistCount: number;
}

// --- Test Categories for Order Form ---
export interface TestOption {
  name: string;
  category: string;
  hasDetails?: boolean;
  detailsConfig?: {
    type: 'number' | 'select' | 'text';
    label: string;
    options?: string[];
    placeholder?: string;
    min?: number;
    max?: number;
  }[];
}

// ============================================================
// Practice Management / HR Types
// ============================================================

// --- Time Tracking ---
export interface TimeEntry {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  clockIn: string;        // ISO timestamp
  clockOut?: string;       // ISO timestamp
  breakStart?: string;     // ISO timestamp
  breakEnd?: string;       // ISO timestamp
  totalBreakMinutes: number;
  totalHours?: number;     // computed on clock-out
  notes?: string;
  date: string;            // YYYY-MM-DD
  createdAt: string;
}

// --- Vacation / PTO ---
export type VacationStatus = 'pending' | 'approved' | 'denied' | 'cancelled';
export type TimeSlot = 'full_day' | 'morning' | 'afternoon';

export interface VacationRequest {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  startDate: string;
  endDate: string;
  timeSlot: TimeSlot;
  reason: string;
  countAsPto: boolean;
  status: VacationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  ptoStartTime?: string;   // HH:mm for partial-day PTO (e.g., "13:00")
  ptoEndTime?: string;     // HH:mm for partial-day PTO (e.g., "17:00")
  source?: 'request' | 'same_day'; // origin of the PTO entry
  createdAt: string;
}

// --- Pay Periods ---
export interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  closedBy: string;
  closedAt: string;
  summary: Record<string, { totalHours: number; totalBreakMinutes: number; entries: number; ptoHours?: number; ptoEntries?: number }>;
}

// --- Announcements ---
export interface Announcement {
  id: string;
  title: string;
  content: string;
  link?: string;
  createdBy: string;
  createdAt: string;
}

// --- Employee Requests ---
export type RequestType = 'evaluation' | 'discussion' | 'other';
export type RequestStatus = 'pending' | 'reviewed' | 'resolved';

export interface EmployeeRequest {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  type: RequestType;
  subject: string;
  description: string;
  status: RequestStatus;
  adminNotes?: string;
  createdAt: string;
}

// --- Write-Ups ---
export type WriteUpType = 'verbal_warning' | 'written_warning' | 'final_warning' | 'suspension' | 'termination';

export interface WriteUp {
  id: string;
  employeeId: string;
  employeeName: string;
  type: WriteUpType;
  subject: string;
  description: string;
  date: string;
  issuedBy: string;
  createdAt: string;
}

// --- HR Documents ---
export interface HRDocument {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileData: string;   // base64 encoded
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

// --- Anonymous Feedback ---
export interface AnonymousFeedback {
  id: string;
  message: string;
  category: string;
  createdAt: string;
  // no userId - fully anonymous
}
