import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'teacher' | 'parent';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  meta?: Record<string, string>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
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
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('school_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password && mockUser.role === role) {
      const { password: _, ...userData } = mockUser;
      setUser(userData);
      localStorage.setItem('school_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('school_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
