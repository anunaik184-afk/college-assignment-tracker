import {
  User,
  Subject,
  Assignment,
  SubmissionOverviewItem,
  StudentStats,
  LecturerStats,
  Priority,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}: ${res.statusText}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async login(user_id: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, password }),
      credentials: 'include',
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });
    return handleResponse<{ user: User }>(res);
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  // Student
  async getStudentAssignments(): Promise<Assignment[]> {
    const res = await fetch(`${API_BASE}/student/assignments`, {
      credentials: 'include',
    });
    return handleResponse<Assignment[]>(res);
  },

  async getStudentStats(): Promise<StudentStats> {
    const res = await fetch(`${API_BASE}/student/stats`, {
      credentials: 'include',
    });
    return handleResponse<StudentStats>(res);
  },

  async submitAssignment(assignmentId: string, submissionNote: string): Promise<any> {
    const res = await fetch(`${API_BASE}/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_note: submissionNote }),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // Lecturer
  async getLecturerAssignments(): Promise<Assignment[]> {
    const res = await fetch(`${API_BASE}/lecturer/assignments`, {
      credentials: 'include',
    });
    return handleResponse<Assignment[]>(res);
  },

  async getLecturerStats(): Promise<LecturerStats> {
    const res = await fetch(`${API_BASE}/lecturer/stats`, {
      credentials: 'include',
    });
    return handleResponse<LecturerStats>(res);
  },

  async getLecturerSubmissions(): Promise<SubmissionOverviewItem[]> {
    const res = await fetch(`${API_BASE}/lecturer/submissions`, {
      credentials: 'include',
    });
    return handleResponse<SubmissionOverviewItem[]>(res);
  },

  async getStudents(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/lecturer/students`, {
      credentials: 'include',
    });
    return handleResponse<User[]>(res);
  },

  async createAssignment(payload: {
    title: string;
    subject: string;
    description: string;
    priority: Priority;
    deadline: string;
    assigned_class: string;
    assigned_section: string;
    target_type: 'CLASS' | 'SECTION' | 'STUDENTS';
    student_ids?: string[];
  }): Promise<Assignment> {
    const res = await fetch(`${API_BASE}/lecturer/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return handleResponse<Assignment>(res);
  },

  async updateAssignment(
    assignmentId: string,
    payload: {
      title?: string;
      subject?: string;
      description?: string;
      priority?: Priority;
      deadline?: string;
      assigned_class?: string;
      assigned_section?: string;
    }
  ): Promise<Assignment> {
    const res = await fetch(`${API_BASE}/lecturer/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return handleResponse<Assignment>(res);
  },

  async deleteAssignment(assignmentId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/lecturer/assignments/${assignmentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Subjects & Shared
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${API_BASE}/subjects`, {
      credentials: 'include',
    });
    return handleResponse<Subject[]>(res);
  },

  async resetDemoData(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ success: boolean }>(res);
  },
};
