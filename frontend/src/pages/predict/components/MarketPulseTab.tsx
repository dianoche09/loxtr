import React, { useState, useEffect } from 'react';
import {
    TrendingDown, TrendingUp, Minus, Activity, Globe, AlertTriangle,
    RefreshCw, Loader2, DollarSign, BarChart3, Ship, Package, Fuel, Banknote
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    fetchMarketPulse, MARKET_REGIONS,
    type MarketPulseResult, type MarketRegion
} from '../../../services/PredictService';

interface Props {
    onDataLoaded: (data: MarketPulseResult) => void;
}

export default function MarketPulseTab({ onDataLoaded }: Props) {
    const [region, setRegion] = useState<MarketRegion>('Global');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<MarketPulseResult | null>(null);

    const loadData = async (selectedRegion: MarketRegion) => {
        setIsLoading(true);
        try {
            const result = await fetchMarketPulse(selectedRegion);
            setData(result);
            onDataLoaded(result);
        } catch (error) {
            console.error('Market pulse error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData(region);
    }, []);

    const handleRegionChange = (newRegion: MarketRegion) => {
        setRegion(newRegion);
        loadData(newRegion);
    };

    const getTrendIcon = (trend: string, size = 14) => {
        if (trend === 'up') return <TrendingUp size={size} className="text-red-400" />;
        if (trend === 'down') return <TrendingDown size={size} className="text-green-400" />;
        return <Minus size={size} className="text-yellow-400" />;
    };

    const getTrendColor = (trend: string) => {
        if (trend === 'up') return 'text-red-400';
        if (trend === 'down') return 'text-green-400';
        return 'text-yellow-400';
    };

    const getSeverityStyles = (severity: string) => {
        if (severity === 'critical') return { border: 'border-red-500', bg: 'bg-red-500/5', text: 'text-red-400', dot: 'bg-red-500' };
        if (severity === 'warning') return { border: 'border-yellow-500', bg: 'bg-yellow-500/5', text: 'text-yellow-400', dot: 'bg-yellow-500' };
        return { border: 'border-blue-500', bg: 'bg-blue-500/5', text: 'text-blue-400', dot: 'bg-blue-500' };
    };

    // Loading skeleton
    if (isLoading && !data) {
        return (
            <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <Activity className="absolute inset-0 m-auto w-12 h-12 text-purple-500 animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-white">Loading Market Intelligence</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                    Aggregating global freight market data, trade alerts, and commodity trends...
                </p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Region Filter + Refresh */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                    {MARKET_REGIONS.map(r => (
                        <button
                            key={r}
                            onClick={() => handleRegionChange(r)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                region === r
                                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400'
                                    : 'bg-[#0f0f13] border border-white/5 text-slate-500 hover:text-white'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => loadData(region)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0f0f13] border border-white/5 text-slate-500 hover:text-white transition-all"
                >
                    <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Freight Index */}
                <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                            <DollarSign size={18} className="text-blue-400" />
                        </div>
                        <span className={`text-xs font-black flex items-center gap-1 ${
                            data.freightIndex.change >= 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                            {data.freightIndex.change >= 0 ? '+' : ''}{data.freightIndex.change}%
                            {data.freightIndex.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        </span>
                    </div>
                    <div className="text-2xl font-black text-white tracking-tighter">
                        ${data.freightIndex.value.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Global Freight Index ({data.freightIndex.unit})
                    </div>
                </div>

                {/* Volatility */}
                <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-yellow-600/10 rounded-xl flex items-center justify-center">
                            <Activity size={18} className="text-yellow-400" />
                        </div>
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                            data.volatilityIndex.label === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                            data.volatilityIndex.label === 'MODERATE' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-green-500/10 text-green-400'
                        }`}>
                            {data.volatilityIndex.label}
                        </span>
                    </div>
                    <div className="text-2xl font-black text-white tracking-tighter">
                        {data.volatilityIndex.value}
                        <span className="text-lg text-slate-500">/100</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Volatility Index
                    </div>
                </div>

                {/* Trade Alerts */}
                <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={18} className="text-red-400" />
                        </div>
                        <span className="text-xs font-black text-slate-500">
                            {data.tradeAlerts.filter(a => a.severity === 'critical').length} critical
                        </span>
                    </div>
                    <div className="text-2xl font-black text-white tracking-tighter">
                        {data.tradeAlerts.length}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Active Trade Alerts
                    </div>
                </div>

                {/* Top Route */}
                <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center">
                            <Ship size={18} className="text-purple-400" />
                        </div>
                        {data.topRoutes[0] && (
                            <span className={`text-xs font-black flex items-center gap-1 ${getTrendColor(data.topRoutes[0].trend)}`}>
                                {data.topRoutes[0].changePercent >= 0 ? '+' : ''}{data.topRoutes[0].changePercent}%
                                {getTrendIcon(data.topRoutes[0].trend, 12)}
                            </span>
                        )}
                    </div>
                    <div className="text-lg font-black text-white tracking-tight truncate">
                        {data.topRoutes[0]?.origin} → {data.topRoutes[0]?.destination}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Busiest Route (${data.topRoutes[0]?.avgPrice?.toLocaleString()})
                    </div>
                </div>
            </div>

            {/* Live Market Data (from EIA, FRED, ECB) */}
            {data.realTimeData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Brent Crude */}
                    {data.realTimeData.brentCrude && (
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center">
                                    <Fuel size={18} className="text-orange-400" />
                                </div>
                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                                    Live
                                </span>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter">
                                ${data.realTimeData.brentCrude.current.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-black ${
                                    data.realTimeData.brentCrude.change >= 0 ? 'text-red-400' : 'text-green-400'
                                }`}>
                                    {data.realTimeData.brentCrude.change >= 0 ? '+' : ''}{data.realTimeData.brentCrude.change}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    Brent Crude (EIA)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Supply Chain Pressure */}
                    {data.realTimeData.supplyChainPressure && (
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                                    <Activity size={18} className="text-indigo-400" />
                                </div>
                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                                    Live
                                </span>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter">
                                {data.realTimeData.supplyChainPressure.current.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                Supply Chain Pressure (FRED)
                            </div>
                        </div>
                    )}

                    {/* Dollar Index */}
                    {data.realTimeData.dollarIndex && (
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-green-600/10 rounded-xl flex items-center justify-center">
                                    <DollarSign size={18} className="text-green-400" />
                                </div>
                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                                    Live
                                </span>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter">
                                {data.realTimeData.dollarIndex.current.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-black ${
                                    data.realTimeData.dollarIndex.change >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {data.realTimeData.dollarIndex.change >= 0 ? '+' : ''}{data.realTimeData.dollarIndex.change}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    Dollar Index (FRED)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Exchange Rates */}
                    {data.realTimeData.exchangeRates && Object.keys(data.realTimeData.exchangeRates.rates).length > 0 && (
                        <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-cyan-600/10 rounded-xl flex items-center justify-center">
                                    <Banknote size={18} className="text-cyan-400" />
                                </div>
                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                                    Live
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {['EUR', 'TRY', 'CNY'].map(cur => {
                                    const rate = data.realTimeData?.exchangeRates?.rates[cur];
                                    return rate ? (
                                        <div key={cur} className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500">{cur}/USD</span>
                                            <span className="text-sm font-black text-white">{rate.toFixed(cur === 'TRY' ? 2 : 4)}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                                ECB Rates ({data.realTimeData.exchangeRates.date})
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Two Column: Routes Table + Trade Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Routes Table */}
                <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Globe size={14} className="text-blue-400" />
                            Top Trade Routes
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {data.topRoutes.map((route, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/20 hover:bg-black/40 rounded-xl px-5 py-4 transition-all">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-slate-600 w-5">#{idx + 1}</span>
                                    <div>
                                        <span className="text-sm font-bold text-white">
                                            {route.origin} → {route.destination}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-white">${route.avgPrice.toLocaleString()}</span>
                                    <span className={`flex items-center gap-1 text-xs font-black ${getTrendColor(route.trend)}`}>
                                        {route.changePercent >= 0 ? '+' : ''}{route.changePercent}%
                                        {getTrendIcon(route.trend)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trade Alerts Feed */}
                <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} className="text-yellow-400" />
                            Trade Alerts
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data.tradeAlerts.map((alert, idx) => {
                            const styles = getSeverityStyles(alert.severity);
                            return (
                                <div key={idx} className={`${styles.bg} border-l-2 ${styles.border} rounded-xl px-5 py-4`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                                        <span className={`text-xs font-black uppercase tracking-widest ${styles.text}`}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-[10px] text-slate-600 ml-auto">{alert.date}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-1">{alert.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{alert.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Commodity Trends */}
            <div className="bg-[#0f0f13] rounded-[2rem] border border-white/5 p-8 mb-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Package size={14} className="text-purple-400" />
                    Commodity Trends
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {data.commodityTrends.map((commodity, idx) => (
                        <div key={idx} className="bg-black/20 rounded-xl p-4 text-center hover:bg-black/40 transition-all">
                            <div className="text-xs font-bold text-slate-400 mb-2 truncate">{commodity.name}</div>
                            <div className="flex items-center justify-center gap-1">
                                {getTrendIcon(commodity.trend)}
                                <span className={`text-sm font-black ${getTrendColor(commodity.trend)}`}>
                                    {commodity.priceChange >= 0 ? '+' : ''}{commodity.priceChange}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/10 rounded-[2rem] p-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart3 size={14} className="text-purple-400" />
                    AI Market Summary
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                    {data.summary}
                </p>
            </div>
        </motion.div>
    );
}
