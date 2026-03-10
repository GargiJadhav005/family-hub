import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Campus from "@/pages/Campus";
import Activities from "@/pages/Activities";
import Admissions from "@/pages/Admissions";
import NotFound from "@/pages/NotFound";

// Teacher
import TeacherLayout from "@/components/TeacherLayout";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherAttendance from "@/pages/teacher/TeacherAttendance";
import TeacherMeetings from "@/pages/teacher/TeacherMeetings";
import TeacherProgress from "@/pages/teacher/TeacherProgress";
import TeacherLMS from "@/pages/teacher/TeacherLMS";
import TeacherEnroll from "@/pages/teacher/TeacherEnroll";
import TeacherHomework from "@/pages/teacher/TeacherHomework";
import TeacherAnalytics from "@/pages/teacher/TeacherAnalytics";

// Parent
import ParentLayout from "@/components/ParentLayout";
import ParentDashboard from "@/pages/parent/ParentDashboard";
import ParentProgress from "@/pages/parent/ParentProgress";
import ParentHomework from "@/pages/parent/ParentHomework";

// Student
import StudentLayout from "@/components/StudentLayout";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentQuizzes from "@/pages/student/StudentQuizzes";
import StudentScores from "@/pages/student/StudentScores";

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
            <Routes>
              {/* PUBLIC */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/campus" element={<Campus />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/admissions" element={<Admissions />} />

              {/* TEACHER */}
              <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
                <Route index element={<TeacherDashboard />} />
                <Route path="enroll" element={<TeacherEnroll />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="homework" element={<TeacherHomework />} />
                <Route path="progress" element={<TeacherProgress />} />
                <Route path="analytics" element={<TeacherAnalytics />} />
                <Route path="meetings" element={<TeacherMeetings />} />
                <Route path="lms" element={<TeacherLMS />} />
              </Route>

              {/* PARENT */}
              <Route path="/parent" element={<ProtectedRoute allowedRole="parent"><ParentLayout /></ProtectedRoute>}>
                <Route index element={<ParentDashboard />} />
                <Route path="progress" element={<ParentProgress />} />
                <Route path="homework" element={<ParentHomework />} />
              </Route>

              {/* STUDENT */}
              <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
                <Route index element={<StudentDashboard />} />
                <Route path="quizzes" element={<StudentQuizzes />} />
                <Route path="scores" element={<StudentScores />} />
              </Route>

              {/* FALLBACK */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
