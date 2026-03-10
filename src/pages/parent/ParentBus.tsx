import { Bus, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ParentBus() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold">बस ट्रॅकिंग</h1>
        <p className="text-sm text-muted-foreground">
          तुमच्या मुलाची बस स्थिती
        </p>
      </div>

      {/* Main Bus Status Card */}
      <div className="bg-card border rounded-2xl p-6 text-center space-y-5">
        
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Bus className="w-8 h-8 text-primary" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">बस क्र. ४२</p>
          <h2 className="text-3xl font-bold text-primary">५ मिनिटांत</h2>
          <p className="text-sm text-muted-foreground">
            पुढचा थांबा: शिवाजी चौक
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          मार्ग क्र. ४
        </div>

        <Button className="w-full rounded-xl">
          <Phone className="w-4 h-4 mr-2" />
          चालकाला कॉल करा
        </Button>
      </div>

      {/* Simple Schedule */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-medium">आजचे वेळापत्रक</h3>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">सकाळी पिकअप</span>
          <span>७:१५</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">शाळेत पोहोचणे</span>
          <span>७:४५</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">दुपारी ड्रॉप</span>
          <span>२:००</span>
        </div>
      </div>
    </div>
  );
}