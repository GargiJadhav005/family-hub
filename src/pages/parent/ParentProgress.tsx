import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';

export default function ParentProgress() {
  const { user } = useAuth();

  const { data: scoresData, isLoading: scoresLoading } = useQuery({
    queryKey: ['parent-child-scores'],
    queryFn: () => apiCall('/scores'),
    enabled: !!user,
  });

  const { data: instructionsData } = useQuery({
    queryKey: ['parent-instructions-progress'],
    queryFn: () => apiCall('/instructions'),
    enabled: !!user,
  });

  const scores: any[] = scoresData?.scores ?? [];
  const instructions: any[] = instructionsData?.instructions ?? [];

  // Build monthly performance trend from scores
  const monthlyTrend = (() => {
    const byMonth: Record<string, { total: number; count: number }> = {};
    for (const s of scores) {
      const d = new Date(s.date);
      const key = d.toLocaleDateString('en', { month: 'short' });
      if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
      byMonth[key].total += s.score ?? s.scorePercent ?? 0;
      byMonth[key].count += 1;
    }
    return Object.entries(byMonth).map(([month, v]) => ({
      month,
      score: Math.round(v.total / v.count),
    }));
  })();

  // Recent scores for the list
  const recentGrades = scores.slice(0, 4).map((s: any) => ({
    subject: `${s.subject} — ${s.title ?? s.testName}`,
    grade: `${s.score ?? s.scorePercent ?? 0}%`,
    date: s.date ? new Date(s.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' }) : '',
  }));

  const latestNote = instructions[0] ?? null;

  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const trend =
    scores.length >= 2
      ? Math.round(
          ((lastScore.score ?? 0) - (firstScore.score ?? 0))
        )
      : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">विद्यार्थ्याची प्रगती</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend Graph */}
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            📈 शैक्षणिक प्रगती (मासिक ट्रेंड)
          </h3>

          {scoresLoading ? (
            <div className="flex justify-center h-44 items-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : monthlyTrend.length === 0 ? (
            <div className="flex justify-center h-44 items-center text-sm text-muted-foreground">
              अजून कोणतेही गुण उपलब्ध नाहीत
            </div>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {trend !== null && (
            <div className={`mt-3 text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} गुण {trend >= 0 ? 'वाढ' : 'कमी'} गेल्या चाचण्यांमध्ये
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Teacher Note */}
          {latestNote && (
            <div className="portal-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {latestNote.teacherName?.charAt(0) ?? 'शि'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{latestNote.teacherName}</p>
                  <p className="text-xs text-muted-foreground">
                    वर्ग शिक्षक •{' '}
                    {latestNote.createdAt
                      ? new Date(latestNote.createdAt).toLocaleDateString('mr-IN')
                      : ''}
                  </p>
                </div>
              </div>
              <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-foreground italic leading-relaxed">{latestNote.message}</p>
              </div>
              <button className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline">
                <MessageSquare className="w-3 h-3" /> पाहून घेतले
              </button>
            </div>
          )}

          {/* Recent Grades */}
          <div className="portal-card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">🏆 नुकतेच मिळालेले गुण</h3>
            <div className="space-y-3">
              {recentGrades.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">अजून कोणतेही गुण नाहीत</p>
              ) : (
                recentGrades.map((g, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <div>
                        <p className="text-sm font-medium">{g.subject}</p>
                        <p className="text-xs text-muted-foreground">{g.date}</p>
                      </div>
                    </div>
                    <span className="font-bold">{g.grade}</span>
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