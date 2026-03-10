import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Bell,
  LogOut,
  Menu,
  X,
  UserPlus,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { motion, AnimatePresence } from "framer-motion";

const teacherLinks = [
  { title: "मुख्य डॅशबोर्ड", url: "/teacher", icon: LayoutDashboard },
  { title: "विद्यार्थी नोंदणी", url: "/teacher/enroll", icon: UserPlus },
  { title: "विद्यार्थी उपस्थिती", url: "/teacher/attendance", icon: Users },
  { title: "गृहपाठ", url: "/teacher/homework", icon: ClipboardList },
  { title: "प्रगती पुस्तक", url: "/teacher/progress", icon: FileText },
  { title: "वर्ग विश्लेषण", url: "/teacher/analytics", icon: BarChart3 },
  { title: "पालक-शिक्षक सभा", url: "/teacher/meetings", icon: Calendar },
  { title: "अभ्यासक्रम (LMS)", url: "/teacher/lms", icon: BookOpen },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "tween" }}
              className="fixed top-0 left-0 h-full w-64 bg-white border-r z-50 p-5"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/teacher" className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">शिक्षक पोर्टल</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                {teacherLinks.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    end={item.url === "/teacher"}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition"
                    activeClassName="bg-primary/10 text-primary font-medium"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-between px-6 bg-white border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-sm font-semibold text-muted-foreground hidden sm:block">
              वैनतेय प्राथमिक विद्या मंदिर
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.name?.charAt(0) || "श"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">{user?.meta?.subject}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
