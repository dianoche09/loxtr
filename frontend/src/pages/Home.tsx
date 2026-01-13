import React from 'react';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    ArrowRight,
    Box
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { CONFIG } from '../siteConfig';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const t = CONFIG.hero[lang];

    const handlePrimaryClick = () => {
        navigate(`/${lang}/partner`);
    };

    const handleSecondaryClick = () => {
        // EN: View Solutions
        // TR: Partner/Export Program
        const target = lang === 'en' ? '/solutions' : '/partner';
        navigate(`/${lang}${target}`);
    };

    const getIndustryName = (item: any) => {
        return typeof item.name === 'object' ? item.name[lang] : item.name;
    };

    return (
        <div>
            <SEO
                title={t.headline}
                description={t.subheadline}
            />

            {/* Hero Section */}
            <section className="relative h-screen flex items-center overflow-hidden bg-navy">
                <div className="absolute inset-0">
                    <img
                        src="/images/hero_bg_flag.webp"
                        className="w-full h-full object-cover opacity-40"
                        alt="LOXTR Logistics"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-block px-3 py-1 rounded border border-yellow/30 text-yellow text-xs font-bold tracking-widest mb-6 bg-yellow/10">
                            {lang === 'en' ? "TURKEY MARKET ENTRY PARTNER" : "İHRACAT YÖNETİM MERKEZİ"}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-heading text-white mb-6 leading-tight uppercase">
                            {t.headline.split('.').map((part, i) => (
                                <span key={i} className={part.includes('Turkish') || part.includes('Dünyaya') || part.includes('Gateway') || part.includes('DIŞ') ? 'text-yellow' : ''}>
                                    {part}{i === 0 ? '.' : ''}
                                </span>
                            ))}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 mb-10 font-body leading-relaxed max-w-2xl">
                            {t.subheadline}
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                            <button
                                onClick={handlePrimaryClick}
                                className="bg-yellow hover:bg-yellow/90 text-navy font-bold px-8 py-3 rounded-md text-lg flex items-center justify-center space-x-2 transition-all uppercase"
                            >
                                <span>{t.ctaPrimary}</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSecondaryClick}
                                className="px-8 py-3 rounded-md font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase"
                            >
                                <span>{t.ctaSecondary}</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-charcoal py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {CONFIG.stats[lang].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-heading text-yellow mb-2 font-bold">{stat.value}</div>
                                <div className="text-gray-400 uppercase tracking-widest text-sm font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose LOXTR? - Re-imagined with technical elegance */}
            <section className="py-32 bg-charcoal relative overflow-hidden border-y border-white/5">
                {/* Large Watermark Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/5 whitespace-nowrap pointer-events-none select-none">
                    LOXTR LOGISTICS
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-block px-3 py-1 rounded-full bg-yellow/10 border border-yellow/20 text-yellow text-xs font-bold mb-6 tracking-widest uppercase">
                                    {lang === 'en' ? "Modern Trade Infrastructure" : "Modern Ticaret Altyapısı"}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-white leading-tight uppercase">
                                    {lang === 'en' ? "WHY CHOOSE" : "NEDEN"} <span className="text-yellow">LOXTR?</span>
                                </h2>
                                <p className="text-white/60 text-lg mb-10 leading-relaxed font-light">
                                    {lang === 'en'
                                        ? "We don't just move products; we eliminate the operational and financial barriers between Turkish manufacturers and global demand. Our platform is built on transparency, local expertise, and digital efficiency."
                                        : "Sadece ürün taşımıyoruz; Türk üreticileri ile küresel talep arasındaki operasyonel ve finansal engelleri kaldırıyoruz. Platformumuz şeffaflık, pazar uzmanlığı ve dijital verimlilik üzerine inşa edilmiştir."}
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4 group cursor-default">
                                        <div className="w-12 h-12 rounded-full border border-yellow/30 flex items-center justify-center text-yellow group-hover:bg-yellow group-hover:text-navy transition-all">01</div>
                                        <span className="text-white/80 font-medium">{lang === 'en' ? "Authorized Partner Status" : "Yetkili Satıcı Güvencesi"}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 group cursor-default">
                                        <div className="w-12 h-12 rounded-full border border-yellow/30 flex items-center justify-center text-yellow group-hover:bg-yellow group-hover:text-navy transition-all">02</div>
                                        <span className="text-white/80 font-medium">{lang === 'en' ? "Secure Payment & Escrow" : "Güvenli Ödeme & Tahsilat"}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 group cursor-default">
                                        <div className="w-12 h-12 rounded-full border border-yellow/30 flex items-center justify-center text-yellow group-hover:bg-yellow group-hover:text-navy transition-all">03</div>
                                        <span className="text-white/80 font-medium">{lang === 'en' ? "Real-time Supply Chain Tracking" : "Gerçek Zamanlı Takip"}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {CONFIG.features[lang].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-navy/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-yellow/40 hover:bg-navy/60 transition-all duration-500 group relative overflow-hidden"
                                >
                                    {/* Subtle hover glow */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow/5 rounded-full blur-3xl group-hover:bg-yellow/10 transition-colors" />

                                    <div className="relative z-10 w-14 h-14 bg-charcoal/50 rounded-xl flex items-center justify-center mb-6 shadow-xl border border-white/5 group-hover:scale-110 group-hover:bg-yellow group-hover:text-navy transition-all duration-300">
                                        {/* Clone icon to handle hover state properly */}
                                        {React.cloneElement(feature.icon as React.ReactElement<{ className?: string }>, {
                                            className: "w-8 h-8 text-yellow group-hover:text-navy transition-colors"
                                        })}
                                    </div>
                                    <h3 className="relative z-10 text-xl font-bold mb-3 text-white uppercase group-hover:text-yellow transition-colors">{feature.title}</h3>
                                    <p className="relative z-10 text-white/50 leading-relaxed font-light text-sm">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Industries Section - Redesigned for Premium Look */}
            <section className="py-24 bg-navy relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent opacity-5"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow/5 rounded-full blur-3xl"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-white text-4xl md:text-5xl mb-6 font-heading font-bold tracking-tight uppercase">
                                {lang === 'en' ? "SECTORS WE COVER" : "UZMANLIK ALANLARIMIZ"}
                            </h2>
                            <div className="h-1.5 w-32 bg-yellow mx-auto mb-8"></div>
                        </motion.div>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                            {lang === 'en'
                                ? "Comprehensive trade and distribution networks across Turkey's most dynamic industrial sectors."
                                : "Türkiye'nin en dinamik sektörlerinde uçtan uca ticaret ve distribütörlük ağları."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {CONFIG.industries.slice(0, 8).map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => navigate(`/${lang}${lang === 'en' ? '/industries' : '/sektorler'}/${item.slug}`)}
                                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-white/5"
                            >
                                {/* Background Image with Zoom Effect */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${item.heroImage})` }}
                                ></div>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent group-hover:via-navy/40 transition-colors duration-300"></div>

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <div className="mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="w-12 h-12 bg-yellow/90 backdrop-blur-md rounded-xl flex items-center justify-center text-navy mb-4 shadow-lg group-hover:bg-yellow group-hover:scale-110 transition-all">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                            {getIndustryName(item)}
                                        </h3>
                                        <p className="text-white/70 text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                                            {item.description[lang]}
                                        </p>
                                    </div>

                                    {/* Action Link */}
                                    <div className="flex items-center space-x-2 text-yellow font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span>{lang === 'en' ? "EXPLORE" : "İNCELE"}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Animated border on hover */}
                                <div className="absolute inset-0 border-2 border-yellow/0 group-hover:border-yellow transition-colors duration-300 rounded-2xl pointer-events-none"></div>
                            </motion.div>
                        ))}
                    </div>

                    {/* View All Button */}
                    <div className="mt-20 text-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/${lang}${lang === 'en' ? '/industries' : '/sektorler'}`)}
                            className="bg-transparent border-2 border-white/20 hover:border-yellow text-white hover:text-yellow px-10 py-4 rounded-full font-bold transition-all inline-flex items-center space-x-3 uppercase tracking-widest text-sm"
                        >
                            <span>{lang === 'en' ? "View All Sectors" : "TÜM SEKTÖRLERİ GÖR"}</span>
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* Partnership Models Section - Added for Home */}
            <section className="py-32 bg-off-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-navy text-4xl md:text-5xl mb-6 font-heading font-bold tracking-tight uppercase">
                                {lang === 'en' ? "PARTNERSHIP MODELS" : "ORTAKLIK MODELLERİ"}
                            </h2>
                            <div className="h-1.5 w-32 bg-yellow mx-auto mb-8"></div>
                        </motion.div>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                            {lang === 'en'
                                ? "Scalable collaboration paths designed for manufacturers, brands, and service providers."
                                : "Üreticiler, markalar ve hizmet sağlayıcılar için tasarlanmış ölçeklenebilir işbirliği yolları."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {CONFIG.partnershipModels[lang].map((model, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                            >
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
                                    onClick={() => navigate(`/${lang}/partner`)}
                                    className="w-full py-4 border-2 border-navy/5 group-hover:border-yellow group-hover:bg-yellow text-navy font-bold rounded-xl transition-all uppercase tracking-widest text-xs"
                                >
                                    {lang === 'en' ? "Learn More" : "DETAYLI BİLGİ"}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Inviting Banner Section */}
            <section className="relative py-32 bg-navy overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="bg-gradient-to-r from-yellow to-orange-500 rounded-3xl p-1 md:p-[2px] shadow-2xl overflow-hidden group">
                        <div className="bg-navy rounded-[calc(1.5rem-2px)] p-12 md:p-20 relative overflow-hidden">
                            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-yellow/10 rounded-full blur-[120px] pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="max-w-3xl"
                                >
                                    <h2 className="text-4xl md:text-6xl font-heading font-black text-white mb-8 leading-tight tracking-tight uppercase">
                                        {lang === 'en'
                                            ? "Ready to redefine your trading boundaries?"
                                            : "Ticaret rotalarınızı yeniden çizmeye hazır mısınız?"}
                                    </h2>
                                    <p className="text-xl md:text-2xl text-white/70 mb-12 font-light leading-relaxed">
                                        {lang === 'en'
                                            ? "Join premium brands and hundreds of verified buyers in our specialized network. Let's build your market entry strategy together."
                                            : "Seçkin markalarımız ve doğrulanmış alıcı ağımıza katılın. Pazar giriş stratejinizi birlikte kurgulayalım."}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 204, 0, 0.2)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(`/${lang}/partner`)}
                                            className="bg-yellow text-navy font-bold px-10 py-5 rounded-full text-lg flex items-center space-x-3 transition-all uppercase tracking-widest"
                                        >
                                            <span>{lang === 'en' ? "Get Started Now" : "HEMEN BAŞLA"}</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.button>

                                        <button
                                            onClick={() => navigate(`/${lang}/contact`)}
                                            className="text-white hover:text-yellow font-bold text-lg flex items-center space-x-2 transition-colors group py-3"
                                        >
                                            <span>{lang === 'en' ? "Talk to an Expert" : "Bir Uzmanla Görüşün"}</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                                <Box className="w-96 h-96 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
