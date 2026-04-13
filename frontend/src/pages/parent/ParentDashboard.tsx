import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Bell, Calendar, MessageSquare, FileDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';
import { downloadPersonalAttendanceMonthPdf } from '@/lib/schoolPdf';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ParentDashboard() {
  const { user } = useAuth();

  const { data: instructionsData } = useQuery({
    queryKey: ['parent-instructions'],
    queryFn: () => apiCall('/instructions'),
  });

  const { data: meetingsData } = useQuery({
    queryKey: ['parent-meetings'],
    queryFn: () => apiCall('/meetings'),
  });

  const viewerClass = user?.meta?.class ? `&viewerClass=${encodeURIComponent(user.meta.class)}` : '';

  const { data: noticesData } = useQuery({
    queryKey: ['events-notices', user?.meta?.class],
    queryFn: () => apiCall(`/events?type=notice&audience=parents${viewerClass}`),
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events-upcoming', user?.meta?.class],
    queryFn: () => apiCall(`/events?type=event${viewerClass}`),
  });

  const ym = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  })();
  const attFrom = `${ym}-01`;
  const attTo = `${ym}-${String(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

  const { data: attMonth } = useQuery({
    queryKey: ['parent-attendance', ym],
    queryFn: () => apiCall(`/attendance?from=${attFrom}&to=${attTo}&limit=400`),
  });

  const instructions = instructionsData?.instructions ?? [];
  const meetings = meetingsData?.meetings ?? [];
  const notices = noticesData?.events ?? [];
  const events = eventsData?.events ?? [];
  const scheduledMeetings = meetings.filter((m: any) => m.status === 'नियोजित');
  const nextMeeting = scheduledMeetings[0];

  const attRows = (attMonth?.attendance ?? []).map((a: any) => ({ date: a.date, status: a.status }));
  const presentDays = attRows.filter((r: { status: string }) => r.status === 'present').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {user?.meta?.child?.charAt(0) || 'आ'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user?.meta?.child || 'विद्यार्थी'}</h1>
          <span className="text-sm text-primary font-medium">{user?.meta?.class || ''}</span>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <Link to="/parent/progress" className="flex items-center gap-1 hover:text-primary transition">
              <Star className="w-3 h-3 text-warning" /> प्रगती पहा
            </Link>
            <Link to="/parent/homework" className="flex items-center gap-1 hover:text-primary transition">
              <CheckCircle2 className="w-3 h-3 text-success" /> गृहपाठ
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="portal-card p-5">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> उपस्थिती ({ym})
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          नोंदी: {attRows.length} · उपस्थित दिवस: {presentDays}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={attRows.length === 0}
          onClick={() =>
            downloadPersonalAttendanceMonthPdf({
              ym,
              studentName: user?.meta?.child || 'विद्यार्थी',
              roll: user?.meta?.roll || '—',
              rows: attRows,
            })
          }
        >
          <FileDown className="w-4 h-4 mr-1" /> मासिक PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">पुढील PTM</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold">
            {nextMeeting ? new Date(nextMeeting.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' }) : '—'}
          </p>
          <p className="text-xs text-primary mt-1">
            {nextMeeting ? `📅 ${nextMeeting.timeLabel}` : 'कोणतीही सभा नाही'}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">शिक्षकांच्या सूचना</span>
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold">{instructions.length}</p>
          <p className="text-xs text-success mt-1">📝 नवीन संदेश</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">आगामी कार्यक्रम</span>
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold">{events.length}</p>
          <p className="text-xs text-success mt-1">🎪 शालेय कार्यक्रम</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="portal-card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> शिक्षकांच्या सूचना
            </h3>
            <div className="space-y-3">
              {instructions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">कोणत्याही सूचना नाहीत</p>
              ) : (
                instructions.map((inst: any) => (
                  <div key={inst._id} className="bg-accent/50 p-4 rounded-lg border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{inst.teacherName}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(inst.createdAt).toLocaleDateString('mr-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{inst.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="portal-card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> पालक-शिक्षक सभा (PTM)
            </h3>
            <div className="space-y-3">
              {scheduledMeetings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">कोणत्याही सभा नाहीत</p>
              ) : (
                scheduledMeetings.slice(0, 3).map((m: any) => (
                  <div key={m._id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.teacherName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.date).toLocaleDateString('mr-IN')} • {m.timeLabel}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.mode}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="portal-card p-5">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3">🔔 महत्त्वाच्या सूचना</h3>
            <div className="space-y-3">
              {notices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">कोणत्याही सूचना नाहीत</p>
              ) : (
                notices.slice(0, 3).map((n: any) => (
                  <div key={n._id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-primary font-medium leading-tight text-center">
                        {new Date(n.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="portal-card p-5">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3">🎪 आगामी कार्यक्रम</h3>
            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">कोणतेही कार्यक्रम नाहीत</p>
              ) : (
                events.slice(0, 4).map((event: any) => (
                  <div key={event._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition">
                    <span className="text-xl">{event.icon || '📅'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}