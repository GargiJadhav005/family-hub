import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { schoolConfig } from '@/config/school';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import campus1 from '@/assets/campus-1.jpeg';
import campus2 from '@/assets/campus-2.jpeg';
import campus3 from '@/assets/campus-3.jpeg';
import img1 from '@/assets/1.jpeg';
import img2 from '@/assets/2.jpeg';
import img3 from '@/assets/3.jpeg';
import img5 from '@/assets/5.jpeg';
import img7 from '@/assets/7.jpeg';
import img9 from '@/assets/9.jpeg';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const photos = [campus1, img1, campus2, img2, campus3, img3, img5, img7, img9];

export default function About() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicNavbar />

      {/* ══════════════════════════════════════════
          HERO — split: text left, floating photo collage right
      ════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Orbs */}
        <div className="orb w-[600px] h-[600px] bg-indigo-600/20 top-[-180px] left-[-150px] animate-float-slow" />
        <div className="orb w-[400px] h-[400px] bg-violet-500/15 bottom-[-120px] right-[-80px] animate-float-medium" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 dot-pattern opacity-25" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

        <div className="container mx-auto px-4 relative z-10 py-24 md:py-28">
          <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Left */}
            <motion.div
              className="text-white"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-semibold uppercase tracking-widest mb-6">
                आमच्याबद्दल
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.12] mb-6">
                {schoolConfig.heroTitleBaseMr}<br />
                <span className="text-gradient">{schoolConfig.heroTitleAccentMr}</span>
              </h1>

              <p className="text-white/65 text-base md:text-lg leading-relaxed mb-8 max-w-md">
                {schoolConfig.trusteeLineMr} — {schoolConfig.taglineMr} येथे इयत्ता १ ली
                ते ४ थी साठी मराठी माध्यमातून दर्जेदार प्राथमिक शिक्षण.
              </p>

              {/* 4 quick value chips in 2×2 */}
              <div className="grid grid-cols-2 gap-3 mb-10 max-w-sm">
                {[
                  { n: 'मराठी माध्यम',   s: 'राज्य अभ्यासक्रम' },
                  { n: 'इयत्ता १ ते ४',  s: 'प्राथमिक शिक्षण' },
                  { n: 'सुरक्षित परिसर', s: 'पोषक वातावरण' },
                  { n: 'अनुभवी शिक्षक',  s: 'वैयक्तिक लक्ष' },
                ].map(({ n, s }) => (
                  <div key={n} className="glass rounded-xl px-4 py-3">
                    <p className="text-white font-bold text-sm leading-none mb-0.5">{n}</p>
                    <p className="text-white/50 text-xs">{s}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/admissions">
                  <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-bold gap-2 shadow-xl border-0 hover:scale-105 transition-all duration-300 rounded-xl">
                    प्रवेश घ्या <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/campus">
                  <Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/15 rounded-xl backdrop-blur-sm transition-all duration-300">
                    परिसर पाहा
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right — staggered photo collage */}
            <motion.div
              className="relative hidden md:block h-[420px]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Main photo */}
              <div className="absolute top-0 left-8 w-[68%] h-[75%] rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl shadow-black/50">
                <img src={campus1} alt="परिसर" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 to-transparent" />
              </div>
              {/* Secondary — overlapping bottom right */}
              <div className="absolute bottom-0 right-0 w-[52%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/15 shadow-xl shadow-black/40">
                <img src={img1} alt="विद्यार्थी" className="w-full h-full object-cover" />
              </div>
              {/* Tertiary — small top right, floating */}
              <motion.div
                className="absolute top-[-20px] right-[8%] w-[30%] h-[38%] rounded-xl overflow-hidden border-2 border-white/20 shadow-lg"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={img3} alt="उपक्रम" className="w-full h-full object-cover" />
              </motion.div>

              {/* Glass badge */}
              <div className="absolute top-5 left-5 glass rounded-xl px-3 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-semibold">{schoolConfig.taglineMr}</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHOTO MOSAIC — let photos speak
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0}
          >
            <span className="badge-pill">आमची शाळा</span>
            <h2 className="text-3xl md:text-4xl font-extrabold">एक नजर आमच्या परिसरावर</h2>
          </motion.div>

          {/* Asymmetric mosaic grid */}
          <div className="grid grid-cols-3 grid-rows-2 gap-3 h-[480px] md:h-[560px]">
            {/* Large — spans 2 rows */}
            <motion.div
              className="row-span-2 rounded-2xl overflow-hidden group hover-lift shadow-md"
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <img src={campus2} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </motion.div>
            {/* Top-center */}
            <motion.div
              className="rounded-2xl overflow-hidden group hover-lift shadow-md"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }}
            >
              <img src={img2} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </motion.div>
            {/* Top-right */}
            <motion.div
              className="rounded-2xl overflow-hidden group hover-lift shadow-md"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.5 }}
            >
              <img src={campus3} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </motion.div>
            {/* Bottom-center */}
            <motion.div
              className="rounded-2xl overflow-hidden group hover-lift shadow-md"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img src={img5} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </motion.div>
            {/* Bottom-right */}
            <motion.div
              className="rounded-2xl overflow-hidden group hover-lift shadow-md"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.5 }}
            >
              <img src={img9} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3 VALUE PILLARS — big, bold, minimal
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50/40 relative overflow-hidden">
        <div className="orb w-[350px] h-[350px] bg-indigo-100/70 top-[-80px] right-[-60px] animate-float-slow" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                num: '०१',
                title: 'दर्जेदार शिक्षण',
                body: 'राज्य अभ्यासक्रमानुसार, आधुनिक पद्धतीने, प्रत्येक मुलाच्या क्षमतेनुसार शिक्षण.',
                grad: 'from-blue-600 to-indigo-600',
              },
              {
                num: '०२',
                title: 'सर्वांगीण विकास',
                body: 'क्रीडा, कला, विज्ञान — शैक्षणिकासोबतच चौफेर विकासावर भर.',
                grad: 'from-violet-600 to-purple-600',
              },
              {
                num: '०३',
                title: 'पालक-शाळा संवाद',
                body: 'डिजिटल पोर्टलद्वारे पालकांशी सतत संपर्क आणि पारदर्शकता.',
                grad: 'from-emerald-500 to-teal-600',
              },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                className="glass-light rounded-2xl p-7 relative overflow-hidden hover-lift"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.grad}`} />
                <span className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br ${item.grad} mb-4 block`}>
                  {item.num}
                </span>
                <h3 className="font-extrabold text-xl mb-3 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAP + CONTACT — side by side
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0}
          >
            <span className="badge-pill">संपर्क</span>
            <h2 className="text-3xl md:text-4xl font-extrabold">आम्ही कुठे आहोत</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
            {/* Contact cards */}
            <motion.div
              className="space-y-3"
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={0}
            >
              {[
                { Icon: MapPin, c: 'text-indigo-600 bg-indigo-50', v: schoolConfig.fullAddressMr, k: 'addr' },
                { Icon: Phone,  c: 'text-emerald-600 bg-emerald-50', v: schoolConfig.phoneDisplay, k: 'phone' },
                { Icon: Mail,   c: 'text-violet-600 bg-violet-50',  v: schoolConfig.emailGeneral, k: 'mail' },
              ].map(({ Icon, c, v, k }) => (
                <div key={k} className="flex gap-4 glass-light rounded-2xl p-4 hover:shadow-md transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl ${c} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug whitespace-pre-line">{v}</p>
                </div>
              ))}

              {/* Quick CTA */}
              <Link to="/admissions" className="block mt-2">
                <Button className="w-full gap-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  प्रवेशासाठी अर्ज करा <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Map embed */}
            <motion.div
              className="md:col-span-2 rounded-2xl overflow-hidden border border-border shadow-md"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <iframe
                src={schoolConfig.mapEmbedUrl}
                width="100%"
                height="360"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${schoolConfig.displayNameMr} — ${schoolConfig.taglineMr}`}
              />
              <div className="bg-card px-5 py-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  {schoolConfig.mapCaptionMr}
                </div>
                <a href={schoolConfig.mapExternalUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
