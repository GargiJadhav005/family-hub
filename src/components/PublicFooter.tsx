import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">वैनतेय विद्या मंदिर</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              इयत्ता १ ली ते ४ थी - मुलांच्या उज्ज्वल भविष्यासाठी आणि सर्वांगीण विकासासाठी समर्पित संस्था.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">महत्वाच्या लिंक्स</h4>
            <div className="space-y-2 text-sm opacity-70">
              <Link to="/campus" className="block hover:opacity-100 transition">शाळा भेट</Link>
              <Link to="/activities" className="block hover:opacity-100 transition">शालेय उपक्रम</Link>
              <Link to="/admissions" className="block hover:opacity-100 transition">प्रवेश चौकशी</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">पोर्टल्स</h4>
            <div className="space-y-2 text-sm opacity-70">
              <Link to="/login" className="block hover:opacity-100 transition">शिक्षक पोर्टल</Link>
              <Link to="/login?role=parent" className="block hover:opacity-100 transition">पालक पोर्टल</Link>
              <Link to="/login?role=student" className="block hover:opacity-100 transition">विद्यार्थी पोर्टल</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">संपर्क</h4>
            <div className="space-y-2 text-sm opacity-70">
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +९१ २२ २३५६ ६८९०</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> info@vainateya.edu</p>
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> निफाड, ता. निफाड, जि. नाशिक</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/15 text-center text-xs opacity-50">
          © २०२५ वैनतेय प्राथमिक विद्या मंदिर. सर्व हक्क राखीव.
        </div>
      </div>
    </footer>
  );
}