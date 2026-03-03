import { BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const homework = [
  { id: 1, subject: 'गणित', title: 'अपूर्णांक वर्कशीट', desc: 'कार्यपुस्तिका पान ४५-४६, प्रश्न क्र. २ पूर्ण करा.', due: 'उद्या दुपारी ५:०० पर्यंत', status: 'pending', urgent: true },
  { id: 2, subject: 'मराठी', title: 'निबंध लेखन', desc: "'माझा आवडता प्राणी' या विषयावर १० ओळी लिहा.", due: 'या शुक्रवारी', status: 'in_progress', urgent: false },
  { id: 3, subject: 'विज्ञान', title: 'पानांचे संकलन प्रकल्प', desc: '५ वेगवेगळ्या प्रकारची पाने गोळा करा आणि चिकटवा.', due: '२६ ऑक्टोबर', status: 'done', urgent: false },
  { id: 4, subject: 'इंग्रजी', title: 'शुद्धलेखन सराव', desc: 'साप्ताहिक शब्द सूची लिहा.', due: '२८ ऑक्टोबर', status: 'pending', urgent: false },
];

export default function ParentHomework() {
  const pending = homework.filter((h) => h.status !== 'done').length;

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
            h.urgent && h.status !== 'done' ? 'border-l-4 border-l-destructive' : ''
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              h.status === 'done' ? 'bg-success/10' : 'bg-primary/10'
            }`}>
              <BookOpen className={`w-5 h-5 ${h.status === 'done' ? 'text-success' : 'text-primary'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-medium">{h.subject}</span>
                {h.urgent && h.status !== 'done' && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> तातडीचे
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm mt-1">{h.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> वेळ: {h.due}
              </p>
            </div>
            <Button
              variant={h.status === 'done' ? 'ghost' : 'outline'}
              size="sm"
              className={h.status === 'done' ? 'text-success' : ''}
            >
              {h.status === 'done' ? (
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
