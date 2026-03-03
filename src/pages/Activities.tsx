import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { Trophy, Palette, FlaskConical, Music, BookOpen, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const activities = [
  { icon: Trophy, title: 'क्रीडा उपक्रम', desc: 'क्रिकेट, कबड्डी, खो-खो, बॅडमिंटन आणि इतर मैदानी खेळ. वार्षिक क्रीडा महोत्सव आयोजित केला जातो.', color: 'bg-primary/10 text-primary' },
  { icon: Palette, title: 'कला व हस्तकला', desc: 'चित्रकला, मातीकाम, कागदकाम, आणि विविध सर्जनशील कलाउपक्रम.', color: 'bg-success/10 text-success' },
  { icon: FlaskConical, title: 'विज्ञान प्रयोगशाळा', desc: 'आधुनिक विज्ञान प्रयोगशाळेत विद्यार्थ्यांना प्रात्यक्षिके करण्याची संधी.', color: 'bg-warning/10 text-warning' },
  { icon: Music, title: 'संगीत व नृत्य', desc: 'शास्त्रीय संगीत, लोकनृत्य, आणि विविध सांस्कृतिक कार्यक्रम.', color: 'bg-destructive/10 text-destructive' },
  { icon: BookOpen, title: 'ग्रंथालय', desc: 'हजारो पुस्तकांचा संग्रह आणि वाचन कक्ष. साप्ताहिक वाचन सत्र.', color: 'bg-primary/10 text-primary' },
  { icon: Globe, title: 'डिजिटल शिक्षण', desc: 'संगणक प्रयोगशाळा आणि स्मार्ट वर्गखोल्यांमध्ये आधुनिक शिक्षण.', color: 'bg-success/10 text-success' },
];

export default function Activities() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            शालेय <span className="text-primary">उपक्रम</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-10">
            विद्यार्थ्यांच्या सर्वांगीण विकासासाठी आमच्या विविध शैक्षणिक आणि सहशालेय उपक्रमांची माहिती.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((a, i) => (
            <motion.div
              key={a.title}
              className="portal-card p-6 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${a.color}`}>
                <a.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg mb-2">{a.title}</h3>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
