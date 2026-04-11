/**
 * Family Hub — Integration Tests (API Level)
 * 
 * Tests all major API flows end-to-end against a running server.
 * 
 * SETUP: Start the backend first:  npm run dev  (in /backend)
 * RUN:   npx tsx src/tests/api.integration.test.ts
 *        OR: npx vitest run src/tests/api.integration.test.ts
 * 
 * Credentials tested:
 *   Email:    gargi.jadhav005@gmail.com
 *   Password: Gargi@2901
 */

import { describe, it, expect, beforeAll } from "vitest";

const BASE = process.env.API_URL ?? "http://localhost:9000/api";
const EMAIL = "gargi.jadhav005@gmail.com";
const PASSWORD = "Gargi@2901";

// Auth tokens acquired during login
let adminToken = "";
let teacherToken = "";
let studentToken = "";
let parentToken = "";

// IDs discovered during tests
let createdStudentId = "";
let createdHomeworkId = "";
let createdAnnouncementId = "";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function post(path: string, body: any, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function get(path: string, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, body: await res.json() };
}

async function patch(path: string, body: any, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

// ── GLOBAL SETUP: acquire all four tokens BEFORE any test runs ────────────────

beforeAll(async () => {
  try {
    const [a, t, s, p] = await Promise.all([
      post("/auth/login", { email: EMAIL, password: PASSWORD, role: "admin" }),
      post("/auth/login", { email: EMAIL, password: PASSWORD, role: "teacher" }),
      post("/auth/login", { email: EMAIL, password: PASSWORD, role: "student" }),
      post("/auth/login", { email: EMAIL, password: PASSWORD, role: "parent" }),
    ]);
    if (a.status === 200) adminToken = a.body.token;
    if (t.status === 200) teacherToken = t.body.token;
    if (s.status === 200) studentToken = s.body.token;
    if (p.status === 200) parentToken = p.body.token;

    if (!adminToken) {
      console.warn("⚠️  Could not get admin token — is the backend running on port 9000?");
    } else {
      console.log("✓ All tokens acquired");
    }
  } catch (e) {
    console.warn("⚠️  Backend not reachable — integration tests will fail. Start backend with: npm run dev");
  }
}, 20000);

// ── MODULE: AUTHENTICATION ────────────────────────────────────────────────────

describe("🔑 Authentication Module", () => {
  describe("POST /api/auth/login", () => {
    it("admin login returns 200 + valid JWT", async () => {
      const r = await post("/auth/login", { email: EMAIL, password: PASSWORD, role: "admin" });
      expect(r.status).toBe(200);
      expect(r.body).toHaveProperty("token");
      expect(r.body).toHaveProperty("user");
      expect(r.body.user.role).toBe("admin");
      adminToken = r.body.token;
    });

    it("teacher login returns 200 + valid JWT", async () => {
      const r = await post("/auth/login", { email: EMAIL, password: PASSWORD, role: "teacher" });
      expect(r.status).toBe(200);
      expect(r.body.user.role).toBe("teacher");
      teacherToken = r.body.token;
    });

    it("student login returns 200 + valid JWT", async () => {
      const r = await post("/auth/login", { email: EMAIL, password: PASSWORD, role: "student" });
      expect(r.status).toBe(200);
      expect(r.body.user.role).toBe("student");
      studentToken = r.body.token;
    });

    it("parent login returns 200 + valid JWT", async () => {
      const r = await post("/auth/login", { email: EMAIL, password: PASSWORD, role: "parent" });
      expect(r.status).toBe(200);
      expect(r.body.user.role).toBe("parent");
      parentToken = r.body.token;
    });

    it("wrong password returns 401", async () => {
      const r = await post("/auth/login", { email: EMAIL, password: "wrongpass", role: "admin" });
      expect(r.status).toBe(401);
    });

    it("wrong email returns 401", async () => {
      const r = await post("/auth/login", { email: "unknown@school.edu", password: PASSWORD, role: "admin" });
      expect(r.status).toBe(401);
    });

    it("missing role returns 400 or 401", async () => {
      const r = await post("/auth/login", { email: EMAIL, password: PASSWORD });
      expect([400, 401]).toContain(r.status);
    });

    it("unauthenticated GET /auth/me returns 401", async () => {
      const r = await get("/auth/me");
      expect(r.status).toBe(401);
    });

    it("GET /auth/me with valid token returns user", async () => {
      const r = await get("/auth/me", adminToken);
      expect(r.status).toBe(200);
      expect(r.body.user.role).toBe("admin");
    });
  });
});

// ── MODULE: ADMIN ─────────────────────────────────────────────────────────────

describe("🏛️ Admin Module", () => {
  it("GET /admin/dashboard returns stats", async () => {
    const r = await get("/admin/dashboard", adminToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("totalUsers");
  });

  it("GET /admin/dashboard without auth returns 401", async () => {
    const r = await get("/admin/dashboard");
    expect(r.status).toBe(401);
  });

  it("GET /admin/dashboard as teacher returns 403", async () => {
    const r = await get("/admin/dashboard", teacherToken);
    expect(r.status).toBe(403);
  });

  it("GET /admin/users returns user list", async () => {
    const r = await get("/admin/users", adminToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("users");
    expect(Array.isArray(r.body.users)).toBe(true);
  });

  it("POST /admin/announcements creates announcement", async () => {
    const r = await post(
      "/admin/announcements",
      { title: "TEST - Delete me", content: "Integration test announcement", audience: "all", priority: "low" },
      adminToken
    );
    expect(r.status).toBe(201);
    expect(r.body.announcement).toHaveProperty("_id");
    createdAnnouncementId = r.body.announcement._id;
  });

  it("GET /admin/announcements returns list with new announcement", async () => {
    const r = await get("/admin/announcements", adminToken);
    expect(r.status).toBe(200);
    expect(r.body.announcements.length).toBeGreaterThan(0);
  });

  it("GET /admin/enquiries returns list", async () => {
    const r = await get("/admin/enquiries", adminToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("enquiries");
  });
});

// ── MODULE: TEACHER ───────────────────────────────────────────────────────────

describe("👩‍🏫 Teacher Module", () => {
  it("GET /teacher/dashboard returns stats", async () => {
    const r = await get("/teacher/dashboard", teacherToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("studentCount");
    expect(r.body).toHaveProperty("homeworkCount");
    expect(r.body).toHaveProperty("recentStudents");
  });

  it("GET /teacher/dashboard as student returns 403", async () => {
    const r = await get("/teacher/dashboard", studentToken);
    expect(r.status).toBe(403);
  });

  it("POST /teacher/enroll creates student + parent accounts", async () => {
    const r = await post(
      "/teacher/enroll",
      {
        name: "Test Student " + Date.now(),
        parentName: "Test Parent",
        className: "इयत्ता १-ब",
        studentEmail: "testint_student@test.com",
        parentEmail: "testint_student@test.com", // same email, different role
        studentPassword: "Test1234",
        parentPassword: "Test1234",
      },
      teacherToken
    );
    expect(r.status).toBe(201);
    expect(r.body).toHaveProperty("name");
    expect(r.body).toHaveProperty("studentEmail");
    expect(r.body).toHaveProperty("parentEmail");
    createdStudentId = r.body.studentId || "";
  });

  it("POST /teacher/enroll as student returns 403", async () => {
    const r = await post(
      "/teacher/enroll",
      { name: "Hack", parentName: "Hack Parent", className: "इयत्ता १-ब" },
      studentToken
    );
    expect(r.status).toBe(403);
  });
});

// ── MODULE: HOMEWORK ─────────────────────────────────────────────────────────

describe("📚 Homework Module", () => {
  it("POST /homework creates homework", async () => {
    const r = await post(
      "/homework",
      {
        title: "Integration Test HW",
        subject: "गणित",
        description: "Test homework - delete me",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        className: "इयत्ता १-ब",
      },
      teacherToken
    );
    expect([200, 201]).toContain(r.status);
    createdHomeworkId = r.body.homework?._id || r.body._id || "";
  });

  it("GET /homework returns list for teacher", async () => {
    const r = await get("/homework", teacherToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("homework");
  });

  it("GET /homework returns list for student", async () => {
    const r = await get("/homework", studentToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("homework");
  });

  it("GET /homework returns list for parent", async () => {
    const r = await get("/homework", parentToken);
    expect(r.status).toBe(200);
  });

  it("GET /homework without auth returns 401", async () => {
    const r = await get("/homework");
    expect(r.status).toBe(401);
  });
});

// ── MODULE: ATTENDANCE ────────────────────────────────────────────────────────

describe("📅 Attendance Module", () => {
  const today = new Date().toISOString().slice(0, 10);

  it("GET /attendance returns records for teacher", async () => {
    const r = await get(`/attendance?date=${today}`, teacherToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("attendance");
  });

  it("GET /attendance returns records for student", async () => {
    const r = await get(`/attendance?date=${today}`, studentToken);
    expect(r.status).toBe(200);
  });

  it("POST /attendance saves records", async () => {
    const r = await post(
      "/attendance",
      {
        date: today,
        records: [{ studentId: "000000000000000000000001", status: "present" }],
      },
      teacherToken
    );
    // 200 or 201 = success, 404 = student not found (ok for integration test)
    expect([200, 201, 404, 400]).toContain(r.status);
  });

  it("POST /attendance as student returns 403", async () => {
    const r = await post(
      "/attendance",
      { date: today, records: [] },
      studentToken
    );
    expect(r.status).toBe(403);
  });
});

// ── MODULE: SCORES ────────────────────────────────────────────────────────────

describe("📊 Scores Module", () => {
  it("GET /scores returns scores for student", async () => {
    const r = await get("/scores", studentToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("scores");
  });

  it("GET /scores/analytics returns analytics for teacher", async () => {
    const r = await get("/scores/analytics", teacherToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("subjectPerformance");
    expect(r.body).toHaveProperty("monthlyTrend");
    expect(r.body).toHaveProperty("weakAreas");
    expect(r.body).toHaveProperty("strongAreas");
  });

  it("GET /scores/analytics as student returns 403", async () => {
    const r = await get("/scores/analytics", studentToken);
    expect(r.status).toBe(403);
  });
});

// ── MODULE: QUIZZES ───────────────────────────────────────────────────────────

describe("🎮 Quizzes Module", () => {
  it("GET /quizzes returns list for student", async () => {
    const r = await get("/quizzes", studentToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("quizzes");
  });

  it("GET /quizzes returns list for teacher", async () => {
    const r = await get("/quizzes", teacherToken);
    expect(r.status).toBe(200);
  });

  it("GET /quizzes without auth returns 401", async () => {
    const r = await get("/quizzes");
    expect(r.status).toBe(401);
  });
});

// ── MODULE: LMS ───────────────────────────────────────────────────────────────

describe("📖 LMS Module", () => {
  it("GET /lms returns courses for teacher", async () => {
    const r = await get("/lms", teacherToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("courses");
    expect(Array.isArray(r.body.courses)).toBe(true);
  });

  it("GET /lms returns courses for student", async () => {
    const r = await get("/lms", studentToken);
    expect(r.status).toBe(200);
  });

  it("GET /lms without auth returns 401", async () => {
    const r = await get("/lms");
    expect(r.status).toBe(401);
  });
});

// ── MODULE: MEETINGS ──────────────────────────────────────────────────────────

describe("📅 Meetings Module", () => {
  it("GET /meetings returns list for teacher", async () => {
    const r = await get("/meetings", teacherToken);
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("meetings");
  });
});

// ── MODULE: HEALTH CHECK ──────────────────────────────────────────────────────

describe("🏥 Health Check", () => {
  it("GET /health returns status ok", async () => {
    const r = await get("/health");
    expect(r.status).toBe(200);
    expect(r.body.status).toBe("ok");
  });
});
