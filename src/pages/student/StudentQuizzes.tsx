import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gamepad2, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  subject: string;
}

const quizzes: Record<string, Question[]> = {
  'गणित': [
    { question: '२५ + ३७ = ?', options: ['52', '62', '72', '42'], correct: 1, subject: 'गणित' },
    { question: '१२ × ५ = ?', options: ['50', '55', '60', '65'], correct: 2, subject: 'गणित' },
    { question: '१०० - ४६ = ?', options: ['54', '64', '44', '56'], correct: 0, subject: 'गणित' },
    { question: '८ × ७ = ?', options: ['54', '56', '48', '64'], correct: 1, subject: 'गणित' },
    { question: '१/२ + १/४ = ?', options: ['१/६', '२/६', '३/४', '२/४'], correct: 2, subject: 'गणित' },
  ],
  'विज्ञान': [
    { question: 'वनस्पती अन्न कशापासून बनवतात?', options: ['पाणी', 'सूर्यप्रकाश', 'माती', 'सूर्यप्रकाश आणि पाणी'], correct: 3, subject: 'विज्ञान' },
    { question: 'पाण्याचे तीन रूपे कोणती?', options: ['घन, द्रव, वायू', 'गरम, थंड, कोमट', 'पाणी, बर्फ, वाफ', 'दोन्ही अ आणि क'], correct: 3, subject: 'विज्ञान' },
    { question: 'पृथ्वी सूर्याभोवती एक फेरी किती दिवसांत पूर्ण करते?', options: ['३०', '३६५', '२८', '७'], correct: 1, subject: 'विज्ञान' },
  ],
  'मराठी': [
    { question: '"सूर्य" या शब्दाचे विरुद्धार्थी शब्द कोणता?', options: ['चंद्र', 'तारा', 'ढग', 'वारा'], correct: 0, subject: 'मराठी' },
    { question: '"मोठा" या शब्दाचे विरुद्धार्थी शब्द कोणता?', options: ['लहान', 'उंच', 'जाड', 'रुंद'], correct: 0, subject: 'मराठी' },
    { question: 'खालीलपैकी कोणता शब्द नाम आहे?', options: ['सुंदर', 'धावणे', 'पुस्तक', 'हळू'], correct: 2, subject: 'मराठी' },
  ],
  'इंग्रजी': [
    { question: 'What is the plural of "child"?', options: ['Childs', 'Children', 'Childrens', 'Childes'], correct: 1, subject: 'इंग्रजी' },
    { question: 'Choose the correct sentence:', options: ['He go to school.', 'He goes to school.', 'He going to school.', 'He goed to school.'], correct: 1, subject: 'इंग्रजी' },
    { question: '"Happy" means:', options: ['दुःखी', 'आनंदी', 'रागीट', 'थकलेला'], correct: 1, subject: 'इंग्रजी' },
  ],
};

type QuizState = 'select' | 'playing' | 'result';

export default function StudentQuizzes() {
  const [state, setState] = useState<QuizState>('select');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = quizzes[selectedSubject] || [];
  const currentQuestion = questions[currentQ];

  const startQuiz = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setState('playing');
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      setAnswers([...answers, idx]);
      if (currentQ + 1 < questions.length) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        setState('result');
      }
    }, 800);
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;

  if (state === 'result') {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-bold">{selectedSubject} क्विझ पूर्ण!</h1>
          <div className="stat-card inline-block px-8 py-4">
            <p className="text-4xl font-extrabold text-primary">{score}/{questions.length}</p>
            <p className="text-sm text-muted-foreground">बरोबर उत्तरे</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {score === questions.length ? '🌟 उत्कृष्ट! सर्व बरोबर!' :
             score >= questions.length / 2 ? '👍 चांगले! आणखी सराव करा!' :
             '💪 चला, पुन्हा प्रयत्न करा!'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => startQuiz(selectedSubject)}>
              <RotateCcw className="w-4 h-4 mr-1" /> पुन्हा खेळा
            </Button>
            <Button variant="outline" onClick={() => setState('select')}>
              दुसरा विषय निवडा
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
          <h2 className="font-bold text-lg">{selectedSubject} क्विझ</h2>
          <span className="text-sm text-muted-foreground">प्रश्न {currentQ + 1}/{questions.length}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="portal-card p-6 space-y-5">
          <h3 className="text-xl font-bold">{currentQuestion.question}</h3>
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              let borderClass = 'border-border hover:border-primary/50';
              if (selected !== null) {
                if (idx === currentQuestion.correct) borderClass = 'border-success bg-success/10';
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
                    {selected !== null && idx === currentQuestion.correct && <CheckCircle2 className="w-5 h-5 text-success ml-auto" />}
                    {selected !== null && idx === selected && idx !== currentQuestion.correct && <XCircle className="w-5 h-5 text-destructive ml-auto" />}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(quizzes).map((subject) => (
          <motion.button
            key={subject}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startQuiz(subject)}
            className="portal-card p-6 text-left hover:border-primary/40 transition"
          >
            <div className="text-3xl mb-3">
              {subject === 'गणित' ? '📐' : subject === 'विज्ञान' ? '🔬' : subject === 'मराठी' ? '📖' : '🔤'}
            </div>
            <h3 className="font-bold text-lg">{subject}</h3>
            <p className="text-xs text-muted-foreground mt-1">{quizzes[subject].length} प्रश्न</p>
            <div className="flex items-center gap-1 text-primary text-sm mt-3 font-medium">
              खेळा <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
