import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "@/components/NavLink";

const parentLinks = [
  { title: "पालक डॅशबोर्ड", url: "/parent", icon: LayoutDashboard },
  { title: "विद्यार्थी प्रगती", url: "/parent/progress", icon: ClipboardList },
  { title: "घरचा अभ्यास", url: "/parent/homework", icon: BookOpen },
];

export default function ParentLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">पालक पोर्टल</p>
          <p className="text-[10px] text-muted-foreground">वैनतेय विद्या मंदिर</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <nav className="space-y-0.5">
        {parentLinks.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/parent"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
            activeClassName="bg-primary/10 text-primary font-medium"
            onClick={onClose}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 p-5 lg:hidden"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col p-5 shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-sm font-medium text-muted-foreground hidden sm:block">
              वैनतेय प्राथमिक विद्या मंदिर
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
            </Button>
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.name?.charAt(0) || "प"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">पालक</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}