import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/crm/AuthContext';
import { aiAPI, discoveryAPI, leadsAPI } from '../../services/crm/api';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Radar, Sparkles, Check, ShoppingBag, Globe, Building2,
    Lock, Unlock, Loader2, ArrowRight
} from 'lucide-react';

type Step = 'search' | 'refine' | 'loading' | 'results';

export default function RadarDashboard() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Wizard State
    const [step, setStep] = useState<Step>('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<{ industries: string[], markets: Array<{ country: string, reason: string }> }>({
        industries: [],
        markets: []
    });
    const [industry, setIndustry] = useState('');
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Debounced suggestion fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm && searchTerm.length > 2) {
                fetchSuggestions();
            } else {
                setSuggestions({ industries: [], markets: [] });
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchSuggestions = async () => {
        setIsSuggesting(true);
        try {
            const res = await aiAPI.getDiscoverySuggestions({ product: searchTerm }) as any;
            if (res.success || res.data) {
                const data = res.data || res;
                setSuggestions({
                    industries: data.industries || [],
                    markets: data.markets || []
                });
            }
        } catch (err) {
            console.error('Failed to fetch suggestions', err);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleRunDiscovery = async () => {
        if (!searchTerm || !industry || selectedMarkets.length === 0) {
            return toast.error('Please fill in all fields');
        }

        setStep('loading');
        setLoading(true);

        try {
            const res = await discoveryAPI.runDiscovery({
                product: searchTerm,
                industry,
                targetMarkets: selectedMarkets,
                count: 15
            }) as any;

            const leads = res.data?.leads || res.leads || [];

            if (leads.length > 0) {
                setResults(leads);
                const allIndexes = new Set<number>(leads.map((_: any, i: number) => i));
                setSelectedResults(allIndexes);
                setStep('results');
            } else {
                toast.error('No leads found matching your criteria.');
                setStep('search');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Discovery failed');
            setStep('search');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlockLeads = async () => {
        if (selectedResults.size === 0) return toast.error('Select at least one lead');

        setLoading(true);
        const leadsToSave = results.filter((_, i) => selectedResults.has(i));

        try {
            const res = await leadsAPI.createLeadsBulk(leadsToSave) as any;
            if (res.success || res.data) {
                toast.success(`Successfully unlocked ${leadsToSave.length} leads!`);
                navigate('/leads');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to unlock leads');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 font-outfit">
            <main className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Radar size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">AI Lead Radar</h1>
                        <p className="text-lg font-medium text-slate-500">
                            {step === 'search' ? 'Define your target market and product.' :
                                step === 'results' ? 'Market intelligence results ready.' : 'Analyzing global trade data...'}
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <motion.div
                    layout
                    className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[600px] relative"
                >
                    <div className="p-8 md:p-12">
                        {step === 'search' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-3xl mx-auto space-y-10"
                            >
                                {/* Product Input */}
                                <div className="space-y-4">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        What are you exporting?
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Enter product name (e.g. Electric Bicycles)"
                                            className="w-full px-8 py-6 bg-white border-2 border-slate-100 focus:border-blue-500 rounded-[2rem] outline-none font-bold text-slate-700 transition-all text-2xl shadow-sm group-hover:shadow-md"
                                            autoFocus
                                        />
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                            {isSuggesting && <Loader2 className="animate-spin text-blue-500" />}
                                            <ShoppingBag className="text-slate-300 w-8 h-8" />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {searchTerm.length > 2 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-10 overflow-hidden"
                                        >
                                            {/* Industry Selection */}
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Target Buyer Industry</label>
                                                    {isSuggesting && (
                                                        <span className="text-[10px] font-black text-blue-500 flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-lg">
                                                            <Sparkles size={12} className="animate-pulse" />
                                                            AI ANALYZING...
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    {isSuggesting && suggestions.industries.length === 0 ? (
                                                        [1, 2, 3].map(i => (
                                                            <div key={i} className="h-12 w-32 bg-slate-100 animate-pulse rounded-2xl" />
                                                        ))
                                                    ) : (
                                                        (suggestions.industries || []).map((ind, idx) => (
                                                            <motion.button
                                                                key={ind}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                onClick={() => setIndustry(ind)}
                                                                className={`px-6 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${industry === ind ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}
                                                            >
                                                                {ind}
                                                            </motion.button>
                                                        ))
                                                    )}
                                                </div>

                                                <div className="relative max-w-xl">
                                                    <input
                                                        type="text"
                                                        value={industry}
                                                        onChange={(e) => setIndustry(e.target.value)}
                                                        placeholder="Or type custom industry..."
                                                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 focus:border-blue-500 rounded-2xl outline-none font-bold text-slate-700 transition-all"
                                                    />
                                                    <Building2 className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                                </div>
                                            </div>

                                            {/* Market Selection */}
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Recommended Markets</label>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {isSuggesting && suggestions.markets.length === 0 ? (
                                                        [1, 2].map(i => (
                                                            <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-[1.5rem]" />
                                                        ))
                                                    ) : (
                                                        suggestions.markets.map((m, idx) => (
                                                            <motion.button
                                                                key={m.country}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                onClick={() => {
                                                                    setSelectedMarkets(prev => prev.includes(m.country) ? prev.filter(p => p !== m.country) : [...prev, m.country])
                                                                }}
                                                                className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all group ${selectedMarkets.includes(m.country) ? 'bg-blue-50/50 border-blue-600' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'}`}
                                                            >
                                                                <div className="flex items-center gap-4 text-left">
                                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${selectedMarkets.includes(m.country) ? 'bg-blue-600' : 'bg-slate-50'}`}>
                                                                        {selectedMarkets.includes(m.country) ? <Check size={20} className="text-white" /> : <Globe size={20} className="text-slate-400" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-black text-slate-800 text-lg">{m.country}</div>
                                                                        <div className="text-xs font-bold text-slate-400 tracking-tight leading-relaxed max-w-sm">{m.reason}</div>
                                                                    </div>
                                                                </div>
                                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedMarkets.includes(m.country) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'border-slate-200 bg-white'}`}>
                                                                    {selectedMarkets.includes(m.country) && <Check size={16} />}
                                                                </div>
                                                            </motion.button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleRunDiscovery}
                                                disabled={!industry || selectedMarkets.length === 0}
                                                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                                            >
                                                <Sparkles size={28} />
                                                Deep Scan Markets
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {step === 'loading' && (
                            <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in-95 duration-500">
                                <div className="relative mb-12">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="w-48 h-48 border-[6px] border-slate-100 border-t-blue-600 rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Radar size={64} className="text-blue-600 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 mb-6">Scanning Global Trade Data...</h3>
                                <p className="text-xl text-slate-400 max-w-lg mx-auto font-medium leading-relaxed">
                                    Our AI is cross-referencing import records, company registries, and web signals in <strong>{selectedMarkets.join(', ')}</strong>.
                                </p>
                            </div>
                        )}

                        {step === 'results' && (
                            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="mb-8 flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-slate-900">Market Potential Matches</h3>
                                    <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            <span className="text-sm font-bold text-slate-600">{selectedResults.size} selected</span>
                                        </div>
                                        <div className="h-4 w-[1px] bg-slate-200"></div>
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-bold text-slate-600">Locked Data</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto mb-8">
                                    <table className="w-full border-separate border-spacing-y-3">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                                                <th className="px-6 py-2 w-16">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => setSelectedResults(e.target.checked ? new Set(results.map((_, i) => i)) : new Set())}
                                                        checked={selectedResults.size === results.length}
                                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-6 py-2">Company</th>
                                                <th className="px-6 py-2">Location</th>
                                                <th className="px-6 py-2">Contact Intelligence</th>
                                                <th className="px-6 py-2">Match Logic</th>
                                                <th className="px-6 py-2 text-right">Match</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((lead, idx) => (
                                                <motion.tr
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`group transition-all ${selectedResults.has(idx) ? 'bg-blue-50/50' : 'hover:bg-slate-50/80 bg-slate-50/20'}`}
                                                >
                                                    <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-slate-100">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedResults.has(idx)}
                                                            onChange={() => {
                                                                const next = new Set(selectedResults);
                                                                next.has(idx) ? next.delete(idx) : next.add(idx);
                                                                setSelectedResults(next);
                                                            }}
                                                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-5 border-y border-slate-100">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-blue-600 text-xl">
                                                                {lead.companyName?.[0] || '?'}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-800 text-lg">{lead.companyName}</div>
                                                                <div className="text-xs font-bold text-blue-500 uppercase">{lead.website || 'example.com'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 border-y border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">🌍</span>
                                                            <span className="text-sm font-bold text-slate-600">{lead.city && `${lead.city}, `}{lead.country}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 border-y border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="filter blur-[6px] grayscale select-none text-sm font-bold bg-slate-200 px-3 py-1 rounded-lg">
                                                                {lead.email || 'purchasing@company.com'}
                                                            </div>
                                                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">LOCKED</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 border-y border-slate-100 max-w-sm">
                                                        <p className="text-sm font-medium text-slate-500 leading-snug">{lead.logic || lead.reason || `Matched based on ${industry} keywords.`}</p>
                                                    </td>
                                                    <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-slate-100 text-right">
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-sm border border-emerald-100 shadow-sm">
                                                            {lead.aiScore || 95}%
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl mt-auto">
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Price</span>
                                            <span className="text-3xl font-black">{selectedResults.size} <span className="text-sm text-slate-400 font-bold uppercase">Leads Quota</span></span>
                                        </div>
                                        <div className="h-12 w-[1px] bg-white/10"></div>
                                        {/* Optional: Add Available Credits if user context has it */}
                                    </div>
                                    <button
                                        onClick={handleUnlockLeads}
                                        disabled={loading || selectedResults.size === 0}
                                        className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all flex items-center gap-4 shadow-lg shadow-white/5 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={24} className="animate-spin" /> : <>
                                            <Unlock size={24} />
                                            Unlock Leads
                                        </>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
