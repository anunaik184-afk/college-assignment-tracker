import React from 'react';
import { User, StudentStats } from '../../types';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Calendar,
  Shield,
  BookOpen,
  Award,
  Layers,
} from 'lucide-react';

interface Props {
  user: User;
  stats: StudentStats;
}

export const StudentProfile: React.FC<Props> = ({ user, stats }) => {
  const completedTotal = stats.completed + stats.late;
  const completionRate = stats.total > 0 ? Math.round((completedTotal / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {user.name.charAt(0)}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {user.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Student ID: {user.user_id}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600 shrink-0" />
                <span>Class: <strong className="text-slate-800">{user.class}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-600 shrink-0" />
                <span>Section: <strong className="text-slate-800">{user.section}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-indigo-600 shrink-0" />
                <span>Email: <strong className="text-slate-800">{user.email || `${user.user_id.toLowerCase()}@college.edu`}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-indigo-600 shrink-0" />
                <span>Status: <strong className="text-emerald-700">Enrolled & Active</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Performance Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          <span>Academic Assignment Summary</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Assigned</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">On Time</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.completed}</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <span className="text-[11px] font-bold text-purple-700 uppercase">Late</span>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">{stats.late}</div>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Overdue</span>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">{stats.overdue}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Overall Deliverable Completion</span>
            <span className="font-mono text-indigo-600">{completionRate}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${completionRate}%` }}
              className="h-full bg-linear-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
