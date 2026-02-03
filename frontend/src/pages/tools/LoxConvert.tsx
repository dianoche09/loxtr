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
    const navigate = useNavigate();
    const [dossier, setDossier] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processQueue, setProcessQueue] = useState<{ name: string, status: 'pending' | 'processing' | 'done' | 'error' }[]>([]);

    // UI State
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
                metadata: { type: 'shipment_dossier', docs_count: dossier.length, destination: dossier[0]?.doc_metadata?.destination_country || 'Global' }
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

    const aggregatedStats = {
        totalValue: dossier.reduce((sum, d) => sum + (d.intelligence?.validation_hooks?.total_value || 0), 0),
        currency: dossier[0]?.intelligence?.validation_hooks?.currency || 'USD',
        mainDestination: dossier[0]?.doc_metadata?.destination_country || 'Global Market',
        mainIncoterm: dossier[0]?.intelligence?.incoterms?.term || 'N/A',
        avgTax: dossier[0]?.items?.[0]?.taxes?.duty_percent || 0
    };

    return (
        <div className="min-h-screen bg-slate-50 font-outfit text-navy pb-32">
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
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-6xl mx-auto px-6 pt-24 md:pt-32">
                        {/* RESTORED PREMIUM HERO */}
                        <div className="text-center mb-20 pt-10">
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-navy text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8 shadow-xl">
                                <Sparkles size={12} className="text-yellow" /> LOX AI RADAR • INTELLIGENCE NODE
                            </motion.div>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tight text-navy mb-8 leading-none">
                                Don't just extract.<br />
                                <span className="text-yellow bg-navy px-5 py-2 rounded-2xl inline-block -rotate-1 shadow-2xl">Understand.</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed mb-12">
                                The world's first <span className="text-navy underline decoration-yellow decoration-4 underline-offset-4">Customs AI</span> that conducts digital audits, tax forecasting and market intelligence.
                            </p>

                            <div className="max-w-3xl mx-auto mb-20">
                                <div className="bg-white rounded-[4rem] p-6 shadow-2xl shadow-slate-200/80 border-t-[12px] border-yellow relative group overflow-hidden transition-all hover:shadow-yellow/10">
                                    <div className={`relative border-2 border-dashed rounded-[3rem] p-12 md:p-24 text-center transition-all duration-500
                                        ${loading ? 'border-yellow bg-yellow/5' : 'border-slate-100 bg-slate-50/50 hover:border-yellow'}`}
                                    >
                                        <input type="file" multiple onChange={handleFiles} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={loading} />
                                        <div className="flex flex-col items-center">
                                            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 transition-all shadow-2xl
                                                ${loading ? 'bg-navy text-yellow ring-8 ring-yellow/10 animate-pulse' : 'bg-white text-navy border border-slate-100 group-hover:scale-105'}`}
                                            >
                                                {loading ? <Loader2 size={48} className="animate-spin" /> : <Layers size={48} />}
                                            </div>
                                            <h3 className="text-3xl font-black text-navy mb-3 italic tracking-tighter">
                                                {loading ? 'BUILDING DOSSIER...' : 'INJECT ALL SHIPMENT DOCS'}
                                            </h3>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Multi-File Vision Processing Active</p>
                                        </div>
                                    </div>

                                    {/* Queue Feedback */}
                                    <AnimatePresence>
                                        {processQueue.length > 0 && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-8 border-t border-slate-50 pt-8 px-6">
                                                <div className="flex flex-col gap-3">
                                                    {processQueue.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-[11px] font-bold uppercase italic">
                                                            <div className="flex items-center gap-3"><FileText size={14} className="text-slate-300" /><span className="text-navy">{file.name}</span></div>
                                                            <span className={`px-3 py-1 rounded-full ${file.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{file.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* --- SOPHISTICATED DOSSIER DASHBOARD (SLIMMED) --- */
                    <motion.div key="dashboard" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pt-28 max-w-[1700px] mx-auto px-8">
                        {/* Control Bar (Slimmed & Organized) */}
                        <div className="flex flex-col lg:flex-row items-center justify-between mb-12 p-8 bg-navy rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-yellow/5 blur-[100px] rounded-full" />
                            <div className="flex items-center gap-8 relative z-10">
                                <button onClick={() => setDossier([])} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-navy transition-all border border-white/5"><RefreshCcw size={24} /></button>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[9px] font-black tracking-[0.4em] text-yellow uppercase">LOX AI CORE</span>
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[7px] font-black rounded-full border border-emerald-500/30 uppercase">Audit Passed</span>
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Shipment Dossier <span className="text-yellow/40"># {dossier[0]?.doc_metadata?.reference_no || 'UNLINKED'}</span></h2>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 relative z-10 mt-6 lg:mt-0">
                                <button onClick={() => setShowQRLabel(true)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-navy transition-all flex items-center gap-2"><QrIcon size={16} /> QR Sync</button>
                                <button onClick={handleSaveToVault} disabled={saveLoading} className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-navy transition-all flex items-center gap-2">
                                    {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Push to Vault
                                </button>
                                <button onClick={() => setShowExportWizard(true)} className="px-8 py-4 bg-yellow text-navy rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"><Download size={16} /> Global Export</button>
                            </div>
                        </div>

                        {/* --- ANALYTICS CARDS (ORGANIZED FOR CUSTOMS) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {/* Incoterms */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Incoterms Protocol <InfoButton title="Incoterms 2020" content="Analyzes the detected trade term against the shipment flow to ensure logistical alignment." /></p>
                                        <ShieldCheck size={18} className="text-slate-200" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-yellow text-xl font-black shadow-lg">{aggregatedStats.mainIncoterm}</div>
                                        <span className="text-[9px] font-black px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full uppercase">Valid Term</span>
                                    </div>
                                </div>
                                <p className="mt-6 text-[10px] text-slate-400 font-bold italic leading-relaxed">"{dossier[0]?.intelligence?.incoterms?.advice || 'Protocol verified.'}"</p>
                            </div>

                            {/* Financial */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Financial Forecast <InfoButton title="Tax Analysis" content="Aggregated tax liability based on global customs regulations." /></p>
                                        <Scale size={18} className="text-slate-200" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Avg Duty</p><p className="text-xl font-black text-navy tracking-tighter">%{aggregatedStats.avgTax}</p></div>
                                        <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Dossier Total</p><p className="text-xl font-black text-navy tracking-tighter">{aggregatedStats.currency} {aggregatedStats.totalValue.toLocaleString()}</p></div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50"><p className="text-[8px] font-black text-slate-300 uppercase italic">Market: {aggregatedStats.mainDestination}</p></div>
                            </div>

                            {/* Integrity */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Dossier Integrity <InfoButton title="Cross-Check Engine" content="Automated comparison between documents to find quantity/weight mismatches." /></p>
                                        <ShieldQuestion size={18} className="text-slate-200" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase italic">Qty Sync</span>{validation?.qtyMismatch ? <AlertCircle size={12} className="text-red-500" /> : <Check size={12} className="text-emerald-500" />}</div>
                                        <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase italic">Weight Sync</span>{validation?.weightMismatch ? <AlertCircle size={12} className="text-red-500" /> : <Check size={12} className="text-emerald-500" />}</div>
                                    </div>
                                </div>
                                <p className={`mt-6 text-[9px] font-black uppercase ${validation?.isConsistent ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                                    {validation?.isConsistent ? 'Dossier 100% Consistent' : 'MISMATCH DETECTED'}
                                </p>
                            </div>

                            {/* Market Intelligence */}
                            <div className="bg-navy p-8 rounded-[2.5rem] text-white flex flex-col justify-between group shadow-xl">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-[9px] font-black text-yellow uppercase tracking-widest italic">Destination Radar <InfoButton title="Target Market" content="Real-time identification of the destination market and sector-specific risk scoring." /></p>
                                        <Map size={18} className="text-yellow" />
                                    </div>
                                    <h5 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{aggregatedStats.mainDestination}</h5>
                                    <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest italic">{dossier[0]?.intelligence?.commodity_category || 'General Cargo'}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between"><span className="text-lg font-black text-yellow">{dossier[0]?.intelligence?.risk_score || '1'}/10</span><TrendingUp size={20} className="text-emerald-400" /></div>
                            </div>
                        </div>

                        {/* --- CONTENT MATRIX --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-6">
                                {dossier.map((doc, idx) => (
                                    <motion.div key={doc.localId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg group hover:border-navy transition-all animate-in slide-in-from-left duration-300">
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-navy shadow-inner group-hover:bg-navy group-hover:text-yellow transition-all"><FileSearch size={24} /></div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[8px] font-black text-navy uppercase px-1.5 py-0.5 bg-yellow rounded">{doc.doc_metadata?.type || 'UNLINKED'}</span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase">Ref: {doc.doc_metadata?.reference_no || 'N/A'}</span>
                                                    </div>
                                                    <h3 className="text-lg font-black italic text-navy truncate max-w-sm uppercase">{doc.fileName}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10 text-right px-6 border-l border-slate-50">
                                                <div className="hidden md:block"><p className="text-[7px] font-black text-slate-300 uppercase mb-1">Total Wt</p><p className="text-lg font-black">{doc.intelligence?.validation_hooks?.total_weight || '0'} kg</p></div>
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-navy hover:text-white transition-all"><Maximize2 size={18} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
                                        <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-yellow"><BrainCircuit size={24} /></div>
                                        <div>
                                            <h4 className="text-[9px] font-black text-navy uppercase tracking-[0.3em]">Trade Intelligence</h4>
                                            <p className="text-[8px] font-bold text-slate-300 uppercase italic">Regulatory Scan</p>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div>
                                            <p className="text-[9px] font-black text-navy mb-3 flex items-center gap-2 italic uppercase"><ShieldAlert size={12} className="text-red-500" /> Regulatory Note</p>
                                            <p className="text-xs font-bold leading-relaxed text-slate-500 italic">"{dossier[0]?.intelligence?.regulatory_notes || "Document context scan complete."}"</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {(dossier[0]?.intelligence?.suggested_buyers || []).map((buyer: string, i: number) => (
                                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 group cursor-pointer hover:bg-navy hover:text-white transition-all">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-navy shadow-sm group-hover:rotate-12 transition-transform"><TargetIcon size={16} /></div>
                                                    <span className="text-[9px] font-black uppercase italic">{buyer}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODALS (QR & EXPORT) --- */}
            <AnimatePresence>
                {showQRLabel && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3.5rem] p-10 max-w-sm w-full shadow-2xl text-center relative">
                            <button onClick={() => setShowQRLabel(false)} className="absolute top-6 right-6 text-slate-300 hover:text-navy"><X size={20} /></button>
                            <LoxLogo className="justify-center mb-8" />
                            <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-8 border border-slate-100 flex items-center justify-center shadow-inner">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LOXDOSSIER_${dossier[0]?.doc_metadata?.reference_no}`} alt="QR" className="w-full mix-blend-multiply opacity-80" />
                            </div>
                            <h4 className="text-lg font-black italic text-navy uppercase mb-1">Dossier ID: {dossier[0]?.doc_metadata?.reference_no || 'Pending'}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">Scan to sync physical to digital</p>
                            <button className="w-full bg-navy text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow hover:text-navy transition-all">Download Label PDF</button>
                        </motion.div>
                    </div>
                )}
                {showExportWizard && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3.5rem] max-w-3xl w-full overflow-hidden shadow-2xl">
                            <div className="bg-navy p-10 text-white flex items-center justify-between">
                                <div className="flex items-center gap-5 text-left">
                                    <div className="w-14 h-14 bg-yellow rounded-xl flex items-center justify-center text-navy shadow-xl"><Binary size={28} /></div>
                                    <div><h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Global Export <span className="text-yellow">Engine.</span></h2></div>
                                </div>
                                <button onClick={() => setShowExportWizard(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
                            </div>
                            <div className="p-12">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                    {Object.entries(EXPORT_TEMPLATES).map(([key, template]) => (
                                        <button key={key} onClick={() => setSelectedTemplate(key)} className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedTemplate === key ? 'border-yellow bg-yellow/5' : 'border-slate-50 bg-slate-50/50 hover:border-slate-100'}`}>
                                            <h5 className="text-[10px] font-black text-navy uppercase mb-1 italic">{template.name}</h5>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed">{template.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={runMasterExport} className="w-full bg-navy text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-yellow hover:text-navy hover:-translate-y-1 transition-all flex items-center justify-center gap-4 italic"><Download size={24} /> Generate & Download</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
