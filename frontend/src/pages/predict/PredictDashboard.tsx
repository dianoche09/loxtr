import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    TrendingDown, TrendingUp, Ship, Clock, DollarSign, Leaf, Zap, Globe, Search, ArrowRight, Loader2, Info, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPredictionData } from '../../services/PredictService';
import type { PredictionResult, RouteOption } from '../../services/PredictService';
import { useAuth } from '../../contexts/crm/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PredictDashboard() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const [origin, setOrigin] = useState(queryParams.get('origin') || '');
    const [destination, setDestination] = useState(queryParams.get('destination') || '');
    const [isPredicting, setIsPredicting] = useState(false);
    const [data, setData] = useState<PredictionResult | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (origin && destination && !data && !isPredicting) {
            handlePredict();
        }
    }, [origin, destination]);

    const handlePredict = async () => {
        if (!origin || !destination) return;
        setIsPredicting(true);
        try {
            const result = await fetchPredictionData(origin, destination);
            setData(result);
        } catch (error) {
            console.error('Prediction error:', error);
        } finally {
            setIsPredicting(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="min-h-screen bg-[#050507] text-[#e2e8f0] pt-28 pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-l-4 border-blue-600 pl-8">
                    <div>
                        <div className="flex items-center gap-3 text-blue-400 font-bold tracking-[0.2em] text-xs mb-3">
                            <Zap className="w-4 h-4" />
                            LOX AI PREDICT ENGINE
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white">
                            Smarter Freight <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Forecasting.</span>
                        </h1>
                        <p className="text-slate-400 mt-4 max-w-lg text-lg leading-relaxed">
                            Analyze time series trends with STUMPY and optimize multi-modal routes using Google OR-Tools.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-[#111116] border border-white/5 py-3 px-6 rounded-2xl">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Market Volatility</div>
                            <div className="text-xl font-black text-yellow-500">LOW - 2.4%</div>
                        </div>
                    </div>
                </div>

                {/* Input Search Console */}
                <div className="bg-[#0f0f13] rounded-[2rem] p-4 border border-white/5 shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border border-white/5 group focus-within:border-blue-500/50 transition-all">
                            <Navigation className="text-slate-500 group-focus-within:text-blue-400" size={20} />
                            <input
                                placeholder="Origin Port (e.g. Istanbul)"
                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-600 font-medium"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:flex items-center justify-center text-slate-700">
                            <ArrowRight size={20} />
                        </div>
                        <div className="flex-1 flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border border-white/5 group focus-within:border-blue-500/50 transition-all">
                            <Globe className="text-slate-500 group-focus-within:text-blue-400" size={20} />
                            <input
                                placeholder="Destination Port (e.g. Hamburg)"
                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-600 font-medium"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handlePredict}
                            disabled={isPredicting}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)] active:scale-95 text-sm uppercase tracking-widest"
                        >
                            {isPredicting ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                            {isPredicting ? 'Analyzing...' : 'Predict & Optimize'}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isPredicting && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-32 flex flex-col items-center justify-center text-center"
                        >
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <Zap className="absolute inset-0 m-auto w-12 h-12 text-blue-500 animate-pulse" />
                            </div>
                            <h3 className="text-3xl font-black text-white">Running STUMPY Protocols</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">Processing 10 years of historical freight data and running Google OR-Tools optimization models...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {data && !isPredicting && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Left: Trend Analysis */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Price Trend Forecasting</h3>
                                        <p className="text-xs text-slate-500 font-bold mt-1">TIME SERIES ANALYSIS // STUMPY V2</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ${data.trend === 'down' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {data.trend === 'down' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                        Trend: {data.trend === 'down' ? 'SOFTER' : 'STIFFENING'}
                                    </div>
                                </div>

                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...data.historicalData, ...data.forecastData]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111116', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorPrice)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-6 flex items-center gap-8 justify-center border-t border-white/5 pt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence: {data.confidence}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500/30 rounded-sm"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model: Matrix Profile</span>
                                    </div>
                                </div>
                            </div>

                            {/* Optimized Routes */}
                            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">OR-Tools Route Optimization</h3>
                                    <div className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                                        VSP: Vessel Schedule Profiling Active
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {data.optimizedRoutes.map((route) => (
                                        <div key={route.id} className="group relative bg-black/20 hover:bg-black/40 border border-white/5 rounded-2xl p-6 transition-all">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-600/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <Ship size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-lg font-black text-white">{route.carrier}</span>
                                                            {route.tags.map(tag => (
                                                                <span key={tag} className="text-[8px] font-black text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-tight">
                                                            <span className="flex items-center gap-1"><Clock size={12} /> {route.transitTime} Days</span>
                                                            <span className="flex items-center gap-1 font-black text-green-500/80"><Leaf size={12} /> {route.carbonFootprint}kg CO2</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8">
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Opt. Price</div>
                                                        <div className="text-2xl font-black text-white tracking-tighter">${route.price}</div>
                                                    </div>
                                                    <button className="bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-500 hover:text-white active:scale-95 shadow-xl">
                                                        Secure Rate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Insights & AI Summary */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                                        <Zap size={24} className="text-yellow-400" />
                                    </div>
                                    <h4 className="text-2xl font-black uppercase tracking-tight mb-4">LOX Predict <br />Insight Summary</h4>
                                    <p className="text-white/70 text-sm leading-relaxed mb-8">
                                        Historical matching suggests market cooling. Predict model recommends <strong>deferred booking</strong> if delivery deadline allows for +7 days. Best reliability-to-cost ratio found with Maersk Line.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                                            <span className="text-[10px] font-bold uppercase">Price Risk</span>
                                            <span className="text-sm font-black text-yellow-400">MODERATE</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                                            <span className="text-[10px] font-bold uppercase">Space Availability</span>
                                            <span className="text-sm font-black text-green-400">HIGH</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Real-time Port Intel</h4>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-1.5 h-12 bg-red-500 rounded-full shrink-0"></div>
                                        <div>
                                            <div className="text-[10px] font-black text-white uppercase tracking-tight">Istanbul Port</div>
                                            <p className="text-xs text-slate-500 mt-1">Vessel congestion increasing. Est. berthing delay: 14h.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-1.5 h-12 bg-green-500 rounded-full shrink-0"></div>
                                        <div>
                                            <div className="text-[10px] font-black text-white uppercase tracking-tight">Hamburg Port</div>
                                            <p className="text-xs text-slate-500 mt-1">Optimal flow. Customs clearance averaging 4.2h.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-600/5 border border-blue-600/20 rounded-[2rem] p-8 flex items-center gap-4">
                                <Info className="text-blue-500 shrink-0" size={20} />
                                <p className="text-[10px] font-bold text-blue-400/80 leading-relaxed italic">
                                    All predictions are generated using L.O.X V4 Neural Engine. Accuracy rates may vary based on geopolitical shifts.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {!data && !isPredicting && (
                    <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <div className="w-24 h-24 bg-blue-600/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-600/10">
                            <Zap className="text-blue-500 w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight">Waiting for Scenario Input</h3>
                        <p className="text-slate-500 mt-4 max-w-sm mx-auto text-lg">
                            Define your trade route above to start the LOX AI internal prediction and optimization cycle.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
