import { CreditCard, Download, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const feeBreakdown = [
  { label: 'शिक्षण शुल्क', amount: '₹४८,०००', status: 'भरले' },
  { label: 'वाहतूक फी', amount: '₹१४,०००', status: 'भरले' },
  { label: 'ग्रंथालय व प्रयोगशाळा', amount: '₹८,०००', status: 'भरले' },
  { label: 'उपक्रम शुल्क', amount: '₹६,०००', status: 'प्रलंबित' },
  { label: 'परीक्षा शुल्क', amount: '₹४,५००', status: 'प्रलंबित' },
];

export default function ParentFees() {
  const totalPaid = 70000;
  const totalDue = 80500;
  const paidPercent = Math.round((totalPaid / totalDue) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">फी व ईआरपी</h1>

      {/* Overview */}
      <div className="portal-card p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">फी भरणा स्थिती</p>
            <p className="text-xs text-muted-foreground">शैक्षणिक वर्ष २०२३-२४</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">₹ १२,८५०</p>
            <p className="text-xs text-muted-foreground">पुढील हप्ता: ३० ऑक्टोबर</p>
          </div>
        </div>
        <Progress value={paidPercent} className="h-3 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹ {totalPaid.toLocaleString()} भरला</span>
          <span>{paidPercent}% भरले</span>
        </div>
        <Button className="w-full mt-4" size="lg">आता भरा <ArrowRight className="ml-2 w-4 h-4" /></Button>
      </div>

      {/* Fee breakdown */}
      <div className="portal-card p-5">
        <h3 className="font-bold mb-4">फी तपशील</h3>
        <div className="space-y-3">
          {feeBreakdown.map((f) => (
            <div key={f.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm">{f.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{f.amount}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  f.status === 'भरले' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {f.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" /> पावती डाउनलोड</Button>
        <Button variant="outline" className="flex-1"><Receipt className="w-4 h-4 mr-1" /> संपूर्ण उतारा</Button>
      </div>
    </div>
  );
}
