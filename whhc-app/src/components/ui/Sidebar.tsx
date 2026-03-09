'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ROLE_DISPLAY: Record<string, string> = {
  physician: 'Physician',
  admin: 'Admin',
  clinical: 'Clinical Coordinator',
  staff: 'Staff',
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '▣', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/orders', label: 'Patient Orders', icon: '📋', roles: ['physician'] },
    ],
  },
  {
    title: 'Devices',
    items: [
      { href: '/devices/inventory', label: 'Device Inventory', icon: '🔧', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/devices/assignments', label: 'Active Assignments', icon: '📱', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/devices/waitlist', label: 'Waitlist', icon: '⏳', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/devices/history', label: 'Device History', icon: '📜', roles: ['physician', 'admin', 'clinical', 'staff'] },
    ],
  },
  {
    title: 'Staff Portal',
    items: [
      { href: '/staff/clock', label: 'Time Clock', icon: '⏱', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/staff/pto', label: 'My PTO', icon: '🏖', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/staff/announcements', label: 'Announcements', icon: '📢', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/staff/documents', label: 'Documents', icon: '📄', roles: ['physician', 'admin', 'clinical', 'staff'] },
    ],
  },
  {
    title: 'HR Management',
    items: [
      { href: '/hr/time', label: 'Employee Hours', icon: '⏰', roles: ['physician', 'admin'] },
      { href: '/hr/vacations', label: 'Vacations', icon: '✈', roles: ['physician', 'admin'] },
      { href: '/hr/reports', label: 'Payroll Reports', icon: '💰', roles: ['physician', 'admin'] },
      { href: '/hr/writeups', label: 'Write-Ups', icon: '⚠', roles: ['physician', 'admin'] },
      { href: '/hr/announcements', label: 'Manage Announcements', icon: '📣', roles: ['physician', 'admin'] },
      { href: '/hr/documents', label: 'Manage Documents', icon: '📁', roles: ['physician', 'admin'] },
      { href: '/hr/feedback', label: 'Feedback', icon: '💬', roles: ['physician', 'admin'] },
      { href: '/hr/requests', label: 'Requests', icon: '📩', roles: ['physician', 'admin'] },
    ],
  },
  {
    title: 'Education',
    items: [
      { href: '/rotations', label: 'Rotation Management', icon: '🎓', roles: ['physician', 'admin', 'clinical'] },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/tasks', label: 'Staff Tasks', icon: '✓', roles: ['physician', 'admin', 'clinical', 'staff'] },
      { href: '/tracker', label: 'Tracker Analytics', icon: '📊', roles: ['physician', 'admin', 'clinical'] },
      { href: '/users', label: 'User Management', icon: '👤', roles: ['physician', 'admin'] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { session, logout } = useAuth();

  if (!session) return null;

  // Filter sections: only show sections with at least one visible item
  const visibleSections = NAV_SECTIONS
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(session.role)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-lg font-bold text-primary-500">WHHC Clinic</h1>
        <p className="text-xs text-gray-500 mt-0.5">West Houston Heart Center</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {visibleSections.map((section, sIdx) => (
          <div key={section.title} className={sIdx > 0 ? 'mt-4' : ''}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary-600/20 text-primary-400 border-l-2 border-primary-500'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">{session.displayName}</p>
            <p className="text-xs text-gray-500">{ROLE_DISPLAY[session.role] || session.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
