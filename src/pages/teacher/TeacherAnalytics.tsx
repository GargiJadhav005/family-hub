import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { TrendingUp, AlertTriangle, Star, BookOpen } from 'lucide-react';

const subjectPerformance = [
  { subject: 'मराठी', avg: 88 },
  { subject: 'गणित', avg: 72 },
  { subject: 'इंग्रजी', avg: 65 },
  { subject: 'विज्ञान', avg: 82 },
  { subject: 'परिसर अभ्यास', avg: 90 },
];

const radarData = [
  { area: 'गणित', value: 72 },
  { area: 'भाषा', value: 85 },
  { area: 'विज्ञान', value: 82 },
  { area: 'सर्जनशीलता', value: 90 },
  { area: 'शारीरिक', value: 88 },
  { area: 'सामाजिक', value: 78 },
];

const weakAreas = [
  { subject: 'गणित', topic: 'अपूर्णांकांवरील भाग', students: 12, severity: 'high' },
  { subject: 'इंग्रजी', topic: 'Tenses (काळ)', students: 8, severity: 'high' },
  { subject: 'गणित', topic: 'शब्द समस्या', students: 6, severity: 'medium' },
];

const strongAreas = [
  { subject: 'मराठी', topic: 'कविता वाचन', percentage: '९५%' },
  { subject: 'परिसर अभ्यास', topic: 'पर्यावरण जागृती', percentage: '९२%' },
  { subject: 'विज्ञान', topic: 'प्रयोग कौशल्य', percentage: '९०%' },
];

const revisionTopics = [
  { subject: 'गणित', topic: 'गुणाकार सारणी ७-१२', reason: 'गेल्या चाचणीत ६०% खाली' },
  { subject: 'इंग्रजी', topic: 'Prepositions', reason: 'सातत्याने चुका होत आहेत' },
  { subject: 'मराठी', topic: 'लिंग व वचन', reason: 'मूलभूत संकल्पना मजबूत करणे आवश्यक' },
  { subject: 'विज्ञान', topic: 'मापन आणि एकके', reason: 'विद्यार्थ्यांना गोंधळ होत आहे' },
];

export default function TeacherAnalytics() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">📊 वर्ग विश्लेषण</h1>
        <p className="text-sm text-muted-foreground">इयत्ता ४-ब • शैक्षणिक वर्ष २०२४-२५</p>
      </div>

      {/* Subject Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4">📈 विषयनिहाय सरासरी कामगिरी</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="portal-card p-5">
          <h3 className="font-bold mb-4">🎯 क्षमता रडार</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Areas */}
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> कमकुवत क्षेत्रे
          </h3>
          <div className="space-y-3">
            {weakAreas.map((w, i) => (
              <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary font-medium">{w.subject}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${w.severity === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                    {w.severity === 'high' ? 'गंभीर' : 'मध्यम'}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">{w.topic}</p>
                <p className="text-xs text-muted-foreground">{w.students} विद्यार्थ्यांना अडचण</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strong Areas */}
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" /> सशक्त क्षेत्रे
          </h3>
          <div className="space-y-3">
            {strongAreas.map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-success/5 border border-success/10">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary font-medium">{s.subject}</span>
                <p className="text-sm font-medium mt-1">{s.topic}</p>
                <p className="text-xs text-success font-medium">{s.percentage} विद्यार्थी उत्तीर्ण</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revision Topics */}
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> पुनरावृत्ती आवश्यक
          </h3>
          <div className="space-y-3">
            {revisionTopics.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary font-medium">{r.subject}</span>
                <p className="text-sm font-medium mt-1">{r.topic}</p>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
