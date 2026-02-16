import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/crm/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Search, Radar, ShieldCheck, Download, Filter,
    Loader2, Gauge, ChevronDown, ChevronUp, Zap,
    Timer, TrendingUp, Target, Plus, Building2,
    Ship, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Importer {
    id: string;
    companyName: string;
    description: string;
    country: string;
    tradeVolumeValue?: string;
    confidenceScore: number;
    reasoning?: string;
    tags: string[];
}

export default function RadarDashboard() {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Importer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hideLowQuality, setHideLowQuality] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Mock/Real fetch function
    const fetchRadarData = async (searchQuery: string): Promise<Importer[]> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return mock data for demo
        return [
            {
                id: '1',
                companyName: 'Global Imports GmbH',
                country: 'Germany',
                description: 'Leading distributor of automotive components.',
                confidenceScore: 92,
                tags: ['Automotive', 'Distributor'],
                reasoning: 'High trade volume in your target sector.'
            },
            {
                id: '2',
                companyName: 'American Retail Corp',
                country: 'USA',
                description: 'Large retail chain expanding into organic foods.',
                confidenceScore: 88,
                tags: ['Retail', 'Organic'],
                reasoning: 'Matches your product "Hazelnut" profile.'
            },
            {
                id: '3',
                companyName: 'TechSource Ltd',
                country: 'UK',
                description: 'Specialized electronics importer.',
                confidenceScore: 75,
                tags: ['Electronics', 'Tech'],
                reasoning: 'Active buyer in recent customs data.'
            }
        ];
    };

    const handleSearch = async () => {
        if (!query) return;
        setIsSearching(true);
        setResults([]);
        try {
            const data = await fetchRadarData(query);
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSaveToCRM = (item: Importer) => {
        toast.success(`${item.companyName} added to your LOX CRM! Routing to Outreach Ops...`);
        // In a real app, this would call an API, then navigate
        setTimeout(() => {
            navigate('/crm/leads?open_wizard=true');
        }, 1500);
    };

    const filteredResults = hideLowQuality
        ? results.filter(r => r.confidenceScore >= 60)
        : results;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-off-white">
                <Loader2 className="w-8 h-8 animate-spin text-navy" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 font-outfit">
            <main className="max-w-7xl mx-auto px-6">
                {/* Radar Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-blue-600 font-bold tracking-widest text-sm">
                            <Radar className="w-5 h-5 animate-pulse" />
                            LOX AI RADAR SYSTEM
                        </div>
                        <h1 className="text-4xl font-black text-navy leading-tight uppercase tracking-tighter">
                            Market <span className="text-blue-600">Intelligence Node</span>
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-xl text-lg font-medium">
                            Step into the lead discovery engine. Intercept global buyers with strategic AI signals.
                        </p>
                    </div>

                    <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 gap-4">
                        <div className="px-6 py-2 text-center border-r border-slate-100">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Discovery Credits</div>
                            <div className="text-2xl font-black text-navy">500</div>
                        </div>
                        <div className="px-6 py-2 text-center">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Growth Plan</div>
                            <div className="text-2xl font-black text-blue-600 uppercase tracking-tighter italic">Pro Hunter</div>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <section className="bg-navy rounded-[2.5rem] shadow-2xl p-10 mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-blue-500/15 duration-1000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-4 items-stretch">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                            <input
                                type="text"
                                placeholder="HS Code, Product (e.g. Hazelnut) or Country..."
                                className="w-full pl-14 pr-4 py-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-blue-500 outline-none backdrop-blur-md transition-all text-xl font-bold"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-12 py-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 text-lg uppercase tracking-widest"
                        >
                            {isSearching ? <Loader2 className="animate-spin" /> : <Radar size={24} />}
                            {isSearching ? 'SCANNİNG...' : 'Start Global Scan'}
                        </button>
                    </div>
                </section>

                {/* Results Area */}
                <AnimatePresence mode="wait">
                    {isSearching ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-slate-50/50 -z-0" />
                            <div className="relative w-32 h-32 mb-8">
                                <Radar className="w-full h-full text-blue-600 animate-pulse" />
                                <div className="absolute inset-0 border-[6px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">AI Signal Processing</h3>
                            <p className="text-slate-500 mt-2 font-medium">Intercepting customs records and filtering noise...</p>
                        </motion.div>
                    ) : filteredResults.length > 0 ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Qualified Signals</h2>
                                    <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                        {filteredResults.length} High-Potential Leads
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-blue-200">
                                        <Filter size={18} className={hideLowQuality ? "text-blue-600" : "text-slate-400"} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cleanlab Protocol</span>
                                        <div className="relative inline-block w-10 h-6">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={hideLowQuality}
                                                onChange={() => setHideLowQuality(!hideLowQuality)}
                                            />
                                            <div className={`block w-full h-full rounded-full transition-colors ${hideLowQuality ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${hideLowQuality ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                        </div>
                                    </label>
                                    <button className="bg-white text-navy font-black px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                        <Download size={18} /> Export Intelligence
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {filteredResults.map((item) => (
                                    <div key={item.id} className="group">
                                        <motion.div
                                            layout
                                            className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${expandedId === item.id ? 'border-blue-500 shadow-2xl ring-4 ring-blue-500/5' : 'border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-xl'}`}
                                        >
                                            {/* Main Row */}
                                            <div
                                                className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-navy text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                        {item.companyName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-xl font-black text-navy tracking-tight uppercase leading-none">{item.companyName}</h3>
                                                            {item.intelligence?.growthSignal && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-bounce" />}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {item.country}</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                            <span>HS: {item.hscode}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-12">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Gauge size={16} className={item.confidenceScore > 80 ? 'text-green-500' : 'text-yellow-500'} />
                                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">AI Score</span>
                                                            <span className={`font-black text-lg ${item.confidenceScore > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                                                {item.confidenceScore}%
                                                            </span>
                                                        </div>
                                                        <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.confidenceScore}%` }}
                                                                className={`h-full ${item.confidenceScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                            ></motion.div>
                                                        </div>
                                                    </div>

                                                    <span className={`inline-flex items-center px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${item.type === 'Direct Importer'
                                                        ? 'bg-green-50 text-green-700 border-green-100'
                                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                                        }`}>
                                                        {item.type}
                                                    </span>

                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className={`p-3 rounded-xl transition-all ${expandedId === item.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-navy hover:bg-slate-100'}`}
                                                        >
                                                            {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Intelligence Panel */}
                                            <AnimatePresence>
                                                {expandedId === item.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="border-t border-slate-100 bg-slate-50/50"
                                                    >
                                                        <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                            {/* Logistics Battleground */}
                                                            <div className="space-y-6">
                                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                    <Timer className="w-4 h-4" /> Logistics Battleground
                                                                </h4>
                                                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/50 relative overflow-hidden">
                                                                    <div className="relative z-10 space-y-8">
                                                                        <div className="flex justify-between items-end">
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Turkey Route</p>
                                                                                <p className="text-3xl font-black text-navy">{item.intelligence?.transitTimeTurkey} Days</p>
                                                                            </div>
                                                                            <div className="text-right space-y-1">
                                                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{item.intelligence?.competitorCountry} Rival</p>
                                                                                <p className="text-3xl font-black text-slate-400">{item.intelligence?.transitTimeAsia} Days</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${(item.intelligence!.transitTimeTurkey / item.intelligence!.transitTimeAsia) * 100}%` }}
                                                                                className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                                                                            />
                                                                        </div>

                                                                        <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-4 border border-blue-100">
                                                                            <TrendingUp className="w-8 h-8 text-blue-600" />
                                                                            <p className="text-sm font-bold text-blue-900 leading-relaxed">
                                                                                <span className="font-black">LOX Insight:</span> Turkey delivers <span className="text-blue-600">{item.intelligence?.transitTimeAsia! - item.intelligence?.transitTimeTurkey!} days faster</span>. This eliminates {Math.round((item.intelligence!.transitTimeAsia - item.intelligence!.transitTimeTurkey) / 7)} weeks of inventory carrying costs.
                                                                            </p>
                                                                        </div>

                                                                        {/* Market Share Indicator */}
                                                                        <div className="pt-4">
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Share: Supply from Turkey</span>
                                                                                <span className="text-xs font-black text-navy">{item.intelligence?.marketShareTurkey}%</span>
                                                                            </div>
                                                                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                                                                                <motion.div
                                                                                    initial={{ width: 0 }}
                                                                                    animate={{ width: `${item.intelligence?.marketShareTurkey}%` }}
                                                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                                                                />
                                                                            </div>
                                                                            <p className="text-[9px] text-slate-400 mt-2 font-medium italic">
                                                                                *Based on intercepted Bill of Lading (BoL) data from the last 12 months.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Strategic Value Prop */}
                                                            <div className="space-y-6">
                                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                    <Target className="w-4 h-4" /> Targeting Intelligence
                                                                </h4>
                                                                <div className="bg-navy p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden h-full">
                                                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                                                        <Ship className="w-32 h-32" />
                                                                    </div>
                                                                    <div className="relative z-10 space-y-6">
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Likely Pain Point</p>
                                                                            <p className="text-lg font-bold text-white leading-relaxed italic">"{item.intelligence?.topPainPoint}"</p>
                                                                        </div>
                                                                        <div className="h-px bg-white/10 w-full" />
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">AI-Generated Strategy</p>
                                                                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                                                                {item.intelligence?.valueProposition} Direct-to-truck access from LOX Hub ensures quality control.
                                                                            </p>
                                                                        </div>

                                                                        <div className="pt-4 flex flex-wrap gap-4">
                                                                            <button
                                                                                onClick={() => handleSaveToCRM(item)}
                                                                                className="bg-white text-navy px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                                                                            >
                                                                                <Plus size={18} /> Add to CRM
                                                                            </button>
                                                                            <button
                                                                                onClick={() => navigate(`/predict-system?origin=Turkey&destination=${item.country}`)}
                                                                                className="bg-white/10 text-white border border-white/20 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all"
                                                                            >
                                                                                <Ship size={18} /> Route Rate
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Building2 className="text-slate-300 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">No Active Leads Discovered</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                                Define your market above to trigger the <span className="text-blue-600 font-black">AI Lead Interceptor</span>.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// Ensure Importer type matches upgraded service
interface Importer {
    id: string;
    companyName: string;
    country: string;
    lastShipmentDate: string;
    hscode: string;
    confidenceScore: number;
    type: 'Direct Importer' | 'Broker' | 'Freight Forwarder';
    intelligence?: {
        competitorCountry: string;
        transitTimeAsia: number;
        transitTimeTurkey: number;
        marketShareTurkey: number;
        topPainPoint: string;
        valueProposition: string;
        growthSignal: string;
    }
}
