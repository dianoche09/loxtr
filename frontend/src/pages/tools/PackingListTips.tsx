import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, CheckCircle } from 'lucide-react';

export default function PackingListTips() {
    useEffect(() => {
        document.title = "Kusursuz Çeki Listesi Nasıl Hazırlanır? | Packing List Guide | LOXTR Docs";
    }, []);

    const tips = [
        "Include distinct description for each package type.",
        "Ensure Gross Weight > Net Weight.",
        "Match Invoice numbers perfectly.",
        "List HS Codes (GTİP) for every line item.",
        "Clearly state Dimensions (LxWxH) in cm."
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-outfit p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-sm mb-4"
                    >
                        LOXTR Academy
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-navy mb-6">
                        How to Create a <span className="text-yellow">Perfect</span> Packing List
                    </h1>
                    <p className="text-xl text-slate-500">
                        Stop getting stuck at customs. Follow these 5 rules to ensure your export documentation is valid globally.
                    </p>
                </header>

                <div className="space-y-6 mb-16">
                    {tips.map((tip, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-600 font-bold">
                                {i + 1}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-navy mb-1">{tip}</h3>
                                <p className="text-slate-400 text-sm">Vital check for customs clearance.</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-4">Don't want to create it manually?</h2>
                        <p className="text-blue-100 mb-8 max-w-md">
                            Upload your rough Excel or PDF, and let LOXTR AI format it into a perfect, customs-ready Packing List in seconds.
                        </p>
                        <a href="/convert" className="inline-flex items-center gap-3 bg-white text-blue-600 font-black px-8 py-4 rounded-xl hover:shadow-2xl transition-all">
                            Convert PDF to Excel Now
                            <ArrowRight size={20} />
                        </a>
                    </div>
                    {/* Decorative */}
                    <FileText className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 rotate-12" />
                </motion.div>
            </div>
        </div>
    );
}
