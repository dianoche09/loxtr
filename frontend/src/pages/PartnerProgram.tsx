import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Users, Globe2, ArrowRight,
    FileText, BarChart3, Handshake, Plane, Box,
    TrendingUp, Star, Zap, Shield
} from 'lucide-react';
import SEO from '../components/seo/SEO';
import ContactModal from '../components/ContactModal';
import { CONFIG } from '../siteConfig';

const PartnerProgram = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const inquiryOptions = {
        en: [
            "Exclusive Distribution Partner",
            "Service Ecosystem Partner",
            "Channel Sales Partner"
        ],
        tr: [
            "Yetkili Tedarikçi (Supplier)",
            "Private Label (Fason) Üretim",
            "Yatırım & İşbirliği"
        ]
    };

    const content = {
        en: {
            title: "Partner Program | LOXTR",
            desc: "Become an Exclusive Distribution Partner or Join our Service Ecosystem.",
            hero: {
                badge: "Strategic Partnership",
                headline: "Lead the Market with LOXTR.",
                subheadline: "We are not just agents; we are your operational arm in Turkey. Join us to manage exclusive distribution or provide essential trade services.",
                cta: "Apply for Partnership"
            },
            metrics: [
                { val: "8", label: "Active Brands", icon: <Users className="w-6 h-6" /> },
                { val: "12", label: "Focus Markets", icon: <Globe2 className="w-6 h-6" /> },
                { val: "100%", label: "Focus & Dedication", icon: <TrendingUp className="w-6 h-6" /> },
                { val: "High", label: "Trade Potential", icon: <BarChart3 className="w-6 h-6" /> }
            ],
            whyPartner: {
                title: "Why Partner with LOXTR?",
                subtitle: "Join a network built on trust, transparency, and mutual growth.",
                benefits: [
                    { title: "Market Intelligence", desc: "Access real-time market data, competitor insights, and demand forecasting for strategic decisions.", icon: <BarChart3 /> },
                    { title: "Operational Excellence", desc: "Leverage our logistics infrastructure, bonded warehouses, and regulatory expertise.", icon: <Zap /> },
                    { title: "Growth Support", desc: "Dedicated account managers, marketing support, and co-investment opportunities.", icon: <TrendingUp /> },
                    { title: "Protected Territories", desc: "Exclusive regional rights ensuring no internal competition.", icon: <Shield /> }
                ]
            },
            roadmapTitle: "The Partnership Journey",
            roadmapSubtitle: "A structured process designed to ensure mutual success from day one.",
            roadmap: [
                {
                    step: "01",
                    title: "NDA & Discovery",
                    desc: "We start with a Non-Disclosure Agreement to legally protect your IP. Then, we analyze your product's fit for the Turkish market.",
                    icon: <FileText className="w-6 h-6 text-navy" />
                },
                {
                    step: "02",
                    title: "Market Strategy",
                    desc: "We present a comprehensive 'Go-to-Market' plan, including pricing, competitor analysis, and regulatory compliance checks.",
                    icon: <BarChart3 className="w-6 h-6 text-navy" />
                },
                {
                    step: "03",
                    title: "Exclusive Agreement",
                    desc: "We sign a formal distribution contract defining territories, targets, and operational responsibilities.",
                    icon: <Handshake className="w-6 h-6 text-navy" />
                },
                {
                    step: "04",
                    title: "Operational Setup",
                    desc: "Importation, bonded warehousing, and channel setup begin. Your brand is now officially in Turkey.",
                    icon: <Plane className="w-6 h-6 text-navy" />
                }
            ],
            modelsTitle: "Partnership Models",
            modelsSubtitle: "Choose the collaboration model that best fits your business goals.",
            testimonials: {
                title: "Partner Success Stories",
                items: [
                    { quote: "LOXTR helped us enter the Turkish market in just 90 days. Their local expertise was invaluable.", author: "Michael R.", role: "CEO, Nordic Tools AB", rating: 5 },
                    { quote: "The transparency and professionalism of the LOXTR team exceeded our expectations.", author: "Sarah M.", role: "Export Director, GreenTech GmbH", rating: 5 }
                ]
            },
            cta: {
                title: "Ready to Grow Together?",
                subtitle: "Join our partner network and unlock the full potential of the Turkish market.",
                button: "Start Your Application"
            }
        },
        tr: {
            title: "Tedarikçi Ortaklığı | LOXTR",
            desc: "Global pazarlara açılmak isteyen Türk üreticileri için stratejik ihracat ortaklığı.",
            hero: {
                badge: "Stratejik Ortaklık",
                headline: "SİZİN GLOBAL SATIŞ OFİSİNİZ.",
                subheadline: "Siz sadece en iyi yaptığınız işe, üretmeye odaklanın. Pazar araştırması, müşteri bulma, gümrük ve tahsilat süreçlerini LOXTR sizin adınıza yönetsin.",
                cta: "Tedarikçi Olun"
            },
            metrics: [
                { val: "8", label: "Aktif Marka", icon: <Users className="w-6 h-6" /> },
                { val: "12", label: "Hedef Ülke", icon: <Globe2 className="w-6 h-6" /> },
                { val: "100%", label: "Odak & Uzmanlık", icon: <TrendingUp className="w-6 h-6" /> },
                { val: "Yüksek", label: "Ticaret Potansiyeli", icon: <BarChart3 className="w-6 h-6" /> }
            ],
            whyPartner: {
                title: "Neden LOXTR ile Ortaklık?",
                subtitle: "Güven, şeffaflık ve karşılıklı büyüme üzerine kurulu bir ağa katılın.",
                benefits: [
                    { title: "Pazar İstihbaratı", desc: "Stratejik kararlar için gerçek zamanlı pazar verileri, rakip analizleri ve talep tahminlerine erişin.", icon: <BarChart3 /> },
                    { title: "Operasyonel Mükemmeliyet", desc: "Lojistik altyapımız, antrepolarımız ve regülasyon uzmanlığımızdan yararlanın.", icon: <Zap /> },
                    { title: "Büyüme Desteği", desc: "Özel hesap yöneticileri, pazarlama desteği ve ortak yatırım fırsatları.", icon: <TrendingUp /> },
                    { title: "Korunan Bölgeler", desc: "İç rekabeti önleyen münhasır bölgesel haklar.", icon: <Shield /> }
                ]
            },
            roadmapTitle: "İhracat Yolculuğumuz",
            roadmapSubtitle: "Başarıyı garantilemek için tasarlanmış yapılandırılmış bir süreç.",
            roadmap: [
                {
                    step: "01",
                    title: "Potansiyel Analizi",
                    desc: "Ürünlerinizin teknik özelliklerini inceliyor ve hedef pazarlardaki (AB, ABD, MENA) rekabet şansını verilerle raporluyoruz.",
                    icon: <FileText className="w-6 h-6 text-navy" />
                },
                {
                    step: "02",
                    title: "Hedef Pazar Seçimi",
                    desc: "Hangi ülkeye girmeliyiz? Gümrük avantajı, lojistik maliyeti ve talep yoğunluğuna göre en karlı pazarı birlikte seçiyoruz.",
                    icon: <Globe2 className="w-6 h-6 text-navy" />
                },
                {
                    step: "03",
                    title: "Numune & Listeleme",
                    desc: "Ürünlerinizi dijital showroom'umuza yüklüyor ve o ülkedeki seçkin alıcı ağımıza numune gönderiyoruz.",
                    icon: <Box className="w-6 h-6 text-navy" />
                },
                {
                    step: "04",
                    title: "Sürekli İhracat",
                    desc: "Sipariş geldiğinde fabrikadan malı alıyor, gümrükleyip müşterinin kapısına teslim ediyoruz. Riski sıfıra indiriyoruz.",
                    icon: <Plane className="w-6 h-6 text-navy" />
                }
            ],
            modelsTitle: "Ortaklık Modelleri",
            modelsSubtitle: "İş hedeflerinize en uygun işbirliği modelini seçin.",
            testimonials: {
                title: "Ortak Başarı Hikayeleri",
                items: [
                    { quote: "LOXTR ile sadece 90 günde Avrupa pazarına girdik. Profesyonel yaklaşımları eşsizdi.", author: "Ahmet K.", role: "Genel Müdür, Anatolian Textiles", rating: 5 },
                    { quote: "Şeffaflık ve güven anlayışları beklentilerimizin üzerindeydi.", author: "Mehmet Y.", role: "İhracat Direktörü, TurkMach A.Ş.", rating: 5 }
                ]
            },
            cta: {
                title: "Birlikte Büyümeye Hazır mısınız?",
                subtitle: "Ortak ağımıza katılın ve global pazarların tam potansiyelini açığa çıkarın.",
                button: "Başvurunuzu Başlatın"
            }
        }
    };

    const t = content[lang];
    const formTitle = lang === 'en' ? "Partnership Application" : "Tedarikçi Başvuru Formu";

    return (
        <div className="bg-white min-h-screen">
            <SEO title={t.title} description={t.desc} />

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lang={lang}
                title={formTitle}
                industryName="Partner Program"
                inquiryTypes={inquiryOptions[lang]}
            />

            {/* HERO - Professional Navy (Consistent with other pages) */}
            <section className="relative h-[85vh] flex items-center overflow-hidden bg-navy">
                <div className="absolute inset-0 bg-[url('/images/partner_hero.webp')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block py-1.5 px-4 rounded-full bg-yellow/20 text-yellow text-sm font-bold tracking-widest uppercase mb-6 border border-yellow/30">
                                {t.hero.badge}
                            </span>
                            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 text-white leading-tight uppercase">
                                {t.hero.headline}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed mb-10 max-w-2xl">
                                {t.hero.subheadline}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="bg-yellow text-navy px-8 py-4 rounded-full font-bold flex items-center space-x-2 transition-all shadow-lg"
                            >
                                <span>{t.hero.cta}</span>
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* METRICS BAR */}
            <section className="py-12 bg-charcoal">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {t.metrics.map((metric, i) => (
                            <div key={i}>
                                <div className="text-4xl font-heading font-bold text-yellow mb-2">{metric.val}</div>
                                <div className="text-white/60 text-sm uppercase tracking-wider">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY PARTNER */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-heading font-bold text-navy mb-4">{t.whyPartner.title}</h2>
                        <p className="text-gray-600">{t.whyPartner.subtitle}</p>
                        <div className="h-1 w-20 bg-yellow mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {t.whyPartner.benefits.map((benefit, i) => (
                            <div key={i} className="bg-off-white p-6 rounded-xl border border-gray-100 hover:border-yellow hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mb-4 text-yellow child-svg-w-6 child-svg-h-6">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-navy">{benefit.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ROADMAP */}
            <section className="py-24 bg-off-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-bold text-navy mb-4">{t.roadmapTitle}</h2>
                        <p className="text-gray-600">{t.roadmapSubtitle}</p>
                        <div className="h-1 w-20 bg-yellow mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {t.roadmap.map((step, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-yellow hover:shadow-xl transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center text-navy">
                                            {step.icon}
                                        </div>
                                        <span className="text-4xl font-heading font-bold text-navy/5">{step.step}</span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-3 text-navy">{step.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MODELS */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-bold text-navy mb-4">{t.modelsTitle}</h2>
                        <p className="text-gray-600">{t.modelsSubtitle}</p>
                        <div className="h-1 w-20 bg-yellow mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {CONFIG.partnershipModels[lang].map((model, i) => (
                            <div key={i} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="mb-8 p-4 bg-navy/5 rounded-2xl inline-block group-hover:bg-yellow transition-colors duration-300">
                                    {/* Clone icon to override its built-in classes for hover effect */}
                                    {React.cloneElement(model.icon as React.ReactElement<{ className?: string }>, {
                                        className: "w-10 h-10 text-yellow group-hover:text-navy transition-colors"
                                    })}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-navy uppercase tracking-tight">{model.title}</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed font-light">{model.desc}</p>
                                <div className="space-y-4 mb-10">
                                    {model.features.map((feature, j) => (
                                        <div key={j} className="flex items-center space-x-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow" />
                                            <span className="text-gray-500 text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full py-4 border-2 border-navy/5 group-hover:border-yellow group-hover:bg-yellow text-navy font-bold rounded-xl transition-all uppercase tracking-widest text-xs"
                                >
                                    {lang === 'en' ? "Partner Now" : "ŞİMDİ BAŞVUR"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-24 bg-off-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-bold text-navy mb-4">{t.testimonials.title}</h2>
                        <div className="h-1 w-20 bg-yellow mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {t.testimonials.items.map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
                                <div className="flex space-x-1 mb-4">
                                    {[...Array(item.rating)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 text-yellow fill-yellow" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">"{item.quote}"</p>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold">
                                        {item.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-navy">{item.author}</div>
                                        <div className="text-sm text-gray-500">{item.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 bg-navy">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">{t.cta.title}</h2>
                    <p className="text-xl text-white/60 mb-12">{t.cta.subtitle}</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-yellow text-navy font-bold px-12 py-5 rounded-lg hover:bg-yellow/90 transition-all inline-flex items-center space-x-3"
                    >
                        <span className="text-lg">{t.cta.button}</span>
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default PartnerProgram;
