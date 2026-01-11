import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Download, CheckCircle2 } from 'lucide-react';

interface ExitPopupProps {
    lang: 'en' | 'tr';
}

const ExitPopup: React.FC<ExitPopupProps> = ({ lang }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 0 && !localStorage.getItem('loxtr_exit_popup_dismissed')) {
                setIsVisible(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('loxtr_exit_popup_dismissed', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('http://localhost:8000/api/v1/newsletter/subscribe/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => handleClose(), 3000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const content = {
        en: {
            title: "Wait! Don't Miss Out.",
            subtitle: "Download our '2026 Turkish Market Entry Guide' for free before you go.",
            placeholder: "Enter your business email",
            button: "Get Free Guide",
            success: "Guide sent to your email!",
            footer: "No spam. Just value."
        },
        tr: {
            title: "Durun! Fırsatı Kaçırmayın.",
            subtitle: "Gitmeden önce '2026 İhracat Strateji Rehberi'ni ücretsiz indirin.",
            placeholder: "İş e-posta adresinizi girin",
            button: "Ücretsiz Rehberi Al",
            success: "Rehber e-postanıza gönderildi!",
            footer: "Spam yok. Sadece değer."
        }
    }[lang];

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-navy/60">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-w-2xl w-full relative border border-white/20"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-400"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col md:flex-row">
                            {/* Left: Visual */}
                            <div className="md:w-5/12 bg-navy p-12 flex flex-col justify-center items-center text-center">
                                <Download className="w-16 h-16 text-yellow mb-6" />
                                <div className="text-white font-heading font-bold text-2xl mb-2 tracking-tight">FREE GUIDE</div>
                                <div className="text-white/40 text-xs uppercase tracking-widest font-bold">PDF • 45 Pages</div>
                            </div>

                            {/* Right: Form */}
                            <div className="md:w-7/12 p-8 md:p-12">
                                <h2 className="text-3xl font-heading font-bold text-navy mb-4 leading-tight">
                                    {content.title}
                                </h2>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    {content.subtitle}
                                </p>

                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-green-50 text-green-700 p-6 rounded-2xl flex items-center space-x-4 border border-green-100"
                                    >
                                        <CheckCircle2 className="w-8 h-8 shrink-0" />
                                        <span className="font-bold">{content.success}</span>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={content.placeholder}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow focus:bg-white rounded-2xl px-6 py-4 text-navy font-medium outline-none transition-all placeholder:text-gray-400"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full bg-navy text-white font-bold px-8 py-4 rounded-2xl hover:bg-navy/90 transition-all shadow-xl shadow-navy/10 flex items-center justify-center space-x-3"
                                        >
                                            <span>{status === 'loading' ? '...' : content.button}</span>
                                            <Send className="w-5 h-5" />
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-4 italic">
                                            {content.footer}
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ExitPopup;
