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
        <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-navy rounded-lg rotate-6 transition-transform group-hover:rotate-12" />
            <div className="absolute inset-0 bg-yellow rounded-lg -rotate-6 transition-transform group-hover:-rotate-12 opacity-80 mix-blend-multiply" />
            <Zap size={14} className="text-white relative z-10 fill-white" />
        </div>
        <div className="flex flex-col -space-y-1">
            <span className="text-lg font-black tracking-tighter text-navy uppercase leading-none">LOX<span className="text-yellow">TR</span></span>
            <span className="text-[8px] font-bold tracking-[0.3em] text-slate-400 uppercase">Intelligence</span>
        </div>
    </div>
);

// --- Info Button ---
const InfoButton = ({ title, content }: { title: string, content: string }) => (
    <div className="group relative inline-block ml-1 cursor-help">
        <Info size={12} className="text-slate-300 hover:text-navy transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-4 bg-navy text-white text-[9px] font-bold rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-[100] border border-white/10 backdrop-blur-md">
            <p className="text-yellow mb-1 uppercase tracking-widest">{title}</p>
            <p className="leading-relaxed font-medium opacity-80">{content}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-navy" />
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
    const [shipmentAlerts, setShipmentAlerts] = useState<any[]>([]);
    const [isMetric, setIsMetric] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setLoading(true);
        setProcessQueue(files.map(f => ({ name: f.name, status: 'pending' })));

        const newDocs: any[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'processing' } : p));

            const base64: string = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            try {
                // 1. ANALYSIS & EXTRACTION
                const res = await fetch('/api/loxconvert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileBase64: base64,
                        fileName: file.name,
                        mimeType: file.type || 'application/octet-stream',
                        userId: user?.id,
                        mode: 'extract'
                    })
                });
                const result = await res.json();
                const localId = Math.random().toString(36).substr(2, 9);
                const docWithMeta = { ...result, localId, fileName: file.name };
                newDocs.push(docWithMeta);

                setDossier(prev => [...prev, docWithMeta]);
                setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
                if (i === 0 && dossier.length === 0) setExpandedDoc(localId);
            } catch (err) {
                setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
                toast.error(`Analysis failed: ${file.name}`);
            }
        }

        // 2. DOSSIER VALIDATION (CROSS-CHECK)
        if (newDocs.length > 0 || dossier.length > 0) {
            try {
                const updatedDossier = [...dossier, ...newDocs];
                const vRes = await fetch('/api/loxconvert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'validate', dossierData: updatedDossier })
                });
                const vResult = await vRes.json();
                setShipmentAlerts(vResult.alerts || []);
            } catch (e) {
                console.error("Validation Error:", e);
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

            // Consolidate unique items across the dossier (prefer Invoice data for values)
            const allItemsMap = new Map();

            dossier.forEach(doc => {
                const docType = doc.doc_metadata?.type?.toLowerCase() || '';
                doc.items.forEach((item: any) => {
                    const key = `${item.hs_code}-${item.description?.slice(0, 20)}`;
                    const existing = allItemsMap.get(key);

                    // If we find the same item in another doc, prefer the one with "value" (Invoice)
                    if (!existing || (item.value && !existing.value)) {
                        allItemsMap.set(key, {
                            ...template.mapping(item, isMetric),
                            'Source_Doc': docType.toUpperCase(),
                            'Origin': item.origin_country || 'N/A'
                        });
                    }
                });
            });

            const uniqueItems = Array.from(allItemsMap.values());
            const ws = XLSX.utils.json_to_sheet(uniqueItems);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Master_Export");
            XLSX.writeFile(wb, `LOX_Dossier_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
            setShowExportWizard(false);
            toast.success("Consolidated Export Complete");
        } catch (e) { toast.error("Export failed"); }
    };

    const validation = (() => {
        if (dossier.length === 0) return { isConsistent: true, isWaiting: true };
        const hasErrors = shipmentAlerts.some(a => a.type === 'error');
        const hasWarnings = shipmentAlerts.some(a => a.type === 'warning' || a.type === 'missing');
        return {
            isConsistent: !hasErrors,
            isWaiting: loading,
            hasWarnings
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
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl mx-auto px-6 pt-12 md:pt-16">
                        <div className="text-center mb-10">
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-navy text-white text-[7px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
                                <Sparkles size={8} className="text-yellow" /> LOX AI • INTELLIGENCE NODE
                            </motion.div>
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-navy mb-4 leading-tight">
                                Don't just extract.<br />
                                <span className="text-yellow bg-navy px-3 py-1.5 rounded-xl inline-block -rotate-1 shadow-lg">Understand.</span>
                            </h2>
                            <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto font-bold leading-relaxed mb-8 px-4">
                                The world's first <span className="text-navy underline decoration-yellow decoration-2 underline-offset-4">Global Customs AI</span> for digital audits and tariff forecasting.
                            </p>

                            <div className="max-w-4xl mx-auto mb-20 px-4">
                                <div className="bg-white rounded-3xl p-3 shadow-xl border-t-8 border-yellow group relative overflow-hidden transition-all hover:shadow-yellow/5">
                                    <div className={`relative border-2 border-dashed rounded-[1.8rem] p-6 md:p-10 transition-all duration-500
                                        ${loading ? 'border-yellow bg-yellow/5 scale-[0.99]' : 'border-slate-100 bg-slate-50/50 hover:border-yellow'}`}
                                    >
                                        <input type="file" multiple onChange={handleFiles} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={loading} />
                                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md
                                                ${loading ? 'bg-navy text-yellow ring-2 ring-yellow/10 animate-pulse' : 'bg-white text-navy border border-slate-100 group-hover:scale-105'}`}
                                            >
                                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Layers size={20} />}
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-lg font-black text-navy mb-0.5 italic tracking-tighter uppercase leading-none">
                                                    {loading ? 'Analyzing...' : 'Customs Audit'}
                                                </h3>
                                                <p className="text-slate-400 text-[7px] font-black uppercase tracking-[0.2em] opacity-60">Global HS Code Intelligence Radar</p>
                                            </div>
                                            {!loading && (
                                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-navy text-white text-[7px] font-black uppercase tracking-widest rounded-lg shadow-lg ml-4">
                                                    <Upload size={10} className="text-yellow" /> Select Documents
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
                ) : (
                    <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[1550px] mx-auto px-6 pt-6 pb-24">

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
                                    <button onClick={() => window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.href)}`} className="px-5 py-2.5 bg-yellow text-navy rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all">
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
                        <div className="bg-navy rounded-2xl p-3 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 blur-[80px] rounded-full" />

                            <div className="flex items-center gap-6 relative z-10 px-4">
                                <div className="flex flex-col">
                                    <span className="text-[6px] font-black text-yellow/40 uppercase tracking-[0.2em] mb-0.5">Destination</span>
                                    <span className="text-[10px] font-black text-white uppercase italic tracking-tight">{aggregated.destination || 'Global'}</span>
                                </div>
                                <div className="w-px h-5 bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[6px] font-black text-yellow/40 uppercase tracking-[0.2em] mb-0.5">Total Value</span>
                                    <span className="text-[10px] font-black text-white italic tracking-tight">{aggregated.currency} {aggregated.value.toLocaleString()}</span>
                                </div>
                                <div className="w-px h-5 bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[6px] font-black text-yellow/40 uppercase tracking-[0.2em] mb-0.5">Integrity</span>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-1 h-1 rounded-full ${validation?.isConsistent ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${validation?.isConsistent ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {validation?.isWaiting ? 'Ready' : (validation?.isConsistent ? 'Verified' : 'Mismatch')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative z-10 pr-2">
                                <button onClick={() => handleProtectedAction(() => setShowQRModal(true))} className="h-8 px-3 bg-white/5 hover:bg-white hover:text-navy rounded-md text-[7px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center gap-1.5">
                                    <QrIcon size={10} /> Sync
                                </button>
                                <button onClick={() => setShowExportWizard(true)} className="h-8 px-4 bg-yellow text-navy rounded-md text-[7px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5">
                                    <Download size={10} /> Master Export
                                </button>
                            </div>
                        </div>

                        {/* --- CONTENT MATRIX --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            <div className="lg:col-span-8 space-y-8">
                                <div className="flex items-center justify-between px-4">
                                    <h3 className="text-[10px] font-black text-navy uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Database size={14} className="text-yellow" /> Current Shipment Dossier
                                    </h3>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                        Batch Status: {loading ? 'Syncing...' : 'Ready'}
                                    </span>
                                </div>
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
                                                    <div className="bg-white border-x border-b border-slate-100 rounded-b-3xl p-8 shadow-xl -mt-6 pt-12 relative">

                                                        <div className="flex items-center justify-between mb-8">
                                                            <h4 className="text-xl font-black italic text-navy uppercase flex items-center gap-3">
                                                                <Boxes size={22} className="text-yellow" /> Extraction Matrix
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
                                                                            <td className="py-6 text-right">
                                                                                <div className="inline-flex flex-col items-end">
                                                                                    <span className="text-[10px] font-black text-navy mb-1">DUTY %{item.taxes?.duty_percent || 0}</span>
                                                                                    <span className="text-[10px] font-black text-slate-300 tracking-tighter">VAT %{item.taxes?.vat_percent || 0}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-6 text-right">
                                                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-navy group-hover:text-white transition-all">
                                                                                    <Zap size={10} className="text-yellow" />
                                                                                    <span className="text-[8px] font-black uppercase tracking-widest italic">{item.logic || 'Verified'}</span>
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
                                <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-navy text-yellow rounded-lg flex items-center justify-center"><BrainCircuit size={16} /></div>
                                        <h4 className="text-[9px] font-black text-navy uppercase tracking-widest leading-none">Intelligence Node</h4>
                                    </div>

                                    <div className="space-y-6">
                                        {/* VALIDATION NODE */}
                                        <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[9px] font-black text-navy uppercase flex items-center gap-2 italic">
                                                    <ShieldCheck size={14} className={validation.isConsistent ? "text-emerald-500" : "text-red-500"} />
                                                    Validation Node
                                                </p>
                                                {loading && <Loader2 size={12} className="animate-spin text-slate-300" />}
                                            </div>

                                            <div className="space-y-2.5">
                                                {shipmentAlerts.length === 0 && !loading && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                                                        <Check size={14} /> Data aligned across dossier.
                                                    </div>
                                                )}
                                                {shipmentAlerts.map((alert, i) => (
                                                    <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border text-[10px] font-bold leading-relaxed
                                                        ${alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
                                                            alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                                'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                        {alert.type === 'error' ? <ShieldAlert size={14} /> : alert.type === 'warning' ? <AlertCircle size={14} /> : <FileSearch size={14} />}
                                                        <span>{alert.message}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative bg-white p-5 rounded-2xl border border-slate-100">
                                            {!user && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                                    <p className="text-[8px] font-black text-navy uppercase tracking-widest flex items-center gap-2"><Lock size={10} /> Member Briefing</p>
                                                </div>
                                            )}
                                            <p className="text-[9px] font-black text-navy/30 uppercase mb-3 flex items-center gap-2 italic"><TrendingUp size={14} /> Intelligence Node</p>
                                            <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">"{dossier[0]?.intelligence?.regulatory_notes || 'Analyzing compliance protocols...'}"</p>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-navy/30 uppercase italic flex items-center gap-2"><TargetIcon size={14} /> Suggested Entities</p>
                                            {(dossier[0]?.intelligence?.suggested_buyers || []).slice(0, user ? 10 : 3).map((buyer: string, i: number) => (
                                                <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 group hover:border-navy transition-all">
                                                    <div className="w-1 h-1 rounded-full bg-yellow" />
                                                    <span className="text-[10px] font-black uppercase text-navy/70 truncate">{buyer}</span>
                                                </div>
                                            ))}
                                            {!user && <p className="text-[7px] font-bold text-center text-slate-200 uppercase italic">Unlock with Intelligence Subscription</p>}
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
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-navy/40 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center relative border border-slate-100">
                            <button onClick={() => setShowQRModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-navy transition-colors"><X size={24} /></button>
                            <LoxLogo className="justify-center mb-8" />

                            <div className="bg-slate-50 p-6 rounded-2xl text-left mb-8 border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow/5 rounded-full blur-2xl -mr-10 -mt-10" />
                                <h5 className="text-[8px] font-black text-navy uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Globe size={11} className="text-yellow" /> Shipment Digital Twin
                                </h5>
                                <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed mb-6">
                                    This QR represents the 'Digital Twin' of the shipment. Scan for warehouse/port verification.
                                </p>
                                <div className="bg-white p-6 rounded-2xl flex items-center justify-center shadow-inner aspect-square mb-6">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://loxtr.com/dossier/${dossier[0]?.doc_metadata?.reference_no}`} alt="QR" className="w-full mix-blend-multiply opacity-90 transition-transform hover:scale-105 duration-700" />
                                </div>
                            </div>

                            <h4 className="text-xl font-black italic text-navy uppercase mb-1 tracking-tighter">Ref: {dossier[0]?.doc_metadata?.reference_no || 'N/A'}</h4>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">Warehouse/Port Digital Access Protocol</p>
                            <button className="w-full bg-navy text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-yellow hover:text-navy transition-all italic">Download Tracking Label</button>
                        </motion.div>
                    </div>
                )}

                {/* AUTH GATE MODAL */}
                {showAuthGate && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100">
                            <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-yellow mx-auto mb-6"><Lock size={24} /></div>
                            <h2 className="text-xl font-black italic text-navy uppercase mb-2 tracking-tighter">Member Access Only</h2>
                            <p className="text-[11px] font-bold text-slate-500 mb-8 leading-relaxed">
                                Advanced features like Cloud Vault, Master Export and Digital QR Sync are reserved for registered intelligence nodes.
                            </p>
                            <div className="flex flex-col gap-2.5">
                                <button onClick={() => window.location.href = `/register?redirectTo=${encodeURIComponent(window.location.href)}`} className="w-full bg-navy text-white py-3.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-yellow hover:text-navy transition-all">Create Free Account</button>
                                <button onClick={() => setShowAuthGate(false)} className="w-full py-3 rounded-lg text-[9px] font-black uppercase text-slate-300 hover:text-navy transition-all tracking-[0.2em]">Continue Browsing</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showExportWizard && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-navy/40 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
                            <div className="bg-navy p-6 text-white flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 blur-[100px] rounded-full" />
                                <div className="flex items-center gap-4 text-left relative z-10">
                                    <div className="w-10 h-10 bg-yellow rounded-xl flex items-center justify-center text-navy shadow-lg"><Binary size={22} /></div>
                                    <div>
                                        <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">Global <span className="text-yellow">Export.</span></h2>
                                        <p className="text-[7px] font-black text-blue-200 uppercase tracking-[0.2em] mt-1.5 opacity-60">Integrated Analytics Suite</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowExportWizard(false)} className="text-white/40 hover:text-white transition-colors relative z-10"><X size={20} /></button>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {Object.entries(EXPORT_TEMPLATES).map(([key, template]) => (
                                        <button key={key} onClick={() => setSelectedTemplate(key)} className={`p-5 rounded-xl border-2 text-left transition-all ${selectedTemplate === key ? 'border-yellow bg-yellow/5 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-100'}`}>
                                            <h5 className="text-[9px] font-black text-navy uppercase mb-1 italic tracking-tight">{template.name}</h5>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed tracking-wide">{template.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={runMasterExport} className="w-full bg-navy text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl hover:bg-yellow hover:text-navy hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 italic"><Download size={16} /> Generate Excel Package</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
