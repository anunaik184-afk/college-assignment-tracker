export type Role = 'STUDENT' | 'LECTURER';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type SubmissionStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'LATE';

export interface User {
  id: string;
  user_id: string;
  name: string;
  role: Role;
  class: string;
  section: string;
  email?: string;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: Priority;
  created_by: string;
  assigned_class: string;
  assigned_section: string;
  deadline: string;
  created_at: string;
  subject_name?: string;
  lecturer_name?: string;
  calculated_status: SubmissionStatus;
  submission?: {
    id: string;
    submission_note: string;
    submitted_at: string | null;
    status: SubmissionStatus;
  } | null;
}

export interface SubmissionOverviewItem {
  id: string;
  assignment_id: string;
  assignment_title: string;
  subject_code: string;
  subject_name: string;
  priority: Priority;
  deadline: string;
  student_id: string;
  student_user_id: string;
  student_name: string;
  student_class: string;
  student_section: string;
  status: SubmissionStatus;
  submission_note: string;
  submitted_at: string | null;
}

export interface StudentStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  late: number;
  upcomingCount: number;
}

export interface LecturerStats {
  totalAssignments: number;
  totalSubmissionsTracked: number;
  pending: number;
  completed: number;
  overdue: number;
  late: number;
}
