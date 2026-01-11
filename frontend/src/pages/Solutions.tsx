import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Box, Ship, Handshake, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { CONFIG } from '../siteConfig';

const Solutions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

    // DUAL INTERFACE: Content Logic
    const t = {
        en: {
            title: "Market Entry Solutions | LOXTR",
            desc: "Your partner for entering the Turkish market. warehousing, fulfillment, and distribution.",
            mainService: {
                badge: "FOR GLOBAL BRANDS",
                title: "Market Entry & Distribution",
                desc: "Enter a market of 85 million consumers without the headache of setting up a local entity. We handle import compliance, warehousing, and B2B distribution.",
                features: [
                    "Compliance: TSE, CE, and customs regulations management.",
                    "Sales Network: Access to 100+ active local dealers.",
                    "Localization: Brand adaptation and marketing support."
                ],
                cta: "Partner With Us",
                link: "/partner",
                icon: <Ship className="w-16 h-16 text-yellow" />,
                bg: "/images/export_card_bg.webp"
            },
            secondaryService: {
                badge: "FOR MANUFACTURERS",
                title: "Sourcing & Procurement",
                desc: "Looking for high-quality Turkish manufacturing? We identify verified suppliers and manage the entire procurement process.",
                features: [
                    "Supplier Identification: AI-driven matching with verified producers.",
                    "Quality Control: On-site inspections and certifications.",
                    "Logistics: Door-to-door delivery management."
                ],
                cta: "Start Sourcing",
                link: "/industries",
                icon: <Box className="w-16 h-16 text-white" />,
                bg: "/images/import_card_bg.webp"
            }
        },
        tr: {
            title: "İHRACAT ÇÖZÜMLERİ | LOXTR",
            desc: "Türk üreticiler için uçtan uca ihracat yönetimi. Pazar araştırması, lojistik ve satış.",
            mainService: {
                badge: "ÜRETİCİLER İÇİN",
                title: "İHRACAT YÖNETİMİ",
                desc: "Sizin dış ticaret departmanınız gibi çalışıyoruz. Doğru alıcıları bulmaktan, gümrük ve lojistik operasyonlarına kadar tüm süreç bizde.",
                features: [
                    "Veri Odaklı Pazar Analizi: En karlı pazarların tespiti.",
                    "Operasyon Yönetimi: Nakliye, gümrük ve dökümantasyon.",
                    "Finansal Güvence: Güvenli ödeme ve tahsilat garantisi."
                ],
                cta: "İHRACATA BAŞLA",
                link: "/partner",
                icon: <Ship className="w-16 h-16 text-yellow" />,
                bg: "/images/export_card_bg.webp"
            },
            secondaryService: {
                badge: "GİRİŞİMCİLER İÇİN",
                title: "GLOBAL MARKA TEMSİLCİLİĞİ",
                desc: "LOXTR portföyündeki dünya markalarının Türkiye bayisi olun. Hazır stok ve yetkili satıcı belgesi ile hemen satışa başlayın.",
                features: [
                    "Hazır Marka Portföyü: 8 odaklı marka.",
                    "Münhasır Anlaşmalar: Yetkili satıcı statüsü.",
                    "Stoktan Teslim: İthalat riski olmadan ticaret."
                ],
                cta: "DİSTRİBÜTÖR OL",
                link: "/distribution",
                icon: <Handshake className="w-16 h-16 text-white" />,
                bg: "/images/import_card_bg.webp"
            }
        }
    }[lang];

    return (
        <div className="bg-navy min-h-screen text-white pt-20">
            <SEO title={t.title} description={t.desc} />

            {/* HERO SECTION */}
            <section className="relative py-20 px-6 overflow-hidden pt-32">
                <div className="absolute inset-0 bg-[url('/images/hero_bg.webp')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-navy/50 to-navy"></div>
                <div className="container mx-auto text-center relative z-10 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-heading font-bold mb-6 text-white"
                    >
                        {t.mainService.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        {t.mainService.desc}
                    </motion.p>
                </div>
            </section>

            {/* MAIN SERVICES SPLIT */}
            <section className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* PRIMARY SERVICE */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-charcoal border border-yellow/30 rounded-2xl overflow-hidden shadow-2xl hover:shadow-yellow/20 transition-all flex flex-col group relative"
                    >
                        {/* Image Header with Overlay */}
                        <div className="h-72 relative overflow-hidden">
                            {/* Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                                style={{ backgroundImage: `url(${t.mainService.bg})` }}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-navy/60 group-hover:bg-navy/50 transition-colors" />

                            {/* Badge - Top Left */}
                            <div className="absolute top-6 left-6 z-10">
                                <div className="bg-yellow text-navy px-4 py-1.5 rounded text-xs font-bold tracking-widest uppercase shadow-lg">
                                    {t.mainService.badge}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col bg-charcoal relative z-20">
                            <h2 className="text-3xl font-bold mb-4">{t.mainService.title}</h2>
                            <p className="text-white/70 mb-8 leading-relaxed h-20">{t.mainService.desc}</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                {t.mainService.features.map((feature, i) => (
                                    <li key={i} className="flex items-start space-x-3">
                                        <CheckCircle2 className="w-5 h-5 text-yellow mt-1 flex-shrink-0" />
                                        <span className="text-white/80 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate(`/${lang}${t.mainService.link}`)}
                                className="w-full bg-yellow hover:bg-yellow/90 text-navy font-bold py-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-yellow/10"
                            >
                                <span>{t.mainService.cta}</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    {/* SECONDARY SERVICE */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-charcoal border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-white/30 transition-all flex flex-col group relative"
                    >
                        {/* Image Header with Overlay */}
                        <div className="h-72 relative overflow-hidden">
                            {/* Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                                style={{ backgroundImage: `url(${t.secondaryService.bg})` }}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-charcoal/70 group-hover:bg-charcoal/60 transition-colors" />

                            {/* Badge - Top Left */}
                            <div className="absolute top-6 left-6 z-10">
                                <div className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded text-xs font-bold tracking-widest uppercase border border-white/20 shadow-lg">
                                    {t.secondaryService.badge}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col bg-charcoal relative z-20">
                            <h2 className="text-2xl font-bold mb-4 text-white/90">{t.secondaryService.title}</h2>
                            <p className="text-white/60 mb-8 leading-relaxed h-20">{t.secondaryService.desc}</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                {t.secondaryService.features.map((feature, i) => (
                                    <li key={i} className="flex items-start space-x-3">
                                        <CheckCircle2 className="w-5 h-5 text-white/40 mt-1 flex-shrink-0" />
                                        <span className="text-white/60 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate(`/${lang}${t.secondaryService.link}`)}
                                className="w-full border border-white/20 hover:bg-white/10 text-white font-bold py-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
                            >
                                <span>{t.secondaryService.cta}</span>
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* INFRASTRUCTURE */}
            <section className="bg-charcoal py-20 mt-12 relative border-t border-white/5">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-bold mb-4">
                            {lang === 'en' ? "Our Infrastructure" : "LOJİSTİK ALTYAPIMIZ"}
                        </h2>
                        <div className="h-1 w-24 bg-yellow mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {CONFIG.features[lang].map((feature, i) => (
                            <motion.div key={i} whileHover={{ y: -5 }} className="bg-navy/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-center hover:border-yellow/30 transition-all">
                                <div className="flex justify-center mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-white/60">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Solutions;
