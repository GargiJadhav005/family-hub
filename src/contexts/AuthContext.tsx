import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiCall, API_BASE_URL } from '@/lib/api';

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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  enrolledStudents: EnrolledStudent[];
  enrollStudent: (name: string, parentName: string, className: string) => Promise<EnrolledStudent>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('school_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);

  // Restore logged-in user from backend using stored token
  useEffect(() => {
    const restore = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const data = await apiCall('/auth/me');
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('school_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error('Failed to restore user session:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('school_user');
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });

      if (!data.user || !data.token) return false;

      setUser(data.user);
      localStorage.setItem('school_user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('school_user');
    localStorage.removeItem('auth_token');
  }, []);

  const enrollStudent = useCallback(async (name: string, parentName: string, className: string): Promise<EnrolledStudent> => {
    try {
      const data = await apiCall('/teacher/enroll', {
        method: 'POST',
        body: JSON.stringify({ name, parentName, className }),
      });

      const studentData = data.student || data;
      const newStudent: EnrolledStudent = {
        id: studentData.id,
        name: studentData.name,
        roll: studentData.roll,
        class: studentData.class,
        parentName: studentData.parentName,
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

  // Load students on mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const data = await apiCall('/students');
        if (Array.isArray(data.students)) {
          const mapped: EnrolledStudent[] = data.students.map((s: any) => ({
            id: s.id,
            name: s.name,
            roll: s.roll,
            class: s.class,
            parentName: s.parentName,
            studentEmail: s.studentEmail,
            studentPassword: '',
            parentEmail: s.parentEmail,
            parentPassword: '',
          }));
          setEnrolledStudents(mapped);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    };
    loadStudents();
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
