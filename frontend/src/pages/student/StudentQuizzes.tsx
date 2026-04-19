import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gamepad2, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';

type QuizState = 'select' | 'playing' | 'result';

export default function StudentQuizzes() {
  const [state, setState] = useState<QuizState>('select');
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['student-quizzes-list'],
    queryFn: () => apiCall('/quizzes'),
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: number[] }) =>
      apiCall(`/quizzes/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
    onSuccess: (data) => {
      toast.success(`क्विझ सबमिट केला! गुण: ${data.score}/${data.total}`);
    },
  });

  const quizzes: any[] = quizzesData?.quizzes ?? [];
  const questions: any[] = activeQuiz?.questions ?? [];
  const currentQuestion = questions[currentQ];

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setState('playing');
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);
      if (currentQ + 1 < questions.length) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        setState('result');
        submitMutation.mutate({ id: activeQuiz._id, answers: newAnswers });
      }
    }, 800);
  };

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;

  if (state === 'result') {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-bold">{activeQuiz?.subject} क्विझ पूर्ण!</h1>
          <div className="stat-card inline-block px-8 py-4">
            <p className="text-4xl font-extrabold text-primary">{score}/{questions.length}</p>
            <p className="text-sm text-muted-foreground">बरोबर उत्तरे</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {score === questions.length
              ? '🌟 उत्कृष्ट! सर्व बरोबर!'
              : score >= questions.length / 2
              ? '👍 चांगले! आणखी सराव करा!'
              : '💪 चला, पुन्हा प्रयत्न करा!'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => startQuiz(activeQuiz)}>
              <RotateCcw className="w-4 h-4 mr-1" /> पुन्हा खेळा
            </Button>
            <Button variant="outline" onClick={() => setState('select')}>
              दुसरा क्विझ निवडा
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state === 'playing' && currentQuestion) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{activeQuiz?.subject} क्विझ</h2>
          <span className="text-sm text-muted-foreground">प्रश्न {currentQ + 1}/{questions.length}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="portal-card p-6 space-y-5">
          <h3 className="text-xl font-bold">{currentQuestion.question}</h3>
          <div className="space-y-3">
            {currentQuestion.options.map((opt: string, idx: number) => {
              let borderClass = 'border-border hover:border-primary/50';
              if (selected !== null) {
                if (idx === currentQuestion.correctIndex) borderClass = 'border-success bg-success/10';
                else if (idx === selected) borderClass = 'border-destructive bg-destructive/10';
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${borderClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                    {selected !== null && idx === currentQuestion.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                    )}
                    {selected !== null && idx === selected && idx !== currentQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-destructive ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // Subject selection
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary" /> मजेशीर क्विझ
        </h1>
        <p className="text-sm text-muted-foreground">विषय निवडा आणि क्विझ खेळायला सुरुवात करा!</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="portal-card p-8 text-center text-sm text-muted-foreground">
          अजून कोणताही क्विझ तयार केला नाही. शिक्षक लवकरच क्विझ जोडतील!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((quiz: any) => (
            <motion.button
              key={quiz._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz(quiz)}
              className="portal-card p-6 text-left hover:border-primary/40 transition"
            >
              <div className="text-3xl mb-3">{quiz.icon || '📝'}</div>
              <h3 className="font-bold text-lg">{quiz.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{quiz.subject} • {quiz.questions?.length ?? 0} प्रश्न</p>
              <div className="flex items-center gap-1 text-primary text-sm mt-3 font-medium">
                खेळा <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
