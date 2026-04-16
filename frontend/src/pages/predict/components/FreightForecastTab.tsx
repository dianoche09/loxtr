import React, { useState, useRef, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    TrendingDown, TrendingUp, Ship, Clock, Leaf, Zap, Globe, Navigation,
    ArrowRight, Loader2, Download, GitCompare, Minus, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchPredictionData, savePredictionHistory,
    COMMODITY_TYPES, type PredictionResult, type ContainerSize, type CommodityType,
    type PredictionHistoryEntry
} from '../../../services/PredictService';
import PortAutocomplete from './PortAutocomplete';
import type { Port } from '../../../data/ports';

interface Props {
    onPredictionComplete: () => void;
    historyEntry?: PredictionHistoryEntry;
}

const CONTAINER_SIZES: ContainerSize[] = ['20ft', '40ft', '40ft HC'];
const FORECAST_PERIODS = [
    { value: 3, label: '3 Months' },
    { value: 6, label: '6 Months' },
    { value: 12, label: '12 Months' },
];

export default function FreightForecastTab({ onPredictionComplete, historyEntry }: Props) {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [commodityType, setCommodityType] = useState<CommodityType | ''>('');
    const [containerSize, setContainerSize] = useState<ContainerSize>('20ft');
    const [horizon, setHorizon] = useState(6);
    const [isPredicting, setIsPredicting] = useState(false);
    const [data, setData] = useState<PredictionResult | null>(null);

    // Comparison mode
    const [compareMode, setCompareMode] = useState(false);
    const [origin2, setOrigin2] = useState('');
    const [destination2, setDestination2] = useState('');
    const [data2, setData2] = useState<PredictionResult | null>(null);

    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (historyEntry?.query) {
            const q = historyEntry.query;
            if (q.origin) setOrigin(q.origin);
            if (q.destination) setDestination(q.destination);
        }
    }, [historyEntry]);

    const handlePredict = async () => {
        if (!origin || !destination) return;
        setIsPredicting(true);
        setData(null);
        setData2(null);

        try {
            const result = await fetchPredictionData({
                origin, destination, horizon,
                commodityType: commodityType || undefined,
                containerSize,
            });
            setData(result);

            savePredictionHistory({
                type: 'freight',
                query: { origin, destination, commodity: commodityType || 'General', container: containerSize },
                summary: `${origin} → ${destination}, ${containerSize}`,
            });

            if (compareMode && origin2 && destination2) {
                const result2 = await fetchPredictionData({
                    origin: origin2, destination: destination2, horizon,
                    commodityType: commodityType || undefined,
                    containerSize,
                });
                setData2(result2);
            }

            onPredictionComplete();
        } catch (error) {
            console.error('Prediction error:', error);
        } finally {
            setIsPredicting(false);
        }
    };

    const handleExportCSV = () => {
        if (!data) return;
        const allData = [...(data.historicalData || []), ...(data.forecastData || [])];
        const header = 'date,price,lower,upper\n';
        const rows = allData.map(p => `${p.date},${p.price},${p.lower ?? ''},${p.upper ?? ''}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `freight-forecast-${origin}-${destination}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPNG = async () => {
        if (!chartRef.current) return;
        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(chartRef.current, { backgroundColor: '#0f0f13' });
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `freight-forecast-${origin}-${destination}.png`;
            a.click();
        } catch (error) {
            console.error('Export PNG failed:', error);
        }
    };

    // Merge data for comparison chart
    const getMergedChartData = () => {
        if (!data) return [];
        const allData = [...(data.historicalData || []), ...(data.forecastData || [])];

        if (!data2 || !compareMode) return allData;

        const allData2 = [...(data2.historicalData || []), ...(data2.forecastData || [])];
        const dateMap = new Map<string, any>();

        allData.forEach(p => {
            dateMap.set(p.date, { ...p, price: p.price, price2: null });
        });
        allData2.forEach(p => {
            const existing = dateMap.get(p.date);
            if (existing) {
                existing.price2 = p.price;
            } else {
                dateMap.set(p.date, { date: p.date, price: null, price2: p.price });
            }
        });

        return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    };

    const hasConfidenceBands = data?.forecastData?.some(p => p.lower !== undefined && p.upper !== undefined);

    return (
        <div>
            {/* Search Console */}
            <div className="bg-[#0f0f13] rounded-[2rem] p-4 border border-white/5 shadow-2xl mb-8">
                {/* Row 1: Origin → Destination + Button */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <PortAutocomplete
                        value={origin}
                        onChange={(_port, display) => setOrigin(display)}
                        placeholder="Origin Port (e.g. Istanbul)"
                        icon={<Navigation size={20} />}
                    />
                    <div className="hidden md:flex items-center justify-center text-slate-700">
                        <ArrowRight size={20} />
                    </div>
                    <PortAutocomplete
                        value={destination}
                        onChange={(_port, display) => setDestination(display)}
                        placeholder="Destination Port (e.g. Hamburg)"
                        icon={<Globe size={20} />}
                    />
                    <button
                        onClick={handlePredict}
                        disabled={isPredicting || !origin || !destination}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)] active:scale-95 text-sm uppercase tracking-widest"
                    >
                        {isPredicting ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                        {isPredicting ? 'Analyzing...' : 'Predict'}
                    </button>
                </div>

                {/* Row 2: Commodity + Container + Period + Compare */}
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <select
                        value={commodityType}
                        onChange={(e) => setCommodityType(e.target.value as CommodityType)}
                        className="bg-black/40 border border-white/5 text-white rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500/50 outline-none flex-1 md:flex-none md:w-52"
                    >
                        <option value="">All Commodities</option>
                        {COMMODITY_TYPES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <div className="flex bg-black/40 rounded-xl border border-white/5 p-1">
                        {CONTAINER_SIZES.map(size => (
                            <button
                                key={size}
                                onClick={() => setContainerSize(size)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    containerSize === size
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <select
                        value={horizon}
                        onChange={(e) => setHorizon(Number(e.target.value))}
                        className="bg-black/40 border border-white/5 text-white rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500/50 outline-none"
                    >
                        {FORECAST_PERIODS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => { setCompareMode(!compareMode); setData2(null); }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                            compareMode
                                ? 'bg-cyan-600/20 border-cyan-500/30 text-cyan-400'
                                : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'
                        }`}
                    >
                        <GitCompare size={14} />
                        Compare
                    </button>
                </div>

                {/* Compare Row */}
                <AnimatePresence>
                    {compareMode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-white/5 items-center">
                                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold shrink-0">
                                    <div className="w-3 h-3 bg-cyan-400 rounded-sm" />
                                    ROUTE B
                                </div>
                                <PortAutocomplete
                                    value={origin2}
                                    onChange={(_port, display) => setOrigin2(display)}
                                    placeholder="Origin Port B"
                                    icon={<Navigation size={18} />}
                                    accentColor="cyan"
                                />
                                <div className="hidden md:flex items-center justify-center text-slate-700">
                                    <Minus size={16} />
                                </div>
                                <PortAutocomplete
                                    value={destination2}
                                    onChange={(_port, display) => setDestination2(display)}
                                    placeholder="Destination Port B"
                                    icon={<Globe size={18} />}
                                    accentColor="cyan"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Loading State */}
            <AnimatePresence>
                {isPredicting && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-32 flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <Zap className="absolute inset-0 m-auto w-12 h-12 text-blue-500 animate-pulse" />
                        </div>
                        <h3 className="text-3xl font-black text-white">Running Forecast</h3>
                        <p className="text-slate-500 mt-2 max-w-sm">
                            Processing historical freight data and generating optimized routes...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {data && !isPredicting && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Left: Chart + Routes */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Price Trend Chart */}
                        <div ref={chartRef} className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Price Trend Forecasting</h3>
                                    <p className="text-xs text-slate-500 font-bold mt-1">
                                        {origin.toUpperCase()} → {destination.toUpperCase()}
                                        {compareMode && data2 && ` vs ${origin2.toUpperCase()} → ${destination2.toUpperCase()}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ${
                                        data.trend === 'down' ? 'bg-green-500/10 text-green-400' :
                                        data.trend === 'up' ? 'bg-red-500/10 text-red-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                        {data.trend === 'down' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                        {data.trend === 'down' ? 'SOFTER' : data.trend === 'up' ? 'STIFFENING' : 'STABLE'}
                                    </div>

                                    {/* Export Menu */}
                                    <div className="relative group">
                                        <button className="p-2 rounded-xl border border-white/5 text-slate-500 hover:text-white hover:border-blue-500/30 transition-all">
                                            <Download size={16} />
                                        </button>
                                        <div className="absolute right-0 top-full mt-2 bg-[#1a1a1f] border border-white/10 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[140px]">
                                            <button onClick={handleExportCSV} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                                Export CSV
                                            </button>
                                            <button onClick={handleExportPNG} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                                Export PNG
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={getMergedChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPrice2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111116', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        {hasConfidenceBands && !compareMode && (
                                            <>
                                                <Area type="monotone" dataKey="upper" stroke="none" fillOpacity={1} fill="url(#colorBand)" />
                                                <Area type="monotone" dataKey="lower" stroke="none" fillOpacity={0} fill="transparent" />
                                            </>
                                        )}
                                        <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" name={compareMode ? `${origin} → ${destination}` : 'Price'} animationDuration={1500} />
                                        {compareMode && data2 && (
                                            <Area type="monotone" dataKey="price2" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice2)" name={`${origin2} → ${destination2}`} animationDuration={1500} />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 flex items-center gap-8 justify-center border-t border-white/5 pt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Confidence: {data.confidence}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500/30 rounded-sm" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Model: {data.modelUsed || 'Gemini AI'}
                                    </span>
                                </div>
                                {compareMode && data2 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-cyan-400 rounded-sm" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Route B
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Optimized Routes */}
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Optimized Routes</h3>
                                <div className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                                    {data.optimizedRoutes.length} Options
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
                                                    <div className="text-2xl font-black text-white tracking-tighter">${route.price.toLocaleString()}</div>
                                                    {data.currencyRates && (
                                                        <div className="flex items-center gap-2 mt-1 justify-end">
                                                            {data.currencyRates.EUR && (
                                                                <span className="text-[10px] text-slate-500">€{Math.round(route.price * data.currencyRates.EUR).toLocaleString()}</span>
                                                            )}
                                                            {data.currencyRates.TRY && (
                                                                <span className="text-[10px] text-slate-500">₺{Math.round(route.price * data.currencyRates.TRY).toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const subject = encodeURIComponent(`Rate Lock Request: ${origin} → ${destination}`);
                                                        const body = encodeURIComponent(`Carrier: ${route.carrier}\nPrice: $${route.price}\nTransit: ${route.transitTime} days\nContainer: ${containerSize}`);
                                                        window.open(`mailto:info@loxtr.com?subject=${subject}&body=${body}`);
                                                    }}
                                                    className="bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-500 hover:text-white active:scale-95 shadow-xl"
                                                >
                                                    Secure Rate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Insights */}
                    <div className="space-y-8">
                        {/* AI Insight Summary */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <Zap size={24} className="text-yellow-400" />
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tight mb-4">
                                    LOX Predict<br />Insight Summary
                                </h4>
                                <p className="text-white/70 text-sm leading-relaxed mb-8">
                                    {data.insight || 'Analysis complete. Review the chart and route options for detailed insights.'}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                                        <span className="text-[10px] font-bold uppercase">Price Risk</span>
                                        <span className={`text-sm font-black ${
                                            data.priceRisk === 'HIGH' ? 'text-red-400' :
                                            data.priceRisk === 'MODERATE' ? 'text-yellow-400' :
                                            'text-green-400'
                                        }`}>
                                            {data.priceRisk || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                                        <span className="text-[10px] font-bold uppercase">Space Availability</span>
                                        <span className={`text-sm font-black ${
                                            data.spaceAvailability === 'LOW' ? 'text-red-400' :
                                            data.spaceAvailability === 'MODERATE' ? 'text-yellow-400' :
                                            'text-green-400'
                                        }`}>
                                            {data.spaceAvailability || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Port Intel */}
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Real-time Port Intel</h4>
                            <div className="space-y-6">
                                {data.portIntel && data.portIntel.length > 0 ? (
                                    data.portIntel.map((intel, idx) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className={`w-1.5 h-12 rounded-full shrink-0 ${
                                                intel.status === 'congested' ? 'bg-red-500' :
                                                intel.status === 'optimal' ? 'bg-green-500' :
                                                'bg-yellow-500'
                                            }`} />
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tight">{intel.port}</div>
                                                <p className="text-xs text-slate-500 mt-1">{intel.detail}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="flex items-start gap-4">
                                            <div className="w-1.5 h-12 bg-slate-700 rounded-full shrink-0" />
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tight">{origin || 'Origin'}</div>
                                                <p className="text-xs text-slate-500 mt-1">Intel data not available for this port.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-1.5 h-12 bg-slate-700 rounded-full shrink-0" />
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tight">{destination || 'Destination'}</div>
                                                <p className="text-xs text-slate-500 mt-1">Intel data not available for this port.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* AI Estimate Disclaimer */}
                        <div className="bg-yellow-600/5 border border-yellow-600/20 rounded-[2rem] p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                                <div>
                                    <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2">AI Estimate — Not a Quote</p>
                                    <p className="text-[10px] font-bold text-yellow-400/60 leading-relaxed">
                                        Prices are AI-generated estimates based on real-time oil prices, market indices, and historical patterns. They are not live freight rates or binding quotes. Use as directional guidance — contact carriers or your freight forwarder for actual booking rates.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {!data && !isPredicting && (
                <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <div className="w-24 h-24 bg-blue-600/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-600/10">
                        <Ship className="text-blue-500 w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Waiting for Route Input</h3>
                    <p className="text-slate-500 mt-4 max-w-sm mx-auto text-lg">
                        Define your trade route above to start the freight prediction and optimization cycle.
                    </p>
                </div>
            )}
        </div>
    );
}
