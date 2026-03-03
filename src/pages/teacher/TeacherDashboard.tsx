import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Users, Clock, FileText, TrendingUp, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const statCards = [
  { label: 'आजची उपस्थिती', value: '९४%', icon: Users, trend: 'कालच्या तुलनेत +२.४% जास्त', color: 'text-success' },
  { label: 'येणाऱ्या सभा', value: '०६', icon: Calendar, trend: '३ उद्या नियोजित आहेत', color: 'text-primary' },
  { label: 'अपूर्ण प्रगती पुस्तके', value: '१२', icon: FileText, trend: 'मुदत ४ दिवसात संपत आहे', color: 'text-destructive' },
];

const students = [
  { name: 'लियो बेकर', id: '#०१', status: 'present' },
  { name: 'मिया चेन', id: '#०२', status: 'present' },
  { name: 'ऑस्कर वाइल्ड', id: '#०३', status: 'absent' },
  { name: 'सारा जून', id: '#०४', status: 'late' },
];

const meetings = [
  { title: 'बेकर कुटुंब सभा', time: '3:30 PM - 4:00 PM', type: 'प्रत्यक्ष' },
  { title: 'चेन कुटुंब सभा', time: 'उद्या, ४:१५ PM', type: 'ऑनलाइन' },
  { title: 'स्टोन कुटुंब सभा', time: 'पूर्ण • २३ ऑक्टोबर', type: 'पूर्ण' },
];

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">शिक्षक डॅशबोर्ड</h1>
        <p className="text-sm text-muted-foreground">
          आजचा दिनांक: २८ ऑक्टोबर २०२४ • <span className="text-primary font-medium">इयत्ता ४-ब सत्र सुरू आहे</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-extrabold">{s.value}</div>
            <p className={`text-xs mt-1 ${s.color}`}>{s.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance */}
        <div className="lg:col-span-2 portal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">विद्यार्थी हजेरी फलक</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">सर्व हजर करा</Button>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30">बदल जतन करा</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {students.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {s.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-center">{s.name}</p>
                <p className="text-xs text-muted-foreground">अनुक्रमांक {s.id}</p>
                <div className="flex gap-1">
                  <button className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    s.status === 'present' ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    s.status === 'absent' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    s.status === 'late' ? 'bg-warning text-warning-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meetings */}
        <div className="portal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">सभा वेळापत्रक</h3>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.title} className="p-3 rounded-lg bg-secondary/50">
                {m.type !== 'पूर्ण' && <p className="text-xs text-muted-foreground mb-1">पुढील सभा</p>}
                <p className="font-semibold text-sm">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.time}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                  m.type === 'प्रत्यक्ष' ? 'bg-primary/10 text-primary' :
                  m.type === 'ऑनलाइन' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  {m.type}
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-3 text-sm">नवीन सभा बुक करा</Button>
        </div>
      </div>
    </div>
  );
}
