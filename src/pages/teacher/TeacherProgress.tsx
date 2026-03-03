import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Clock, FileDown, Printer, Eye } from 'lucide-react';

const students = [
  { id: 1, name: 'एमिली मिलर', studentId: '#२०२३०४२', selected: true },
  { id: 2, name: 'जेम्स स्मिथ', studentId: '#२०२३०४५', selected: false },
  { id: 3, name: 'लिओ वॉकर', studentId: '#२०२३०४८', selected: false },
];

const subjects = [
  { name: 'मराठी', grade: 'A', effort: 'उत्कृष्ट' },
  { name: 'गणित', grade: 'A', effort: 'उत्कृष्ट' },
  { name: 'इंग्रजी', grade: 'B+', effort: 'चांगले' },
  { name: 'परिसर अभ्यास', grade: 'A-', effort: 'उत्कृष्ट' },
];

export default function TeacherProgress() {
  const [selectedStudent, setSelectedStudent] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">प्रगती पुस्तक निर्मिती</h1>
          <p className="text-sm text-muted-foreground">शैक्षणिक वर्ष २०२३-२०२४ • सत्र २</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Clock className="w-4 h-4 mr-1" /> इतिहास पहा</Button>
          <Button size="sm"><Eye className="w-4 h-4 mr-1" /> पूर्वदृश्य</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student selection */}
        <div className="space-y-4">
          <div className="portal-card p-5">
            <h3 className="font-bold mb-3">विद्यार्थी निवडा</h3>
            <div className="space-y-2">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    selectedStudent === s.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-secondary'
                  }`}
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">आयडी: {s.studentId}</p>
                  </div>
                  {selectedStudent === s.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
            <button className="w-full text-center text-sm text-primary mt-3 hover:underline">
              सर्व २४ विद्यार्थी पहा
            </button>
          </div>

          <div className="portal-card p-5 space-y-3">
            <h3 className="font-bold">निर्यात पर्याय</h3>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary text-left">
              <FileDown className="w-5 h-5 text-destructive" />
              <span className="text-sm">पीडीएफ तयार करा</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary text-left">
              <Printer className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">अधिकृत प्रत मुद्रित करा</span>
            </button>
          </div>
        </div>

        {/* Academic progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="portal-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">📚 शैक्षणिक प्रगती</h3>
              <Button variant="outline" size="sm">मसुदा</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">विषय</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">श्रेणी</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">प्रयत्न</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">शिक्षकांचा अभिप्राय</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.name} className="border-b border-border/50">
                      <td className="p-3 text-sm font-medium">{s.name}</td>
                      <td className="p-3">
                        <Select defaultValue={s.grade}>
                          <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C'].map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Select defaultValue={s.effort}>
                          <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['उत्कृष्ट', 'चांगले', 'सुधारणा आवश्यक'].map(e => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <input type="text" placeholder="टिप लिहा..." className="w-full text-sm bg-transparent border-b border-border/50 focus:border-primary outline-none py-1" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="portal-card p-5">
            <h3 className="font-bold mb-3">📍 गुणात्मक मूल्यांकन</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">सामाजिक कौशल्ये</label>
                <Select defaultValue="good">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">उत्कृष्ट</SelectItem>
                    <SelectItem value="good">बहुतेक प्रसंगी गटात प्रभावीपणे काम करते</SelectItem>
                    <SelectItem value="needs">सुधारणा आवश्यक</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">सर्जनशीलता</label>
                <Select defaultValue="creative">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creative">उत्तम पुढाकार आणि वेगळा दृष्टिकोन दाखवते</SelectItem>
                    <SelectItem value="good">चांगला प्रयत्न</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">एकूण शिक्षक अभिप्राय</label>
              <Textarea className="mt-1" rows={4} placeholder="या सत्रातील विद्यार्थ्याच्या प्रगतीबद्दल सविस्तर अभिप्राय प्रविष्ट करा..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
