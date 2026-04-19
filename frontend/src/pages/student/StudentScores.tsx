import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';
import { downloadReportCardPdf } from '@/lib/schoolPdf';
import { toast } from 'sonner';

interface ScoreRecord {
  id: string;
  subject: string;
  testName: string;
  scorePercent: number;
  grade: string;
  date: string;
}

export default function StudentScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  const { data: stuData } = useQuery({
    queryKey: ['student-profile-row'],
    queryFn: () => apiCall('/students?limit=5'),
    enabled: !!user,
  });
  const studentId = stuData?.students?.[0]?.id as string | undefined;

  const { data: reportData } = useQuery({
    queryKey: ['student-report-card', studentId],
    queryFn: () => apiCall(`/report-cards/${studentId}`),
    enabled: !!studentId,
  });

  useEffect(() => {
    if (!user) return;

    // No need to pass studentId — backend auto-detects from JWT for student role
    const load = async () => {
      try {
        const data = await apiCall('/scores');
        if (Array.isArray(data.scores)) {
          const mapped: ScoreRecord[] = data.scores.map((s: any) => ({
            id: s.id ?? s._id,
            subject: s.subject,
            testName: s.title ?? s.testName,       // API returns `title` field
            scorePercent: s.score ?? s.scorePercent, // API returns `score` field
            grade: s.grade,
            date: s.date ? new Date(s.date).toLocaleDateString('mr-IN') : '',
          }));
          setScores(mapped);
        }
      } catch (err) {
        console.error('Failed to load scores:', err);
        toast.error('गुण लोड करता आले नाही');
      }
    };

    load();
  }, [user]);


  const subjectScores = useMemo(
    () => {
      const bySubject: Record<string, { subject: string; total: number; count: number }> = {};
      for (const s of scores) {
        if (!bySubject[s.subject]) {
          bySubject[s.subject] = { subject: s.subject, total: 0, count: 0 };
        }
        bySubject[s.subject].total += s.scorePercent;
        bySubject[s.subject].count += 1;
      }
      return Object.values(bySubject).map((v) => ({
        subject: v.subject,
        score: v.total / v.count,
      }));
    },
    [scores]
  );

  const testHistory = scores;

  const handleReportPdf = () => {
    const rc = reportData?.reportCard;
    if (!rc?.subjectGrades?.length) {
      toast.error('प्रगती पुस्तिका उपलब्ध नाही');
      return;
    }
    downloadReportCardPdf({
      academicYear: rc.academicYear || '२०२४-२५',
      term: rc.term || 'वार्षिक',
      overallGrade: rc.overallGrade,
      overallPercent: rc.overallPercent,
      subjectGrades: rc.subjectGrades,
      teacherComment: rc.teacherComment,
      attendanceSummary: rc.attendanceSummary,
      homeworkCompletion: rc.homeworkCompletion,
      studentProfile: (rc.studentProfile || {}) as Record<string, unknown>,
    });
    toast.success('PDF डाउनलोड');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> माझे गुण
          </h1>
          <p className="text-sm text-muted-foreground">विषयनिहाय गुण आणि चाचणी इतिहास</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReportPdf}>
          <Download className="w-4 h-4 mr-1" /> प्रगती PDF
        </Button>
      </div>

      {/* Chart */}
      <div className="portal-card p-5">
        <h3 className="font-bold mb-4">📊 विषयनिहाय सरासरी गुण</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test history */}
      <div className="portal-card p-5">
        <h3 className="font-bold mb-4">📋 चाचणी इतिहास</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">विषय</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">चाचणीचे नाव</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">तारीख</th>
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">गुण</th>
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">श्रेणी</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.map((t) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{t.subject}</span>
                  </td>
                  <td className="p-3 text-sm font-medium">{t.testName}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.date}</td>
                  <td className="p-3 text-center text-sm font-bold">{t.scorePercent}%</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.grade.includes('+') ? 'bg-success/10 text-success' :
                      t.grade === 'A' ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {t.grade}
                    </span>
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
