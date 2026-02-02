import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, FileText } from 'lucide-react';

export default function HSCodeGuide() {
    useEffect(() => {
        document.title = "En Çok Aranan GTİP Kodları (2025) | HS Code Finder | LOXTR Docs";
    }, []);

    const codes = [
        { code: "1509.10", desc: "Virgin Olive Oil (Sızma Zeytinyağı)" },
        { code: "6109.10", desc: "Cotton T-Shirts (Pamuklu Tişört)" },
        { code: "0804.50", desc: "Fresh or Dried Guavas, Mangoes (Guava ve Mango)" },
        { code: "7306.30", desc: "Iron/Steel Pipes (Demir/Çelik Borular)" },
        { code: "9403.60", desc: "Wooden Furniture (Ahşap Mobilya)" },
        { code: "8708.99", desc: "Auto Parts & Accessories (Oto Yedek Parça)" },
        { code: "6203.42", desc: "Men's Cotton Trousers (Erkek Pamuklu Pantolon)" },
        { code: "1905.90", desc: "Bread, Pastry, Cakes (Ekmek, Pasta, Kek)" },
        { code: "3926.90", desc: "Other Articles of Plastics (Plastik Eşyalar)" },
        { code: "8544.49", desc: "Electric Conductors (Elektrik İletkenleri)" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-outfit p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <Search size={14} />
                        LOXTR Guide
                    </motion.div>
                    <h1 className="text-4xl font-black text-navy mb-4">Top 100 <span className="text-yellow">HS Codes</span> for Exporters</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Find the correct Harmonized System (GTİP) code for your products instantly. Or let AI find it for you from your invoice.
                    </p>
                </header>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-12">
                    <div className="p-8">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 rounded-l-lg">HS Code</th>
                                    <th className="p-4 rounded-r-lg">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {codes.map((item, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 font-mono font-bold text-blue-600">{item.code}</td>
                                        <td className="p-4 text-slate-700">{item.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 text-center text-slate-400 text-sm italic">
                            ...processing 1000+ codes...
                        </div>
                    </div>
                </div>

                {/* Call to Action to Main Tool */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="bg-navy rounded-3xl p-10 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-yellow/10" style={{ clipPath: 'circle(50% at 100% 100%)' }} />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl font-bold text-white">Can't find your code?</h2>
                        <p className="text-white/70 max-w-lg mx-auto">
                            Don't waste time scrolling tables. Upload your Invoice or Packing List, and LOXTR AI will strictly identify the correct HS Codes for every item.
                        </p>
                        <a href="/convert" className="inline-flex items-center gap-2 bg-yellow hover:bg-yellow/90 text-navy font-black px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-yellow/20 transform hover:-translate-y-1">
                            <FileText size={20} />
                            Find HS Codes with AI
                            <ArrowRight size={20} />
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
