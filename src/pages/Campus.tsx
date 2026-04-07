import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import campus1 from '@/assets/campus-1.jpeg';
import campus2 from '@/assets/campus-2.jpeg';
import campus3 from '@/assets/campus-3.jpeg';

const facilities = [
  { title: 'मुख्य इमारत ', tag: 'शिक्षण परिसर', image: campus1 },
  { title: 'शालेयपरिसर', tag: 'मोकळे वातावरण', image: campus2 },
  { title: 'शालेयपरिसर', tag: 'विद्यार्थी - शिक्षक', image: campus3 },
];

const events = [
  { date: 'फेब्रुवारी १५', tag: 'क्रीडा', title: 'वार्षिक क्रीडा महोत्सव', desc: 'सर्व इयत्तांच्या विद्यार्थ्यांसाठी विविध मैदानी खेळांचे आणि स्पर्धांचे आयोजन.' },
  { date: 'फेब्रुवारी २८', tag: 'शैक्षणिक', title: 'विज्ञान प्रदर्शन', desc: 'नवे शास्त्रज्ञ विद्यार्थ्यांनी तयार केलेले वैज्ञानिक प्रयोग.' },
  { date: 'मार्च ०५', tag: 'सांस्कृतिक', title: 'स्नेहसंमेलन', desc: 'कलागुणांचे दर्शन विद्यार्थ्यांचे नृत्य, नाटक आणि विविध कलाप्रकार.' },
];

export default function Campus() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section className="container mx-auto px-4 py-12 md:py-16">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            शालेय <span className="text-primary">परिसर व उपक्रम</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            इयत्ता १ ली ते ४ थी च्या विद्यार्थ्यांच्या सर्वांगीण विकासासाठी सज्ज असलेला आमचा आधुनिक आणि निसर्गरम्य परिसर.
          </p>
        </motion.div>

        {/* Facilities */}
        <h2 className="text-2xl font-bold mb-6">आमच्या सुविधा</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {facilities.map((f, i) => (
            <motion.div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl shadow-md"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <img
                src={f.image}
                alt={f.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-5 left-5">
                <span className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground mb-2 inline-block">
                  {f.tag}
                </span>
                <p className="text-white font-semibold text-lg">
                  {f.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Events Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">शालेय दिनदर्शिका</h2>
          <p className="text-muted-foreground">
            येणाऱ्या उपक्रमांची आणि कार्यक्रमांची सविस्तर माहिती.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {events.map((e, i) => (
            <motion.div
              key={e.title}
              className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-lg transition"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {e.date}
                </span>
                <span className="text-xs text-muted-foreground">
                  {e.tag}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-2">{e.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {e.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="bg-primary text-primary-foreground rounded-2xl p-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-3">
            आमचा परिसर प्रत्यक्ष भेट द्या
          </h3>
          <p className="mb-5 text-primary-foreground/90">
            शाळेचा अनुभव प्रत्यक्ष घ्या आणि आमच्या वातावरणाची ओळख करून घ्या.
          </p>
          <Button size="lg" variant="secondary">
            भेट ठरवा
          </Button>
        </motion.div>

      </section>

      <PublicFooter />
    </div>
  );
}