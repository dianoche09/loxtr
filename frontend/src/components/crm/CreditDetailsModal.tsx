import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Clock, Zap, ArrowRight, Calendar } from 'lucide-react';
import { useCredits } from '../contexts/CreditContext';
import { CreditTransaction, getActionDisplayName, getActionIcon } from '../types/credit';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface CreditDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({ isOpen, onClose }) => {
    const { credits } = useCredits();
    const [history, setHistory] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/credits/history?limit=10');
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch credit history:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock 7-day consumption trend (in real app, get from API)
    const get7DayTrendData = () => {
        const labels = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
        const data = credits ? [45, 52, 38, 61, 72, 58, credits.stats.usedToday] : [];

        return {
            labels,
            datasets: [{
                label: 'Credits Used',
                data,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        };
    };

    if (!credits) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 pb-6 bg-gradient-to-br from-navy via-navy/50 to-indigo-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">Credit Dashboard</h2>
                                    <p className="text-blue-100 text-sm font-bold mt-1">
                                        {credits.plan === 'free' ? 'Free Plan' : credits.plan === 'pro' ? 'Starter Plan' : 'Pro Hunter Plan'}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <X size={24} className="text-white" />
                                </button>
                            </div>

                            {/* Current Balance - Big Number */}
                            <div className="mt-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-6xl font-black text-white">
                                        {credits.current.toLocaleString()}
                                    </span>
                                    <span className="text-2xl text-blue-100 font-bold">
                                        / {credits.limit.toLocaleString()}
                                    </span>
                                </div>
                                <div className="mt-3 h-3 bg-white/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(credits.current / credits.limit) * 100}%` }}
                                        className="h-full bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-6 bg-gradient-to-br from-navy/5 to-indigo-50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={18} className="text-navy" />
                                        <span className="text-xs font-bold text-navy uppercase tracking-wider">Today</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">
                                        {credits.stats.usedToday}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium mt-1">credits used</div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={18} className="text-purple-600" />
                                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">This Week</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">
                                        {credits.stats.usedThisWeek}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium mt-1">credits used</div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={18} className="text-green-600" />
                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Remaining</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">
                                        {credits.stats.remainingThisMonth}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium mt-1">this month</div>
                                </div>
                            </div>

                            {/* 7-Day Trend Chart */}
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="text-lg font-black text-slate-900 mb-4">7-Day Usage Trend</h3>
                                <Line
                                    data={get7DayTrendData()}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: '#1e293b',
                                                padding: 12,
                                                cornerRadius: 12,
                                                titleFont: { size: 14, weight: 'bold' },
                                                bodyFont: { size: 12 }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: 'rgba(0,0,0,0.05)' }
                                            },
                                            x: {
                                                grid: { display: false }
                                            }
                                        }
                                    }}
                                    height={200}
                                />
                            </div>

                            {/* Transaction History */}
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-4">Recent Transactions</h3>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="p-4 bg-slate-100 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <Zap size={48} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-bold">No transactions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {history.map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getActionIcon(tx.action)}</span>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">
                                                            {getActionDisplayName(tx.action)}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-medium">
                                                            {new Date(tx.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-black ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">
                                                        Balance: {tx.balanceAfter}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upgrade CTA (if low balance) */}
                            {credits.current < 50 && credits.plan === 'free' && (
                                <div className="p-6 bg-gradient-to-br from-navy to-indigo-600 rounded-2xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-black mb-1">Running Low on Credits?</h3>
                                            <p className="text-blue-100 text-sm font-medium">
                                                Upgrade to Starter for 500 credits/month
                                            </p>
                                        </div>
                                        <button className="px-6 py-3 bg-white text-navy rounded-2xl font-black hover:shadow-2xl transition-all flex items-center gap-2">
                                            Upgrade Now
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreditDetailsModal;
