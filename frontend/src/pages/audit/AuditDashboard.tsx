import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    FileText,
    CheckCircle,
    AlertTriangle,
    UploadCloud,
    Search,
    FileCheck,
    ChevronRight,
    Download,
    Info,
    Scale,
    Database,
    Loader2,
    FileMinus,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeDocuments } from '../../services/AuditService';
import type { AuditIssue, HSRecommendation } from '../../services/AuditService';
import { useAuth } from '../../contexts/crm/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AuditReportView } from '../../components/audit/AuditReportView';

export default function AuditDashboard() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [issues, setIssues] = useState<AuditIssue[]>([]);
    const [recommendations, setRecommendations] = useState<HSRecommendation[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;
        setFiles(selectedFiles);
        startAnalysis(selectedFiles);
    };

    const startAnalysis = async (uploadedFiles: File[]) => {
        setIsAnalyzing(true);
        setIssues([]);
        try {
            const result = await analyzeDocuments(uploadedFiles);
            setIssues(result.issues);
            setRecommendations(result.recommendations);
        } catch (error) {
            console.error('Audit error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-navy" /></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
            {/* Premium Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-4">
                    <div className="bg-navy p-2.5 rounded-2xl shadow-lg rotate-3">
                        <ShieldAlert className="text-yellow" size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-black text-navy text-xl tracking-tighter uppercase leading-none">LOX AI AUDIT</h1>
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase">DeepSeek-R1</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Digital Compliance & Trade Integrity Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-white text-navy border border-slate-200 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Info size={14} /> Compliance Wiki
                    </button>
                    <button onClick={() => navigate('/audit-system')} className="bg-navy text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-navy/20">
                        Internal Case #4122
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-12">
                {/* Initial State / Upload */}
                {!issues.length && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-black text-navy tracking-tighter leading-none mb-4 italic uppercase">
                                Automate Your <br /><span className="text-blue-600 underline decoration-yellow decoration-8 underline-offset-8">Customs Scrutiny.</span>
                            </h2>
                            <p className="text-slate-500 max-w-lg mx-auto text-lg font-medium leading-relaxed">
                                Intercept pricing mismatches, HS code risks, and regulation gaps across your shipment dossier before submitting to customs.
                            </p>
                        </div>

                        <div className="w-full max-w-3xl group relative">
                            <div className="absolute inset-x-0 bottom-0 top-0 h-full bg-blue-600/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-600/10 transition-all"></div>
                            <label className="relative bg-white border-2 border-dashed border-slate-200 rounded-[3.5rem] p-24 text-center flex flex-col items-center justify-center transition-all hover:border-blue-500 cursor-pointer shadow-2xl shadow-slate-200/50">
                                <input type="file" multiple onChange={handleUpload} className="sr-only" />
                                <div className="bg-blue-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                    <UploadCloud className="text-blue-600" size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-navy mb-3 uppercase tracking-tighter italic">Upload Your Evidence</h3>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] opacity-70">Invoice, Packing List, BL, Certificate of Origin</p>

                                <div className="mt-12 flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                        <FileCheck size={16} className="text-emerald-500" /> Consistency Audit
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                        <Scale size={16} className="text-blue-500" /> Tax Verification
                                    </div>
                                </div>
                            </label>
                        </div>
                    </motion.div>
                )}

                {/* Analyzing State */}
                <AnimatePresence>
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center py-20 text-center"
                        >
                            <div className="relative w-40 h-40 mb-10">
                                <svg className="w-full h-full rotate-[-90deg]">
                                    <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                                    <motion.circle
                                        cx="80" cy="80" r="70"
                                        stroke="#2563eb" strokeWidth="12" fill="none"
                                        strokeDasharray="440"
                                        animate={{ strokeDashoffset: [440, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldAlert size={48} className="text-blue-600 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-navy uppercase tracking-tighter mb-4 italic">Processing Reasoning Model</h3>
                            <p className="text-slate-500 text-lg max-w-md mx-auto italic">
                                DeepSeek-R1 is cross-referencing values between documents and validating against WCO Global Trade standards...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Audit Report View */}
                {issues.length > 0 && !isAnalyzing && (
                    <div className="space-y-12">
                        <AuditReportView
                            issues={issues}
                            recommendations={recommendations}
                            setIssues={setIssues}
                            setRecommendations={setRecommendations}
                            setFiles={setFiles}
                        />

                        {/* Additional Insights Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-full">
                                    <h4 className="text-md font-black text-navy uppercase tracking-widest mb-6 italic">HS RECOMENDER INTELLIGENCE</h4>
                                    <div className="space-y-4">
                                        {recommendations.map(rec => (
                                            <div key={rec.hscode} className="bg-slate-50 p-6 rounded-2xl flex justify-between items-center group hover:bg-navy hover:text-white transition-all">
                                                <div>
                                                    <p className="text-xs font-black uppercase text-blue-600 group-hover:text-yellow mb-1 tracking-widest">HS {rec.hscode}</p>
                                                    <p className="font-bold text-sm">{rec.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase opacity-60">Confidence</p>
                                                    <p className="text-lg font-black italic">{(rec.confidence * 100).toFixed(0)}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-navy p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                <h4 className="text-md font-black uppercase tracking-widest mb-6 text-yellow italic">Quick Action</h4>
                                <p className="text-sm opacity-70 mb-8 leading-relaxed">Download the full audit package and HS justification file for your customs advisor.</p>
                                <button
                                    onClick={() => { setIssues([]); setFiles([]); }}
                                    className="w-full bg-white text-navy py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-yellow transition-all"
                                >
                                    Start New Audit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
