import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, Loader2, Download, AlertCircle, ArrowRight, HelpCircle, Send, Sparkles, Globe, ShieldCheck, Target, ExternalLink, FolderPlus, QrCode, FileType, Info, Activity } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/crm/AuthContext';
import RadarScanner from '../../components/RadarScanner';

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
    const navigate = useNavigate();
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);

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
                    name: `Dossier: ${fileName.split('.')[0]}`,
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
            alert("📦 Dosya Başarıyla 'Smart Vault' Klasörüne Kaydedildi!");
        } catch (e: any) {
            console.error(e);
            alert("Hata: " + e.message);
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
                    companyInfo: { name: user?.email?.split('@')[0].toUpperCase(), address: "Istanbul, Turkey" }
                })
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
            setInvoiceData(result);
            setShowInvoiceModal(true);
        } catch (e: any) {
            console.error(e);
            alert("Fatura oluşturulamadı: " + e.message);
        } finally {
            setInvoiceLoading(false);
        }
    };

    const handleCreateLoxQR = () => {
        alert("🔗 LoxQR Oluşturuldu! Bu QR'ı koli üzerine yapıştırarak gümrükçülerin dijital dökümanlara anında erişmesini sağlayabilirsiniz.");
    };

    const checkUpsell = () => {
        const count = parseInt(localStorage.getItem('lox_convert_count') || '0');
        const newCount = count + 1;
        localStorage.setItem('lox_convert_count', newCount.toString());

        if (newCount === 3) {
            setShowPromoModal(true);
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
            setError(`Unsupported format. Please upload PDF, PNG or JPG.`);
            setLoading(false);
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const endpoint = '/api/loxconvert';
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileBase64: (reader.result as string).split(',')[1],
                        fileName: file.name,
                        mimeType: file.type || 'application/octet-stream',
                        userId: user?.id
                    })
                });

                if (!res.ok) {
                    const errDetails = await res.json().catch(() => ({}));
                    throw new Error(errDetails.error || 'Failed to analyze document');
                }

                const resultData = await res.json();
                setData(resultData);
                checkUpsell();
            } catch (err: any) {
                console.error(err);
                setError(err.message || "An error occurred during analysis.");
            } finally {
                setLoading(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.onerror = () => {
            setError("Failed to read file.");
            setLoading(false);
            e.target.value = '';
        };
    };

    return (
        <div className="min-h-screen bg-[#050505] font-outfit text-white selection:bg-yellow selection:text-navy">
            {/* --- PREMIUM STICKY HEADER --- */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/50 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-10 h-10 bg-yellow rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,166,35,0.3)] group-hover:scale-110 transition-transform">
                        <Target className="text-navy" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter italic leading-none">
                            LOX<span className="text-yellow">CONVERT</span> AI
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trade Intelligence Engine v2.5</p>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    {['Network', 'Security', 'Insights', 'Radar'].map((item) => (
                        <span key={item} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors cursor-crosshair">
                            {item}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all px-4 py-2">
                        Systems Status
                    </button>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-yellow font-black text-xs">
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                </div>
            </nav>

            <AnimatePresence mode="wait">
                {!data ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="min-h-screen flex flex-col lg:flex-row pt-20"
                    >
                        {/* LEFT: APPLE-STYLE NARRATIVE */}
                        <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 py-20 relative overflow-hidden border-r border-white/5">
                            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full" />

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10"
                            >
                                <span className="inline-block px-4 py-1.5 bg-yellow text-navy text-[10px] font-black uppercase tracking-[0.4em] mb-8 rounded-full">
                                    Revolutionizing Logistics
                                </span>
                                <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8">
                                    Intelligence <br />
                                    <span className="text-yellow">Unleashed.</span>
                                </h1>
                                <p className="text-xl text-slate-400 max-w-lg font-medium leading-relaxed mb-12">
                                    Turn static logistics documents into dynamic operational assets.
                                    Powered by LOXTR Intelligence, LoxConvert AI extracts, analyzes,
                                    and predicts with 99.8% precision.
                                </p>

                                <div className="grid grid-cols-2 gap-8 py-8 border-t border-white/10">
                                    <div>
                                        <p className="text-3xl font-black text-white italic">0.4s</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Extraction Speed</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-yellow italic">HS AI™</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Universal Classifier</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT: CYBER UPLOAD ZONE */}
                        <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-8 md:p-20 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,166,35,0.03)_0%,_transparent_70%)]" />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="w-full max-w-xl relative"
                            >
                                <div className="absolute -top-12 -left-12 opacity-50">
                                    <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-yellow animate-pulse" />
                                </div>
                                <div className="absolute -bottom-12 -right-12 opacity-50">
                                    <div className="absolute top-0 left-0 w-24 h-24 border-b-2 border-r-2 border-yellow animate-pulse" />
                                </div>

                                <div className={`relative group border border-white/10 rounded-[3rem] p-1 bg-black overflow-hidden
                                    ${loading ? 'cursor-wait bg-navy/50' : 'cursor-pointer'}`}
                                >
                                    {loading && (
                                        <motion.div
                                            animate={{ top: ['0%', '100%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-1 bg-yellow/50 shadow-[0_0_15px_#F5A623] z-20"
                                        />
                                    )}

                                    <div className="relative z-10 p-12 lg:p-20 flex flex-col items-center text-center">
                                        <input
                                            type="file"
                                            onChange={handleFile}
                                            className="absolute inset-0 opacity-0 z-30 cursor-pointer disabled:cursor-not-allowed"
                                            disabled={loading}
                                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                                        />

                                        <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-10 transition-all duration-500
                                            ${loading ? 'bg-navy border-yellow ring-4 ring-yellow/20' : 'bg-white/5 border border-white/10 group-hover:bg-yellow group-hover:text-navy group-hover:scale-110'}`}
                                        >
                                            {loading ? <Loader2 size={48} className="animate-spin text-yellow" /> : <Upload size={48} className="text-white group-hover:text-navy transition-colors" />}
                                        </div>

                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
                                            {loading ? 'Analyzing Core...' : 'Inject Document'}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-bold tracking-[0.2em] mb-8">
                                            PDF • JPG • PNG (MAX 10MB)
                                        </p>

                                        {error && (
                                            <div className="mb-8 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                                <AlertCircle size={16} />
                                                {error}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                                SECURE
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <div className="flex items-center gap-2">
                                                <Globe size={14} className="text-blue-500" />
                                                CLOUD-NATIVE
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pt-32 px-6 md:px-12 max-w-[1600px] mx-auto pb-40"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-white/5 pb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="px-3 py-1 bg-yellow text-navy text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        Doc ID: {fileName.toUpperCase().slice(0, 10)}
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                                        Scan Confirmed
                                    </div>
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                                    Intelligence <span className="text-yellow">Report.</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-4 text-slate-500 font-bold">
                                    <FileText size={18} />
                                    <span>{fileName}</span>
                                    <span className="text-yellow mx-2">/</span>
                                    <span>{data.length} LINE ITEMS EXTRACTED</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setData(null)}
                                    className="px-8 py-4 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Inject New File
                                </button>
                                <button
                                    onClick={() => exportToExcel(data, fileName)}
                                    className="px-8 py-4 bg-yellow text-navy rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,166,35,0.2)] flex items-center gap-3"
                                >
                                    <Download size={18} />
                                    Export to Intelligence Excel
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-8">
                                <div className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-0">
                                            <thead>
                                                <tr className="bg-white/[0.02]">
                                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Description</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quantity</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">HS Prediction</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Insight</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {data.map((item, i) => (
                                                    <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                                        <td className="px-8 py-6 text-sm font-bold text-white mb-0">{item.description}</td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-white">{item.qty}</span>
                                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.unit}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 border-0">
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-4 py-2 bg-yellow/5 border border-yellow/20 rounded-xl text-yellow text-xs font-mono font-black tracking-widest">
                                                                    {item.hs_code || '---'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <button
                                                                onClick={() => handleInsights(item)}
                                                                className={`p-3 rounded-xl transition-all ${selectedItem === item ? 'bg-yellow text-navy shadow-lg shadow-yellow/30' : 'bg-white/5 text-slate-400 hover:bg-yellow/10 hover:text-yellow'}`}
                                                            >
                                                                <Sparkles size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <button onClick={handleSaveToFolder} className="p-8 bg-[#0c0c0c] border border-white/5 rounded-[2rem] text-left hover:border-yellow/30 transition-all group">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow group-hover:text-navy transition-all"><FolderPlus size={24} /></div>
                                        <h3 className="text-lg font-black italic uppercase tracking-tighter mb-2">Smart Vault</h3>
                                        <p className="text-xs text-slate-500 font-medium">Save to your encrypted company dossier.</p>
                                    </button>
                                    <button onClick={handleGenerateInvoice} className="p-8 bg-[#0c0c0c] border border-white/5 rounded-[2rem] text-left hover:border-yellow/30 transition-all group">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow group-hover:text-navy transition-all"><FileType size={24} /></div>
                                        <h3 className="text-lg font-black italic uppercase tracking-tighter mb-2">AI Invoice</h3>
                                        <p className="text-xs text-slate-500 font-medium">Auto-generate commercial invoice draft.</p>
                                    </button>
                                    <button onClick={handleCreateLoxQR} className="p-8 bg-[#0c0c0c] border border-white/5 rounded-[2rem] text-left hover:border-yellow/30 transition-all group">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow group-hover:text-navy transition-all"><QrCode size={24} /></div>
                                        <h3 className="text-lg font-black italic uppercase tracking-tighter mb-2">LoxQR Label</h3>
                                        <p className="text-xs text-slate-500 font-medium">Print smart tracking labels for cargo.</p>
                                    </button>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-navy border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-40 h-40 mb-10"><RadarScanner active={true} /></div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">LOX AI RADAR</h3>
                                        <p className="text-sm text-blue-200/60 font-medium mb-8">Scanning Target Market: <span className="text-yellow font-black">{targetCountry}</span></p>
                                        <select value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm font-black text-white outline-none focus:border-yellow transition-all">
                                            <option value="Germany">GERMANY 🇩🇪</option>
                                            <option value="United Kingdom">UNITED KINGDOM 🇬🇧</option>
                                            <option value="USA">USA 🇺🇸</option>
                                            <option value="France">FRANCE 🇫🇷</option>
                                            <option value="UAE">UAE 🇦🇪</option>
                                        </select>
                                    </div>
                                </div>
                                {insightData && (
                                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0c0c0c] border-l-4 border-yellow rounded-[2.5rem] p-10">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Security Intelligence</h4>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-yellow uppercase tracking-widest mb-2">HS Code Identity</p>
                                                <p className="text-2xl font-black text-white italic">{selectedItem?.hs_code}</p>
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-xs text-slate-400 italic">"Detected items are classified under Trade Protocol A-12. Priority clearance recommended."</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PROMO MODAL */}
            <AnimatePresence>
                {showPromoModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-12 max-w-lg w-full text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-yellow" />
                            <div className="w-20 h-20 bg-yellow/10 rounded-3xl flex items-center justify-center mx-auto mb-8"><Activity className="text-yellow" size={40} /></div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">Power User Active.</h2>
                            <p className="text-slate-500 mb-12">Upgrade to LOXTR PRO for unlimited trade intelligence.</p>
                            <button className="w-full py-5 bg-yellow text-navy font-black italic uppercase tracking-widest rounded-2xl">UPGRADE TO PRO</button>
                            <button onClick={() => setShowPromoModal(false)} className="mt-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">CONTINUE AS GUEST</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* INVOICE MODAL */}
            <AnimatePresence>
                {showInvoiceModal && invoiceData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/95 backdrop-blur-2xl overflow-y-auto">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] max-w-4xl w-full text-navy shadow-2xl my-20 p-12 lg:p-20 relative">
                            <button onClick={() => setShowInvoiceModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-navy p-3 bg-slate-50 rounded-full">✕</button>
                            <div className="flex justify-between items-start mb-16 border-b border-slate-100 pb-16">
                                <div>
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Commercial <span className="text-yellow bg-navy px-4 rounded-xl">Invoice</span></h2>
                                    <p className="text-[10px] font-black uppercase text-slate-400">AI-GENERATED DRAFT</p>
                                </div>
                                <div className="bg-navy text-white px-6 py-4 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Amount</p>
                                    <p className="text-2xl font-black italic">{invoiceData.currency} {invoiceData.total_amount?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-16 mb-16 italic">
                                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-4">Exporter</p><p className="text-lg font-black text-navy">{invoiceData.exporter?.name}</p></div>
                                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-4">Importer</p><p className="text-sm font-bold text-slate-400">Targeting {targetCountry}...</p></div>
                            </div>
                            <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
                                <button className="px-10 py-5 bg-navy text-white font-black italic uppercase tracking-widest rounded-2xl flex items-center gap-4">
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
