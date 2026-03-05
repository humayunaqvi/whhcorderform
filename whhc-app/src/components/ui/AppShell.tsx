'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';
import type { UserRole } from '@/types';

interface AppShellProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function AppShell({ children, allowedRoles }: AppShellProps) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      router.replace('/dashboard');
    }
  }, [session, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  if (allowedRoles && !allowedRoles.includes(session.role)) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
