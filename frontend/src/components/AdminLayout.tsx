import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Mail,
  Megaphone,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
  { title: "व्यवस्थापक डॅशबोर्ड", url: "/admin", icon: LayoutDashboard },
  { title: "सर्व वापरकर्ते", url: "/admin/users", icon: Users },
  { title: "प्रश्न", url: "/admin/enquiries", icon: HelpCircle },
  { title: "घोषणा", url: "/admin/announcements", icon: Megaphone },
];

export default function AdminLayout() {
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
              className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 p-5"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/admin" className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">वैनतेय व्यवस्थापन</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                {adminLinks.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    end={item.url === "/admin"}
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
        <header className="h-14 flex items-center justify-between px-6 bg-card border-b border-border sticky top-0 z-30">
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
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">व्यवस्थापक</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}