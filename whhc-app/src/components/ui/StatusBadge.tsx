'use client';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  assigned: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
  maintenance: 'bg-amber-100 text-amber-800',
  returned: 'bg-gray-200 text-gray-700',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  physician: 'bg-blue-100 text-blue-800',
  admin: 'bg-red-100 text-red-800',
  clinical: 'bg-teal-100 text-teal-800',
  'clinical coordinator': 'bg-teal-100 text-teal-800',
  staff: 'bg-emerald-100 text-emerald-800',
  good: 'bg-emerald-100 text-emerald-800',
  damaged: 'bg-red-100 text-red-800',
  'needs maintenance': 'bg-amber-100 text-amber-800',
  // HR / Practice Management statuses
  approved: 'bg-emerald-100 text-emerald-800',
  denied: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-700',
  declined: 'bg-red-100 text-red-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  reviewed: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-cyan-100 text-cyan-800',
  verbal_warning: 'bg-amber-100 text-amber-800',
  written_warning: 'bg-orange-100 text-orange-800',
  final_warning: 'bg-red-100 text-red-800',
  suspension: 'bg-red-200 text-red-900',
  termination: 'bg-red-300 text-red-900',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status.toLowerCase()] || 'bg-gray-200 text-gray-700';
  return (
    <span className={`badge ${style} ${className}`}>
      {status}
    </span>
  );
}
