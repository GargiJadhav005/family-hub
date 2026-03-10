import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Bell, Calendar, MessageSquare, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const notices = [
  { date: 'ऑक्टो\n२५', title: 'वार्षिक विज्ञान प्रदर्शन नोंदणी', desc: 'इयत्ता ३ री आणि ४ थी च्या विद्यार्थ्यांसाठी नोंदणी सुरू.' },
  { date: 'ऑक्टो\n२२', title: 'गणवेश अपडेट: हिवाळी हंगाम', desc: 'येत्या सोमवारपासून हिवाळी गणवेश अनिवार्य आहे.' },
  { date: 'ऑक्टो\n१०', title: 'नवीन अभ्यासेतर क्लब', desc: 'कोडिंग आणि बुद्धिबळ क्लब सुरू करत आहोत.' },
];

const ptmAlerts = [
  { date: '५ नोव्हें, २०२४', time: 'दुपारी ३:३० - ४:०० वाजता', teacher: 'श्री. मोरे सर', status: 'नियोजित', type: 'प्रत्यक्ष' },
  { date: '१२ नोव्हें, २०२४', time: 'दुपारी ४:१५ - ४:४५ वाजता', teacher: 'कु. भोरत मॅडम', status: 'नियोजित', type: 'ऑनलाइन' },
];

const upcomingEvents = [
  { title: 'वार्षिक क्रीडा दिवस', date: '१५ नोव्हें', icon: '🏆' },
  { title: 'विज्ञान प्रदर्शन', date: '२० नोव्हें', icon: '🔬' },
  { title: 'बालदिन कार्यक्रम', date: '१४ नोव्हें', icon: '🎉' },
  { title: 'शालेय सहल', date: '२५ नोव्हें', icon: '🚌' },
];

const teacherInstructions = [
  { teacher: 'श्री. मोरे सर', message: 'कृपया आरवला दररोज गणिताच्या गुणाकार सारणीचा सराव करवा. ७ आणि ८ च्या सारण्या कमकुवत आहेत.', date: 'आज' },
  { teacher: 'कु. भोरत मॅडम', message: 'आरवने आज विज्ञानाच्या प्रयोगात खूप छान सादरीकरण केले. शुद्धलेखनाचा सराव करणे आवश्यक आहे.', date: 'काल' },
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
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">पुढील PTM</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold">५ नोव्हें</p>
          <p className="text-xs text-primary mt-1">📅 दुपारी ३:३० वाजता</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Instructions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="portal-card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> शिक्षकांच्या सूचना
            </h3>
            <div className="space-y-3">
              {teacherInstructions.map((inst, i) => (
                <div key={i} className="bg-accent/50 p-4 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{inst.teacher}</p>
                    <span className="text-xs text-muted-foreground">{inst.date}</span>
                  </div>
                  <p className="text-sm text-foreground italic leading-relaxed">{inst.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PTM Alerts */}
          <div className="portal-card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> पालक-शिक्षक सभा (PTM)
            </h3>
            <div className="space-y-3">
              {ptmAlerts.map((ptm, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ptm.teacher}</p>
                    <p className="text-xs text-muted-foreground">{ptm.date} • {ptm.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{ptm.type}</span>
                    <span className="text-xs text-success">{ptm.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Notices */}
          <div className="portal-card p-5">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3">🔔 महत्त्वाच्या सूचना</h3>
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

          {/* Upcoming Events */}
          <div className="portal-card p-5">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3">🎪 आगामी कार्यक्रम</h3>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.title} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition">
                  <span className="text-xl">{event.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
