import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Gamepad2, BarChart3, BookOpen, Star, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: scoresData } = useQuery({
    queryKey: ['student-scores'],
    queryFn: () => apiCall('/scores'),
    enabled: !!user,
  });

  const { data: homeworkData } = useQuery({
    queryKey: ['student-homework'],
    queryFn: () => apiCall('/homework'),
    enabled: !!user,
  });

  const { data: quizzesData } = useQuery({
    queryKey: ['student-quizzes'],
    queryFn: () => apiCall('/quizzes'),
    enabled: !!user,
  });

  const scores = scoresData?.scores ?? [];
  const homework = homeworkData?.homework ?? [];
  const quizzes = quizzesData?.quizzes ?? [];
  const pendingHomework = homework.filter((h: any) => !h.completed);

  const avgScore = scores.length
    ? Math.round(scores.reduce((sum: number, s: any) => sum + (s.score / s.total) * 100, 0) / scores.length)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {user?.name?.charAt(0) || 'वि'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">नमस्कार, {user?.name || 'विद्यार्थी'}! 👋</h1>
          <p className="text-sm text-muted-foreground">{user?.meta?.class} • अनुक्रमांक: {user?.meta?.roll}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-2xl font-extrabold">{quizzes.length}</p>
          <p className="text-xs text-muted-foreground">उपलब्ध क्विझ</p>
        </div>
        <div className="stat-card text-center">
          <Star className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-extrabold">{avgScore ? `${avgScore}%` : '—'}</p>
          <p className="text-xs text-muted-foreground">सरासरी गुण</p>
        </div>
        <div className="stat-card text-center">
          <Gamepad2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-2xl font-extrabold">{scores.length}</p>
          <p className="text-xs text-muted-foreground">पूर्ण केलेल्या परीक्षा</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent scores */}
        <div className="portal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> नुकतेच मिळालेले गुण</h3>
            <Link to="/student/scores">
              <Button variant="ghost" size="sm" className="text-xs">सर्व पहा</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {scores.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">अजून कोणतेही गुण नाहीत</p>
            ) : (
              scores.slice(0, 4).map((s: any) => (
                <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{s.icon || '📝'}</span>
                    <div>
                      <p className="text-sm font-medium">{s.subject}</p>
                      <p className="text-xs text-muted-foreground">{s.title}</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">
                    {Math.round((s.score / s.total) * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending homework */}
        <div className="portal-card p-5">
          <h3 className="font-bold flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4" /> प्रलंबित गृहपाठ</h3>
          <div className="space-y-3">
            {pendingHomework.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">कोणताही गृहपाठ नाही! 🎉</p>
            ) : (
              pendingHomework.slice(0, 3).map((h: any) => (
                <div key={h._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{h.subject}</span>
                    <p className="text-sm font-medium mt-1">{h.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">मुदत: {h.dueDate ? new Date(h.dueDate).toLocaleDateString('mr-IN') : '—'}</span>
                </div>
              ))
            )}
          </div>
          <Link to="/student/quizzes">
            <Button className="w-full mt-4">
              <Gamepad2 className="w-4 h-4 mr-2" /> क्विझ खेळा!
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
