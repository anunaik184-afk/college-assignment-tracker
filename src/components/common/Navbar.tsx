import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  RotateCcw,
  Menu,
  Shield,
  BookOpen,
} from 'lucide-react';

interface Props {
  currentTab: string;
  onToggleSidebar?: () => void;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onToggleSidebar, onSelectTab }) => {
  const { user, logout, resetDemo } = useAuth();

  const handleReset = async () => {
    if (window.confirm('Reset demo data back to default initial state?')) {
      await resetDemo();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                COLLEGE ASSIGNMENT TRACKER
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">
                Academic Management Portal
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Role Badge, Profile, Demo Controls & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Badge */}
          {user && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.role === 'LECTURER'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {user.role === 'LECTURER' ? <Shield size={12} /> : <BookOpen size={12} />}
              <span className="hidden xs:inline">{user.role === 'LECTURER' ? 'Faculty Portal' : 'Student Portal'}</span>
              <span className="xs:hidden">{user.role}</span>
            </span>
          )}

          {/* User Info chip */}
          {user && (
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-left transition cursor-pointer"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {user.user_id} • {user.section}
                </div>
              </div>
            </button>
          )}

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer"
            title="Reset Demo Data"
          >
            <RotateCcw size={16} />
            <span className="hidden xl:inline text-xs font-medium">Reset Demo</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
            title="Log out of system"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
