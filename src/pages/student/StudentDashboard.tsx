import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Gamepad2, BarChart3, BookOpen, Star, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const recentScores = [
  { subject: 'गणित', score: '८५%', test: 'घटक चाचणी ३', icon: '📐' },
  { subject: 'मराठी', score: '९२%', test: 'साप्ताहिक चाचणी', icon: '📖' },
  { subject: 'विज्ञान', score: '७८%', test: 'प्रकल्प मूल्यांकन', icon: '🔬' },
];

const homework = [
  { subject: 'गणित', title: 'अपूर्णांक वर्कशीट', due: 'उद्या' },
  { subject: 'मराठी', title: 'निबंध लेखन', due: 'शुक्रवार' },
];

export default function StudentDashboard() {
  const { user } = useAuth();

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
          <p className="text-2xl font-extrabold">१२</p>
          <p className="text-xs text-muted-foreground">एकूण पदके</p>
        </div>
        <div className="stat-card text-center">
          <Star className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-extrabold">८५%</p>
          <p className="text-xs text-muted-foreground">सरासरी गुण</p>
        </div>
        <div className="stat-card text-center">
          <Gamepad2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-2xl font-extrabold">८</p>
          <p className="text-xs text-muted-foreground">पूर्ण केलेल्या क्विझ</p>
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
            {recentScores.map((s) => (
              <div key={s.subject} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.test}</p>
                  </div>
                </div>
                <span className="font-bold text-primary">{s.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending homework */}
        <div className="portal-card p-5">
          <h3 className="font-bold flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4" /> प्रलंबित गृहपाठ</h3>
          <div className="space-y-3">
            {homework.map((h) => (
              <div key={h.title} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{h.subject}</span>
                  <p className="text-sm font-medium mt-1">{h.title}</p>
                </div>
                <span className="text-xs text-muted-foreground">मुदत: {h.due}</span>
              </div>
            ))}
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
