import React, { useState } from 'react';
import {
    Mail,
    Linkedin,
    Instagram,
    Youtube,
    ChevronRight,
    ShieldCheck,
    Globe
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { CONFIG } from '../siteConfig';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useSettings();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleNav = (path: string) => {
        navigate(`/${lang}${path}`);
        window.scrollTo(0, 0);
    };

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail || newsletterStatus === 'loading') return;

        setNewsletterStatus('loading');
        try {
            const { newsletterAPI } = await import('../services/api');
            await newsletterAPI.subscribe(newsletterEmail);

            setNewsletterStatus('success');
            setNewsletterEmail('');
            setTimeout(() => setNewsletterStatus('idle'), 3000);
        } catch (error) {
            setNewsletterStatus('error');
            setTimeout(() => setNewsletterStatus('idle'), 3000);
        }
    };

    const t = {
        en: {
            tagline: "Bridging Markets, Building Futures.",
            description: "Your trusted partner for effortless entry into the Turkish market and global trade expansion.",
            services: {
                title: "Our Solutions",
                links: [
                    { label: "Market Entry", path: "/solutions" },
                    { label: "Distributorship", path: "/distribution" },
                    { label: "Partner Program", path: "/partner" }
                ]
            },
            links: {
                title: "Quick Links",
                links: [
                    { label: "About Us", path: "/about" },
                    { label: "Contact", path: "/contact" },
                    { label: "Blog", path: "/blog" },
                    { label: "FAQ", path: "/faq" },
                    { label: "Privacy Policy", path: "/privacy" },
                    { label: "Terms of Service", path: "/terms" }
                ]
            },
            newsletter: {
                title: "Stay Ahead",
                text: "Get the latest insights on Turkish trade and global market trends.",
                placeholder: "Enter your email",
                button: "Subscribe",
                success: "Welcome aboard!",
                error: "Something went wrong."
            },
            contact: "Contact Us",
            rights: "All rights reserved."
        },
        tr: {
            tagline: "Pazarları Birleştirir, Geleceği İnşaa Eder.",
            description: "Türkiye'nin ihracat potansiyelini dünyaya açan, güvenilir dış ticaret ortağınız.",
            services: {
                title: "Hizmetlerimiz",
                links: [
                    { label: "İhracat Yönetimi", path: "/cozumler" },
                    { label: "Pazar Araştırması", path: "/export-solutions" },
                    { label: "İhracat Ortaklığı", path: "/partner" }
                ]
            },
            links: {
                title: "Hızlı Erişim",
                links: [
                    { label: "Hakkımızda", path: "/about" },
                    { label: "İletişim", path: "/contact" },
                    { label: "Blog", path: "/blog" },
                    { label: "SSS", path: "/faq" },
                    { label: "Gizlilik Politikası", path: "/privacy" },
                    { label: "Kullanım Koşulları", path: "/terms" }
                ]
            },
            newsletter: {
                title: "Bültene Abone Olun",
                text: "İhracat fırsatları ve pazar trendlerinden ilk siz haberdar olun.",
                placeholder: "E-posta adresiniz",
                button: "Abone Ol",
                success: "Aramıza hoşgeldiniz!",
                error: "Bir hata oluştu."
            },
            contact: "İletişim",
            rights: "Tüm hakları saklıdır."
        }
    };

    const content = t[lang];

    return (
        <footer className="bg-navy text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

                    {/* Column 1: Brand */}
                    <div className="space-y-6">
                        <div className="mb-6">
                            <img
                                src="/images/logo-icon-footer.png"
                                alt="LOXTR"
                                className="w-32 h-auto"
                            />
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            {content.description}
                        </p>
                        <div className="flex space-x-3 pt-2">
                            {(settings?.linkedin_url || CONFIG.socials.linkedin) && (
                                <a href={settings?.linkedin_url || CONFIG.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-[#0077b5] hover:text-white transition-all text-white/60"><Linkedin className="w-5 h-5" /></a>
                            )}
                            {(settings?.instagram_url || CONFIG.socials.instagram) && (
                                <a href={settings?.instagram_url || CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-gradient-to-tr hover:from-[#f09433] hover:to-[#bc1888] hover:text-white transition-all text-white/60"><Instagram className="w-5 h-5" /></a>
                            )}
                            {(settings?.youtube_url || CONFIG.socials.youtube) && (
                                <a href={settings?.youtube_url || CONFIG.socials.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-[#FF0000] hover:text-white transition-all text-white/60"><Youtube className="w-5 h-5" /></a>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Services */}
                    <div>
                        <h4 className="font-heading font-bold text-lg mb-6 text-white uppercase tracking-wider">{content.services.title}</h4>
                        <ul className="space-y-3">
                            {content.services.links.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        onClick={() => handleNav(link.path)}
                                        className="text-white/60 hover:text-yellow transition-colors cursor-pointer flex items-center group"
                                    >
                                        <ChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity -ml-5 group-hover:ml-0 text-yellow" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Quick Links */}
                    <div>
                        <h4 className="font-heading font-bold text-lg mb-6 text-white uppercase tracking-wider">{content.links.title}</h4>
                        <ul className="space-y-3">
                            {content.links.links.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        onClick={() => handleNav(link.path)}
                                        className="text-white/60 hover:text-yellow transition-colors cursor-pointer flex items-center group"
                                    >
                                        <ChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity -ml-5 group-hover:ml-0 text-yellow" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Newsletter & Contact */}
                    <div>
                        <h4 className="font-heading font-bold text-lg mb-6 text-white uppercase tracking-wider">{content.newsletter.title}</h4>
                        <p className="text-white/60 text-sm mb-4 leading-relaxed">{content.newsletter.text}</p>

                        <form onSubmit={handleNewsletterSubmit} className="flex mb-8">
                            <input
                                type="email"
                                placeholder={content.newsletter.placeholder}
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                disabled={newsletterStatus === 'loading'}
                                className="bg-white/5 border border-white/10 px-4 py-3 rounded-l-lg w-full focus:outline-none focus:border-yellow text-sm disabled:opacity-50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={newsletterStatus === 'loading'}
                                className="bg-yellow text-navy px-4 py-3 rounded-r-lg font-bold hover:bg-yellow/90 transition-colors disabled:opacity-50"
                            >
                                {newsletterStatus === 'loading' ? <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin"></div> : <ChevronRight className="w-5 h-5" />}
                            </button>
                        </form>
                        {newsletterStatus === 'success' && <p className="text-green-400 text-xs -mt-6 mb-6 flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> {content.newsletter.success}</p>}
                        {newsletterStatus === 'error' && <p className="text-red-400 text-xs -mt-6 mb-6">{content.newsletter.error}</p>}

                        <div className="space-y-3 text-white/60 text-sm">
                            <div className="flex items-center space-x-3 group">
                                <Mail className="w-4 h-4 text-yellow group-hover:text-white transition-colors" />
                                <span className="group-hover:text-white transition-colors">{settings?.company_email || CONFIG.company.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/40 text-sm">
                    <div className="mb-4 md:mb-0">
                        © {new Date().getFullYear()} {lang === 'tr' ? CONFIG.company.legal.tr : CONFIG.company.legal.en}. {content.rights}
                    </div>

                    {/* Trust Badges (Visual Only) */}
                    <div className="flex space-x-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center space-x-1 border border-white/20 rounded px-2 py-1">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold">SSL Secure</span>
                        </div>
                        <div className="flex items-center space-x-1 border border-white/20 rounded px-2 py-1">
                            <Globe className="w-4 h-4" />
                            <span className="text-xs font-bold">Global Trade</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
