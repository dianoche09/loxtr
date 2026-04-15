import React, { useState, useEffect, useRef } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    BarChart3, TrendingDown, TrendingUp, Zap, Loader2, Info, Search,
    Shield, AlertTriangle, Handshake, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchTariffForecast, savePredictionHistory,
    COMMON_HS_CODES, TRADE_COUNTRIES,
    type TariffForecastResult, type PredictionHistoryEntry
} from '../../../services/PredictService';

interface Props {
    onPredictionComplete: () => void;
    historyEntry?: PredictionHistoryEntry;
}

export default function TariffForecastTab({ onPredictionComplete, historyEntry }: Props) {
    const [hsCode, setHsCode] = useState('');
    const [hsSearch, setHsSearch] = useState('');
    const [showHsDropdown, setShowHsDropdown] = useState(false);
    const [originCountry, setOriginCountry] = useState('');
    const [destinationCountry, setDestinationCountry] = useState('');
    const [horizon, setHorizon] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<TariffForecastResult | null>(null);
    const hsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (historyEntry?.query) {
            const q = historyEntry.query;
            if (q.hsCode) { setHsCode(q.hsCode); setHsSearch(q.hsCode); }
            if (q.originCountry) setOriginCountry(q.originCountry);
            if (q.destinationCountry) setDestinationCountry(q.destinationCountry);
        }
    }, [historyEntry]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (hsRef.current && !hsRef.current.contains(e.target as Node)) {
                setShowHsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredHsCodes = COMMON_HS_CODES.filter(
        hs => hs.code.includes(hsSearch) || hs.label.toLowerCase().includes(hsSearch.toLowerCase())
    );

    const handleForecast = async () => {
        if (!hsCode || !originCountry || !destinationCountry) return;
        setIsLoading(true);
        setData(null);

        try {
            const result = await fetchTariffForecast(hsCode, originCountry, destinationCountry, horizon);
            setData(result);

            const hsLabel = COMMON_HS_CODES.find(h => h.code === hsCode)?.label || hsCode;
            savePredictionHistory({
                type: 'tariff',
                query: { hsCode, originCountry, destinationCountry },
                summary: `HS ${hsCode} (${hsLabel}): ${originCountry} → ${destinationCountry}`,
            });

            onPredictionComplete();
        } catch (error) {
            console.error('Tariff forecast error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!data) return;
        const header = 'date,rate_percent\n';
        const rows = data.forecastData.map(p => `${p.date},${p.price}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tariff-forecast-HS${hsCode}-${originCountry}-${destinationCountry}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            {/* Search Console */}
            <div className="bg-[#0f0f13] rounded-[2rem] p-4 border border-white/5 shadow-2xl mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* HS Code Input with Autocomplete */}
                    <div ref={hsRef} className="relative flex-1">
                        <div className="flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border border-white/5 group focus-within:border-emerald-500/50 transition-all">
                            <Search className="text-slate-500 group-focus-within:text-emerald-400" size={20} />
                            <input
                                placeholder="HS Code (e.g. 8471)"
                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-600 font-medium"
                                value={hsSearch}
                                onChange={(e) => {
                                    setHsSearch(e.target.value);
                                    setShowHsDropdown(true);
                                    if (e.target.value.length === 4 && /^\d{4}$/.test(e.target.value)) {
                                        setHsCode(e.target.value);
                                    }
                                }}
                                onFocus={() => setShowHsDropdown(true)}
                            />
                        </div>

                        <AnimatePresence>
                            {showHsDropdown && filteredHsCodes.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute z-30 top-full mt-2 w-full bg-[#1a1a1f] border border-white/10 rounded-xl max-h-64 overflow-y-auto shadow-2xl"
                                >
                                    {filteredHsCodes.map(hs => (
                                        <button
                                            key={hs.code}
                                            onClick={() => {
                                                setHsCode(hs.code);
                                                setHsSearch(`${hs.code} - ${hs.label}`);
                                                setShowHsDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
                                        >
                                            <span className="text-emerald-400 font-mono font-bold">{hs.code}</span>
                                            <span className="text-slate-400">{hs.label}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Origin Country */}
                    <select
                        value={originCountry}
                        onChange={(e) => setOriginCountry(e.target.value)}
                        className="bg-black/40 border border-white/5 text-white rounded-2xl px-6 py-4 text-sm font-medium focus:border-emerald-500/50 outline-none flex-1"
                    >
                        <option value="">Origin Country</option>
                        {TRADE_COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Destination Country */}
                    <select
                        value={destinationCountry}
                        onChange={(e) => setDestinationCountry(e.target.value)}
                        className="bg-black/40 border border-white/5 text-white rounded-2xl px-6 py-4 text-sm font-medium focus:border-emerald-500/50 outline-none flex-1"
                    >
                        <option value="">Destination Country</option>
                        {TRADE_COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Forecast Button */}
                    <button
                        onClick={handleForecast}
                        disabled={isLoading || !hsCode || !originCountry || !destinationCountry}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] active:scale-95 text-sm uppercase tracking-widest"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <BarChart3 size={18} />}
                        {isLoading ? 'Analyzing...' : 'Forecast'}
                    </button>
                </div>
            </div>

            {/* Loading */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-32 flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <BarChart3 className="absolute inset-0 m-auto w-12 h-12 text-emerald-500 animate-pulse" />
                        </div>
                        <h3 className="text-3xl font-black text-white">Analyzing Tariff Data</h3>
                        <p className="text-slate-500 mt-2 max-w-sm">
                            Evaluating trade agreements, WTO schedules, and policy changes for HS {hsCode}...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {data && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Left: Chart + Trade Agreements */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tariff Trend Chart */}
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Tariff Rate Forecast</h3>
                                    <p className="text-xs text-slate-500 font-bold mt-1">
                                        HS {data.hsCode} {data.productName ? `(${data.productName})` : ''} // {originCountry} → {destinationCountry}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ${
                                        data.trend === 'down' ? 'bg-green-500/10 text-green-400' :
                                        data.trend === 'up' ? 'bg-red-500/10 text-red-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                        {data.trend === 'down' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                        {data.trend === 'down' ? 'DECREASING' : data.trend === 'up' ? 'INCREASING' : 'STABLE'}
                                    </div>
                                    <button
                                        onClick={handleExportCSV}
                                        className="p-2 rounded-xl border border-white/5 text-slate-500 hover:text-white hover:border-emerald-500/30 transition-all"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTariff" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111116', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                            formatter={(value: number) => [`${value}%`, 'Tariff Rate']}
                                        />
                                        <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTariff)" animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 flex items-center gap-8 justify-center border-t border-white/5 pt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Confidence: {data.confidence}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Trade Agreements */}
                        {data.tradeAgreements && data.tradeAgreements.length > 0 && (
                            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Handshake size={16} className="text-emerald-400" />
                                    Relevant Trade Agreements
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.tradeAgreements.map((agreement, idx) => (
                                        <div key={idx} className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-5 py-4 flex items-center gap-3">
                                            <Shield size={14} className="text-emerald-400 shrink-0" />
                                            <span className="text-sm text-slate-300 font-medium">{agreement}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Current Rate + Insight + Risk Factors */}
                    <div className="space-y-8">
                        {/* Current Rate */}
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8 text-center">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Current Tariff Rate</div>
                            <div className="text-6xl font-black text-white tracking-tighter">
                                {data.currentRate}
                                <span className="text-2xl text-slate-500">%</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-3">
                                HS {data.hsCode} // {originCountry} → {destinationCountry}
                            </div>
                        </div>

                        {/* AI Insight */}
                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <Zap size={24} className="text-yellow-400" />
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-4">Tariff Insight</h4>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    {data.insight || 'Tariff analysis complete. Review the forecast chart for detailed trends.'}
                                </p>
                            </div>
                        </div>

                        {/* Risk Factors */}
                        {data.riskFactors && data.riskFactors.length > 0 && (
                            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-yellow-500" />
                                    Risk Factors
                                </h4>
                                <div className="space-y-3">
                                    {data.riskFactors.map((risk, idx) => (
                                        <div key={idx} className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-4 py-3">
                                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0" />
                                            <span className="text-xs text-slate-400 leading-relaxed">{risk}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info Banner */}
                        <div className="bg-emerald-600/5 border border-emerald-600/20 rounded-[2rem] p-8 flex items-center gap-4">
                            <Info className="text-emerald-500 shrink-0" size={20} />
                            <p className="text-[10px] font-bold text-emerald-400/80 leading-relaxed italic">
                                Tariff forecasts based on AI analysis of WTO schedules, bilateral agreements, and trade policy trends. Actual rates may differ.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {!data && !isLoading && (
                <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <div className="w-24 h-24 bg-emerald-600/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-600/10">
                        <BarChart3 className="text-emerald-500 w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Tariff Forecast</h3>
                    <p className="text-slate-500 mt-4 max-w-sm mx-auto text-lg">
                        Select an HS code and trade corridor to analyze import tariff trends and trade agreements.
                    </p>
                </div>
            )}
        </div>
    );
}
