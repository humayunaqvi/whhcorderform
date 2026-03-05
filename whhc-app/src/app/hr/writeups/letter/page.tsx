'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getWriteUp } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { WriteUp, WriteUpType } from '@/types';

const WRITEUP_TYPE_LABELS: Record<WriteUpType, string> = {
  verbal_warning: 'Verbal Warning',
  written_warning: 'Written Warning',
  final_warning: 'Final Warning',
  suspension: 'Suspension',
  termination: 'Termination',
};

export default function WriteUpLetterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-500">Loading...</p></div>}>
      <WriteUpLetterContent />
    </Suspense>
  );
}

function WriteUpLetterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';

  const [writeUp, setWriteUp] = useState<WriteUp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getWriteUp(id).then((wu) => {
      setWriteUp(wu);
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

  if (!writeUp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-700 text-lg">Write-up not found.</p>
        <button
          onClick={() => router.push('/hr/writeups')}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Back to Write-Ups
        </button>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Action buttons - hidden in print */}
        <div className="no-print flex gap-3 p-4 bg-gray-100 border-b">
          <button
            onClick={() => router.push('/hr/writeups')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Back
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Print
          </button>
        </div>

        {/* Letter Content */}
        <div className="max-w-3xl mx-auto px-8 py-12 text-black">
          {/* Company Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-wide">West Houston Heart Center</h1>
            <div className="mt-1 text-sm text-gray-500">1140 Business Center Dr. Ste 300, Houston, TX 77043</div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-8 underline">
            Employee Disciplinary Notice
          </h2>

          {/* Details */}
          <div className="space-y-3 mb-8 text-sm">
            <div className="flex">
              <span className="font-semibold w-44">Date:</span>
              <span>{formatDate(writeUp.date)}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-44">Employee Name:</span>
              <span>{writeUp.employeeName}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-44">Type of Action:</span>
              <span>{WRITEUP_TYPE_LABELS[writeUp.type]}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-44">Subject:</span>
              <span>{writeUp.subject}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-44">Issued By:</span>
              <span>{writeUp.issuedBy}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <h3 className="font-semibold text-sm mb-2">Description of Incident / Reason for Action:</h3>
            <div className="border border-gray-300 rounded p-4 min-h-[150px] text-sm whitespace-pre-wrap leading-relaxed">
              {writeUp.description}
            </div>
          </div>

          {/* Acknowledgement */}
          <div className="mb-12 text-sm leading-relaxed">
            <p>
              By signing below, the employee acknowledges receipt of this disciplinary notice. The
              employee&apos;s signature does not necessarily indicate agreement with the content, only
              that the employee has been informed.
            </p>
          </div>

          {/* Signature Lines */}
          <div className="space-y-10 mt-16">
            <div className="flex gap-12">
              <div className="flex-1">
                <div className="border-b border-gray-400 mb-1 h-8" />
                <p className="text-sm font-semibold">Employee Signature</p>
              </div>
              <div className="w-48">
                <div className="border-b border-gray-400 mb-1 h-8" />
                <p className="text-sm font-semibold">Date</p>
              </div>
            </div>

            <div className="flex gap-12">
              <div className="flex-1">
                <div className="border-b border-gray-400 mb-1 h-8" />
                <p className="text-sm font-semibold">Supervisor Signature</p>
              </div>
              <div className="w-48">
                <div className="border-b border-gray-400 mb-1 h-8" />
                <p className="text-sm font-semibold">Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
