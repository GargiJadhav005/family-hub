import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LayoutDashboard, CreditCard, Bus, BookOpen, ClipboardList, Bell, LogOut, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

const parentLinks = [
  { title: 'पालक डॅशबोर्ड', url: '/parent', icon: LayoutDashboard },
  { title: 'विद्यार्थी प्रगती', url: '/parent/progress', icon: ClipboardList },
  { title: 'फी व ईआरपी', url: '/parent/fees', icon: CreditCard },
  { title: 'बस ट्रॅकिंग', url: '/parent/bus', icon: Bus },
  { title: 'घरचा अभ्यास', url: '/parent/homework', icon: BookOpen },
];

export default function ParentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/parent" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm hidden sm:block">वैनतेय प्राथमिक विद्या मंदिर</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {parentLinks.map((l) => (
              <Link
                key={l.url}
                to={l.url}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  (l.url === '/parent' ? location.pathname === '/parent' : location.pathname.startsWith(l.url))
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <l.icon className="w-4 h-4" />
                {l.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-medium">{user?.name}</span>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.name?.charAt(0) || 'प'}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}><LogOut className="w-4 h-4" /></Button>
            <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 pb-3">
            {parentLinks.map((l) => (
              <Link
                key={l.url}
                to={l.url}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                <l.icon className="w-4 h-4" />
                {l.title}
              </Link>
            ))}
          </div>
        )}
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
      <footer className="border-t border-border py-4 px-4 text-center text-xs text-muted-foreground">
        © २०२५ वैनतेय प्राथमिक विद्या मंदिर. सर्व हक्क राखीव.
      </footer>
    </div>
  );
}
