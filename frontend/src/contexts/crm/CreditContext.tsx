import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { CreditBalance, CreditAction, CreditContextType } from '../types/credit';
import { toast } from 'react-hot-toast';

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [credits, setCredits] = useState<CreditBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch credits from API
    const fetchCredits = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/credits/balance');

            if (response.data.success) {
                setCredits(response.data.data);
                setError(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch credits:', err);
            setError(err.response?.data?.error || 'Failed to load credits');
        } finally {
            setLoading(false);
        }
    };

    // Consume credits (client-side check + server-side enforcement)
    const consumeCredits = async (amount: number, action: CreditAction): Promise<boolean> => {
        if (!credits) {
            toast.error('Credit information not available');
            return false;
        }

        if (credits.current < amount) {
            showUpgradeModal(amount);
            return false;
        }

        try {
            const response = await axios.post('/api/credits/consume', { amount, action });

            if (response.data.success) {
                // Update local state
                setCredits(prev => prev ? {
                    ...prev,
                    current: response.data.data.newBalance,
                    stats: {
                        ...prev.stats,
                        usedToday: prev.stats.usedToday + amount,
                        usedThisWeek: prev.stats.usedThisWeek + amount,
                        usedThisMonth: prev.stats.usedThisMonth + amount,
                        remainingThisMonth: prev.stats.remainingThisMonth - amount
                    }
                } : null);

                return true;
            }
        } catch (err: any) {
            if (err.response?.status === 402) {
                // Insufficient credits
                showUpgradeModal(amount);
            } else {
                toast.error(err.response?.data?.error || 'Failed to consume credits');
            }
            return false;
        }

        return false;
    };

    // Check if user has enough credits (local check)
    const hasEnoughCredits = (amount: number): boolean => {
        return credits ? credits.current >= amount : false;
    };

    // Show upgrade modal
    const showUpgradeModal = (required: number) => {
        if (!credits) return;

        const message = `You need ${required} credits but have only ${credits.current}. Upgrade to continue.`;

        toast.error(message, {
            duration: 5000,
            position: 'top-center',
            style: {
                background: '#1e293b',
                color: '#fff',
                padding: '16px',
                borderRadius: '12px'
            }
        });

        // Dispatch custom event for upgrade modal (can be caught by App.tsx)
        window.dispatchEvent(new CustomEvent('show-upgrade-modal', {
            detail: { required, available: credits.current }
        }));
    };

    // Fetch credits on mount and set up auto-refresh
    useEffect(() => {
        fetchCredits();

        // Refresh credits every 5 minutes
        const interval = setInterval(fetchCredits, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // Listen for credit-related events
    useEffect(() => {
        const handleCreditConsumed = () => {
            fetchCredits(); // Refresh after any credit-consuming action
        };

        window.addEventListener('credit-consumed', handleCreditConsumed);
        return () => window.removeEventListener('credit-consumed', handleCreditConsumed);
    }, []);

    return (
        <CreditContext.Provider value={{
            credits,
            loading,
            error,
            fetchCredits,
            consumeCredits,
            hasEnoughCredits,
            showUpgradeModal
        }}>
            {children}
        </CreditContext.Provider>
    );
};

// Custom hook to use credit context
export const useCredits = (): CreditContextType => {
    const context = useContext(CreditContext);

    if (!context) {
        throw new Error('useCredits must be used within a CreditProvider');
    }

    return context;
};
