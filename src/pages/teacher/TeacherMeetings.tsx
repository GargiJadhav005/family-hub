import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Video, MessageSquare, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';

export default function TeacherMeetings() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['teacher-meetings-full'],
    queryFn: () => apiCall('/meetings'),
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

  const meetings: any[] = data?.meetings ?? [];
  const scheduled = meetings.filter((m) => m.status === 'नियोजित');
  const completed = meetings.filter((m) => m.status === 'पूर्ण');

  const stats = [
    { label: 'पूर्णता', value: `${completed.length}/${meetings.length}`, extra: `+${scheduled.length} नियोजित` },
    { label: 'प्रलंबित विनंत्या', value: String(scheduled.length), extra: 'कृती आवश्यक' },
    { label: 'एकूण सभा', value: String(meetings.length), extra: 'या सत्रात' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">📅 पालक-शिक्षक सभा</p>
          <h1 className="text-2xl font-bold">पालक-शिक्षक सभा नियोजन</h1>
          <p className="text-sm text-muted-foreground">
            इयत्ता ४-ब साठीच्या सभांच्या वेळेचे नियोजन करा.
          </p>
        </div>
        <Button onClick={() => toast.info('नवीन सभा जोडण्यासाठी विद्यार्थी नोंदणी पृष्ठावर जा')}>
          <Plus className="w-4 h-4 mr-1" /> नवीन सभा निश्चित करा
        </Button>
      </div>

      {/* Meetings list */}
      <div className="portal-card divide-y divide-border">
        <div className="p-4">
          <h3 className="font-bold">नियोजित सभा ({scheduled.length})</h3>
          <p className="text-xs text-muted-foreground">{scheduled.length} सभा प्रलंबित</p>
        </div>
        {meetings.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">कोणत्याही सभा नाहीत</div>
        )}
        {meetings.map((m: any) => (
          <div key={m._id} className="p-4 flex items-center gap-4">
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
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">विद्यार्थ्याचे नाव</p>
              <p className="font-semibold text-sm">{m.studentName}</p>
              <p className="text-xs text-muted-foreground">शिक्षक: {m.teacherName}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              m.mode === 'प्रत्यक्ष' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
            }`}>{m.mode}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              m.status === 'पूर्ण' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>{m.status}</span>
            <div className="flex gap-1">
              {m.status !== 'पूर्ण' && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="पूर्ण म्हणून चिन्हांकित करा"
                  onClick={() => complete.mutate(m._id)}
                >
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </Button>
              )}
              {m.mode === 'ऑनलाइन' && (
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
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
