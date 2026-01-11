import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Warehouse, Truck, Store, ArrowRight, Globe2, ShieldCheck, CheckCircle2
} from 'lucide-react';
import SEO from '../components/seo/SEO';
import ContactModal from '../components/ContactModal';

const Distribution = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const content = {
        en: {
            title: "Distribution & Market Entry in Turkey | LOXTR",
            desc: "Warehousing, fulfillment, and B2B distribution services for global brands entering Turkey.",
            hero: {
                tag: "FOR GLOBAL BRANDS",
                headline: "Your Turkish Distribution Partner",
                subheadline: "Don't build from scratch. Plug into LOXTR's existing warehouse and logistics network to distribute your products across Turkey within 24 hours.",
                cta: "Check Capacity",
            },
            services: [
                {
                    title: "Bonded Warehousing",
                    desc: "Secure storage in Istanbul Free Zones. Import your goods tax-free until they are sold.",
                    icon: <Warehouse className="w-8 h-8" />,
                    features: ["Secured boutique storage", "Temperature-controlled zones", "24/7 security"]
                },
                {
                    title: "Nationwide Fulfillment",
                    desc: "Last-mile delivery to 81 cities via our integrated courier partners.",
                    icon: <Truck className="w-8 h-8" />,
                    features: ["24-48h delivery", "Real-time tracking", "Return management"]
                },
                {
                    title: "Retail Distribution",
                    desc: "Direct supply chain connection to major Turkish retail chains.",
                    icon: <Store className="w-8 h-8" />,
                    features: ["Direct dealer network", "Retail chain access", "EDI integration"]
                }
            ],
            process: {
                title: "How It Works",
                steps: [
                    { num: "01", title: "Product Assessment", desc: "We evaluate your product's market fit and regulatory requirements" },
                    { num: "02", title: "Warehousing Setup", desc: "Your inventory arrives at our Istanbul hub" },
                    { num: "03", title: "Go Live", desc: "We activate distribution to our dealer network" },
                    { num: "04", title: "Scale", desc: "Monitor sales and expand categories" }
                ]
            },
            stats: [
                { label: "Storage Capacity", value: "Dedicated" },
                { label: "Delivery Cities", value: "National" },
                { label: "Active SKUs", value: "Premium" },
                { label: "B2B Network", value: "Focus" }
            ],
            cta: {
                title: "Ready to Enter Turkish Market?",
                subtitle: "Get a free distribution capacity assessment",
                button: "Request Assessment"
            }
        },
        tr: {
            title: "Marka Bayiliği & Distribütörlük | LOXTR",
            desc: "LOXTR portföyündeki global markaların yetkili bayisi olun.",
            hero: {
                tag: "GİRİŞİMCİLER İÇİN",
                headline: "Global Markaların Türkiye Distribütörü Olun",
                subheadline: "LOXTR olarak Türkiye distribütörlüğünü yürüttüğümüz dünya markalarına bayilik veriyoruz. Hazır stok, garantili ürün ve pazarlama desteğiyle hemen satışa başlayın.",
                cta: "Bayilik Başvurusu"
            },
            services: [
                {
                    title: "Hazır Marka Portföyü",
                    desc: "Teknoloji, kozmetik ve yapı malzemeleri kategorilerinde global markaların yetkili distribütörlüğünü yapıyoruz.",
                    icon: <Globe2 className="w-8 h-8" />,
                    features: ["Seçkin global markalar", "Çoklu kategori desteği", "Münhasır haklar"]
                },
                {
                    title: "Stoktan Anında Teslimat",
                    desc: "İthalat, gümrük ve lojistik riskleriyle uğraşmayın. Ürünleri İstanbul depomuzdan hemen teslim alın.",
                    icon: <Warehouse className="w-8 h-8" />,
                    features: ["Hazır stok", "24-48 saat teslimat", "İade yönetimi"]
                },
                {
                    title: "Yetkili Satıcı Statüsü",
                    desc: "Resmiyet kazanın. Tüm ürünlerimiz üretici garantili ve bandrollüdür.",
                    icon: <ShieldCheck className="w-8 h-8" />,
                    features: ["Resmi belge", "Üretici garantisi", "Pazarlama desteği"]
                }
            ],
            process: {
                title: "Nasıl Çalışır",
                steps: [
                    { num: "01", title: "Başvuru", desc: "Online formla bayilik başvurunuzu yapın" },
                    { num: "02", title: "Değerlendirme", desc: "Bölge ve kategori uygunluğu kontrol edilir" },
                    { num: "03", title: "Anlaşma", desc: "Bayilik sözleşmesi imzalanır" },
                    { num: "04", title: "Satışa Başla", desc: "Hemen sipariş verin ve satışa başlayın" }
                ]
            },
            stats: [
                { label: "Aktif Bayi", value: "Seçkin" },
                { label: "Şehir Kapsamı", value: "Ulusal" },
                { label: "Ürün Çeşidi", value: "Zengin" },
                { label: "Marka Sayısı", value: "8" }
            ],
            cta: {
                title: "Bayilik Almaya Hazır mısınız?",
                subtitle: "Ücretsiz potansiyel analizi için başvurun",
                button: "Başvuru Formu"
            }
        }
    };

    const t = content[lang];

    return (
        <div className="bg-white min-h-screen">
            <SEO title={t.title} description={t.desc} />

            {/* HERO - Flat Navy (Simple, Different from Partner's decorative style) */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-navy">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-block bg-yellow text-navy px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                {t.hero.tag}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white leading-tight">
                                {t.hero.headline}
                            </h1>
                            <p className="text-xl text-white/70 font-light leading-relaxed mb-10 max-w-3xl mx-auto">
                                {t.hero.subheadline}
                            </p>
                            <button
                                onClick={() => setContactModalOpen(true)}
                                className="bg-yellow hover:bg-yellow/90 text-navy font-bold px-8 py-4 rounded-lg inline-flex items-center space-x-2 transition-all shadow-lg uppercase"
                            >
                                <span>{t.hero.cta}</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* STATS BAR */}
            <section className="py-12 bg-navy">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {t.stats.map((stat, i) => (
                            <div key={i}>
                                <div className="text-3xl md:text-4xl font-heading font-bold text-yellow mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-white/60 text-sm uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES - Card Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {t.services.map((service, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="bg-off-white p-8 rounded-2xl border border-gray-100 hover:border-yellow hover:shadow-xl transition-all group"
                            >
                                <div className="w-16 h-16 bg-navy text-yellow rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow group-hover:text-navy transition-all">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-navy">{service.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{service.desc}</p>
                                <ul className="space-y-2">
                                    {service.features.map((feature, j) => (
                                        <li key={j} className="flex items-center space-x-2 text-sm text-gray-500">
                                            <CheckCircle2 className="w-4 h-4 text-yellow shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROCESS - Timeline */}
            <section className="py-24 bg-off-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-bold text-navy mb-4">
                            {t.process.title}
                        </h2>
                        <div className="h-1 w-20 bg-yellow mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {t.process.steps.map((step, i) => (
                            <div key={i} className="relative text-center">
                                <div className="w-16 h-16 bg-navy text-yellow rounded-full flex items-center justify-center mx-auto mb-6 font-heading font-bold text-2xl">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-navy">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>

                                {i < t.process.steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-navy text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                        {t.cta.title}
                    </h2>
                    <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                        {t.cta.subtitle}
                    </p>
                    <button
                        onClick={() => setContactModalOpen(true)}
                        className="bg-white text-navy font-bold px-12 py-5 rounded-lg hover:bg-yellow transition-all inline-flex items-center space-x-3"
                    >
                        <span className="text-lg">{t.cta.button}</span>
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </section>

            <ContactModal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                lang={lang}
                title={lang === 'en' ? "Distribution Capacity Inquiry" : "Bayilik Başvurusu"}
                inquiryTypes={[lang === 'en' ? 'Distribution Request' : 'Bayilik Talebi']}
            />
        </div>
    );
};

export default Distribution;
