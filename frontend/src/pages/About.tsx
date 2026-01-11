import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Globe2, Award, ArrowRight, TrendingUp } from 'lucide-react';
import SEO from '../components/seo/SEO';

const About = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

    const t = {
        en: {
            title: "About Us | LOXTR",
            desc: "Bridging markets, building futures. We are Turkey's premier export management and distribution partner.",
            hero: {
                title: "Bridging Markets, Building Futures.",
                subtitle: "LOXTR is the strategic link between Turkish manufacturing excellence and global demand. We don't just move goods; we engineer trade infrastructure."
            },
            stats: [
                { val: "2025", label: "Year Founded" },
                { val: "8", label: "Expert Partners" },
                { val: "12", label: "Focus Countries" },
                { val: "High", label: "Trade Potential" }
            ],
            vision: {
                title: "Our Vision",
                text: "To become the single most reliable digital gateway for B2B trade in the Eurasia region, eliminating borders through transparent, efficient, and technology-driven logistics."
            },
            values: [
                { title: "Transparency", desc: "Real-time tracking and open-book pricing.", icon: <Globe2 /> },
                { title: "Excellence", desc: "Zero-tolerance for quality compromise.", icon: <Award /> },
                { title: "Partnership", desc: "We grow only when our partners grow.", icon: <Users /> }
            ],
            history: {
                title: "Our Inception",
                items: [
                    { year: "2025 Q1", title: "Inception", desc: "LOXTR was founded to modernize B2B trade between Turkey and the world." },
                    { year: "2025 Q2", title: "Infrastructure", desc: "Established core network and digital platform architecture." },
                    { year: "2025 Q3", title: "Launch", desc: "Offically launched with a focus on 12 key industries." },
                    { year: "2025 Q4", title: "Growth", desc: "Expanding specialized partner network across Eurasia." }
                ]
            },
            cta: "Join Our Journey"
        },
        tr: {
            title: "Hakkımızda | LOXTR",
            desc: "Pazarları birleştiriyor, geleceği inşa ediyoruz. Türkiye'nin lider ihracat yönetim ortağı.",
            hero: {
                title: "Pazarları Birleştirir, Geleceği İnşa Eder.",
                subtitle: "LOXTR, Türk üretim gücü ile küresel talep arasındaki stratejik köprüdür. Sadece ürün taşımıyoruz; modern ticaretin altyapısını mühendislik yaklaşımıyla tasarlıyoruz."
            },
            stats: [
                { val: "2025", label: "Kuruluş Yılı" },
                { val: "8", label: "Stratejik Ortak" },
                { val: "12", label: "Odak Ülke" },
                { val: "Yüksek", label: "Ticaret Potansiyeli" }
            ],
            vision: {
                title: "Vizyonumuz",
                text: "Avrasya bölgesindeki B2B ticaretin en güvenilir dijital kapısı olmak; şeffaf, verimli ve teknoloji odaklı lojistik çözümleriyle ticari sınırları ortadan kaldırmak."
            },
            values: [
                { title: "Şeffaflık", desc: "Gerçek zamanlı takip ve açık maliyet yönetimi.", icon: <Globe2 /> },
                { title: "Mükemmeliyet", desc: "Kaliteden ödün vermeyen operasyon süreci.", icon: <Award /> },
                { title: "Ortaklık", desc: "Sadece iş ortaklarımız büyüdüğünde büyürüz.", icon: <Users /> }
            ],
            history: {
                title: "Kuruluşumuz",
                items: [
                    { year: "2025 Q1", title: "Kuruluş", desc: "LOXTR, Türkiye ve dünya arasındaki B2B ticareti modernize etmek için kuruldu." },
                    { year: "2025 Q2", title: "Altyapı", desc: "Çekirdek ağ ve dijital platform mimarisi oluşturuldu." },
                    { year: "2025 Q3", title: "Lansman", desc: "12 ana sektörde operasyonlarımıza resmi olarak başladık." },
                    { year: "2025 Q4", label: "Büyüme", desc: "Avrasya genelinde uzmanlaşmış ortak ağımızı genişletiyoruz." }
                ]
            },
            cta: "Yolculuğumuza Katılın"
        }
    }[lang];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-white min-h-screen">
            <SEO title={t.title} description={t.desc} />

            {/* HERO SECTION - Cinematic Parallax */}
            <section className="relative h-[85vh] flex items-center overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-[url('/images/about_hero_modern_trade.png')] bg-cover bg-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-yellow/20 text-yellow text-sm font-bold tracking-widest uppercase mb-4 border border-yellow/30">
                                {lang === 'en' ? 'Who We Are' : 'Biz Kimiz'}
                            </span>
                            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 text-white leading-[1.1]">
                                {t.hero.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/80 font-sans font-light leading-relaxed mb-10">
                                {t.hero.subtitle}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/${lang}/contact`)}
                                className="bg-yellow text-navy px-8 py-4 rounded-full font-bold flex items-center space-x-2 transition-all shadow-lg shadow-yellow/20"
                            >
                                <span>{t.cta}</span>
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION - Floating Glassmorphism Cards */}
            <section className="relative z-20 -mt-20 px-6">
                <div className="container mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {t.stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center text-center group transition-all hover:-translate-y-2 hover:border-yellow/50"
                            >
                                <div className="text-4xl md:text-5xl font-heading font-extrabold text-navy mb-3 group-hover:text-yellow transition-colors">
                                    {stat.val}
                                </div>
                                <div className="text-gray-500 font-sans font-medium uppercase tracking-widest text-xs">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* VISION & VALUES SECTION */}
            <section className="py-32 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-navy/5 rounded-full blur-3xl"></div>

                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                                <img
                                    src="/images/about_team_meeting_premium.png"
                                    alt="Professional Team Meeting"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2.5rem]"></div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-navy p-6 rounded-2xl shadow-xl hidden md:block max-w-[200px]">
                                <TrendingUp className="text-yellow w-8 h-8 mb-2" />
                                <div className="text-white text-sm font-medium">Global Network Growth</div>
                                <div className="text-yellow text-xs">+24% YoY</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2"
                        >
                            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-navy leading-tight">
                                {t.vision.title}
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-12 font-sans font-light">
                                {t.vision.text}
                            </p>

                            <div className="space-y-8">
                                {t.values.map((item, i) => (
                                    <div key={i} className="flex items-start space-x-6 group">
                                        <div className="flex-shrink-0 w-14 h-14 bg-off-white rounded-2xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-yellow transition-all shadow-sm">
                                            <div className="w-6 h-6 child-svg-w-full child-svg-h-full">
                                                {item.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-heading font-bold text-navy text-xl mb-2">{item.title}</h4>
                                            <p className="text-gray-500 font-sans leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* JOURNEY / HISTORY SECTION - Stepper Style */}
            <section className="py-32 bg-off-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-navy/[0.02] -skew-x-12"></div>

                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-6">{t.history.title}</h2>
                        <div className="h-1.5 w-20 bg-yellow mx-auto rounded-full"></div>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Vertical line for mobile, horizontal for desktop */}
                        <div className="absolute top-0 md:top-1/2 left-8 md:left-0 w-1 md:w-full h-full md:h-1 bg-gray-200 md:-translate-y-1/2 rounded-full"></div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                            {t.history.items.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex md:flex-col items-start md:items-center text-left md:text-center group"
                                >
                                    <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-white rounded-full border-4 border-off-white shadow-xl flex items-center justify-center mb-6 md:mb-8 group-hover:border-yellow transition-all">
                                        <div className="w-8 h-8 rounded-full bg-navy group-hover:bg-yellow transition-colors"></div>
                                    </div>
                                    <div className="ml-8 md:ml-0">
                                        <div className="text-2xl font-heading font-bold text-yellow mb-2">{item.year}</div>
                                        <h4 className="font-heading font-bold text-navy text-lg mb-3 tracking-tight">{item.title}</h4>
                                        <p className="text-gray-500 font-sans text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION - Premium Polish */}
            <section className="relative py-24 bg-navy overflow-hidden">
                {/* Decorative background patterns */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[140%] bg-yellow blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[140%] bg-blue-500 blur-[120px] rounded-full"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-10 leading-tight">
                            {lang === 'en' ? 'Ready to move forward?' : 'İleriye gitmeye hazır mısınız?'}
                        </h2>
                        <button
                            onClick={() => navigate(`/${lang}/contact`)}
                            className="group bg-white text-navy font-bold px-12 py-5 rounded-full hover:bg-yellow transition-all inline-flex items-center space-x-3 shadow-2xl"
                        >
                            <span className="text-lg">{t.cta}</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
