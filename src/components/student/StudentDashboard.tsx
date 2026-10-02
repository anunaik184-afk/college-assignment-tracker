import React from 'react';
import { User, Assignment, StudentStats } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface Props {
  user: User;
  stats: StudentStats;
  assignments: Assignment[];
  onSelectTab: (tab: string, filter?: string) => void;
  onOpenSubmitModal: (assignment: Assignment) => void;
}

export const StudentDashboard: React.FC<Props> = ({
  user,
  stats,
  assignments,
  onSelectTab,
  onOpenSubmitModal,
}) => {
  // Find upcoming assignments (deadline in future and pending)
  const now = Date.now();
  const upcomingAssignments = assignments
    .filter(
      (a) =>
        a.calculated_status === 'PENDING' &&
        new Date(a.deadline).getTime() > now
    )
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Overdue assignments
  const overdueAssignments = assignments
    .filter((a) => a.calculated_status === 'OVERDUE')
    .slice(0, 3);

  // Completion percentage
  const completedTotal = stats.completed + stats.late;
  const completionRate = stats.total > 0 ? Math.round((completedTotal / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-700/60 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles size={14} />
            <span>Student Academic Dashboard • Semester V</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-200 leading-relaxed">
            You are enrolled in <span className="font-semibold text-white">{user.class}</span> ({user.section}). Keep track of your deadlines, submit course deliverables on time, and maintain your academic standing.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('assignments')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <span>View All Assignments</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => onSelectTab('upcoming')}
              className="px-4 py-2.5 rounded-xl bg-indigo-700/50 hover:bg-indigo-700/80 text-white font-semibold text-xs sm:text-sm border border-indigo-500/40 transition flex items-center gap-2 cursor-pointer"
            >
              <Clock size={15} />
              <span>Upcoming Deadlines ({stats.pending})</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Assignments */}
        <div
          onClick={() => onSelectTab('assignments', 'ALL')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Assigned to you</div>
        </div>

        {/* Pending */}
        <div
          onClick={() => onSelectTab('assignments', 'PENDING')}
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
          <div className="mt-1 text-[11px] text-amber-600 font-medium">Awaiting submission</div>
        </div>

        {/* Completed */}
        <div
          onClick={() => onSelectTab('assignments', 'COMPLETED')}
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

        {/* Overdue */}
        <div
          onClick={() => onSelectTab('assignments', 'OVERDUE')}
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
          <div className="mt-1 text-[11px] text-rose-600 font-medium">Missed deadline</div>
        </div>

        {/* Late Submissions */}
        <div
          onClick={() => onSelectTab('assignments', 'LATE')}
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
          <div className="mt-1 text-[11px] text-purple-600 font-medium">Submitted past due</div>
        </div>
      </div>

      {/* Progress & Quick Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Semester Submission Completion Rate
            </span>
          </div>
          <span className="text-xs font-extrabold text-indigo-700 font-mono">
            {completionRate}% ({completedTotal} of {stats.total})
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Completed on time: ${stats.completed}`}
          />
          <div
            style={{ width: `${stats.total > 0 ? (stats.late / stats.total) * 100 : 0}%` }}
            className="bg-purple-500 transition-all duration-500"
            title={`Late submissions: ${stats.late}`}
          />
          <div
            style={{ width: `${stats.total > 0 ? (stats.overdue / stats.total) * 100 : 0}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Overdue: ${stats.overdue}`}
          />
          <div
            style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
            className="bg-amber-400 transition-all duration-500"
            title={`Pending: ${stats.pending}`}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> On Time ({stats.completed})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Late ({stats.late})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue ({stats.overdue})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending ({stats.pending})
          </span>
        </div>
      </div>

      {/* Grid: Upcoming Deadlines & Urgent Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Deadlines</h3>
              </div>
              <button
                onClick={() => onSelectTab('upcoming')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
              >
                View All
              </button>
            </div>

            {upcomingAssignments.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No imminent pending deadlines!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You are all caught up on pending coursework.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map((asg) => {
                  const deadline = new Date(asg.deadline);
                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-start justify-between gap-3 transition"
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {asg.subject}
                          </span>
                          <PriorityBadge priority={asg.priority} size="sm" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {asg.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                          <Calendar size={12} className="text-slate-400" />
                          <span>Due: {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenSubmitModal(asg)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Needed: Overdue Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Attention Needed (Overdue)</h3>
              </div>
              <button
                onClick={() => onSelectTab('overdue')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
              >
                View All
              </button>
            </div>

            {overdueAssignments.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Zero overdue assignments!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Great job keeping on top of your deliverables.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueAssignments.map((asg) => {
                  const deadline = new Date(asg.deadline);
                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 flex items-start justify-between gap-3 transition"
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            {asg.subject}
                          </span>
                          <PriorityBadge priority={asg.priority} size="sm" />
                          <StatusBadge status="OVERDUE" size="sm" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {asg.title}
                        </h4>
                        <div className="text-[11px] text-rose-700 font-medium flex items-center gap-1.5 mt-1">
                          <span>Missed deadline on {deadline.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenSubmitModal(asg)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        Submit Late
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
