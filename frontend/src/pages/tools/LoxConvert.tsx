import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, Loader2, Download, AlertCircle, ArrowRight, HelpCircle, Send, Sparkles, Globe, ShieldCheck, Target, ExternalLink, FolderPlus, QrCode, FileType, Info, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/crm/AuthContext';

// Excel export helper
const exportToExcel = (data: any[], fileName: string) => {
    if (!data) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ConvertedData");
    XLSX.writeFile(wb, `LoxConvert_${fileName.split('.')[0]}_${new Date().getTime()}.xlsx`);
};

export default function LoxConvert() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [showPromoModal, setShowPromoModal] = useState(false);

    // Insights State
    const [insightData, setInsightData] = useState<any>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [targetCountry, setTargetCountry] = useState("Germany"); // Default
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const handleSaveToFolder = async () => {
        if (!user || !data) return;
        setSaveLoading(true);
        try {
            const { data: folder, error: fError } = await supabase
                .from('lox_folders')
                .insert({
                    user_id: user.id,
                    name: `LoxConvert: ${fileName.split('.')[0]}`,
                    metadata: { item_count: data.length, country: targetCountry }
                })
                .select()
                .single();

            if (fError) throw fError;

            const { error: dError } = await supabase
                .from('lox_documents')
                .insert({
                    user_id: user.id,
                    folder_id: folder.id,
                    doc_type: 'packing_list',
                    content: data,
                    file_name: fileName
                });

            if (dError) throw dError;
            alert("📦 Dossier saved to Smart Vault!");
        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        if (!data) return;
        setInvoiceLoading(true);
        try {
            const response = await fetch('/api/loxconvert/generate-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: data,
                    targetCountry,
                    companyInfo: { name: user?.email?.split('@')[0].toUpperCase(), address: "Exporter Address" }
                })
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
            setInvoiceData(result);
            setShowInvoiceModal(true);
        } catch (e: any) {
            console.error(e);
            alert("Invoice failed: " + e.message);
        } finally {
            setInvoiceLoading(false);
        }
    };

    const handleCreateLoxQR = () => {
        alert("🔗 LoxQR Created! Attach this to your cargo for instant digital document access.");
    };

    const handleInsights = async (item: any) => {
        setSelectedItem(item);
        setInsightLoading(true);
        setInsightData(null);

        try {
            const res = await fetch('/api/loxconvert/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hsCode: item.hs_code,
                    productDescription: item.description,
                    targetCountry: targetCountry
                })
            });

            if (!res.ok) throw new Error("Failed to get insights");
            const result = await res.json();
            setInsightData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setInsightLoading(false);
        }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setData(null);
        setFileName(file.name);
        setLoading(true);

        const validTypes = ['application/pdf', 'application/x-pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
            setError(`Please upload a valid PDF or Image.`);
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const res = await fetch('/api/loxconvert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileBase64: (reader.result as string).split(',')[1],
                        fileName: file.name,
                        mimeType: file.type || 'application/octet-stream',
                        userId: user?.id
                    })
                });

                if (!res.ok) throw new Error('Analysis failed. Please try again.');
                const resultData = await res.json();
                setData(resultData);
            } catch (err: any) {
                setError(err.message || "An error occurred.");
            } finally {
                setLoading(false);
                if (e.target) e.target.value = '';
            }
        };
    };

    return (
        <div className="min-h-screen bg-white font-outfit text-navy pb-20">
            {/* CLEAN BRAND HEADER */}
            <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
                        <Target className="text-yellow" size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter">
                            Lox<span className="text-yellow">Convert</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-[-2px]">Powered by LOXTR</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <span className="text-xs font-bold text-slate-400">Enterprise Grade Extraction</span>
                    <div className="h-4 w-px bg-slate-100" />
                    <button onClick={() => navigate('/dashboard')} className="text-xs font-bold hover:text-yellow transition-colors">Go to Dashboard</button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!data ? (
                    /* LANDING */
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto px-6 pt-16 md:pt-24"
                    >
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                                The smartest way to convert <br />
                                <span className="text-yellow">Logistics Documents</span>
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                Automatically extract line items, predict HS codes, and analyze market risks in seconds.
                            </p>
                        </div>

                        {/* UPLOAD ZONE - CLEAN & FOCUS */}
                        <div className="max-w-xl mx-auto bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all
                                ${loading ? 'border-yellow bg-white animate-pulse' : 'border-slate-200 bg-white hover:border-yellow hover:bg-slate-50'}`}
                            >
                                <input
                                    type="file"
                                    onChange={handleFile}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    disabled={loading}
                                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                                />

                                <div className="flex flex-col items-center">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all
                                        ${loading ? 'bg-yellow text-navy' : 'bg-navy text-white'}`}
                                    >
                                        {loading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {loading ? 'AI analyzing your document...' : 'Upload your document'}
                                    </h3>
                                    <p className="text-slate-400 text-sm">Drop your Packing List or Invoice PDF here</p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-8 max-w-xl mx-auto bg-red-50 text-red-600 p-4 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2 border border-red-100">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {/* STEPS - ILovePDF Style */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                            {[
                                { step: "01", title: "Upload", icon: Upload, desc: "Select your logistics document safely." },
                                { step: "02", title: "AI Extract", icon: Sparkles, desc: "Our AI identifies items and HS codes." },
                                { step: "03", title: "Scale", icon: Download, desc: "Export to Excel or create AI Invoice." }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-50 hover:shadow-lg transition-shadow">
                                    <span className="text-[10px] font-black text-yellow uppercase tracking-widest mb-4">Step {s.step}</span>
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 text-navy">
                                        <s.icon size={24} />
                                    </div>
                                    <h4 className="font-black text-lg mb-2">{s.title}</h4>
                                    <p className="text-slate-400 text-sm">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* RESULTS SCREEN - CLEAN DASHBOARD */
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-7xl mx-auto px-6 pt-12"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                            <div>
                                <button
                                    onClick={() => setData(null)}
                                    className="text-xs font-bold text-slate-400 hover:text-navy mb-4 flex items-center gap-2"
                                >
                                    <ArrowRight size={14} className="rotate-180" /> Back to Upload
                                </button>
                                <h2 className="text-3xl font-black tracking-tight">Analysis <span className="text-yellow">Ready</span></h2>
                                <p className="text-slate-400 font-medium text-sm mt-1 flex items-center gap-2">
                                    <FileText size={16} /> {fileName} • {data.length} Items Found
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => exportToExcel(data, fileName)}
                                    className="bg-navy text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-navy/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Download size={18} className="text-yellow" />
                                    Download Excel
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* TABLE CARD */}
                            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">HS Code</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Intelligence</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.map((item, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-bold block truncate max-w-[300px]">{item.description}</span>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-sm">{item.qty} <span className="text-[10px] text-slate-400">{item.unit}</span></td>
                                                    <td className="px-8 py-6">
                                                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-tight">
                                                            {item.hs_code || '---'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => handleInsights(item)}
                                                            className={`p-2 rounded-xl transition-all ${selectedItem === item ? 'bg-yellow text-navy' : 'text-slate-300 hover:text-yellow'}`}
                                                        >
                                                            <Sparkles size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* SIDEBAR CARD */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* RADAR & TARGET */}
                                <div className="bg-navy text-white rounded-[2.5rem] p-8 shadow-xl shadow-navy/20">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-yellow rounded-xl flex items-center justify-center text-navy">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-widest">Trade Radar</h4>
                                            <p className="text-[10px] text-blue-300 font-bold">Scanning Buyers</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Target Market</label>
                                        <select
                                            value={targetCountry}
                                            onChange={(e) => setTargetCountry(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow transition-all"
                                        >
                                            <option value="Germany">Germany 🇩🇪</option>
                                            <option value="United Kingdom">United Kingdom 🇬🇧</option>
                                            <option value="USA">USA 🇺🇸</option>
                                            <option value="France">France 🇫🇷</option>
                                            <option value="UAE">UAE 🇦🇪</option>
                                        </select>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                                        <p className="text-xs text-blue-200 italic leading-relaxed">
                                            "Targeting {targetCountry} database. Our AI is ready to match these {data.length} items with potential buyers."
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={handleSaveToFolder} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                                            <FolderPlus size={18} className="group-hover:text-yellow" />
                                            <span className="text-[8px] font-black uppercase">Save</span>
                                        </button>
                                        <button onClick={handleGenerateInvoice} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                                            <FileType size={18} className="group-hover:text-yellow" />
                                            <span className="text-[8px] font-black uppercase">Invoice</span>
                                        </button>
                                        <button onClick={handleCreateLoxQR} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                                            <QrCode size={18} className="group-hover:text-yellow" />
                                            <span className="text-[8px] font-black uppercase">LoxQR</span>
                                        </button>
                                    </div>
                                </div>

                                {/* INSIGHT DATA CARD */}
                                {insightData && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100"
                                    >
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">HS Intelligence</h4>
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black text-yellow uppercase tracking-widest mb-1">Detected HS Code</p>
                                            <p className="text-2xl font-black text-navy">{selectedItem?.hs_code}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 italic leading-relaxed">
                                            "{insightData.summary || 'Trade analysis ready for export.'}"
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* FOOTER - POWERED BY LOXTR */}
                        <div className="mt-20 pt-10 border-t border-slate-50 text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                                LoxConvert Powered by LOXTR Intelligence
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INVOICE MODAL - CLEAN & WHITE */}
            <AnimatePresence>
                {showInvoiceModal && invoiceData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/20 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-10 md:p-16 relative"
                        >
                            <button
                                onClick={() => setShowInvoiceModal(false)}
                                className="absolute top-8 right-8 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-xl">✕</span>
                            </button>

                            <div className="flex justify-between items-start mb-16 pb-12 border-b border-slate-100">
                                <div>
                                    <h2 className="text-4xl font-black italic tracking-tighter">AI Commercial <span className="text-yellow">Invoice</span></h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">LOXCONVERT DRAFT • {new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="text-right bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                                    <p className="text-3xl font-black">{invoiceData.currency} {invoiceData.total_amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-12">
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Exporter</h5>
                                    <p className="font-bold text-navy">{invoiceData.exporter?.name}</p>
                                    <p className="text-sm text-slate-500 mt-2">{invoiceData.exporter?.address || 'Address registered in LOXTR Profile'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Importer</h5>
                                    <p className="text-xs italic text-slate-400">Buyer match in {targetCountry} being analyzed for direct shipping...</p>
                                </div>
                            </div>

                            <div className="border border-slate-100 rounded-[2rem] overflow-hidden mb-12">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">HS Code</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoiceData.items?.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-8 py-6 text-sm font-bold">{item.description}</td>
                                                <td className="px-8 py-6"><span className="bg-slate-100 text-[10px] px-2 py-1 rounded font-black">{item.hs_code}</span></td>
                                                <td className="px-8 py-6 text-right text-sm font-black">{invoiceData.currency} 0.00</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button onClick={() => setShowInvoiceModal(false)} className="px-8 py-4 text-xs font-bold text-slate-400 hover:text-navy transition-colors">Discard Draft</button>
                                <button className="bg-navy text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-navy/20">
                                    <Download size={18} className="text-yellow" />
                                    Download PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

