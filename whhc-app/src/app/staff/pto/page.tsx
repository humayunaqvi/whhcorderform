'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { useAuth } from '@/lib/auth-context';
import { getUserData } from '@/lib/auth';
import {
  createVacationRequest,
  getVacationRequests,
  updateVacationStatus,
  createEmployeeRequest,
  getEmployeeRequests,
  submitFeedback,
} from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { VacationRequest, EmployeeRequest, TimeSlot, RequestType } from '@/types';

export default function PTOPage() {
  const { session } = useAuth();

  // PTO balance
  const [ptoBalance, setPtoBalance] = useState(0);
  const [ptoUsed, setPtoUsed] = useState(0);

  // Vacation request form
  const [vacStartDate, setVacStartDate] = useState('');
  const [vacEndDate, setVacEndDate] = useState('');
  const [vacTimeSlot, setVacTimeSlot] = useState<TimeSlot>('full_day');
  const [vacReason, setVacReason] = useState('');
  const [vacCountAsPto, setVacCountAsPto] = useState(true);
  const [vacSubmitting, setVacSubmitting] = useState(false);

  // Vacation requests list
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);

  // Employee request form
  const [empType, setEmpType] = useState<RequestType>('evaluation');
  const [empSubject, setEmpSubject] = useState('');
  const [empDescription, setEmpDescription] = useState('');
  const [empSubmitting, setEmpSubmitting] = useState(false);

  // Employee requests list
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequest[]>([]);

  // Anonymous feedback form
  const [fbCategory, setFbCategory] = useState('workplace');
  const [fbMessage, setFbMessage] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);

  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    if (!session) return;
    async function load() {
      try {
        const [userData, vacReqs, empReqs] = await Promise.all([
          getUserData(session!.username),
          getVacationRequests({ userId: session!.userId }),
          getEmployeeRequests({ userId: session!.userId }),
        ]);
        if (userData) {
          setPtoBalance(userData.ptoBalance || 0);
          setPtoUsed(userData.ptoUsed || 0);
        }
        setVacationRequests(vacReqs);
        setEmployeeRequests(empReqs);
      } catch (err) {
        console.error('PTO page load error:', err);
      }
      setLoading(false);
    }
    load();
  }, [session]);

  // Submit vacation request
  const handleVacationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !vacStartDate || !vacEndDate) return;
    setVacSubmitting(true);
    try {
      await createVacationRequest({
        userId: session.userId,
        username: session.username,
        displayName: session.displayName,
        startDate: vacStartDate,
        endDate: vacEndDate,
        timeSlot: vacTimeSlot,
        reason: vacReason,
        countAsPto: vacCountAsPto,
      });
      // Refresh list
      const reqs = await getVacationRequests({ userId: session.userId });
      setVacationRequests(reqs);
      // Reset form
      setVacStartDate('');
      setVacEndDate('');
      setVacTimeSlot('full_day');
      setVacReason('');
      setVacCountAsPto(true);
    } catch (err) {
      console.error('Vacation request error:', err);
    }
    setVacSubmitting(false);
  };

  // Cancel vacation request
  const handleCancelVacation = async (reqId: string) => {
    if (!session) return;
    await updateVacationStatus(reqId, 'cancelled', session.username);
    const reqs = await getVacationRequests({ userId: session.userId });
    setVacationRequests(reqs);
  };

  // Submit employee request
  const handleEmployeeRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !empSubject) return;
    setEmpSubmitting(true);
    try {
      await createEmployeeRequest({
        userId: session.userId,
        username: session.username,
        displayName: session.displayName,
        type: empType,
        subject: empSubject,
        description: empDescription,
      });
      const reqs = await getEmployeeRequests({ userId: session.userId });
      setEmployeeRequests(reqs);
      setEmpSubject('');
      setEmpDescription('');
      setEmpType('evaluation');
    } catch (err) {
      console.error('Employee request error:', err);
    }
    setEmpSubmitting(false);
  };

  // Submit anonymous feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim()) return;
    setFbSubmitting(true);
    try {
      await submitFeedback(fbMessage, fbCategory);
      setFbMessage('');
      setFbCategory('workplace');
      setFbSuccess(true);
      setTimeout(() => setFbSuccess(false), 3000);
    } catch (err) {
      console.error('Feedback submit error:', err);
    }
    setFbSubmitting(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-900/30 text-amber-400';
      case 'approved':
      case 'reviewed':
      case 'resolved':
        return 'bg-emerald-900/30 text-emerald-400';
      case 'denied':
        return 'bg-red-900/30 text-red-400';
      case 'cancelled':
        return 'bg-gray-800 text-gray-500';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <AppShell allowedRoles={['physician', 'admin', 'clinical', 'staff']}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">PTO &amp; Requests</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-8">
            {/* PTO Balance Card */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                PTO Balance
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{ptoBalance}</p>
                  <p className="text-xs text-gray-500 uppercase mt-1">Total Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{ptoUsed}</p>
                  <p className="text-xs text-gray-500 uppercase mt-1">Used</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {Math.max(0, ptoBalance - ptoUsed)}
                  </p>
                  <p className="text-xs text-gray-500 uppercase mt-1">Remaining</p>
                </div>
              </div>
            </div>

            {/* Vacation Request Form */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                Request Vacation
              </h3>
              <form onSubmit={handleVacationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={vacStartDate}
                      onChange={(e) => setVacStartDate(e.target.value)}
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={vacEndDate}
                      onChange={(e) => setVacEndDate(e.target.value)}
                      className="input-field w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time Slot</label>
                  <select
                    value={vacTimeSlot}
                    onChange={(e) => setVacTimeSlot(e.target.value as TimeSlot)}
                    className="input-field w-full"
                  >
                    <option value="full_day">Full Day</option>
                    <option value="morning">Morning Only</option>
                    <option value="afternoon">Afternoon Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reason</label>
                  <textarea
                    value={vacReason}
                    onChange={(e) => setVacReason(e.target.value)}
                    className="input-field w-full"
                    rows={3}
                    placeholder="Reason for request..."
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vacCountAsPto}
                    onChange={(e) => setVacCountAsPto(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-primary-600 bg-gray-800"
                  />
                  Count as PTO
                </label>
                <button type="submit" disabled={vacSubmitting} className="btn-primary">
                  {vacSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {/* My Vacation Requests */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                My Vacation Requests
              </h3>
              {vacationRequests.length === 0 ? (
                <p className="text-gray-600 text-sm italic text-center py-6">
                  No vacation requests submitted.
                </p>
              ) : (
                <div className="space-y-3">
                  {vacationRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-gray-800/30 rounded-lg p-4"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">
                          {formatDate(req.startDate)} - {formatDate(req.endDate)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.timeSlot === 'full_day'
                            ? 'Full Day'
                            : req.timeSlot === 'morning'
                            ? 'Morning'
                            : 'Afternoon'}
                          {req.reason && ` - ${req.reason}`}
                        </p>
                        {req.countAsPto && (
                          <p className="text-xs text-gray-500 mt-0.5">Counts as PTO</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleCancelVacation(req.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Employee Request Form */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                Employee Request
              </h3>
              <form onSubmit={handleEmployeeRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={empType}
                    onChange={(e) => setEmpType(e.target.value as RequestType)}
                    className="input-field w-full"
                  >
                    <option value="evaluation">Evaluation</option>
                    <option value="discussion">Discussion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subject</label>
                  <input
                    type="text"
                    value={empSubject}
                    onChange={(e) => setEmpSubject(e.target.value)}
                    className="input-field w-full"
                    placeholder="Brief subject..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={empDescription}
                    onChange={(e) => setEmpDescription(e.target.value)}
                    className="input-field w-full"
                    rows={3}
                    placeholder="Describe your request..."
                  />
                </div>
                <button type="submit" disabled={empSubmitting} className="btn-primary">
                  {empSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>

              {/* My Employee Requests List */}
              {employeeRequests.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                    My Requests
                  </p>
                  <div className="space-y-2">
                    {employeeRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3"
                      >
                        <div>
                          <p className="text-sm text-white">{req.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {req.type} - {formatDate(req.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Anonymous Feedback */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 pb-2 border-b border-gray-800">
                Anonymous Feedback
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                This feedback is completely anonymous. No identifying information is stored.
              </p>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="workplace">Workplace</option>
                    <option value="management">Management</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Message</label>
                  <textarea
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    className="input-field w-full"
                    rows={4}
                    placeholder="Share your feedback..."
                    required
                  />
                </div>
                <button type="submit" disabled={fbSubmitting} className="btn-primary">
                  {fbSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                {fbSuccess && (
                  <p className="text-sm text-emerald-400">Feedback submitted successfully!</p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
