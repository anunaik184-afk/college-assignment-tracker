import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  LogOut,
  PlusCircle,
  FileCheck,
  Users,
  X,
} from 'lucide-react';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  badgeCounts?: {
    total?: number;
    pending?: number;
    completed?: number;
    overdue?: number;
    upcoming?: number;
  };
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count?: number;
  highlightColor?: string;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  badgeCounts = {},
}) => {
  const { user, logout } = useAuth();
  const isLecturer = user?.role === 'LECTURER';

  const studentNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'assignments',
      label: 'My Assignments',
      icon: FileText,
      count: badgeCounts.total,
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: Clock,
      count: badgeCounts.upcoming,
      highlightColor: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      count: badgeCounts.completed,
      highlightColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: AlertCircle,
      count: badgeCounts.overdue,
      highlightColor: 'text-rose-600 bg-rose-50',
    },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const lecturerNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: FileText,
      count: badgeCounts.total,
    },
    { id: 'create', label: 'Create Assignment', icon: PlusCircle },
    { id: 'submissions', label: 'Submissions', icon: FileCheck },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const navItems = isLecturer ? lecturerNavItems : studentNavItems;

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
              {isLecturer ? 'Lecturer Navigation' : 'Student Navigation'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">
                {user?.name}
              </div>
              <div className="text-xs text-indigo-300 font-mono">
                {user?.user_id}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user?.class}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={isActive ? 'text-white' : 'text-slate-400'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : item.highlightColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
