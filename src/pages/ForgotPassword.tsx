import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const resetMut = useMutation({
    mutationFn: async () => {
      return apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ name, email, dob, newPassword }),
      });
    },
    onSuccess: () => {
      toast.success('पासवर्ड यशस्वीरित्या बदलला (Password updated)');
      navigate('/login');
    },
    onError: (err: any) => {
      toast.error(err.message || 'माहिती जुळत नाही (Details do not match)');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !newPassword) {
      toast.error('कृपया सर्व आवश्यक माहिती भरा');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('पासवर्ड किमान ४ अक्षरांचा असावा');
      return;
    }
    resetMut.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild>
          <Link to="/login">
            <ArrowLeft className="w-4 h-4 mr-2" /> मागील पृष्ठावर
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md p-8 rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">पासवर्ड विसरलात?</h1>
          <p className="text-sm text-muted-foreground">आपले नाव, ईमेल आणि नवीन पासवर्ड प्रविष्ट करा.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>पूर्ण नाव (Full Name)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. गार्गी जाधव"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>ईमेल (Email)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>जन्मतारीख (DOB) - पर्यायी</Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>नवीन पासवर्ड (New Password)</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="नवा पासवर्ड"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={resetMut.isPending}
          >
            {resetMut.isPending ? 'बदलत आहे...' : 'पासवर्ड बदला'}
          </Button>
        </form>
      </div>
    </div>
  );
}
