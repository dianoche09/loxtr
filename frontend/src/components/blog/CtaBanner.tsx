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
        <div className="my-16 p-10 rounded-[2.5rem] relative overflow-hidden group bg-[#0a0a0c] border border-yellow/20 shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="flex-1">
                    <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter leading-none">{title}</h3>
                    <p className="max-w-xl text-lg text-white/50 leading-relaxed">{text}</p>
                </div>
                <button
                    onClick={() => navigate(link)}
                    className="bg-yellow hover:bg-white text-navy font-black px-10 py-5 rounded-full transition-all uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 shadow-2xl shadow-yellow/20 active:scale-95 whitespace-nowrap"
                >
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CtaBanner;
