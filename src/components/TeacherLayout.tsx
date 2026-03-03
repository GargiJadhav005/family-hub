import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { GraduationCap, LayoutDashboard, Users, Calendar, FileText, BookOpen, Settings, Bell, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const teacherLinks = [
  { title: 'मुख्य डॅशबोर्ड', url: '/teacher', icon: LayoutDashboard },
  { title: 'विद्यार्थी उपस्थिती', url: '/teacher/attendance', icon: Users },
  { title: 'पालक-शिक्षक सभा', url: '/teacher/meetings', icon: Calendar },
  { title: 'प्रगती पुस्तक', url: '/teacher/progress', icon: FileText },
  { title: 'अभ्यासक्रम (LMS)', url: '/teacher/lms', icon: BookOpen },
];

function TeacherSidebarContent() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
          <Link to="/teacher" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-bold text-sm">एल.एम.एस. पोर्टल</span>}
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>नेव्हिगेशन</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teacherLinks.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/teacher'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function TeacherLayout() {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TeacherSidebarContent />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-sm font-semibold text-primary hidden sm:block">वैनतेय प्राथमिक विद्या मंदिर</span>
            </div>
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="विद्यार्थी किंवा रेकॉर्ड शोधा..." className="pl-9 h-9" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user?.name?.charAt(0) || 'श'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.meta?.subject}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} title="लॉगआउट">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
