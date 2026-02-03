import { useState, useEffect, useRef } from 'react';
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
    Info,
    Database,
    Binary,
    Settings2,
    X,
    Layers,
    ClipboardCheck,
    AlertTriangle,
    FileSearch,
    ChevronDown,
    Save,
    Maximize2,
    MonitorSmartphone,
    Map
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/crm/AuthContext';
import toast from 'react-hot-toast';

// --- Minimalist Logo Component ---
const LoxLogo = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="relative">
            <div className="w-8 h-8 bg-navy rounded-lg rotate-3" />
            <div className="absolute inset-0 w-8 h-8 bg-yellow rounded-lg -rotate-3 mix-blend-multiply opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={14} className="text-white fill-white" />
            </div>
        </div>
        <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-navy uppercase">LOX<span className="text-yellow">TR</span></span>
            <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 uppercase">Intelligence</span>
        </div>
    </div>
);

// --- Info Tooltip Component ---
const InfoButton = ({ title, content }: { title: string, content: string }) => (
    <div className="group relative inline-block ml-2 cursor-help">
        <Info size={14} className="text-slate-300 hover:text-navy transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-navy text-white text-[10px] font-bold rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-[100] border border-white/10 backdrop-blur-xl">
            <p className="text-yellow mb-1 uppercase tracking-widest">{title}</p>
            <p className="leading-relaxed font-medium opacity-80">{content}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-navy" />
        </div>
    </div>
);

const EXPORT_TEMPLATES = {
    STANDARD: {
        id: 'standard', name: 'Standard Logistics', desc: 'General purpose shipping template.', icon: FileText,
        mapping: (item: any, isMetric: boolean) => ({ 'Item': item.description, 'HS_Code': item.hs_code, 'Quantity': item.qty, 'Unit': item.unit, 'Weight': isMetric ? (item.weight || 0) : ((item.weight || 0) * 2.20462).toFixed(2), 'Weight_Unit': isMetric ? 'KG' : 'LBS' })
    },
    CUSTOMS: {
        id: 'customs', name: 'Customs Ready (WCO)', desc: 'Compliant with global customs systems.', icon: ShieldCheck,
        mapping: (item: any, isMetric: boolean) => ({ 'Tariff_Code (12-digit)': item.hs_code?.padEnd(12, '0'), 'Description': item.description, 'Origin_Country': item.origin_country || 'UNKNOWN', 'Net_Weight': isMetric ? (item.weight || 0) : ((item.weight || 0) * 2.20462).toFixed(2), 'Total_Value': item.value || '0.00' })
    },
    ERP: {
        id: 'erp', name: 'ERP/SAP Integrated', desc: 'Ideal for SAP/Oracle import.', icon: Database,
        mapping: (item: any, isMetric: boolean) => ({ 'Material_Number (SKU)': `LOX-${item.hs_code?.slice(0, 4)}`, 'Line_Item_Text': item.description, 'Quantity': item.qty, 'Base_Unit_of_Measure': item.unit, 'Net_Weight_Custom': isMetric ? (item.weight || 0) : ((item.weight || 0) * 2.20462).toFixed(2), 'Plant_Code': '1000' })
    }
};

export default function LoxConvert() {
    const { user } = useAuth();
    const [dossier, setDossier] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processQueue, setProcessQueue] = useState<{ name: string, status: 'pending' | 'processing' | 'done' | 'error' }[]>([]);

    // UI State
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [showExportWizard, setShowExportWizard] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('STANDARD');
    const [isMetric, setIsMetric] = useState(true);
    const [showQRLabel, setShowQRLabel] = useState(false);

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setLoading(true);
        setProcessQueue(files.map(f => ({ name: f.name, status: 'pending' })));

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'processing' } : p));
            const reader = new FileReader();
            const base64: string = await new Promise((resolve) => {
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
                setDossier(prev => [...prev, { ...result, localId: Math.random(), fileName: file.name }]);
                setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
            } catch (err) {
                setProcessQueue(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
                toast.error(`Analysis failed for ${file.name}`);
            }
        }
        setLoading(false);
    };

    const handleSaveToVault = async () => {
        if (!user || dossier.length === 0) return;
        setSaveLoading(true);
        try {
            const shipmentName = dossier[0]?.doc_metadata?.reference_no || `Shipment_${new Date().getTime()}`;
            const { data: folder, error: fError } = await supabase.from('lox_folders').insert({
                user_id: user.id,
                name: `Dossier: ${shipmentName}`,
                metadata: {
                    type: 'shipment_dossier',
                    docs_count: dossier.length,
                    destination: dossier[0]?.doc_metadata?.destination_country || 'Global'
                }
            }).select().single();
            if (fError) throw fError;

            const docInserts = dossier.map(doc => ({
                user_id: user.id,
                folder_id: folder.id,
                doc_type: doc.doc_metadata?.type || 'shipment_document',
                content: doc,
                file_name: doc.fileName
            }));
            const { error: dError } = await supabase.from('lox_documents').insert(docInserts);
            if (dError) throw dError;

            toast.success("Shipment Dossier synchronized to Vault!");
        } catch (e: any) {
            toast.error(`Vault sync failed: ${e.message}`);
        } finally {
            setSaveLoading(false);
        }
    };

    const runMasterExport = () => {
        try {
            const template = EXPORT_TEMPLATES[selectedTemplate as keyof typeof EXPORT_TEMPLATES];
            const allItems = dossier.flatMap(d => d.items.map((item: any) => ({
                ...template.mapping(item, isMetric),
                'Source_Doc': d.doc_metadata?.type || d.fileName,
                'Shipment_Ref': d.doc_metadata?.reference_no || 'N/A'
            })));
            const ws = XLSX.utils.json_to_sheet(allItems);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "LOX_Master_Dossier");
            XLSX.writeFile(wb, `LOX_Master_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Master Excel Downloaded");
            setShowExportWizard(false);
        } catch (e) { toast.error("Export process failed."); }
    };

    const validation = (() => {
        if (dossier.length < 2) return null;
        const totalQtys = dossier.map(d => d.intelligence?.validation_hooks?.total_qty || 0).filter(q => q > 0);
        const totalWeights = dossier.map(d => d.intelligence?.validation_hooks?.total_weight || 0).filter(w => w > 0);
        return {
            isConsistent: new Set(totalQtys).size <= 1 && new Set(totalWeights).size <= 1,
            qtyMismatch: new Set(totalQtys).size > 1,
            weightMismatch: new Set(totalWeights).size > 1
        };
    })();

    // Aggregated Stats for Cards
    const aggregatedStats = {
        totalValue: dossier.reduce((sum, d) => sum + (d.intelligence?.validation_hooks?.total_value || 0), 0),
        currency: dossier[0]?.intelligence?.validation_hooks?.currency || 'USD',
        mainDestination: dossier[0]?.doc_metadata?.destination_country || 'Global Market',
        mainIncoterm: dossier[0]?.intelligence?.incoterms?.term || 'N/A',
        avgTax: dossier[0]?.items?.[0]?.taxes?.duty_percent || 0
    };

    return (
        <div className="min-h-screen bg-white font-outfit text-navy pb-32">
            {/* --- SLIM HEADER --- */}
            <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md z-[100] border-b border-slate-100 px-8 py-4">
                <div className="max-w-[1700px] mx-auto flex items-center justify-between h-full">
                    <LoxLogo />
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/vault')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy transition-colors">Digital Vault</button>
                        <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-black text-xs">U</div>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {dossier.length === 0 ? (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-48 max-w-7xl mx-auto px-6">
                        <div className="flex flex-col items-center text-center">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl mb-12 shadow-inner">
                                <BoxIcon className="w-20 h-20 text-navy" />
                            </motion.div>
                            <h1 className="text-6xl md:text-[5rem] font-black tracking-tighter leading-[0.9] mb-8">
                                Transform Shipments into <span className="text-yellow">Pure Logic.</span>
                            </h1>
                            <p className="max-w-xl text-slate-400 font-bold mb-16 leading-relaxed">
                                Upload invoices, packing lists, and certificates in bulk. Our AI connects the dots, validates data, and builds your digital shipment dossier.
                            </p>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-yellow blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-navy rounded-[3.5rem] p-4 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-2">
                                    <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-16 md:p-24 text-center">
                                        <input type="file" multiple onChange={handleFiles} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <Upload size={48} className="mx-auto mb-8 text-yellow" />
                                        <h3 className="text-2xl font-black italic mb-2">Drop Shipment Documents</h3>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50">Bulk Analysis Engine Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* --- SOPHISTICATED DOSSIER DASHBOARD --- */
                    <motion.div key="dashboard" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pt-28 max-w-[1700px] mx-auto px-8">
                        {/* Control Bar */}
                        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 p-10 bg-navy rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow/10 blur-[120px] rounded-full" />
                            <div className="flex items-center gap-10 relative z-10">
                                <button onClick={() => setDossier([])} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white hover:text-navy transition-all border border-white/5"><RefreshCcw size={28} /></button>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-[10px] font-black tracking-[0.4em] text-yellow uppercase">LOX AI CORE</span>
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-full border border-emerald-500/30">AUDIT READY</span>
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">Shipment Dossier <span className="text-yellow opacity-50"># {dossier[0]?.doc_metadata?.reference_no || 'UNLINKED'}</span></h2>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 relative z-10 mt-10 lg:mt-0">
                                <button onClick={() => setShowQRLabel(true)} className="px-10 py-5 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-navy transition-all flex items-center gap-3"><QrIcon size={18} /> Generate PR Label</button>
                                <button onClick={handleSaveToVault} disabled={saveLoading} className="px-10 py-5 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-navy transition-all flex items-center gap-3">
                                    {saveLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Push to Vault
                                </button>
                                <button onClick={() => setShowExportWizard(true)} className="px-10 py-5 bg-yellow text-navy rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3"><Download size={18} /> Global Export Engine</button>
                            </div>
                        </div>

                        {/* --- COMPLIANCE & INTELLIGENCE GRID --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            {/* Incoterms */}
                            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-navy/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Incoterms Protocol <InfoButton title="Incoterms 2020" content="Analyzes the detected trade term against the shipment flow to ensure logistical alignment." /></p>
                                        <ShieldCheck size={20} className="text-navy" />
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center text-yellow text-2xl font-black shadow-xl">{aggregatedStats.mainIncoterm}</div>
                                        <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full uppercase">Valid Term</span>
                                    </div>
                                </div>
                                <p className="mt-8 text-xs text-slate-400 font-bold italic leading-relaxed">"{dossier[0]?.intelligence?.incoterms?.advice || 'Protocol verified.'}"</p>
                            </div>

                            {/* Financial */}
                            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all">
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Financial Forecast <InfoButton title="Tax Analysis" content="Aggregated tax liability (Duty/VAT) based on the target country's customs regulations." /></p>
                                        <Scale size={20} className="text-navy" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Avg Duty</p>
                                            <p className="text-2xl font-black text-navy tracking-tighter">%{aggregatedStats.avgTax}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Dossier Total</p>
                                            <p className="text-2xl font-black text-navy tracking-tighter">{aggregatedStats.currency} {aggregatedStats.totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-slate-200/50">
                                    <p className="text-[9px] font-black text-slate-300 uppercase italic">Market: {aggregatedStats.mainDestination}</p>
                                </div>
                            </div>

                            {/* Integrity */}
                            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden">
                                {validation?.qtyMismatch && <div className="absolute top-0 right-0 p-8 text-red-500 animate-pulse"><AlertTriangle size={40} /></div>}
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Dossier Integrity <InfoButton title="Cross-Check Engine" content="Automated comparison between Invoice, Packing List and other docs to find quantity/weight mismatches." /></p>
                                        <ShieldQuestion size={20} className="text-navy" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase italic">Quantity Sync</span>
                                            {validation?.qtyMismatch ? <AlertCircle size={14} className="text-red-500" /> : <Check size={14} className="text-emerald-500" />}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase italic">Weight Sync</span>
                                            {validation?.weightMismatch ? <AlertCircle size={14} className="text-red-500" /> : <Check size={14} className="text-emerald-500" />}
                                        </div>
                                    </div>
                                </div>
                                <p className={`mt-8 text-[10px] font-black uppercase ${validation?.isConsistent ? 'text-emerald-500' : 'text-red-500 animate-bounce'}`}>
                                    {validation?.isConsistent ? 'Dossier 100% Consistent' : 'CRITICAL MISMATCH DETECTED'}
                                </p>
                            </div>

                            {/* Intelligence / Geography */}
                            <div className="bg-navy p-10 rounded-[3rem] text-white flex flex-col justify-between group hover:-translate-y-2 transition-all shadow-xl">
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <p className="text-[10px] font-black text-yellow uppercase tracking-widest italic">Destination Radar <InfoButton title="Target Market" content="Real-time identification of the destination market and sector-specific risk scoring." /></p>
                                        <Map size={20} className="text-yellow" />
                                    </div>
                                    <h5 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{aggregatedStats.mainDestination}</h5>
                                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest italic">{dossier[0]?.intelligence?.commodity_category || 'General Cargo'}</p>
                                </div>
                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-white/40 uppercase mb-1">Risk Factor</span>
                                        <span className="text-lg font-black text-yellow">{dossier[0]?.intelligence?.risk_score || '1'}/10</span>
                                    </div>
                                    <TrendingUp size={24} className="text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        {/* --- MAIN MATRIX & LIST --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            <div className="lg:col-span-8 space-y-8">
                                {dossier.map((doc, idx) => (
                                    <motion.div key={doc.localId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-[3rem] p-4 border border-slate-100 shadow-xl group hover:border-navy transition-all overflow-hidden">
                                        <div className="p-6 flex flex-col lg:flex-row items-center justify-between gap-8">
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-navy shadow-inner group-hover:bg-navy group-hover:text-yellow transition-all">
                                                    <FileSearch size={28} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[9px] font-black text-navy uppercase px-2 py-0.5 bg-yellow rounded shadow-sm">{doc.doc_metadata?.type || 'UNLINKED'}</span>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {doc.doc_metadata?.reference_no || 'N/A'}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black italic text-navy truncate max-w-sm uppercase">{doc.fileName}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-12 text-center lg:text-right px-8 border-l border-slate-50">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Items</p>
                                                    <p className="text-xl font-black">{doc.items.length}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Total Wt</p>
                                                    <p className="text-xl font-black">{doc.intelligence?.validation_hooks?.total_weight || '0'} kg</p>
                                                </div>
                                                <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-navy hover:text-white transition-all"><Maximize2 size={20} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="lg:col-span-4 sticky top-28 space-y-8">
                                <div className="bg-navy p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 blur-[100px] rounded-full" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/5">
                                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-yellow"><BrainCircuit size={32} /></div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em]">AI Intelligence Node</h4>
                                                <p className="text-[9px] font-bold text-white/30 uppercase italic">Operational Protocol analysis</p>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            <div>
                                                <p className="text-[10px] font-black text-yellow uppercase mb-3 flex items-center gap-2 italic"><ShieldAlert size={14} /> Regulatory Briefing</p>
                                                <p className="text-xs font-bold leading-relaxed text-blue-50 italic">
                                                    "{dossier[0]?.intelligence?.regulatory_notes || "Awaiting specific document context for exhaustive regulatory sweep..."}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {(dossier[0]?.intelligence?.suggested_buyers || []).map((buyer: string, i: number) => (
                                                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-all">
                                                        <div className="w-10 h-10 bg-yellow rounded-xl flex items-center justify-center text-navy group-hover:rotate-12 transition-transform"><TargetIcon size={18} /></div>
                                                        <span className="text-[10px] font-black uppercase italic text-white/80">{buyer}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- PHYSICAL QR LABEL OVERLAY --- */}
            <AnimatePresence>
                {showQRLabel && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[4rem] p-12 max-w-md w-full shadow-2xl text-center relative">
                            <button onClick={() => setShowQRLabel(false)} className="absolute top-8 right-8 text-slate-300 hover:text-navy"><X size={24} /></button>
                            <div className="flex justify-center mb-10"><LoxLogo /></div>
                            <div className="bg-slate-50 p-8 rounded-[3rem] mb-10 border border-slate-100 flex items-center justify-center aspect-square shadow-inner">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LOXDOSSIER_${dossier[0]?.doc_metadata?.reference_no}`} alt="QR" className="w-full h-full mix-blend-multiply opacity-80" />
                            </div>
                            <h4 className="text-xl font-black italic text-navy uppercase mb-2">Shipment ID: {dossier[0]?.doc_metadata?.reference_no || 'Pending'}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Scan to access Digital Dossier at Port</p>
                            <button className="w-full bg-navy text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-yellow hover:text-navy transition-all">Download Label PDF</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- EXPORT WIZARD --- */}
            <AnimatePresence>
                {showExportWizard && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[4rem] max-w-4xl w-full overflow-hidden shadow-2xl">
                            <div className="bg-navy p-12 text-white flex items-center justify-between">
                                <div className="flex items-center gap-6 text-left">
                                    <div className="w-16 h-16 bg-yellow rounded-[1.5rem] flex items-center justify-center text-navy shadow-xl"><Binary size={32} /></div>
                                    <div>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Master <span className="text-yellow">Dossier Engine.</span></h2>
                                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em]">Integrated Logistics Analytics</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowExportWizard(false)} className="text-white/40 hover:text-white"><X size={28} /></button>
                            </div>
                            <div className="p-16">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    {Object.entries(EXPORT_TEMPLATES).map(([key, template]) => (
                                        <button key={key} onClick={() => setSelectedTemplate(key)} className={`p-8 rounded-[2.5rem] border-2 text-left transition-all ${selectedTemplate === key ? 'border-yellow bg-yellow/5 shadow-xl' : 'border-slate-50 bg-slate-50/50'}`}>
                                            <h5 className="text-sm font-black text-navy uppercase mb-2 italic">{template.name}</h5>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">{template.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={runMasterExport} className="w-full bg-navy text-white py-8 rounded-[3rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-yellow hover:text-navy hover:-translate-y-2 transition-all flex items-center justify-center gap-6 group italic">
                                    <Download size={28} className="group-hover:translate-y-1 transition-transform" /> Generate Dossier Package (Excel)
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BoxIcon({ className }: { className: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
        </svg>
    );
}
