// Credit System Type Definitions

export type CreditAction =
    | 'lead_unlock'
    | 'verified_email_unlock'
    | 'ai_email_generation'
    | 'smart_segment_creation'
    | 'supply_chain_intel'
    | 'campaign_email_batch'
    | 'monthly_refill'
    | 'plan_upgrade'
    | 'admin_adjustment'
    | 'refund';

export interface CreditBalance {
    current: number;
    limit: number;
    nextRefillDate: string;
    plan: 'free' | 'pro' | 'enterprise';
    stats: {
        usedToday: number;
        usedThisWeek: number;
        usedThisMonth: number;
        remainingThisMonth: number;
    };
    warnings: {
        lowBalance: boolean;
        zeroBalance: boolean;
        highUsage: boolean;
    };
}

export interface CreditTransaction {
    id: string;
    action: CreditAction;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: string;
    metadata?: {
        leadId?: string;
        campaignId?: string;
        reason?: string;
        [key: string]: any;
    };
}

export interface CreditContextType {
    credits: CreditBalance | null;
    loading: boolean;
    error: string | null;
    fetchCredits: () => Promise<void>;
    consumeCredits: (amount: number, action: CreditAction) => Promise<boolean>;
    hasEnoughCredits: (amount: number) => boolean;
    showUpgradeModal: (required: number) => void;
}

export interface UpgradePrompt {
    required: number;
    available: number;
    message: string;
    plans: {
        starter: { credits: number; price: number };
        pro: { credits: number; price: number };
    };
}

// Helper function: Get credit color based on percentage
export const getCreditColor = (current: number, limit: number): 'green' | 'yellow' | 'red' => {
    const percentage = (current / limit) * 100;
    if (percentage > 50) return 'green';
    if (percentage > 20) return 'yellow';
    return 'red';
};

// Helper function: Get action display name
export const getActionDisplayName = (action: CreditAction): string => {
    const names: Record<CreditAction, string> = {
        lead_unlock: 'Lead Unlocked',
        verified_email_unlock: 'Verified Email Access',
        ai_email_generation: 'AI Email Generated',
        smart_segment_creation: 'Smart Segment Created',
        supply_chain_intel: 'Supply Chain Analysis',
        campaign_email_batch: 'Campaign Email Batch',
        monthly_refill: 'Monthly Refill',
        plan_upgrade: 'Plan Upgrade',
        admin_adjustment: 'Admin Adjustment',
        refund: 'Refund'
    };
    return names[action] || action;
};

// Helper function: Get action icon
export const getActionIcon = (action: CreditAction): string => {
    const icons: Record<CreditAction, string> = {
        lead_unlock: '🔓',
        verified_email_unlock: '✉️',
        ai_email_generation: '🤖',
        smart_segment_creation: '🎯',
        supply_chain_intel: '🔗',
        campaign_email_batch: '📧',
        monthly_refill: '🔄',
        plan_upgrade: '⬆️',
        admin_adjustment: '⚙️',
        refund: '💰'
    };
    return icons[action] || '📝';
};
