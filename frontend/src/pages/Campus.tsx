import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Trees, Users, Microscope, BookOpen, Music, Trophy, ArrowRight, Calendar, ChevronRight, School } from 'lucide-react';
import campus1 from '@/assets/campus-1.jpeg';
import campus2 from '@/assets/campus-2.jpeg';
import campus3 from '@/assets/campus-3.jpeg';

const facilities = [
  {
    title: 'मुख्य इमारत',
    tag: 'शिक्षण परिसर',
    image: campus1,
    desc: 'हवेशीर वर्गखोल्या, आधुनिक फर्निचर आणि उत्कृष्ट शिक्षण सुविधा.',
    icon: Building2,
  },
  {
    title: 'विस्तृत मैदान',
    tag: 'मोकळे वातावरण',
    image: campus2,
    desc: 'विद्यार्थ्यांसाठी मोकळी जागा, खेळाचे मैदान आणि निसर्गरम्य परिसर.',
    icon: Trees,
  },
  {
    title: 'विद्यार्थी-शिक्षक',
    tag: 'संवाद व मार्गदर्शन',
    image: campus3,
    desc: 'वैयक्तिक लक्ष आणि अनुभवी शिक्षकांचे मार्गदर्शन.',
    icon: Users,
  },
];

const facilityDetails = [
  { icon: Microscope, title: 'विज्ञान प्रयोगशाळा', desc: 'आधुनिक उपकरणांसह सज्ज प्रयोगशाळा', color: 'text-blue-500 bg-blue-50' },
  { icon: BookOpen, title: 'ग्रंथालय', desc: 'हजारो पुस्तके आणि डिजिटल संसाधने', color: 'text-green-500 bg-green-50' },
  { icon: Music, title: 'संगीत कक्ष', desc: 'वाद्य संगीत आणि गायनासाठी विशेष जागा', color: 'text-purple-500 bg-purple-50' },
  { icon: Trophy, title: 'क्रीडागृह', desc: 'इनडोअर खेळांसाठी सुसज्ज क्रीडागृह', color: 'text-orange-500 bg-orange-50' },
];

const events = [
  {
    date: 'फेब्रुवारी १५',
    tag: 'क्रीडा',
    tagColor: 'text-green-600 bg-green-50 border-green-200',
    title: 'वार्षिक क्रीडा महोत्सव',
    desc: 'सर्व इयत्तांच्या विद्यार्थ्यांसाठी विविध मैदानी खेळांचे आणि स्पर्धांचे आयोजन.',
    emoji: '🏆',
  },
  {
    date: 'फेब्रुवारी २८',
    tag: 'शैक्षणिक',
    tagColor: 'text-blue-600 bg-blue-50 border-blue-200',
    title: 'विज्ञान प्रदर्शन',
    desc: 'नवे शास्त्रज्ञ विद्यार्थ्यांनी तयार केलेले वैज्ञानिक प्रयोग.',
    emoji: '🔬',
  },
  {
    date: 'मार्च ०५',
    tag: 'सांस्कृतिक',
    tagColor: 'text-purple-600 bg-purple-50 border-purple-200',
    title: 'स्नेहसंमेलन',
    desc: 'कलागुणांचे दर्शन — विद्यार्थ्यांचे नृत्य, नाटक आणि विविध कलाप्रकार.',
    emoji: '🎭',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function Campus() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* ─── Page Hero Banner ─── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-primary to-indigo-800">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 50L1440 50L1440 10C1200 50 960 0 720 15C480 30 240 0 0 15L0 50Z" fill="hsl(var(--background))" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center text-white max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-widest mb-6 border border-white/20">
              <School className="w-3.5 h-3.5" /> शालेय परिसर
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              शालेय <span className="text-blue-200">परिसर व उपक्रम</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              इयत्ता १ ली ते ४ थी च्या विद्यार्थ्यांच्या सर्वांगीण विकासासाठी सज्ज असलेला आमचा आधुनिक आणि निसर्गरम्य परिसर.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">

        {/* ─── Facilities Photo Grid ─── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-4">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3 px-4 py-1.5 bg-primary/10 rounded-full">सुविधा</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">आमच्या सुविधा</h2>
          <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-xl">
            विद्यार्थ्यांच्या सर्वांगीण विकासासाठी अत्याधुनिक सुविधा.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {facilities.map((f, i) => (
            <motion.div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="relative overflow-hidden h-64">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground mb-2 inline-block font-medium">
                  {f.tag}
                </span>
                <p className="text-white font-bold text-lg mb-1">{f.title}</p>
                <p className="text-white/75 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Facility Details Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {facilityDetails.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Events Section ─── */}
        <div className="mb-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3 px-4 py-1.5 bg-primary/10 rounded-full">दिनदर्शिका</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">शालेय दिनदर्शिका</h2>
          <p className="text-muted-foreground text-sm md:text-base mb-8">येणाऱ्या उपक्रमांची आणि कार्यक्रमांची सविस्तर माहिती.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {events.map((e, i) => (
            <motion.div
              key={e.title}
              className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {/* top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${i === 0 ? 'bg-green-400' : i === 1 ? 'bg-blue-400' : 'bg-purple-400'}`} />
              <div className="text-4xl mb-4">{e.emoji}</div>

              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-3 py-1 rounded-full ${e.tagColor}`}>
                  <Calendar className="w-3 h-3" />
                  {e.date}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{e.tag}</span>
              </div>

              <h3 className="font-bold text-lg mb-2">{e.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── CTA Section ─── */}
        <motion.div
          className="relative bg-gradient-to-br from-slate-900 via-primary to-indigo-800 text-white rounded-3xl p-10 md:p-14 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 dot-pattern" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6">
              <School className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              आमचा परिसर प-रत्यक्ष भेट द्या
            </h3>
            <p className="mb-7 text-white/85 max-w-lg mx-auto text-sm md:text-base">
              शाळेचा अनुभव प्रत्यक्ष घ्या आणि आमच्या जीवंत शैक्षणिक वातावरणाची ओळख करून घ्या.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admissions">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-bold shadow-lg border-0 gap-2 transition-all duration-300 hover:scale-105">
                  प्रवेशासाठी अर्ज करा <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-2 border-white/70 text-white hover:bg-white/15 gap-2 transition-all duration-300">
                  आमच्याबद्दल जाणून घ्या <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>

      <PublicFooter />
    </div>
  );
}