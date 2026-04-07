import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Trophy, Palette, FlaskConical, BookOpen, Users, GraduationCap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-school.jpg';
import img1 from '@/assets/1.jpeg';
import img2 from '@/assets/2.jpeg';
import img3 from '@/assets/3.jpeg';
import img4 from '@/assets/4.jpeg';
import img5 from '@/assets/5.jpeg';
import img6 from '@/assets/6.jpeg';
import img7 from '@/assets/7.jpeg';
import img8 from '@/assets/8.jpeg';
import img9 from '@/assets/9.jpeg';
import img10 from '@/assets/10.jpeg';
import img11 from '@/assets/11.jpeg';
import img12 from '@/assets/12.jpeg';

const stats = [
  { value: '१५:१', label: 'विद्यार्थी-शिक्षक प्रमाण', icon: Users },
  { value: '२०+', label: 'शालेय उपक्रम', icon: BookOpen },
  { value: '१००%', label: 'गुणवत्ता निकाल', icon: Star },
  { value: '५०००+', label: 'माजी विद्यार्थी', icon: GraduationCap },
];

const activities = [
  {
    icon: Trophy,
    title: 'क्रीडा आणि व्यायाम',
    desc: 'क्रिकेट, कबड्डी, खो-खो आणि विविध शारीरिक व्यायाम कार्यक्रमांचे आयोजन.',
  },
  {
    icon: Palette,
    title: 'कला आणि हस्तकला',
    desc: 'चित्रकला, हस्तकला आणि विविध सर्जनशीलता कार्यक्रमांद्वारे कलात्मकता विकसित करा.',
  },
  {
    icon: FlaskConical,
    title: 'विज्ञान आणि प्रयोग',
    desc: 'प्रयोगशाळा आणि विविध प्रकल्प उपक्रमांद्वारे विज्ञानातील कुतूहल जागृत करणे.',
  },
];

const galleryImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="शाळेतील विद्यार्थी" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs md:text-sm tracking-wide mb-6 border border-white/20">
              इयत्ता १ ली ते ४ थी • न्या. रानडे विद्याप्रसारक मंडळ संचालित, निफाड
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              वैनतेय प्राथमिक<br />विद्या मंदिर
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-2">निफाड, ता. निफाड, जि. नाशिक</p>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-white/70 mb-10 leading-relaxed">
              मुलांच्या सर्वांगीण विकासासाठी पोषक वातावरण आणि उच्च दर्जाचे प्राथमिक शिक्षण.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admissions">
                <Button size="lg" className="px-8 gap-2 text-base">
                  प्रवेशासाठी अर्ज करा <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white hover:text-foreground px-8 text-base backdrop-blur">
                  पोर्टल लॉगिन
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center p-6 rounded-xl bg-background border border-border/60"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <s.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="section-title">शालेय उपक्रम</h2>
            <p className="section-subtitle max-w-2xl mx-auto">मुलांच्या सर्वांगीण विकासासाठी विविध शैक्षणिक आणि सहशालेय उपक्रम.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {activities.map((a, i) => (
              <motion.div
                key={a.title}
                className="portal-card text-left hover:shadow-lg transition-all duration-300 group"
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <a.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 bg-secondary/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">शालेय फोटो गॅलरी</h2>
            <p className="text-muted-foreground text-sm">शाळेतील सुविधा, कार्यक्रम आणि शैक्षणिक वातावरण</p>
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="break-inside-avoid rounded-lg overflow-hidden group"
              >
                <img
                  src={img}
                  alt={`शाळेचा फोटो ${i + 1}`}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="portal-card p-8 md:p-10">
            <h2 className="section-title text-center">प्रवेश चौकशी</h2>
            <p className="section-subtitle text-center">तुमच्या मुलाच्या भविष्यासाठी आज संपर्क साधा</p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="विद्यार्थ्याचे पूर्ण नाव" className="h-11" />
                <Input placeholder="email@example.com" type="email" className="h-11" />
                <Select>
                  <SelectTrigger className="h-11"><SelectValue placeholder="इयत्ता निवडा" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">इयत्ता १ ली</SelectItem>
                    <SelectItem value="2">इयत्ता २ री</SelectItem>
                    <SelectItem value="3">इयत्ता ३ री</SelectItem>
                    <SelectItem value="4">इयत्ता ४ थी</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="+91 XXXXXXXXXX" type="tel" className="h-11" />
              </div>
              <Textarea placeholder="अधिक माहिती..." rows={4} />
              <Button className="w-full h-11" size="lg">चौकशी पाठवा <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </form>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}