import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    Check,
    Loader2,
    Download,
    AlertCircle,
    ArrowRight,
    HelpCircle,
    Sparkles,
    Globe,
    ShieldCheck,
    FolderPlus,
    QrCode,
    FileType,
    LayoutDashboard,
    History,
    Search,
    Copy,
    RefreshCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/crm/AuthContext';

// Excel export helper
const exportToExcel = (data: any[], fileName: string) => {
    if (!data) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LoxConvert_Export");
    XLSX.writeFile(wb, `LoxConvert_${fileName.split('.')[0]}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export default function LoxConvert() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

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
                    name: `Extract: ${fileName.split('.')[0]}`,
                    metadata: { type: 'conversion', count: data.length, country: targetCountry }
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
            alert("📦 Data synced to your LOX Vault!");
        } catch (e: any) {
            console.error(e);
            alert("Vault error: " + e.message);
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
                    companyInfo: { name: user?.email?.split('@')[0].toUpperCase(), address: "Global Logistics" }
                })
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
            setInvoiceData(result);
            setShowInvoiceModal(true);
        } catch (e: any) {
            console.error(e);
            alert("Invoice engine failed: " + e.message);
        } finally {
            setInvoiceLoading(false);
        }
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
            setError(`Format not supported. Please use PDF or Image.`);
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

                if (!res.ok) throw new Error('AI Engine failed. Please try a cleaner document.');
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
        <div className="min-h-screen bg-slate-50 font-outfit text-slate-900 pb-20 selection:bg-yellow/30">
            {/* SaaS Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Sparkles className="text-yellow" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none text-navy">
                            LOX<span className="text-yellow">CONVERT</span>
                            <span className="ml-1 px-1.5 py-0.5 bg-navy/5 text-[8px] font-black rounded uppercase tracking-widest align-middle">AI</span>
                        </h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Powered by LOXTR Intelligence</p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    <button onClick={() => navigate('/vault')} className="text-xs font-bold text-slate-500 hover:text-navy flex items-center gap-2 transition-colors">
                        <History size={14} /> My History
                    </button>
                    <button onClick={() => navigate('/crm/dashboard')} className="text-xs font-bold text-slate-500 hover:text-navy flex items-center gap-2 transition-colors">
                        <LayoutDashboard size={14} /> CRMLink
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Engine Online</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                        {user?.email?.charAt(0).toUpperCase() || 'G'}
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!data ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="max-w-4xl mx-auto px-6 pt-16 md:pt-24"
                    >
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-yellow/10 text-yellow text-[10px] font-black uppercase tracking-widest rounded-full mb-6"
                            >
                                <ShieldCheck size={12} /> Secure Trade Protocol v2.1
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-navy mb-4">
                                Professional <span className="text-yellow">Logistics Data</span> Extraction
                            </h2>
                            <p className="text-base text-slate-500 max-w-xl mx-auto font-medium">
                                Convert any packing list or commercial invoice into structured,  intelligence-mapped data in seconds.
                            </p>
                        </div>

                        {/* Professional Upload Card */}
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/60 border border-slate-200">
                            <div className={`relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300
                                ${loading ? 'border-yellow bg-yellow/5' : 'border-slate-100 bg-slate-50/30 hover:border-yellow hover:bg-white'}`}
                            >
                                <input
                                    type="file"
                                    onChange={handleFile}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    disabled={loading}
                                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                                />

                                <div className="flex flex-col items-center">
                                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-all shadow-xl
                                        ${loading ? 'bg-navy text-yellow' : 'bg-white text-navy border border-slate-100'}`}
                                    >
                                        {loading ? <Loader2 size={36} className="animate-spin" /> : <Upload size={36} />}
                                    </div>
                                    <h3 className="text-2xl font-black text-navy mb-2">
                                        {loading ? 'AI Engine Processing...' : 'Upload Document'}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium">Select a PDF, PNG or JPG to begin extraction</p>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100"
                                >
                                    <AlertCircle size={18} />
                                    {error}
                                </motion.div>
                            )}
                        </div>

                        {/* Fast Actions / Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
                            {[
                                { title: "HS Mapping", icon: Search, desc: "Automatic HS code prediction based on trade clusters." },
                                { title: "Vault Sync", icon: FolderPlus, desc: "Seamlessly save results to your company dossier." },
                                { title: "Multi-Market", icon: Globe, desc: "Analyze risks across G20 and UAE market zones." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-slate-100">
                                    <div className="shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-navy shadow-sm">
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-navy uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* Dashboard View */
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-[1600px] mx-auto px-6 md:px-12 pt-12"
                    >
                        {/* Summary Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 bg-white p-8 rounded-[2rem] border border-slate-200">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setData(null)}
                                    className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-navy hover:text-white transition-all shadow-sm"
                                    title="New Upload"
                                >
                                    <RefreshCcw size={20} />
                                </button>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="px-2 py-0.5 bg-yellow text-navy text-[8px] font-black uppercase tracking-widest rounded">Extraction Ready</span>
                                        <h2 className="text-2xl font-black text-navy uppercase tracking-tight italic">LOX_INT_04</h2>
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                                        <FileText size={14} /> {fileName} • <span className="text-navy">{data.length} LINE ITEMS DETECTED</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => exportToExcel(data, fileName)}
                                    className="px-6 py-3.5 bg-yellow text-navy rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-yellow/20 hover:-translate-y-1 transition-all"
                                >
                                    <Download size={16} /> Export to Excel
                                </button>
                                <button
                                    onClick={handleGenerateInvoice}
                                    className="px-6 py-3.5 bg-navy text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-navy/20 hover:-translate-y-1 transition-all"
                                >
                                    <FileType size={16} className="text-yellow" /> Create AI Invoice
                                </button>
                                <button
                                    onClick={handleSaveToFolder}
                                    className="px-6 py-3.5 bg-white border border-slate-200 text-navy rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all"
                                >
                                    {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />} Save to Vault
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Main Grid Card */}
                            <div className="lg:col-span-9 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Row</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Description</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty / Unit</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">HS Prediction</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.map((item, i) => (
                                                <tr key={i} className={`group hover:bg-slate-50/50 transition-colors ${selectedItem === item ? 'bg-yellow/5' : ''}`}>
                                                    <td className="px-8 py-6 text-xs font-black text-slate-300">{(i + 1).toString().padStart(2, '0')}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-navy group-hover:text-white transition-all">
                                                                <FileText size={14} />
                                                            </div>
                                                            <span className="text-sm font-bold text-navy max-w-[400px] truncate">{item.description}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-navy">{item.qty}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <code className="px-2 py-1 bg-slate-100 rounded text-xs font-black text-navy tracking-tighter">
                                                                {item.hs_code || 'UNMAPPED'}
                                                            </code>
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(item.hs_code); alert("HS Code copied"); }}
                                                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-navy p-1 transition-all"
                                                            >
                                                                <Copy size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => handleInsights(item)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                                                ${selectedItem === item ? 'bg-navy text-white' : 'bg-slate-50 text-slate-400 hover:bg-yellow hover:text-navy shadow-sm'}`}
                                                        >
                                                            Intelligence
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Info Sidebar */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Country Select */}
                                <div className="bg-navy text-white rounded-[2rem] p-8 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-yellow">
                                            <Globe size={22} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest italic">Target Market</h4>
                                    </div>
                                    <select
                                        value={targetCountry}
                                        onChange={(e) => setTargetCountry(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow focus:ring-1 focus:ring-yellow transition-all"
                                    >
                                        <option value="Germany" className="text-navy">Germany 🇩🇪</option>
                                        <option value="United Kingdom" className="text-navy">United Kingdom 🇬🇧</option>
                                        <option value="USA" className="text-navy">USA 🇺🇸</option>
                                        <option value="France" className="text-navy">France 🇫🇷</option>
                                        <option value="UAE" className="text-navy">UAE 🇦🇪</option>
                                    </select>
                                    <div className="mt-6 flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <Sparkles className="text-yellow shrink-0 mt-0.5" size={14} />
                                        <p className="text-[10px] text-blue-100/60 font-medium leading-relaxed">
                                            Analyzing these {data.length} items for compliance in {targetCountry}. Switch market to update risks.
                                        </p>
                                    </div>
                                </div>

                                {/* Intelligence Display */}
                                <AnimatePresence mode="wait">
                                    {selectedItem ? (
                                        <motion.div
                                            key={selectedItem.description}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40"
                                        >
                                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                                <div className="w-8 h-8 bg-yellow rounded-lg flex items-center justify-center text-navy">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market IQ</h4>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-yellow uppercase tracking-widest mb-1">Row Identity</p>
                                                    <p className="text-sm font-bold text-navy line-clamp-2">{selectedItem.description}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HS Protocol</p>
                                                    <p className="text-2xl font-black text-navy italic">{selectedItem.hs_code}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    {insightLoading ? (
                                                        <div className="flex items-center gap-3">
                                                            <Loader2 size={14} className="animate-spin text-navy" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase animate-pulse">Consulting AI...</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                            {insightData?.summary || "Select 'Intelligence' to run market analysis."}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="bg-slate-100/50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an item to view intelligence</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Professional Footer */}
                        <div className="mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center text-yellow">
                                    <Sparkles size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-navy">LoxConvert Intelligence Node</span>
                            </div>
                            <div className="flex items-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Secured by SHA-256</span>
                                <span>•</span>
                                <span>v2.1.0-Rel</span>
                                <span>•</span>
                                <span className="text-navy">Powered by LOXTR</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smart Invoice Modal - Clean White Dashboard */}
            <AnimatePresence>
                {showInvoiceModal && invoiceData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/20 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-10 md:p-16 relative border border-slate-200"
                        >
                            <button
                                onClick={() => setShowInvoiceModal(false)}
                                className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-sm"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col md:flex-row justify-between items-start mb-16 pb-12 border-b border-slate-100 gap-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-yellow">
                                            <FileType size={20} />
                                        </div>
                                        <h2 className="text-4xl font-black italic tracking-tighter text-navy uppercase">LOX<span className="text-yellow">INVOICE</span></h2>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Draft ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                </div>
                                <div className="text-right p-8 bg-slate-50 rounded-[2rem] border border-slate-100 w-full md:w-auto">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Value</p>
                                    <p className="text-4xl font-black text-navy">{invoiceData.currency} {invoiceData.total_amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                                <div className="space-y-6">
                                    <div>
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Exporter Profile</h5>
                                        <p className="text-xl font-black text-navy italic">{invoiceData.exporter?.name}</p>
                                        <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">{invoiceData.exporter?.address || 'Verified LOX Network Account'}</p>
                                    </div>
                                    <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-lg inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        <ShieldCheck size={12} /> Verified Identity
                                    </div>
                                </div>
                                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Globe size={80} className="text-navy" />
                                    </div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Consignee Intelligence</h5>
                                    <p className="text-xs font-bold text-slate-400 italic">Matching your items with prime importers in {targetCountry}...</p>
                                    <div className="mt-8 pt-8 border-t border-slate-200/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow animate-pulse" />
                                            <span className="text-[10px] font-black uppercase text-navy">LOX AI Radar: Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-[2.5rem] overflow-hidden mb-12 shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">HS Code</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (EST)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoiceData.items?.map((item: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50/30">
                                                <td className="px-8 py-6 text-sm font-bold text-navy truncate max-w-md">{item.description}</td>
                                                <td className="px-8 py-6 uppercase"><span className="bg-slate-100 text-[10px] px-2 py-1 rounded font-black text-navy">{item.hs_code}</span></td>
                                                <td className="px-8 py-6 text-right text-sm font-black text-navy">{invoiceData.currency} 0.00</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                <button onClick={() => setShowInvoiceModal(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-navy transition-colors">Discard Draft</button>
                                <button className="bg-navy text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-navy/30 hover:-translate-y-1 active:translate-y-0 transition-all">
                                    <Download size={20} className="text-yellow" /> Download Final PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Fixed X icon since lucide-react was sometimes missing it in my local context check
function X({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    )
}
