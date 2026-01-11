import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { CONFIG } from '../siteConfig';
import ContactModal from '../components/ContactModal';

const Industries = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const t = {
        title: lang === 'en' ? "Discover & Explore Industries" : "Sektörleri Keşfet",
        description: lang === 'en' ?
            "Explore Turkey's key industries for market entry. We help you establish manufacturing, find distributors, and scale in the Turkish market." :
            "Türk üreticiler için global pazar fırsatları. Ürünlerinizi 12 ana sektörde dünya pazarlarına taşıyoruz.",
        explore: lang === 'en' ? "Explore" : "İncele",
        whyTurkey: {
            title: lang === 'en' ? "Why Enter Turkey?" : "Neden LOXTR?",
            items: [
                {
                    title: lang === 'en' ? "Strategic Location" : "GLOBAL AĞ",
                    desc: lang === 'en' ? "Gateway to Europe, Middle East, and Central Asia markets." : "Avrupa, Orta Doğu ve Orta Asya pazarlarına doğrudan erişim."
                },
                {
                    title: lang === 'en' ? "Growing Market" : "PAZAR UZMANLIĞI",
                    desc: lang === 'en' ? "85M+ consumers with rising purchasing power." : "Her sektör için özelleşmiş ihracat stratejileri ve pazar analizi."
                },
                {
                    title: lang === 'en' ? "Manufacturing Hub" : "UÇTAN UCA HİZMET",
                    desc: lang === 'en' ? "Established supply chains and skilled workforce." : "Lojistik, gümrük, tahsilat garantisi - tüm süreç bizde."
                }
            ]
        }
    };

    return (
        <div className="bg-navy min-h-screen text-white pt-20">
            <SEO
                title={lang === 'en' ? "Industries | LOXTR" : "Sektörler | LOXTR"}
                description={t.description}
            />

            {/* 1. HERO SECTION */}
            <section className="relative py-24 px-6 overflow-hidden pt-32">
                <div className="absolute inset-0 bg-[url('/images/industries_hero.webp')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy"></div>
                <div className="container mx-auto relative z-10 text-center max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white uppercase"
                    >
                        {lang === 'en' ? "Industrial Excellence" : "ENDÜSTRİYEL MÜKEMMELİYET"} <br />
                        <span className="text-yellow">{lang === 'en' ? "Across 12 Key Sectors" : "12 ANA SEKTÖRDE"}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/70 font-light"
                    >
                        {t.description}
                    </motion.p>
                </div>
            </section>

            {/* 2. INDUSTRY GRID */}
            <section className="container mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {CONFIG.industries.map((item, i) => {
                        const productList = (item.products as any)[lang] || [];
                        const industryName = (item.name as any)[lang] || item.name;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -5, borderColor: '#facc15' }}
                                className="bg-charcoal border border-white/10 rounded-xl p-6 group cursor-pointer transition-all duration-300 shadow-xl"
                                onClick={() => navigate(`/${lang}/industries/${item.slug}`)}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-navy rounded-lg text-yellow group-hover:bg-yellow group-hover:text-navy transition-colors">
                                        {item.icon}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-yellow transition-colors -mb-8 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow transition-colors uppercase">
                                    {industryName}
                                </h3>
                                <p className="text-white/60 text-sm mb-4 line-clamp-2 h-10">
                                    {item.description[lang]}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {productList.slice(0, 2).map((prod: string, idx: number) => (
                                        <span key={idx} className="text-xs bg-white/5 px-2 py-1 rounded text-white/40">
                                            {prod}
                                        </span>
                                    ))}
                                    {productList.length > 2 && (
                                        <span className="text-xs bg-white/5 px-2 py-1 rounded text-white/40">+{productList.length - 2}</span>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-yellow font-mono">{item.stats.label}</span>
                                    <span className="text-sm font-bold">{item.stats.value}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* 3. WHY TURKEY */}
            <section className="bg-charcoal py-20 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-heading font-bold mb-2 uppercase">{t.whyTurkey.title}</h2>
                            <div className="h-1 w-20 bg-yellow"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {t.whyTurkey.items.map((item, i) => (
                            <div key={i} className="bg-navy/50 p-8 rounded-xl border-l-4 border-yellow">
                                <h3 className="text-xl font-bold mb-2 uppercase">{item.title}</h3>
                                <p className="text-white/60">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. CTA */}
            <section className="py-20 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-6 text-white/80 uppercase">
                        {lang === 'en' ? "Can't find your industry?" : "SEKTÖRÜNÜZÜ BULAMADINIZ MI?"}
                    </h2>
                    <p className="text-white/60 mb-8 max-w-xl mx-auto">
                        {lang === 'en' ?
                            "Our sourcing team can find specific manufacturers for niche requirements." :
                            "Tedarik ekibimiz, niş gereksinimler için özel üreticiler bulabilir."}
                    </p>
                    <button
                        onClick={() => setContactModalOpen(true)}
                        className="border border-white/20 hover:bg-white/10 text-white px-8 py-3 rounded-lg transition-all uppercase tracking-widest hover:border-yellow"
                    >
                        {lang === 'en' ? "Contact Sourcing Team" : "TEDARİK EKİBİYLE GÖRÜŞ"}
                    </button>
                </div>
            </section>

            <ContactModal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                lang={lang}
                inquiryTypes={[lang === 'en' ? 'Sourcing Request' : 'Tedarik Talebi']}
            />
        </div>
    );
};

export default Industries;
