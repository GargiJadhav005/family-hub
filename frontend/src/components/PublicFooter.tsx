import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { schoolConfig } from '@/config/school';

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-100">

      {/* ── Main Footer Content ── */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm text-white leading-tight block">{schoolConfig.displayNameMr}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{schoolConfig.taglineMr}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {schoolConfig.footerBlurbMr}
            </p>
            <p className="text-xs text-slate-500">{schoolConfig.trusteeLineMr}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">महत्वाच्या लिंक्स</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'आमच्याबद्दल', href: '/about' },
                { label: 'शाळा परिसर', href: '/campus' },
                { label: 'शालेय उपक्रम', href: '/activities' },
                { label: 'प्रवेश चौकशी', href: '/admissions' },
              ].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-primary flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">पोर्टल्स</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'शिक्षक पोर्टल', href: '/login' },
                { label: 'पालक पोर्टल', href: '/login?role=parent' },
                { label: 'विद्यार्थी पोर्टल', href: '/login?role=student' },
              ].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-primary flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">संपर्क</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <a href={`tel:${schoolConfig.phoneTel}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {schoolConfig.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-sm text-slate-400 space-y-1">
                  <a href={`mailto:${schoolConfig.emailGeneral}`} className="block hover:text-white transition-colors">
                    {schoolConfig.emailGeneral}
                  </a>
                  <a href={`mailto:${schoolConfig.emailAdmissions}`} className="block hover:text-white transition-colors text-xs">
                    प्रवेश: {schoolConfig.emailAdmissions}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-slate-400 leading-snug whitespace-pre-line">{schoolConfig.fullAddressMr}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {schoolConfig.copyrightYearMr} {schoolConfig.displayNameMr}. सर्व हक्क राखीव.
          </p>
          <Link to="/login" className="text-xs text-primary hover:text-blue-300 transition-colors duration-200 font-medium">
            पोर्टल लॉगिन →
          </Link>
        </div>
      </div>
    </footer>
  );
}