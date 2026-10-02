import React, { useState, useMemo } from 'react';
import { Assignment, Subject, User } from '../../types';
import { api } from '../../services/api';
import { PriorityBadge } from '../common/PriorityBadge';
import { AssignmentFormModal } from './AssignmentFormModal';
import {
  PlusCircle,
  Search,
  Calendar,
  Edit2,
  Trash2,
  AlertTriangle,
  BookOpen,
  Users,
  FileText,
  Clock,
} from 'lucide-react';

interface Props {
  assignments: Assignment[];
  subjects: Subject[];
  students: User[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewSubmissionsForAsg?: (assignmentTitle: string) => void;
}

export const LecturerAssignments: React.FC<Props> = ({
  assignments,
  subjects,
  students,
  isLoading,
  onRefresh,
  onViewSubmissionsForAsg,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Delete confirmation modal state
  const [deleteConfirmAsg, setDeleteConfirmAsg] = useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = asg.title.toLowerCase().includes(q);
        const matchSubject = asg.subject.toLowerCase().includes(q);
        const matchDesc = asg.description.toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchDesc) return false;
      }
      if (subjectFilter !== 'ALL' && asg.subject !== subjectFilter) return false;
      if (priorityFilter !== 'ALL' && asg.priority !== priorityFilter) return false;
      return true;
    });
  }, [assignments, searchQuery, subjectFilter, priorityFilter]);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmAsg) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteAssignment(deleteConfirmAsg.id);
      setDeleteConfirmAsg(null);
      onRefresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Manage Assignments
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, update, and manage coursework assigned to your classes
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle size={16} />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.subject_code} value={s.subject_code}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
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
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading assignments...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAssignments.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <BookOpen size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No assignments found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            You have not created any assignments matching this criteria yet.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer"
          >
            Create Your First Assignment
          </button>
        </div>
      )}

      {/* List */}
      {!isLoading && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssignments.map((asg) => {
            const deadlineDate = new Date(asg.deadline);
            const isPast = Date.now() > deadlineDate.getTime();

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-100">
                        {asg.subject}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {asg.subject_name}
                      </span>
                      <PriorityBadge priority={asg.priority} />
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Users size={13} className="text-slate-400" />
                        {asg.assigned_class} • {asg.assigned_section}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {asg.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {asg.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={14} className={isPast ? 'text-rose-500' : 'text-slate-400'} />
                        <span className={isPast ? 'text-rose-600' : 'text-slate-700'}>
                          Deadline: {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Created: {new Date(asg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    {onViewSubmissionsForAsg && (
                      <button
                        onClick={() => onViewSubmissionsForAsg(asg.title)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
                        title="View student submissions for this assignment"
                      >
                        Submissions
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(asg)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Edit Assignment"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmAsg(asg)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Delete Assignment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Create / Edit Modal */}
      {modalOpen && (
        <AssignmentFormModal
          initialAssignment={editingAssignment}
          subjects={subjects}
          students={students}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            onRefresh();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Assignment?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900">"{deleteConfirmAsg.title}"</strong>?
                All student submission records for this assignment will also be removed. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAsg(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
