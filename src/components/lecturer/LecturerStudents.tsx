import React, { useState } from 'react';
import { User, SubmissionOverviewItem } from '../../types';
import { Users, Search, Mail, Layers, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  students: User[];
  submissions: SubmissionOverviewItem[];
}

export const LecturerStudents: React.FC<Props> = ({ students, submissions }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.user_id.toLowerCase().includes(q) || s.section.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Class Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of enrolled students across active academic sections
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((stu) => {
          const studentSubs = submissions.filter((s) => s.student_id === stu.id);
          const completedCount = studentSubs.filter((s) => s.status === 'COMPLETED' || s.status === 'LATE').length;
          const pendingCount = studentSubs.filter((s) => s.status === 'PENDING').length;
          const overdueCount = studentSubs.filter((s) => s.status === 'OVERDUE').length;

          return (
            <div
              key={stu.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {stu.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{stu.name}</h3>
                  <div className="text-xs text-indigo-600 font-mono font-semibold">
                    {stu.user_id}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Class:</span>
                  <span className="font-semibold text-slate-800">{stu.class}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Section:</span>
                  <span className="font-semibold text-slate-800">{stu.section}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-700">{stu.email || `${stu.user_id.toLowerCase()}@college.edu`}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                  <span className="block font-bold text-sm">{completedCount}</span>
                  <span className="text-[10px]">Submitted</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                  <span className="block font-bold text-sm">{pendingCount}</span>
                  <span className="text-[10px]">Pending</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-800">
                  <span className="block font-bold text-sm">{overdueCount}</span>
                  <span className="text-[10px]">Overdue</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
