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
              <span className="font-bold">वैनतेय प्राथमिक विद्या मंदिर</span>
            </div>
            <p className="text-sm opacity-70">
              इयत्ता १ ली ते ४ थी च्या विद्यार्थ्यांच्या उज्ज्वल भविष्यासाठी आणि सर्वांगीण विकासासाठी समर्पित संस्था.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">महत्वाच्या लिंक्स</h4>
            <div className="space-y-2 text-sm opacity-70">
              <Link to="/campus" className="block hover:opacity-100">शाळा भेट</Link>
              <Link to="/activities" className="block hover:opacity-100">शालेय कॅलेंडर</Link>
              <Link to="/admissions" className="block hover:opacity-100">अभ्यासक्रम</Link>
              <Link to="/login" className="block hover:opacity-100">शिक्षक वर्ग</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">पोर्टल्स</h4>
            <div className="space-y-2 text-sm opacity-70">
              <Link to="/login" className="block hover:opacity-100">प्रशासक लॉगिन</Link>
              <Link to="/login" className="block hover:opacity-100">शिक्षक पोर्टल</Link>
              <Link to="/login?role=parent" className="block hover:opacity-100">पालक डॅशबोर्ड</Link>
              <Link to="/login?role=parent" className="block hover:opacity-100">विद्यार्थी संसाधने</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">संपर्क</h4>
            <div className="space-y-2 text-sm opacity-70">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +९१ २२ २३५६ ६८९०</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@vainteyschool.edu</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> विवेकन मार्ग, नाशिक, महाराष्ट्र</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center text-sm opacity-60">
          © २०२५ वैनतेय प्राथमिक विद्या मंदिर. सर्व हक्क राखीव.
        </div>
      </div>
    </footer>
  );
}
