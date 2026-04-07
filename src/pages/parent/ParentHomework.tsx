import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  status?: 'pending' | 'in_progress' | 'completed';
  urgent?: boolean;
}

export default function ParentHomework() {
  const { user } = useAuth();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);

  useEffect(() => {
    const loadHomework = async () => {
      try {
        const data = await apiCall('/homework');
        if (Array.isArray(data.homework)) {
          const mapped: HomeworkItem[] = data.homework.map((h: any) => ({
            id: h._id || h.id,
            subject: h.subject,
            title: h.title,
            description: h.description,
            dueDate: h.dueDate ? new Date(h.dueDate).toLocaleDateString('mr-IN') : '',
            status: 'pending',
          }));
          setHomework(mapped);
        }
      } catch {
        // ignore
      }
    };
    if (user) {
      loadHomework();
    }
  }, [user]);

  const pending = homework.filter((h) => h.status !== 'completed').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">घरचा अभ्यास</h1>
          <p className="text-sm text-muted-foreground">{pending} प्रलंबित असाइनमेंट</p>
        </div>
      </div>

      <div className="space-y-3">
        {homework.map((h) => (
          <div key={h.id} className={`portal-card p-4 flex items-start gap-4 ${
            h.urgent && h.status !== 'completed' ? 'border-l-4 border-l-destructive' : ''
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              h.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
            }`}>
              <BookOpen className={`w-5 h-5 ${h.status === 'completed' ? 'text-success' : 'text-primary'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-medium">{h.subject}</span>
                {h.urgent && h.status !== 'completed' && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> तातडीचे
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm mt-1">{h.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> वेळ: {h.dueDate}
              </p>
            </div>
            <Button
              variant={h.status === 'completed' ? 'ghost' : 'outline'}
              size="sm"
              className={h.status === 'completed' ? 'text-success' : ''}
            >
              {h.status === 'completed' ? (
                <><CheckCircle2 className="w-4 h-4 mr-1" /> पूर्ण झाले</>
              ) : h.status === 'in_progress' ? (
                'काम चालू आहे'
              ) : (
                'पूर्ण झाले'
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
