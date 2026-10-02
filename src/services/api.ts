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
const TOKEN_KEY = 'college_assignment_tracker_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function removeStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

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
    const data = await handleResponse<{ token: string; user: User }>(res);
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await authFetch(`${API_BASE}/auth/me`);
    return handleResponse<{ user: User }>(res);
  },

  async logout(): Promise<void> {
    try {
      await authFetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
      });
    } finally {
      removeStoredToken();
    }
  },

  // Student
  async getStudentAssignments(): Promise<Assignment[]> {
    const res = await authFetch(`${API_BASE}/student/assignments`);
    return handleResponse<Assignment[]>(res);
  },

  async getStudentStats(): Promise<StudentStats> {
    const res = await authFetch(`${API_BASE}/student/stats`);
    return handleResponse<StudentStats>(res);
  },

  async submitAssignment(assignmentId: string, submissionNote: string): Promise<any> {
    const res = await authFetch(`${API_BASE}/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_note: submissionNote }),
    });
    return handleResponse(res);
  },

  // Lecturer
  async getLecturerAssignments(): Promise<Assignment[]> {
    const res = await authFetch(`${API_BASE}/lecturer/assignments`);
    return handleResponse<Assignment[]>(res);
  },

  async getLecturerStats(): Promise<LecturerStats> {
    const res = await authFetch(`${API_BASE}/lecturer/stats`);
    return handleResponse<LecturerStats>(res);
  },

  async getLecturerSubmissions(): Promise<SubmissionOverviewItem[]> {
    const res = await authFetch(`${API_BASE}/lecturer/submissions`);
    return handleResponse<SubmissionOverviewItem[]>(res);
  },

  async getStudents(): Promise<User[]> {
    const res = await authFetch(`${API_BASE}/lecturer/students`);
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
    const res = await authFetch(`${API_BASE}/lecturer/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    const res = await authFetch(`${API_BASE}/lecturer/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Assignment>(res);
  },

  async deleteAssignment(assignmentId: string): Promise<{ success: boolean }> {
    const res = await authFetch(`${API_BASE}/lecturer/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Subjects & Shared
  async getSubjects(): Promise<Subject[]> {
    const res = await authFetch(`${API_BASE}/subjects`);
    return handleResponse<Subject[]>(res);
  },

  async resetDemoData(): Promise<{ success: boolean }> {
    const res = await authFetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
    });
    return handleResponse<{ success: boolean }>(res);
  },
};
