import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { motion } from 'framer-motion';

// Import 12 images
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

const activities = [
  { img: img1, title: "शालेय गटचर्चा", desc: "विद्यार्थ्यांमध्ये संवाद व नेतृत्व कौशल्य विकास." },
  { img: img2, title: "वर्गातील शिक्षण", desc: "आधुनिक पद्धतीने अध्यापन प्रक्रिया." },
  { img: img3, title: "सामूहिक उपक्रम", desc: "विद्यार्थ्यांचा सहभाग आणि टीमवर्क." },
  { img: img4, title: "सांस्कृतिक कार्यक्रम", desc: "राष्ट्रीय व पारंपरिक सण साजरे." },
  { img: img5, title: "गट छायाचित्र", desc: "विद्यार्थ्यांच्या आठवणी जपणारा क्षण." },
  { img: img6, title: "लोकनृत्य सादरीकरण", desc: "परंपरा आणि संस्कृतीचे जतन." },
  { img: img7, title: "पारंपरिक वेशभूषा", desc: "भारतीय संस्कृतीचे दर्शन." },
  { img: img8, title: "क्रीडा स्पर्धा", desc: "मैदानी खेळांमध्ये विद्यार्थ्यांचा उत्साह." },
  { img: img9, title: "कला प्रदर्शन", desc: "विद्यार्थ्यांची सर्जनशीलता आणि कलागुण." },
  { img: img10, title: "शैक्षणिक सहल", desc: "बाह्य शिक्षणातून ज्ञानवृद्धी." },
  { img: img11, title: "सभागृह कार्यक्रम", desc: "शालेय मार्गदर्शन व प्रेरणादायी सत्र." },
  { img: img12, title: "ऐतिहासिक भेट", desc: "इतिहासाची ओळख आणि वारसा जतन." },
];

export default function Activities() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section className="container mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            शालेय <span className="text-primary">उपक्रम</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            विद्यार्थ्यांच्या सर्वांगीण विकासासाठी आयोजित विविध उपक्रमांची झलक.
          </p>
        </motion.div>

        {/* 12 Image Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

          {activities.map((a, i) => (
            <motion.div
              key={i}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={a.img}
                  alt={a.title}
                  className="w-full h-56 object-cover hover:scale-110 transition duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">
                  {a.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a.desc}
                </p>
              </div>
            </motion.div>
          ))}

        </div>

      </section>

      <PublicFooter />
    </div>
  );
}