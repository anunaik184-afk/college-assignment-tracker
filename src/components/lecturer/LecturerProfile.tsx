import React from 'react';
import { User, LecturerStats } from '../../types';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Shield,
  Layers,
  Award,
  FileCheck,
} from 'lucide-react';

interface Props {
  user: User;
  stats: LecturerStats;
}

export const LecturerProfile: React.FC<Props> = ({ user, stats }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {user.name.charAt(0)}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {user.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                Faculty / Lecturer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Faculty ID: {user.user_id}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600 shrink-0" />
                <span>Department: <strong className="text-slate-800">{user.class}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-600 shrink-0" />
                <span>Role / Designation: <strong className="text-slate-800">{user.section}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-indigo-600 shrink-0" />
                <span>Official Email: <strong className="text-slate-800">{user.email || `${user.user_id.toLowerCase()}@college.edu`}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-indigo-600 shrink-0" />
                <span>Authorization: <strong className="text-emerald-700">Course Instructor & Evaluator</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching & Course Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award size={18} className="text-indigo-600" />
          <span>Faculty Coursework & Submissions Summary</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Assignments Created</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalAssignments}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Received On Time</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.completed}</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <span className="text-[11px] font-bold text-purple-700 uppercase">Late Deliveries</span>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">{stats.late}</div>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Overdue Submissions</span>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">{stats.overdue}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
