import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { label: 'मुख्यपृष्ठ', href: '/' },
  { label: 'शालेय परिसर', href: '/campus' },
  { label: 'उपक्रम', href: '/activities' },
  { label: 'प्रवेश', href: '/admissions' },
];

export function PublicNavbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base text-foreground leading-tight block">वैनतेय विद्या मंदिर</span>
            <span className="text-[10px] text-muted-foreground leading-tight">निफाड, नाशिक</span>
          </div>
          <span className="sm:hidden font-bold text-sm text-foreground">वैनतेय</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                location.pathname === l.href ? 'text-primary bg-primary/5' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <Button size="sm" className="gap-2">
              <LogIn className="w-3.5 h-3.5" /> लॉगिन
            </Button>
          </Link>
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-muted transition" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 animate-fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`block py-2.5 text-sm font-medium transition-colors ${
                location.pathname === l.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Link to="/login" className="col-span-3"><Button size="sm" className="w-full gap-2"><LogIn className="w-3.5 h-3.5" /> लॉगिन करा</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}