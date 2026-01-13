import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Scale, Shield, FileText, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import SEO from '../components/seo/SEO';
import ContactModal from '../components/ContactModal';

const TermsOfService = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const t = {
        title: lang === 'en' ? "Terms of Service | LOXTR" : "Kullanım Koşulları | LOXTR",
        hero: {
            title: lang === 'en' ? "Legal Framework" : "Yasal Çerçeve",
            desc: lang === 'en' ?
                "Transparency is the foundation of our partnership. Below are the terms governing our global trade operations." :
                "Şeffaflık ortaklığımızın temelidir. Operasyonlarımızı yöneten yasal koşulları aşağıda bulabilirsiniz."
        },
        sidebar: {
            title: lang === 'en' ? "Table of Contents" : "İçindekiler",
            download: lang === 'en' ? "Download PDF" : "PDF İndir"
        },
        sections: [
            {
                id: "intro",
                title: lang === 'en' ? "1. Introduction & Scope" : "1. Giriş ve Kapsam",
                icon: <Scale className="w-5 h-5" />,
                content: lang === 'en' ?
                    "Welcome to LOXTR. By accessing our platform, you agree to be bound by these terms. LOXTR acts as a strategic B2B trade facilitator connecting specialized Turkish manufacturers with global buyers. These terms apply to all services, including sourcing, logistics, and financial mediation." :
                    "LOXTR'a hoş geldiniz. Platformumuza erişerek bu şartlara bağlı kalmayı kabul etmiş sayılırsınız. LOXTR, Türk üreticileri ile küresel alıcıları buluşturan stratejik bir B2B ticaret kolaylaştırıcısıdır. Bu şartlar, tedarik, lojistik ve finansal aracılık dahil tüm hizmetler için geçerlidir."
            },
            {
                id: "eligibility",
                title: lang === 'en' ? "2. Business Eligibility" : "2. Ticari Uygunluk",
                icon: <CheckCircle2 className="w-5 h-5" />,
                content: lang === 'en' ?
                    "Services are strictly limited to registered business entities (B2B). Individuals purchasing for personal use are not eligible. We strictly enforce Know Your Customer (KYC) and Know Your Business (KYB) verification processes before authorizing any trade transactions." :
                    "Hizmetlerimiz yalnızca kayıtlı ticari işletmeler (B2B) ile sınırlıdır. Kişisel kullanım için satın alım yapan bireyler uygun değildir. Herhangi bir ticari işlemi onaylamadan önce Müşterini Tanı (KYC) ve İşletmeni Tanı (KYB) süreçlerini titizlikle uygularız."
            },
            {
                id: "role",
                title: lang === 'en' ? "3. LOXTR's Role & Liability" : "3. LOXTR'ın Rolü ve Sorumluluğu",
                icon: <Shield className="w-5 h-5" />,
                content: lang === 'en' ?
                    "Unless explicitly stated as the 'Exporter of Record' in a specific sales contract, LOXTR acts as an intermediary facilitator. While we perform rigorous quality audits (SGS/Bureau Veritas), ultimate product liability resides with the Manufacturer. LOXTR liability is limited to the value of its service fees." :
                    "Belirli bir satış sözleşmesinde açıkça 'İhracatçı' olarak belirtilmedikçe, LOXTR aracı kolaylaştırıcı olarak hareket eder. Sıkı kalite denetimleri (SGS/Bureau Veritas) yapmamıza rağmen, nihai ürün sorumluluğu Üreticiye aittir. LOXTR'ın sorumluluğu, hizmet bedelleriyle sınırlıdır."
            },
            {
                id: "payments",
                title: lang === 'en' ? "4. Payments & Escrow" : "4. Ödemeler ve Güvence",
                icon: <FileText className="w-5 h-5" />,
                content: lang === 'en' ?
                    "To ensure trust, significant transactions are secured via our Escrow system. Funds are held in a neutral account and released to the supplier only upon Buyer confirmation of receipt or independent inspection pass. We support SWIFT, SEPA, and Letter of Credit (LC) for orders above $50k." :
                    "Güveni sağlamak için büyük işlemler Escrow sistemimizle güvence altına alınır. Fonlar tarafsız bir hesapta tutulur ve yalnızca Alıcı onayı veya bağımsız denetim raporu sonrasında tedarikçiye aktarılır. 50 bin $ üzeri siparişlerde Akreditif (LC) destekliyoruz."
            },
            {
                id: "termination",
                title: lang === 'en' ? "5. Termination & Sanctions" : "5. Fesih ve Yaptırımlar",
                icon: <AlertCircle className="w-5 h-5" />,
                content: lang === 'en' ?
                    "LOXTR maintains a zero-tolerance policy for trade compliance violations. We reserve the right to immediately terminate accounts associated with sanctioned entities, money laundering attempts, or circumvention of international trade laws." :
                    "LOXTR, ticaret uyum ihlallerine karşı sıfır tolerans politikası izler. Yaptırım uygulanan taraflarla ilişkili hesapları, kara para aklama girişimlerini veya uluslararası ticaret yasalarını ihlal edenleri derhal feshetme hakkımızı saklı tutarız."
            }
        ]
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -120; // Offset for sticky header
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <SEO title={t.title} description="Legal terms and conditions." />

            {/* HERO SECTION */}
            <section className="bg-navy pt-32 pb-16 border-b border-white/10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-white">{t.hero.title}</h1>
                    <p className="text-xl text-white/70 max-w-2xl font-light">{t.hero.desc}</p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-12 max-w-6xl bg-off-white">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* SIDEBAR NAVIGATION (Sticky) */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-32">
                            <h3 className="text-navy font-bold uppercase tracking-wider mb-6 text-sm opacity-50">{t.sidebar.title}</h3>
                            <nav className="space-y-1 mb-8">
                                {t.sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className="block w-full text-left px-4 py-3 text-gray-600 hover:text-navy hover:bg-off-white rounded-lg cursor-pointer transition-all text-sm font-medium border-l-2 border-transparent hover:border-yellow focus:outline-none"
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </nav>

                            <button className="flex items-center space-x-2 text-navy hover:text-white bg-off-white hover:bg-yellow transition-colors text-sm font-bold border border-gray-200 hover:border-yellow px-4 py-3 rounded-lg w-full justify-center shadow-sm">
                                <Download className="w-4 h-4" />
                                <span>{t.sidebar.download}</span>
                            </button>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="lg:w-3/4 space-y-8">
                        {t.sections.map((section) => (
                            <section
                                id={section.id}
                                key={section.id}
                                className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-lg hover:border-yellow/50 transition-all group"
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-navy rounded-lg text-yellow group-hover:bg-yellow group-hover:text-navy transition-colors">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold font-heading text-navy">{section.title}</h2>
                                </div>
                                <div className="h-px w-full bg-gray-100 mb-6"></div>
                                <p className="text-navy/70 leading-relaxed text-lg font-light">
                                    {section.content}
                                </p>
                            </section>
                        ))}

                        {/* Contact Box */}
                        <div className="bg-navy p-8 rounded-xl text-center mt-12 shadow-lg">
                            <h4 className="text-white font-bold mb-4">
                                {lang === 'en' ? "Have legal questions?" : "Hukuki sorularınız mı var?"}
                            </h4>
                            <button
                                onClick={() => setContactModalOpen(true)}
                                className="bg-yellow hover:bg-yellow/90 text-navy font-bold px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all mx-auto"
                            >
                                <Mail className="w-4 h-4" />
                                <span>{lang === 'en' ? "Contact Legal Team" : "Hukuk Ekibine Ulaşın"}</span>
                            </button>
                            <p className="text-white/30 text-xs mt-6">
                                Last Updated: January 08, 2026
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <ContactModal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                lang={lang}
                title={lang === 'en' ? "Legal Inquiry" : "Hukuki Soru"}
                inquiryTypes={[lang === 'en' ? 'Legal Questions' : 'Hukuki Danışma']}
            />
        </div>
    );
};

export default TermsOfService;
