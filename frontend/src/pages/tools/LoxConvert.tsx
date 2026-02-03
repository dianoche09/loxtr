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
    Sparkles,
    Globe,
    ShieldCheck,
    FolderPlus,
    FileType,
    LayoutDashboard,
    History,
    Search,
    Copy,
    RefreshCcw,
    Zap,
    TrendingUp,
    ShieldAlert,
    Target as TargetIcon,
    Scan,
    BrainCircuit,
    Cpu,
    Boxes
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/crm/AuthContext';

// Excel export helper
const exportToExcel = (data: any[], fileName: string) => {
    if (!data) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LoxConvert_Intelligence");
    XLSX.writeFile(wb, `LoxIntelligence_${fileName.split('.')[0]}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export default function LoxConvert() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

    // Insights State
    const [insightData, setInsightData] = useState<any>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [targetCountry, setTargetCountry] = useState("Germany");
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
                    name: `AI Report: ${fileName.split('.')[0]}`,
                    metadata: { type: 'intelligence', count: data.items.length, sector: data.intelligence.commodity_category }
                })
                .select()
                .single();

            if (fError) throw fError;

            const { error: dError } = await supabase
                .from('lox_documents')
                .insert({
                    user_id: user.id,
                    folder_id: folder.id,
                    doc_type: 'marking_list_report',
                    content: data,
                    file_name: fileName
                });

            if (dError) throw dError;
            alert("📊 Intelligence Report saved to LOX Vault!");
        } catch (e: any) {
            console.error(e);
            alert("Vault error: " + e.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        if (!data?.items) return;
        setInvoiceLoading(true);
        try {
            const response = await fetch('/api/loxconvert/generate-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: data.items,
                    targetCountry,
                    companyInfo: { name: user?.email?.split('@')[0].toUpperCase(), address: "Global Logistics Hub" }
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

                if (!res.ok) throw new Error('AI Intelligence Engine failed. Please try a cleaner document.');
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
            {/* Header Removed as requested */}

            <AnimatePresence mode="wait">
                {!data ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="max-w-6xl mx-auto px-6 pt-24 md:pt-32"
                    >
                        {/* Hero Section */}
                        <div className="text-center mb-20">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-navy text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8 shadow-xl"
                            >
                                <Sparkles size={12} className="text-yellow" /> LOXCONVERT PRO IQ • ENGINE v2.1
                            </motion.div>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tight text-navy mb-8 leading-none">
                                Don't just extract.<br />
                                <span className="text-yellow bg-navy px-5 py-2 rounded-2xl inline-block -rotate-1 shadow-2xl">Understand.</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed mb-12">
                                The world's first <span className="text-navy underline decoration-yellow decoration-4 underline-offset-4">Trade Intelligence Node</span> that decodes logistics documents into actionable market insights.
                            </p>

                            {/* Main CTA Section (Hero style) */}
                            <div className="max-w-3xl mx-auto mb-24">
                                <div className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-slate-200/80 border-t-8 border-yellow relative group overflow-hidden">
                                    {/* Background Glow */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-yellow/50 blur-xl group-hover:w-full transition-all duration-700" />

                                    <div className={`relative border-2 border-dashed rounded-[2.5rem] p-12 md:p-20 text-center transition-all duration-500
                                        ${loading ? 'border-yellow bg-yellow/5' : 'border-slate-100 bg-slate-50/50 hover:border-yellow hover:bg-white'}`}
                                    >
                                        <input
                                            type="file"
                                            onChange={handleFile}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            disabled={loading}
                                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                                        />

                                        <div className="flex flex-col items-center">
                                            <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 transition-all shadow-2xl
                                                ${loading ? 'bg-navy text-yellow ring-4 ring-yellow/20 translate-y-2' : 'bg-white text-navy border border-slate-100 group-hover:-translate-y-2'}`}
                                            >
                                                {loading ? <Loader2 size={40} className="animate-spin" /> : <Upload size={40} />}
                                            </div>
                                            <h3 className="text-3xl font-black text-navy mb-3 italic tracking-tighter">
                                                {loading ? 'THINKING...' : 'INJECT DOCUMENT'}
                                            </h3>
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">AI-POWERED LOGISTICS NODE</p>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-6 flex items-center gap-4 p-6 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-200 shadow-lg"
                                        >
                                            <ShieldAlert size={20} />
                                            {error}
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Explanation / Flow Section (Hero styled) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
                                {[
                                    {
                                        icon: Scan,
                                        title: "DEEP SCAN",
                                        desc: "AI identifies every line item, weight, and unit with 99% accuracy.",
                                        tag: "Step 01"
                                    },
                                    {
                                        icon: BrainCircuit,
                                        title: "HS MAPPING",
                                        desc: "Predicts the correct 6-digit HS Code using global trade clusters.",
                                        tag: "Step 02"
                                    },
                                    {
                                        icon: Cpu,
                                        title: "RISK ENGINE",
                                        desc: "Checks cargo against market barriers and regulatory risks.",
                                        tag: "Step 03"
                                    },
                                    {
                                        icon: Boxes,
                                        title: "VAULT SYNC",
                                        desc: "Exports clean Excel, AI Invoices and saves to your trade dossier.",
                                        tag: "Step 04"
                                    }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group hover:border-yellow/50 transition-all"
                                    >
                                        <div className="absolute top-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.tag}</div>
                                        <div className="w-14 h-14 bg-slate-50 text-navy rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-navy group-hover:text-yellow transition-colors">
                                            <item.icon size={28} />
                                        </div>
                                        <h4 className="text-xl font-black text-navy mb-3 italic tracking-tighter uppercase">{item.title}</h4>
                                        <p className="text-sm text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* LOX Branding Footer inside landing */}
                        <div className="text-center opacity-20 mt-12 pb-20">
                            <p className="text-[10px] font-black uppercase tracking-[1em] text-navy">Powered by LOX Intelligence Node</p>
                        </div>
                    </motion.div>
                ) : (
                    /* Intelligence Dashboard View */
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-[1600px] mx-auto px-6 md:px-12 pt-12"
                    >
                        {/* Summary Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 bg-navy p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/10 blur-[100px] rounded-full" />

                            <div className="flex items-center gap-8 relative z-10">
                                <button
                                    onClick={() => setData(null)}
                                    className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-yellow hover:text-navy transition-all shadow-xl backdrop-blur-md"
                                >
                                    <RefreshCcw size={24} />
                                </button>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-yellow rounded flex items-center justify-center text-navy"><Sparkles size={14} /></div>
                                            <h1 className="text-lg font-black tracking-tighter uppercase italic text-yellow">LOX<span className="text-white">CONVERT PRO</span></h1>
                                        </div>
                                        <span className="w-1 h-3 bg-white/10 rounded-full" />
                                        <span className="text-white/40 text-[10px] font-bold uppercase italic tracking-widest flex items-center gap-2">
                                            SECURE NODE v2.1
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight italic">Shipment <span className="text-yellow">Intelligence.</span></h2>
                                    <div className="flex items-center gap-6 mt-3">
                                        <span className="text-xs font-black text-blue-200 uppercase tracking-widest flex items-center gap-2">
                                            <FileText size={14} className="text-yellow" /> {fileName}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="text-xs font-black text-blue-200 uppercase tracking-widest">
                                            {data.items.length} Items Indexed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 relative z-10">
                                <button onClick={() => exportToExcel(data.items, fileName)} className="px-8 py-4 bg-yellow text-navy rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
                                    <Download size={18} /> Download Excel
                                </button>
                                <button onClick={handleGenerateInvoice} className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
                                    <FileType size={18} className="text-yellow" /> AI Invoice Draft
                                </button>
                            </div>
                        </div>

                        {/* MACRO INTELLIGENCE BAR */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detected Sector</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-navy shadow-inner"><TargetIcon size={24} /></div>
                                    <h3 className="text-xl font-black text-navy leading-none italic uppercase">{data.intelligence?.commodity_category || 'Industrial'}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Customs Risk Radar</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-black text-navy italic">{data.intelligence?.risk_score}/10</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${parseInt(data.intelligence?.risk_score) > 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {parseInt(data.intelligence?.risk_score) > 5 ? 'High Attention' : 'Safe Trace'}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${parseInt(data.intelligence?.risk_score) > 5 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(data.intelligence?.risk_score || 3) * 10}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Regulatory Barrier Note</p>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2 italic">"{data.intelligence?.regulatory_notes}"</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <TrendingUp size={60} className="text-navy" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Scale Potential</p>
                                <p className="text-xs text-navy font-black leading-relaxed italic uppercase">"{data.intelligence?.market_potential}"</p>
                            </div>
                        </div>

                        {/* DASHBOARD MAIN GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            {/* Extraction Details */}
                            <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h4 className="text-xs font-black text-navy uppercase tracking-[0.2em] flex items-center gap-3">
                                        <FileText size={16} /> Item Extraction Matrix
                                    </h4>
                                    <button onClick={handleSaveToFolder} className="text-[10px] font-black text-navy uppercase tracking-widest border border-navy/10 px-4 py-2 rounded-xl hover:bg-navy hover:text-white transition-all flex items-center gap-2">
                                        {saveLoading ? <Loader2 size={12} className="animate-spin" /> : <FolderPlus size={12} />} Sync to dossier
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white border-b border-slate-50">
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">HS Confidence</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Intelligence Tool</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.items.map((item: any, i: number) => (
                                                <tr key={i} className={`group hover:bg-slate-50/80 transition-all ${selectedItem === item ? 'bg-yellow/5' : ''}`}>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-navy max-w-[350px] truncate mb-1">{item.description}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 italic">ID: 00{i + 1} • {item.weight ? (item.weight + 'KG') : 'weight N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-md font-black text-navy">{item.qty}</span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">{item.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-3">
                                                                <code className="text-xs font-black text-navy px-2 py-0.5 bg-slate-100 rounded tracking-tighter shadow-inner">{item.hs_code}</code>
                                                                <span className="text-[10px] font-black text-emerald-500">{(item.confidence * 100).toFixed(0)}%</span>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[150px] italic">"{item.logic}"</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <button
                                                            onClick={() => handleInsights(item)}
                                                            className={`p-4 rounded-2xl shadow-sm transition-all ${selectedItem === item ? 'bg-yellow text-navy rotate-12 scale-110 shadow-xl' : 'bg-slate-50 text-slate-300 hover:bg-navy hover:text-white'}`}
                                                        >
                                                            <Zap size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Intelligence Sidebar */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Simulated Target Radar */}
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-navy/5 rounded-full group-hover:scale-150 transition-transform duration-1000" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-yellow shadow-xl"><Globe size={24} /></div>
                                            <div>
                                                <h4 className="text-sm font-black text-navy uppercase tracking-widest">Market Targeting</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase italic">Buyer Discovery Mode</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Zone</p>
                                            <select
                                                value={targetCountry}
                                                onChange={(e) => setTargetCountry(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-navy outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all appearance-none cursor-pointer italic"
                                            >
                                                <option value="Germany">Germany Zone 🇩🇪</option>
                                                <option value="United Kingdom">UK Zone 🇬🇧</option>
                                                <option value="USA">USA Zone 🇺🇸</option>
                                                <option value="France">France Zone 🇫🇷</option>
                                                <option value="UAE">UAE Region 🇦🇪</option>
                                            </select>

                                            <div className="pt-8 border-t border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Suggested Buyer Verticals</p>
                                                <div className="space-y-3">
                                                    {(data.intelligence?.suggested_buyers || ["Logistics Providers", "OEM", "Wholesalers"]).map((buyer: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-white hover:border-yellow/50 transition-all cursor-crosshair group/item">
                                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-navy shadow-sm group-hover/item:bg-yellow transition-all"><TrendingUp size={16} /></div>
                                                            <span className="text-xs font-black text-navy uppercase italic">{buyer}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Item Intelligence */}
                                <AnimatePresence mode="wait">
                                    {selectedItem ? (
                                        <motion.div
                                            key={selectedItem.description}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-navy p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow/5 blur-[50px]" />

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-yellow animate-pulse"><Zap size={22} /></div>
                                                    <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em]">AI Deep Analysis</h4>
                                                </div>

                                                <div className="space-y-8">
                                                    <div>
                                                        <p className="text-[10px] font-black text-yellow uppercase tracking-widest mb-2 italic">Commodity Signature</p>
                                                        <p className="text-md font-black text-white leading-tight">{selectedItem.description}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2 italic">Trade Protocol Mapping</p>
                                                        <p className="text-3xl font-black text-yellow tracking-tighter italic font-mono">{selectedItem.hs_code}</p>
                                                    </div>
                                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                                        {insightLoading ? (
                                                            <div className="flex flex-col gap-4">
                                                                <div className="h-2 bg-white/10 rounded-full w-full animate-pulse" />
                                                                <div className="h-2 bg-white/10 rounded-full w-3/4 animate-pulse" />
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                    <span className="text-[9px] font-black text-blue-200 uppercase animate-pulse">Consulting Global API...</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-blue-100 font-bold leading-relaxed italic">
                                                                {insightData?.summary || "Global trade rules for this item are being fetched. Select 'Zap' tool on the left matrix to verify."}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="bg-slate-200/30 rounded-[3rem] p-16 text-center border-4 border-dotted border-slate-200 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 shadow-xl"><Search size={32} /></div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest max-w-[150px]">Select an item matrix to reveal deep intelligence</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer Intelligence Signature */}
                        <div className="mt-32 pt-16 border-t border-slate-200">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-slate-400">
                                <div className="flex items-center gap-4 grayscale hover:grayscale-0 transition-all opacity-40">
                                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center"><Zap className="text-yellow" size={20} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-navy">LoxIntelligence Node v2.1.IQ</span>
                                </div>
                                <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.2em] italic">
                                    <span className="text-navy">Logic Processed by Gemini 1.5 PRO</span>
                                    <span>•</span>
                                    <span>Encryption: SHA-512 Secure</span>
                                    <span>•</span>
                                    <span className="px-3 py-1 bg-navy text-white rounded cursor-pointer" onClick={() => setData(null)}>Powered by LOXTR</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smart Invoice Draft (Modal) */}
            <AnimatePresence>
                {showInvoiceModal && invoiceData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/40 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="bg-white rounded-[4rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-[0_50px_100px_rgba(0,0,0,0.2)] p-12 md:p-20 relative border border-slate-200"
                        >
                            <button
                                onClick={() => setShowInvoiceModal(false)}
                                className="absolute top-10 right-10 w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-xl backdrop-blur-sm group"
                            >
                                <RefreshCcw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
                            </button>

                            <div className="flex flex-col md:flex-row justify-between items-start mb-20 pb-16 border-b border-slate-100 gap-12">
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-navy rounded-[1.5rem] flex items-center justify-center text-yellow shadow-2xl"><FileType size={28} /></div>
                                        <h2 className="text-5xl font-black italic tracking-tighter text-navy uppercase">LOX<span className="text-yellow">INVOICE.</span></h2>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3">
                                        <Check size={14} className="text-emerald-500" /> AI-Generated Intelligence Draft
                                    </p>
                                </div>
                                <div className="text-right p-10 bg-navy text-white rounded-[3rem] w-full md:w-auto shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow/5 blur-3xl" />
                                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3">Total Estimated Global Value</p>
                                    <p className="text-5xl font-black italic text-yellow tracking-tighter">{invoiceData.currency} {invoiceData.total_amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
                                <div className="space-y-8">
                                    <div>
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Exporter / Consignee</h5>
                                        <p className="text-2xl font-black text-navy italic uppercase mb-2">{invoiceData.exporter?.name}</p>
                                        <p className="text-sm text-slate-400 font-bold leading-relaxed">{invoiceData.exporter?.address || 'Global Port Registry Verified'}</p>
                                    </div>
                                    <div className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic shadow-sm">
                                        <ShieldCheck size={14} /> Identity Confirmed
                                    </div>
                                </div>
                                <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative shadow-inner">
                                    <div className="flex items-center gap-3 mb-6">
                                        <TargetIcon size={18} className="text-navy" />
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Trade Intelligence Route</h5>
                                    </div>
                                    <p className="text-xs font-black text-navy uppercase italic mb-2">Target: {targetCountry} Market</p>
                                    <p className="text-xs font-bold text-slate-400 italic leading-relaxed">Cross-referencing {data.items.length} extracted items with Local Import Licenses and {targetCountry} preferential trade agreements via LOX Intelligence Node.</p>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-[3rem] overflow-hidden mb-20 shadow-2xl">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trade Description</th>
                                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">HS Protocol</th>
                                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (AI Est)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoiceData.items?.map((item: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="px-10 py-8 text-sm font-black text-navy uppercase italic">{item.description}</td>
                                                <td className="px-10 py-8"><span className="bg-navy text-white text-[10px] px-3 py-1.5 rounded-lg font-black italic tracking-widest shadow-md">{item.hs_code}</span></td>
                                                <td className="px-10 py-8 text-right text-sm font-black text-navy italic">{invoiceData.currency} 0.00</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-6">
                                <button onClick={() => setShowInvoiceModal(false)} className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy transition-colors italic">Cancel Protocol</button>
                                <button className="bg-navy text-white px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-6 shadow-2xl hover:bg-yellow hover:text-navy hover:-translate-y-2 transition-all duration-300 italic">
                                    <Download size={24} /> Generate Final Report (PDF)
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
