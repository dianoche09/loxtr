import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Shield, User, Download, Edit, Trash2, Eye } from 'lucide-react';
import { adminAPI } from '../../services/crm/adminApi';
import toast from 'react-hot-toast';

// Mock Data for demonstration since backend might not be fully wired
const MOCK_USERS = [
    { id: '1', name: 'Ali Yılmaz', email: 'ali@export.com', company: 'Yılmaz Tekstil', role: 'user', plan: 'free', status: 'active', created_at: '2024-01-15' },
    { id: '2', name: 'Ayşe Demir', email: 'ayse@logistics.com.tr', company: 'Demir Lojistik', role: 'admin', plan: 'enterprise', status: 'active', created_at: '2023-11-20' },
    { id: '3', name: 'John Doe', email: 'john@usatrade.com', company: 'USA Trade Corp', role: 'user', plan: 'pro', status: 'inactive', created_at: '2024-02-01' },
    { id: '4', name: 'Mehmet Kaya', email: 'mehmet@insaat.com', company: 'Kaya İnşaat', role: 'user', plan: 'free', status: 'banned', created_at: '2024-01-10' },
    { id: '5', name: 'Sarah Smith', email: 'sarah@global.co.uk', company: 'Global Sourcing', role: 'user', plan: 'pro', status: 'active', created_at: '2024-01-25' },
];

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [loading, setLoading] = useState(false);

    // Prepare data (filtering)
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (userId: string, newRole: string) => {
        // Optimistic UI update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`User role updated to ${newRole}`);
    };

    const handlePlanChange = (userId: string, newPlan: string) => {
        // Optimistic UI update
        setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
        toast.success(`User plan updated to ${newPlan}`);
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name, email, company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                    </select>

                    <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors text-sm font-bold">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User / Company</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Plan</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                                <p className="text-[10px] font-bold text-navy uppercase tracking-wide mt-0.5">{user.company}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={`text-xs font-bold px-2 py-1 rounded border-transparent bg-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer outline-none uppercase tracking-wide
                                                ${user.role === 'admin' ? 'text-red-600' : 'text-slate-600'}`}
                                        >
                                            <option value="user">USER</option>
                                            <option value="admin">ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.plan}
                                            onChange={(e) => handlePlanChange(user.id, e.target.value)}
                                            className={`text-xs font-black px-2 py-1 rounded-full border border-transparent bg-opacity-10 cursor-pointer outline-none uppercase tracking-wide
                                                ${user.plan === 'enterprise' ? 'bg-purple-500 text-purple-600' :
                                                    user.plan === 'pro' ? 'bg-navy text-navy' : 'bg-slate-200 text-slate-500'}`}
                                        >
                                            <option value="free">FREE</option>
                                            <option value="pro">PRO</option>
                                            <option value="enterprise">ENTERPRISE</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                                            ${user.status === 'active' ? 'bg-green-50 text-green-600' :
                                                user.status === 'banned' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : user.status === 'banned' ? 'bg-red-500' : 'bg-slate-400'}`} />
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-500 font-medium">{user.created_at}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-yellow/10 text-slate-400 hover:text-navy rounded-lg transition-colors" title="Edit User">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Ban User">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Showing 1-5 of 120 users</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
