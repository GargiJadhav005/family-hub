import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'teacher' | 'parent' | 'student';

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
  enrollStudent: (name: string, parentName: string, className: string) => EnrolledStudent;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User & { password: string }> = {
  'teacher@school.edu': {
    id: 't1',
    name: 'श्री. सचिन मोरे',
    role: 'teacher',
    email: 'teacher@school.edu',
    password: 'teacher123',
    meta: { class: 'इयत्ता ४-ब', subject: 'वर्गशिक्षक' },
  },
  'parent@school.edu': {
    id: 'p1',
    name: 'सौ. पाटील',
    role: 'parent',
    email: 'parent@school.edu',
    password: 'parent123',
    meta: { child: 'आरव पाटील', class: 'इयत्ता ३-ब' },
  },
  'student@school.edu': {
    id: 's1',
    name: 'आरव पाटील',
    role: 'student',
    email: 'student@school.edu',
    password: 'student123',
    meta: { class: 'इयत्ता ३-ब', roll: '०१' },
  },
};

function generateId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePassword() {
  return 'Pass' + Math.floor(1000 + Math.random() * 9000);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('school_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(() => {
    const stored = localStorage.getItem('enrolled_students');
    return stored ? JSON.parse(stored) : [
      {
        id: 'STU001',
        name: 'आरव पाटील',
        roll: '०१',
        class: 'इयत्ता ३-ब',
        parentName: 'सौ. पाटील',
        studentEmail: 'student@school.edu',
        studentPassword: 'student123',
        parentEmail: 'parent@school.edu',
        parentPassword: 'parent123',
      },
    ];
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Check mock users first
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password && mockUser.role === role) {
      const { password: _, ...userData } = mockUser;
      setUser(userData);
      localStorage.setItem('school_user', JSON.stringify(userData));
      return true;
    }

    // Check dynamically enrolled students/parents
    const stored = localStorage.getItem('enrolled_students');
    const students: EnrolledStudent[] = stored ? JSON.parse(stored) : [];
    
    for (const s of students) {
      if (role === 'student' && s.studentEmail === email && s.studentPassword === password) {
        const userData: User = {
          id: s.id,
          name: s.name,
          role: 'student',
          email: s.studentEmail,
          meta: { class: s.class, roll: s.roll },
        };
        setUser(userData);
        localStorage.setItem('school_user', JSON.stringify(userData));
        return true;
      }
      if (role === 'parent' && s.parentEmail === email && s.parentPassword === password) {
        const userData: User = {
          id: 'p-' + s.id,
          name: s.parentName,
          role: 'parent',
          email: s.parentEmail,
          meta: { child: s.name, class: s.class },
        };
        setUser(userData);
        localStorage.setItem('school_user', JSON.stringify(userData));
        return true;
      }
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('school_user');
  }, []);

  const enrollStudent = useCallback((name: string, parentName: string, className: string): EnrolledStudent => {
    const id = 'STU' + generateId();
    const rollNum = String(enrolledStudents.length + 1).padStart(2, '0');
    const studentEmail = name.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '') + '@school.edu';
    const parentEmail = 'parent.' + name.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '') + '@school.edu';
    
    const newStudent: EnrolledStudent = {
      id,
      name,
      roll: rollNum,
      class: className,
      parentName,
      studentEmail,
      studentPassword: generatePassword(),
      parentEmail,
      parentPassword: generatePassword(),
    };

    const updated = [...enrolledStudents, newStudent];
    setEnrolledStudents(updated);
    localStorage.setItem('enrolled_students', JSON.stringify(updated));

    // Also add to MOCK_USERS dynamically
    MOCK_USERS[studentEmail] = {
      id,
      name,
      role: 'student',
      email: studentEmail,
      password: newStudent.studentPassword,
      meta: { class: className, roll: rollNum },
    };
    MOCK_USERS[parentEmail] = {
      id: 'p-' + id,
      name: parentName,
      role: 'parent',
      email: parentEmail,
      password: newStudent.parentPassword,
      meta: { child: name, class: className },
    };

    return newStudent;
  }, [enrolledStudents]);

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
