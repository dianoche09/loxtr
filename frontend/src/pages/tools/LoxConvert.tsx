import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/crm/AuthContext';
import { Upload, FileText, Check, Loader2, Download, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

// Excel export helper
const exportToExcel = (data: any[], fileName: string) => {
    if (!data) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ConvertedData");
    XLSX.writeFile(wb, `LOXTR_Docs_${fileName.split('.')[0]}_${new Date().getTime()}.xlsx`);
};

export default function LoxConvert() {
    const { user } = useAuth();
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

    // SEO Title
    useEffect(() => {
        document.title = "AI Packing List & Invoice Converter | Digitizing Logistics | LOXTR Docs";
    }, []);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset
        setError(null);
        setData(null);
        setFileName(file.name);
        setLoading(true);

        // Validation
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Unsupported file format. Please upload PDF, PNG or JPG.");
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                // Since this is calling a Vercel Function in the 'api' folder at root, 
                // in dev mode (Vite), we need a proxy setup or absolute URL if running separately.
                // Assuming "vercel dev" or proxy is active. If not, this might fail locally without setup.
                // We'll assume the standard Vercel /api path convention works in production.
                // Locally, user presumably runs 'npm run dev' in frontend. 
                // To hit the root 'api', we usually need 'vercel dev' at root.
                // I will add a fallback or assume standard proxy config.

                const endpoint = '/api/loxconvert';

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileBase64: (reader.result as string).split(',')[1],
                        fileName: file.name,
                        mimeType: file.type,
                        userId: user?.id
                    })
                });

                if (!res.ok) {
                    const errDetails = await res.json().catch(() => ({}));
                    throw new Error(errDetails.error || 'Failed to analyze document');
                }

                const resultData = await res.json();
                setData(resultData);
            } catch (err: any) {
                console.error(err);
                if (err.message.includes("Daily limit reached")) {
                    setError("Daily limit exceeded. Please upgrade your plan for unlimited conversions.");
                } else {
                    setError(err.message || "An error occurred during analysis.");
                }
            } finally {
                setLoading(false);
            }
        };
        reader.onerror = () => {
            setError("Failed to read file.");
            setLoading(false);
        };
    };

    return (
        <div className="min-h-screen bg-slate-50 font-outfit p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        Beta
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-navy mb-4">LoxConvert <span className="text-yellow">AI</span></h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Transform complex logistics documents (Packing Lists, Invoices) into clean, structured Excel data in seconds using Gemini 1.5.
                    </p>
                </header>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                >
                    {/* Upload Zone */}
                    <div className="p-12 border-b border-slate-100">
                        <div className={`relative group border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300
                            ${loading ? 'border-slate-200 bg-slate-50 opacity-50 cursor-wait' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer'}`}
                        >
                            <input
                                type="file"
                                onChange={handleFile}
                                className="absolute inset-0 opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                                disabled={loading}
                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                            />

                            <div className="flex flex-col items-center gap-4">
                                {loading ? (
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <Loader2 className="animate-spin text-blue-500" size={32} />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-navy">
                                        {loading ? 'Analyzing Document...' : 'Drop your file here'}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        {loading ? 'This may take up to 30 seconds' : 'Supports PDF, PNG, JPG up to 10MB'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-3 text-sm font-medium"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}
                    </div>

                    {/* Results Area */}
                    <AnimatePresence>
                        {data && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-8 bg-slate-50/50"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                                            <FileText size={20} className="text-blue-500" />
                                            Analysis Result
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                {data.length} Items Found
                                            </span>
                                        </h2>
                                        <p className="text-slate-400 text-xs mt-1">{fileName}</p>
                                    </div>
                                    <button
                                        onClick={() => exportToExcel(data, fileName)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold shadow-lg shadow-green-600/20"
                                    >
                                        <Download size={18} />
                                        Download Excel
                                    </button>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                                                <tr>
                                                    <th className="p-4 w-12">#</th>
                                                    <th className="p-4">Description</th>
                                                    <th className="p-4 w-32">Qty</th>
                                                    <th className="p-4 w-32">Unit</th>
                                                    <th className="p-4 w-32">HS Code</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {data.map((item, i) => (
                                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="p-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                                                        <td className="p-4 font-medium text-slate-700">{item.description}</td>
                                                        <td className="p-4 font-mono text-slate-600">{item.qty}</td>
                                                        <td className="p-4 text-slate-500 text-xs uppercase">{item.unit}</td>
                                                        <td className="p-4">
                                                            {item.hs_code ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold">
                                                                    {item.hs_code}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300 text-xs italic">N/A</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* UPSELL BANNER */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-navy rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-yellow/10" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }} />
                                    <div className="relative z-10 text-white text-center md:text-left">
                                        <h3 className="text-xl font-bold mb-2">Documents ready! Need to ship this cargo?</h3>
                                        <p className="text-white/70 text-sm">Get the best freight rates from LOXTR's global network in 1 minute.</p>
                                    </div>
                                    <a href="/" target="_blank" className="relative z-10 flex items-center gap-2 bg-yellow hover:bg-yellow/90 text-navy font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-yellow/20">
                                        Get Freight Quote
                                        <ArrowRight size={18} />
                                    </a>
                                </motion.div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
