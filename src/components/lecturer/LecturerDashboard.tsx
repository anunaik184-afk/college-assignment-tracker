import React from 'react';
import { User, LecturerStats, Assignment, SubmissionOverviewItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  Users,
  FileCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  user: User;
  stats: LecturerStats;
  assignments: Assignment[];
  recentSubmissions: SubmissionOverviewItem[];
  onSelectTab: (tab: string, filter?: string) => void;
  onOpenCreate: () => void;
}

export const LecturerDashboard: React.FC<Props> = ({
  user,
  stats,
  assignments,
  recentSubmissions,
  onSelectTab,
  onOpenCreate,
}) => {
  const completedTotal = stats.completed + stats.late;
  const overallRate =
    stats.totalSubmissionsTracked > 0
      ? Math.round((completedTotal / stats.totalSubmissionsTracked) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-700/60 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles size={14} />
            <span>Faculty Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Manage coursework, monitor student deliverables across classes, and assess submission timelines.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>Create New Assignment</span>
            </button>
            <button
              onClick={() => onSelectTab('submissions')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <FileCheck size={16} />
              <span>Review Submissions ({stats.totalSubmissionsTracked})</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Assignments Created */}
        <div
          onClick={() => onSelectTab('assignments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Created
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.totalAssignments}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Active assignments</div>
        </div>

        {/* Pending Submissions */}
        <div
          onClick={() => onSelectTab('submissions', 'PENDING')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center transition">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {stats.pending}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">Awaiting student work</div>
        </div>

        {/* Completed Submissions */}
        <div
          onClick={() => onSelectTab('submissions', 'COMPLETED')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats.completed}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Submitted on time</div>
        </div>

        {/* Overdue Submissions */}
        <div
          onClick={() => onSelectTab('submissions', 'OVERDUE')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Overdue
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center transition">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
            {stats.overdue}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">Deadlines breached</div>
        </div>

        {/* Late Submissions */}
        <div
          onClick={() => onSelectTab('submissions', 'LATE')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Late
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center transition">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
            {stats.late}
          </div>
          <div className="mt-1 text-[11px] text-purple-600 font-medium">Turned in past due</div>
        </div>
      </div>

      {/* Cohort Submission Compliance Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Class Submission Compliance Rate
            </span>
          </div>
          <span className="text-xs font-extrabold text-indigo-700 font-mono">
            {overallRate}% ({completedTotal} of {stats.totalSubmissionsTracked} slots)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${stats.totalSubmissionsTracked > 0 ? (stats.completed / stats.totalSubmissionsTracked) * 100 : 0}%` }}
            className="bg-emerald-500"
            title={`Completed on time: ${stats.completed}`}
          />
          <div
            style={{ width: `${stats.totalSubmissionsTracked > 0 ? (stats.late / stats.totalSubmissionsTracked) * 100 : 0}%` }}
            className="bg-purple-500"
            title={`Late submissions: ${stats.late}`}
          />
          <div
            style={{ width: `${stats.totalSubmissionsTracked > 0 ? (stats.overdue / stats.totalSubmissionsTracked) * 100 : 0}%` }}
            className="bg-rose-500"
            title={`Overdue: ${stats.overdue}`}
          />
          <div
            style={{ width: `${stats.totalSubmissionsTracked > 0 ? (stats.pending / stats.totalSubmissionsTracked) * 100 : 0}%` }}
            className="bg-amber-400"
            title={`Pending: ${stats.pending}`}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> On Time ({stats.completed})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Late Submissions ({stats.late})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue ({stats.overdue})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending ({stats.pending})
          </span>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Recent Student Activity</h3>
          </div>
          <button
            onClick={() => onSelectTab('submissions')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Submissions Table</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentSubmissions.slice(0, 5).map((item) => (
            <div
              key={`${item.assignment_id}_${item.student_id}`}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                  {item.student_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{item.student_name}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {item.student_user_id} • {item.student_section}
                  </div>
                </div>
              </div>

              <div className="sm:max-w-xs truncate text-slate-700 font-medium">
                {item.assignment_title}
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} size="sm" />
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.submitted_at
                    ? new Date(item.submitted_at).toLocaleDateString()
                    : 'Not submitted'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
