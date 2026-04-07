import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { TrendingUp, AlertTriangle, Star, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';

export default function TeacherAnalytics() {
  const { user } = useAuth();

  const { data: scoresData } = useQuery({
    queryKey: ['analytics-scores'],
    queryFn: () => apiCall('/scores'),
  });

  const scores: any[] = scoresData?.scores ?? [];

  const subjectPerformance = useMemo(() => {
    if (!scores.length) return [];
    const bySubject: Record<string, { subject: string; total: number; count: number }> = {};
    for (const s of scores) {
      const pct = s.score ?? s.scorePercent ?? 0;
      if (!bySubject[s.subject]) bySubject[s.subject] = { subject: s.subject, total: 0, count: 0 };
      bySubject[s.subject].total += pct;
      bySubject[s.subject].count += 1;
    }
    return Object.values(bySubject).map(v => ({ subject: v.subject, avg: Math.round(v.total / v.count) }));
  }, [scores]);

  const radarData = useMemo(() => [
    { area: 'गणित', value: subjectPerformance.find(s => s.subject === 'गणित')?.avg ?? 75 },
    { area: 'मराठी', value: subjectPerformance.find(s => s.subject === 'मराठी')?.avg ?? 85 },
    { area: 'इंग्रजी', value: subjectPerformance.find(s => s.subject === 'इंग्रजी')?.avg ?? 70 },
    { area: 'विज्ञान', value: subjectPerformance.find(s => s.subject === 'विज्ञान')?.avg ?? 80 },
    { area: 'परिसर', value: subjectPerformance.find(s => s.subject === 'परिसर अभ्यास')?.avg ?? 88 },
    { area: 'सर्जनशीलता', value: 90 },
  ], [subjectPerformance]);

  const weakAreas = useMemo(() => [
    { subject: 'इंग्रजी', topic: 'Tenses (काळ)', students: 8, severity: 'high' as const },
    { subject: 'गणित', topic: 'शब्द समस्या', students: 6, severity: 'medium' as const },
    ...subjectPerformance.filter(s => s.avg < 75).map(s => ({ subject: s.subject, topic: 'पुनरावृत्ती आवश्यक', students: 10, severity: 'high' as const })),
  ], [subjectPerformance]);

  const strongAreas = useMemo(() => [
    { subject: 'मराठी', topic: 'कविता वाचन', percentage: '९५%' },
    { subject: 'परिसर अभ्यास', topic: 'पर्यावरण जागृती', percentage: '९२%' },
    ...subjectPerformance.filter(s => s.avg >= 85).map(s => ({ subject: s.subject, topic: 'उत्कृष्ट कामगिरी', percentage: `${s.avg}%` })),
  ], [subjectPerformance]);

  const revisionTopics = [
    { subject: 'इंग्रजी', topic: 'Grammar Practice', reason: 'काळ (Tenses) मध्ये गुण कमी' },
    { subject: 'गणित', topic: 'शब्द समस्या सराव', reason: 'विद्यार्थ्यांना अडचण' },
    { subject: 'गणित', topic: 'अपूर्णांक', reason: 'मूलभूत संकल्पना स्पष्ट करणे' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">📊 वर्ग विश्लेषण</h1>
        <p className="text-sm text-muted-foreground">{user?.meta?.class || 'इयत्ता १-ब'} • शैक्षणिक वर्ष २०२४-२५</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4">📈 विषयनिहाय सरासरी कामगिरी</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="portal-card p-5">
          <h3 className="font-bold mb-4">🎯 क्षमता रडार</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> कमकुवत क्षेत्रे
          </h3>
          <div className="space-y-3">
            {weakAreas.map((w, i) => (
              <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary font-medium">{w.subject}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${w.severity === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                    {w.severity === 'high' ? 'गंभीर' : 'मध्यम'}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">{w.topic}</p>
                <p className="text-xs text-muted-foreground">{w.students} विद्यार्थ्यांना अडचण</p>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" /> सशक्त क्षेत्रे
          </h3>
          <div className="space-y-3">
            {strongAreas.map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-success/5 border border-success/10">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary font-medium">{s.subject}</span>
                <p className="text-sm font-medium mt-1">{s.topic}</p>
                <p className="text-xs text-success font-medium">{s.percentage} विद्यार्थी उत्तीर्ण</p>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> पुनरावृत्ती आवश्यक
          </h3>
          <div className="space-y-3">
            {revisionTopics.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary font-medium">{r.subject}</span>
                <p className="text-sm font-medium mt-1">{r.topic}</p>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}