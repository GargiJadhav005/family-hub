import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Save, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceStudent {
  id: string;
  name: string;
  roll: string;
  status: string;
}

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState<AttendanceStudent[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        const res = await fetch('/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.students)) {
          const mapped: AttendanceStudent[] = data.students.map((s: any, index: number) => ({
            id: s.id,
            name: s.name,
            roll: s.roll || String(index + 1).padStart(2, '0'),
            status: 'present',
          }));
          setStudents(mapped);
        }
      } catch {
        // ignore
      }
    };
    loadStudents();
  }, []);

  const setStatus = (id: string, status: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const markAll = (status: string) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const stats = {
    present: students.filter((s) => s.status === 'present').length,
    absent: students.filter((s) => s.status === 'absent').length,
    late: students.filter((s) => s.status === 'late').length,
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: today,
          records: students.map((s) => ({
            studentId: s.id,
            status: s.status,
          })),
        }),
      });
      if (!res.ok) {
        toast.error('हजेरी जतन करण्यात अडचण आली');
        return;
      }
      toast.success('हजेरी जतन केली!');
    } catch {
      toast.error('हजेरी जतन करण्यात अडचण आली');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">विद्यार्थी उपस्थिती</h1>
          <p className="text-sm text-muted-foreground">आजची तारीख: {new Date().toLocaleDateString('mr-IN')} • {user?.meta?.class || 'आपला वर्ग'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll('present')}>सर्व हजर</Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> जतन करा
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-success">{stats.present}</div>
          <p className="text-xs text-muted-foreground">उपस्थित</p>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
          <p className="text-xs text-muted-foreground">अनुपस्थित</p>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-warning">{stats.late}</div>
          <p className="text-xs text-muted-foreground">उशिरा</p>
        </div>
      </div>

      {/* Student list */}
      <div className="portal-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">अ.क्र.</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">विद्यार्थ्याचे नाव</th>
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">स्थिती</th>
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">कृती</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 text-sm">{s.roll}</td>
                  <td className="p-3 text-sm font-medium">{s.name}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      s.status === 'present' ? 'bg-success/10 text-success' :
                      s.status === 'absent' ? 'bg-destructive/10 text-destructive' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {s.status === 'present' ? <CheckCircle2 className="w-3 h-3" /> :
                       s.status === 'absent' ? <XCircle className="w-3 h-3" /> :
                       <AlertCircle className="w-3 h-3" />}
                      {s.status === 'present' ? 'उपस्थित' : s.status === 'absent' ? 'अनुपस्थित' : 'उशिरा'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setStatus(s.id, 'present')} className={`w-7 h-7 rounded-full flex items-center justify-center ${s.status === 'present' ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground hover:bg-success/20'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setStatus(s.id, 'absent')} className={`w-7 h-7 rounded-full flex items-center justify-center ${s.status === 'absent' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-muted-foreground hover:bg-destructive/20'}`}>
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setStatus(s.id, 'late')} className={`w-7 h-7 rounded-full flex items-center justify-center ${s.status === 'late' ? 'bg-warning text-warning-foreground' : 'bg-secondary text-muted-foreground hover:bg-warning/20'}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
