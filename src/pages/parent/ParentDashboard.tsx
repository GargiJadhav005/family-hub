import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, TrendingUp, Star, Bus, Bell, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const notices = [
  { date: 'ऑक्टो\n२५', title: 'वार्षिक विज्ञान प्रदर्शन नोंदणी', desc: 'इयत्ता ३ री आणि ४ थी च्या विद्यार्थ्यांसाठी नोंदणी सुरू.' },
  { date: 'ऑक्टो\n२२', title: 'गणवेश अपडेट: हिवाळी हंगाम', desc: 'येत्या सोमवारपासून हिवाळी गणवेश अनिवार्य आहे.' },
  { date: 'ऑक्टो\n१०', title: 'नवीन अभ्यासेतर क्लब', desc: 'कोडिंग आणि बुद्धिबळ क्लब सुरू करत आहोत.' },
];

const fees = [
  { id: '#TXN-882910', type: 'शिक्षण शुल्क - सप्टें २०२३', date: '०५ सप्टें, २०२३', method: 'क्रेडिट कार्ड', amount: '₹१२,०००', status: 'भरली' },
  { id: '#TXN-881542', type: 'वाहतूक फी - तिसरी तिमाही', date: '२८ ऑगस्ट, २०२३', method: 'बँक ट्रान्सफर', amount: '₹३,५००', status: 'भरली' },
];

export default function ParentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Child profile */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {user?.meta?.child?.charAt(0) || 'आ'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user?.meta?.child || 'आरव पाटील'}</h1>
          <span className="text-sm text-primary font-medium">{user?.meta?.class || 'इयत्ता ३-ब'}</span>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> उपस्थिती: ९६%</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning" /> रँक: वर्गात ५ वा</span>
            <span>🏅 १२ पदके</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><CreditCard className="w-4 h-4 mr-1" /> फी भरणा</Button>
          <Button variant="outline" size="sm"><Bus className="w-4 h-4 mr-1" /> वाहतूक सुविधा</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">एकूण थकबाकी</span>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-extrabold">₹४,५००</p>
            <p className="text-xs text-destructive mt-1">⚠ ३ दिवसात भरणे आवश्यक</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">हजेरी (मासिक)</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-extrabold">९८%</p>
            <p className="text-xs text-success mt-1">📈 सरासरीपेक्षा जास्त</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">शेवटचा श्रेणी निकाल</span>
              <Star className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-extrabold">अ-१</p>
            <p className="text-xs text-success mt-1">🎯 वर्गातील प्रथम १०% मध्ये</p>
          </div>
        </div>

        {/* Notices */}
        <div className="portal-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">🔔 महत्त्वाच्या सूचना</h3>
            <button className="text-xs text-primary">सर्व पहा</button>
          </div>
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.title} className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-primary font-medium leading-tight text-center whitespace-pre-line">{n.date}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee history */}
      <div className="portal-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">📋 फी व्यवस्थापन आणि इतिहास</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">उतारा डाउनलोड करा</Button>
            <Button size="sm"><CreditCard className="w-4 h-4 mr-1" /> फी भरा</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">व्यवहार आयडी</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">फी प्रकार</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">भरल्याची तारीख</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">पद्धत</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">रक्कम</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id} className="border-b border-border/50">
                  <td className="p-3 text-sm font-mono">{f.id}</td>
                  <td className="p-3 text-sm font-medium">{f.type}</td>
                  <td className="p-3 text-sm text-muted-foreground">{f.date}</td>
                  <td className="p-3 text-sm text-muted-foreground">{f.method}</td>
                  <td className="p-3 text-sm font-semibold">{f.amount}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
