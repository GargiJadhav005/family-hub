import {
  MOCK_STUDENTS, MOCK_HOMEWORK, MOCK_SCORES, MOCK_QUIZZES,
  MOCK_MEETINGS, MOCK_INSTRUCTIONS, MOCK_EVENTS, MOCK_NOTICES,
  MOCK_ATTENDANCE, MOCK_ADMIN_STATS,
} from './mockData';

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const USE_MOCK = !import.meta.env.VITE_API_URL;

// Mock API responses when no backend is available
function getMockResponse(endpoint: string, options: RequestInit = {}): any | null {
  const method = (options.method || 'GET').toUpperCase();
  const path = endpoint.split('?')[0];
  const params = new URLSearchParams(endpoint.split('?')[1] || '');

  if (path === '/auth/me') return { user: null };

  if (path === '/students') {
    if (method === 'GET') {
      return { students: MOCK_STUDENTS.map(s => ({ ...s, id: s.id, class: s.className })) };
    }
  }

  if (path === '/teacher/enroll' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    const roll = String(MOCK_STUDENTS.length + 1).padStart(2, '0');
    const id = `s-new-${Date.now()}`;
    return {
      student: {
        id,
        name: body.name,
        roll,
        class: body.className,
        parentName: body.parentName,
        studentEmail: `${body.name.toLowerCase().replace(/\s+/g, '.')}.${roll}@vainateya.edu`,
        studentPassword: `Student@${roll}001`,
        parentEmail: `parent.${body.name.toLowerCase().replace(/\s+/g, '.')}.${roll}@vainateya.edu`,
        parentPassword: `Parent@${roll}001`,
      },
    };
  }

  if (path === '/homework') {
    if (method === 'GET') return { homework: MOCK_HOMEWORK };
    if (method === 'POST') {
      const body = JSON.parse(options.body as string);
      return {
        homework: {
          id: `hw-${Date.now()}`,
          ...body,
          createdAt: new Date().toLocaleDateString('mr-IN'),
        },
      };
    }
  }

  if (path === '/scores') return { scores: MOCK_SCORES };
  if (path === '/quizzes') return { quizzes: MOCK_QUIZZES };

  if (path.match(/\/quizzes\/.*\/submit/) && method === 'POST') {
    const body = JSON.parse(options.body as string);
    const quizId = path.split('/')[2];
    const quiz = MOCK_QUIZZES.find(q => q._id === quizId);
    if (quiz) {
      const score = body.answers.filter((a: number, i: number) => a === quiz.questions[i]?.correctIndex).length;
      return { score, total: quiz.questions.length };
    }
    return { score: 0, total: 0 };
  }

  if (path === '/meetings') {
    if (method === 'GET') return { meetings: MOCK_MEETINGS };
  }

  if (path.match(/\/meetings\/.*\/status/) && method === 'PATCH') {
    return { success: true };
  }

  if (path === '/instructions') return { instructions: MOCK_INSTRUCTIONS };

  if (path === '/events') {
    const type = params.get('type');
    if (type === 'notice') return { events: MOCK_NOTICES };
    return { events: MOCK_EVENTS };
  }

  if (path === '/attendance') {
    if (method === 'GET') return { records: MOCK_ATTENDANCE };
    if (method === 'POST') return { success: true };
  }

  if (path === '/admin/dashboard') return MOCK_ADMIN_STATS;

  return null;
}

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  // Try mock data first if no API URL configured
  if (USE_MOCK) {
    const mockResult = getMockResponse(endpoint, options);
    if (mockResult !== null) {
      // Simulate slight network delay
      await new Promise(r => setTimeout(r, 150));
      return mockResult;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      // Fallback to mock on error
      const mockResult = getMockResponse(endpoint, options);
      if (mockResult !== null) return mockResult;

      const error = await response.json().catch(() => ({ error: 'API call failed' }));
      throw new Error(error.error || "API call failed");
    }

    return response.json();
  } catch (err) {
    // Fallback to mock on network error
    const mockResult = getMockResponse(endpoint, options);
    if (mockResult !== null) return mockResult;
    throw err;
  }
}