import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiCall } from '@/lib/api';
import { MOCK_USERS, MOCK_STUDENTS } from '@/lib/mockData';

const SEED_MOCK_STUDENTS = import.meta.env.DEV && !import.meta.env.VITE_API_URL;

export type UserRole = 'teacher' | 'parent' | 'student' | 'admin';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  meta?: Record<string, string>;
}

interface EnrolledStudent {
  id: string;
  name: string;
  roll: string;
  class: string;
  parentName: string;
  studentEmail: string;
  studentPassword: string;
  parentEmail: string;
  parentPassword: string;
}

export type EnrollPayload = {
  name: string;
  parentName: string;
  className: string;
  motherName?: string;
  fatherName?: string;
  roll?: string;
  idNumber?: string;
  regNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  mailingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  studentPhone?: string;
  parentPhone?: string;
  alternateGuardianName?: string;
  alternateGuardianPhone?: string;
  admissionDate?: string;
  bloodGroup?: string;
  previousSchool?: string;
  notes?: string;
  motherTongue?: string;
  medium?: string;
  udiseNumber?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  enrolledStudents: EnrolledStudent[];
  enrollStudent: (payload: EnrollPayload) => Promise<EnrolledStudent>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_CREDENTIALS: Record<string, { password: string; role: UserRole }> = {
  // Generic demo accounts
  'teacher@vainateya.edu':  { password: 'teacher123',  role: 'teacher' },
  'parent@vainateya.edu':   { password: 'parent123',   role: 'parent'  },
  'student@vainateya.edu':  { password: 'student123',  role: 'student' },
  'admin@vainateya.edu':    { password: 'admin123',    role: 'admin'   },
  // Real database accounts (fallback when backend is offline)
  'vv.chiplunkar@vainateya.edu': { password: 'Teacher@2025', role: 'teacher' },
  'admin@vainateya.school':      { password: 'Admin@2025',   role: 'admin'   },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('school_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(() => {
    if (!SEED_MOCK_STUDENTS) return [];
    return MOCK_STUDENTS.map(s => ({
      id: s.id,
      name: s.name,
      roll: s.roll,
      class: s.className,
      parentName: s.parentName,
      studentEmail: s.studentEmail,
      studentPassword: '',
      parentEmail: s.parentEmail,
      parentPassword: '',
    }));
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Try backend first
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      if (data?.user && data?.token) {
        setUser(data.user);
        localStorage.setItem('school_user', JSON.stringify(data.user));
        localStorage.setItem('auth_token', data.token);
        return true;
      }
    } catch {
      // Fall through to demo login in dev only
    }

    if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
      const demo = DEMO_CREDENTIALS[email];
      if (demo && demo.password === password && demo.role === role) {
        const mockUser = MOCK_USERS[role];
        setUser(mockUser);
        localStorage.setItem('school_user', JSON.stringify(mockUser));
        localStorage.setItem('auth_token', 'demo-token');
        return true;
      }
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('school_user');
    localStorage.removeItem('auth_token');
  }, []);

  const enrollStudent = useCallback(async (payload: EnrollPayload): Promise<EnrolledStudent> => {
    try {
      const data = await apiCall('/teacher/enroll', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const studentData = data.student || data;
      const newStudent: EnrolledStudent = {
        id: studentData.id,
        name: studentData.name,
        roll: studentData.roll,
        class: studentData.class,
        parentName: studentData.parentName || payload.parentName,
        studentEmail: studentData.studentEmail,
        studentPassword: studentData.studentPassword,
        parentEmail: studentData.parentEmail,
        parentPassword: studentData.parentPassword,
      };

      setEnrolledStudents((prev) => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      console.error('Enrollment error:', err);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, enrolledStudents, enrollStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}