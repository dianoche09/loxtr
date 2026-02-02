import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, Loader2, Download, AlertCircle, ArrowRight, HelpCircle, Send, Sparkles, Globe, ShieldCheck, Target, ExternalLink, FolderPlus, QrCode, FileType, Info } from 'lucide-react';
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

    // Check usage for upsell
    const checkUpsell = () => {
        const count = parseInt(localStorage.getItem('lox_convert_count') || '0');
        const newCount = count + 1;
        localStorage.setItem('lox_convert_count', newCount.toString());

        if (newCount === 3) {
            setShowPromoModal(true);
        }
    };

    const handleFreightRequest = async () => {
        if (!data) return;
        setRequestLoading(true);

        const summary = {
            user_id: user?.id || null,
            items: data.map(i => `${i.qty} ${i.unit} ${i.description}`).join(", "),
            total_qty: data.reduce((acc, curr) => acc + (parseInt(curr.qty) || 0), 0),
            total_weight: data.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0),
            source_file: fileName,
            status: 'pending'
        };

        try {
            const { error } = await supabase.from('freight_leads').insert([summary]);
            if (error) throw error;
            setRequestSuccess(true);
        } catch (err) {
            console.error("Failed to save freight lead:", err);
            // Fallback: If DB insertion fails, we could potentially open a fallback modal or just redirect
            alert("Something went wrong. Please try contacting us directly.");
        } finally {
            setRequestLoading(false);
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

        console.log("File selected:", file.name, file.type);

        // Reset State
        setError(null);
        setData(null);
        setFileName(file.name);
        setLoading(true);

        // Validation (Loose check)
        // Note: Some systems use application/x-pdf or different casing
        const validTypes = ['application/pdf', 'application/x-pdf', 'image/jpeg', 'image/png', 'image/webp'];

        if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
            // Fallback: If type is empty/weird but extension is .pdf, let it pass (backend might handle it or fail)
            // But if totally wrong:
            console.warn("Invalid file type:", file.type);
            setError(`Unsupported file format (${file.type || 'unknown'}). Please upload PDF, PNG or JPG.`);
            setLoading(false);
            e.target.value = ''; // Reset input to allow re-selecting same bad file if needed
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
                        mimeType: file.type || 'application/octet-stream', // Fallback mime
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
                if (err.message.includes("Daily limit reached")) {
                    setError("Daily limit exceeded. Please upgrade your plan for unlimited conversions.");
                } else {
                    setError(err.message || "An error occurred during analysis.");
                }
            } finally {
                setLoading(false);
                // Reset input to allow re-uploading same file later
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
        <div className="min-h-screen bg-off-white font-outfit pb-24">
            {/* HERO SECTION */}
            <section className="bg-navy text-white py-16 md:py-24 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-yellow/5 blur-[150px]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-yellow text-xs font-bold uppercase tracking-widest mb-8 border border-white/10"
                        >
                            <span className="w-2 h-2 rounded-full bg-yellow animate-pulse" />
                            Free Trade Document Tool
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
                        >
                            Convert Packing Lists to
                            <span className="text-yellow"> Structured Excel </span>
                            with AI
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-12"
                        >
                            Upload your packing list, invoice, or any logistics document.
                            Our AI extracts items, suggests HS codes, and identifies customs risks —
                            <strong className="text-white"> all in seconds.</strong>
                        </motion.p>

                        {/* MAIN UPLOAD AREA */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl mx-auto"
                        >
                            <div className={`relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                                ${loading ? 'border-slate-200 bg-slate-50 cursor-wait' : 'border-navy/20 hover:border-yellow hover:bg-yellow/5 cursor-pointer'}`}
                            >
                                <input
                                    type="file"
                                    onChange={handleFile}
                                    className="absolute inset-0 opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={loading}
                                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                                />

                                <div className="flex flex-col items-center gap-4">
                                    <div className={`p-5 rounded-2xl transition-all duration-300 ${loading ? 'bg-slate-100' : 'bg-navy group-hover:bg-yellow group-hover:scale-110'}`}>
                                        {loading ? (
                                            <Loader2 size={32} className="text-navy animate-spin" />
                                        ) : (
                                            <Upload size={32} className="text-yellow group-hover:text-navy transition-colors" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-navy mb-2">
                                            {loading ? 'Analyzing with AI...' : 'Drop your document here'}
                                        </h3>
                                        <p className="text-slate-400 text-sm">
                                            or <span className="text-navy font-semibold underline">browse files</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mt-2">
                                        <span className="bg-slate-100 px-3 py-1 rounded-full">PDF</span>
                                        <span className="bg-slate-100 px-3 py-1 rounded-full">PNG</span>
                                        <span className="bg-slate-100 px-3 py-1 rounded-full">JPEG</span>
                                        <span className="text-slate-300">|</span>
                                        <span>Max 10MB</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-3 text-sm font-medium"
                                >
                                    <AlertCircle size={18} />
                                    {error}
                                </motion.div>
                            )}

                            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span>End-to-End Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={14} className="text-emerald-500" />
                                    <span>100% Free</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            {!data && (
                <section className="py-16 md:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">How It Works</h2>
                            <p className="text-slate-500 max-w-xl mx-auto">
                                Convert your logistics documents to structured data in 3 simple steps
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                {
                                    step: "1",
                                    title: "Upload Document",
                                    description: "Drop your packing list, invoice, or any logistics document in PDF or image format.",
                                    icon: Upload
                                },
                                {
                                    step: "2",
                                    title: "AI Extracts Data",
                                    description: "Our AI reads the document, extracts items, quantities, and suggests accurate HS codes.",
                                    icon: Sparkles
                                },
                                {
                                    step: "3",
                                    title: "Download Excel",
                                    description: "Get your structured data in Excel format, ready for customs declaration or ERP import.",
                                    icon: Download
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-yellow/50 transition-all group"
                                >
                                    <div className="relative inline-block mb-6">
                                        <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center text-yellow group-hover:bg-yellow group-hover:text-navy transition-all">
                                            <item.icon size={28} />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow text-navy rounded-full flex items-center justify-center font-black text-sm">
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-navy mb-3">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FEATURES SECTION */}
            {!data && (
                <section className="py-16 md:py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Why LoxConvert?</h2>
                            <p className="text-slate-500 max-w-xl mx-auto">
                                More than just document conversion — get AI-powered trade intelligence
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {[
                                {
                                    title: "AI HS Code Prediction",
                                    description: "Our AI suggests the most accurate HS codes based on product descriptions, saving hours of manual lookup.",
                                    icon: Sparkles,
                                    color: "bg-yellow/10 text-yellow"
                                },
                                {
                                    title: "Customs Risk Analysis",
                                    description: "Instantly identify potential customs barriers, required documents, and applicable duties for your target market.",
                                    icon: ShieldCheck,
                                    color: "bg-emerald-50 text-emerald-600"
                                },
                                {
                                    title: "Market Intelligence",
                                    description: "Discover who's importing your products and where — powered by our LOX AI Radar buyer matching engine.",
                                    icon: Target,
                                    color: "bg-blue-50 text-blue-600"
                                },
                                {
                                    title: "One-Click Excel Export",
                                    description: "Download your structured data in Excel format, ready for customs declarations or ERP systems.",
                                    icon: Download,
                                    color: "bg-navy/10 text-navy"
                                },
                                {
                                    title: "AI Auto-Invoice",
                                    description: "Generate a commercial invoice draft automatically from your packing list data.",
                                    icon: FileType,
                                    color: "bg-purple-50 text-purple-600"
                                },
                                {
                                    title: "100% Secure",
                                    description: "Your documents are encrypted end-to-end and automatically deleted after processing.",
                                    icon: ShieldCheck,
                                    color: "bg-emerald-50 text-emerald-600"
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                                        <feature.icon size={22} />
                                    </div>
                                    <h3 className="font-bold text-navy mb-2">{feature.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* RESULTS AREA */}
            <AnimatePresence>
                {data && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="container mx-auto px-6 mt-12"
                    >
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
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

                            <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-blue-900/5 mb-12">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item / Description</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty / Unit</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">HS Code & Intelligence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#003366] line-clamp-1">{item.description}</span>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-1">LOG_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-700">{item.qty}</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">{item.unit}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {item.hs_code ? (
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black tracking-wider transition-all
                                                                        ${item.confidence < 0.8
                                                                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                                                        : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'}`}
                                                            >
                                                                {item.hs_code}
                                                            </span>
                                                            <button
                                                                onClick={() => handleInsights(item)}
                                                                className={`p-2 rounded-xl transition-all ${selectedItem === item ? 'bg-yellow text-navy scale-110 shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-yellow hover:text-navy hover:scale-110'}`}
                                                            >
                                                                <Sparkles size={16} />
                                                            </button>
                                                            {item.confidence < 0.8 && (
                                                                <HelpCircle size={16} className="text-amber-500 cursor-help" title={item.logic} />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs italic">Processing...</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* SMART OPERATIONS (Digital Folder / Invoice / QR) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="my-12 flex flex-wrap gap-4 justify-center"
                            >
                                <button
                                    onClick={handleSaveToFolder}
                                    disabled={saveLoading}
                                    className="group flex items-center gap-3 bg-white border border-slate-200 px-8 py-5 rounded-[2.5rem] text-[10px] font-black tracking-[0.2em] text-navy hover:border-navy hover:text-navy transition-all shadow-xl shadow-navy/5 hover:shadow-navy/10 active:scale-95 disabled:opacity-50"
                                >
                                    <div className="bg-navy/10 p-2 rounded-xl group-hover:bg-navy group-hover:text-yellow transition-all">
                                        {saveLoading ? <Loader2 size={18} className="animate-spin" /> : <FolderPlus size={18} />}
                                    </div>
                                    SAVE TO VAULT
                                </button>

                                <button
                                    onClick={handleGenerateInvoice}
                                    className="group flex items-center gap-3 bg-white border border-slate-200 px-8 py-5 rounded-[2.5rem] text-[10px] font-black tracking-[0.2em] text-navy hover:border-yellow hover:text-navy transition-all shadow-xl shadow-navy/5 hover:shadow-yellow/10 active:scale-95"
                                >
                                    <div className="bg-yellow/20 p-2 rounded-xl group-hover:bg-yellow group-hover:text-navy transition-all">
                                        <FileType size={18} />
                                    </div>
                                    AI AUTO-INVOICE
                                </button>

                                <button
                                    onClick={handleCreateLoxQR}
                                    className="group flex items-center gap-3 bg-white border border-slate-200 px-8 py-5 rounded-[2.5rem] text-[10px] font-black tracking-[0.2em] text-navy hover:border-navy hover:text-navy transition-all shadow-xl shadow-navy/5 hover:shadow-navy/10 active:scale-95"
                                >
                                    <div className="bg-navy/10 p-2 rounded-xl group-hover:bg-navy group-hover:text-yellow transition-all">
                                        <QrCode size={18} />
                                    </div>
                                    PRINT QR LABEL
                                </button>
                            </motion.div>

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
                                <AnimatePresence mode="wait">
                                    {requestSuccess ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-green-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold"
                                        >
                                            <Check size={20} />
                                            Quote Request Sent!
                                        </motion.div>
                                    ) : (
                                        <button
                                            onClick={handleFreightRequest}
                                            disabled={requestLoading}
                                            className="relative z-10 flex items-center gap-2 bg-yellow hover:bg-yellow/90 text-navy font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-yellow/20 disabled:opacity-50"
                                        >
                                            {requestLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                            Get Freight Quote
                                            <ArrowRight size={18} />
                                        </button>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* LOX AI RADAR INSIGHTS DASHBOARD */}
                            <AnimatePresence>
                                {(insightLoading || insightData) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 40 }}
                                        className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
                                    >
                                        {/* LEFT: COMPLIANCE & RISK (AI Customs Compliance Report) */}
                                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6 text-navy">
                                                <div className="bg-navy/10 p-2.5 rounded-xl text-navy"><ShieldCheck size={24} /></div>
                                                <h3 className="font-black text-xl tracking-tight">AI Customs Compliance Report</h3>
                                            </div>

                                            {insightLoading ? (
                                                <div className="col-span-1 lg:col-span-2">
                                                    <RadarScanner />
                                                </div>
                                            ) : (
                                                <>
                                                    {/* LEFT: COMPLIANCE & RISK (AI Customs Compliance Report) */}
                                                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                                                        <div className="flex items-center gap-3 mb-6 text-navy">
                                                            <div className="bg-navy/10 p-2.5 rounded-xl text-navy"><ShieldCheck size={24} /></div>
                                                            <h3 className="font-black text-xl tracking-tight">AI Customs Compliance Report</h3>
                                                        </div>

                                                        <div className="space-y-4">
                                                            {insightData?.compliance?.riskAlert && (
                                                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl text-amber-900 text-sm italic flex items-start gap-3">
                                                                    <Info size={18} className="shrink-0 mt-0.5" />
                                                                    {insightData.compliance.riskAlert}
                                                                </div>
                                                            )}
                                                            <div className="space-y-2">
                                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Required Documents & Taxes</h4>
                                                                <ul className="grid grid-cols-1 gap-2">
                                                                    {insightData?.compliance?.requirements?.map((req: string, i: number) => (
                                                                        <li key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl text-sm font-medium text-slate-600 border border-slate-100">
                                                                            <Check size={14} className="text-green-500" />
                                                                            {req}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* RIGHT: LOX AI RADAR (Pazar Fırsatları) */}
                                                    <div className="bg-[#003366] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                                        {/* Backdrop noise / radar effect */}
                                                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                                                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-yellow/10 transition-colors duration-1000" />

                                                        <div className="relative z-10 flex flex-col h-full">
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-white/10 p-2.5 rounded-xl text-white backdrop-blur-md border border-white/10"><Target size={24} /></div>
                                                                    <h3 className="font-black text-xl tracking-tight text-white uppercase italic">LOX AI <span className="text-yellow">RADAR</span></h3>
                                                                </div>
                                                                <div className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Status: Live</div>
                                                            </div>

                                                            <div className="flex-1 flex flex-col">
                                                                <p className="text-sm text-blue-100 font-medium mb-6 leading-relaxed">
                                                                    Buyers actively importing this product in {targetCountry} have been identified:
                                                                </p>
                                                                <div className="space-y-3 mb-8">
                                                                    {insightData?.potentialBuyers?.map((buyer: any, i: number) => (
                                                                        <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center group/item hover:bg-white/10 transition-all border-l-4 border-l-transparent hover:border-l-yellow">
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-sm font-bold tracking-tight">{buyer.company_name}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-[10px] font-black bg-yellow/20 text-yellow border border-yellow/20 px-2 py-1 rounded-lg">MATCH %{buyer.ai_score || buyer.matchScore}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <a
                                                                    href={`/radar?query=${selectedItem?.hs_code}&country=${targetCountry}`}
                                                                    target="_blank"
                                                                    className="mt-auto flex items-center justify-center gap-3 w-full bg-white text-[#003366] py-4 rounded-2xl font-black hover:bg-yellow hover:text-navy transition-all text-xs uppercase tracking-widest group/btn shadow-xl shadow-blue-900/40"
                                                                >
                                                                    View All Buyers for HS Code {selectedItem?.hs_code}
                                                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* BOTTOM FULL WIDTH: MARKET INTELLIGENCE (Competitor Analysis) */}
                                                    <div className="col-span-1 lg:col-span-2 bg-[#F8FAFC] border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="bg-navy/10 p-2.5 rounded-xl text-navy group-hover:bg-navy group-hover:text-yellow transition-all"><Globe size={24} /></div>
                                                            <h3 className="font-black text-xl tracking-tight text-navy">Market Share & Competitor Analysis</h3>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <p className="text-sm text-slate-500 italic">
                                                                    Top supplier countries for this product in {targetCountry}:
                                                                </p>
                                                                <div className="space-y-4">
                                                                    {insightData?.compliance?.competitors?.map((comp: any, i: number) => (
                                                                        <div key={i} className="space-y-1.5">
                                                                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-widest leading-none">
                                                                                <span>{comp.country}</span>
                                                                                <span>%{comp.share}</span>
                                                                            </div>
                                                                            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                                                                <motion.div
                                                                                    initial={{ width: 0 }}
                                                                                    animate={{ width: `${comp.share}%` }}
                                                                                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                                                                                    className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="bg-white p-6 rounded-[2rem] border border-indigo-50 flex flex-col justify-center relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                                    <Sparkles size={80} className="text-indigo-600" />
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-600">
                                                                            <Sparkles size={20} />
                                                                        </div>
                                                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">LOX AI Stratejik Tavsiye</h4>
                                                                    </div>
                                                                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic border-l-2 border-indigo-200 pl-4 py-1">
                                                                        "{insightData?.compliance?.strategicNote}"
                                                                    </p>
                                                                </div>
                                                                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Source: Global Trade Intel</span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                                        <span className="text-[10px] font-bold text-slate-400">Analysis Live</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* SELECT COUNTRY FLOATER */}
                            {data && (
                                <div className="mt-8 flex flex-col items-center justify-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Intel Configuration</span>
                                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                                        <span className="text-xs font-bold text-navy pl-2">Target Market:</span>
                                        <select
                                            value={targetCountry}
                                            onChange={(e) => setTargetCountry(e.target.value)}
                                            className="bg-slate-50 border-none rounded-lg px-4 py-2 text-sm font-bold text-navy outline-none focus:ring-2 focus:ring-yellow transition-all cursor-pointer"
                                        >
                                            <option value="Germany">Germany 🇩🇪</option>
                                            <option value="United Kingdom">United Kingdom 🇬🇧</option>
                                            <option value="USA">USA 🇺🇸</option>
                                            <option value="France">France 🇫🇷</option>
                                            <option value="Japan">Japan 🇯🇵</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PROMO MODAL (Triggered after 3rd usage) */}
            <AnimatePresence>
                {showPromoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full relative overflow-hidden text-center"
                        >
                            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">✕</div>
                            </button>

                            <div className="w-16 h-16 rounded-full bg-yellow/10 flex items-center justify-center mx-auto mb-6">
                                <FileText size={32} className="text-yellow" />
                            </div>
                            <h3 className="text-2xl font-black text-navy mb-3">Power User Alert! 🚀</h3>
                            <p className="text-slate-500 mb-8">
                                You seem to process documents frequently. Did you know LOXTR can manage your entire export operation from a single dashboard?
                            </p>

                            <a href="/register" className="block w-full py-4 bg-navy text-white font-bold rounded-xl hover:bg-navy/90 transition-all mb-4">
                                Create Free Account
                            </a>
                            <button onClick={() => setShowPromoModal(false)} className="text-slate-400 text-sm hover:text-slate-600">
                                Maybe later, thanks
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* COMMERCIAL INVOICE PREVIEW MODAL */}
            <AnimatePresence>
                {showInvoiceModal && invoiceData && (
                    <div className="fixed inset-0 bg-[#001D3D]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100] overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl relative my-8"
                        >
                            {/* Header */}
                            <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                            <FileText size={24} />
                                        </div>
                                        <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter italic">
                                            Draft Commercial <span className="text-indigo-600">Invoice</span>
                                        </h2>
                                    </div>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                                        AI-Generated from Packing List • {invoiceData.invoiceNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date</div>
                                    <div className="text-lg font-bold text-navy">{invoiceData.date}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Seller / Exporter</h4>
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                            <div className="font-black text-navy text-lg mb-1">{invoiceData.seller?.name}</div>
                                            <div className="text-sm text-slate-500 font-medium">{invoiceData.seller?.address}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 text-right">
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-right">Terms & Currency</h4>
                                        <div className="flex justify-end gap-3">
                                            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100">
                                                CURRENCY: {invoiceData.currency}
                                            </div>
                                            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black border border-blue-100">
                                                TERMS: {invoiceData.paymentTerms}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-slate-50/50 mb-12">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">HS Code</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total ({invoiceData.currency})</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceData.items?.map((item: any, i: number) => (
                                                <tr key={i} className="border-b border-slate-100 bg-white hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-bold text-navy truncate max-w-[200px]">{item.description}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                                                            {item.hs_code}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-bold text-slate-600">
                                                        {item.qty} <span className="text-[10px] text-slate-400">{item.unit}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-24 bg-slate-100 border-none rounded-lg text-sm font-black p-2 outline-none focus:ring-2 focus:ring-indigo-600"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-black text-navy text-sm">
                                                        0.00
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                        <Info size={14} />
                                        Please fill in the unit prices to finalize the document.
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <button
                                            onClick={() => setShowInvoiceModal(false)}
                                            className="flex-1 md:flex-none text-slate-400 font-black text-xs uppercase tracking-widest hover:text-navy transition-all py-4 px-8"
                                        >
                                            Cancel Draft
                                        </button>
                                        <button
                                            className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Download size={18} />
                                            Finish & Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
