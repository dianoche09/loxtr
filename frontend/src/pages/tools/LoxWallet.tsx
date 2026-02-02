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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white border border-slate-200 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : filteredFolders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredFolders.map((folder, i) => (
                                <motion.div
                                    key={folder.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all cursor-pointer group border-l-8 border-l-transparent hover:border-l-indigo-600"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Folder size={28} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                                {folder.metadata?.country || "Global"}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-[#003366] mb-2 truncate group-hover:text-indigo-600 transition-colors">
                                        {folder.name}
                                    </h3>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <FileText size={14} />
                                            <span className="text-xs font-bold uppercase tracking-tighter">{folder.lox_documents?.length || 0} Belge</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <History size={14} />
                                            <span className="text-xs font-bold uppercase tracking-tighter">
                                                {new Date(folder.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex -space-x-2">
                                            {folder.lox_documents?.slice(0, 3).map((doc: any, j: number) => (
                                                <div key={j} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-black text-slate-400 uppercase">
                                                    {doc.doc_type[0]}
                                                </div>
                                            ))}
                                        </div>
                                        <button className="text-indigo-600 group-hover:translate-x-1 transition-transform">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="bg-slate-50 p-6 rounded-full mb-6">
                            <Folder size={64} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-navy mb-2 uppercase tracking-wide italic">Henüz Bir Klasörünüz Yok</h3>
                        <p className="text-slate-400 font-medium max-w-sm text-center mb-8">
                            Dökümanlarınızı dönüştürdükten sonra "Save to Vault" butonunu kullanarak dijital arşivinizi oluşturun.
                        </p>
                        <button
                            onClick={() => window.location.href = '/tools/loxconvert'}
                            className="bg-[#003366] text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
                        >
                            İlk Klasörü Oluştur
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
