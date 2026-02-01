import { motion } from 'framer-motion';
import { Target, ArrowRight, ShieldCheck, Globe, Zap, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RadarPromotionBanner({ lang }: { lang: 'en' | 'tr' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    const getVariant = () => {
        if (path.includes('cozumler') || path.includes('solutions')) return 'solutions';
        if (path.includes('sektorler') || path.includes('industries')) return 'industries';
        if (path.includes('about') || path.includes('partner') || path.includes('distribution')) return 'about';
        return 'default';
    };

    const variant = getVariant();

    const t = {
        tr: {
            default: {
                title: "KÜRESEL TİCARETİN KURALLARINI YENİDEN YAZIN",
                desc: "Yapay zeka radarımızla sınırları aşın, milyonlarca veriyi süzerek bir sonraki büyük fırsatınızı rakiplerinizden önce yakalayın.",
                cta: "RADARI BAŞLAT",
                secondary: "Ekibimizle Konuşun",
                icon: <Target className="w-6 h-6" />
            },
            solutions: {
                title: "SINIRLARI ORTADAN KALDIRAN OPERASYONEL GÜÇ",
                desc: "Uçtan uca dış ticaret yönetimini dijitalleştirin. Kağıt işlerini değil, büyümenizi yönetin.",
                cta: "GÜCÜ KEŞFET",
                secondary: "Hizmetlerimizi İnceleyin",
                icon: <Zap className="w-6 h-6" />
            },
            industries: {
                title: "SEKTÖRÜNÜZÜN YARININI BUGÜNDEN GÖRÜN",
                desc: "Tedarik zinciri değişimlerini ve alıcı davranışlarını anlık verilerle takip edin. Stratejinizi istihbaratla kurun.",
                cta: "VERİYE ERİŞ",
                secondary: "Sektörel Analiz Al",
                icon: <BarChart3 className="w-6 h-6" />
            },
            about: {
                title: "DIŞ TİCARETİN GELECEĞİNE HOŞ GELDİNİZ",
                desc: "LOX ekosistemi veri, teknoloji ve operasyonu tek bir çatı altında birleştirerek global ticareti demokratize ediyor.",
                cta: "EKOSİSTEME KATIL",
                secondary: "Vizyonumuzu Görün",
                icon: <Globe className="w-6 h-6" />
            }
        },
        en: {
            default: {
                title: "REWRITE THE RULES OF GLOBAL TRADE",
                desc: "Break through boundaries with our AI radar. Filter millions of data points to seize your next big opportunity before your competitors.",
                cta: "LAUNCH RADAR",
                secondary: "Talk to an Expert",
                icon: <Target className="w-6 h-6" />
            },
            solutions: {
                title: "OPERATIONAL POWER WITHOUT BORDERS",
                desc: "Digitalize your end-to-end foreign trade management. Manage your growth, not the paperwork.",
                cta: "DISCOVER THE POWER",
                secondary: "View Our Services",
                icon: <Zap className="w-6 h-6" />
            },
            industries: {
                title: "SEE YOUR INDUSTRY'S FUTURE TODAY",
                desc: "Track supply chain shifts and buyer behaviors with real-time data. Build your strategy on intelligence.",
                cta: "ACCESS DATA",
                secondary: "Get Sector Analysis",
                icon: <BarChart3 className="w-6 h-6" />
            },
            about: {
                title: "WELCOME TO THE FUTURE OF TRADE",
                desc: "The LOX ecosystem democratizes global trade by merging data, technology, and operations under one roof.",
                cta: "JOIN ECOSYSTEM",
                secondary: "Explore Our Vision",
                icon: <Globe className="w-6 h-6" />
            }
        }
    }[lang][variant];

    return (
        <section className="py-12 bg-[#050505] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-[#0a0a0c]/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-yellow/20 overflow-hidden"
                >
                    {/* Visual noise/patterns */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                    <div className="relative z-10 max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-12 h-12 bg-yellow/10 border border-yellow/20 rounded-xl flex items-center justify-center mx-auto mb-6 text-yellow"
                        >
                            {t.icon}
                        </motion.div>

                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter leading-[0.9]">
                            {t.title}
                        </h2>

                        <p className="text-base text-white/50 mb-8 max-w-xl mx-auto font-medium leading-relaxed">
                            {t.desc}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-yellow hover:bg-white text-navy font-black px-8 py-4 rounded-full transition-all uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-yellow/20 group active:scale-95"
                            >
                                <span>{t.cta}</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>


                        </div>
                    </div>

                    {/* Meta Info Bar - REMOVED */}
                </motion.div>
            </div>
        </section>
    );
}
