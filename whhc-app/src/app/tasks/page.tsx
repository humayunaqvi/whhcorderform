'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { onTasksChange, toggleTaskComplete } from '@/lib/db';
import type { Task } from '@/types';

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function TasksPage() {
  const { session } = useAuth();
  const [date, setDate] = useState(todayStr());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const unsub = onTasksChange(date, setTasks);
    return unsub;
  }, [date]);

  const handleToggle = async (task: Task) => {
    await toggleTaskComplete(task.id, !task.completed, session?.username);
  };

  // Group tasks by patient
  const byPatient: Record<string, Task[]> = {};
  tasks.forEach(t => {
    if (!byPatient[t.patientName]) byPatient[t.patientName] = [];
    byPatient[t.patientName].push(t);
  });

  const completedCount = tasks.filter(t => t.completed).length;

  const handlePrint = () => {
    const printContent = document.getElementById('tasks-print');
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Staff Tasks - ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { border-bottom: 2px solid #333; padding-bottom: 8px; }
        h3 { color: #dc2626; margin-top: 20px; }
        .task { padding: 4px 0; display: flex; gap: 8px; align-items: center; }
        .task input[type="checkbox"] { width: 16px; height: 16px; }
        .completed { text-decoration: line-through; color: #999; }
      </style></head><body>
      ${printContent.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Staff Tasks</h2>
          <div className="flex items-center gap-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto" />
            <button onClick={handlePrint} className="btn-secondary">Print</button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-4 mb-6">
          <div className="stat-card border-l-4 border-l-blue-500 flex-1">
            <div className="text-xl font-bold">{tasks.length}</div>
            <div className="text-xs text-gray-500 uppercase">Total</div>
          </div>
          <div className="stat-card border-l-4 border-l-emerald-500 flex-1">
            <div className="text-xl font-bold">{completedCount}</div>
            <div className="text-xs text-gray-500 uppercase">Completed</div>
          </div>
          <div className="stat-card border-l-4 border-l-amber-500 flex-1">
            <div className="text-xl font-bold">{tasks.length - completedCount}</div>
            <div className="text-xs text-gray-500 uppercase">Pending</div>
          </div>
        </div>

        {/* Tasks by patient */}
        <div id="tasks-print" className="space-y-4">
          {Object.keys(byPatient).length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              No tasks for this date.
            </div>
          ) : (
            Object.entries(byPatient).map(([patient, patientTasks]) => (
              <div key={patient} className="card">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
                  <h3 className="text-lg font-semibold text-primary-400">
                    {patient}
                  </h3>
                  {patientTasks[0]?.orderId && (
                    <a
                      href={`/orders/summary?id=${patientTasks[0].orderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors no-print"
                    >
                      Print AVS
                    </a>
                  )}
                </div>
                <div className="space-y-1">
                  {patientTasks.map(task => (
                    <label
                      key={task.id}
                      className={`flex items-start gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-800/30 transition-colors ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggle(task)}
                        className="w-5 h-5 mt-0.5 rounded border-gray-600 text-primary-600 bg-gray-800 flex-shrink-0"
                      />
                      <div>
                        <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          <span className="text-xs text-gray-500 mr-2">[{task.category}]</span>
                          {task.details || task.taskName}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
