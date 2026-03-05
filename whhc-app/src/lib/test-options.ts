import type { TestOption } from '@/types';

export const TEST_OPTIONS: TestOption[] = [
  // --- Stress Tests ---
  { name: 'Exercise Treadmill Stress Test', category: 'Stress Tests' },
  { name: 'Lexiscan Nuclear Stress Test', category: 'Stress Tests' },
  { name: 'Exercise Nuclear Stress Test', category: 'Stress Tests' },
  { name: 'Stress Echocardiogram', category: 'Stress Tests' },
  { name: 'PET Stress', category: 'Stress Tests' },

  // --- Monitoring Devices ---
  {
    name: 'MCT (Mobile Cardiac Telemetry)',
    category: 'Monitoring Devices',
    hasDetails: true,
    detailsConfig: [{ type: 'number', label: 'Duration (days)', min: 1, max: 90 }],
  },
  {
    name: 'Extended Holter Monitor',
    category: 'Monitoring Devices',
    hasDetails: true,
    detailsConfig: [{ type: 'number', label: 'Duration (days)', min: 1, max: 90 }],
  },
  {
    name: 'Ambulatory Blood Pressure Monitor',
    category: 'Monitoring Devices',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Duration', options: ['24 hours', '48 hours'] }],
  },
  { name: 'Clinii BP Cuff', category: 'Monitoring Devices' },
  { name: 'Clinii Weight Scale', category: 'Monitoring Devices' },
  { name: 'BioBridge Device Monitoring Enrollment', category: 'Monitoring Devices' },
  { name: 'In-Office Pacemaker Interrogation', category: 'Monitoring Devices' },

  // --- Office Imaging ---
  { name: 'Echocardiogram', category: 'Office Imaging' },
  { name: 'Carotid Ultrasound', category: 'Office Imaging' },
  { name: 'Ankle-Brachial Index', category: 'Office Imaging' },
  { name: 'Peripheral Arterial Doppler', category: 'Office Imaging' },
  { name: 'Abdominal Aortic Aneurysm Screen', category: 'Office Imaging' },
  { name: 'Venous Study', category: 'Office Imaging' },

  // --- Out-of-Office Imaging ---
  {
    name: 'Cardiac CTA',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Imaging Center', options: ['Simon Med', 'Houston Methodist', 'Memorial Hermann', 'Houston Medical Imaging', 'Live Healthy Imaging'] }],
  },
  {
    name: 'Cardiac CTA w/ FFR',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Imaging Center', options: ['Simon Med', 'Houston Methodist', 'Memorial Hermann', 'Houston Medical Imaging', 'Live Healthy Imaging'] }],
  },
  {
    name: 'Cardiac CTA with Cleerly Plaque Analysis',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Imaging Center', options: ['Simon Med', 'Houston Methodist', 'Memorial Hermann', 'Houston Medical Imaging', 'Live Healthy Imaging'] }],
  },
  {
    name: 'Calcium Score',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Imaging Center', options: ['Simon Med', 'Houston Methodist', 'Memorial Hermann', 'Houston Medical Imaging', 'Live Healthy Imaging'] }],
  },
  {
    name: 'CTA Carotid',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Imaging Center', options: ['Simon Med', 'Houston Methodist', 'Memorial Hermann', 'Houston Medical Imaging', 'Live Healthy Imaging'] }],
  },
  {
    name: 'CT Thoracic Aorta',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Imaging Center', options: ['Simon Med', 'Houston Methodist', 'Memorial Hermann', 'Houston Medical Imaging', 'Live Healthy Imaging'] }],
  },
  { name: 'Cardiac MRI', category: 'Out-of-Office Imaging' },
  { name: 'PYP Scan', category: 'Out-of-Office Imaging' },
  { name: 'FDG PET', category: 'Out-of-Office Imaging' },
  { name: 'Sleep Study', category: 'Out-of-Office Imaging' },
  {
    name: 'CT (General)',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'text', label: 'Specify', placeholder: 'Type of CT scan...' }],
  },
  {
    name: 'Other Imaging',
    category: 'Out-of-Office Imaging',
    hasDetails: true,
    detailsConfig: [{ type: 'text', label: 'Specify', placeholder: 'Describe the imaging needed...' }],
  },

  // --- Procedures ---
  {
    name: 'Left Heart Catheterization',
    category: 'Procedures',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Hospital', options: ['Houston Methodist', 'Memorial Hermann', 'Methodist ASC'] }],
  },
  {
    name: 'Right Heart Catheterization',
    category: 'Procedures',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Hospital', options: ['Houston Methodist', 'Memorial Hermann', 'Methodist ASC'] }],
  },
  {
    name: 'TEE (Transesophageal Echocardiogram)',
    category: 'Procedures',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Hospital', options: ['Houston Methodist', 'Memorial Hermann', 'Methodist ASC'] }],
  },
  {
    name: 'TEE w/ Cardioversion',
    category: 'Procedures',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Hospital', options: ['Houston Methodist', 'Memorial Hermann', 'Methodist ASC'] }],
  },
  {
    name: 'Cardioversion Only',
    category: 'Procedures',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Hospital', options: ['Houston Methodist', 'Memorial Hermann', 'Methodist ASC'] }],
  },
  {
    name: 'Loop Recorder Placement',
    category: 'Procedures',
    hasDetails: true,
    detailsConfig: [{ type: 'select', label: 'Hospital', options: ['Houston Methodist', 'Memorial Hermann', 'Methodist ASC'] }],
  },
  { name: 'Dobutamine Stress Echo', category: 'Procedures' },
  { name: 'Tilt Table Test', category: 'Procedures' },

  // --- Additional Orders ---
  { name: 'Obtain Medical Records', category: 'Additional Orders' },
  { name: 'Blood Pressure Log', category: 'Additional Orders' },
  { name: 'Labs are Printed', category: 'Additional Orders' },
  {
    name: 'Please Order Labs',
    category: 'Additional Orders',
    hasDetails: true,
    detailsConfig: [{ type: 'text', label: 'Specify Labs', placeholder: 'Which labs to order...' }],
  },
  { name: 'Pre-Operative Cardiac Risk Stratification Paperwork', category: 'Additional Orders' },
  {
    name: 'Refer for Clinical Trial',
    category: 'Additional Orders',
    hasDetails: true,
    detailsConfig: [{ type: 'text', label: 'Trial Details', placeholder: 'Specify clinical trial...' }],
  },
];

export const TEST_CATEGORIES = [...new Set(TEST_OPTIONS.map(t => t.category))];

// Monitoring device tests that can link to device management
export const DEVICE_LINKED_TESTS = [
  'MCT (Mobile Cardiac Telemetry)',
  'Extended Holter Monitor',
  'Ambulatory Blood Pressure Monitor',
];
