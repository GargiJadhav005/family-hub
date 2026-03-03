import { Bus, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ParentBus() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">शालेय बस ट्रॅकिंग</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bus tracker */}
        <div className="portal-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">🚌 शालेय बस ट्रॅकिंग</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">● चालू आहे</span>
          </div>
          <div className="bg-secondary/50 rounded-xl h-48 flex items-center justify-center mb-4">
            <div className="text-center">
              <Bus className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">बस क्र. ४२ - ५ मिनिटांत पोहोचेल</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">मार्ग क्र. ४: मुख्य रस्ता - बस क्र. २२</p>
                <p className="text-xs text-muted-foreground">पुढचा थांबा: शिवाजी चौक</p>
              </div>
              <span className="ml-auto text-sm text-primary font-medium">१२ मिनिटे</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Bus className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">चालक: रमेश गायकवाड</p>
                <p className="text-xs text-muted-foreground">+९१ ९८७६५ ४३२१०</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1">स्थान तपासा</Button>
            <Button className="flex-1"><Phone className="w-4 h-4 mr-1" /> कॉल करा</Button>
          </div>
        </div>

        {/* Schedule */}
        <div className="portal-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">⏰ बस वेळापत्रक</h3>
          <div className="space-y-3">
            {[
              { time: '७:१५', label: 'सकाळी पिकअप', stop: 'शिवाजी चौक', status: 'done' },
              { time: '७:४५', label: 'शाळेत पोहोचणे', stop: 'शाळा गेट', status: 'done' },
              { time: '१:३०', label: 'दुपारी निघणे', stop: 'शाळा गेट', status: 'current' },
              { time: '२:००', label: 'ड्रॉप ऑफ', stop: 'शिवाजी चौक', status: 'pending' },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-3 p-3 rounded-lg ${
                s.status === 'current' ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/30'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                  s.status === 'done' ? 'bg-success/10 text-success' :
                  s.status === 'current' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {s.time}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.stop}</p>
                </div>
                {s.status === 'current' && (
                  <span className="ml-auto text-xs text-primary animate-pulse">चालू</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
