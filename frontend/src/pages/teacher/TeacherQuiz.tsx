import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronDown, ChevronUp, BarChart3, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type QuestionDraft = {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
};

const ICON_OPTIONS = ['📝', '🔢', '🌍', '🧪', '📚', '🎨', '🏃', '💻'];

export default function TeacherQuiz() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const teacherClass = user?.meta?.class || '';

  const [createOpen, setCreateOpen] = useState(false);
  const [resultsQuizId, setResultsQuizId] = useState<string | null>(null);

  // Create form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [icon, setIcon] = useState('📝');
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { question: '', options: ['', '', '', ''], correctIndex: 0 },
  ]);

  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['teacher-quizzes'],
    queryFn: () => apiCall('/quizzes'),
  });

  const { data: resultsData } = useQuery({
    queryKey: ['quiz-results', resultsQuizId],
    queryFn: () => apiCall(`/quizzes/${resultsQuizId}/results`),
    enabled: !!resultsQuizId,
  });

  const quizzes: any[] = quizzesData?.quizzes ?? [];
  const results: any[] = resultsData?.results ?? [];

  const createMut = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('कृपया प्रश्नपत्र शीर्षक भरा');
      if (!subject.trim()) throw new Error('कृपया विषय निवडा');
      if (!questions.length) throw new Error('कृपया कमीत कमी एक प्रश्न जोडा');
      return apiCall('/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title,
          subject,
          icon,
          className: teacherClass,
          questions: questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          })),
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-quizzes'] });
      toast.success('क्विझ तयार केला!');
      setCreateOpen(false);
      setTitle('');
      setSubject('');
      setIcon('📝');
      setQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0 }]);
    },
    onError: () => toast.error('क्विझ तयार करणे अयशस्वी'),
  });

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: '', options: ['', '', '', ''], correctIndex: 0 },
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: 'question' | 'correctIndex', value: string | number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );
  };

  const isValid =
    title.trim() &&
    subject.trim() &&
    questions.every(
      (q) =>
        q.question.trim() &&
        q.options.every((o) => o.trim()) &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
    );

  const resultsQuiz = quizzes.find((q) => q._id === resultsQuizId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">क्विझ व्यवस्थापन</h1>
          <p className="text-sm text-muted-foreground">{teacherClass || 'आपला वर्ग'}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> नवीन क्विझ
        </Button>
      </div>

      {/* Create Quiz Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>नवीन क्विझ तयार करा</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>शीर्षक *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="उदा. गणित क्विझ १" />
              </div>
              <div className="space-y-1">
                <Label>विषय *</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="उदा. गणित" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>चिन्ह</Label>
              <div className="flex gap-2 flex-wrap">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`text-xl p-2 rounded-lg border-2 transition ${
                      icon === ic ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">प्रश्न ({questions.length})</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="w-3 h-3 mr-1" /> प्रश्न जोडा
                </Button>
              </div>

              {questions.map((q, qi) => (
                <div key={qi} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <Label className="text-sm text-muted-foreground shrink-0">
                      प्रश्न {qi + 1}
                    </Label>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive shrink-0"
                        onClick={() => removeQuestion(qi)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                    placeholder="प्रश्न लिहा..."
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            q.correctIndex === oi
                              ? 'bg-success text-white'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <Input
                          className="h-8 text-sm"
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          placeholder={`पर्याय ${String.fromCharCode(65 + oi)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">बरोबर उत्तर</Label>
                    <Select
                      value={String(q.correctIndex)}
                      onValueChange={(v) => updateQuestion(qi, 'correctIndex', Number(v))}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3].map((i) => (
                          <SelectItem key={i} value={String(i)}>
                            {String.fromCharCode(65 + i)}: {q.options[i] || `पर्याय ${String.fromCharCode(65 + i)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              रद्द
            </Button>
            <Button
              onClick={() => createMut.mutate()}
              disabled={!isValid || createMut.isPending}
            >
              {createMut.isPending ? 'तयार होत आहे…' : 'क्विझ प्रकाशित करा'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={!!resultsQuizId} onOpenChange={(o) => !o && setResultsQuizId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <BarChart3 className="w-4 h-4 inline mr-2" />
              {resultsQuiz?.title} — निकाल
            </DialogTitle>
          </DialogHeader>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              अद्याप कोणत्याही विद्यार्थ्याने क्विझ दिला नाही.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">विद्यार्थी</th>
                  <th className="text-left p-2">अ.क्र.</th>
                  <th className="text-center p-2">गुण</th>
                  <th className="text-center p-2">%</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any) => {
                  const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
                  return (
                    <tr key={r._id} className="border-b border-border/50">
                      <td className="p-2 font-medium">
                        {r.studentId?.name || '—'}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {r.studentId?.roll || '—'}
                      </td>
                      <td className="p-2 text-center font-bold">
                        {r.score}/{r.total}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            pct >= 80
                              ? 'bg-success/10 text-success'
                              : pct >= 50
                              ? 'bg-warning/10 text-warning'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultsQuizId(null)}>
              बंद करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz List */}
      {isLoading && (
        <div className="portal-card p-8 text-center text-muted-foreground">
          लोड होत आहे…
        </div>
      )}
      {!isLoading && quizzes.length === 0 && (
        <div className="portal-card p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">अद्याप कोणतेही क्विझ तयार केले नाहीत.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> पहिला क्विझ तयार करा
          </Button>
        </div>
      )}
      {!isLoading && quizzes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz: any) => (
            <div key={quiz._id} className="portal-card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{quiz.icon || '📝'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{quiz.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {quiz.subject} · {quiz.questions?.length ?? 0} प्रश्न
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setResultsQuizId(quiz._id)}
                >
                  <BarChart3 className="w-3 h-3 mr-1" /> निकाल पहा
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
