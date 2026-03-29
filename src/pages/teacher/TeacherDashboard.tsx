import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';

interface AttendanceStudent {
  id: string;
  name: string;
  roll: string;
  status: string;
}

interface Meeting {
  _id: string;
  studentName: string;
  timeLabel: string;
  mode: string;
  status: string;
  date: string;
}

export default function TeacherDashboard() {
  const { data: studentsData } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: () => apiCall('/students'),
  });

  const { data: meetingsData } = useQuery({
    queryKey: ['teacher-meetings'],
    queryFn: () => apiCall('/meetings'),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['teacher-attendance-today'],
    queryFn: () => apiCall('/attendance'),
  });

  const students: AttendanceStudent[] = (studentsData?.students ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    roll: s.roll,
    status: 'present',
  }));

  const meetings: Meeting[] = meetingsData?.meetings ?? [];

  const presentCount = attendanceData?.records
    ? attendanceData.records.filter((r: any) => r.status === 'present').length
    : 0;
  const totalStudents = students.length;

  const statCards = [
    {
      label: 'आजची उपस्थिती',
      value: totalStudents ? `${Math.round((presentCount / totalStudents) * 100)}%` : '—',
      icon: Users,
      color: 'text-success',
      trend: `${presentCount}/${totalStudents} विद्यार्थी उपस्थित`,
    },
    {
      label: 'येणाऱ्या सभा',
      value: String(meetings.filter(m => m.status === 'नियोजित').length).padStart(2, '०'),
      icon: Calendar,
      color: 'text-primary',
      trend: 'पालक-शिक्षक सभा',
    },
    {
      label: 'एकूण विद्यार्थी',
      value: String(totalStudents).padStart(2, '०'),
      icon: FileText,
      color: 'text-destructive',
      trend: 'आपल्या वर्गातील',
    },
  ];

  const handleSaveAttendance = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await apiCall('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          date: today,
          records: students.map(s => ({ studentId: s.id, status: s.status })),
        }),
      });
      toast.success('हजेरी जतन केली!');
    } catch {
      toast.error('हजेरी जतन करण्यात अडचण आली');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">शिक्षक डॅशबोर्ड</h1>
        <p className="text-sm text-muted-foreground">
          आजचा दिनांक: {new Date().toLocaleDateString('mr-IN')} •{' '}
          <span className="text-primary font-medium">इयत्ता ४-ब सत्र सुरू आहे</span>
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
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={handleSaveAttendance}>
                बदल जतन करा
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {students.slice(0, 8).map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {s.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-center">{s.name}</p>
                <p className="text-xs text-muted-foreground">अ.क्र. {s.roll}</p>
                <div className="flex gap-1">
                  <button className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${s.status === 'present' ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${s.status === 'absent' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${s.status === 'late' ? 'bg-warning text-warning-foreground' : 'bg-secondary text-muted-foreground'}`}>
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
            {meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">कोणत्याही सभा नाहीत</p>
            ) : (
              meetings.slice(0, 4).map((m) => (
                <div key={m._id} className="p-3 rounded-lg bg-secondary/50">
                  {m.status !== 'पूर्ण' && <p className="text-xs text-muted-foreground mb-1">पुढील सभा</p>}
                  <p className="font-semibold text-sm">{m.studentName} कुटुंब सभा</p>
                  <p className="text-xs text-muted-foreground">{m.timeLabel}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    m.mode === 'प्रत्यक्ष' ? 'bg-primary/10 text-primary' :
                    m.mode === 'ऑनलाइन' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    {m.mode}
                  </span>
                </div>
              ))
            )}
          </div>
          <Button variant="outline" className="w-full mt-3 text-sm">नवीन सभा बुक करा</Button>
        </div>
      </div>
    </div>
  );
}
