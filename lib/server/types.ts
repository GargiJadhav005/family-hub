export type UserRole = 'teacher' | 'parent' | 'student';

export interface DbUser {
  _id: string; // will be stored as ObjectId in Mongo, but serialized as string
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  meta?: Record<string, string>;
}

export interface DbStudent {
  _id: string;
  name: string;
  roll: string;
  className: string;
  parentName: string;
  studentEmail: string;
  parentEmail: string;
  studentUserId: string;
  parentUserId: string;
  createdByTeacherId: string;
}

export interface DbHomework {
  _id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  createdByTeacherId: string;
  className?: string;
  section?: string;
}

export type HomeworkStatusValue = 'pending' | 'in_progress' | 'completed';

export interface DbHomeworkStatus {
  _id: string;
  homeworkId: string;
  studentId: string;
  status: HomeworkStatusValue;
  updatedAt: string;
}

export type AttendanceStatusValue = 'present' | 'absent' | 'late';

export interface DbAttendanceRecord {
  _id: string;
  studentId: string;
  date: string; // ISO date (YYYY-MM-DD)
  status: AttendanceStatusValue;
  markedByTeacherId: string;
  notes?: string;
}

export interface DbScoreRecord {
  _id: string;
  studentId: string;
  subject: string;
  testName: string;
  scorePercent: number;
  grade: string;
  date: string; // ISO date
}

