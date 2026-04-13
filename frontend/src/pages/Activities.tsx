import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { motion } from 'framer-motion';
import { useState } from 'react';

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

type Category = 'सर्व' | 'शैक्षणिक' | 'सांस्कृतिक' | 'क्रीडा' | 'सहल';

const activities = [
  { img: img1, title: 'शालेय गटचर्चा', desc: 'विद्यार्थ्यांमध्ये संवाद व नेतृत्व कौशल्य विकास.', category: 'शैक्षणिक' as Category },
  { img: img2, title: 'वर्गातील शिक्षण', desc: 'आधुनिक पद्धतीने अध्यापन प्रक्रिया.', category: 'शैक्षणिक' as Category },
  { img: img3, title: 'सामूहिक उपक्रम', desc: 'विद्यार्थ्यांचा सहभाग आणि टीमवर्क.', category: 'शैक्षणिक' as Category },
  { img: img4, title: 'सांस्कृतिक कार्यक्रम', desc: 'राष्ट्रीय व पारंपरिक सण साजरे.', category: 'सांस्कृतिक' as Category },
  { img: img5, title: 'गट छायाचित्र', desc: 'विद्यार्थ्यांच्या आठवणी जपणारा क्षण.', category: 'सांस्कृतिक' as Category },
  { img: img6, title: 'लोकनृत्य सादरीकरण', desc: 'परंपरा आणि संस्कृतीचे जतन.', category: 'सांस्कृतिक' as Category },
  { img: img7, title: 'पारंपरिक वेशभूषा', desc: 'भारतीय संस्कृतीचे दर्शन.', category: 'सांस्कृतिक' as Category },
  { img: img8, title: 'क्रीडा स्पर्धा', desc: 'मैदानी खेळांमध्ये विद्यार्थ्यांचा उत्साह.', category: 'क्रीडा' as Category },
  { img: img9, title: 'कला प्रदर्शन', desc: 'विद्यार्थ्यांची सर्जनशीलता आणि कलागुण.', category: 'सांस्कृतिक' as Category },
  { img: img10, title: 'शैक्षणिक सहल', desc: 'बाह्य शिक्षणातून ज्ञानवृद्धी.', category: 'सहल' as Category },
  { img: img11, title: 'सभागृह कार्यक्रम', desc: 'शालेय मार्गदर्शन व प्रेरणादायी सत्र.', category: 'शैक्षणिक' as Category },
  { img: img12, title: 'ऐतिहासिक भेट', desc: 'इतिहासाची ओळख आणि वारसा जतन.', category: 'सहल' as Category },
];

const categories: Category[] = ['सर्व', 'शैक्षणिक', 'सांस्कृतिक', 'क्रीडा', 'सहल'];

const categoryColors: Record<Category, string> = {
  'सर्व': 'text-gray-600 bg-gray-100 border-gray-200',
  'शैक्षणिक': 'text-blue-600 bg-blue-50 border-blue-200',
  'सांस्कृतिक': 'text-purple-600 bg-purple-50 border-purple-200',
  'क्रीडा': 'text-green-600 bg-green-50 border-green-200',
  'सहल': 'text-orange-600 bg-orange-50 border-orange-200',
};

const categoryBadge: Record<Category, string> = {
  'सर्व': 'bg-gray-100 text-gray-600',
  'शैक्षणिक': 'bg-blue-100 text-blue-700',
  'सांस्कृतिक': 'bg-purple-100 text-purple-700',
  'क्रीडा': 'bg-green-100 text-green-700',
  'सहल': 'bg-orange-100 text-orange-700',
};

export default function Activities() {
  const [activeFilter, setActiveFilter] = useState<Category>('सर्व');

  const filtered = activeFilter === 'सर्व' ? activities : activities.filter(a => a.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* ─── Hero Banner ─── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-primary to-indigo-800">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 50L1440 50L1440 10C1200 50 960 0 720 15C480 30 240 0 0 15L0 50Z" fill="hsl(var(--background))" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center text-white max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-widest mb-6 border border-white/20">
              फोटो गॅलरी
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              शालेय <span className="text-blue-200">उपक्रम</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg">
              विद्यार्थ्यांच्या सर्वांगीण विकासासाठी आयोजित विविध उपक्रमांची झलक.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">

        {/* ─── Filter Bar ─── */}
        <motion.div
          className="flex flex-wrap gap-2 mb-10 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 hover:scale-105 ${
                activeFilter === cat
                  ? `${categoryColors[cat]} shadow-sm scale-105`
                  : 'text-muted-foreground bg-background border-border hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ─── Activity Count ─── */}
        <div className="text-center mb-8">
          <span className="text-sm text-muted-foreground">
            {filtered.length} उपक्रम सापडले
          </span>
        </div>

        {/* ─── Activities Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((a, i) => (
            <motion.div
              key={`${a.title}-${i}`}
              layout
              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={a.img}
                  alt={a.title}
                  className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-600"
                  loading="lazy"
                />
                {/* Category badge */}
                <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${categoryBadge[a.category]} shadow`}>
                  {a.category}
                </span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors duration-200">{a.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Empty state ─── */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-muted-foreground">या श्रेणीत कोणताही उपक्रम आढळला नाही.</p>
          </div>
        )}

      </section>

      <PublicFooter />
    </div>
  );
}