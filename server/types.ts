export type Role = 'STUDENT' | 'LECTURER';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type SubmissionStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'LATE';

export interface User {
  id: string;
  user_id: string;
  name: string;
  password_hash: string;
  role: Role;
  class: string;
  section: string;
  email?: string;
  created_at: string;
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
  subject: string; // subject_code, e.g. CS501
  priority: Priority;
  created_by: string; // lecturer user id or id
  assigned_class: string; // 'All' or specific class name
  assigned_section: string; // 'All' or specific section like 'Section A'
  deadline: string; // ISO string
  created_at: string; // ISO string
}

export interface AssignmentAssignee {
  id: string;
  assignment_id: string;
  student_id: string; // user id (e.g. STU001 or db id)
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string; // user id
  status: SubmissionStatus;
  submission_note: string;
  submitted_at: string | null;
}

export interface AssignmentWithStatus extends Assignment {
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
