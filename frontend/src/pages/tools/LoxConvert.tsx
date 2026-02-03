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
    Sparkles,
    Globe,
    ShieldCheck,
    Layers,
    RefreshCcw,
    Zap,
    TrendingUp,
    ShieldAlert,
    Target as TargetIcon,
    BrainCircuit,
    Scale,
    ShieldQuestion,
    QrCode as QrIcon,
    Info,
    Database,
    Binary,
    X,
    FileSearch,
    ChevronDown,
    Save,
    Maximize2,
    Map,
    ChevronUp,
    Fingerprint,
    Boxes,
    Lock,
    UserPlus,
    Key
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/crm/AuthContext';
import toast from 'react-hot-toast';

// --- Minimalist Logo ---
const LoxLogo = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-navy rounded-xl rotate-6 transition-transform group-hover:rotate-12" />
            <div className="absolute inset-0 bg-yellow rounded-xl -rotate-6 transition-transform group-hover:-rotate-12 opacity-80 mix-blend-multiply" />
            <Zap size={18} className="text-white relative z-10 fill-white" />
        </div>
        <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-black tracking-tighter text-navy uppercase">LOX<span className="text-yellow">TR</span></span>
            <span className="text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase">Intelligence</span>
        </div>
    </div>
);

// --- Info Button ---
const InfoButton = ({ title, content }: { title: string, content: string }) => (
    <div className="group relative inline-block ml-1 cursor-help">
        <Info size={14} className="text-slate-300 hover:text-navy transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-5 bg-navy text-white text-[10px] font-bold rounded-[2rem] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-[100] border border-white/10 backdrop-blur-xl">
            <p className="text-yellow mb-2 uppercase tracking-widest">{title}</p>
            <p className="leading-relaxed font-medium opacity-80">{content}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-navy" />
        </div>
    </div>
);

const EXPORT_TEMPLATES = {
    STANDARD: {
        id: 'standard', name: 'Standard Logistics', desc: 'General purpose shipping template.',
        mapping: (item: any, isMetric: boolean) => ({ 'Item': item.description, 'HS_Code': item.hs_code, 'Quantity': item.qty, 'Unit': item.unit, 'Weight': isMetric ? (item.weight || 0) : ((item.weight || 0) * 2.20).toFixed(2) })
    },
    CUSTOMS: {
        id: 'customs', name: 'Customs Ready (WCO)', desc: 'Compliant with global customs systems.',
        mapping: (item: any, isMetric: boolean) => ({ 'Tariff_Code': item.hs_code, 'Description': item.description, 'Origin': item.origin_country || 'N/A', 'Weight': item.weight, 'Value': item.value || '0.00' })
    },
    ERP: {
        id: 'erp', name: 'ERP/SAP Integrated', desc: 'Corporate system compliant mapping.',
        mapping: (item: any, isMetric: boolean) => ({ 'SKU': `LOX-${item.hs_code?.slice(0, 4)}`, 'Text': item.description, 'Qty': item.qty, 'Unit': item.unit, 'Value': item.value })
    }
};

export default function LoxConvert() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dossier, setDossier] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processQueue, setProcessQueue] = useState<{ name: string, status: 'pending' | 'processing' | 'done' | 'error' }[]>([]);
    const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
    const [showAuthGate, setShowAuthGate] = useState(false);

    // UI State
    const [saveLoading, setSaveLoading] = useState(false);
    const [showExportWizard, setShowExportWizard] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('STANDARD');
    const [isMetric, setIsMetric] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setLoading(true);
        setProcessQueue(files.map(f => ({ name: f.name, status: 'pending' })));

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'processing' } : p));

            const base64: string = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            try {
                const res = await fetch('/api/loxconvert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileBase64: base64, fileName: file.name, mimeType: file.type || 'application/octet-stream', userId: user?.id })
                });
                const result = await res.json();
                const localId = Math.random().toString(36).substr(2, 9);
                setDossier(prev => [...prev, { ...result, localId, fileName: file.name }]);
                setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
                if (i === 0) setExpandedDoc(localId);
            } catch (err) {
                setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
                toast.error(`Analysis failed: ${file.name}`);
            }
        }
        setLoading(false);
    };

    const handleProtectedAction = (action: () => void) => {
        if (!user) {
            setShowAuthGate(true);
            return;
        }
        action();
    };

    const handleVaultSync = async () => {
        setSaveLoading(true);
        try {
            const { data: folder, error: fError } = await supabase.from('lox_folders').insert({
                user_id: user?.id,
                name: `Shipment: ${dossier[0]?.doc_metadata?.reference_no || dossier[0]?.fileName}`,
                metadata: { type: 'shipment_dossier', count: dossier.length, destination: dossier[0]?.doc_metadata?.destination_country }
            }).select().single();
            if (fError) throw fError;

            const docInserts = dossier.map(doc => ({
                user_id: user?.id,
                folder_id: folder.id,
                doc_type: doc.doc_metadata?.type || 'document',
                content: doc,
                file_name: doc.fileName
            }));
            await supabase.from('lox_documents').insert(docInserts);
            toast.success("Dossier pushed to Vault!");
        } catch (e: any) {
            toast.error("Vault sync failed");
        } finally { setSaveLoading(false); }
    };

    const runMasterExport = () => {
        try {
            const template = EXPORT_TEMPLATES[selectedTemplate as keyof typeof EXPORT_TEMPLATES];
            const allItems = dossier.flatMap(d => d.items.map((item: any) => ({
                ...template.mapping(item, isMetric),
                'Source': d.doc_metadata?.type || d.fileName,
                'Ref': d.doc_metadata?.reference_no || 'N/A'
            })));
            const ws = XLSX.utils.json_to_sheet(allItems);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Master_Export");
            XLSX.writeFile(wb, `LOX_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
            setShowExportWizard(false);
            toast.success("Download Complete");
        } catch (e) { toast.error("Export failed"); }
    };

    const validation = (() => {
        if (dossier.length < 2) return { isConsistent: true, isWaiting: true, weightError: false, qtyError: false };
        const weights = dossier.map(d => d.intelligence?.validation_hooks?.total_weight || 0).filter(w => w > 0);
        const qtys = dossier.map(d => d.intelligence?.validation_hooks?.total_qty || 0).filter(q => q > 0);
        return {
            isConsistent: new Set(weights).size <= 1 && new Set(qtys).size <= 1,
            isWaiting: false,
            weightError: new Set(weights).size > 1,
            qtyError: new Set(qtys).size > 1
        };
    })();

    const aggregated = {
        value: dossier.reduce((s, d) => s + (d.intelligence?.validation_hooks?.total_value || 0), 0),
        currency: dossier[0]?.intelligence?.validation_hooks?.currency || 'USD',
        incoterm: dossier[0]?.intelligence?.incoterms?.term || 'N/A',
        tax: dossier[0]?.items?.[0]?.taxes?.duty_percent || 0,
        destination: dossier[0]?.doc_metadata?.destination_country || 'Global'
    };

    return (
        <div className="min-h-screen bg-slate-50 font-outfit text-navy pb-32">
            <AnimatePresence mode="wait">
                {dossier.length === 0 ? (
                    /* PREMIUM HERO */
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-7xl mx-auto px-6 pt-24 md:pt-32">
                        <div className="text-center mb-20">
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-navy text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8 shadow-xl">
                                <Sparkles size={12} className="text-yellow" /> LOX AI RADAR • INTELLIGENCE NODE
                            </motion.div>
                            <h2 className="text-6xl md:text-[6.5rem] font-black tracking-tighter text-navy mb-8 leading-[0.85]">
                                Don't just extract.<br />
                                <span className="text-yellow bg-navy px-8 py-4 rounded-[3rem] inline-block -rotate-1 shadow-2xl">Understand.</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed mb-16 px-4">
                                The world's first <span className="text-navy underline decoration-yellow decoration-[6px] underline-offset-8">Global Customs AI</span> that conducts digital audits, tariff forecasting and trade compliance.
                            </p>

                            <div className="max-w-5xl mx-auto mb-24 px-4">
                                <div className="bg-white rounded-[3.5rem] p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-t-[10px] border-yellow group relative overflow-hidden transition-all hover:shadow-yellow/5">
                                    <div className={`relative border-2 border-dashed rounded-[2.8rem] p-8 md:p-12 transition-all duration-500
                                        ${loading ? 'border-yellow bg-yellow/5 scale-[0.99]' : 'border-slate-100 bg-slate-50/50 hover:border-yellow'}`}
                                    >
                                        <input type="file" multiple onChange={handleFiles} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={loading} />
                                        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-lg
                                                ${loading ? 'bg-navy text-yellow ring-8 ring-yellow/10 animate-pulse' : 'bg-white text-navy border border-slate-100 group-hover:scale-110'}`}
                                            >
                                                {loading ? <Loader2 size={32} className="animate-spin" /> : <Layers size={32} />}
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-3xl font-black text-navy mb-1 italic tracking-tighter uppercase leading-none">
                                                    {loading ? 'Analyzing...' : 'Digital Customs Audit'}
                                                </h3>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Global HS Code & Tariff Intelligence Radar</p>
                                            </div>
                                            {!loading && (
                                                <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-navy text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-xl ml-4">
                                                    <Upload size={14} className="text-yellow" /> Click to Select Documents
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Queue */}
                                    {processQueue.length > 0 && (
                                        <div className="mt-12 border-t border-slate-50 pt-10 px-12 text-left">
                                            <div className="flex flex-col gap-5">
                                                {processQueue.map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between text-[11px] font-black uppercase italic tracking-wider">
                                                        <div className="flex items-center gap-4 text-navy/80"><FileSearch size={18} className="text-slate-300" /><span>{f.name}</span></div>
                                                        <span className={`px-4 py-1 rounded-full text-[9px] ${f.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>{f.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[1600px] mx-auto px-8 pt-6 pb-32">
                        
                        {/* CLEAN MINIMALIST HEADER */}
                        <div className="flex items-center justify-between mb-8 px-4">
                            <div className="flex items-center gap-10">
                                <LoxLogo />
                                <div className="h-8 w-px bg-slate-100 hidden md:block" />
                                <div className="hidden md:flex items-center gap-4">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Session Node:</span>
                                    <span className="text-[10px] font-black text-navy uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 italic">Dossier #{dossier[0]?.doc_metadata?.reference_no || 'ACTIVE'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {!user && (
                                    <button onClick={() => window.location.href = `https://www.loxtr.com/login?redirectTo=${encodeURIComponent(window.location.href)}`} className="px-5 py-2.5 bg-yellow text-navy rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all">
                                        Login
                                    </button>
                                )}
                                <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center gap-1">
                                    <button onClick={() => setDossier([])} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-navy hover:bg-slate-50 transition-all"><RefreshCcw size={14} /></button>
                                    <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center font-black text-[9px]">{user ? 'U' : '?'}</div>
                                </div>
                            </div>
                        </div>

                        {/* SLIM OPERATIONS BAR */}
                        <div className="bg-navy rounded-[2.5rem] p-5 mb-10 shadow-2xl flex flex-wrap items-center justify-between gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 blur-[80px] rounded-full" />
                            
                            <div className="flex items-center gap-10 relative z-10 px-6">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-yellow/40 uppercase tracking-[0.2em] mb-1">Destination Radar</span>
                                    <span className="text-[13px] font-black text-white uppercase italic tracking-tight">{aggregated.destination || 'Global'}</span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-yellow/40 uppercase tracking-[0.2em] mb-1">Dossier Value</span>
                                    <span className="text-[13px] font-black text-white italic tracking-tight">{aggregated.currency} {aggregated.value.toLocaleString()}</span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-yellow/40 uppercase tracking-[0.2em] mb-1">Integrity Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${validation?.isConsistent ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${validation?.isConsistent ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {validation?.isWaiting ? 'Ready' : (validation?.isConsistent ? 'Verified' : 'Mismatch')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 relative z-10 pr-2">
                                <button onClick={() => handleProtectedAction(() => setShowQRModal(true))} className="h-11 px-6 bg-white/5 hover:bg-white hover:text-navy rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2">
                                    <QrIcon size={14} /> Physical Sync
                                </button>
                                <button onClick={() => setShowExportWizard(true)} className="h-11 px-8 bg-yellow text-navy rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
                                    <Download size={14} /> Global Export
                                </button>
                            </div>
                        </div>

                        {/* --- CONTENT MATRIX --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            <div className="lg:col-span-8 space-y-10">
                                {dossier.map((doc, idx) => (
                                    <div key={doc.localId} className="group">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`bg-white rounded-3xl p-3 border transition-all cursor-pointer hover:shadow-xl
                                                ${expandedDoc === doc.localId ? 'border-navy bg-slate-50/50' : 'border-slate-100'}`}
                                            onClick={() => setExpandedDoc(expandedDoc === doc.localId ? null : doc.localId)}
                                        >
                                            <div className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                                                        ${expandedDoc === doc.localId ? 'bg-navy text-yellow' : 'bg-slate-50 text-navy'}`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[8px] font-black text-navy uppercase px-2 py-0.5 bg-yellow rounded shadow-sm">{doc.doc_metadata?.type || 'DOC'}</span>
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{doc.doc_metadata?.reference_no}</span>
                                                        </div>
                                                        <h3 className="text-lg font-black italic text-navy uppercase truncate max-w-xs">{doc.fileName}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 text-right">
                                                    <div className="hidden sm:block">
                                                        <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Net Weight</p>
                                                        <p className="text-xl font-black text-navy">{doc.intelligence?.validation_hooks?.total_weight || '0'} <span className="text-[10px] opacity-30">kg</span></p>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                        {expandedDoc === doc.localId ? <ChevronUp size={18} /> : <Maximize2 size={16} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* EXPANDED EXTRACTION MATRIX */}
                                        <AnimatePresence>
                                            {expandedDoc === doc.localId && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden px-4"
                                                >
                                                    <div className="bg-white border-x border-b border-slate-100 rounded-b-[4rem] p-12 shadow-2xl -mt-10 pt-20 relative">
                                                        {/* AUTH GATE COVER */}
                                                        {!user && (
                                                            <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 flex items-center justify-center rounded-b-[4rem]">
                                                                <div className="bg-navy p-10 rounded-[3rem] shadow-2xl text-center max-w-sm border border-white/20">
                                                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-yellow mx-auto mb-6"><Lock size={32} /></div>
                                                                    <h5 className="text-2xl font-black italic text-white mb-3 uppercase tracking-tighter">Intelligence Locked</h5>
                                                                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-relaxed mb-8 opacity-60">Full line-item extraction and digital audit requires an active LOXTR node.</p>
                                                                    <button onClick={() => window.location.href = `https://www.loxtr.com/register?redirectTo=${encodeURIComponent(window.location.href)}`} className="w-full bg-yellow text-navy py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                                                        <UserPlus size={18} /> Claim This Dossier
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between mb-12">
                                                            <h4 className="text-2xl font-black italic text-navy uppercase flex items-center gap-4">
                                                                <Boxes size={28} className="text-yellow" /> Shipment Extraction Matrix
                                                            </h4>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Items Extracted: {doc.items.length}</span>
                                                            </div>
                                                        </div>

                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left">
                                                                <thead>
                                                                    <tr className="border-b border-slate-50">
                                                                        <th className="pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Trade Item</th>
                                                                        <th className="pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Unit Stats</th>
                                                                        <th className="pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Tax DNA</th>
                                                                        <th className="pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Zap Intelligence</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-50">
                                                                    {doc.items.map((item: any, i: number) => (
                                                                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                                            <td className="py-8 pr-10">
                                                                                <div className="flex items-center gap-5">
                                                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-navy font-black text-[10px] shadow-sm">{item.hs_code?.slice(0, 4)}</div>
                                                                                    <div>
                                                                                        <p className="text-[13px] font-black text-navy uppercase leading-tight mb-1">{item.description}</p>
                                                                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">HSCODE: {item.hs_code}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-8">
                                                                                <div className="flex items-center gap-10">
                                                                                    <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Qty</p><p className="text-sm font-black text-navy">{item.qty} {item.unit}</p></div>
                                                                                    <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Weight</p><p className="text-sm font-black text-navy">{item.weight} kg</p></div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-8 text-right">
                                                                                <div className="inline-flex flex-col items-end">
                                                                                    <span className="text-[10px] font-black text-navy mb-1">DUTY %{item.taxes?.duty_percent || 0}</span>
                                                                                    <span className="text-[10px] font-black text-slate-300 tracking-tighter">VAT %{item.taxes?.vat_percent || 0}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-8 text-right">
                                                                                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-navy group-hover:text-white transition-all">
                                                                                    <Zap size={12} className="text-yellow" />
                                                                                    <span className="text-[9px] font-black uppercase tracking-widest italic">{item.logic || 'Verified Entity'}</span>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            <div className="lg:col-span-4 sticky top-10">
                                <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 bg-navy text-yellow rounded-xl flex items-center justify-center"><BrainCircuit size={20} /></div>
                                        <h4 className="text-[10px] font-black text-navy uppercase tracking-widest">Global Intelligence Node</h4>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="relative bg-white p-6 rounded-2xl border border-slate-100">
                                            {!user && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                                    <p className="text-[8px] font-black text-navy uppercase tracking-widest flex items-center gap-2"><Lock size={10} /> Member Briefing</p>
                                                </div>
                                            )}
                                            <p className="text-[9px] font-black text-navy/30 uppercase mb-3 flex items-center gap-2 italic"><ShieldCheck size={14} /> Regulatory Advisory</p>
                                            <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">"{dossier[0]?.intelligence?.regulatory_notes || 'Analyzing compliance protocols...'}"</p>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-navy/30 uppercase italic flex items-center gap-2"><TargetIcon size={14} /> Suggested Entities</p>
                                            {(dossier[0]?.intelligence?.suggested_buyers || []).slice(0, user ? 10 : 3).map((buyer: string, i: number) => (
                                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3 group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow" />
                                                    <span className="text-[10px] font-black uppercase text-navy/70 truncate">{buyer}</span>
                                                </div>
                                            ))}
                                            {!user && <p className="text-[7px] font-bold text-center text-slate-300 uppercase italic">Unlock with Premium Account</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showQRModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-navy/70 backdrop-blur-2xl">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[5rem] p-16 max-w-lg w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] text-center relative border border-white/20">
                            <button onClick={() => setShowQRModal(false)} className="absolute top-12 right-12 text-slate-300 hover:text-navy transition-colors"><X size={32} /></button>
                            <LoxLogo className="justify-center mb-12" />

                            <div className="bg-slate-50 p-8 rounded-[3rem] text-left mb-10 border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow/5 rounded-full blur-2xl -mr-10 -mt-10" />
                                <h5 className="text-[10px] font-black text-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Globe size={14} className="text-yellow" /> Shipment Digital Twin
                                </h5>
                                <p className="text-[11px] font-bold text-slate-400 italic leading-relaxed mb-6">
                                    Bu QR kod, sevkiyatın "Dijital İkizi"ni temsil eder. Depo veya gümrük personeli tarafından tarandığında, sevkiyatın içeriği, dökümanları ve uyumluluk verileri anında görüntülenir.
                                </p>
                                <div className="bg-white p-10 rounded-[3rem] flex items-center justify-center shadow-inner aspect-square mb-6">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://loxtr.com/dossier/${dossier[0]?.doc_metadata?.reference_no}`} alt="QR" className="w-full mix-blend-multiply opacity-90 transition-transform hover:scale-105 duration-700" />
                                </div>
                            </div>

                            <h4 className="text-3xl font-black italic text-navy uppercase mb-3 tracking-tighter">Ref: {dossier[0]?.doc_metadata?.reference_no || 'N/A'}</h4>
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 px-10">Scan for Warehouse/Port Digital Access</p>
                            <button className="w-full bg-navy text-white py-8 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl hover:bg-yellow hover:text-navy hover:-translate-y-2 transition-all italic">Download Tracking Label</button>
                        </motion.div>
                    </div>
                )}

                {/* AUTH GATE MODAL */}
                {showAuthGate && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-8 bg-black/60 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[5rem] p-16 max-w-xl w-full shadow-2xl text-center">
                            <div className="w-24 h-24 bg-navy rounded-[2.5rem] flex items-center justify-center text-yellow mx-auto mb-10 shadow-2xl"><Key size={48} /></div>
                            <h2 className="text-4xl font-black italic text-navy uppercase mb-4 tracking-tighter">Member Access Required</h2>
                            <p className="text-sm font-bold text-slate-500 mb-12 leading-relaxed">
                                Dossier Vaulting, QR Digital Twin Sync and Advanced Multi-Document Integrity checks are reserved for LOXTR Premium members. Join the future of customs logic.
                            </p>
                            <div className="flex flex-col gap-4">
                                <button onClick={() => window.location.href = `https://www.loxtr.com/register?redirectTo=${encodeURIComponent(window.location.href)}`} className="w-full bg-navy text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-yellow hover:text-navy transition-all">Create Free Account</button>
                                <button onClick={() => setShowAuthGate(false)} className="w-full py-6 rounded-2xl text-[10px] font-black uppercase text-slate-300 hover:text-navy transition-all tracking-[0.3em]">Not Now, Keep Analyzing</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showExportWizard && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-navy/70 backdrop-blur-2xl">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[5rem] max-w-5xl w-full overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)]">
                            <div className="bg-navy p-16 text-white flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow/5 blur-[120px] rounded-full" />
                                <div className="flex items-center gap-10 text-left relative z-10">
                                    <div className="w-20 h-20 bg-yellow rounded-[2.5rem] flex items-center justify-center text-navy shadow-[0_20px_40px_-10px_rgba(255,255,0,0.3)]"><Binary size={44} /></div>
                                    <div>
                                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Global Export <span className="text-yellow">Engine.</span></h2>
                                        <p className="text-[12px] font-black text-blue-200 uppercase tracking-[0.5em] mt-3 opacity-60">Dossier-wide Integrated Analytics</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowExportWizard(false)} className="text-white/40 hover:text-white transition-colors relative z-10"><X size={40} /></button>
                            </div>
                            <div className="p-20">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                    {Object.entries(EXPORT_TEMPLATES).map(([key, template]) => (
                                        <button key={key} onClick={() => setSelectedTemplate(key)} className={`p-10 rounded-[3rem] border-2 text-left transition-all ${selectedTemplate === key ? 'border-yellow bg-yellow/5 shadow-[0_30px_60px_-15px_rgba(255,255,0,0.1)]' : 'border-slate-50 bg-slate-50/50 hover:border-slate-100'}`}>
                                            <h5 className="text-[13px] font-black text-navy uppercase mb-3 italic tracking-tight">{template.name}</h5>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-wide">{template.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={runMasterExport} className="w-full bg-navy text-white py-10 rounded-[3.5rem] font-black text-[13px] uppercase tracking-[0.6em] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-yellow hover:text-navy hover:-translate-y-2 transition-all flex items-center justify-center gap-6 italic"><Download size={32} /> Generate Master Excel Package</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
