import React, { useState, useMemo } from 'react';
import { SubmissionOverviewItem, SubmissionStatus, Priority } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  User as UserIcon,
  BookOpen,
  FileText,
  FileCheck,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';

interface Props {
  submissions: SubmissionOverviewItem[];
  isLoading: boolean;
  onRefresh: () => void;
  preselectedAssignment?: string | null;
}

export const LecturerSubmissions: React.FC<Props> = ({
  submissions,
  isLoading,
  onRefresh,
  preselectedAssignment = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState(preselectedAssignment || 'ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [studentFilter, setStudentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [inspectItem, setInspectItem] = useState<SubmissionOverviewItem | null>(null);

  // Extract unique lists for filters
  const uniqueAssignments = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => set.add(s.assignment_title));
    return Array.from(set);
  }, [submissions]);

  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => map.set(s.subject_code, s.subject_name));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [submissions]);

  const uniqueStudents = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => map.set(s.student_id, `${s.student_name} (${s.student_user_id})`));
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [submissions]);

  // Filtered items
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = item.student_name.toLowerCase().includes(q) || item.student_user_id.toLowerCase().includes(q);
        const matchTitle = item.assignment_title.toLowerCase().includes(q);
        const matchNote = item.submission_note.toLowerCase().includes(q);
        const matchSubject = item.subject_code.toLowerCase().includes(q);
        if (!matchStudent && !matchTitle && !matchNote && !matchSubject) return false;
      }

      // Filter by assignment
      if (assignmentFilter !== 'ALL' && item.assignment_title !== assignmentFilter) {
        return false;
      }

      // Filter by subject
      if (subjectFilter !== 'ALL' && item.subject_code !== subjectFilter) {
        return false;
      }

      // Filter by student
      if (studentFilter !== 'ALL' && item.student_id !== studentFilter) {
        return false;
      }

      // Filter by status
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // Filter by priority
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [
    submissions,
    searchQuery,
    assignmentFilter,
    subjectFilter,
    studentFilter,
    statusFilter,
    priorityFilter,
  ]);

  return (
    <div className="space-y-6">
      {/* Filters Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Student Submissions Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking table for all coursework deliverables across your courses
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, task, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* 5 Criteria Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Assignment Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Assignment
            </label>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Assignments</option>
              {uniqueAssignments.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
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
              {uniqueSubjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Student
            </label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Students</option>
              {uniqueStudents.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.label}
                </option>
              ))}
            </select>
          </div>

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
              <option value="LATE">Late</option>
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
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading student submissions...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSubmissions.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileCheck size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No submissions found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No student submission records match the current filter selection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setAssignmentFilter('ALL');
              setSubjectFilter('ALL');
              setStudentFilter('ALL');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Submissions Table */}
      {!isLoading && filteredSubmissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Student</th>
                  <th className="py-3.5 px-4">Assignment & Subject</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submission Note</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  const deadlineDate = new Date(sub.deadline);
                  const isSubmitted = sub.submitted_at !== null;

                  return (
                    <tr
                      key={`${sub.assignment_id}_${sub.student_id}`}
                      className="hover:bg-slate-50/70 transition"
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900">
                          {sub.student_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {sub.student_user_id} • {sub.student_section}
                        </div>
                      </td>

                      {/* Assignment & Subject */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {sub.assignment_title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                            {sub.subject_code}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">
                            {sub.subject_name}
                          </span>
                          <PriorityBadge priority={sub.priority} size="sm" />
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="font-medium text-xs">
                          {deadlineDate.toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={sub.status} size="sm" />
                        {sub.submitted_at && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Sub: {new Date(sub.submitted_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Submission Note */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {isSubmitted ? (
                          <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                            {sub.submission_note}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic text-xs">
                            No submission yet
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectItem(sub)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Detail Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck size={20} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Submission Details</h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] uppercase font-bold text-slate-400">Student Profile</div>
                <div className="font-bold text-slate-900 text-base">{inspectItem.student_name}</div>
                <div className="text-slate-600 font-mono">
                  ID: {inspectItem.student_user_id} • {inspectItem.student_class} ({inspectItem.student_section})
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] uppercase font-bold text-slate-400">Assignment</div>
                <div className="font-bold text-slate-900">{inspectItem.assignment_title}</div>
                <div className="text-slate-600">
                  {inspectItem.subject_code} - {inspectItem.subject_name}
                </div>
                <div className="text-slate-500 text-xs">
                  Deadline: {new Date(inspectItem.deadline).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">Calculated Dynamic Status:</span>
                <StatusBadge status={inspectItem.status} size="md" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Submission Note
                </label>
                {inspectItem.submitted_at ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {inspectItem.submission_note}
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                      Timestamp: {new Date(inspectItem.submitted_at).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 italic text-center">
                    Student has not submitted a response yet.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
