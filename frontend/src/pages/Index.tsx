import { useState } from 'react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { schoolConfig } from '@/config/school';
import { submitEnquiry } from '@/lib/api';
import { buildAdmissionEnquiryPayload } from '@/lib/enquiry';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowRight, Trophy, Palette, FlaskConical, BookOpen,
  Users, GraduationCap, Shield, Sparkles, ChevronRight,
  Phone, Mail, MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-school.jpg';
import campus1 from '@/assets/campus-1.jpeg';
import campus2 from '@/assets/campus-2.jpeg';
import campus3 from '@/assets/campus-3.jpeg';
import img1 from '@/assets/1.jpeg';
import img2 from '@/assets/2.jpeg';
import img3 from '@/assets/3.jpeg';
import img4 from '@/assets/4.jpeg';
import img5 from '@/assets/5.jpeg';
import img6 from '@/assets/6.jpeg';
import img7 from '@/assets/7.jpeg';
import img8 from '@/assets/8.jpeg';
import img9 from '@/assets/9.jpeg';

const pillars = [
  { icon: BookOpen,    title: 'दर्जेदार शिक्षण',   desc: 'राज्य अभ्यासक्रमानुसार आधुनिक पद्धतीचे गुणवत्तापूर्ण प्राथमिक शिक्षण.', accent: 'from-blue-500 to-indigo-600' },
  { icon: Users,       title: 'सर्वांगीण विकास',    desc: 'शैक्षणिक, सांस्कृतिक, क्रीडा व कला — चौफेर संतुलित वाढ.',          accent: 'from-violet-500 to-purple-600' },
  { icon: Shield,      title: 'सुरक्षित वातावरण',   desc: 'मुलांच्या शारीरिक आणि मानसिक सुरक्षिततेसाठी सर्वोत्तम व्यवस्था.',  accent: 'from-emerald-500 to-teal-600' },
  { icon: Sparkles,    title: 'पालक-शाळा सेतू',     desc: 'डिजिटल पोर्टलद्वारे पालक व शाळा यांच्यातील सतत संवाद.',            accent: 'from-amber-400 to-orange-500' },
];

const activityPreview = [
  { icon: Trophy,       title: 'क्रीडा व व्यायाम',  desc: 'क्रिकेट, कबड्डी, खो-खो व मैदानी स्पर्धा.', img: img8, category: 'क्रीडा' },
  { icon: Palette,      title: 'कला व हस्तकला',     desc: 'चित्रकला, हस्तकला व सांस्कृतिक कार्यक्रम.', img: img4, category: 'सांस्कृतिक' },
  { icon: FlaskConical, title: 'विज्ञान व प्रयोग',  desc: 'प्रयोगशाळा व विविध प्रकल्प उपक्रम.',        img: img2, category: 'शैक्षणिक' },
];

const galleryFeatured = [img1, img5, img9];
const galleryGrid     = [img3, img6, img7, img2, img4, img8];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function Index() {
  const [inq, setInq] = useState({
    studentName: '',
    email: '',
    grade: '',
    phone: '',
    message: '',
  });
  const [inqLoading, setInqLoading] = useState(false);
  const [inqSuccess, setInqSuccess] = useState(false);
  const [inqError, setInqError] = useState<string | null>(null);

  const onInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqError(null);
    setInqSuccess(false);
    if (!inq.studentName.trim() || !inq.email.trim() || !inq.grade || !inq.phone.trim()) {
      setInqError('कृपया नाव, ईमेल, इयत्ता आणि फोन भरा.');
      return;
    }
    const built = buildAdmissionEnquiryPayload({
      studentName: inq.studentName,
      dob: '',
      grade: inq.grade,
      gender: '',
      parentName: '',
      phone: inq.phone,
      email: inq.email,
      message: inq.message,
    });
    if ('error' in built) {
      setInqError(built.error);
      return;
    }
    setInqLoading(true);
    try {
      await submitEnquiry(built);
      setInqSuccess(true);
      setInq({ studentName: '', email: '', grade: '', phone: '', message: '' });
    } catch (err: unknown) {
      setInqError(err instanceof Error ? err.message : 'चौकशी पाठवता आली नाही.');
    } finally {
      setInqLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicNavbar />

      {/* ══════════════════════════════════════════════════════
          HERO — full-bleed with floating orbs + glass content
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden">
        {/* Background image — the hero photo, fairly visible */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="शाळेतील विद्यार्थी" className="w-full h-full object-cover scale-105" />
          {/* Cinematic vignette: dark edges, lighter center so photo shows through */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,27,75,0.45)_0%,_rgba(15,10,50,0.82)_100%)]" />
          {/* Bottom fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Soft dot texture */}
        <div className="absolute inset-0 dot-pattern opacity-20" />

        {/* ── Hero content ── */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>

            {/* Glass pill badge */}
            <motion.span
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass text-xs md:text-sm tracking-wide mb-8"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse flex-shrink-0" />
              {schoolConfig.heroBadgeMr}
            </motion.span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 drop-shadow-2xl">
              {schoolConfig.heroTitleBaseMr}<br />
              <span className="text-gradient">{schoolConfig.heroTitleAccentMr}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-2 font-medium">{schoolConfig.locationLineMr}</p>
            <p className="max-w-xl mx-auto text-sm md:text-base text-white/55 mb-12 leading-relaxed">
              {schoolConfig.heroSubtitleMr}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admissions">
                <Button size="lg"
                  className="px-8 gap-2 text-base bg-white text-primary hover:bg-blue-50 border-0 shadow-2xl font-bold transition-all duration-300 hover:scale-105 rounded-xl">
                  प्रवेशासाठी अर्ज करा <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg"
                  className="px-8 text-base font-semibold border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 rounded-xl">
                  पोर्टल लॉगिन
                </Button>
              </Link>
            </div>

          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 72L1440 72L1440 28C1080 72 720 8 360 28C180 38 90 18 0 28L0 72Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════
          PILLARS — glass-light cards on gradient bg
      ══════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/50 to-slate-50">
        {/* Subtle background orbs */}
        <div className="orb w-[400px] h-[400px] bg-indigo-200/40 top-[-100px] right-[-100px] animate-pulse-glow" />
        <div className="orb w-[300px] h-[300px] bg-violet-200/30 bottom-[-80px] left-[-60px] animate-float-medium" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="badge-pill">आमची विशेषता</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">आम्ही वेगळे का आहोत?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              प्रत्येक विद्यार्थ्याच्या उज्ज्वल भविष्यासाठी समर्पित — चार मूलभूत स्तंभांवर आधारित शिक्षण.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                className="glass-light rounded-2xl p-6 hover-lift group cursor-default relative overflow-hidden"
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                {/* Subtle gradient top stripe */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${p.accent}`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2 text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          CAMPUS PREVIEW
      ══════════════════════════ */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="orb w-[350px] h-[350px] bg-blue-100/60 top-0 right-0 animate-float-slow" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div>
              <span className="badge-pill">शाळा परिसर</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">आमचा परिसर</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-lg">
                आधुनिक सुविधा व निसर्गरम्य वातावरणात विद्यार्थ्यांचा सर्वांगीण विकास.
              </p>
            </div>
            <Link to="/campus">
              <Button variant="outline" className="gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold flex-shrink-0 rounded-xl">
                संपूर्ण परिसर पाहा <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[campus1, campus2, campus3].map((img, i) => (
              <Link to="/campus" key={i}>
                <motion.div
                  className="relative overflow-hidden rounded-2xl aspect-[4/3] group cursor-pointer hover-lift shadow-md"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                >
                  <img src={img} alt={`परिसर ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/75 via-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  {/* Glass overlay label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <div className="glass rounded-xl px-4 py-2.5 inline-flex items-center gap-2 text-white text-sm font-semibold">
                      परिसर पाहा <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          ACTIVITIES PREVIEW — dark glass bg
      ══════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Floating orbs */}
        <div className="orb w-[500px] h-[500px] bg-indigo-600/20 top-[-150px] left-[-100px] animate-float-slow" />
        <div className="orb w-[350px] h-[350px] bg-violet-500/15 bottom-[-100px] right-[-80px] animate-float-medium" style={{ animationDelay: '1.2s' }} />
        <div className="orb w-[200px] h-[200px] bg-blue-400/15 top-[40%] right-[15%] animate-drift" />
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-300 px-4 py-1.5 bg-white/10 rounded-full mb-3">उपक्रम</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">शालेय उपक्रम</h2>
              <p className="text-white/60 text-sm md:text-base max-w-lg">
                मुलांच्या सर्वांगीण विकासासाठी विविध शैक्षणिक, सांस्कृतिक व क्रीडा उपक्रम.
              </p>
            </div>
            <Link to="/activities">
              <Button className="gap-2 bg-white text-primary hover:bg-blue-50 font-semibold flex-shrink-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                सर्व उपक्रम पाहा <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {activityPreview.map((a, i) => (
              <Link to="/activities" key={a.title}>
                <motion.div
                  className="group rounded-2xl overflow-hidden glass hover-lift"
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div className="relative overflow-hidden h-48">
                    <img src={a.img} alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-xs font-semibold bg-indigo-500 text-white px-3 py-1 rounded-full shadow-md">
                      {a.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors duration-300">
                        <a.icon className="w-4 h-4 text-indigo-300" />
                      </div>
                      <h3 className="font-bold text-base text-white group-hover:text-indigo-200 transition-colors duration-200">{a.title}</h3>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed mb-3">{a.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 group-hover:gap-2 transition-all duration-200">
                      अधिक जाणून घ्या <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          PHOTO GALLERY
      ══════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50/30 relative overflow-hidden">
        <div className="orb w-[300px] h-[300px] bg-indigo-200/40 bottom-0 right-0 animate-float-slow" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="badge-pill">गॅलरी</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">शालेय फोटो गॅलरी</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              शाळेतील सुविधा, कार्यक्रम आणि आमचा जीवंत शैक्षणिक परिसर
            </p>
          </motion.div>

          {/* Featured row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {galleryFeatured.map((img, i) => (
              <motion.div key={i}
                className="relative overflow-hidden rounded-2xl aspect-[4/3] group cursor-pointer shadow-md hover-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <img src={img} alt={`शाळेचा फोटो ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl" />
              </motion.div>
            ))}
          </div>

          {/* Grid row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
            {galleryGrid.map((img, i) => (
              <motion.div key={i}
                className="relative overflow-hidden rounded-xl aspect-square group cursor-pointer hover-lift shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <img src={img} alt={`शाळेचा फोटो ${i + 4}`}
                  className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-indigo-800/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/activities">
              <Button variant="outline" size="lg"
                className="gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold rounded-xl">
                सर्व फोटो पाहा <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          INQUIRY FORM — gradient bg with glass form card
      ══════════════════════════ */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="orb w-[400px] h-[400px] bg-indigo-100/80 top-0 left-[-100px] animate-pulse-glow" />
        <div className="orb w-[250px] h-[250px] bg-violet-100/60 bottom-[-50px] right-[-50px] animate-float-medium" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Left */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
                <span className="badge-pill">संपर्क</span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">प्रवेश चौकशी</h2>
                <p className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed">
                  तुमच्या मुलाच्या उज्ज्वल भविष्यासाठी आज संपर्क साधा. आमचा प्रवेश सल्लागार लवकरच संपर्क करेल.
                </p>
                <div className="space-y-4">
                  {[
                    { Icon: Phone,  label: 'फोन',  value: schoolConfig.phoneDisplay, bg: 'bg-blue-50 text-blue-600' },
                    { Icon: Mail,   label: 'ईमेल', value: schoolConfig.emailGeneral, bg: 'bg-indigo-50 text-indigo-600' },
                    { Icon: MapPin, label: 'पत्ता', value: schoolConfig.locationLineMr, bg: 'bg-violet-50 text-violet-600' },
                  ].map(({ Icon, label, value, bg }) => (
                    <div key={label} className="flex items-center gap-4 group">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-medium text-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right — glass form card */}
              <motion.div
                className="glass-light rounded-2xl p-8 relative overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={1}
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-primary rounded-t-2xl" />
                <h3 className="font-bold text-lg mb-5 text-foreground">चौकशी अर्ज</h3>
                {inqSuccess && (
                  <p className="mb-4 text-sm text-green-700 bg-green-100 rounded-lg px-3 py-2 text-center">
                    चौकशी यशस्वीरीत्या पाठवली. लवकरच संपर्क करू.
                  </p>
                )}
                {inqError && (
                  <p className="mb-4 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center">
                    {inqError}
                  </p>
                )}
                <form className="space-y-4" onSubmit={onInquirySubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="विद्यार्थ्याचे पूर्ण नाव *"
                      className="h-11 rounded-xl"
                      value={inq.studentName}
                      onChange={(e) => setInq((p) => ({ ...p, studentName: e.target.value }))}
                    />
                    <Input
                      placeholder="email@example.com *"
                      type="email"
                      className="h-11 rounded-xl"
                      value={inq.email}
                      onChange={(e) => setInq((p) => ({ ...p, email: e.target.value }))}
                    />
                    <Select value={inq.grade} onValueChange={(val) => setInq((p) => ({ ...p, grade: val }))}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="इयत्ता निवडा *" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">इयत्ता १ ली</SelectItem>
                        <SelectItem value="2">इयत्ता २ री</SelectItem>
                        <SelectItem value="3">इयत्ता ३ री</SelectItem>
                        <SelectItem value="4">इयत्ता ४ थी</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="फोन (१० अंक) *"
                      type="tel"
                      className="h-11 rounded-xl"
                      value={inq.phone}
                      onChange={(e) => setInq((p) => ({ ...p, phone: e.target.value }))}
                      required
                      pattern="[0-9]{10}"
                    />
                  </div>
                  <Textarea
                    placeholder="अधिक माहिती किंवा प्रश्न..."
                    rows={4}
                    className="resize-none rounded-xl"
                    value={inq.message}
                    onChange={(e) => setInq((p) => ({ ...p, message: e.target.value }))}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
                    size="lg"
                    disabled={inqLoading}
                  >
                    {inqLoading ? 'पाठवत आहे...' : 'चौकशी पाठवा'} <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}