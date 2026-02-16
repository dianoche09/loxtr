import { motion } from 'framer-motion';
import {
    Rocket,
    Target,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    Globe,
    Cpu,
    Zap,
    BarChart3,
    Search,
    Mail,
    ChevronRight,
    Star
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import Logo from '../components/Logo';
import RadarDashboard from '../components/RadarDashboard';

export default function LoxRadarLanding() {
    const navigate = useNavigate();
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

    const t = {
        en: {
            title: "L.O.X AI Radar | Intelligence and Lead Discovery",
            description: "Step into the lead discovery engine of the LOXTR ecosystem. Identify global buyers and high-potential opportunities with AI-powered radar.",
            hero: {
                tag: "POWERED BY LOXTR ECOSYSTEM",
                headline: "THE WORLD'S MOST ADVANCED TRADE RADAR.",
                sub: "While LOXTR builds the global trade infrastructure, L.O.X AI Radar scans millions of data points to find your next major opportunity and verified leads.",
                cta: "Initiate Scan",
                alternative: "Partner Command"
            },
            features: [
                {
                    title: "Lead Discovery",
                    desc: "Our radar scans global trade flows and customs records to identify buyers who are actively sourcing your products right now.",
                    icon: <Target className="w-8 h-8 text-yellow" />
                },
                {
                    title: "Opportunities AI",
                    desc: "Identify market gaps and emerging trade patterns before they become mainstream. Intelligence that keeps you ahead.",
                    icon: <Zap className="w-8 h-8 text-yellow" />
                },
                {
                    title: "Execution Bridge",
                    desc: "Once specialized leads are discovered, leverage LOXTR's global infrastructure to fulfill and scale your international trade.",
                    icon: <Globe className="w-8 h-8 text-yellow" />
                }
            ],
            steps: [
                { title: "Define Search", icon: <Search /> },
                { title: "AI Analysis", icon: <Sparkles /> },
                { title: "Scale Up", icon: <Rocket className="w-5 h-5" /> }
            ],
            pricing: {
                headline: "TARGETED INTELLIGENCE",
                sub: "Advanced lead generation for global-first organizations."
            }
        },
        tr: {
            title: "L.O.X AI Radar | Akıllı İhracat ve Lead Keşfi",
            description: "LOXTR ekosisteminin lead keşif motoruna adım atın. Küresel alıcıları ve yüksek potansiyelli fırsatları yapay zeka destekli radarla belirleyin.",
            hero: {
                tag: "LOXTR EKOSİSTEMİ TARAFINDAN GÜÇLENDİRİLDİ",
                headline: "DÜNYANIN EN GELİŞMİŞ TİCARET RADARI.",
                sub: "LOXTR küresel ticaretin altyapısını kurarken, L.O.X AI Radar milyonlarca veri noktasını tarayarak bir sonraki büyük fırsatınızı ve doğrulanmış leads'lerinizi bulur.",
                cta: "Radarı Başlat",
                alternative: "Partner Girişi"
            },
            features: [
                {
                    title: "Lead Keşfi",
                    desc: "Radarımız küresel ticaret akışlarını ve gümrük kayıtlarını tarayarak ürünlerinizi aktif olarak arayan alıcıları anında tespit eder.",
                    icon: <Target className="w-8 h-8 text-yellow" />
                },
                {
                    title: "Fırsat Yapay Zekası",
                    desc: "Pazardaki boşlukları ve yeni ticaret rotalarını daha trend olmadan yakalayın. Sizi rakiplerinizin önüne geçiren istihbarat.",
                    icon: <Zap className="w-8 h-8 text-yellow" />
                },
                {
                    title: "Uygulama Köprüsü",
                    desc: "Doğru lead'ler bulunduğunda, ticareti gerçekleştirmek ve ölçeklemek için LOXTR'ın küresel operasyon altyapısını kullanın.",
                    icon: <Globe className="w-8 h-8 text-yellow" />
                }
            ],
            steps: [
                { title: "Arama Tanımla", icon: <Search /> },
                { title: "AI Analizi", icon: <Sparkles /> },
                { title: "Küresel Ölçek", icon: <Rocket className="w-5 h-5" /> }
            ],
            pricing: {
                headline: "HEDEF ODAKLI İSTİHBARAT",
                sub: "Küresel düşünen organizasyonlar için gelişmiş lead üretimi."
            }
        }
    };

    const content = t[lang];

    return (
        <div className="bg-white min-h-screen font-outfit">
            <SEO title={content.title} description={content.description} />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-[#0B0E14] text-white min-h-[95vh] flex items-center">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#facc151a_0%,_transparent_70%)] opacity-50" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-yellow/10 border border-yellow/20 text-yellow px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8"
                        >
                            <Sparkles className="w-3" />
                            {content.hero.tag}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-8xl font-black text-white leading-[0.9] mb-8 uppercase tracking-tighter"
                        >
                            {content.hero.headline.split(' ').map((word, i) => (
                                <span key={i} className={word === 'RADAR.' || word === 'RADARI.' ? 'text-yellow' : ''}>
                                    {word}{' '}
                                </span>
                            ))}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-white/50 mb-12 font-medium leading-relaxed max-w-2xl px-4"
                        >
                            {content.hero.sub}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-6"
                        >
                            <button
                                onClick={() => navigate('/radar-system')}
                                className="bg-yellow hover:bg-white text-navy font-black px-12 py-5 rounded-xl shadow-2xl shadow-yellow/20 transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
                            >
                                <span>{content.hero.cta}</span>
                                <Rocket className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => navigate('/login')}
                                className="text-white/40 hover:text-yellow font-black transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
                            >
                                <Target size={14} />
                                {content.hero.alternative}
                            </button>
                        </motion.div>
                    </div>

                    {/* Dashboard View - The REAL component */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="max-w-6xl mx-auto relative group"
                    >
                        <div className="absolute -top-20 inset-x-0 h-40 bg-gradient-to-b from-transparent to-[#0B0E14] z-10 pointer-events-none" />
                        <RadarDashboard />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none group-hover:ring-yellow/30 transition-all duration-700" />
                    </motion.div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-20 bg-off-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {content.features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-navy group-hover:text-yellow transition-all">
                                    <div className="scale-75">{feature.icon}</div>
                                </div>
                                <h3 className="text-xl font-black text-navy mb-3 uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#0a0a0c] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden border border-yellow/20 shadow-2xl"
                    >
                        {/* Background elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow/5 rounded-full blur-[120px] pointer-events-none" />
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9]">
                                JOIN THE <span className="text-yellow">LOX ECOSYSTEM</span>
                            </h2>
                            <p className="text-xl text-white/50 mb-12 font-medium leading-relaxed">
                                {lang === 'en'
                                    ? "Start your high-growth export journey with the intelligence layer used by premium Turkish exporters."
                                    : "Üst segment Türk ihracatçılarının kullandığı istihbarat katmanı ile yüksek büyüme odaklı ihracat yolculuğunuza başlayın."}
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-yellow hover:bg-white text-navy font-black px-12 py-5 rounded-full shadow-2xl shadow-yellow/20 transition-all flex items-center mx-auto gap-4 uppercase tracking-[0.2em] text-xs active:scale-95 group"
                            >
                                <span>{lang === 'en' ? 'Get Your Free Workspace' : 'Ücretsiz Çalışma Alanı Al'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Decoration */}
                        <div className="absolute bottom-0 left-0 w-full px-12 py-6 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">
                            <span>ENCRYPTED PROTOCOL // L.O.X AI</span>
                            <span>© 2026 LOXTR GLOBAL</span>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

// Helper icon component
function Send(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}
