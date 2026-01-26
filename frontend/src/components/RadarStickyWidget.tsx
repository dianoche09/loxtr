import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RadarStickyWidget({ lang }: { lang: 'en' | 'tr' }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const t = {
        en: {
            badge: "L.O.X AI HUB",
            title: "L.O.X AI Radar",
            sub: "Our AI-powered radar scans global gustoms databases and trade flows 24/7 to identify high-potential buyers and gaps in the market before your competitors.",
            features: [
                {
                    title: "Live Lead Engine",
                    desc: "Real-time global trade flow analytics.",
                    icon: <Target className="w-5 h-5 text-yellow" />
                },
                {
                    title: "Verified Sources",
                    desc: "Verified companies with 95%+ trust score.",
                    icon: <ShieldCheck className="w-5 h-5 text-yellow" />
                },
                {
                    title: "Global Execution",
                    desc: "Seamless integration with LOXTR infrastructure.",
                    icon: <Zap className="w-5 h-5 text-yellow" />
                }
            ],
            data: ["Global Steel Importers (Verified)", "High-Growth Export Leads", "Customs Data Analytics"],
            cta: "Launch Intelligence Radar",
            live: "SYSTEM_LIVE"
        },
        tr: {
            badge: "L.O.X AI HUB",
            title: "L.O.X AI Radar",
            sub: "Yapay zeka destekli radarımız, gümrük verilerini ve küresel ticaret akışlarını 7/24 tarayarak rakiplerinizden önce potansiyel alıcıları ve pazar fırsatlarını tespit eder.",
            features: [
                {
                    title: "Canlı Lead Motoru",
                    desc: "Anlık küresel ticaret akışı analizleri.",
                    icon: <Target className="w-5 h-5 text-yellow" />
                },
                {
                    title: "Doğrulanmış Kaynaklar",
                    desc: "%95+ Güven puanlı doğrulanmış şirketler.",
                    icon: <ShieldCheck className="w-5 h-5 text-yellow" />
                },
                {
                    title: "Küresel Uygulama",
                    desc: "LOXTR altyapısı ile tam entegrasyon.",
                    icon: <Zap className="w-5 h-5 text-yellow" />
                }
            ],
            data: ["Global Çelik İthalatçıları", "Yüksek Potansiyelli Leadler", "Gümrük Veri Analitikleri"],
            cta: "İstihbarat Radarını Başlat",
            live: "SİSTEM_AKTİF"
        }
    };

    const content = t[lang];

    return (
        <>
            {/* New Radar Scanning Trigger (Bottom Right) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                className="fixed bottom-8 right-8 z-[60] flex items-center gap-4 group cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex flex-col items-end pointer-events-none px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-black/5">
                    <span className="text-[10px] font-black text-navy/60 uppercase tracking-[0.2em] leading-none mb-1">LOX AI</span>
                    <span className="text-sm font-black text-navy uppercase tracking-widest leading-none">RADAR</span>
                </div>

                <div className="relative w-16 h-16 drop-shadow-2xl">
                    {/* Glowing Rings */}
                    <motion.div
                        animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-yellow/20 rounded-full border border-yellow/30"
                    />

                    {/* Main Radar Body */}
                    <div className="absolute inset-0 rounded-full border border-white/20 bg-navy shadow-2xl flex items-center justify-center overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 opacity-40"
                            style={{
                                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(245, 158, 11, 0.6) 90deg, transparent 90deg)'
                            }}
                        />

                        {/* Center Icon */}
                        <div className="relative z-10">
                            <Target size={24} className="text-yellow animate-pulse" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Compact Modal Hub */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 md:backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col md:flex-row border border-white/10 my-auto"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-navy hover:text-white rounded-full flex items-center justify-center transition-all z-50 shadow-sm group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform" />
                            </button>

                            {/* Left Side: Dark Visualization */}
                            <div className="md:w-[40%] bg-[#0a0a0c] p-8 flex flex-col items-center justify-center text-white relative border-b md:border-b-0 md:border-r border-white/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-navy/50 to-charcoal opacity-100"></div>
                                <div className="relative z-10 w-full">
                                    <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center relative mx-auto mb-8 shadow-[0_0_50px_rgba(255,204,0,0.05)]">
                                        <div className="absolute inset-0 border-t border-yellow/40 rounded-full animate-spin-slow"></div>
                                        <Target size={40} className="text-yellow animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        {content.data.map((item, i) => (
                                            <div key={i} className="bg-white/5 p-2.5 px-3 rounded-xl border border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                                <span className="text-white/40 truncate mr-2">{item}</span>
                                                <span className="text-yellow">LIVE</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Information & Action */}
                            <div className="md:w-[60%] p-10 bg-white">
                                <div className="inline-flex items-center gap-2 bg-navy/5 px-3 py-1 rounded-full text-[9px] font-black text-navy uppercase tracking-widest mb-6 border border-navy/5">
                                    <Sparkles size={10} className="fill-yellow text-yellow" />
                                    {content.badge}
                                </div>
                                <h3 className="text-3xl font-black text-navy uppercase tracking-tighter leading-tight mb-4">
                                    {content.title}
                                </h3>
                                <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed max-w-[280px]">
                                    {content.sub}
                                </p>

                                <div className="space-y-4 mb-10">
                                    {content.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-navy">
                                                {f.icon}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-navy uppercase leading-none mb-1">{f.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{f.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => { navigate(`/${lang}/radar`); setIsOpen(false); }}
                                    className="w-full bg-navy text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-yellow hover:text-navy transition-all shadow-xl shadow-navy/10 active:scale-95 group"
                                >
                                    <span>{content.cta}</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
