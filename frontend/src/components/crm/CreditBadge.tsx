import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useCredits } from '../../contexts/crm/CreditContext';
import { getCreditColor } from '../../types/crm/credit';

interface CreditBadgeProps {
    onClick?: () => void;
    variant?: 'compact' | 'detailed';
}

const CreditBadge: React.FC<CreditBadgeProps> = ({ onClick, variant = 'compact' }) => {
    const { credits, loading } = useCredits();
    const [showTooltip, setShowTooltip] = useState(false);

    if (loading || !credits) {
        return (
            <div className="px-4 py-2 bg-slate-100 rounded-full animate-pulse">
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
            </div>
        );
    }

    const color = getCreditColor(credits.current, credits.limit);
    const percentage = (credits.current / credits.limit) * 100;

    const colorClasses = {
        green: 'bg-green-50 border-green-200 text-green-700',
        yellow: 'bg-amber-50 border-amber-200 text-amber-700',
        red: 'bg-red-50 border-red-200 text-red-700'
    };

    const iconColors = {
        green: 'text-green-600',
        yellow: 'text-amber-600',
        red: 'text-red-600'
    };

    return (
        <div className="relative">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`
                    px-4 py-2 rounded-full border-2 cursor-pointer transition-all
                    ${colorClasses[color]}
                    ${color === 'red' && credits.current > 0 ? 'animate-pulse' : ''}
                `}
            >
                <div className="flex items-center gap-2">
                    <Zap size={16} className={iconColors[color]} />
                    <span className="font-black text-sm tracking-tight">
                        {credits.current.toLocaleString()}
                    </span>
                    {variant === 'detailed' && (
                        <>
                            <span className="text-xs opacity-60">/</span>
                            <span className="text-xs font-bold opacity-60">
                                {credits.limit.toLocaleString()}
                            </span>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-64"
                    >
                        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Credit Balance
                                </span>
                                <span className="text-xs text-slate-400">
                                    {credits.plan === 'free' ? 'Free Plan' : credits.plan === 'pro' ? 'Starter Plan' : 'Pro Plan'}
                                </span>
                            </div>

                            {/* Current Balance */}
                            <div className="mb-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black">
                                        {credits.current.toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-sm font-bold">
                                        / {credits.limit.toLocaleString()}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        className={`h-full ${color === 'green' ? 'bg-green-500' :
                                            color === 'yellow' ? 'bg-amber-500' :
                                                'bg-red-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Usage Stats */}
                            <div className="space-y-1 border-t border-slate-700 pt-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Used Today</span>
                                    <span className="font-bold">{credits.stats.usedToday}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Used This Month</span>
                                    <span className="font-bold">{credits.stats.usedThisMonth}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Remaining</span>
                                    <span className="font-bold text-green-400">{credits.stats.remainingThisMonth}</span>
                                </div>
                            </div>

                            {/* Warnings */}
                            {credits.warnings.lowBalance && !credits.warnings.zeroBalance && (
                                <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                                    <span className="text-xs text-amber-300 font-medium">
                                        Running low on credits
                                    </span>
                                </div>
                            )}

                            {credits.warnings.zeroBalance && (
                                <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                                    <span className="text-xs text-red-300 font-medium">
                                        Out of credits! Upgrade to continue.
                                    </span>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="mt-3 text-center">
                                <span className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">
                                    Click to view details →
                                </span>
                            </div>

                            {/* Arrow */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreditBadge;
