import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { motion } from 'framer-motion';
import campus1 from '@/assets/campus-1.jpg';
import campus2 from '@/assets/campus-2.jpg';
import campus3 from '@/assets/campus-3.jpg';

const facilities = [
  { title: 'निसर्गरम्य खेळाचे मैदान', tag: 'क्रीडांगण', image: campus1 },
  { title: 'बाल ग्रंथालय', tag: 'वाचनालय', image: campus2 },
  { title: 'क्रीडा सभागृह', tag: 'क्रीडा', image: campus3 },
];

const events = [
  { date: 'फेब्रुवारी १५', tag: 'क्रीडा', title: 'वार्षिक क्रीडा महोत्सव', desc: 'सर्व इयत्तांच्या विद्यार्थ्यांसाठी विविध मैदानी खेळांचे आणि स्पर्धांचे आयोजन.' },
  { date: 'फेब्रुवारी २८', tag: 'शैक्षणिक', title: 'विज्ञान प्रदर्शन', desc: 'नवे शास्त्रज्ञ विद्यार्थ्यांनी तयार केलेले वैज्ञानिक प्रयोग.' },
  { date: 'मार्च ०५', tag: 'सांस्कृतिक', title: 'स्नेहसंमेलन', desc: 'कलागुणांचे दर्शन विद्यार्थ्यांचे नृत्य, नाटक आणि विविध कलाप्रकार.' },
];

export default function Campus() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            शालेय <span className="text-primary">परिसर व उपक्रम</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-10">
            इयत्ता १ ली ते ४ थी च्या विद्यार्थ्यांच्या सर्वांगीण विकासासाठी सज्ज असलेला आमचा आधुनिक आणि निसर्गरम्य परिसर.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {facilities.map((f, i) => (
            <motion.div
              key={f.title}
              className="group relative overflow-hidden rounded-xl aspect-[4/3]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <img src={f.image} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground mb-1 inline-block">{f.tag}</span>
                <p className="text-primary-foreground font-bold">{f.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <h2 className="section-title">शालेय दिनदर्शिका</h2>
        <p className="section-subtitle">येणाऱ्या उपक्रमांची आणि कार्यक्रमांची सविस्तर माहिती.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((e, i) => (
            <motion.div
              key={e.title}
              className="portal-card p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{e.date}</span>
                <span className="text-xs text-muted-foreground">{e.tag}</span>
              </div>
              <h3 className="font-bold mb-1">{e.title}</h3>
              <p className="text-sm text-muted-foreground">{e.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
