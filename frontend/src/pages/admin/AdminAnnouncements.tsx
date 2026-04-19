import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';

type AudienceOpt = 'all' | 'teachers' | 'students' | 'parents';
type PriorityOpt = 'low' | 'medium' | 'high';

export default function AdminAnnouncements() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<AudienceOpt>('all');
  const [priority, setPriority] = useState<PriorityOpt>('medium');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => apiCall('/admin/announcements'),
  });

  const announcements = data?.announcements ?? [];

  const createMut = useMutation({
    mutationFn: () =>
      apiCall('/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, content, audience, priority }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('घोषणा प्रकाशित केली');
      setCreateOpen(false);
      resetForm();
    },
    onError: () => toast.error('घोषणा अयशस्वी'),
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setAudience('all');
    setPriority('medium');
  };

  const getAudienceLabel = (aud: string) => {
    switch (aud) {
      case 'all': return 'सर्व';
      case 'teachers': return 'फक्त शिक्षक';
      case 'students': return 'फक्त विद्यार्थी';
      case 'parents': return 'फक्त पालक';
      default: return aud;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">घोषणा</h1>
          <p className="text-sm text-muted-foreground">शाळेसाठी महत्त्वाच्या घोषणा आणि निवेदने तयार करा</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> नवीन घोषणा
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) resetForm(); setCreateOpen(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>नवीन घोषणा तयार करा</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>शीर्षक / विषय *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="उदा. सुट्टीची सूचना" />
            </div>
            <div className="space-y-1">
              <Label>संदेश *</Label>
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                rows={5}
                placeholder="सविस्तर संदेश लिहा..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>श्रोते (Audience)</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as AudienceOpt)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सर्व (All)</SelectItem>
                    <SelectItem value="teachers">शिक्षक (Teachers)</SelectItem>
                    <SelectItem value="students">विद्यार्थी (Students)</SelectItem>
                    <SelectItem value="parents">पालक (Parents)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>प्राधान्य (Priority)</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as PriorityOpt)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">कमी (Low)</SelectItem>
                    <SelectItem value="medium">मध्यम (Medium)</SelectItem>
                    <SelectItem value="high">उच्च (High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>रद्द</Button>
            <Button 
              onClick={() => createMut.mutate()} 
              disabled={createMut.isPending || !title.trim() || !content.trim()}
            >
              <Megaphone className="w-4 h-4 mr-2" /> प्रकाशित करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List */}
      {isLoading && (
        <div className="portal-card p-12 text-center text-muted-foreground">
          लोड होत आहे…
        </div>
      )}
      {!isLoading && announcements.length === 0 && (
        <div className="portal-card p-12 text-center text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>कोणत्याही घोषणा नाहीत</p>
        </div>
      )}
      {!isLoading && announcements.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {announcements.map((a: any) => (
            <div key={a._id} className="portal-card p-5 border-l-4" style={{
              borderLeftColor: a.priority === 'high' ? 'hsl(var(--destructive))' : a.priority === 'medium' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
            }}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{a.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {getAudienceLabel(a.audience)}
                    </span>
                    <span>•</span>
                    <span>{new Date(a.createdAt).toLocaleDateString('mr-IN', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</span>
                    {a.priority === 'high' && (
                      <Badge variant="destructive" className="text-[10px] py-0 h-4">महत्त्वाचे</Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed bg-accent/30 p-3 rounded-lg border border-border/50">
                {a.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
