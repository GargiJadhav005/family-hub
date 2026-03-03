import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">वैनतेय प्राथमिक विद्या मंदिर</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm">शिक्षक लॉगिन</Button>
          </Link>
          <Link to="/login?role=parent">
            <Button size="sm">पालक पोर्टल</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3">
            <Link to="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">शिक्षक लॉगिन</Button></Link>
            <Link to="/login?role=parent" className="flex-1"><Button size="sm" className="w-full">पालक पोर्टल</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
