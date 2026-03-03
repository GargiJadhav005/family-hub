import { TrendingUp, Star, BookOpen, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const subjects = [
  { name: 'मराठी', grade: 'A', progress: 92 },
  { name: 'गणित', grade: 'A-', progress: 85 },
  { name: 'इंग्रजी', grade: 'B+', progress: 78 },
  { name: 'विज्ञान', grade: 'A', progress: 90 },
  { name: 'परिसर अभ्यास', grade: 'A-', progress: 88 },
];

const recentGrades = [
  { subject: 'विज्ञान चाचणी', grade: '९८%', date: 'जानेवारी' },
  { subject: 'गणित घटक चाचणी', grade: '८५%', date: 'गुरुवार' },
];

const teacherNote = {
  teacher: 'कु. भोरत मॅडम',
  role: 'वर्ग शिक्षिका • आज',
  message: '"आरवने आज विज्ञानाच्या प्रयोगात खूप छान सादरीकरण केले. त्याने वर्गातील चर्चेत उत्साहाने सहभाग घेतला. कृपया त्याला घरी शुद्धलेखनाचा सराव करण्यास सांगावे."',
};

export default function ParentProgress() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">विद्यार्थ्याची प्रगती</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise performance */}
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">📊 विषयनिहाय प्रगती</h3>
          <div className="space-y-4">
            {subjects.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">{s.grade}</span>
                    <span className="text-xs text-muted-foreground">{s.progress}%</span>
                  </div>
                </div>
                <Progress value={s.progress} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Teacher note */}
        <div className="space-y-4">
          <div className="portal-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">कु</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{teacherNote.teacher}</p>
                <p className="text-xs text-muted-foreground">{teacherNote.role}</p>
              </div>
            </div>
            <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-sm text-foreground italic leading-relaxed">{teacherNote.message}</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline">
              <MessageSquare className="w-3 h-3" /> पाहून घेतले व उत्तर द्या
            </button>
          </div>

          <div className="portal-card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">🏆 नुकतेच मिळालेले गुण</h3>
            <div className="space-y-3">
              {recentGrades.map((g) => (
                <div key={g.subject} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div>
                      <p className="text-sm font-medium">{g.subject}</p>
                      <p className="text-xs text-muted-foreground">{g.date}</p>
                    </div>
                  </div>
                  <span className="font-bold">{g.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
