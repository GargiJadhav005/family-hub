import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const subjectScores = [
  { subject: 'मराठी', score: 92 },
  { subject: 'गणित', score: 85 },
  { subject: 'इंग्रजी', score: 78 },
  { subject: 'विज्ञान', score: 88 },
  { subject: 'परिसर अभ्यास', score: 90 },
];

const testHistory = [
  { id: 1, subject: 'गणित', test: 'घटक चाचणी ३', score: '८५%', date: '२५ ऑक्टो', grade: 'A' },
  { id: 2, subject: 'मराठी', test: 'साप्ताहिक चाचणी ५', score: '९२%', date: '२३ ऑक्टो', grade: 'A+' },
  { id: 3, subject: 'विज्ञान', test: 'प्रकल्प मूल्यांकन', score: '७८%', date: '२० ऑक्टो', grade: 'B+' },
  { id: 4, subject: 'इंग्रजी', test: 'Spelling Test', score: '७०%', date: '१८ ऑक्टो', grade: 'B' },
  { id: 5, subject: 'गणित', test: 'घटक चाचणी २', score: '९०%', date: '१५ ऑक्टो', grade: 'A+' },
  { id: 6, subject: 'परिसर अभ्यास', test: 'मौखिक चाचणी', score: '९५%', date: '१२ ऑक्टो', grade: 'A+' },
  { id: 7, subject: 'मराठी', test: 'शुद्धलेखन', score: '८८%', date: '१० ऑक्टो', grade: 'A' },
];

export default function StudentScores() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> माझे गुण
        </h1>
        <p className="text-sm text-muted-foreground">विषयनिहाय गुण आणि चाचणी इतिहास</p>
      </div>

      {/* Chart */}
      <div className="portal-card p-5">
        <h3 className="font-bold mb-4">📊 विषयनिहाय सरासरी गुण</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test history */}
      <div className="portal-card p-5">
        <h3 className="font-bold mb-4">📋 चाचणी इतिहास</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">विषय</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">चाचणीचे नाव</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">तारीख</th>
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">गुण</th>
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">श्रेणी</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.map((t) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{t.subject}</span>
                  </td>
                  <td className="p-3 text-sm font-medium">{t.test}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.date}</td>
                  <td className="p-3 text-center text-sm font-bold">{t.score}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.grade.includes('+') ? 'bg-success/10 text-success' :
                      t.grade === 'A' ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {t.grade}
                    </span>
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
