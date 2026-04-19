import {
  MOCK_STUDENTS, MOCK_HOMEWORK, MOCK_SCORES, MOCK_QUIZZES,
  MOCK_MEETINGS, MOCK_INSTRUCTIONS, MOCK_EVENTS, MOCK_NOTICES,
  MOCK_ATTENDANCE, MOCK_ADMIN_STATS,
} from './mockData';

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/** Mocks and mock fallback on errors: dev only, and only when VITE_API_URL is unset. */
const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_URL;

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

  if (path.match(/^\/students\/[^/]+$/) && method === 'GET') {
    const id = path.split('/').pop() || '';
    const s = MOCK_STUDENTS.find((x) => x.id === id);
    const row = s
      ? { ...s }
      : {
          id,
          name: 'नोंदणीकृत विद्यार्थी',
          roll: '—',
          className: 'इयत्ता १-ब',
          parentName: '—',
          studentEmail: 'student@mock.local',
          parentEmail: 'parent@mock.local',
        };
    return {
      student: {
        id: row.id,
        name: row.name,
        roll: row.roll,
        class: row.className,
        parentName: row.parentName,
        studentEmail: row.studentEmail,
        parentEmail: row.parentEmail,
        motherName: '',
        fatherName: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        mailingAddress: { line1: '', line2: '', city: '', state: '', pincode: '' },
        studentPhone: '',
        parentPhone: '',
        admissionDate: '',
        bloodGroup: '',
        previousSchool: '',
        alternateGuardianName: '',
        alternateGuardianPhone: '',
        notes: '',
        emergencyContact: { name: '', phone: '', relation: '' },
      },
    };
  }

  if (path.match(/^\/students\/[^/]+$/) && method === 'PUT') {
    const id = path.split('/').pop() || '';
    const body = JSON.parse((options.body as string) || '{}');
    const s = MOCK_STUDENTS.find((x) => x.id === id);
    const base = s
      ? { ...s, id: s.id, class: s.className }
      : { id, name: body.name || '', roll: body.roll || '', class: body.className || '', parentName: body.parentName || '' };
    return { student: { ...base, ...body, class: body.className ?? (base as { class?: string }).class } };
  }

  if (path === '/teacher/enroll' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    const roll = body.roll?.trim() || String(MOCK_STUDENTS.length + 1).padStart(2, '0');
    const id = `s-new-${Date.now()}`;
    return {
      student: {
        id,
        name: body.name,
        roll,
        class: body.className,
        parentName: body.parentName,
        motherName: body.motherName || '',
        fatherName: body.fatherName || '',
        studentEmail: `${body.name.toLowerCase().replace(/\s+/g, '.')}.${roll}@vainateya.edu`,
        studentPassword: `Student@${roll}001`,
        parentEmail: `parent.${body.name.toLowerCase().replace(/\s+/g, '.')}.${roll}@vainateya.edu`,
        parentPassword: `Parent@${roll}001`,
        dateOfBirth: body.dateOfBirth || '',
        gender: body.gender || '',
        address: body.address || '',
        mailingAddress: body.mailingAddress || {},
        studentPhone: body.studentPhone || '',
        parentPhone: body.parentPhone || '',
        admissionDate: body.admissionDate || '',
        bloodGroup: body.bloodGroup || '',
        previousSchool: body.previousSchool || '',
        notes: body.notes || '',
        emergencyContact: body.emergencyContact || {},
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
    if (method === 'GET') {
      return {
        meetings: MOCK_MEETINGS.map((m: any) => ({
          id: m._id || m.id,
          studentName: m.studentName,
          date: m.date ? new Date(m.date).toISOString() : m.date,
          timeLabel: m.timeLabel,
          mode: m.mode,
          status: m.status,
          teacherName: m.teacherName,
          classWide: false,
          className: '',
        })),
      };
    }
    if (method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      return {
        meeting: {
          id: `m-new-${Date.now()}`,
          studentName: body.classWide ? `वर्ग सभा` : 'नवीन सभा',
          date: body.date,
          timeLabel: body.timeLabel,
          mode: body.mode,
          status: 'नियोजित',
        },
      };
    }
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
    if (method === 'GET') {
      const today = new Date().toISOString().slice(0, 10);
      return {
        attendance: MOCK_STUDENTS.map((s, i) => ({
          studentId: s.id,
          studentName: s.name,
          studentRoll: s.roll,
          className: s.className,
          date: today,
          status: MOCK_ATTENDANCE[i % MOCK_ATTENDANCE.length]?.status || 'present',
        })),
        pagination: { total: MOCK_STUDENTS.length, page: 1, limit: 200, totalPages: 1 },
      };
    }
    if (method === 'POST') return { ok: true, recordsCount: 1 };
  }

  if (path === '/attendance/month' && method === 'GET') {
    const ym = params.get('ym') || '2026-04';
    const parts = ym.split('-').map(Number);
    const y = parts[0] || 2026;
    const mo = parts[1] || 4;
    const last = new Date(y, mo, 0).getDate();
    const dates = Array.from({ length: last }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`);
    return {
      ym,
      className: 'इयत्ता १-ब',
      dates,
      students: MOCK_STUDENTS.map((s) => ({ id: s.id, name: s.name, roll: s.roll })),
      records: [] as { studentId: string; date: string; status: string }[],
    };
  }

  if (path === '/admin/dashboard') return MOCK_ADMIN_STATS;

  if (path === '/report-cards/save' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    return {
      reportCard: {
        _id: `rc-${Date.now()}`,
        studentId: body.studentId,
        studentName: 'विद्यार्थी',
        studentRoll: '01',
        className: 'इयत्ता १-ब',
        term: body.term,
        academicYear: body.academicYear || '२०२४-२५',
        subjectGrades: body.subjectGrades || [],
        overallGrade: 'B',
        overallPercent: 70,
        teacherComment: body.teacherComment || '',
        attendanceSummary: { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0 },
        homeworkCompletion: { total: 0, completed: 0 },
        studentProfile: {},
        generatedAt: new Date().toISOString(),
      },
    };
  }

  if (path.match(/^\/report-cards\/[^/]+$/) && method === 'GET') {
    const studentId = path.split('/').pop() || '';
    const mockStu = MOCK_STUDENTS.find((s) => s.id === studentId) || MOCK_STUDENTS[0];
    const termQ = params.get('term') || 'वार्षिक';
    return {
      reportCard: {
        studentId: mockStu?.id || studentId,
        studentName: mockStu?.name || 'विद्यार्थी',
        studentRoll: mockStu?.roll || '01',
        parentName: mockStu?.parentName || '',
        className: mockStu?.className || 'इयत्ता १-ब',
        term: termQ,
        academicYear: '२०२४-२५',
        subjectGrades: MOCK_SCORES.slice(0, 6).map((s) => ({
          subject: s.subject,
          grade: s.grade,
          scorePercent: s.score,
          effort: (s.score ?? 0) >= 85 ? 'उत्कृष्ट' : (s.score ?? 0) >= 70 ? 'चांगले' : 'समाधानकारक',
          remark: '',
        })),
        overallGrade: 'B+',
        overallPercent: 75,
        teacherComment: 'विद्यार्थी नियमितपणे उपस्थित राहतो. पुढील सत्रात वाचनात अधिक सराव करावा.',
        attendanceSummary: { totalDays: 120, presentDays: 112, absentDays: 5, lateDays: 3 },
        homeworkCompletion: { total: 24, completed: 20 },
        studentProfile: {
          name: mockStu?.name || '',
          roll: mockStu?.roll || '',
          className: mockStu?.className || '',
          parentName: mockStu?.parentName || '',
          motherName: '',
          fatherName: '',
          studentEmail: mockStu?.studentEmail || '',
          parentEmail: mockStu?.parentEmail || '',
          dateOfBirth: '२०१७-०३-१५',
          gender: 'male',
          address: 'नमुना पत्ता, निफाड',
          mailingAddress: { line1: 'घर क्र. १२', line2: '', city: 'निफाड', state: 'महाराष्ट्र', pincode: '422303' },
          studentPhone: '',
          parentPhone: '९८७६५४३२१०',
          alternateGuardianName: '',
          alternateGuardianPhone: '',
          admissionDate: '२०२४-०६-०१',
          bloodGroup: 'B+',
          previousSchool: '',
          notes: '',
          emergencyContact: { name: '', phone: '', relation: '' },
        },
      },
    };
  }

  if (path === '/admin/users' && method === 'GET') {
    return {
      users: [
        {
          id: 'mock-t1',
          name: 'डेमो शिक्षक',
          email: 'teacher.mock@school.edu',
          role: 'teacher',
          meta: { class: 'इयत्ता १-ब' },
        },
        {
          id: 'mock-s1',
          name: 'डेमो विद्यार्थी',
          email: 'student.mock@school.edu',
          role: 'student',
          meta: {},
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
    };
  }

  if (path === '/admin/users' && method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    return {
      message: 'User created successfully',
      user: {
        id: `mock-${Date.now()}`,
        name: body.name,
        email: body.email,
        role: body.role,
        meta: body.assignedClass ? { class: body.assignedClass } : {},
      },
      temporaryPassword: 'TempPass123!',
    };
  }

  if (path.match(/^\/admin\/users\/[^/]+$/) && method === 'PATCH') {
    const id = path.split('/').pop();
    return { message: 'Updated', user: { id, name: 'अद्यतनित' } };
  }

  if (path.match(/^\/admin\/users\/[^/]+$/) && method === 'DELETE') {
    return { message: 'Deleted successfully' };
  }

  if (path.match(/\/meetings\/[^/]+\/reschedule/) && method === 'PATCH') {
    return { meeting: { id: path.split('/')[2], date: new Date().toISOString(), timeLabel: '१०:००' } };
  }

  return null;
}

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (USE_MOCK) {
    const mockResult = getMockResponse(endpoint, options);
    if (mockResult !== null) {
      await new Promise(r => setTimeout(r, 150));
      return mockResult;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, { ...options, headers });

    // Handle 401 (Unauthorized) - try to refresh token
    if (response.status === 401 && token && endpoint !== "/auth/refresh") {
      try {
        // Attempt token refresh
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.token;
          localStorage.setItem("auth_token", newToken);
          
          // Retry original request with new token
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed - clear auth and redirect to login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("school_user");
          window.location.href = "/login";
          throw new Error("Session expired. Please login again.");
        }
      } catch (refreshErr) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("school_user");
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
    }

    if (!response.ok) {
      if (USE_MOCK) {
        const mockResult = getMockResponse(endpoint, options);
        if (mockResult !== null) return mockResult;
      }

      const error = await response.json().catch(() => ({ error: 'API call failed' }));
      throw new Error(error.error || "API call failed");
    }

    return response.json();
  } catch (err) {
    if (USE_MOCK) {
      const mockResult = getMockResponse(endpoint, options);
      if (mockResult !== null) return mockResult;
    }
    throw err;
  }
}

/** Public POST /api/enquiry — no auth; not served by getMockResponse. */
export async function submitEnquiry(payload: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ message?: string; enquiry?: { id: string }; error?: string; details?: unknown }> {
  const url = `${API_BASE_URL}/enquiry`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : "अर्ज सादर करता आला नाही. कृपया पुन्हा प्रयत्न करा.";
    const err = new Error(msg) as Error & { status?: number; details?: unknown };
    err.status = response.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}
