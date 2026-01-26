import { useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Box, TrendingUp, Wallet, Globe, Activity, Info, ArrowRight } from 'lucide-react';
import SEO from '../components/seo/SEO';
import { CONFIG } from '../siteConfig';
import ContactModal from '../components/ContactModal';

const IndustryDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Find Industry
    // Use ANY casting safely because we know siteConfig has complex localized objects
    const industry = CONFIG.industries.find(i => i.slug === slug) as any;

    if (!industry) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Loading...</div>;

    // Helpers
    const localizedName = industry.name[lang] || industry.name;
    const desc = industry.description[lang];
    const products = industry.products[lang] || [];
    const analysis = industry.marketAnalysis ? industry.marketAnalysis[lang] : null;
    const trade = industry.tradeData || { hsCodes: [], topExportDestinations: [], topImportOrigins: [], didYouKnow: { en: '', tr: '' } };

    // --- TEXT CONTENT ---
    const t = {
        back: lang === 'en' ? "Back to Sectors" : "Sektörlere Dön",
        heroTag: lang === 'en' ? "Market Intelligence" : "İhracat Analizi",
        insightTitle: analysis ? analysis.title : "Market Overview",
        insightDesc: analysis ? analysis.desc : "",
        hsTitle: lang === 'en' ? "Top Traded HS Codes" : "En Çok İhraç Edilen GTİP Kodları",
        mapTitle: lang === 'en' ? (lang === 'en' ? "Turkey's Import Landscape" : "Global İhracat Rotalarımız") : "Global İhracat Rotalarımız",
        mapTitleReal: lang === 'en' ? "Turkey's Import Partners (Competitors)" : "İhracat Rotalarımız & Hedef Pazarlar",
        mapListTitle: lang === 'en' ? "Top Origins" : "En Çok İhracat Yapılan 5 Ülke",
        mapData: lang === 'en' ? trade.topImportOrigins : trade.topExportDestinations,
        didYouKnowTitle: lang === 'en' ? "Did You Know?" : "Biliyor Muydunuz?",
        didYouKnowText: trade.didYouKnow?.[lang] || "",
        productsTitle: lang === 'en' ? "Key Product Categories" : "Öne Çıkan Ürün Grupları",
        ctaFloat: lang === 'en' ? "Partner with Us" : "Partner Ol"
    };

    const statsToDisplay = analysis ? analysis.stats : [];

    return (
        <div className="bg-navy min-h-screen text-white pt-20 pb-32 relative">
            <SEO title={`${localizedName} | LOXTR`} description={desc} />

            {/* STICKY CTA BUTTON */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 z-50 bg-yellow text-navy font-bold px-6 py-4 rounded-full shadow-xl shadow-yellow/20 flex items-center space-x-3 hover:bg-white transition-colors border-2 border-transparent hover:border-yellow"
            >
                <Wallet className="w-6 h-6" />
                <span className="text-lg uppercase tracking-wide">{t.ctaFloat}</span>
            </motion.button>

            <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} industryName={localizedName} lang={lang} />

            {/* HERO SECTION */}
            <section className="relative h-[65vh] flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    <img src={industry.heroImage} alt={localizedName} className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <button onClick={() => navigate(`/${lang}/industries`)} className="flex items-center space-x-2 text-white/50 hover:text-yellow mb-6 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>{t.back}</span>
                        </button>
                        <div className="inline-flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-yellow">{industry.icon}</div>
                            <span className="text-yellow font-bold tracking-widest uppercase text-xs bg-yellow/10 px-2 py-1 rounded border border-yellow/20">{t.heroTag}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">{localizedName}</h1>
                        <p className="text-xl text-white/70 font-light leading-relaxed max-w-xl">{desc}</p>
                    </div>

                    {/* RIGHT SIDE: STATS CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden lg:block bg-charcoal/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5"><Activity className="w-40 h-40 text-yellow" /></div>
                        <h3 className="text-yellow text-xl font-bold mb-6 flex items-center">
                            <Info className="w-5 h-5 mr-2" />
                            {t.didYouKnowTitle}
                        </h3>
                        <p className="text-white text-2xl font-heading leading-tight mb-8">
                            "{t.didYouKnowText}"
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                            {statsToDisplay.map((stat: any, i: number) => (
                                <div key={i}>
                                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-xs uppercase tracking-widest text-white/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CONTENT START */}
            <div className="container mx-auto px-6 pt-16">

                {/* 1. MARKET ANALYSIS & PRODUCTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-heading font-bold mb-6 flex items-center">
                            <TrendingUp className="w-8 h-8 text-yellow mr-3" />
                            {t.insightTitle}
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed mb-8 border-l-4 border-yellow pl-6">
                            {t.insightDesc}
                        </p>

                        <h3 className="text-xl font-bold mb-4 mt-12 text-white/90">{t.productsTitle}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {products.map((p: string, i: number) => (
                                <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/5 flex items-center space-x-3">
                                    <div className="w-1.5 h-1.5 bg-yellow rounded-full" />
                                    <span className="text-sm text-white/80">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-navy-light p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-bold mb-4 text-white/90 flex items-center">
                                <Box className="w-5 h-5 text-yellow mr-2" />
                                {t.hsTitle}
                            </h3>
                            <ul className="space-y-3">
                                {trade.hsCodes.map((code: string, i: number) => (
                                    <li key={i} className="flex items-center justify-between p-3 bg-navy rounded border border-white/5">
                                        <span className="font-mono text-yellow text-sm">{code}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 2. GLOBAL TRADE MAP SECTION */}
                <section className="bg-charcoal rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
                    {/* Background Globe Decor */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none">
                        <Globe className="w-[800px] h-[800px] text-white" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                        {/* Left: Data List */}
                        <div>
                            <div className="inline-block px-3 py-1 rounded-full bg-yellow/10 border border-yellow/20 text-yellow text-xs font-bold mb-4 tracking-widest uppercase">
                                {lang === 'en' ? "Market Intelligence" : "Pazar İstihbaratı"}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                                {t.mapTitleReal}
                            </h2>
                            <p className="text-white/60 mb-10 text-lg">
                                {lang === 'en'
                                    ? "Based on 2024-2025 customs data, these are the key players in the market. LOXTR helps you navigate this landscape."
                                    : "2024 son çeyrek gümrük verilerine göre, sektördeki en aktif pazarlar. Gümrük duvarlarını LOXTR ile aşın."}
                            </p>

                            <h4 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">{t.mapListTitle}</h4>
                            <div className="space-y-4">
                                {t.mapData.map((country: string, i: number) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-4">
                                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50 group-hover:bg-yellow group-hover:text-navy transition-colors">
                                                {i + 1}
                                            </span>
                                            <span className="text-xl text-white group-hover:text-yellow transition-colors">{country}</span>
                                        </div>
                                        <div className="w-1/3 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${100 - (i * 15)}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className="h-full bg-yellow"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Abstract Map Visualization */}
                        <div className="hidden lg:flex items-center justify-center relative">
                            {/* Central Node (Turkey) */}
                            <div className="relative z-20">
                                <div className="w-6 h-6 bg-red-600 rounded-full animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.6)]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-red-500/20 rounded-full animate-ping" />
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-bold tracking-widest text-xs">TURKEY</div>
                            </div>

                            {/* Connecting Nodes (Partners) */}
                            {t.mapData.map((_: any, i: number) => {
                                const angle = (i * (360 / 5)) * (Math.PI / 180);
                                const radius = 200;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <Fragment key={i}>
                                        {/* Line */}
                                        <motion.div
                                            initial={{ opacity: 0, scaleX: 0 }}
                                            whileInView={{ opacity: 1, scaleX: 1 }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                width: `${radius}px`,
                                                height: '1px',
                                                background: 'linear-gradient(90deg, rgba(220,38,38,0.5) 0%, rgba(250,204,21,0.5) 100%)',
                                                transformOrigin: 'left center',
                                                transform: `translate(-50%, -50%) rotate(${i * (360 / 5)}deg) translateX(50%)`
                                            }}
                                        />
                                        {/* Node */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + (i * 0.1) }}
                                            style={{
                                                position: 'absolute',
                                                transform: `translate(${x}px, ${y}px)`
                                            }}
                                        >
                                            <div className="w-3 h-3 bg-yellow rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                                        </motion.div>
                                    </Fragment>
                                );
                            })}
                        </div>
                    </div>
                </section>

            </div>

            {/* NEW BANNER: PARTNERSHIP */}
            <section className="py-24 bg-white text-navy mt-24">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 !text-navy">
                        {lang === 'en' ? "Ready to Enter Turkish Market?" : "Türkiye Pazarına Girmeye Hazır mısınız?"}
                    </h2>
                    <p className="text-xl text-navy/60 mb-10 max-w-2xl mx-auto">
                        {lang === 'en' ? "Get a free distribution capacity assessment" : "Ücretsiz dağıtım kapasitesi değerlendirmesi alın"}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-navy text-white font-bold px-12 py-5 rounded-lg hover:bg-yellow hover:text-navy transition-all inline-flex items-center space-x-3 shadow-xl"
                    >
                        <span className="text-lg">{lang === 'en' ? "Request Assessment" : "Değerlendirme Talep Et"}</span>
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default IndustryDetail;
