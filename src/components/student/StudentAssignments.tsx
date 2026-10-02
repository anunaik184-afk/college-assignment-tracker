import React, { useState, useMemo } from 'react';
import { Assignment, SubmissionStatus, Priority } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SubmitModal } from './SubmitModal';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  User,
  ArrowUpDown,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  assignments: Assignment[];
  isLoading: boolean;
  onRefresh: () => void;
  initialStatusFilter?: string;
}

export const StudentAssignments: React.FC<Props> = ({
  assignments,
  isLoading,
  onRefresh,
  initialStatusFilter = 'ALL',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEADLINE_ASC' | 'DEADLINE_DESC' | 'CREATED_DESC'>('DEADLINE_ASC');

  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    const map = new Map<string, string>();
    for (const asg of assignments) {
      map.set(asg.subject, asg.subject_name || asg.subject);
    }
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [assignments]);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((asg) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = asg.title.toLowerCase().includes(q);
          const matchSub = asg.subject.toLowerCase().includes(q);
          const matchSubName = (asg.subject_name || '').toLowerCase().includes(q);
          const matchDesc = asg.description.toLowerCase().includes(q);
          if (!matchTitle && !matchSub && !matchSubName && !matchDesc) return false;
        }

        // Status filter
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'UPCOMING') {
            const isFuture = new Date(asg.deadline).getTime() > Date.now();
            if (!(asg.calculated_status === 'PENDING' && isFuture)) return false;
          } else if (asg.calculated_status !== statusFilter) {
            return false;
          }
        }

        // Subject filter
        if (subjectFilter !== 'ALL' && asg.subject !== subjectFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'ALL' && asg.priority !== priorityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'DEADLINE_ASC') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'DEADLINE_DESC') {
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [assignments, searchQuery, statusFilter, subjectFilter, priorityFilter, sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedAssignmentId(expandedAssignmentId === id ? null : id);
  };

  const getRelativeTime = (deadlineIso: string) => {
    const diff = new Date(deadlineIso).getTime() - Date.now();
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diff < 0) {
      if (days === 0) return `${hours} hours overdue`;
      return `${days} day${days > 1 ? 's' : ''} overdue`;
    } else {
      if (days === 0) return `Due in ${hours} hours`;
      return `Due in ${days} day${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search/Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              My Assignments
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredAssignments.length} of {assignments.length} assigned tasks
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by title, subject, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
              <option value="LATE">Late Submission</option>
              <option value="UPCOMING">Upcoming Only</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="DEADLINE_ASC">Deadline: Nearest First</option>
              <option value="DEADLINE_DESC">Deadline: Furthest First</option>
              <option value="CREATED_DESC">Recently Assigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your assignments...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAssignments.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <BookOpen size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No assignments match your criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query, status filters, or subject selections to view assignments.
          </p>
          {(searchQuery || statusFilter !== 'ALL' || subjectFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setSubjectFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Assignments Card List */}
      {!isLoading && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssignments.map((asg) => {
            const isExpanded = expandedAssignmentId === asg.id;
            const deadlineDate = new Date(asg.deadline);
            const isOverdue = asg.calculated_status === 'OVERDUE';
            const isPending = asg.calculated_status === 'PENDING';
            const isCompleted = asg.calculated_status === 'COMPLETED';
            const isLate = asg.calculated_status === 'LATE';

            return (
              <div
                key={asg.id}
                className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-xs hover:shadow-md ${
                  isOverdue
                    ? 'border-rose-200/90'
                    : isPending
                    ? 'border-amber-200/70'
                    : isCompleted
                    ? 'border-emerald-200/80'
                    : 'border-slate-200'
                }`}
              >
                {/* Main Card Content */}
                <div className="p-5 sm:p-6">
                  {/* Top line: Subject code, priority, status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-100">
                        {asg.subject}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                        {asg.subject_name}
                      </span>
                      <PriorityBadge priority={asg.priority} />
                    </div>

                    <StatusBadge status={asg.calculated_status} size="md" />
                  </div>

                  {/* Title & Description preview */}
                  <div className="mt-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {asg.title}
                    </h3>
                    <p className={`text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {asg.description}
                    </p>
                  </div>

                  {/* Meta Information Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Deadline */}
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={14} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
                        <span className={isOverdue ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
                          Deadline: {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Relative time indicator */}
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span className={`font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          {getRelativeTime(asg.deadline)}
                        </span>
                      </div>

                      {/* Lecturer Name */}
                      <div className="flex items-center gap-1 hidden md:flex">
                        <User size={13} className="text-slate-400" />
                        <span>Faculty: {asg.lecturer_name}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Expand / Details Toggle */}
                      <button
                        onClick={() => toggleExpand(asg.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>{isExpanded ? 'Less' : 'Details'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {/* Submit / Update Button */}
                      <button
                        onClick={() => setSelectedAssignmentForSubmit(asg)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isCompleted || isLate
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>
                          {isCompleted || isLate ? 'View / Edit Submission' : 'Submit Assignment'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 bg-slate-50/70 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-5 sm:p-6 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Full Assignment Guidelines
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                          {asg.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned On</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(asg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Group</span>
                          <span className="font-semibold text-slate-800">
                            {asg.assigned_class} ({asg.assigned_section})
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty Member</span>
                          <span className="font-semibold text-slate-800">
                            {asg.lecturer_name}
                          </span>
                        </div>
                      </div>

                      {/* If student has already submitted, show their submission details */}
                      {asg.submission && (
                        <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              Your Recorded Submission
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {asg.submission.submitted_at
                                ? new Date(asg.submission.submitted_at).toLocaleString()
                                : 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono whitespace-pre-wrap">
                            {asg.submission.submission_note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignmentForSubmit && (
        <SubmitModal
          assignment={selectedAssignmentForSubmit}
          onClose={() => setSelectedAssignmentForSubmit(null)}
          onSubmitted={() => {
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
