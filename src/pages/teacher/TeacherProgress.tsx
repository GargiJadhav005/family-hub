import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Eye } from 'lucide-react';
import { apiCall } from '@/lib/api';

export default function TeacherProgress() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { data: studentsData } = useQuery({
    queryKey: ['progress-students'],
    queryFn: () => apiCall('/students'),
  });

  const students: any[] = studentsData?.students ?? [];
  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0] ?? null;

  const { data: scoresData } = useQuery({
    queryKey: ['progress-scores', selectedStudent?.id],
    queryFn: () => apiCall(`/scores?studentId=${selectedStudent?.id}`),
    enabled: !!selectedStudent?.id,
  });

  const scores: any[] = scoresData?.scores ?? [];

  // Derive subject summaries from scores
  const subjectSummary: Record<string, { grade: string; score: number }> = {};
  for (const s of scores) {
    if (!subjectSummary[s.subject]) {
      const pct = s.score ?? s.scorePercent ?? 0;
      const grade =
        pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'A-' : pct >= 60 ? 'B+' : 'B';
      subjectSummary[s.subject] = { grade, score: pct };
    }
  }

  const subjects = Object.entries(subjectSummary).map(([name, v]) => ({
    name,
    grade: v.grade,
    effort: v.score >= 85 ? 'उत्कृष्ट' : v.score >= 70 ? 'चांगले' : 'सुधारणा आवश्यक',
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">प्रगती पुस्तक निर्मिती</h1>
          <p className="text-sm text-muted-foreground">शैक्षणिक वर्ष २०२४-२५</p>
        </div>
        <Button size="sm"><Eye className="w-4 h-4 mr-1" /> पूर्वदृश्य</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student list */}
        <div className="portal-card p-5">
          <h3 className="font-bold mb-3">विद्यार्थी निवडा</h3>
          <div className="space-y-2">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  (selectedStudentId ?? students[0]?.id) === s.id
                    ? 'bg-primary/5 border border-primary/20'
                    : 'hover:bg-secondary'
                }`}
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {s.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">अनु. क्र. {s.roll}</p>
                </div>
                {(selectedStudentId ?? students[0]?.id) === s.id && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
            {students.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">विद्यार्थी नाहीत. प्रथम नोंदणी करा.</p>
            )}
          </div>
        </div>

        {/* Academic progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="portal-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">📚 शैक्षणिक प्रगती — {selectedStudent?.name ?? '—'}</h3>
              <Button variant="outline" size="sm">मसुदा</Button>
            </div>
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">या विद्यार्थ्यासाठी गुण उपलब्ध नाहीत.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">विषय</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">श्रेणी</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">प्रयत्न</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">शिक्षकांचा अभिप्राय</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => (
                      <tr key={s.name} className="border-b border-border/50">
                        <td className="p-3 text-sm font-medium">{s.name}</td>
                        <td className="p-3">
                          <Select defaultValue={s.grade}>
                            <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C'].map((g) => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Select defaultValue={s.effort}>
                            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['उत्कृष्ट', 'चांगले', 'सुधारणा आवश्यक'].map((e) => (
                                <SelectItem key={e} value={e}>{e}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="टिप लिहा..."
                            className="w-full text-sm bg-transparent border-b border-border/50 focus:border-primary outline-none py-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="portal-card p-5">
            <h3 className="font-bold mb-3">📍 एकूण शिक्षक अभिप्राय</h3>
            <Textarea rows={4} placeholder="या सत्रातील विद्यार्थ्याच्या प्रगतीबद्दल सविस्तर अभिप्राय प्रविष्ट करा..." />
            <Button className="mt-3">अभिप्राय जतन करा</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
