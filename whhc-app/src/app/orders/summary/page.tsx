'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrder } from '@/lib/db';
import { TEST_DESCRIPTIONS } from '@/lib/test-descriptions';
import MediterraneanDietHandout from '@/components/avs/MediterraneanDietHandout';
import ExerciseRegimenHandout from '@/components/avs/ExerciseRegimenHandout';
import type { Order, SelectedTest } from '@/types';

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

/** Group selected tests by category */
function groupByCategory(tests: SelectedTest[]): Record<string, SelectedTest[]> {
  const groups: Record<string, SelectedTest[]> = {};
  for (const t of tests) {
    const cat = t.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(t);
  }
  return groups;
}

export default function OrderSummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-500">Loading...</p></div>}>
      <OrderSummaryContent />
    </Suspense>
  );
}

function OrderSummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrder(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-700 text-lg">Order not found.</p>
        <button
          onClick={() => router.push('/orders')}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const grouped = groupByCategory(order.selectedTests);

  return (
    <>
      <style jsx global>{`
        .page-divider {
          border: none;
          border-top: 2px dashed #d1d5db;
          margin: 0;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .page-divider {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Action bar — hidden in print */}
        <div className="no-print flex gap-3 p-4 bg-gray-100 border-b sticky top-0 z-10">
          <button
            onClick={() => {
              // Summary opens in a new tab (target="_blank"), so close it.
              // If window.close() is blocked (e.g. not opened by script), fall back to navigation.
              window.close();
              router.push('/orders');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Back to Orders
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Print After Visit Summary
          </button>
        </div>

        {/* ── PAGE 1: After Visit Summary ────────────────────────── */}
        <div className="max-w-3xl mx-auto px-8 py-12 text-black">
          {/* WHHC Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-wide">West Houston Heart Center</h1>
            <div className="mt-1 text-sm text-gray-500">1140 Business Center Dr. Ste 300, Houston, TX 77043</div>
            <div className="text-sm text-gray-500">Phone: 832-271-5897 | Fax: 1 (877) 669-0063</div>
          </div>

          <h2 className="text-xl font-bold text-center mb-6 text-red-700">After Visit Summary</h2>

          {/* Welcome */}
          <div className="text-sm leading-relaxed text-gray-700 mb-6">
            <p>
              Thank you for visiting West Houston Heart Center and trusting us with your cardiovascular care.
              Below is a summary of today&apos;s visit, including any tests that have been ordered and important
              follow-up information. If you have any questions, please contact us at{' '}
              <strong>832-271-5897</strong> or reach us through the{' '}
              <strong>Healow patient portal</strong>.
            </p>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wide">Patient Name</span>
                <span className="font-semibold text-gray-900">{order.patientName}</span>
              </div>
              {order.patientDOB && (
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wide">Date of Birth</span>
                  <span className="font-semibold text-gray-900">{formatDateDisplay(order.patientDOB)}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wide">Date of Service</span>
                <span className="font-semibold text-gray-900">{formatDateDisplay(order.dateOfService)}</span>
              </div>
            </div>
          </div>

          {/* Ordered Tests */}
          {order.selectedTests.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-300 pb-1">
                Tests &amp; Procedures Ordered
              </h3>
              {Object.entries(grouped).map(([category, tests]) => (
                <div key={category} className="mb-3 avoid-break">
                  <p className="font-semibold text-xs text-red-700 uppercase tracking-wide mb-1">{category}</p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    {tests.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>
                          <strong>{t.name}</strong>
                          {t.details && typeof t.details === 'object' && Object.keys(t.details).length > 0 && (
                            <span className="text-gray-500 ml-1">
                              — {Object.entries(t.details).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Follow-Up */}
          {order.followup && (
            <div className="mb-6 avoid-break">
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-300 pb-1">
                Follow-Up
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Follow up in:</strong> {order.followup}</p>
                <p className="mt-2">
                  <strong>Appointment Date:</strong>{' '}
                  <span className="inline-block border-b-2 border-gray-400 w-64 ml-1">&nbsp;</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please call our office at 832-271-5897 to schedule your follow-up appointment.
                </p>
              </div>
            </div>
          )}

          {/* Referral */}
          {order.referTo && (
            <div className="mb-6 avoid-break">
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-300 pb-1">
                Referral
              </h3>
              <p className="text-sm text-gray-700">
                You have been referred to: <strong>{order.referTo}</strong>
              </p>
            </div>
          )}

          {/* Instructions */}
          {order.instructions && (
            <div className="mb-6 avoid-break">
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-300 pb-1">
                Additional Instructions
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.instructions}</p>
            </div>
          )}

          {/* Understanding Your Tests */}
          {order.selectedTests.length > 0 && (
            <div className="mb-6 avoid-break">
              <h3 className="font-bold text-sm uppercase tracking-wide text-red-700 mb-3 border-b border-red-200 pb-1">
                Understanding Your Tests
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Below are descriptions of the tests ordered during your visit to help you understand what to expect.
              </p>
              {order.selectedTests.map((test, i) => {
                const desc = TEST_DESCRIPTIONS[test.name];
                if (!desc) return null;
                return (
                  <div key={i} className="mb-4 pb-4 border-b border-gray-200 last:border-0 avoid-break">
                    <p className="font-semibold text-red-700 text-sm">{test.name}</p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Show Policy */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6 avoid-break">
            <h3 className="font-bold text-yellow-800 text-sm mb-2">No Show / Cancellation Policy</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Please be aware that not cancelling your appointment at least <strong>24 hours</strong> in
              advance or failing to show up for a scheduled test or procedure may result in a{' '}
              <strong>no-show fee</strong>. This policy helps us provide timely care to all our patients.
              If you need to reschedule, please call us as soon as possible at 832-271-5897.
            </p>
          </div>

          {/* Doctor Footer */}
          <div className="text-center text-xs text-gray-400 mt-10 pt-4 border-t border-gray-200">
            <p className="font-semibold text-gray-600">Dr. Humayun Naqvi, MD, MBA, FACC</p>
            <p>West Houston Heart Center</p>
            <p>1140 Business Center Dr. Ste 300, Houston, TX 77043</p>
            <p>Phone: 832-271-5897 | Fax: 1 (877) 669-0063</p>
            <p>www.htxheart.com</p>
          </div>
        </div>

        {/* ── PAGE 2: Mediterranean Diet Handout (if selected) ──── */}
        {order.mediterraneanDiet && (
          <>
            <hr className="page-divider" />
            <div className="page-break max-w-3xl mx-auto px-8 py-12 text-black">
              <MediterraneanDietHandout />
            </div>
          </>
        )}

        {/* ── PAGE 3: Exercise Regimen Handout (if selected) ───── */}
        {order.exerciseRegimen && (
          <>
            <hr className="page-divider" />
            <div className="page-break max-w-3xl mx-auto px-8 py-12 text-black">
              <ExerciseRegimenHandout />
            </div>
          </>
        )}
      </div>
    </>
  );
}
