import { ObjectId } from 'mongodb';
import { getDb } from './db';
import type {
  DbUser,
  DbStudent,
  DbHomework,
  DbHomeworkStatus,
  DbAttendanceRecord,
  DbScoreRecord,
} from './types';

export async function usersCollection() {
  const db = await getDb();
  return db.collection<DbUser>('users');
}

export async function studentsCollection() {
  const db = await getDb();
  return db.collection<DbStudent>('students');
}

export async function homeworkCollection() {
  const db = await getDb();
  return db.collection<DbHomework>('homework');
}

export async function homeworkStatusCollection() {
  const db = await getDb();
  return db.collection<DbHomeworkStatus>('student_homework_status');
}

export async function attendanceCollection() {
  const db = await getDb();
  return db.collection<DbAttendanceRecord>('attendance');
}

export async function scoresCollection() {
  const db = await getDb();
  return db.collection<DbScoreRecord>('scores');
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

