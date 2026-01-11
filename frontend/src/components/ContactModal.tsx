import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Wallet, X, Send } from 'lucide-react';
import { contactAPI } from '../services/api';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
    industryName?: string; // Optional context
    title?: string;
    inquiryTypes?: string[]; // Custom dropdown options
}

const ContactModal: React.FC<ContactModalProps> = ({
    isOpen,
    onClose,
    lang,
    industryName = '',
    title,
    inquiryTypes
}) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const t = {
        title: title || (lang === 'en' ? "Quick Application" : "Hızlı Başvuru"),
        sub: lang === 'en' ? "We will contact you shortly." : "Sizi en kısa sürede arayacağız.",
        name: lang === 'en' ? "Full Name" : "Ad Soyad",
        email: lang === 'en' ? "Work Email" : "İş E-postası",
        phone: lang === 'en' ? "Phone Number" : "Telefon",
        company: lang === 'en' ? "Company Name" : "Firma Adı",
        product: lang === 'en' ? "Products & Request" : "Ürünler ve Talep",
        placeholder: lang === 'en' ? "Ex: We are a manufacturer looking for..." : "Örn: Yıllık 500 ton kapasiteli üreticiyiz...",
        btn: lang === 'en' ? "Submit Application" : "Başvuruyu Gönder",
        success: lang === 'en' ? "Received! We'll be in touch." : "Alındı! İletişime geçeceğiz.",
        err: lang === 'en' ? "Error. Try again." : "Hata. Tekrar deneyin.",
        typeLabel: lang === 'en' ? "Inquiry Type" : "Talep Türü",
        selectType: lang === 'en' ? "Select Type" : "Seçiniz"
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            company_name: formData.get('company_name'),
            phone: formData.get('phone'),
            inquiry_type: formData.get('inquiry_type') || 'Quick Application',
            subject: `App: ${industryName} - ${formData.get('inquiry_type')}`,
            message: `Context: ${industryName}\nRequest: ${formData.get('message')}`
        };

        try {
            await contactAPI.submit(data);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(t.err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="bg-charcoal border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-lg relative z-10 shadow-2xl shadow-yellow/10"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="mb-6">
                        <div className="w-12 h-12 bg-yellow/10 rounded-full flex items-center justify-center mb-3">
                            <Wallet className="w-6 h-6 text-yellow" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                        <p className="text-white/60 text-sm">{t.sub}</p>
                    </div>

                    {success ? (
                        <div className="bg-green-500/10 border border-green-500/50 p-8 rounded-xl text-center text-green-400 flex flex-col items-center">
                            <CheckCircle2 className="w-16 h-16 mb-4" />
                            <p className="text-lg font-bold">{t.success}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* DYNAMIC DROPDOWN IF TYPES PROVIDED */}
                            {inquiryTypes && inquiryTypes.length > 0 && (
                                <div className="space-y-1">
                                    <label className="text-xs text-white/40 uppercase font-bold">{t.typeLabel}</label>
                                    <select name="inquiry_type" required className="w-full bg-navy/50 border border-white/10 rounded p-3 text-white focus:border-yellow transition-colors outline-none cursor-pointer appearance-none">
                                        <option value="" disabled selected>{t.selectType}</option>
                                        {inquiryTypes.map((type, i) => (
                                            <option key={i} value={type} className="bg-navy">{type}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-white/40 uppercase font-bold">{t.name}</label>
                                    <input name="full_name" required className="w-full bg-navy/50 border border-white/10 rounded p-3 text-white focus:border-yellow transition-colors outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-white/40 uppercase font-bold">{t.company}</label>
                                    <input name="company_name" required className="w-full bg-navy/50 border border-white/10 rounded p-3 text-white focus:border-yellow transition-colors outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-white/40 uppercase font-bold">{t.email}</label>
                                    <input name="email" type="email" required className="w-full bg-navy/50 border border-white/10 rounded p-3 text-white focus:border-yellow transition-colors outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-white/40 uppercase font-bold">{t.phone}</label>
                                    <input name="phone" className="w-full bg-navy/50 border border-white/10 rounded p-3 text-white focus:border-yellow transition-colors outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-white/40 uppercase font-bold">{t.product}</label>
                                <textarea name="message" rows={3} placeholder={t.placeholder} className="w-full bg-navy/50 border border-white/10 rounded p-3 text-white focus:border-yellow transition-colors outline-none resize-none" />
                            </div>

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <button disabled={loading} className="w-full bg-yellow hover:bg-yellow/90 text-navy font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-yellow/20 flex items-center justify-center space-x-2">
                                <span>{loading ? '...' : t.btn}</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContactModal;
