import { useLocation } from 'react-router-dom';
import { Lock, Eye, Server, UserCheck, Cookie } from 'lucide-react';
import SEO from '../components/seo/SEO';

const PrivacyPolicy = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

    const t = {
        title: lang === 'en' ? "Privacy Policy | LOXTR" : "Gizlilik Politikası | LOXTR",
        hero: {
            title: lang === 'en' ? "Privacy & Data Protection" : "Gizlilik ve Veri Koruma",
            desc: lang === 'en' ?
                "At LOXTR, we take the security of your commercial data seriously. We comply with GDPR and KVKK standards." :
                "LOXTR olarak ticari verilerinizin güvenliğini ciddiye alıyoruz. KVKK ve GDPR standartlarına tam uyum sağlıyoruz."
        },
        sidebar: {
            title: lang === 'en' ? "Sections" : "Bölümler",
        },
        sections: [
            {
                id: "collection",
                title: lang === 'en' ? "1. Data Collection" : "1. Veri Toplama",
                icon: <Server className="w-5 h-5" />,
                content: lang === 'en' ?
                    "We collect business information (Tax ID, Trade Registry Gazette) and representative contact details necessary to facilitate B2B trade. This includes data provided via partnership forms and KYC documents." :
                    "B2B ticareti kolaylaştırmak için gerekli olan ticari bilgileri (Vergi No, Ticaret Sicil Gazetesi) ve temsilci iletişim detaylarını topluyoruz. Buna ortaklık formları ve KYC belgeleri aracılığıyla sağlanan veriler dahildir."
            },
            {
                id: "usage",
                title: lang === 'en' ? "2. Use of Information" : "2. Bilgilerin Kullanımı",
                icon: <UserCheck className="w-5 h-5" />,
                content: lang === 'en' ?
                    "Your data is used strictly for: verification of business legitimacy, customs clearance processing, and matchmaking with relevant manufacturers/buyers. We do not sell data to third parties." :
                    "Verileriniz sadece şu amaçlarla kullanılır: ticari meşruiyetin doğrulanması, gümrük işlemlerinin yürütülmesi ve ilgili üretici/alıcılarla eşleştirme. Verileri üçüncü taraflara satmıyoruz."
            },
            {
                id: "security",
                title: lang === 'en' ? "3. Data Security" : "3. Veri Güvenliği",
                icon: <Lock className="w-5 h-5" />,
                content: lang === 'en' ?
                    "We employ enterprise-grade encryption for all sensitive documents. Access to trade secrets is restricted to authorized personnel directly involved in your specific operations." :
                    "Hassas belgeler için kurumsal düzeyde şifreleme kullanıyoruz. Ticari sırlara erişim, yalnızca operasyonlarınızla doğrudan ilgili yetkili personelle sınırlandırılmıştır."
            },
            {
                id: "cookies",
                title: lang === 'en' ? "4. Cookies & Tracking" : "4. Çerezler ve Takip",
                icon: <Cookie className="w-5 h-5" />,
                content: lang === 'en' ?
                    "We use essential cookies to maintain session security and analytical cookies to improve platform performance. You can manage your preferences via your browser settings." :
                    "Oturum güvenliğini sağlamak için zorunlu çerezleri ve platform performansını iyileştirmek için analitik çerezleri kullanıyoruz. Tercihlerinizi tarayıcı ayarlarından yönetebilirsiniz."
            },
            {
                id: "rights",
                title: lang === 'en' ? "5. Your Rights" : "5. Haklarınız",
                icon: <Eye className="w-5 h-5" />,
                content: lang === 'en' ?
                    "You have the right to request access to, correction of, or deletion of your personal data. For KVKK/GDPR inquiries, contact our Data Protection Officer." :
                    "Kişisel verilerinize erişme, düzeltme veya silme talebinde bulunma hakkına sahipsiniz. KVKK/GDPR talepleri için Veri Koruma Görevlimizle iletişime geçebilirsiniz."
            }
        ]
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -120;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white min-h-screen pt-20">
            <SEO title={t.title} description="Privacy Policy and Data Protection standards." />

            <section className="bg-navy py-16 border-b border-white/10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-white">{t.hero.title}</h1>
                    <p className="text-xl text-white/70 max-w-2xl font-light">{t.hero.desc}</p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-12 max-w-6xl bg-off-white">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-1/4">
                        <div className="sticky top-32">
                            <h3 className="text-navy font-bold uppercase tracking-wider mb-6 text-sm">{t.sidebar.title}</h3>
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
                        </div>
                    </div>

                    <div className="lg:w-3/4 space-y-8">
                        {t.sections.map((section) => (
                            <section
                                id={section.id}
                                key={section.id}
                                className="bg-white border border-gray-200 p-8 rounded-2xl hover:border-yellow/50 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-navy rounded-lg text-yellow group-hover:bg-yellow group-hover:text-navy transition-colors">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold font-heading text-navy">{section.title}</h2>
                                </div>
                                <div className="h-px w-full bg-gray-200 mb-6"></div>
                                <p className="text-gray-700 leading-relaxed text-lg font-light">
                                    {section.content}
                                </p>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
