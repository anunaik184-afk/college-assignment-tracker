import React, { useState } from 'react';
import { Assignment } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { X, Clock, Calendar, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface Props {
  assignment: Assignment;
  onClose: () => void;
  onSubmitted: () => void;
}

export const SubmitModal: React.FC<Props> = ({
  assignment,
  onClose,
  onSubmitted,
}) => {
  const [note, setNote] = useState(assignment.submission?.submission_note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadlineDate = new Date(assignment.deadline);
  const isPastDeadline = Date.now() > deadlineDate.getTime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please provide a submission note, solution description, or repository link.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.submitAssignment(assignment.id, note.trim());
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit assignment.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {assignment.submission?.submitted_at ? 'Update Submission' : 'Submit Assignment'}
              </h3>
              <p className="text-xs text-slate-500">{assignment.subject} • {assignment.subject_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Assignment Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-slate-900 text-sm">{assignment.title}</h4>
              <PriorityBadge priority={assignment.priority} />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{assignment.description}</p>
            
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                <span>
                  Deadline: <span className="font-semibold text-slate-700">{deadlineDate.toLocaleString()}</span>
                </span>
              </div>
              <StatusBadge status={assignment.calculated_status} size="sm" />
            </div>
          </div>

          {/* Overdue/Late Warning Banner */}
          {isPastDeadline ? (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-2.5 text-purple-800 text-xs">
              <AlertCircle size={16} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice:</span> The official deadline has passed ({deadlineDate.toLocaleDateString()}). Submitting now will record your status as <span className="font-bold uppercase">Late</span>.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">On-time Submission:</span> Submitting before the deadline will mark this assignment as <span className="font-bold uppercase">Completed</span>.
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form id="submission-form" onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Submission Note / Solution Remarks <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                required
                placeholder="Describe your submission, include Git repository link, explanation, or any notes for the lecturer..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Provide concise solution notes, steps taken, or GitHub/drive link for Dr. Priya to review.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="submission-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>{assignment.submission?.submitted_at ? 'Update Submission' : 'Confirm Submission'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
