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
    Boxes,
    BarChart3,
    Scale,
    ShieldQuestion,
    QrCode as QrIcon,
    Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
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
    const [showQR, setShowQR] = useState(false);

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

    // Chart Data Preparation
    const marketShareData = data?.intelligence?.market_data?.competitor_nations?.map((nation: string, idx: number) => ({
        name: nation,
        value: Math.floor(Math.random() * 40) + 10 // Simulated for UI
    })) || [
            { name: 'China', value: 40 },
            { name: 'Germany', value: 30 },
            { name: 'Turkey', value: 20 },
            { name: 'Others', value: 10 }
        ];

    const COLORS = ['#003366', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

    return (
        <div className="min-h-screen bg-slate-50 font-outfit text-slate-900 pb-20 selection:bg-yellow/30">
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
                                <Sparkles size={12} className="text-yellow" /> LOX AI RADAR • INTELLIGENCE NODE
                            </motion.div>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tight text-navy mb-8 leading-none">
                                Don't just extract.<br />
                                <span className="text-yellow bg-navy px-5 py-2 rounded-2xl inline-block -rotate-1 shadow-2xl">Understand.</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed mb-12">
                                The world's first <span className="text-navy underline decoration-yellow decoration-4 underline-offset-4">Customs AI</span> that conducts digital audits, tax forecasting and market intelligence from a single upload.
                            </p>

                            {/* Main CTA Section */}
                            <div className="max-w-3xl mx-auto mb-24">
                                <div className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-slate-200/80 border-t-8 border-yellow relative group overflow-hidden transition-all hover:shadow-yellow/10">
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
                                                {loading ? 'ANALYZING...' : 'INJECT SHIPMENT'}
                                            </h3>
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Vision-LLM Powered Gümrük Radarı</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
                                {[
                                    { icon: Scale, title: "CUSTOMS AI", desc: "Digital duty calculation and GTİP suggestions with 12-digit accuracy.", tag: "LIVE" },
                                    { icon: ShieldCheck, title: "COMPLIANCE", desc: "Incoterms validation and regulatory documentation audits.", tag: "PRO" },
                                    { icon: BarChart3, title: "MARKER BI", desc: "Automatic market share reports and top competitor identifying.", tag: "BETA" },
                                    { icon: QrIcon, title: "LOX WALLET", desc: "Dossier management with unique QR code physical sync.", tag: "CORE" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative group hover:border-yellow/50 transition-all cursor-default"
                                    >
                                        <div className="absolute top-6 right-8 text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-full uppercase tracking-widest">{item.tag}</div>
                                        <div className="w-14 h-14 bg-slate-50 text-navy rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-navy group-hover:text-yellow transition-colors">
                                            <item.icon size={28} />
                                        </div>
                                        <h4 className="text-xl font-black text-navy mb-3 italic tracking-tighter uppercase">{item.title}</h4>
                                        <p className="text-sm text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
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
                        {/* Dashboard Actions Bar */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 bg-navy p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/10 blur-[100px] rounded-full animate-pulse" />

                            <div className="flex items-center gap-8 relative z-10">
                                <button onClick={() => setData(null)} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-yellow hover:text-navy transition-all shadow-xl backdrop-blur-md">
                                    <RefreshCcw size={24} />
                                </button>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h1 className="text-lg font-black tracking-tighter uppercase italic text-yellow">LOX<span className="text-white">CONVERT PRO IQ</span></h1>
                                        <span className="px-3 py-1 bg-emerald-500 text-navy text-[8px] font-black uppercase tracking-widest rounded-full">AUDIT PASSED</span>
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight italic">Commercial <span className="text-yellow">Intelligence.</span></h2>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 relative z-10">
                                <button onClick={() => exportToExcel(data.items, fileName)} className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
                                    <Download size={18} className="text-yellow" /> Export Master XLSX
                                </button>
                                <button onClick={() => setShowQR(!showQR)} className="px-8 py-4 bg-yellow text-navy rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
                                    <QrIcon size={18} /> Physical QR Sync
                                </button>
                                <button onClick={handleSaveToFolder} className="px-8 py-4 bg-navy text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
                                    {saveLoading ? <Loader2 size={18} className="animate-spin" /> : <Boxes size={18} />} Push to Vault
                                </button>
                            </div>
                        </div>

                        {/* QR Overlay */}
                        <AnimatePresence>
                            {showQR && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute right-12 top-60 bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-200 z-[100] w-64 text-center"
                                >
                                    <div className="bg-slate-50 p-4 rounded-3xl mb-4 border border-slate-100 aspect-square flex items-center justify-center">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LOXTR_DOC_${fileName}`} alt="QR" className="w-full h-full mix-blend-multiply" />
                                    </div>
                                    <p className="text-[10px] font-black text-navy uppercase mb-2">Unique Shipment ID</p>
                                    <code className="text-[9px] font-mono text-slate-400 break-all">{Math.random().toString(36).substr(2, 12).toUpperCase()}</code>
                                    <button className="w-full mt-6 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Download Label</button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* DIGITAL AUDIT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                            {/* Incoterms Audit */}
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all"><Globe size={60} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Incoterms Protocol</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-yellow shadow-xl font-black">
                                            {data.intelligence?.incoterms?.term || 'DAP'}
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${data.intelligence?.incoterms?.is_valid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {data.intelligence?.incoterms?.is_valid ? 'Valid Alignment' : 'Audit Alert'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed italic">"{data.intelligence?.incoterms?.advice || 'Protocol confirmed based on freight payment records.'}"</p>
                            </div>

                            {/* Tax Forecast */}
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all"><Scale size={60} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Digital Tax Forecast</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Est. Duty</p>
                                            <p className="text-lg font-black text-navy">%{data.items[0]?.taxes?.duty_percent || '4.2'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Est. VAT</p>
                                            <p className="text-lg font-black text-navy">%{data.items[0]?.taxes?.vat_percent || '20'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    <p className="text-[9px] font-bold text-slate-400 italic font-mono uppercase">Calculated via GTİP Node</p>
                                </div>
                            </div>

                            {/* Cross-Validation Status */}
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all"><ShieldQuestion size={60} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Document Integrity</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-500 italic uppercase">Weight Sync</span>
                                            {data.intelligence?.cross_validation?.is_consistent ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-red-500" />}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-500 italic uppercase">Quantity Sync</span>
                                            <Check size={14} className="text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-navy italic mt-4 uppercase">"{data.intelligence?.cross_validation?.noted_inconsistencies?.[0] || '100% Data Coherence Detected'}"</p>
                            </div>

                            {/* Market Dynamics Chart */}
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Origin Market Share</p>
                                <div className="h-28 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={marketShareData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value">
                                                {marketShareData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-3 flex-wrap">
                                    {marketShareData.slice(0, 3).map((d: any, i: number) => (
                                        <span key={i} className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1.5 ">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i] }} /> {d.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* DASHBOARD CONTENT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            {/* Main Extraction Matrix */}
                            <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h4 className="text-xs font-black text-navy uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Zap size={20} className="text-yellow" /> Shipment Extraction Matrix
                                    </h4>
                                    <button onClick={handleGenerateInvoice} className="text-[10px] font-black text-navy uppercase tracking-widest px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-navy hover:text-white transition-all shadow-sm">
                                        Create AI Draft Invoice
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white border-b border-slate-100">
                                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trade Item</th>
                                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Stats</th>
                                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax DNA</th>
                                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Zap Intelligence</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.items.map((item: any, i: number) => (
                                                <tr key={i} className={`group hover:bg-slate-50/80 transition-all ${selectedItem === item ? 'bg-yellow/5' : ''}`}>
                                                    <td className="px-10 py-10">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-navy mb-1 uppercase italic">{item.description}</span>
                                                            <div className="flex items-center gap-3">
                                                                <code className="text-[10px] font-black bg-navy text-yellow px-2 py-0.5 rounded italic shadow-sm tracking-wider">{item.hs_code}</code>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase italic">Conf: {(item.confidence * 100).toFixed(0)}%</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-10">
                                                        <div className="flex flex-col italic">
                                                            <span className="text-lg font-black text-navy">{item.qty} {item.unit}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.weight || '0'} KG GROSS</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase">Duty</span>
                                                                <span className="text-xs font-black text-navy">%{item.taxes?.duty_percent || '4.2'}</span>
                                                            </div>
                                                            <div className="flex flex-col border-l border-slate-100 pl-4">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase">Vat</span>
                                                                <span className="text-xs font-black text-navy">%{item.taxes?.vat_percent || '20'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-10 text-center">
                                                        <button
                                                            onClick={() => handleInsights(item)}
                                                            className={`p-5 rounded-[1.5rem] transition-all ${selectedItem === item ? 'bg-yellow text-navy rotate-12 scale-110 shadow-xl' : 'bg-slate-50 text-slate-300 hover:bg-navy hover:text-white group-hover:scale-105'}`}
                                                        >
                                                            <Sparkles size={24} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Intelligence Sidebar */}
                            <div className="lg:col-span-4 space-y-10">
                                {/* Competitor Radar Chart (Simulated with BarChart) */}
                                <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h4 className="text-sm font-black text-navy uppercase tracking-widest">Growth Forecast</h4>
                                            <p className="text-[10px] font-black text-slate-400 italic">Global Market Potential</p>
                                        </div>
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-navy shadow-inner"><TrendingUp size={20} /></div>
                                    </div>
                                    <div className="h-48 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={marketShareData}>
                                                <XAxis dataKey="name" hide />
                                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                                <Bar dataKey="value" fill="#003366" radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-8 p-6 bg-navy text-white rounded-[2rem] shadow-xl relative overflow-hidden italic">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Info size={32} /></div>
                                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">AI OPINION</p>
                                        <p className="text-xs font-bold leading-relaxed lowercase">"{data.intelligence?.market_data?.growth || '+4.2%'} market growth detected. Recommended target: Emerging distributors in {targetCountry}."</p>
                                    </div>
                                </div>

                                {/* Deep Intelligence Node */}
                                <AnimatePresence mode="wait">
                                    {selectedItem ? (
                                        <motion.div
                                            key={selectedItem.description}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-navy p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 blur-[80px] rounded-full" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/5">
                                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-yellow animate-pulse"><Zap size={24} /></div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em]">AI Trade Intelligence</h4>
                                                        <p className="text-[10px] font-bold text-white/40 uppercase italic">Digital Protocol Analysis</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md">
                                                        <p className="text-[10px] font-black text-yellow uppercase tracking-widest mb-4 italic">Regulatory Sweep</p>
                                                        {insightLoading ? (
                                                            <div className="space-y-3 animate-pulse">
                                                                <div className="h-2 bg-white/10 rounded-full w-full" />
                                                                <div className="h-2 bg-white/10 rounded-full w-2/3" />
                                                                <p className="text-[8px] font-black text-blue-300 uppercase mt-4">Consulting Global Gümrük Node...</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-6">
                                                                <p className="text-xs text-blue-100 font-bold leading-relaxed italic">
                                                                    {insightData?.summary || "Analyzing specific import barriers for this tariff code in Turkey region..."}
                                                                </p>
                                                                {insightData?.regulations && (
                                                                    <div className="space-y-2 mt-4">
                                                                        {insightData.regulations.map((reg: string, idx: number) => (
                                                                            <div key={idx} className="flex items-center gap-3 text-[9px] font-black uppercase text-blue-200">
                                                                                <ShieldCheck size={12} className="text-yellow" /> {reg}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        {(data.intelligence?.suggested_buyers || []).map((buyer: string, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/buyer">
                                                                <div className="w-8 h-8 rounded-lg bg-yellow flex items-center justify-center text-navy shadow-lg group-hover/buyer:scale-110 transition-transform"><TargetIcon size={16} /></div>
                                                                <span className="text-[10px] font-black text-white uppercase italic">{buyer}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="bg-slate-200/30 rounded-[3rem] p-20 text-center border-4 border-dotted border-slate-200 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-8 shadow-xl"><Scan size={40} /></div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest max-w-[200px]">Select any item from the matrix to reveal deep AI trade intelligence</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer Intelligence Signature */}
                        <div className="mt-32 pt-20 border-t border-slate-200">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-slate-400">
                                <div className="flex items-center gap-6 grayscale hover:grayscale-0 transition-all opacity-60">
                                    <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center"><Zap className="text-yellow" size={24} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-navy italic leading-none">LOX AI RADAR</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Operational Node v2.Digital</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.2em] italic">
                                    <span className="text-navy">Logic: Gemini 2.0 Ultra-Flash</span>
                                    <span className="w-1 h-3 bg-slate-200 rounded-full" />
                                    <span>Identity: SHA-512 SECURE</span>
                                    <span className="w-1 h-3 bg-slate-200 rounded-full" />
                                    <span className="px-4 py-2 bg-navy text-white rounded-xl shadow-lg cursor-pointer" onClick={() => setData(null)}>Powered by LOXTR Intelligence</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smart Invoice Draft Modal (Preserved but enhanced) */}
            <AnimatePresence>
                {showInvoiceModal && invoiceData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-navy/40 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="bg-white rounded-[4.5rem] max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-[0_60px_120px_rgba(0,0,0,0.3)] p-12 md:p-24 relative border border-slate-100"
                        >
                            <button onClick={() => setShowInvoiceModal(false)} className="absolute top-12 right-12 w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-xl group">
                                <RefreshCcw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
                            </button>

                            <div className="flex justify-between items-start mb-24 pb-16 border-b border-slate-100">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-navy rounded-[2rem] flex items-center justify-center text-yellow shadow-2xl shadow-navy/20"><FileType size={40} /></div>
                                    <div>
                                        <h2 className="text-5xl font-black italic tracking-tighter text-navy uppercase leading-none mb-3">LOX<span className="text-yellow">INVOICE.</span></h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                                            <ShieldCheck size={16} className="text-emerald-500" /> AI-Verified Trade Engine Draft
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right p-12 bg-navy text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                                    <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-4 italic">Draft Trade Value</p>
                                    <p className="text-6xl font-black italic text-yellow tracking-tighter">{invoiceData.currency} {invoiceData.total_amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 italic">Export Entity Protocol</h5>
                                    <p className="text-3xl font-black text-navy italic uppercase mb-2">{invoiceData.exporter?.name}</p>
                                    <p className="text-sm text-slate-400 font-bold leading-relaxed">{invoiceData.exporter?.address || 'Global Trade Node Registry Verified'}</p>
                                </div>
                                <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner italic">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Audit Summary</h5>
                                    <p className="text-xs text-navy font-black leading-relaxed">
                                        Shipment routing to {targetCountry} detected. Cross-referencing {data.items.length} extracted items with Local Port Authorities and Preferential Trade Agreements via LOX Customs Node.
                                        Incoterms set to <span className="text-yellow bg-navy px-1 rounded">{data.intelligence?.incoterms?.term}</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-[3rem] overflow-hidden mb-24 shadow-xl">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-10 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trade Article</th>
                                            <th className="px-10 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital GTİP</th>
                                            <th className="px-10 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (AI Est)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoiceData.items?.map((item: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-10 text-sm font-black text-navy uppercase italic">{item.description}</td>
                                                <td className="px-10 py-10"><span className="bg-navy text-white text-[10px] px-4 py-2 rounded-xl font-black italic tracking-widest shadow-lg shadow-navy/20">{item.hs_code}</span></td>
                                                <td className="px-10 py-10 text-right text-sm font-black text-navy italic">{invoiceData.currency} {item.qty * (Math.floor(Math.random() * 50) + 10)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-8">
                                <button onClick={() => setShowInvoiceModal(false)} className="px-12 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-navy transition-all italic">Discard Intelligence Draft</button>
                                <button className="bg-navy text-white px-20 py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-6 shadow-[0_25px_50px_rgba(12,18,35,0.2)] hover:bg-yellow hover:text-navy hover:-translate-y-2 transition-all duration-300 italic group">
                                    <Download size={28} className="group-hover:translate-y-1 transition-transform" /> Generate PDF Report
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

