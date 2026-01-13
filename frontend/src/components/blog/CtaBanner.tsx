import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CtaBannerProps {
    title: string;
    text: string;
    buttonText: string;
    link: string;
    type: 'partner' | 'seller';
}

const CtaBanner: React.FC<CtaBannerProps> = ({ title, text, buttonText, link, type }) => {
    const navigate = useNavigate();
    const isPartner = type === 'partner';

    return (
        <div className={`my-12 p-8 rounded-3xl relative overflow-hidden group ${isPartner ? 'bg-navy text-white' : 'bg-yellow text-navy'
            }`}>
            {/* Background Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-bold font-heading mb-2 uppercase tracking-tight">{title}</h3>
                    <p className={`max-w-xl text-lg ${isPartner ? 'text-white/80' : 'text-navy/80'}`}>{text}</p>
                </div>
                <button
                    onClick={() => navigate(link)}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg ${isPartner
                            ? 'bg-yellow text-navy hover:bg-white'
                            : 'bg-navy text-white hover:bg-white hover:text-navy'
                        }`}
                >
                    {buttonText}
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CtaBanner;
