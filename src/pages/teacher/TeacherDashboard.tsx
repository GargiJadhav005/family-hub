import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: studentsData } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: () => apiCall('/students'),
  });

  const { data: meetingsData } = useQuery({
    queryKey: ['teacher-meetings'],
    queryFn: () => apiCall('/meetings'),
  });

  const { data: homeworkData } = useQuery({
    queryKey: ['teacher-homework-dash'],
    queryFn: () => apiCall('/homework'),
  });

  const students: any[] = studentsData?.students ?? [];
  const meetings: any[] = meetingsData?.meetings ?? [];
  const homework: any[] = homeworkData?.homework ?? [];
  const scheduledMeetings = meetings.filter((m: any) => m.status === 'नियोजित');
  const pendingHomework = homework.filter((h: any) => !h.completed);

  const statCards = [
    {
      label: 'एकूण विद्यार्थी',
      value: String(students.length),
      icon: Users,
      color: 'text-primary',
      trend: `${user?.meta?.class || ''} वर्ग`,
    },
    {
      label: 'येणाऱ्या सभा',
      value: String(scheduledMeetings.length),
      icon: Calendar,
      color: 'text-success',
      trend: 'पालक-शिक्षक सभा',
    },
    {
      label: 'प्रलंबित गृहपाठ',
      value: String(pendingHomework.length),
      icon: FileText,
      color: 'text-warning',
      trend: 'सक्रिय असाइनमेंट',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">नमस्कार, {user?.name || 'शिक्षक'}! 👋</h1>
        <p className="text-sm text-muted-foreground">
          आजचा दिनांक: {new Date().toLocaleDateString('mr-IN')} •{' '}
          <span className="text-primary font-medium">{user?.meta?.class || 'आपला वर्ग'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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
        <div className="lg:col-span-2 portal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">विद्यार्थी यादी</h3>
            <Link to="/teacher/attendance">
              <Button variant="outline" size="sm">हजेरी भरा</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {students.slice(0, 8).map((s: any) => (
              <div key={s.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {s.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium text-center line-clamp-1">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">अ.क्र. {s.roll}</p>
              </div>
            ))}
          </div>
          {students.length > 8 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              + {students.length - 8} अधिक विद्यार्थी
            </p>
          )}
        </div>

        <div className="portal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">आगामी सभा</h3>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {scheduledMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">कोणत्याही सभा नाहीत</p>
            ) : (
              scheduledMeetings.slice(0, 3).map((m: any) => (
                <div key={m._id} className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold text-sm">{m.studentName}</p>
                  <p className="text-xs text-muted-foreground">{m.timeLabel}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    m.mode === 'प्रत्यक्ष' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                  }`}>{m.mode}</span>
                </div>
              ))
            )}
          </div>
          <Link to="/teacher/meetings">
            <Button variant="outline" className="w-full mt-3 text-sm">सर्व सभा पहा</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}