import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type {
  User,
  Subject,
  Assignment,
  AssignmentAssignee,
  Submission,
  SubmissionStatus,
  AssignmentWithStatus,
  SubmissionOverviewItem,
} from './types.ts';

interface DatabaseSchema {
  users: User[];
  subjects: Subject[];
  assignments: Assignment[];
  assignment_assignees: AssignmentAssignee[];
  submissions: Submission[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'college_assignment_tracker.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class Database {
  private data: DatabaseSchema = {
    users: [],
    subjects: [],
    assignments: [],
    assignment_assignees: [],
    submissions: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all arrays exist
        if (!this.data.users) this.data.users = [];
        if (!this.data.subjects) this.data.subjects = [];
        if (!this.data.assignments) this.data.assignments = [];
        if (!this.data.assignment_assignees) this.data.assignment_assignees = [];
        if (!this.data.submissions) this.data.submissions = [];
      } catch (err) {
        console.error('Failed to read db file, seeding fresh:', err);
        this.seedDemoData();
      }
    } else {
      this.seedDemoData();
    }
  }

  private save() {
    ensureDataDir();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public seedDemoData() {
    const studentPasswordHash = bcrypt.hashSync('student123', 10);
    const lecturerPasswordHash = bcrypt.hashSync('lecturer123', 10);

    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;

    const pastDate = (daysAgo: number) =>
      new Date(now.getTime() - daysAgo * msPerDay).toISOString();
    const futureDate = (daysAhead: number, hours = 17, minutes = 0) => {
      const d = new Date(now.getTime() + daysAhead * msPerDay);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    const users: User[] = [
      {
        id: 'usr_lec_001',
        user_id: 'LEC001',
        name: 'Dr. Priya Sharma',
        password_hash: lecturerPasswordHash,
        role: 'LECTURER',
        class: 'Faculty of Computer Science',
        section: 'Department Head',
        email: 'dr.priya@college.edu',
        created_at: pastDate(30),
      },
      {
        id: 'usr_lec_002',
        user_id: 'LEC002',
        name: 'Prof. Rajesh Verma',
        password_hash: lecturerPasswordHash,
        role: 'LECTURER',
        class: 'Faculty of Computer Science',
        section: 'Assistant Professor',
        email: 'prof.rajesh@college.edu',
        created_at: pastDate(25),
      },
      {
        id: 'usr_stu_001',
        user_id: 'STU001',
        name: 'Anu Naik',
        password_hash: studentPasswordHash,
        role: 'STUDENT',
        class: 'B.Tech CS 3rd Year',
        section: 'Section A',
        email: 'anu.naik@college.edu',
        created_at: pastDate(20),
      },
      {
        id: 'usr_stu_002',
        user_id: 'STU002',
        name: 'Rahul Verma',
        password_hash: studentPasswordHash,
        role: 'STUDENT',
        class: 'B.Tech CS 3rd Year',
        section: 'Section A',
        email: 'rahul.verma@college.edu',
        created_at: pastDate(20),
      },
      {
        id: 'usr_stu_003',
        user_id: 'STU003',
        name: 'Sneha Patel',
        password_hash: studentPasswordHash,
        role: 'STUDENT',
        class: 'B.Tech CS 3rd Year',
        section: 'Section B',
        email: 'sneha.patel@college.edu',
        created_at: pastDate(20),
      },
    ];

    const subjects: Subject[] = [
      {
        id: 'sub_001',
        subject_code: 'CS501',
        subject_name: 'Data Structures & Algorithms',
      },
      {
        id: 'sub_002',
        subject_code: 'CS502',
        subject_name: 'Database Management Systems',
      },
      {
        id: 'sub_003',
        subject_code: 'CS503',
        subject_name: 'Computer Networks',
      },
      {
        id: 'sub_004',
        subject_code: 'CS504',
        subject_name: 'Software Engineering & Design',
      },
    ];

    // Assignments
    // 1. Stack Implementation: Deadline 3 days ago.
    //    - Anu submitted 1 day ago (LATE)
    //    - Rahul submitted 4 days ago (COMPLETED)
    //    - Sneha did not submit (OVERDUE)
    // 2. ER Diagram Design: Deadline 1 day ago.
    //    - Anu has not submitted (OVERDUE)
    //    - Rahul has not submitted (OVERDUE)
    // 3. SQL Queries Assignment: Deadline in 3 days.
    //    - Anu submitted today (COMPLETED)
    //    - Rahul has not submitted (PENDING)
    // 4. Computer Networks Lab Record: Deadline in 2 days.
    //    - All pending (PENDING)
    // 5. Data Structures Mini Project: Deadline in 8 days.
    //    - All pending (PENDING)

    const assignments: Assignment[] = [
      {
        id: 'asg_001',
        title: 'Implement Stack using Python & Linked Lists',
        description: 'Implement a Stack data structure using singly linked lists in Python. Include push, pop, peek, isEmpty, and display methods with time complexity analysis in comments.',
        subject: 'CS501',
        priority: 'HIGH',
        created_by: 'usr_lec_001',
        assigned_class: 'B.Tech CS 3rd Year',
        assigned_section: 'All',
        deadline: pastDate(3),
        created_at: pastDate(10),
      },
      {
        id: 'asg_002',
        title: 'Design ER Diagram for University Management System',
        description: 'Construct a detailed Entity-Relationship Diagram representing college departments, courses, faculty, students, grades, and library borrowings. Identify all primary and foreign keys.',
        subject: 'CS502',
        priority: 'MEDIUM',
        created_by: 'usr_lec_001',
        assigned_class: 'B.Tech CS 3rd Year',
        assigned_section: 'Section A',
        deadline: pastDate(1),
        created_at: pastDate(8),
      },
      {
        id: 'asg_003',
        title: 'SQL Queries Assignment (Complex Joins & Aggregations)',
        description: 'Write 12 SQL queries covering multi-table INNER and OUTER joins, GROUP BY with HAVING clauses, and correlated subqueries on the provided sample e-commerce schema.',
        subject: 'CS502',
        priority: 'HIGH',
        created_by: 'usr_lec_001',
        assigned_class: 'B.Tech CS 3rd Year',
        assigned_section: 'All',
        deadline: futureDate(3, 23, 59),
        created_at: pastDate(4),
      },
      {
        id: 'asg_004',
        title: 'Computer Networks Lab Record - Socket Programming',
        description: 'Complete the lab record documentation for Experiment 4: Client-Server TCP socket communication and packet capture inspection using Wireshark.',
        subject: 'CS503',
        priority: 'MEDIUM',
        created_by: 'usr_lec_002',
        assigned_class: 'B.Tech CS 3rd Year',
        assigned_section: 'All',
        deadline: futureDate(2, 17, 0),
        created_at: pastDate(3),
      },
      {
        id: 'asg_005',
        title: 'Data Structures Mini Project - Trie Implementation',
        description: 'Build an autocomplete search engine using the Trie data structure. Provide a clean CLI interface, test suite with 10,000 words, and benchmark memory footprint.',
        subject: 'CS501',
        priority: 'HIGH',
        created_by: 'usr_lec_001',
        assigned_class: 'B.Tech CS 3rd Year',
        assigned_section: 'All',
        deadline: futureDate(8, 18, 0),
        created_at: pastDate(2),
      },
    ];

    const assignment_assignees: AssignmentAssignee[] = [
      // asg_001 assigned to Anu, Rahul, Sneha
      { id: 'asgn_01', assignment_id: 'asg_001', student_id: 'usr_stu_001' },
      { id: 'asgn_02', assignment_id: 'asg_001', student_id: 'usr_stu_002' },
      { id: 'asgn_03', assignment_id: 'asg_001', student_id: 'usr_stu_003' },

      // asg_002 assigned to Section A (Anu, Rahul)
      { id: 'asgn_04', assignment_id: 'asg_002', student_id: 'usr_stu_001' },
      { id: 'asgn_05', assignment_id: 'asg_002', student_id: 'usr_stu_002' },

      // asg_003 assigned to Anu, Rahul, Sneha
      { id: 'asgn_06', assignment_id: 'asg_003', student_id: 'usr_stu_001' },
      { id: 'asgn_07', assignment_id: 'asg_003', student_id: 'usr_stu_002' },
      { id: 'asgn_08', assignment_id: 'asg_003', student_id: 'usr_stu_003' },

      // asg_004 assigned to Anu, Rahul, Sneha
      { id: 'asgn_09', assignment_id: 'asg_004', student_id: 'usr_stu_001' },
      { id: 'asgn_10', assignment_id: 'asg_004', student_id: 'usr_stu_002' },
      { id: 'asgn_11', assignment_id: 'asg_004', student_id: 'usr_stu_003' },

      // asg_005 assigned to Anu, Rahul, Sneha
      { id: 'asgn_12', assignment_id: 'asg_005', student_id: 'usr_stu_001' },
      { id: 'asgn_13', assignment_id: 'asg_005', student_id: 'usr_stu_002' },
      { id: 'asgn_14', assignment_id: 'asg_005', student_id: 'usr_stu_003' },
    ];

    const submissions: Submission[] = [
      // Anu submitted asg_001 1 day ago (deadline was 3 days ago) -> LATE
      {
        id: 'subm_001',
        assignment_id: 'asg_001',
        student_id: 'usr_stu_001',
        status: 'LATE',
        submission_note: 'Submitted Python code with unittest cases. Apologies for the 2 days delay due to illness.',
        submitted_at: pastDate(1),
      },
      // Rahul submitted asg_001 4 days ago (deadline was 3 days ago) -> COMPLETED
      {
        id: 'subm_002',
        assignment_id: 'asg_001',
        student_id: 'usr_stu_002',
        status: 'COMPLETED',
        submission_note: 'Implemented stack with linked list, included memory analysis plot.',
        submitted_at: pastDate(4),
      },
      // Anu submitted asg_003 today (deadline is in 3 days) -> COMPLETED
      {
        id: 'subm_003',
        assignment_id: 'asg_003',
        student_id: 'usr_stu_001',
        status: 'COMPLETED',
        submission_note: 'All 12 SQL queries executed on PostgreSQL with explain plan screenshots attached.',
        submitted_at: pastDate(0.5),
      },
    ];

    this.data = {
      users,
      subjects,
      assignments,
      assignment_assignees,
      submissions,
    };

    this.save();
  }

  // Calculate dynamic status for an assignment and student
  public calculateDynamicStatus(
    deadlineIso: string,
    submission: Submission | undefined
  ): SubmissionStatus {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadlineIso).getTime();

    if (submission && submission.submitted_at) {
      const submittedTime = new Date(submission.submitted_at).getTime();
      if (submittedTime <= deadlineTime) {
        return 'COMPLETED';
      } else {
        return 'LATE';
      }
    }

    if (now > deadlineTime) {
      return 'OVERDUE';
    }

    return 'PENDING';
  }

  // User queries
  public findUserByUserId(userId: string): User | undefined {
    return this.data.users.find(
      (u) => u.user_id.toUpperCase() === userId.trim().toUpperCase()
    );
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getStudents(): User[] {
    return this.data.users.filter((u) => u.role === 'STUDENT');
  }

  public getLecturers(): User[] {
    return this.data.users.filter((u) => u.role === 'LECTURER');
  }

  // Subjects
  public getSubjects(): Subject[] {
    return [...this.data.subjects];
  }

  public findSubjectByCode(code: string): Subject | undefined {
    return this.data.subjects.find((s) => s.subject_code === code);
  }

  // Student Assignments
  public getAssignmentsForStudent(studentId: string): AssignmentWithStatus[] {
    // Find all assignments where student is in assignment_assignees
    const assignedIds = new Set(
      this.data.assignment_assignees
        .filter((a) => a.student_id === studentId)
        .map((a) => a.assignment_id)
    );

    const student = this.findUserById(studentId);

    // Also include assignments assigned to entire class or student's section
    const relevantAssignments = this.data.assignments.filter((asg) => {
      if (assignedIds.has(asg.id)) return true;
      if (!student) return false;
      const classMatch =
        asg.assigned_class === 'All' || asg.assigned_class === student.class;
      const sectionMatch =
        asg.assigned_section === 'All' || asg.assigned_section === student.section;
      return classMatch && sectionMatch;
    });

    const subjectsMap = new Map(
      this.data.subjects.map((s) => [s.subject_code, s.subject_name])
    );
    const usersMap = new Map(this.data.users.map((u) => [u.id, u.name]));

    return relevantAssignments.map((asg) => {
      const sub = this.data.submissions.find(
        (s) => s.assignment_id === asg.id && s.student_id === studentId
      );
      const calculated_status = this.calculateDynamicStatus(asg.deadline, sub);

      return {
        ...asg,
        subject_name: subjectsMap.get(asg.subject) || asg.subject,
        lecturer_name: usersMap.get(asg.created_by) || 'Faculty',
        calculated_status,
        submission: sub
          ? {
              id: sub.id,
              submission_note: sub.submission_note,
              submitted_at: sub.submitted_at,
              status: calculated_status,
            }
          : null,
      };
    });
  }

  // Student Submits an Assignment
  public submitAssignment(
    assignmentId: string,
    studentId: string,
    note: string
  ): { submission: Submission; calculated_status: SubmissionStatus } {
    const assignment = this.data.assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const nowIso = new Date().toISOString();
    let existingSub = this.data.submissions.find(
      (s) => s.assignment_id === assignmentId && s.student_id === studentId
    );

    const deadlineTime = new Date(assignment.deadline).getTime();
    const nowTime = new Date(nowIso).getTime();
    const newStatus: SubmissionStatus =
      nowTime <= deadlineTime ? 'COMPLETED' : 'LATE';

    if (existingSub) {
      existingSub.submission_note = note;
      existingSub.submitted_at = nowIso;
      existingSub.status = newStatus;
    } else {
      existingSub = {
        id: `subm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        assignment_id: assignmentId,
        student_id: studentId,
        status: newStatus,
        submission_note: note,
        submitted_at: nowIso,
      };
      this.data.submissions.push(existingSub);
    }

    this.save();
    return {
      submission: existingSub,
      calculated_status: newStatus,
    };
  }

  // Lecturer: Get all assignments created by this lecturer
  public getAssignmentsForLecturer(lecturerId: string): AssignmentWithStatus[] {
    const assignments = this.data.assignments.filter(
      (a) => a.created_by === lecturerId
    );
    const subjectsMap = new Map(
      this.data.subjects.map((s) => [s.subject_code, s.subject_name])
    );

    return assignments.map((asg) => ({
      ...asg,
      subject_name: subjectsMap.get(asg.subject) || asg.subject,
      calculated_status: 'PENDING',
    }));
  }

  // Lecturer: Create Assignment
  public createAssignment(
    lecturerId: string,
    payload: {
      title: string;
      subject: string;
      description: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      deadline: string;
      assigned_class: string;
      assigned_section: string;
      target_type: 'CLASS' | 'SECTION' | 'STUDENTS';
      student_ids?: string[];
    }
  ): Assignment {
    const id = `asg_${Date.now()}`;
    const newAsg: Assignment = {
      id,
      title: payload.title.trim(),
      description: payload.description.trim(),
      subject: payload.subject.trim(),
      priority: payload.priority,
      created_by: lecturerId,
      assigned_class: payload.assigned_class || 'All',
      assigned_section: payload.assigned_section || 'All',
      deadline: payload.deadline,
      created_at: new Date().toISOString(),
    };

    this.data.assignments.unshift(newAsg);

    // Determine target students
    let targetStudents: User[] = [];
    if (payload.target_type === 'STUDENTS' && payload.student_ids && payload.student_ids.length > 0) {
      targetStudents = this.data.users.filter(
        (u) => u.role === 'STUDENT' && payload.student_ids!.includes(u.id)
      );
    } else if (payload.target_type === 'SECTION') {
      targetStudents = this.data.users.filter(
        (u) =>
          u.role === 'STUDENT' &&
          (payload.assigned_class === 'All' || u.class === payload.assigned_class) &&
          (payload.assigned_section === 'All' || u.section === payload.assigned_section)
      );
    } else {
      // Entire Class
      targetStudents = this.data.users.filter(
        (u) =>
          u.role === 'STUDENT' &&
          (payload.assigned_class === 'All' || u.class === payload.assigned_class)
      );
    }

    // Insert assignees
    for (const student of targetStudents) {
      this.data.assignment_assignees.push({
        id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        assignment_id: id,
        student_id: student.id,
      });
    }

    this.save();
    return newAsg;
  }

  // Lecturer: Update Assignment
  public updateAssignment(
    assignmentId: string,
    lecturerId: string,
    payload: {
      title?: string;
      subject?: string;
      description?: string;
      priority?: 'HIGH' | 'MEDIUM' | 'LOW';
      deadline?: string;
      assigned_class?: string;
      assigned_section?: string;
    }
  ): Assignment {
    const asg = this.data.assignments.find(
      (a) => a.id === assignmentId && a.created_by === lecturerId
    );
    if (!asg) {
      throw new Error('Assignment not found or unauthorized');
    }

    if (payload.title !== undefined) asg.title = payload.title.trim();
    if (payload.subject !== undefined) asg.subject = payload.subject.trim();
    if (payload.description !== undefined) asg.description = payload.description.trim();
    if (payload.priority !== undefined) asg.priority = payload.priority;
    if (payload.deadline !== undefined) asg.deadline = payload.deadline;
    if (payload.assigned_class !== undefined) asg.assigned_class = payload.assigned_class;
    if (payload.assigned_section !== undefined) asg.assigned_section = payload.assigned_section;

    this.save();
    return asg;
  }

  // Lecturer: Delete Assignment
  public deleteAssignment(assignmentId: string, lecturerId: string): boolean {
    const index = this.data.assignments.findIndex(
      (a) => a.id === assignmentId && a.created_by === lecturerId
    );
    if (index === -1) {
      throw new Error('Assignment not found or unauthorized');
    }

    this.data.assignments.splice(index, 1);
    // Cascade delete assignees & submissions
    this.data.assignment_assignees = this.data.assignment_assignees.filter(
      (a) => a.assignment_id !== assignmentId
    );
    this.data.submissions = this.data.submissions.filter(
      (s) => s.assignment_id !== assignmentId
    );

    this.save();
    return true;
  }

  // Lecturer Submissions View
  // Shows table: Student | Assignment | Deadline | Status | Submission Note | Submitted At
  public getSubmissionsOverview(lecturerId: string): SubmissionOverviewItem[] {
    const lecturerAssignments = this.data.assignments.filter(
      (a) => a.created_by === lecturerId
    );
    const assignmentMap = new Map(lecturerAssignments.map((a) => [a.id, a]));
    const subjectsMap = new Map(
      this.data.subjects.map((s) => [s.subject_code, s.subject_name])
    );
    const studentsMap = new Map(
      this.data.users
        .filter((u) => u.role === 'STUDENT')
        .map((u) => [u.id, u])
    );

    const results: SubmissionOverviewItem[] = [];

    // For every assignment created by lecturer, find target students
    for (const asg of lecturerAssignments) {
      // Find explicitly assigned students
      const directAssignees = this.data.assignment_assignees
        .filter((rel) => rel.assignment_id === asg.id)
        .map((rel) => rel.student_id);

      // Or matching class/section students
      const matchingStudents = this.data.users.filter((u) => {
        if (u.role !== 'STUDENT') return false;
        if (directAssignees.includes(u.id)) return true;
        const matchClass =
          asg.assigned_class === 'All' || u.class === asg.assigned_class;
        const matchSec =
          asg.assigned_section === 'All' || u.section === asg.assigned_section;
        return matchClass && matchSec;
      });

      for (const student of matchingStudents) {
        const sub = this.data.submissions.find(
          (s) => s.assignment_id === asg.id && s.student_id === student.id
        );
        const dynamicStatus = this.calculateDynamicStatus(asg.deadline, sub);

        results.push({
          id: sub?.id || `pending_${asg.id}_${student.id}`,
          assignment_id: asg.id,
          assignment_title: asg.title,
          subject_code: asg.subject,
          subject_name: subjectsMap.get(asg.subject) || asg.subject,
          priority: asg.priority,
          deadline: asg.deadline,
          student_id: student.id,
          student_user_id: student.user_id,
          student_name: student.name,
          student_class: student.class,
          student_section: student.section,
          status: dynamicStatus,
          submission_note: sub?.submission_note || '',
          submitted_at: sub?.submitted_at || null,
        });
      }
    }

    return results;
  }

  // Reset database back to default seed state
  public resetToDefault() {
    this.seedDemoData();
  }
}

export const db = new Database();
