import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Trophy, Palette, FlaskConical, Users, BookOpen, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-school.jpg';
import campus1 from '@/assets/campus-1.jpg';
import campus2 from '@/assets/campus-2.jpg';
import campus3 from '@/assets/campus-3.jpg';

const stats = [
  { value: '१५:१', label: 'विद्यार्थी-शिक्षक प्रमाण' },
  { value: '२०+', label: 'उपक्रम' },
  { value: '१००%', label: 'गुणवत्ता निकाल' },
  { value: '५०००+', label: 'माजी विद्यार्थी' },
];

const activities = [
  {
    icon: Trophy,
    title: 'क्रीडा आणि व्यायाम (Sports)',
    desc: 'क्रिकेट, कबड्डी, खो-खो आणि विविध शारीरिक व्यायाम कार्यक्रमांचे सर्वसमावेशक आयोजन.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Palette,
    title: 'कला आणि हस्तकलाशीलता (Art)',
    desc: 'चित्रकला, हस्तकला आणि विविध सर्जनशीलता कार्यक्रमांद्वारे कलात्मकता विकसित करा.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: FlaskConical,
    title: 'विज्ञान आणि प्रयोग (Science)',
    desc: 'प्रयोगशाळा आणि विविध प्रकल्प उपक्रमांद्वारे विज्ञानातील कुतूहल जागृत करणे.',
    color: 'bg-warning/10 text-warning',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Index() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'var(--hero-gradient)' }}>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> इयत्ता १ ली ते ४ थी • प्रवेश सुरू
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4">
                जिथे <span className="text-primary">जिज्ञासा</span> आणि शोध याचा संगम होतो
              </h1>
              <p className="text-muted-foreground mb-8 max-w-lg text-base md:text-lg">
                आमच्या शाळेत मुलांच्या सर्वांगीण विकासासाठी पोषक वातावरण आणि उच्च दर्जाचे प्राथमिक शिक्षण दिले जाते.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/admissions">
                  <Button size="lg">प्रवेशासाठी अर्ज करा</Button>
                </Link>
                <Link to="/campus">
                  <Button variant="outline" size="lg">
                    अभ्यासक्रम पहा <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src={heroImage}
                alt="शाळेतील विद्यार्थी"
                className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="stat-card text-center"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title">शालेय उपक्रम</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            मुलांच्या सर्वांगीण विकासासाठी आमची विविध प्रकारची शैक्षणिक आणि सहशालेय उपक्रम प्रणाली.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {activities.map((a, i) => (
              <motion.div
                key={a.title}
                className="portal-card text-left hover:shadow-lg transition-shadow"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${a.color}`}>
                  <a.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Gallery */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">कॅम्पस गॅलरी</h2>
              <p className="text-muted-foreground text-sm">आमच्या शाळेतील सुविधा आणि शैक्षणिक वातावरण.</p>
            </div>
            <Link to="/campus">
              <Button variant="outline" size="sm">सर्व फोटो पहा</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[campus1, campus2, campus3].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl overflow-hidden aspect-[4/3]"
              >
                <img src={img} alt={`कॅम्पस ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="portal-card p-8 md:p-10">
            <h2 className="section-title text-center">प्रवेश चौकशी</h2>
            <p className="section-subtitle text-center">
              तुमच्या मुलाच्या भविष्यासाठी आज आमच्याशी संपर्क साधा.
            </p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="विद्यार्थ्याचे पूर्ण नाव" />
                <Input placeholder="email@example.com" type="email" />
                <Select>
                  <SelectTrigger><SelectValue placeholder="इयत्ता निवडा" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">इयत्ता १ ली</SelectItem>
                    <SelectItem value="2">इयत्ता २ री</SelectItem>
                    <SelectItem value="3">इयत्ता ३ री</SelectItem>
                    <SelectItem value="4">इयत्ता ४ थी</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="+91 XXXXXXXXXX" type="tel" />
              </div>
              <Textarea placeholder="तुमच्या मुलाविषयी अधिक माहिती..." rows={4} />
              <Button className="w-full" size="lg">चौकशी पाठवा</Button>
            </form>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
