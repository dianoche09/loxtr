import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Linkedin, Instagram, Youtube, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const { settings } = useSettings();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const t = {
        en: {
            title: "Get in Touch",
            subtitle: "Ready to unlock the Turkish market? Our expert team is here to guide your market entry and distribution strategy.",
            form: {
                title: "Send us a Message",
                name: "Full Name",
                email: "Email Address",
                phone: "Phone Number",
                company: "Company Name",
                message: "How can we help you?",
                send: "Send Message",
                sending: "Sending..."
            },
            info: {
                office: "Head Office",
                hours: "Working Hours",
                weekdays: settings?.working_hours_en || "Monday - Friday: 9:00 AM - 6:00 PM",
                weekend: "Saturday - Sunday: Closed",
                connect: "Connect With Us"
            },
            reasons: [
                "Expert Market Entry Strategy",
                "Regulatory Compliance Support",
                "Nationwide Distribution Network",
                "Local Partner Identification"
            ],
            success: "Thank you! We'll get back to you within 24 hours.",
            error: "Something went wrong. Please try again."
        },
        tr: {
            title: "İletişime Geçin",
            subtitle: "İhracat hedeflerinizi büyütelim. Ürünlerinizi global pazarlara ulaştırmak için yanınızdayız.",
            form: {
                title: "Bize Mesaj Gönderin",
                name: "Ad Soyad",
                email: "E-posta Adresi",
                phone: "Telefon Numarası",
                company: "Şirket Adı",
                message: "Size nasıl yardımcı olabiliriz?",
                send: "Mesaj Gönder",
                sending: "Gönderiliyor..."
            },
            info: {
                office: "Merkez Ofis",
                hours: "Çalışma Saatleri",
                weekdays: settings?.working_hours_tr || "Pazartesi - Cuma: 09:00 - 18:00",
                weekend: "Cumartesi - Pazar: Kapalı",
                connect: "Bizi Takip Edin"
            },
            reasons: [
                "Uçtan Uca İhracat Yönetimi",
                "Global Pazar Araştırması",
                "Lojistik ve Gümrük Çözümleri",
                "Güvenli Tahsilat Garantisi"
            ],
            success: "Teşekkürler! 24 saat içinde size geri dönüş yapacağız.",
            error: "Bir hata oluştu. Lütfen tekrar deneyin."
        }
    };

    const content = t[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const { contactAPI } = await import('../services/api');
            await contactAPI.submit({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                message: formData.message
            });

            setStatus('success');
            setFormData({ name: '', email: '', phone: '', company: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    // Construct address for map query
    const mapAddress = lang === 'en' ? settings?.office_address_en : settings?.office_address_tr;
    // Default to Istanbul if setting not loaded yet
    const queryAddress = mapAddress ? encodeURIComponent(mapAddress) : "Istanbul,Turkey";

    return (
        <div className="bg-navy min-h-screen text-white pt-20">
            <SEO
                title={lang === 'en' ? "Contact Us | LOXTR" : "İletişim | LOXTR"}
                description={content.subtitle}
            />

            {/* Hero Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/contact_hero_bg.webp')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy"></div>
                <div className="container mx-auto relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight text-white uppercase">
                            {content.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
                            {content.subtitle}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                        {/* Left Column: Info & Map (5 cols) */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-12">

                            {/* Contact Details Card */}
                            <div className="bg-charcoal/50 backdrop-blur-sm p-8 rounded-2xl border border-white/5 space-y-8">
                                <h2 className="text-2xl font-bold font-heading text-yellow uppercase tracking-wide">
                                    {content.info.office}
                                </h2>

                                <div className="space-y-6">
                                    {/* Address */}
                                    <div className="flex items-start space-x-4 group">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-yellow/10 transition-colors">
                                            <MapPin className="w-6 h-6 text-yellow" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white/90 mb-1">Address</h3>
                                            <p className="text-white/60 leading-relaxed">
                                                {lang === 'en' ? settings?.office_address_en : settings?.office_address_tr}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Link contact items with hrefs */}
                                    <a href={`tel:${settings?.company_phone}`} className="flex items-start space-x-4 group hover:opacity-80 transition-opacity">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-yellow/10 transition-colors">
                                            <Phone className="w-6 h-6 text-yellow" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white/90 mb-1">Phone</h3>
                                            <p className="text-white/60">{settings?.company_phone}</p>
                                        </div>
                                    </a>

                                    <a href={`mailto:${settings?.company_email}`} className="flex items-start space-x-4 group hover:opacity-80 transition-opacity">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-yellow/10 transition-colors">
                                            <Mail className="w-6 h-6 text-yellow" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white/90 mb-1">Email</h3>
                                            <p className="text-white/60">{settings?.company_email}</p>
                                        </div>
                                    </a>

                                    {/* Working Hours */}
                                    <div className="flex items-start space-x-4 group">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-yellow/10 transition-colors">
                                            <Clock className="w-6 h-6 text-yellow" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white/90 mb-1">{content.info.hours}</h3>
                                            <p className="text-white/60">{content.info.weekdays}</p>
                                            <p className="text-white/40 text-sm mt-1">{content.info.weekend}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="pt-8 border-t border-white/10">
                                    <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">
                                        {content.info.connect}
                                    </h3>
                                    <div className="flex space-x-4">
                                        {settings?.linkedin_url && (
                                            <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-[#0077b5] hover:text-white transition-all text-white/60">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        {settings?.instagram_url && (
                                            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-gradient-to-tr hover:from-[#f09433] hover:to-[#bc1888] hover:text-white transition-all text-white/60">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {settings?.youtube_url && (
                                            <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-lg hover:bg-[#FF0000] hover:text-white transition-all text-white/60">
                                                <Youtube className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Embedded Map */}
                            <div className="bg-charcoal/50 p-2 rounded-2xl border border-white/5 h-80 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0, borderRadius: '0.75rem', filter: 'grayscale(100%) invert(90%)' }}
                                    src={`https://maps.google.com/maps?q=${queryAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                    allowFullScreen
                                    title="Office Location"
                                ></iframe>
                            </div>
                        </div>

                        {/* Right Column: Form (7 cols) */}
                        <div className="lg:col-span-12 xl:col-span-7">
                            <div className="bg-white text-navy rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>

                                {/* Why Contact Us - Contextual Header */}
                                <div className="mb-10 relative z-10">
                                    <h2 className="text-3xl font-bold font-heading mb-4">
                                        {content.form.title}
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                        {content.reasons.map((reason, idx) => (
                                            <div key={idx} className="flex items-center space-x-2">
                                                <CheckCircle2 className="w-5 h-5 text-yellow shrink-0" />
                                                <span className="text-navy/70 font-medium">{reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase text-navy/40 tracking-wider">
                                                {content.form.name}
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-navy/5 border-2 border-transparent focus:border-yellow focus:bg-white rounded-xl px-4 py-3 text-navy font-medium outline-none transition-all placeholder:text-navy/30"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase text-navy/40 tracking-wider">
                                                {content.form.email}
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-navy/5 border-2 border-transparent focus:border-yellow focus:bg-white rounded-xl px-4 py-3 text-navy font-medium outline-none transition-all placeholder:text-navy/30"
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase text-navy/40 tracking-wider">
                                                {content.form.phone}
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-navy/5 border-2 border-transparent focus:border-yellow focus:bg-white rounded-xl px-4 py-3 text-navy font-medium outline-none transition-all placeholder:text-navy/30"
                                                placeholder="+90 555 000 0000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold uppercase text-navy/40 tracking-wider">
                                                {content.form.company}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className="w-full bg-navy/5 border-2 border-transparent focus:border-yellow focus:bg-white rounded-xl px-4 py-3 text-navy font-medium outline-none transition-all placeholder:text-navy/30"
                                                placeholder="Company Ltd."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase text-navy/40 tracking-wider">
                                            {content.form.message}
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-navy/5 border-2 border-transparent focus:border-yellow focus:bg-white rounded-xl px-4 py-3 text-navy font-medium outline-none transition-all placeholder:text-navy/30 resize-none"
                                            placeholder="..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-navy hover:bg-navy/90 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:transform-none"
                                    >
                                        <span>{status === 'loading' ? content.form.sending : content.form.send}</span>
                                        {status !== 'loading' && <Send className="w-5 h-5" />}
                                    </button>

                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-center space-x-3 text-green-800"
                                        >
                                            <CheckCircle2 className="w-6 h-6 shrink-0" />
                                            <span className="font-medium">{content.success}</span>
                                        </motion.div>
                                    )}

                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-100 border border-red-200 rounded-xl p-4 text-red-800 font-medium"
                                        >
                                            {content.error}
                                        </motion.div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
