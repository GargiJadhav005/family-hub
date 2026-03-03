import { Calendar, Video, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const meetings = [
  { id: 1, time: '०२:३०', period: 'दुपारी', student: 'लिओ थॉमसन', parent: 'सारा थॉमसन', type: 'प्रत्यक्ष भेट', color: 'bg-success/10 text-success' },
  { id: 2, time: '०३:००', period: 'दुपारी', student: 'माया चेन', parent: 'डॉ. आणि सौ. चेन', type: 'ऑनलाइन', color: 'bg-primary/10 text-primary' },
  { id: 3, time: '०३:३०', period: 'दुपारी', student: 'डेव्हिड मिलर', parent: 'रॉबर्ट मिलर', type: 'प्रत्यक्ष भेट', color: 'bg-success/10 text-success' },
];

const stats = [
  { label: 'पूर्णता', value: '१८/२४', extra: '+२ आज' },
  { label: 'प्रलंबित विनंत्या', value: '३', extra: 'कृती आवश्यक' },
  { label: 'सरासरी वेळ', value: '२२ मि.', extra: 'प्रमाण: २०-२५ मि.' },
];

export default function TeacherMeetings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">📅 पालक-शिक्षक सभा</p>
          <h1 className="text-2xl font-bold">पालक-शिक्षक सभा नियोजन</h1>
          <p className="text-sm text-muted-foreground">
            इयत्ता २ री (तुकडी ब) साठीच्या सभांच्या वेळेचे नियोजन करा.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1" /> नवीन सभा निश्चित करा
        </Button>
      </div>

      {/* Meetings list */}
      <div className="portal-card divide-y divide-border">
        <div className="p-4">
          <h3 className="font-bold">गुरुवार, ५ ऑक्टोबर</h3>
          <p className="text-xs text-muted-foreground">आज ४ सभा नियोजित आहेत</p>
        </div>
        {meetings.map((m) => (
          <div key={m.id} className="p-4 flex items-center gap-4">
            <div className="text-center min-w-[60px]">
              <p className="text-lg font-bold">{m.time}</p>
              <p className="text-xs text-muted-foreground">{m.period}</p>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{m.student.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">विद्यार्थ्याचे नाव</p>
              <p className="font-semibold text-sm">{m.student}</p>
              <p className="text-xs text-muted-foreground">पालकाचे नाव: {m.parent}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${m.color}`}>{m.type}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><MessageSquare className="w-4 h-4" /></Button>
              {m.type === 'ऑनलाइन' && <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>}
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
