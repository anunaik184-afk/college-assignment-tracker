import React, { useState, useEffect } from 'react';
import { Assignment, Subject, User, Priority } from '../../types';
import { api } from '../../services/api';
import { X, Calendar, PlusCircle, CheckCircle2, AlertCircle, Users, BookOpen } from 'lucide-react';

interface Props {
  initialAssignment?: Assignment | null;
  subjects: Subject[];
  students: User[];
  onClose: () => void;
  onSaved: () => void;
}

export const AssignmentFormModal: React.FC<Props> = ({
  initialAssignment,
  subjects,
  students,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(initialAssignment);

  // Form states
  const [title, setTitle] = useState(initialAssignment?.title || '');
  const [subject, setSubject] = useState(
    initialAssignment?.subject || (subjects.length > 0 ? subjects[0].subject_code : 'CS501')
  );
  const [description, setDescription] = useState(initialAssignment?.description || '');
  const [priority, setPriority] = useState<Priority>(initialAssignment?.priority || 'MEDIUM');
  
  // Format deadline for datetime-local input
  const formatForInput = (isoDate?: string) => {
    if (!isoDate) {
      // Default to 5 days in future at 23:59
      const d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      d.setHours(23, 59, 0, 0);
      return d.toISOString().slice(0, 16);
    }
    const d = new Date(isoDate);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [deadline, setDeadline] = useState(formatForInput(initialAssignment?.deadline));
  const [assignedClass, setAssignedClass] = useState(initialAssignment?.assigned_class || 'B.Tech CS 3rd Year');
  const [assignedSection, setAssignedSection] = useState(initialAssignment?.assigned_section || 'All');
  const [targetType, setTargetType] = useState<'CLASS' | 'SECTION' | 'STUDENTS'>('CLASS');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle student toggle
  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !subject.trim() || !deadline) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (targetType === 'STUDENTS' && selectedStudentIds.length === 0) {
      setError('Please select at least one student for the specific students target.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const deadlineIso = new Date(deadline).toISOString();

      if (isEditing && initialAssignment) {
        await api.updateAssignment(initialAssignment.id, {
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim(),
          priority,
          deadline: deadlineIso,
          assigned_class: assignedClass,
          assigned_section: targetType === 'SECTION' ? assignedSection : 'All',
        });
      } else {
        await api.createAssignment({
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim(),
          priority,
          deadline: deadlineIso,
          assigned_class: assignedClass,
          assigned_section: targetType === 'SECTION' ? assignedSection : 'All',
          target_type: targetType,
          student_ids: targetType === 'STUDENTS' ? selectedStudentIds : undefined,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save assignment.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure details, subject, target audience, and submission deadline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="assignment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assignment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement Stack using Python"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>

            {/* Subject and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                >
                  {subjects.map((sub) => (
                    <option key={sub.subject_code} value={sub.subject_code}>
                      {sub.subject_code} - {sub.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                >
                  <option value="HIGH">High Priority (Urgent)</option>
                  <option value="MEDIUM">Medium Priority (Standard)</option>
                  <option value="LOW">Low Priority (Optional/Bonus)</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Submission Deadline <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Submissions after this exact time will automatically be marked as <strong className="text-purple-700 font-bold">Late</strong>; unsubmitted students will become <strong className="text-rose-700 font-bold">Overdue</strong>.
              </p>
            </div>

            {/* Target Audience Selector (Class / Section / Specific Students) */}
            {!isEditing && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Target Audience
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('CLASS')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition cursor-pointer ${
                      targetType === 'CLASS'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    1. Entire Class
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('SECTION')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition cursor-pointer ${
                      targetType === 'SECTION'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    2. Specific Section
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('STUDENTS')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition cursor-pointer ${
                      targetType === 'STUDENTS'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    3. Specific Students
                  </button>
                </div>

                {/* Section selection */}
                {targetType === 'SECTION' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Choose Section
                    </label>
                    <select
                      value={assignedSection}
                      onChange={(e) => setAssignedSection(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    >
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                    </select>
                  </div>
                )}

                {/* Specific students checklist */}
                {targetType === 'STUDENTS' && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">
                        Select Students ({selectedStudentIds.length} chosen)
                      </span>
                      <button
                        type="button"
                        onClick={handleSelectAllStudents}
                        className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto border border-slate-200 bg-white rounded-lg p-2 space-y-1">
                      {students.map((stu) => (
                        <label
                          key={stu.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(stu.id)}
                            onChange={() => toggleStudent(stu.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-mono font-bold text-slate-700">{stu.user_id}</span>
                          <span className="text-slate-900 font-medium">{stu.name}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{stu.section}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assignment Instructions & Requirements <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the problem statement, grading criteria, required file formats, submission instructions..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
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
            form="assignment-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>{isEditing ? 'Update Assignment' : 'Create & Assign'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
