import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Login() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as UserRole) || 'teacher';
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password, role);
    setLoading(false);
    if (success) {
      toast.success('यशस्वीरित्या लॉगिन झाले!');
      navigate(role === 'teacher' ? '/teacher' : '/parent');
    } else {
      toast.error('चुकीचा ईमेल किंवा पासवर्ड');
    }
  };

  const demoCredentials = role === 'teacher'
    ? { email: 'teacher@school.edu', password: 'teacher123' }
    : { email: 'parent@school.edu', password: 'parent123' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--hero-gradient)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">वैनतेय प्राथमिक विद्या मंदिर</span>
          </Link>
          <p className="text-muted-foreground text-sm">शालेय पोर्टलमध्ये लॉगिन करा</p>
        </div>

        <div className="portal-card p-6 md:p-8">
          {/* Role toggle */}
          <div className="flex rounded-lg bg-secondary p-1 mb-6">
            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                role === 'teacher' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4" /> शिक्षक
            </button>
            <button
              onClick={() => setRole('parent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                role === 'parent' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" /> पालक
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>ईमेल</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="तुमचा ईमेल टाका"
                required
              />
            </div>
            <div>
              <Label>पासवर्ड</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड टाका"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'लॉगिन होत आहे...' : 'लॉगिन करा'}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-accent/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">डेमो क्रेडेन्शियल्स ({role === 'teacher' ? 'शिक्षक' : 'पालक'}):</p>
            <p className="text-xs text-muted-foreground">ईमेल: <span className="font-mono text-foreground">{demoCredentials.email}</span></p>
            <p className="text-xs text-muted-foreground">पासवर्ड: <span className="font-mono text-foreground">{demoCredentials.password}</span></p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => {
                setEmail(demoCredentials.email);
                setPassword(demoCredentials.password);
              }}
            >
              डेमो क्रेडेन्शियल्स भरा
            </Button>
          </div>
        </div>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">← मुख्यपृष्ठावर परत जा</Link>
        </p>
      </motion.div>
    </div>
  );
}
