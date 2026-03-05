'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { onTasksChange } from '@/lib/db';
import type { Task } from '@/types';

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function TrackerPage() {
  const [date, setDate] = useState(todayStr());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const unsub = onTasksChange(date, setTasks);
    return unsub;
  }, [date]);

  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  // Category breakdown
  const byCategory: Record<string, { total: number; completed: number }> = {};
  tasks.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = { total: 0, completed: 0 };
    byCategory[t.category].total++;
    if (t.completed) byCategory[t.category].completed++;
  });

  // SVG Pie Chart
  const pieSize = 200;
  const radius = 80;
  const cx = pieSize / 2;
  const cy = pieSize / 2;
  const completedAngle = tasks.length > 0 ? (completed / tasks.length) * 360 : 0;

  function describeArc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return { x: cx + r * Math.cos(angleInRadians), y: cy + r * Math.sin(angleInRadians) };
  }

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical']}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Tracker Analytics</h2>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card border-l-4 border-l-blue-500">
            <div className="text-3xl font-bold">{tasks.length}</div>
            <div className="text-xs text-gray-500 uppercase">Total Tasks</div>
          </div>
          <div className="stat-card border-l-4 border-l-emerald-500">
            <div className="text-3xl font-bold text-emerald-400">{completed}</div>
            <div className="text-xs text-gray-500 uppercase">Completed</div>
          </div>
          <div className="stat-card border-l-4 border-l-amber-500">
            <div className="text-3xl font-bold text-amber-400">{pending}</div>
            <div className="text-xs text-gray-500 uppercase">Pending</div>
          </div>
          <div className="stat-card border-l-4 border-l-primary-500">
            <div className="text-3xl font-bold text-primary-400">{completionRate}%</div>
            <div className="text-xs text-gray-500 uppercase">Completion Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="card flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Task Distribution</h3>
            {tasks.length === 0 ? (
              <p className="text-gray-600 italic py-8">No tasks for this date</p>
            ) : (
              <svg width={pieSize} height={pieSize} viewBox={`0 0 ${pieSize} ${pieSize}`}>
                {/* Pending slice (full circle) */}
                <circle cx={cx} cy={cy} r={radius} fill="#f59e0b" />
                {/* Completed slice */}
                {completedAngle > 0 && completedAngle < 360 && (
                  <path d={describeArc(0, completedAngle)} fill="#10b981" />
                )}
                {completedAngle >= 360 && (
                  <circle cx={cx} cy={cy} r={radius} fill="#10b981" />
                )}
                {/* Center circle */}
                <circle cx={cx} cy={cy} r={40} fill="#1a1a1a" />
                <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                  {completionRate}%
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#999" fontSize="10">
                  Complete
                </text>
              </svg>
            )}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">Completed ({completed})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-400">Pending ({pending})</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">By Category</h3>
            <div className="space-y-3">
              {Object.entries(byCategory).length === 0 ? (
                <p className="text-gray-600 italic text-center py-8">No data</p>
              ) : (
                Object.entries(byCategory).map(([cat, stats]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{cat}</span>
                      <span className="text-gray-500">{stats.completed}/{stats.total}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
