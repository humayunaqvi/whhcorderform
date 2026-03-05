'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { saveOrder, saveTasks, getAvailableDevices, createAssignment, getOrdersByDate } from '@/lib/db';
import { TEST_OPTIONS, TEST_CATEGORIES, DEVICE_LINKED_TESTS } from '@/lib/test-options';
import type { SelectedTest, DeviceType, Order } from '@/types';

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const DEVICE_TYPE_MAP: Record<string, DeviceType> = {
  'MCT (Mobile Cardiac Telemetry)': 'MCT Monitor',
  'Extended Holter Monitor': 'Holter Monitor',
  'Ambulatory Blood Pressure Monitor': 'Ambulatory BP Monitor',
};

export default function OrdersPage() {
  const { session } = useAuth();
  const [patientName, setPatientName] = useState('');
  const [dateOfService, setDateOfService] = useState(todayStr());
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
  const [testDetails, setTestDetails] = useState<Record<string, Record<string, string>>>({});
  const [followup, setFollowup] = useState('');
  const [referTo, setReferTo] = useState('');
  const [instructions, setInstructions] = useState('');
  const [pcp, setPcp] = useState(false);
  const [mediterraneanDiet, setMediterraneanDiet] = useState(false);
  const [exerciseRegimen, setExerciseRegimen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [todaysOrders, setTodaysOrders] = useState<Order[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(TEST_CATEGORIES));

  const loadTodaysOrders = useCallback(async () => {
    const orders = await getOrdersByDate(todayStr());
    setTodaysOrders(orders);
  }, []);

  useEffect(() => {
    loadTodaysOrders();
  }, [loadTodaysOrders]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const toggleTest = (testName: string, category: string) => {
    setSelectedTests(prev => {
      const exists = prev.find(t => t.name === testName);
      if (exists) return prev.filter(t => t.name !== testName);
      return [...prev, { name: testName, category }];
    });
  };

  const updateDetail = (testName: string, key: string, value: string) => {
    setTestDetails(prev => ({
      ...prev,
      [testName]: { ...prev[testName], [key]: value },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientName || selectedTests.length === 0) return;

    setSubmitting(true);
    try {
      // Build tests with their details
      const testsWithDetails = selectedTests.map(t => ({
        ...t,
        details: testDetails[t.name] || {},
      }));

      // Save order
      const orderId = await saveOrder({
        patientName,
        dateOfService,
        selectedTests: testsWithDetails,
        followup,
        referTo,
        instructions,
        pcp,
        mediterraneanDiet,
        exerciseRegimen,
        completed: false,
        createdBy: session?.username || '',
      });

      // Generate tasks for staff
      const tasks = testsWithDetails.map(t => {
        let details = t.name;
        if (t.details) {
          const detailStr = Object.entries(t.details)
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          if (detailStr) details += ` (${detailStr})`;
        }
        return {
          orderId,
          patientName,
          dateOfService,
          category: t.category,
          taskName: t.name,
          details,
          completed: false,
        };
      });

      // Add follow-up, referral, info tasks
      if (followup) tasks.push({ orderId, patientName, dateOfService, category: 'Follow-Up', taskName: `Schedule follow-up: ${followup}`, details: `Schedule follow-up: ${followup}`, completed: false });
      if (referTo) tasks.push({ orderId, patientName, dateOfService, category: 'Referral', taskName: `Refer to: ${referTo}`, details: `Refer to: ${referTo}`, completed: false });
      if (pcp) tasks.push({ orderId, patientName, dateOfService, category: 'Patient Info', taskName: 'Update PCP', details: 'Update PCP', completed: false });

      await saveTasks(tasks);

      // Auto-assign monitoring devices if available
      for (const test of testsWithDetails) {
        if (DEVICE_LINKED_TESTS.includes(test.name)) {
          const deviceType = DEVICE_TYPE_MAP[test.name];
          if (deviceType) {
            const available = await getAvailableDevices(deviceType);
            if (available.length > 0) {
              const device = available[0];
              const duration = parseInt(test.details?.['Duration (days)'] || '1') || 1;
              await createAssignment({
                deviceId: device.id,
                deviceType,
                serialNumber: device.serialNumber,
                patientName,
                studyDuration: duration,
                assignDate: dateOfService,
                dueDate: addDays(dateOfService, duration + 1),
                orderId,
                notes: `Auto-assigned from order`,
                status: 'active',
              });
            }
          }
        }
      }

      setLastOrderId(orderId);
      setSuccess(`Order created for ${patientName}. Tasks saved.`);
      // Reset form
      setPatientName('');
      setSelectedTests([]);
      setTestDetails({});
      setFollowup('');
      setReferTo('');
      setInstructions('');
      setPcp(false);
      setMediterraneanDiet(false);
      setExerciseRegimen(false);

      // Refresh today's orders
      loadTodaysOrders();

      setTimeout(() => { setSuccess(''); setLastOrderId(null); }, 8000);
    } catch (err) {
      console.error('Order save failed:', err);
    }
    setSubmitting(false);
  };

  return (
    <AppShell allowedRoles={['physician']}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Patient Order Form</h2>

        {success && (
          <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg px-4 py-3 text-emerald-300 mb-6">
            <div className="flex items-center justify-between">
              <span>{success}</span>
              {lastOrderId && (
                <a
                  href={`/orders/summary?id=${lastOrderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !py-1.5 !px-4 !text-sm"
                >
                  Print After Visit Summary
                </a>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="input-field"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Service *</label>
                <input type="date" value={dateOfService} onChange={e => setDateOfService(e.target.value)} className="input-field" required />
              </div>
            </div>
          </div>

          {/* Test Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Orders & Tests
              {selectedTests.length > 0 && (
                <span className="ml-2 text-sm text-primary-400">({selectedTests.length} selected)</span>
              )}
            </h3>

            <div className="space-y-3">
              {TEST_CATEGORIES.map(cat => {
                const catTests = TEST_OPTIONS.filter(t => t.category === cat);
                const expanded = expandedCategories.has(cat);
                const selectedInCat = selectedTests.filter(t => t.category === cat).length;

                return (
                  <div key={cat} className="border border-gray-800 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
                    >
                      <span className="font-medium text-gray-200">
                        {cat}
                        {selectedInCat > 0 && (
                          <span className="ml-2 text-xs text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded-full">
                            {selectedInCat}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-500">{expanded ? '−' : '+'}</span>
                    </button>

                    {expanded && (
                      <div className="p-3 space-y-1">
                        {catTests.map(test => {
                          const isSelected = selectedTests.some(t => t.name === test.name);
                          return (
                            <div key={test.name}>
                              <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/30 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleTest(test.name, test.category)}
                                  className="w-4 h-4 rounded border-gray-600 text-primary-600 focus:ring-primary-500 bg-gray-800"
                                />
                                <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                                  {test.name}
                                  {DEVICE_LINKED_TESTS.includes(test.name) && (
                                    <span className="ml-2 text-xs text-blue-400">(auto-assigns device)</span>
                                  )}
                                </span>
                              </label>

                              {/* Detail inputs when selected */}
                              {isSelected && test.hasDetails && test.detailsConfig && (
                                <div className="ml-10 mt-1 mb-2 space-y-2">
                                  {test.detailsConfig.map(cfg => (
                                    <div key={cfg.label} className="flex items-center gap-2">
                                      <label className="text-xs text-gray-500 w-32">{cfg.label}:</label>
                                      {cfg.type === 'select' ? (
                                        <select
                                          value={testDetails[test.name]?.[cfg.label] || ''}
                                          onChange={e => updateDetail(test.name, cfg.label, e.target.value)}
                                          className="input-field !py-1 !text-xs flex-1"
                                        >
                                          <option value="">Select...</option>
                                          {cfg.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                      ) : cfg.type === 'number' ? (
                                        <input
                                          type="number"
                                          value={testDetails[test.name]?.[cfg.label] || ''}
                                          onChange={e => updateDetail(test.name, cfg.label, e.target.value)}
                                          min={cfg.min}
                                          max={cfg.max}
                                          className="input-field !py-1 !text-xs flex-1"
                                          placeholder={cfg.placeholder}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={testDetails[test.name]?.[cfg.label] || ''}
                                          onChange={e => updateDetail(test.name, cfg.label, e.target.value)}
                                          className="input-field !py-1 !text-xs flex-1"
                                          placeholder={cfg.placeholder}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Info Checkboxes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Patient Information Options</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={pcp} onChange={e => setPcp(e.target.checked)} className="w-4 h-4 rounded border-gray-600 text-primary-600 bg-gray-800" />
                <span className="text-sm text-gray-300">Update PCP</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={mediterraneanDiet} onChange={e => setMediterraneanDiet(e.target.checked)} className="w-4 h-4 rounded border-gray-600 text-primary-600 bg-gray-800" />
                <span className="text-sm text-gray-300">Mediterranean Diet Info</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={exerciseRegimen} onChange={e => setExerciseRegimen(e.target.checked)} className="w-4 h-4 rounded border-gray-600 text-primary-600 bg-gray-800" />
                <span className="text-sm text-gray-300">Exercise Regimen Info</span>
              </label>
            </div>
          </div>

          {/* Follow-up & Referral */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Follow-Up & Referral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Follow-Up</label>
                <input type="text" value={followup} onChange={e => setFollowup(e.target.value)} className="input-field" placeholder="e.g., 2 weeks, 1 month" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Refer To</label>
                <input type="text" value={referTo} onChange={e => setReferTo(e.target.value)} className="input-field" placeholder="e.g., EP, Vascular, PCP" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Patient Instructions</label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Additional instructions for the patient..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="submit" disabled={submitting || !patientName || selectedTests.length === 0} className="btn-primary px-8 py-3 text-base">
              {submitting ? 'Saving...' : 'Save Order & Generate Tasks'}
            </button>
          </div>
        </form>

        {/* Today's Orders */}
        {todaysOrders.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Orders</h3>
            <div className="card overflow-hidden !p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Tests</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Follow-Up</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Handouts</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {todaysOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-200 font-medium">{order.patientName}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {order.selectedTests.length} test{order.selectedTests.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{order.followup || '—'}</td>
                      <td className="px-4 py-3 text-gray-400">
                        <div className="flex gap-2">
                          {order.mediterraneanDiet && (
                            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">Diet</span>
                          )}
                          {order.exerciseRegimen && (
                            <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">Exercise</span>
                          )}
                          {!order.mediterraneanDiet && !order.exerciseRegimen && '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`/orders/summary?id=${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          Print AVS
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
