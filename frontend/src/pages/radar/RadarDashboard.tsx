import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/crm/AuthContext';
import { aiAPI, discoveryAPI, leadsAPI } from '../../services/crm/api';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Radar, Sparkles, Check, ShoppingBag, Globe, Building2,
    Lock, Unlock, Loader2, ArrowRight, ShieldCheck, ShieldAlert,
    Mail, Phone, ExternalLink, TrendingUp, TrendingDown, BarChart3,
    Eye, MapPin, Star, Zap, Package, Target, ChevronDown, ChevronUp,
    Search, FileDown
} from 'lucide-react';

type Step = 'search' | 'refine' | 'market-overview' | 'loading' | 'results';

interface MarketData {
    country: string;
    trade: {
        totalImportValue: number;
        topSuppliers: Array<{ country: string; value: number; share: number }>;
        turkeyPosition: { rank: number; value: number; share: number; trend: string } | null;
        period: number;
    } | null;
    tariff: {
        mfnRate: number;
        preferentialRate: number | null;
        tradeAgreement: string | null;
    } | null;
}

interface MarketIntelligence {
    summary: string;
    opportunityScore: number;
    bestMarket: string;
    bestMarketReason: string;
    competitiveGaps: string[];
    risks: string[];
    recommendedStrategy: string;
    turkeyAdvantages: string[];
}

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
    const [isPreview, setIsPreview] = useState(true);

    // HS Code State
    const [hsCodes, setHsCodes] = useState<Array<{ code: string; description: string }>>([]);
    const [loadingHsCodes, setLoadingHsCodes] = useState(false);

    // Market Overview State
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null);
    const [hsCode, setHsCode] = useState('');
    const [loadingMarket, setLoadingMarket] = useState(false);
    const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

    // Discovery metadata
    const [discoveryMeta, setDiscoveryMeta] = useState<{ serpUsed: boolean; tradeDataUsed: boolean; enriched: boolean }>({
        serpUsed: false, tradeDataUsed: false, enriched: false
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Debounced suggestion + HS code fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm && searchTerm.length > 2) {
                fetchSuggestions();
                fetchHsCodes();
            } else {
                setSuggestions({ industries: [], markets: [] });
                setHsCodes([]);
                setHsCode('');
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

    const fetchHsCodes = async () => {
        setLoadingHsCodes(true);
        try {
            const res = await aiAPI.getHsCodeSuggestions({ product: searchTerm }) as any;
            const data = res.data || res;
            const codes = Array.isArray(data) ? data : data?.codes || data?.recommendations || [];
            setHsCodes(codes);
            // Auto-select first HS code
            if (codes.length > 0 && !hsCode) {
                setHsCode(codes[0].code);
            }
        } catch (err) {
            console.error('Failed to fetch HS codes', err);
        } finally {
            setLoadingHsCodes(false);
        }
    };

    const handleFetchMarketOverview = async () => {
        if (!searchTerm || !industry || selectedMarkets.length === 0) {
            return toast.error('Please fill in all fields');
        }

        setStep('market-overview');
        setLoadingMarket(true);

        try {
            const res = await discoveryAPI.getMarketOverview({
                product: searchTerm,
                targetMarkets: selectedMarkets,
                hsCode: hsCode || undefined,
            }) as any;

            const data = res.data || res;
            setMarketData(data.markets || []);
            setMarketIntel(data.intelligence || null);
            if (data.hsCode) setHsCode(data.hsCode);
        } catch (err: any) {
            console.error('Market overview failed:', err);
            toast.error('Market data unavailable — proceeding to discovery');
            handleRunDiscovery();
        } finally {
            setLoadingMarket(false);
        }
    };

    const handleRunDiscovery = async () => {
        setStep('loading');
        setLoading(true);

        try {
            const res = await discoveryAPI.runDiscovery({
                product: searchTerm,
                industry,
                targetMarkets: selectedMarkets,
                count: 15,
                hsCode: hsCode || undefined,
                preview: isPreview,
            }) as any;

            const responseData = res.data || res;
            const leads = responseData?.leads || responseData?.data || [];

            setDiscoveryMeta({
                serpUsed: responseData?.serpUsed || false,
                tradeDataUsed: responseData?.tradeDataUsed || false,
                enriched: responseData?.enriched || false,
            });

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
            setStep('market-overview');
        } finally {
            setLoading(false);
        }
    };

    const handleRevealContacts = () => {
        setIsPreview(false);
        toast.success('Contacts revealed! Save to CRM when ready.');
    };

    const handleUnlockLeads = async () => {
        if (selectedResults.size === 0) return toast.error('Select at least one lead');

        setLoading(true);
        setIsPreview(false);
        const leadsToSave = results
            .filter((_, i) => selectedResults.has(i))
            .map(lead => ({ ...lead, industry: lead.industry || industry }));

        try {
            const res = await leadsAPI.createLeadsBulk(leadsToSave) as any;
            if (res.success || res.data) {
                toast.success(`Successfully unlocked ${leadsToSave.length} leads!`);
                navigate('/crm/leads?country=all&industry=all');
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
        <div className="bg-slate-50 p-8 min-h-full font-outfit transition-all duration-300">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Radar size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight">AI Lead Radar</h1>
                            <p className="text-lg font-medium text-slate-500">
                                {step === 'search' ? 'Define your target market and product.' :
                                    step === 'market-overview' ? 'Market intelligence ready.' :
                                        step === 'results' ? 'Discovery results ready.' : 'Scanning global trade data...'}
                            </p>
                        </div>
                    </div>

                    {/* Step indicator */}
                    <div className="hidden md:flex items-center gap-2">
                        {(['search', 'market-overview', 'results'] as const).map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step === s || (['search', 'market-overview', 'results'].indexOf(step) > i)
                                    ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                    {i + 1}
                                </div>
                                <span className={`text-xs font-bold ${step === s ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {s === 'search' ? 'Search' : s === 'market-overview' ? 'Intel' : 'Leads'}
                                </span>
                                {i < 2 && <div className="w-8 h-[2px] bg-slate-200" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <motion.div
                    layout
                    className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[600px] relative"
                >
                    <div className="p-8 md:p-12">

                        {/* ===== STEP 1: SEARCH ===== */}
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
                                            {/* HS Code Selection */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">HS Code</label>
                                                    {loadingHsCodes && (
                                                        <span className="text-[10px] font-black text-indigo-500 flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg">
                                                            <Loader2 size={12} className="animate-spin" />
                                                            FINDING CODES...
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    {loadingHsCodes && hsCodes.length === 0 ? (
                                                        [1, 2, 3].map(i => (
                                                            <div key={i} className="h-16 w-48 bg-slate-100 animate-pulse rounded-2xl" />
                                                        ))
                                                    ) : (
                                                        hsCodes.map((hs, idx) => (
                                                            <motion.button
                                                                key={hs.code}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                onClick={() => setHsCode(hs.code)}
                                                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all text-left ${hsCode === hs.code
                                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105'
                                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                                                                    }`}
                                                            >
                                                                <span className={`font-mono font-black text-sm ${hsCode === hs.code ? 'text-white' : 'text-indigo-600'}`}>
                                                                    {hs.code}
                                                                </span>
                                                                <span className={`text-xs font-bold ${hsCode === hs.code ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                                    {hs.description?.substring(0, 40)}
                                                                </span>
                                                            </motion.button>
                                                        ))
                                                    )}
                                                </div>

                                                {hsCode && (
                                                    <div className="flex items-center gap-2 ml-1">
                                                        <Package size={14} className="text-indigo-500" />
                                                        <span className="text-xs font-bold text-slate-500">Selected:</span>
                                                        <span className="text-xs font-black text-indigo-600 font-mono">{hsCode}</span>
                                                        <span className="text-[10px] text-slate-400">— Used for trade data & tariff lookup</span>
                                                    </div>
                                                )}
                                            </div>

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
                                                onClick={handleFetchMarketOverview}
                                                disabled={!industry || selectedMarkets.length === 0}
                                                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                                            >
                                                <BarChart3 size={28} />
                                                Analyze Markets
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* ===== STEP 2: MARKET OVERVIEW ===== */}
                        {step === 'market-overview' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {loadingMarket ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-center">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="w-32 h-32 border-[6px] border-slate-100 border-t-blue-600 rounded-full mb-8"
                                        />
                                        <h3 className="text-2xl font-black text-slate-900 mb-3">Fetching Trade Intelligence...</h3>
                                        <p className="text-slate-400 font-medium">Querying UN Comtrade & World Bank data</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Intelligence Summary */}
                                        {marketIntel && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-8 border border-blue-100">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 mb-2">Market Intelligence</h3>
                                                        <p className="text-sm text-slate-600 font-medium max-w-2xl">{marketIntel.summary}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg ${marketIntel.opportunityScore >= 70 ? 'bg-emerald-500 shadow-emerald-200' :
                                                            marketIntel.opportunityScore >= 40 ? 'bg-amber-500 shadow-amber-200' : 'bg-red-500 shadow-red-200'
                                                            }`}>
                                                            {marketIntel.opportunityScore}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-wider">Opportunity</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                                    <div className="bg-white/60 rounded-2xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Target size={14} className="text-blue-600" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Best Market</span>
                                                        </div>
                                                        <p className="font-black text-slate-800">{marketIntel.bestMarket}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{marketIntel.bestMarketReason}</p>
                                                    </div>
                                                    <div className="bg-white/60 rounded-2xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Zap size={14} className="text-emerald-600" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Turkey Advantages</span>
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {(marketIntel.turkeyAdvantages || []).slice(0, 3).map((a, i) => (
                                                                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                                    <Check size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                                                                    {a}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-white/60 rounded-2xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ShieldAlert size={14} className="text-amber-600" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Risks</span>
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {(marketIntel.risks || []).slice(0, 3).map((r, i) => (
                                                                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                                    <ShieldAlert size={10} className="text-amber-500 mt-0.5 shrink-0" />
                                                                    {r}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {marketIntel.recommendedStrategy && (
                                                    <div className="mt-4 bg-white/60 rounded-2xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles size={14} className="text-indigo-600" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recommended Strategy</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700">{marketIntel.recommendedStrategy}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Per-Market Trade Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {marketData.map((market) => (
                                                <motion.div
                                                    key={market.country}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:border-blue-200 transition-all"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <Globe size={20} className="text-blue-600" />
                                                            <h4 className="text-lg font-black text-slate-800">{market.country}</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => setExpandedMarket(expandedMarket === market.country ? null : market.country)}
                                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            {expandedMarket === market.country ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        </button>
                                                    </div>

                                                    {market.trade && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-slate-400">Total Import Value</span>
                                                                <span className="text-lg font-black text-slate-800">${formatValue(market.trade.totalImportValue)}</span>
                                                            </div>

                                                            {market.trade.turkeyPosition && (
                                                                <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2">
                                                                    <span className="text-xs font-bold text-emerald-700">Turkey Position</span>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-sm font-black text-emerald-700">#{market.trade.turkeyPosition.rank}</span>
                                                                        <span className="text-xs font-bold text-emerald-600">{market.trade.turkeyPosition.share}% share</span>
                                                                        <span className="text-xs font-bold text-emerald-600">${formatValue(market.trade.turkeyPosition.value)}</span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {!market.trade.turkeyPosition && (
                                                                <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-2">
                                                                    <span className="text-xs font-bold text-amber-700">Turkey not in top importers</span>
                                                                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">OPPORTUNITY</span>
                                                                </div>
                                                            )}

                                                            {market.tariff?.tradeAgreement && (
                                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl px-4 py-2">
                                                                    <ShieldCheck size={14} />
                                                                    {market.tariff.tradeAgreement}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {!market.trade && (
                                                        <p className="text-sm text-slate-400 font-medium">Trade data not available for this market</p>
                                                    )}

                                                    {/* Expanded: Top Suppliers */}
                                                    <AnimatePresence>
                                                        {expandedMarket === market.country && market.trade && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-4 pt-4 border-t border-slate-100 space-y-2"
                                                            >
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Top Suppliers</span>
                                                                {market.trade.topSuppliers.slice(0, 5).map((s, i) => (
                                                                    <div key={i} className="flex items-center justify-between">
                                                                        <span className="text-sm font-bold text-slate-600">{s.country}</span>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(s.share, 100)}%` }} />
                                                                            </div>
                                                                            <span className="text-xs font-black text-slate-500 w-12 text-right">{s.share}%</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* HS Code Display */}
                                        {hsCode && (
                                            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-6 py-3 border border-slate-100">
                                                <Package size={16} className="text-slate-400" />
                                                <span className="text-sm font-bold text-slate-500">HS Code:</span>
                                                <span className="text-sm font-black text-slate-800">{hsCode}</span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setStep('search')}
                                                className="px-8 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:border-slate-300 transition-all"
                                            >
                                                Back
                                            </button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleRunDiscovery}
                                                className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-4"
                                            >
                                                <Search size={24} />
                                                Find Buyers in These Markets
                                            </motion.button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* ===== LOADING ===== */}
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
                                <h3 className="text-4xl font-black text-slate-900 mb-6">Deep Scanning Markets...</h3>
                                <p className="text-xl text-slate-400 max-w-lg mx-auto font-medium leading-relaxed">
                                    Searching Google, verifying websites, and analyzing with AI across <strong>{selectedMarkets.join(', ')}</strong>.
                                </p>
                                <div className="mt-8 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-blue-500">
                                        <Search size={16} />
                                        <span>SerpAPI: Searching Google & Maps for real companies...</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                                        <ShieldCheck size={16} />
                                        <span>Scrapling: Verifying websites and extracting contacts...</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-500">
                                        <Sparkles size={16} />
                                        <span>Gemini: Analyzing and scoring matches...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== STEP 3: RESULTS ===== */}
                        {step === 'results' && (
                            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                                {/* Results Header */}
                                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Market Potential Matches</h3>
                                        <p className="text-sm text-slate-400 font-medium mt-1">
                                            {results.length} companies found for "{searchTerm}" in {selectedMarkets.join(', ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {/* Data source badges */}
                                        {discoveryMeta.serpUsed && (
                                            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                                                <Search className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="text-[10px] font-black text-blue-700">GOOGLE VERIFIED</span>
                                            </div>
                                        )}
                                        {discoveryMeta.tradeDataUsed && (
                                            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                                                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                                                <span className="text-[10px] font-black text-indigo-700">TRADE DATA</span>
                                            </div>
                                        )}
                                        {discoveryMeta.enriched && (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-[10px] font-black text-emerald-700">WEB ENRICHED</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                <span className="text-sm font-bold text-slate-600">{selectedResults.size} selected</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="overflow-x-auto mb-8">
                                    <table className="w-full border-separate border-spacing-y-3">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                                                <th className="px-4 py-2 w-12">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => setSelectedResults(e.target.checked ? new Set(results.map((_, i) => i)) : new Set())}
                                                        checked={selectedResults.size === results.length}
                                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-4 py-2">Company</th>
                                                <th className="px-4 py-2">Location</th>
                                                <th className="px-4 py-2">Contact</th>
                                                <th className="px-4 py-2">Intel</th>
                                                <th className="px-4 py-2 text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((lead, idx) => (
                                                <motion.tr
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className={`group transition-all ${selectedResults.has(idx) ? 'bg-blue-50/50' : 'hover:bg-slate-50/80 bg-slate-50/20'}`}
                                                >
                                                    <td className="px-4 py-4 rounded-l-2xl border-y border-l border-slate-100">
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
                                                    <td className="px-4 py-4 border-y border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-blue-600 text-lg">
                                                                    {lead.companyName?.[0] || '?'}
                                                                </div>
                                                                {(lead.verified || lead.serpVerified) && (
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                                                                        <Check size={8} className="text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-slate-800">{lead.companyName}</span>
                                                                    {lead.serpVerified && (
                                                                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">SERP</span>
                                                                    )}
                                                                </div>
                                                                {lead.website && (
                                                                    <span className="text-[10px] font-bold text-blue-500">{lead.website.replace(/https?:\/\/(www\.)?/, '').substring(0, 30)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 border-y border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={12} className="text-slate-400" />
                                                            <span className="text-sm font-bold text-slate-600">{lead.city && `${lead.city}, `}{lead.country}</span>
                                                        </div>
                                                        {lead.address && (
                                                            <span className="text-[10px] text-slate-400 ml-5 block">{lead.address.substring(0, 40)}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 border-y border-slate-100">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Mail size={11} className="text-slate-400" />
                                                                {isPreview ? (
                                                                    <>
                                                                        <div className="filter blur-[6px] grayscale select-none text-sm font-bold bg-slate-200 px-3 py-1 rounded-lg">
                                                                            {lead.email || 'purchasing@company.com'}
                                                                        </div>
                                                                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">LOCKED</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-sm font-bold text-slate-700">{lead.email}</span>
                                                                        {lead.emailSource && (
                                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${lead.emailSource === 'scraped' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                                                                lead.emailSource === 'website' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                                                                                    'text-slate-500 bg-slate-50 border-slate-200'
                                                                                }`}>
                                                                                {lead.emailSource.toUpperCase()}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            {lead.phone && (
                                                                <div className="flex items-center gap-2">
                                                                    <Phone size={11} className="text-slate-400" />
                                                                    {isPreview ? (
                                                                        <div className="filter blur-[6px] grayscale select-none text-xs font-bold bg-slate-200 px-2 py-0.5 rounded-lg">{lead.phone}</div>
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-slate-600">{lead.phone}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {lead.rating && (
                                                                <div className="flex items-center gap-1">
                                                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                                                    <span className="text-[10px] font-bold text-slate-500">{lead.rating} ({lead.reviews} reviews)</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 border-y border-slate-100 max-w-xs">
                                                        <p className="text-xs font-medium text-slate-500 leading-snug mb-1">{lead.logic || lead.reason}</p>
                                                        {lead.potentialProducts && lead.potentialProducts.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {lead.potentialProducts.slice(0, 2).map((p: string, i: number) => (
                                                                    <span key={i} className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                                        {p}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {lead.supplyChainIntel?.switchReason && (
                                                            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                                                <TrendingUp size={10} />
                                                                {lead.supplyChainIntel.switchReason.substring(0, 50)}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 rounded-r-2xl border-y border-r border-slate-100 text-right">
                                                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-sm border shadow-sm ${(lead.aiScore || 0) >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            (lead.aiScore || 0) >= 70 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                'bg-slate-50 text-slate-600 border-slate-200'
                                                            }`}>
                                                            {lead.aiScore || 0}%
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Bottom Action Bar */}
                                <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl mt-auto">
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Selected</span>
                                            <span className="text-3xl font-black">{selectedResults.size} <span className="text-sm text-slate-400 font-bold uppercase">Leads</span></span>
                                        </div>
                                        <div className="h-12 w-[1px] bg-white/10"></div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => { setStep('market-overview'); }}
                                                className="px-6 py-3 border border-white/20 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:border-white/40 transition-all"
                                            >
                                                Back to Intel
                                            </button>
                                        </div>
                                    </div>
                                    {isPreview ? (
                                        <button
                                            onClick={handleRevealContacts}
                                            disabled={selectedResults.size === 0}
                                            className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all flex items-center gap-4 shadow-lg shadow-white/5 disabled:opacity-50"
                                        >
                                            <Eye size={24} />
                                            Reveal Contacts
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleUnlockLeads}
                                            disabled={loading || selectedResults.size === 0}
                                            className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all flex items-center gap-4 shadow-lg shadow-white/5 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 size={24} className="animate-spin" /> : <>
                                                <Unlock size={24} />
                                                Save to CRM
                                            </>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function formatValue(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toLocaleString();
}
