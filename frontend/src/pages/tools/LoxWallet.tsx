import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, ChevronRight, Plus, Search, Filter, History, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/crm/AuthContext';

export default function LoxWallet() {
    const { user } = useAuth();
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user) fetchFolders();
    }, [user]);

    const fetchFolders = async () => {
        try {
            const { data, error } = await supabase
                .from('lox_folders')
                .select(`
                    *,
                    lox_documents (id, doc_type)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFolders(data || []);
        } catch (error) {
            console.error("Error fetching folders:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFolders = folders.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-[#003366] tracking-tight mb-2 uppercase italic flex items-center gap-3">
                            Lox<span className="text-indigo-600">Wallet</span>
                            <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-lg not-italic tracking-widest uppercase">Vault</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Dijital Gümrük Klasörleriniz ve Operasyonel Arşiviniz</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Klasörlerde ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-navy outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="bg-[#003366] text-white p-4 rounded-[2rem] hover:bg-navy/90 transition-all shadow-xl shadow-blue-900/20 group">
                            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-64 bg-white border border-slate-100 rounded-[3rem] animate-pulse shadow-sm"
                            />
                        ))}
                    </div>
                ) : filteredFolders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {filteredFolders.map((folder, i) => (
                                <motion.div
                                    key={folder.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bg-white border border-slate-200 rounded-[3rem] p-8 hover:shadow-[0_40px_80px_-20px_rgba(0,51,102,0.15)] hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    {/* Brand Accent */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                        <QrIcon size={32} className="text-navy/20 group-hover:text-navy/40" />
                                    </div>

                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-16 h-16 bg-navy/5 rounded-[1.5rem] flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-yellow transition-all shadow-inner">
                                            <Folder size={32} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100 mb-2">
                                                ID: {folder.id.slice(0, 8).toUpperCase()}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] italic">LOX SECURE STORAGE</span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-navy mb-3 truncate italic uppercase tracking-tight group-hover:text-navy transition-colors">
                                        {folder.name}
                                    </h3>

                                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50">
                                        <div className="flex items-center gap-2.5 text-slate-400">
                                            <FileText size={16} className="text-navy/30" />
                                            <span className="text-[11px] font-black uppercase tracking-tighter">{folder.lox_documents?.length || 0} Intelligence Docs</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-slate-400 pl-6 border-l border-slate-100">
                                            <History size={16} className="text-navy/30" />
                                            <span className="text-[11px] font-black uppercase tracking-tighter">
                                                {new Date(folder.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-3">
                                            {folder.lox_documents?.slice(0, 4).map((doc: any, j: number) => (
                                                <div key={j} className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-navy shadow-sm group-hover:border-yellow transition-all uppercase italic">
                                                    {doc.doc_type[0]}
                                                </div>
                                            ))}
                                            {folder.lox_documents?.length > 4 && (
                                                <div className="w-10 h-10 rounded-xl bg-navy text-white border-2 border-white flex items-center justify-center text-[10px] font-black">
                                                    +{folder.lox_documents.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-all shadow-sm">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 opacity-[0.03] scale-150 rotate-12"><Folder size={200} /></div>

                        <div className="bg-slate-50 p-10 rounded-[2.5rem] mb-10 shadow-inner">
                            <Boxes size={80} className="text-slate-300" />
                        </div>
                        <h3 className="text-4xl font-black text-navy mb-4 uppercase tracking-tighter italic">Dossier Vault Empty</h3>
                        <p className="text-slate-400 font-bold max-w-md text-center mb-12 leading-relaxed">
                            Your digital trade archive starts here. Transform your documents via LoxConvert and sync them to this secure physical-digital vault.
                        </p>
                        <button
                            onClick={() => window.location.href = '/convert'}
                            className="bg-navy text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-navy/30 hover:bg-yellow hover:text-navy hover:-translate-y-2 transition-all flex items-center gap-4 group"
                        >
                            <Sparkles size={20} className="group-hover:animate-spin" /> Launch Intelligence Node
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
