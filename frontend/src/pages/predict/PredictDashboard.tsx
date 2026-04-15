import React, { useState, useEffect } from 'react';
import { Zap, Ship, BarChart3, Activity, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/crm/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPredictionHistory } from '../../services/PredictService';
import type { PredictionHistoryEntry, MarketPulseResult } from '../../services/PredictService';
import FreightForecastTab from './components/FreightForecastTab';
import TariffForecastTab from './components/TariffForecastTab';
import MarketPulseTab from './components/MarketPulseTab';

type TabId = 'freight' | 'tariff' | 'market-pulse';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'freight', label: 'Freight Forecast', icon: <Ship size={16} /> },
    { id: 'tariff', label: 'Tariff Forecast', icon: <BarChart3 size={16} /> },
    { id: 'market-pulse', label: 'Market Pulse', icon: <Activity size={16} /> },
];

export default function PredictDashboard() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const [activeTab, setActiveTab] = useState<TabId>(
        (queryParams.get('tab') as TabId) || 'freight'
    );
    const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
    const [cachedPulse, setCachedPulse] = useState<MarketPulseResult | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        setHistory(getPredictionHistory());
    }, [activeTab]);

    const refreshHistory = () => setHistory(getPredictionHistory());

    const handleHistoryClick = (entry: PredictionHistoryEntry) => {
        setActiveTab(entry.type);
    };

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <Loader2 className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050507] text-[#e2e8f0] pt-28 pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 border-l-4 border-blue-600 pl-8">
                    <div>
                        <div className="flex items-center gap-3 text-blue-400 font-bold tracking-[0.2em] text-xs mb-3">
                            <Zap className="w-4 h-4" />
                            LOX AI PREDICT ENGINE
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white">
                            Smarter Trade{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                                Intelligence.
                            </span>
                        </h1>
                        <p className="text-slate-400 mt-4 max-w-lg text-lg leading-relaxed">
                            AI-powered freight forecasting, tariff analysis, and real-time market intelligence.
                        </p>
                    </div>
                    {cachedPulse?.volatilityIndex && (
                        <div className="bg-[#111116] border border-white/5 py-3 px-6 rounded-2xl">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                                Market Volatility
                            </div>
                            <div className={`text-xl font-black ${
                                cachedPulse.volatilityIndex.label === 'HIGH' ? 'text-red-500' :
                                cachedPulse.volatilityIndex.label === 'MODERATE' ? 'text-yellow-500' :
                                'text-green-500'
                            }`}>
                                {cachedPulse.volatilityIndex.label} - {cachedPulse.volatilityIndex.value}%
                            </div>
                        </div>
                    )}
                </div>

                {/* Tab Bar */}
                <div className="bg-[#0f0f13] rounded-2xl p-1.5 border border-white/5 mb-8 inline-flex gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            <span className="relative z-10">{tab.icon}</span>
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'freight' && (
                            <FreightForecastTab
                                onPredictionComplete={refreshHistory}
                                historyEntry={history.find(h => h.type === 'freight')}
                            />
                        )}
                        {activeTab === 'tariff' && (
                            <TariffForecastTab
                                onPredictionComplete={refreshHistory}
                                historyEntry={history.find(h => h.type === 'tariff')}
                            />
                        )}
                        {activeTab === 'market-pulse' && (
                            <MarketPulseTab onDataLoaded={setCachedPulse} />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Prediction History */}
                {history.length > 0 && (
                    <div className="mt-10">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={12} /> Recent Predictions
                        </h4>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {history.map((entry) => (
                                <button
                                    key={entry.id}
                                    onClick={() => handleHistoryClick(entry)}
                                    className="flex-shrink-0 bg-[#0f0f13] border border-white/5 hover:border-blue-500/30 rounded-xl px-4 py-3 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            entry.type === 'freight' ? 'bg-blue-500/10 text-blue-400' :
                                            entry.type === 'tariff' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-purple-500/10 text-purple-400'
                                        }`}>
                                            {entry.type}
                                        </span>
                                        <span className="text-[10px] text-slate-600">
                                            {getRelativeTime(entry.timestamp)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors max-w-[200px] truncate">
                                        {entry.summary}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
