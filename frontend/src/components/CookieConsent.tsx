import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem('loxtr_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('loxtr_cookie_consent', 'accepted');
        setIsVisible(false);
        // Here you would trigger GA initialization if it wasn't already loaded
        // Since we loaded GA via index.html, we assume implicit consent or just banner display for compliance UI
    };

    const handleDecline = () => {
        localStorage.setItem('loxtr_cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
                >
                    <div className="max-w-4xl mx-auto bg-navy/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 md:flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center">
                                <ShieldCheck className="w-5 h-5 text-yellow mr-2" />
                                Cookie Consents & Privacy
                            </h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                We use cookies to improve your experience and analyze traffic. By continuing to use our site, you agree to our
                                <a href="/privacy" className="text-yellow hover:underline ml-1">Privacy Policy</a> and
                                <a href="/terms" className="text-yellow hover:underline ml-1">Terms of Service</a>.
                                This ensures we comply with GDPR and KVKK regulations.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-4 md:mt-0">
                            <button
                                onClick={handleDecline}
                                className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-8 py-3 rounded-xl bg-yellow text-navy font-bold hover:bg-yellow/90 transition-colors shadow-lg shadow-yellow/10"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
