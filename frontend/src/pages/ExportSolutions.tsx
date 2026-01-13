import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, ShieldCheck, Truck, CreditCard, Container } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/seo/SEO';

const ExportSolutions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

    // REDIRECT LOGIC: This page is TR (Export) only. 
    // If user switches to EN, redirect to the corresponding Import page (Distribution).
    useEffect(() => {
        if (lang === 'en') {
            navigate('/en/distribution', { replace: true });
        }
    }, [lang, navigate]);

    // Content is strictly Turkish because of the redirect above.
    // However, keeping structure extensible just in case.
    const t = {
        title: "İhracat Çözümleri | LOXTR",
        desc: "İhracatın tüm süreçlerini profesyonelce yönetiyoruz.",
        hero: {
            tag: "TÜRK ÜRETİCİLERİ İÇİN",
            headline: "KÜRESEL PAZARLARA AÇILAN KAPINIZ.",
            subheadline: "Ürünlerinizin dünya ile buluşma noktası. Pazar analizinden gümrük operasyonlarına kadar, ihracatın tüm zorlu süreçlerini sizin adınıza profesyonelce yönetiyoruz. Siz üretin, biz dünyaya ulaştıralım.",
            cta: "Hemen Başvur"
        },
        process: {
            headline: "İHRACAT YÖNETİM SÜRECİ",
            steps: [
                {
                    title: "Veri Odaklı Pazar Analizi",
                    desc: "Ürününüz için en yüksek potansiyele sahip hedef ülkeleri gerçek gümrük verileriyle tespit ediyoruz.",
                    icon: <Globe className="w-8 h-8 text-yellow" />
                },
                {
                    title: "Küresel Mevzuat Uyumu",
                    desc: "Hedef ülkenin gümrük mevzuatına, sertifikasyonlarına ve teknik gerekliliklerine tam uyum sağlıyoruz.",
                    icon: <ShieldCheck className="w-8 h-8 text-yellow" />
                },
                {
                    title: "Entegre Lojistik",
                    desc: "Fabrikanızdan alıcının deposuna kadar olan tüm nakliye ve gümrükleme süreçlerini optimize ediyoruz.",
                    icon: <Truck className="w-8 h-8 text-yellow" />
                },
                {
                    title: "Finansal Güvence",
                    desc: "İhracat bedelleriniz LOXTR güvencesi altındadır. Tahsilat riskini minimize eden güvenli ödeme altyapısı.",
                    icon: <CreditCard className="w-8 h-8 text-yellow" />
                }
            ]
        },
        ctaBox: {
            headline: "DÜNYAYA AÇILMAYA HAZIR MISINIZ?",
            sub: "Riskleri minimize edin, kârlılığınızı maksimize edin.",
            btn: "BİZE ULAŞIN"
        }
    };

    return (
        <div className="bg-navy min-h-screen text-white pt-20">
            <SEO title={t.title} description={t.desc} />

            {/* HERO */}
            <section className="relative h-[75vh] flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    {/* Visual Fallback */}
                    <div className="w-full h-full bg-gradient-to-r from-navy to-charcoal relative">
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <Container className="w-96 h-96 text-white" />
                        </div>
                    </div>

                    {/* Real Image (if available) */}
                    <img
                        src="/images/industries_hero.webp"
                        alt="Global Trade"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-block bg-yellow/10 border border-yellow/20 text-yellow px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest mb-8">
                            {t.hero.tag}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 leading-tight">
                            {t.hero.headline}
                        </h1>
                        <p className="text-xl text-white/70 mb-10 font-light leading-relaxed max-w-2xl border-l-4 border-yellow pl-6">
                            {t.hero.subheadline}
                        </p>
                        <button
                            onClick={() => navigate(`/tr/partner`)}
                            className="bg-yellow hover:bg-yellow/90 text-navy font-bold px-10 py-4 rounded focus:outline-none flex items-center space-x-3 transition-all uppercase tracking-wide shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)]"
                        >
                            <span>{t.hero.cta}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* PROCESS TIMELINE */}
            <section className="py-24 bg-charcoal border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 tracking-wide">{t.process.headline}</h2>
                        <div className="h-1.5 w-24 bg-yellow mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                        {/* Connecting Line (Desktop Only) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-white/10 z-0"></div>

                        {t.process.steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="relative z-10 bg-navy p-8 rounded-2xl border border-white/5 text-center group hover:border-yellow/50 transition-all hover:-translate-y-2 shadow-xl"
                            >
                                <div className="w-20 h-20 bg-charcoal rounded-full border-4 border-navy flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.5)] relative">
                                    <div className="absolute inset-0 rounded-full border border-white/10"></div>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-yellow transition-colors uppercase">{step.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA STRIP (Redesigned) */}
            <section className="bg-yellow py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern_grid.png')] opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-4xl font-heading font-bold mb-4 text-navy uppercase tracking-tight">{t.ctaBox.headline}</h2>
                    <p className="text-navy/70 mb-10 max-w-2xl mx-auto text-lg font-medium">{t.ctaBox.sub}</p>
                    <button
                        onClick={() => navigate(`/tr/partner`)}
                        className="bg-navy text-white font-bold px-10 py-4 rounded hover:bg-navy/90 transition-all shadow-xl uppercase tracking-widest flex items-center mx-auto space-x-3"
                    >
                        <span>{t.ctaBox.btn}</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ExportSolutions;
