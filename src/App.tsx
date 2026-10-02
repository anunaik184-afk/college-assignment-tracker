import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentProfile } from './components/student/StudentProfile';
import { SubmitModal } from './components/student/SubmitModal';
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';
import { LecturerAssignments } from './components/lecturer/LecturerAssignments';
import { LecturerSubmissions } from './components/lecturer/LecturerSubmissions';
import { LecturerStudents } from './components/lecturer/LecturerStudents';
import { LecturerProfile } from './components/lecturer/LecturerProfile';
import { AssignmentFormModal } from './components/lecturer/AssignmentFormModal';
import { api } from './services/api';
import {
  Assignment,
  Subject,
  User,
  StudentStats,
  LecturerStats,
  SubmissionOverviewItem,
} from './types';

const MainApp: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Student states
  const [studentAssignments, setStudentAssignments] = useState<Assignment[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats>({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    late: 0,
    upcomingCount: 0,
  });
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);

  // Lecturer states
  const [lecturerAssignments, setLecturerAssignments] = useState<Assignment[]>([]);
  const [lecturerStats, setLecturerStats] = useState<LecturerStats>({
    totalAssignments: 0,
    totalSubmissionsTracked: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    late: 0,
  });
  const [lecturerSubmissions, setLecturerSubmissions] = useState<SubmissionOverviewItem[]>([]);
  const [studentsRoster, setStudentsRoster] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [preselectedAsgForSubmissions, setPreselectedAsgForSubmissions] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // General loading states
  const [dataLoading, setDataLoading] = useState(false);

  // Reset tab when user changes
  useEffect(() => {
    setActiveTab('dashboard');
  }, [user?.id]);

  // Load data according to role
  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      if (user.role === 'STUDENT') {
        const [asgs, stats] = await Promise.all([
          api.getStudentAssignments(),
          api.getStudentStats(),
        ]);
        setStudentAssignments(asgs);
        setStudentStats(stats);
      } else if (user.role === 'LECTURER') {
        const [asgs, stats, subs, roster, subsList] = await Promise.all([
          api.getLecturerAssignments(),
          api.getLecturerStats(),
          api.getLecturerSubmissions(),
          api.getStudents(),
          api.getSubjects(),
        ]);
        setLecturerAssignments(asgs);
        setLecturerStats(stats);
        setLecturerSubmissions(subs);
        setStudentsRoster(roster);
        setSubjects(subsList);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // If auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-indigo-200">
          Loading College Assignment Tracker...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!user) {
    return <LoginPage />;
  }

  // Handle Tab Selection with Guardrails
  const handleSelectTab = (tab: string, filter?: string) => {
    // If student clicks "create" or lecturer-only tabs, block
    if (user.role === 'STUDENT' && ['create', 'submissions', 'students'].includes(tab)) {
      setActiveTab('dashboard');
      return;
    }
    // If lecturer clicks student-only tabs, block
    if (user.role === 'LECTURER' && ['upcoming', 'completed', 'overdue'].includes(tab)) {
      setActiveTab('dashboard');
      return;
    }

    if (user.role === 'LECTURER' && tab === 'create') {
      setCreateModalOpen(true);
      return;
    }

    setActiveTab(tab);
  };

  const handleViewSubmissionsForAsg = (title: string) => {
    setPreselectedAsgForSubmissions(title);
    setActiveTab('submissions');
  };

  // Badge counts for sidebar
  const badgeCounts =
    user.role === 'STUDENT'
      ? {
          total: studentStats.total,
          pending: studentStats.pending,
          completed: studentStats.completed,
          overdue: studentStats.overdue,
          upcoming: studentStats.upcomingCount,
        }
      : {
          total: lecturerStats.totalAssignments,
        };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Navbar
        currentTab={activeTab}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSelectTab={handleSelectTab}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          badgeCounts={badgeCounts}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* STUDENT VIEWS */}
          {user.role === 'STUDENT' && (
            <>
              {activeTab === 'dashboard' && (
                <StudentDashboard
                  user={user}
                  stats={studentStats}
                  assignments={studentAssignments}
                  onSelectTab={handleSelectTab}
                  onOpenSubmitModal={(asg) => setSubmittingAssignment(asg)}
                />
              )}

              {activeTab === 'assignments' && (
                <StudentAssignments
                  assignments={studentAssignments}
                  isLoading={dataLoading}
                  onRefresh={loadData}
                  initialStatusFilter="ALL"
                />
              )}

              {activeTab === 'upcoming' && (
                <StudentAssignments
                  assignments={studentAssignments}
                  isLoading={dataLoading}
                  onRefresh={loadData}
                  initialStatusFilter="UPCOMING"
                />
              )}

              {activeTab === 'completed' && (
                <StudentAssignments
                  assignments={studentAssignments}
                  isLoading={dataLoading}
                  onRefresh={loadData}
                  initialStatusFilter="COMPLETED"
                />
              )}

              {activeTab === 'overdue' && (
                <StudentAssignments
                  assignments={studentAssignments}
                  isLoading={dataLoading}
                  onRefresh={loadData}
                  initialStatusFilter="OVERDUE"
                />
              )}

              {activeTab === 'profile' && (
                <StudentProfile user={user} stats={studentStats} />
              )}
            </>
          )}

          {/* LECTURER VIEWS */}
          {user.role === 'LECTURER' && (
            <>
              {activeTab === 'dashboard' && (
                <LecturerDashboard
                  user={user}
                  stats={lecturerStats}
                  assignments={lecturerAssignments}
                  recentSubmissions={lecturerSubmissions}
                  onSelectTab={handleSelectTab}
                  onOpenCreate={() => setCreateModalOpen(true)}
                />
              )}

              {activeTab === 'assignments' && (
                <LecturerAssignments
                  assignments={lecturerAssignments}
                  subjects={subjects}
                  students={studentsRoster}
                  isLoading={dataLoading}
                  onRefresh={loadData}
                  onViewSubmissionsForAsg={handleViewSubmissionsForAsg}
                />
              )}

              {activeTab === 'submissions' && (
                <LecturerSubmissions
                  submissions={lecturerSubmissions}
                  isLoading={dataLoading}
                  onRefresh={loadData}
                  preselectedAssignment={preselectedAsgForSubmissions}
                />
              )}

              {activeTab === 'students' && (
                <LecturerStudents
                  students={studentsRoster}
                  submissions={lecturerSubmissions}
                />
              )}

              {activeTab === 'profile' && (
                <LecturerProfile user={user} stats={lecturerStats} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Student Submit Modal */}
      {submittingAssignment && (
        <SubmitModal
          assignment={submittingAssignment}
          onClose={() => setSubmittingAssignment(null)}
          onSubmitted={() => {
            setSubmittingAssignment(null);
            loadData();
          }}
        />
      )}

      {/* Lecturer Create Assignment Modal */}
      {createModalOpen && (
        <AssignmentFormModal
          subjects={subjects}
          students={studentsRoster}
          onClose={() => setCreateModalOpen(false)}
          onSaved={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
