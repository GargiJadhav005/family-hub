import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Loading component for lazy boundaries
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Public Pages - Lazy loaded
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Campus = lazy(() => import("@/pages/Campus"));
const Activities = lazy(() => import("@/pages/Activities"));
const Admissions = lazy(() => import("@/pages/Admissions"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Teacher - Lazy loaded
const TeacherLayout = lazy(() => import("@/components/TeacherLayout"));
const TeacherDashboard = lazy(() => import("@/pages/teacher/TeacherDashboard"));
const TeacherAttendance = lazy(() => import("@/pages/teacher/TeacherAttendance"));
const TeacherMeetings = lazy(() => import("@/pages/teacher/TeacherMeetings"));
const TeacherProgress = lazy(() => import("@/pages/teacher/TeacherProgress"));
const TeacherEnroll = lazy(() => import("@/pages/teacher/TeacherEnroll"));
const TeacherEnrollDetail = lazy(() => import("@/pages/teacher/TeacherEnrollDetail"));
const TeacherHomework = lazy(() => import("@/pages/teacher/TeacherHomework"));
const TeacherAnalytics = lazy(() => import("@/pages/teacher/TeacherAnalytics"));
const TeacherQuiz = lazy(() => import("@/pages/teacher/TeacherQuiz"));
const TeacherLMS = lazy(() => import("@/pages/teacher/TeacherLMS"));

// Parent - Lazy loaded
const ParentLayout = lazy(() => import("@/components/ParentLayout"));
const ParentDashboard = lazy(() => import("@/pages/parent/ParentDashboard"));
const ParentProgress = lazy(() => import("@/pages/parent/ParentProgress"));
const ParentHomework = lazy(() => import("@/pages/parent/ParentHomework"));
const ParentAttendance = lazy(() => import("@/pages/parent/ParentAttendance"));

// Student - Lazy loaded
const StudentLayout = lazy(() => import("@/components/StudentLayout"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentQuizzes = lazy(() => import("@/pages/student/StudentQuizzes"));
const StudentScores = lazy(() => import("@/pages/student/StudentScores"));
const StudentAttendance = lazy(() => import("@/pages/student/StudentAttendance"));

// Admin - Lazy loaded
const AdminLayout = lazy(() => import("@/components/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminEnquiries = lazy(() => import("@/pages/admin/AdminEnquiries"));
const AdminAnnouncements = lazy(() => import("@/pages/admin/AdminAnnouncements"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <ErrorBoundary>
              <Routes>
                {/* PUBLIC */}
                <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Index /></Suspense>} />
                <Route path="/login" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
                <Route path="/forgot-password" element={<Suspense fallback={<LoadingSpinner />}><ForgotPassword /></Suspense>} />
                <Route path="/campus" element={<Suspense fallback={<LoadingSpinner />}><Campus /></Suspense>} />
                <Route path="/activities" element={<Suspense fallback={<LoadingSpinner />}><Activities /></Suspense>} />
                <Route path="/admissions" element={<Suspense fallback={<LoadingSpinner />}><Admissions /></Suspense>} />
                <Route path="/about" element={<Suspense fallback={<LoadingSpinner />}><About /></Suspense>} />

                {/* TEACHER */}
                <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><Suspense fallback={<LoadingSpinner />}><TeacherLayout /></Suspense></ProtectedRoute>}>
                  <Route index element={<Suspense fallback={<LoadingSpinner />}><TeacherDashboard /></Suspense>} />
                  <Route path="enroll" element={<Suspense fallback={<LoadingSpinner />}><TeacherEnroll /></Suspense>} />
                  <Route path="enroll/:studentId" element={<Suspense fallback={<LoadingSpinner />}><TeacherEnrollDetail /></Suspense>} />
                  <Route path="attendance" element={<Suspense fallback={<LoadingSpinner />}><TeacherAttendance /></Suspense>} />
                  <Route path="homework" element={<Suspense fallback={<LoadingSpinner />}><TeacherHomework /></Suspense>} />
                  <Route path="progress" element={<Suspense fallback={<LoadingSpinner />}><TeacherProgress /></Suspense>} />
                  <Route path="analytics" element={<Suspense fallback={<LoadingSpinner />}><TeacherAnalytics /></Suspense>} />
                  <Route path="meetings" element={<Suspense fallback={<LoadingSpinner />}><TeacherMeetings /></Suspense>} />
                  <Route path="quiz" element={<Suspense fallback={<LoadingSpinner />}><TeacherQuiz /></Suspense>} />
                  <Route path="lms" element={<Suspense fallback={<LoadingSpinner />}><TeacherLMS /></Suspense>} />
                </Route>

                {/* PARENT */}
                <Route path="/parent" element={<ProtectedRoute allowedRole="parent"><Suspense fallback={<LoadingSpinner />}><ParentLayout /></Suspense></ProtectedRoute>}>
                  <Route index element={<Suspense fallback={<LoadingSpinner />}><ParentDashboard /></Suspense>} />
                  <Route path="progress" element={<Suspense fallback={<LoadingSpinner />}><ParentProgress /></Suspense>} />
                  <Route path="homework" element={<Suspense fallback={<LoadingSpinner />}><ParentHomework /></Suspense>} />
                  <Route path="attendance" element={<Suspense fallback={<LoadingSpinner />}><ParentAttendance /></Suspense>} />
                </Route>

                {/* STUDENT */}
                <Route path="/student" element={<ProtectedRoute allowedRole="student"><Suspense fallback={<LoadingSpinner />}><StudentLayout /></Suspense></ProtectedRoute>}>
                  <Route index element={<Suspense fallback={<LoadingSpinner />}><StudentDashboard /></Suspense>} />
                  <Route path="quizzes" element={<Suspense fallback={<LoadingSpinner />}><StudentQuizzes /></Suspense>} />
                  <Route path="scores" element={<Suspense fallback={<LoadingSpinner />}><StudentScores /></Suspense>} />
                  <Route path="attendance" element={<Suspense fallback={<LoadingSpinner />}><StudentAttendance /></Suspense>} />
                </Route>

                {/* ADMIN */}
                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><Suspense fallback={<LoadingSpinner />}><AdminLayout /></Suspense></ProtectedRoute>}>
                  <Route index element={<Suspense fallback={<LoadingSpinner />}><AdminDashboard /></Suspense>} />
                  <Route path="users" element={<Suspense fallback={<LoadingSpinner />}><AdminUsers /></Suspense>} />
                  <Route path="enquiries" element={<Suspense fallback={<LoadingSpinner />}><AdminEnquiries /></Suspense>} />
                  <Route path="announcements" element={<Suspense fallback={<LoadingSpinner />}><AdminAnnouncements /></Suspense>} />
                </Route>

                {/* FALLBACK AND ERRORS */}
                <Route path="/404" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
                <Route path="/error" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
                <Route path="/unauthorized" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
                <Route path="/forbidden" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
