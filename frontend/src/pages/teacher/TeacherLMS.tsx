import { BookOpen, FileText, Video, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const courses = [
  { title: 'अपूर्णांकांची ओळख', subject: 'गणित • घटक ४', progress: 65, color: 'bg-primary' },
  { title: 'वनस्पती आणि प्रकाशसंश्लेषण', subject: 'विज्ञान • घटक २', progress: 20, color: 'bg-success' },
  { title: 'प्राचीन संस्कृती', subject: 'इतिहास • घटक १', progress: 90, color: 'bg-foreground' },
];

const materials = [
  { title: 'गणित चिन्हांचे मार्गदर्शक', type: 'PDF', size: '१.२ MB', icon: FileText },
  { title: 'प्रकाशसंश्लेषण व्हिडिओ', type: 'MP4', size: '५:३०', icon: Video },
  { title: 'साप्ताहिक वाचन सूची', type: 'DOCX', size: '५०० KB', icon: FileText },
];

export default function TeacherLMS() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">अभ्यासक्रम (LMS)</h1>
        <p className="text-sm text-muted-foreground">शैक्षणिक सामग्री व्यवस्थापन</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c.title} className="portal-card p-5">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-sm">{c.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{c.subject}</p>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">प्रगती</span>
              <span className="font-medium">{c.progress}%</span>
            </div>
            <Progress value={c.progress} className="h-2" />
            <Button className="w-full mt-4" variant="outline" size="sm">
              {c.progress > 80 ? 'अंतिम चाचणी' : c.progress > 0 ? 'शिकणे सुरू ठेवा' : 'धडा सुरू करा'}
            </Button>
          </div>
        ))}
      </div>

      <div className="portal-card p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">📁 अभ्यास साहित्य</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {materials.map((m) => (
            <div key={m.title} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <m.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.type} • {m.size}</p>
                <button className="text-xs text-primary mt-1 hover:underline flex items-center gap-1">
                  <Download className="w-3 h-3" /> डाउनलोड करा
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
