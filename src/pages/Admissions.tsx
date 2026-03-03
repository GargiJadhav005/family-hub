import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
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
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            प्रवेश <span className="text-primary">प्रक्रिया</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            वैनतेय प्राथमिक विद्या मंदिरमध्ये प्रवेशासाठी खालील सोप्या पायऱ्या अनुसरा.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              className="portal-card p-5 text-center"
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
        <div className="max-w-2xl mx-auto portal-card p-8">
          <h2 className="text-xl font-bold text-center mb-6">प्रवेश अर्ज फॉर्म</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="विद्यार्थ्याचे पूर्ण नाव" />
              <Input placeholder="जन्मतारीख" type="date" />
              <Select>
                <SelectTrigger><SelectValue placeholder="इयत्ता निवडा" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">इयत्ता १ ली</SelectItem>
                  <SelectItem value="2">इयत्ता २ री</SelectItem>
                  <SelectItem value="3">इयत्ता ३ री</SelectItem>
                  <SelectItem value="4">इयत्ता ४ थी</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="लिंग" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">मुलगा</SelectItem>
                  <SelectItem value="female">मुलगी</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="पालकाचे नाव" />
              <Input placeholder="संपर्क क्रमांक" type="tel" />
              <Input placeholder="ईमेल" type="email" className="md:col-span-2" />
            </div>
            <Textarea placeholder="अधिक माहिती (आधीची शाळा, विशेष गरजा, इत्यादी)..." rows={4} />
            <Button type="submit" className="w-full" size="lg">अर्ज सादर करा</Button>
          </form>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
