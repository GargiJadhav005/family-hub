import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Plus, CheckCircle2, CalendarClock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function TeacherMeetings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [rescheduleFor, setRescheduleFor] = useState<{ id: string } | null>(null);

  const [scope, setScope] = useState<'student' | 'class'>('student');
  const [studentId, setStudentId] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [mode, setMode] = useState<'प्रत्यक्ष' | 'ऑनलाइन'>('प्रत्यक्ष');
  const [notes, setNotes] = useState('');

  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');

  const { data: studentsData } = useQuery({
    queryKey: ['meetings-students'],
    queryFn: () => apiCall('/students?limit=200'),
    enabled: scheduleOpen && scope === 'student',
  });
  const students: any[] = studentsData?.students ?? [];

  const { data } = useQuery({
    queryKey: ['teacher-meetings-full'],
    queryFn: () => apiCall('/meetings'),
  });

  const createMut = useMutation({
    mutationFn: async () => {
      if (!meetDate) throw new Error('कृपया तारीख निवडा');
      if (!timeLabel.trim()) throw new Error('कृपया वेळ निवडा');
      if (scope === 'student' && !studentId) throw new Error('कृपया विद्यार्थी निवडा');
      
      return apiCall('/meetings', {
        method: 'POST',
        body: JSON.stringify(
          scope === 'class'
            ? { classWide: true, date: meetDate, timeLabel, mode, notes: notes || undefined }
            : {
                studentId,
                date: meetDate,
                timeLabel,
                mode,
                notes: notes || undefined,
              }
        ),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-meetings-full'] });
      toast.success('सभा नियोजित केली');
      setScheduleOpen(false);
      setStudentId('');
      setMeetDate('');
      setTimeLabel('');
      setNotes('');
    },
    onError: () => toast.error('नियोजन अयशस्वी'),
  });

  const complete = useMutation({
    mutationFn: (id: string) =>
      apiCall(`/meetings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'पूर्ण' }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-meetings-full'] });
      toast.success('सभा पूर्ण म्हणून चिन्हांकित केली!');
    },
  });

  const rescheduleMut = useMutation({
    mutationFn: () =>
      apiCall(`/meetings/${rescheduleFor!.id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ date: resDate, timeLabel: resTime, notes: notes || undefined }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-meetings-full'] });
      toast.success('वेळ अद्यतनित');
      setRescheduleFor(null);
    },
    onError: () => toast.error('पुन्हा नियोजन अयशस्वी'),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) =>
      apiCall(`/meetings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'रद्द' }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-meetings-full'] });
      toast.success('सभा रद्द केली');
    },
    onError: () => toast.error('रद्द करणे अयशस्वी'),
  });

  const meetings: any[] = data?.meetings ?? [];
  const meetingId = (m: any) => m.id || m._id;
  const scheduled = meetings.filter((m) => m.status === 'नियोजित');
  const completed = meetings.filter((m) => m.status === 'पूर्ण');

  const stats = [
    { label: 'पूर्णता', value: `${completed.length}/${meetings.length}`, extra: `+${scheduled.length} नियोजित` },
    { label: 'प्रलंबित', value: String(scheduled.length), extra: 'कृती आवश्यक' },
    { label: 'एकूण सभा', value: String(meetings.length), extra: 'या सत्रात' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">पालक-शिक्षक सभा</p>
          <h1 className="text-2xl font-bold">सभा नियोजन व पुन्हा वेळ</h1>
          <p className="text-sm text-muted-foreground">{user?.meta?.class || 'आपला वर्ग'}</p>
        </div>
        <Button type="button" onClick={() => setScheduleOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> नवीन सभा
        </Button>
      </div>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>नवीन सभा</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>व्याप्ती</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as 'student' | 'class')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">एक विद्यार्थी</SelectItem>
                  <SelectItem value="class">संपूर्ण वर्ग</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {scope === 'student' && (
              <div className="space-y-1">
                <Label>विद्यार्थी</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.roll} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label>तारीख</Label>
              <Input type="datetime-local" value={meetDate} onChange={(e) => setMeetDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>वेळ (दाखवण्यासाठी)</Label>
              <Input
                placeholder="उदा. सकाळी १०:०० - १०:३०"
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>प्रकार</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as 'प्रत्यक्ष' | 'ऑनलाइन')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="प्रत्यक्ष">प्रत्यक्ष</SelectItem>
                  <SelectItem value="ऑनलाइन">ऑनलाइन</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>टिपा</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              रद्द
            </Button>
            <Button
              onClick={() => createMut.mutate()}
              disabled={
                createMut.isPending ||
                !meetDate ||
                !timeLabel ||
                (scope === 'student' && !studentId)
              }
            >
              नियोजित करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rescheduleFor} onOpenChange={(o) => !o && setRescheduleFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>सभा पुन्हा वेळ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>नवीन तारीख</Label>
              <Input type="datetime-local" value={resDate} onChange={(e) => setResDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>वेळ लेबल</Label>
              <Input value={resTime} onChange={(e) => setResTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleFor(null)}>
              रद्द
            </Button>
            <Button
              onClick={() => rescheduleMut.mutate()}
              disabled={!resDate || !resTime || rescheduleMut.isPending}
            >
              जतन
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="portal-card divide-y divide-border">
        <div className="p-4">
          <h3 className="font-bold">नियोजित सभा ({scheduled.length})</h3>
        </div>
        {meetings.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">कोणत्याही सभा नाहीत</div>
        )}
        {meetings.map((m: any) => (
          <div key={meetingId(m)} className="p-4 flex flex-wrap items-center gap-3">
            <div className="text-center min-w-[80px]">
              <p className="text-sm font-bold text-primary">{m.timeLabel}</p>
              <p className="text-xs text-muted-foreground">
                {m.date ? new Date(m.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' }) : ''}
              </p>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {m.studentName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-[140px]">
              <p className="font-semibold text-sm">{m.studentName}</p>
              {m.classWide && <p className="text-xs text-muted-foreground">वर्ग सभा · {m.className}</p>}
              <p className="text-xs text-muted-foreground">शिक्षक: {m.teacherName}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                m.mode === 'प्रत्यक्ष' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
              }`}
            >
              {m.mode}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                m.status === 'पूर्ण' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}
            >
              {m.status}
            </span>
            <div className="flex gap-1">
              {m.status === 'नियोजित' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="पूर्ण"
                    onClick={() => complete.mutate(meetingId(m))}
                  >
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="पुन्हा वेळ"
                    onClick={() => {
                      setRescheduleFor({ id: meetingId(m) });
                      setResDate('');
                      setResTime(m.timeLabel || '');
                    }}
                  >
                    <CalendarClock className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="रद्द करा"
                    onClick={() => cancelMut.mutate(meetingId(m))}
                    className="text-destructive"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </>
              )}
              {m.mode === 'ऑनलाइन' && (
                <Button variant="ghost" size="icon" type="button">
                  <Video className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
            <p className="text-xs text-primary mt-1">{s.extra}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
