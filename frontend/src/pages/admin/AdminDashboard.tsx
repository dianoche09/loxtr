import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Activity, Globe, Package } from 'lucide-react';
import api from '../../services/crm/api'; // Assuming a generic API service exists or reusing existing one

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {change && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {change > 0 ? '+' : ''}{change}%
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-black text-navy">{value}</p>
    </motion.div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        leadsGenerated: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data fetching or real API call
        const fetchStats = async () => {
            try {
                // const res = await api.get('/admin/stats');
                // setStats(res.data);

                // MOCK DATA for Visuals
                setTimeout(() => {
                    setStats({
                        totalUsers: 1248,
                        activeUsers: 856,
                        leadsGenerated: 14205,
                        revenue: 45200
                    });
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={loading ? '...' : stats.totalUsers}
                    change={12}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={loading ? '...' : stats.activeUsers}
                    change={5}
                    icon={Activity}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Leads Generated"
                    value={loading ? '...' : stats.leadsGenerated.toLocaleString()}
                    change={24}
                    icon={Globe}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={loading ? '...' : `$${stats.revenue.toLocaleString()}`}
                    change={8}
                    icon={DollarSign}
                    color="bg-yellow"
                />
            </div>

            {/* Recent Activity Section (Example) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-navy mb-6">Recent Registrations</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                        U{i}
                                    </div>
                                    <div>
                                        <p className="font-bold text-navy text-sm">New User {i}</p>
                                        <p className="text-slate-400 text-xs">user{i}@example.com</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-400">2 mins ago</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-navy rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow rounded-full blur-[50px] opacity-20 -mr-10 -mt-10"></div>
                    <h2 className="text-lg font-bold mb-6 relative z-10">System Status</h2>
                    <div className="space-y-6 relative z-10">
                        <div>
                            <div className="flex justify-between text-sm mb-2 opacity-80">
                                <span>API Latency</span>
                                <span className="text-green-400">24ms</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-400 h-full w-[20%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2 opacity-80">
                                <span>Token Usage (Gemini)</span>
                                <span className="text-yellow">85%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-yellow h-full w-[85%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2 opacity-80">
                                <span>Database Load</span>
                                <span className="text-blue-400">42%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full w-[42%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
