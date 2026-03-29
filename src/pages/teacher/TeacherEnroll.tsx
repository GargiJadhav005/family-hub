import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TeacherEnroll() {
  const { enrolledStudents, enrollStudent } = useAuth();
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [className, setClassName] = useState('');
  const [lastEnrolled, setLastEnrolled] = useState<{
    name: string;
    studentEmail: string;
    studentPassword: string;
    parentEmail: string;
    parentPassword: string;
  } | null>(null);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !parentName || !className) {
      toast.error('कृपया सर्व माहिती भरा');
      return;
    }
    try {
      const result = await enrollStudent(name, parentName, className);
      setLastEnrolled(result);
      setName('');
      setParentName('');
      setClassName('');
      toast.success(`${result.name} यशस्वीरित्या नोंदणी झाली!`);
    } catch {
      toast.error('नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('कॉपी झाले!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" /> नवीन विद्यार्थी नोंदणी
        </h1>
        <p className="text-sm text-muted-foreground">विद्यार्थ्याची माहिती भरा. लॉगिन तपशील स्वयंचलितपणे तयार होतील.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Form */}
        <div className="portal-card p-6">
          <h3 className="font-bold mb-4">📝 नोंदणी फॉर्म</h3>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="space-y-2">
              <Label>विद्यार्थ्याचे पूर्ण नाव</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="उदा. आरव पाटील" required />
            </div>
            <div className="space-y-2">
              <Label>पालकाचे नाव</Label>
              <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="उदा. सौ. पाटील" required />
            </div>
            <div className="space-y-2">
              <Label>इयत्ता</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue placeholder="इयत्ता निवडा" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="इयत्ता १-अ">इयत्ता १-अ</SelectItem>
                  <SelectItem value="इयत्ता १-ब">इयत्ता १-ब</SelectItem>
                  <SelectItem value="इयत्ता २-अ">इयत्ता २-अ</SelectItem>
                  <SelectItem value="इयत्ता २-ब">इयत्ता २-ब</SelectItem>
                  <SelectItem value="इयत्ता ३-अ">इयत्ता ३-अ</SelectItem>
                  <SelectItem value="इयत्ता ३-ब">इयत्ता ३-ब</SelectItem>
                  <SelectItem value="इयत्ता ४-अ">इयत्ता ४-अ</SelectItem>
                  <SelectItem value="इयत्ता ४-ब">इयत्ता ४-ब</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              <UserPlus className="w-4 h-4 mr-2" /> विद्यार्थी नोंदणी करा
            </Button>
          </form>
        </div>

        {/* Generated Credentials */}
        {lastEnrolled && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="portal-card p-6 border-success/30">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" /> नोंदणी यशस्वी!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              खालील लॉगिन तपशील विद्यार्थी आणि पालकांना द्या:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">📚 विद्यार्थी लॉगिन</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">ईमेल: <span className="font-mono font-medium">{lastEnrolled.studentEmail}</span></p>
                    <p className="text-sm">पासवर्ड: <span className="font-mono font-medium">{lastEnrolled.studentPassword}</span></p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`Email: ${lastEnrolled.studentEmail}\nPassword: ${lastEnrolled.studentPassword}`)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">👨‍👩‍👧 पालक लॉगिन</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">ईमेल: <span className="font-mono font-medium">{lastEnrolled.parentEmail}</span></p>
                    <p className="text-sm">पासवर्ड: <span className="font-mono font-medium">{lastEnrolled.parentPassword}</span></p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`Email: ${lastEnrolled.parentEmail}\nPassword: ${lastEnrolled.parentPassword}`)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enrolled Students List */}
      <div className="portal-card p-5">
        <h3 className="font-bold mb-4">📋 नोंदणीकृत विद्यार्थी ({enrolledStudents.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">अ.क्र.</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">विद्यार्थ्याचे नाव</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">इयत्ता</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">पालकाचे नाव</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">विद्यार्थी ईमेल</th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.map((s, i) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="p-3 text-sm">{i + 1}</td>
                  <td className="p-3 text-sm font-medium">{s.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{s.class}</td>
                  <td className="p-3 text-sm text-muted-foreground">{s.parentName}</td>
                  <td className="p-3 text-sm font-mono text-muted-foreground">{s.studentEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
