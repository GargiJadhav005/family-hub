import { useState } from "react";
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { schoolConfig } from '@/config/school';
import { submitEnquiry } from '@/lib/api';
import { buildAdmissionEnquiryPayload } from '@/lib/enquiry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, FileText, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { icon: FileText, title: 'ऑनलाइन अर्ज भरा', desc: 'खाली दिलेला फॉर्म भरून अर्ज सादर करा.' },
  { icon: Calendar, title: 'मुलाखत वेळ', desc: 'अर्ज मंजूर झाल्यानंतर मुलाखतीचे वेळापत्रक मिळेल.' },
  { icon: Users, title: 'पालक मुलाखत', desc: 'पालक आणि विद्यार्थ्याची मुलाखत शाळेत घेतली जाईल.' },
  { icon: CheckCircle2, title: 'प्रवेश निश्चित', desc: 'सर्व प्रक्रिया पूर्ण झाल्यावर प्रवेश निश्चित केला जाईल.' },
];

export default function Admissions() {
  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    grade: "",
    gender: "",
    parentName: "",
    phone: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.studentName || !formData.phone || !formData.grade || !formData.email.trim()) {
      setError("कृपया विद्यार्थ्याचे नाव, ईमेल, फोन आणि इयत्ता भरा.");
      return;
    }

    const built = buildAdmissionEnquiryPayload(formData);
    if ("error" in built) {
      setError(built.error);
      return;
    }

    setLoading(true);
    try {
      await submitEnquiry(built);
      setSuccess(true);
      setFormData({
        studentName: "",
        dob: "",
        grade: "",
        gender: "",
        parentName: "",
        phone: "",
        email: "",
        message: ""
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "अर्ज सादर करता आला नाही.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section className="container mx-auto px-4 py-12 md:py-16">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            प्रवेश <span className="text-primary">प्रक्रिया</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {schoolConfig.displayNameMr} मध्ये प्रवेशासाठी खालील सोप्या पायऱ्या अनुसरा.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              className="bg-card rounded-xl p-5 text-center shadow-sm hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-xs font-medium text-primary mb-1">पायरी {i + 1}</div>
              <h3 className="font-bold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-card p-8 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-center mb-6">प्रवेश अर्ज फॉर्म</h2>

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
              ✅ अर्ज यशस्वीरीत्या सादर झाला! लवकरच संपर्क करू.
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input
                placeholder="विद्यार्थ्याचे पूर्ण नाव *"
                value={formData.studentName}
                onChange={(e) => handleChange("studentName", e.target.value)}
                required
              />

              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
              />

              <Select value={formData.grade} onValueChange={(val) => handleChange("grade", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="इयत्ता निवडा *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">इयत्ता १ ली</SelectItem>
                  <SelectItem value="2">इयत्ता २ री</SelectItem>
                  <SelectItem value="3">इयत्ता ३ री</SelectItem>
                  <SelectItem value="4">इयत्ता ४ थी</SelectItem>
                </SelectContent>
              </Select>

              <Select value={formData.gender} onValueChange={(val) => handleChange("gender", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="लिंग" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">मुलगा</SelectItem>
                  <SelectItem value="female">मुलगी</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="पालकाचे नाव"
                value={formData.parentName}
                onChange={(e) => handleChange("parentName", e.target.value)}
              />

              <Input
                type="tel"
                placeholder="संपर्क क्रमांक *"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
                pattern="[0-9]{10}"
              />

              <Input
                type="email"
                placeholder="ईमेल *"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="md:col-span-2"
                required
              />
            </div>

            <Textarea
              placeholder="अधिक माहिती..."
              rows={4}
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "सादर होत आहे..." : "अर्ज सादर करा"}
            </Button>
          </form>
        </div>

      </section>

      <PublicFooter />
    </div>
  );
}