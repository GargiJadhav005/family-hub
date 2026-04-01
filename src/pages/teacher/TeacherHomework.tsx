import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  className: string;
  dueDate: string;
  createdAt: string;
}

export default function TeacherHomework() {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const loadHomework = async () => {
      try {
        const data = await apiCall('/homework');
        if (Array.isArray(data.homework)) {
          setHomeworkList(data.homework);
        }
      } catch (err) {
        console.error('Failed to load homework:', err);
      }
    };
    loadHomework();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !title || !description || !className) {
      toast.error('कृपया सर्व माहिती भरा');
      return;
    }
    try {
      const data = await apiCall('/homework', {
        method: 'POST',
        body: JSON.stringify({ subject, title, description, className, dueDate }),
      });
      const homeworkData = data.homework || data;
      const newHw: Homework = {
        id: homeworkData.id,
        subject: homeworkData.subject,
        title: homeworkData.title,
        description: homeworkData.description,
        className: homeworkData.className,
        dueDate: homeworkData.dueDate,
        createdAt: homeworkData.createdAt,
      };
      setHomeworkList((prev) => [newHw, ...prev]);
      setShowForm(false);
      setSubject('');
      setTitle('');
      setDescription('');
      setClassName('');
      setDueDate('');
      toast.success('गृहपाठ यशस्वीरित्या दिला!');
    } catch (err) {
      toast.error('गृहपाठ जतन करण्यात अडचण आली');
      console.error('Homework creation error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> गृहपाठ व्यवस्थापन
          </h1>
          <p className="text-sm text-muted-foreground">विद्यार्थ्यांना गृहपाठ द्या आणि व्यवस्थापित करा</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> नवीन गृहपाठ
        </Button>
      </div>

      {showForm && (
        <div className="portal-card p-6">
          <h3 className="font-bold mb-4">📝 नवीन गृहपाठ तयार करा</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>विषय</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="विषय निवडा" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="गणित">गणित</SelectItem>
                    <SelectItem value="मराठी">मराठी</SelectItem>
                    <SelectItem value="इंग्रजी">इंग्रजी</SelectItem>
                    <SelectItem value="विज्ञान">विज्ञान</SelectItem>
                    <SelectItem value="परिसर अभ्यास">परिसर अभ्यास</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
            <div className="space-y-2">
              <Label>शीर्षक</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="गृहपाठाचे शीर्षक" required />
            </div>
            <div className="space-y-2">
              <Label>तपशील</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="गृहपाठाचे तपशीलवार वर्णन..." rows={3} required />
            </div>
            <div className="space-y-2">
              <Label>मुदत</Label>
              <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="उदा. १५ नोव्हेंबर" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">गृहपाठ पाठवा</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>रद्द करा</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {homeworkList.map((h) => (
          <div key={h.id} className="portal-card p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-medium">{h.subject}</span>
                <span className="text-xs text-muted-foreground">दिलेले: {h.createdAt}</span>
              </div>
              <h3 className="font-semibold text-sm">{h.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> मुदत: {h.dueDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
