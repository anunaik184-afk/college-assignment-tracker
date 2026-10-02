import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db.ts';
import type { User, Role } from './types.ts';

const SESSION_SECRET = process.env.SESSION_SECRET || 'college-assignment-tracker-secret-key-2026';

// Stateless HMAC-signed session helpers (survives container restarts & scaling)
export function createSession(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

export function getSessionUser(token: string | undefined): User | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const data = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (!data.userId || !data.exp || data.exp < Date.now()) {
      return null;
    }
    const user = db.findUserById(data.userId);
    return user || null;
  } catch {
    return null;
  }
}

export function destroySession(_token: string | undefined) {
  // Stateless token invalidated on client-side and cookie clear
}

// Request extension
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Auth Middleware
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // Read token from cookie or Authorization header
  let token = req.cookies?.['cat_token'];
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (token) {
    const user = getSessionUser(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireRole(role: Role) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({
        error: `Access denied. Requires ${role} role, but current role is ${req.user.role}`,
      });
    }
    next();
  };
}

export const apiRouter = express.Router();

// ---------------- AUTH ROUTES ---------------- //

// POST /api/auth/login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ error: 'User ID and password are required' });
  }

  const user = db.findUserByUserId(user_id);
  if (!user) {
    return res.status(401).json({ error: 'Invalid User ID or password' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid User ID or password' });
  }

  const token = createSession(user.id);

  // Set HTTP-only cookie
  res.cookie('cat_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password_hash, ...safeUser } = user;
  return res.json({
    token,
    user: safeUser,
  });
});

// GET /api/auth/me
apiRouter.get(
  '/auth/me',
  authenticate,
  (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { password_hash, ...safeUser } = req.user;
    return res.json({ user: safeUser });
  }
);

// POST /api/auth/logout
apiRouter.post(
  '/auth/logout',
  authenticate,
  (req: AuthenticatedRequest, res: Response) => {
    const token =
      req.cookies?.['cat_token'] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);
    destroySession(token);
    res.clearCookie('cat_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  }
);

// ---------------- STUDENT ROUTES ---------------- //

// GET /api/student/assignments
apiRouter.get(
  '/student/assignments',
  authenticate,
  requireRole('STUDENT'),
  (req: AuthenticatedRequest, res: Response) => {
    const assignments = db.getAssignmentsForStudent(req.user!.id);
    return res.json(assignments);
  }
);

// GET /api/student/stats
apiRouter.get(
  '/student/stats',
  authenticate,
  requireRole('STUDENT'),
  (req: AuthenticatedRequest, res: Response) => {
    const assignments = db.getAssignmentsForStudent(req.user!.id);

    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    let total = assignments.length;
    let pending = 0;
    let completed = 0;
    let overdue = 0;
    let late = 0;
    let upcomingDeadlinesCount = 0;

    for (const asg of assignments) {
      if (asg.calculated_status === 'COMPLETED') completed++;
      else if (asg.calculated_status === 'LATE') late++;
      else if (asg.calculated_status === 'OVERDUE') overdue++;
      else if (asg.calculated_status === 'PENDING') {
        pending++;
        const deadlineTime = new Date(asg.deadline).getTime();
        if (deadlineTime > now && deadlineTime <= now + threeDaysMs) {
          upcomingDeadlinesCount++;
        }
      }
    }

    return res.json({
      total,
      pending,
      completed,
      overdue,
      late,
      upcomingCount: upcomingDeadlinesCount,
    });
  }
);

// POST /api/student/assignments/:id/submit
apiRouter.post(
  '/student/assignments/:id/submit',
  authenticate,
  requireRole('STUDENT'),
  (req: AuthenticatedRequest, res: Response) => {
    const assignmentId = req.params.id;
    const { submission_note } = req.body;

    if (!submission_note || !submission_note.trim()) {
      return res.status(400).json({ error: 'Submission note is required' });
    }

    try {
      const result = db.submitAssignment(
        assignmentId,
        req.user!.id,
        submission_note.trim()
      );
      return res.json({
        success: true,
        submission: result.submission,
        calculated_status: result.calculated_status,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to submit' });
    }
  }
);

// ---------------- LECTURER ROUTES ---------------- //

// GET /api/lecturer/assignments
apiRouter.get(
  '/lecturer/assignments',
  authenticate,
  requireRole('LECTURER'),
  (req: AuthenticatedRequest, res: Response) => {
    const assignments = db.getAssignmentsForLecturer(req.user!.id);
    return res.json(assignments);
  }
);

// POST /api/lecturer/assignments
apiRouter.post(
  '/lecturer/assignments',
  authenticate,
  requireRole('LECTURER'),
  (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      subject,
      description,
      priority,
      deadline,
      assigned_class,
      assigned_section,
      target_type,
      student_ids,
    } = req.body;

    if (!title || !subject || !description || !priority || !deadline) {
      return res.status(400).json({
        error:
          'Title, subject, description, priority, and deadline are required fields.',
      });
    }

    try {
      const asg = db.createAssignment(req.user!.id, {
        title,
        subject,
        description,
        priority: priority || 'MEDIUM',
        deadline,
        assigned_class: assigned_class || 'All',
        assigned_section: assigned_section || 'All',
        target_type: target_type || 'CLASS',
        student_ids: student_ids || [],
      });
      return res.status(201).json(asg);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create assignment' });
    }
  }
);

// PUT /api/lecturer/assignments/:id
apiRouter.put(
  '/lecturer/assignments/:id',
  authenticate,
  requireRole('LECTURER'),
  (req: AuthenticatedRequest, res: Response) => {
    const assignmentId = req.params.id;
    try {
      const updated = db.updateAssignment(assignmentId, req.user!.id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update assignment' });
    }
  }
);

// DELETE /api/lecturer/assignments/:id
apiRouter.delete(
  '/lecturer/assignments/:id',
  authenticate,
  requireRole('LECTURER'),
  (req: AuthenticatedRequest, res: Response) => {
    const assignmentId = req.params.id;
    try {
      db.deleteAssignment(assignmentId, req.user!.id);
      return res.json({ success: true, message: 'Assignment deleted' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to delete assignment' });
    }
  }
);

// GET /api/lecturer/submissions
apiRouter.get(
  '/lecturer/submissions',
  authenticate,
  requireRole('LECTURER'),
  (req: AuthenticatedRequest, res: Response) => {
    const submissions = db.getSubmissionsOverview(req.user!.id);
    return res.json(submissions);
  }
);

// GET /api/lecturer/stats
apiRouter.get(
  '/lecturer/stats',
  authenticate,
  requireRole('LECTURER'),
  (req: AuthenticatedRequest, res: Response) => {
    const submissions = db.getSubmissionsOverview(req.user!.id);
    const assignments = db.getAssignmentsForLecturer(req.user!.id);

    let pending = 0;
    let completed = 0;
    let overdue = 0;
    let late = 0;

    for (const sub of submissions) {
      if (sub.status === 'COMPLETED') completed++;
      else if (sub.status === 'LATE') late++;
      else if (sub.status === 'OVERDUE') overdue++;
      else pending++;
    }

    return res.json({
      totalAssignments: assignments.length,
      totalSubmissionsTracked: submissions.length,
      pending,
      completed,
      overdue,
      late,
    });
  }
);

// GET /api/lecturer/students
apiRouter.get(
  '/lecturer/students',
  authenticate,
  requireRole('LECTURER'),
  (req: AuthenticatedRequest, res: Response) => {
    const students = db.getStudents().map((s) => ({
      id: s.id,
      user_id: s.user_id,
      name: s.name,
      class: s.class,
      section: s.section,
      email: s.email,
    }));
    return res.json(students);
  }
);

// ---------------- SHARED / META ROUTES ---------------- //

// GET /api/subjects
apiRouter.get('/subjects', (req: Request, res: Response) => {
  return res.json(db.getSubjects());
});

// POST /api/demo/reset
apiRouter.post('/demo/reset', (req: Request, res: Response) => {
  db.resetToDefault();
  return res.json({ success: true, message: 'Demo data reset successfully' });
});
