import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, FileText, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';

interface StatData {
    total: number;
    last30: number;
    change: number;
}

interface AdminStats {
    contacts: StatData;
    newsletters: StatData;
    applications: StatData;
    users: StatData;
}

const StatCard = ({ title, value, subtitle, change, icon: Icon, color }: {
    title: string;
    value: string | number;
    subtitle: string;
    change: number;
    icon: React.ElementType;
    color: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {change !== 0 && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {change > 0 ? '+' : ''}{change}%
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-black text-navy">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </motion.div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (err: any) {
                console.error('Failed to fetch admin stats:', err);
                setError('Failed to load stats. Supabase may be paused.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-bold mb-2">Connection Error</div>
                    <p className="text-slate-500">{error}</p>
                    <button
                        onClick={() => { setError(''); setLoading(true); window.location.reload(); }}
                        className="mt-4 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Contact Forms"
                    value={loading ? '...' : stats?.contacts.total ?? 0}
                    subtitle={loading ? '' : `${stats?.contacts.last30 ?? 0} in last 30 days`}
                    change={stats?.contacts.change ?? 0}
                    icon={MessageSquare}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Newsletter Subs"
                    value={loading ? '...' : stats?.newsletters.total ?? 0}
                    subtitle={loading ? '' : `${stats?.newsletters.last30 ?? 0} in last 30 days`}
                    change={stats?.newsletters.change ?? 0}
                    icon={Mail}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Applications"
                    value={loading ? '...' : stats?.applications.total ?? 0}
                    subtitle={loading ? '' : `${stats?.applications.last30 ?? 0} in last 30 days`}
                    change={stats?.applications.change ?? 0}
                    icon={FileText}
                    color="bg-purple-500"
                />
                <StatCard
                    title="CRM Users"
                    value={loading ? '...' : stats?.users.total ?? 0}
                    subtitle={loading ? '' : `${stats?.users.last30 ?? 0} in last 30 days`}
                    change={stats?.users.change ?? 0}
                    icon={Users}
                    color="bg-amber-500"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-navy mb-4">System Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div>
                            <p className="font-bold text-sm text-navy">Supabase</p>
                            <p className="text-xs text-slate-500">{error ? 'Disconnected' : 'Connected'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div>
                            <p className="font-bold text-sm text-navy">Resend Email</p>
                            <p className="text-xs text-slate-500">Configured</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div>
                            <p className="font-bold text-sm text-navy">Vercel Functions</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
