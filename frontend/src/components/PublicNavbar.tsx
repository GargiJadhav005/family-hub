import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { schoolConfig } from '@/config/school';
import { GraduationCap, Menu, X, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'मुख्यपृष्ठ', href: '/' },
  { label: 'आमच्याबद्दल', href: '/about' },
  { label: 'शालेय परिसर', href: '/campus' },
  { label: 'उपक्रम', href: '/activities' },
  { label: 'प्रवेश', href: '/admissions' },
];

export function PublicNavbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to change navbar style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-400 ${
      scrolled
        ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shadow-indigo-100/40'
        : 'bg-white/70 backdrop-blur-lg border-b border-white/30'
    }`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow duration-300">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm text-foreground leading-tight block">{schoolConfig.displayNameMr}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{schoolConfig.taglineMr}</span>
          </div>
          <span className="sm:hidden font-bold text-sm text-foreground">{schoolConfig.shortNameMr}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === l.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/70'
              }`}
            >
              {l.label}
              {/* Active underline indicator */}
              {location.pathname === l.href && (
                <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <Button size="sm"
              className="gap-2 rounded-xl shadow-md shadow-indigo-200/50 hover:shadow-indigo-300/60 transition-all duration-300 hover:-translate-y-0.5">
              <LogIn className="w-3.5 h-3.5" /> पोर्टल लॉगिन
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-white/90 backdrop-blur-xl px-4 pb-5 pt-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`flex items-center py-2.5 text-sm font-medium transition-colors duration-200 border-b border-slate-100 last:border-0 ${
                location.pathname === l.href ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-4">
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full gap-2 rounded-xl">
                <LogIn className="w-3.5 h-3.5" /> पोर्टल लॉगिन
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}