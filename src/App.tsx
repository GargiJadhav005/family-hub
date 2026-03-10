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

// Parent
import ParentLayout from "@/components/ParentLayout";
import ParentDashboard from "@/pages/parent/ParentDashboard";
import ParentProgress from "@/pages/parent/ParentProgress";
import ParentFees from "@/pages/parent/ParentFees";
import ParentBus from "@/pages/parent/ParentBus";
import ParentHomework from "@/pages/parent/ParentHomework";

/* ---------------------------------- */
/* Query Client Setup (Optimized) */
/* ---------------------------------- */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

/* ---------------------------------- */
/* Scroll To Top On Route Change */
/* ---------------------------------- */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
              {/* ---------------- PUBLIC ROUTES ---------------- */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/campus" element={<Campus />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/admissions" element={<Admissions />} />

              {/* ---------------- TEACHER ROUTES ---------------- */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <TeacherLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<TeacherDashboard />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="meetings" element={<TeacherMeetings />} />
                <Route path="progress" element={<TeacherProgress />} />
                <Route path="lms" element={<TeacherLMS />} />
              </Route>

              {/* ---------------- PARENT ROUTES ---------------- */}
              <Route
                path="/parent"
                element={
                  <ProtectedRoute allowedRole="parent">
                    <ParentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ParentDashboard />} />
                <Route path="progress" element={<ParentProgress />} />
                <Route path="fees" element={<ParentFees />} />
                <Route path="bus" element={<ParentBus />} />
                <Route path="homework" element={<ParentHomework />} />
              </Route>

              {/* ---------------- FALLBACK ---------------- */}
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