import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    Bell,
    Target
} from 'lucide-react';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/crm/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    // For now, simple client-side check. In production, this should be enforced by RLS/Backend.
    // We assume 'gurkan@loxtr.com' or specific emails are admins, or we check a role field later.
    useEffect(() => {
        if (!user && !logout) return; // Wait for auth to initialize (though simple check)

        // redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/dashboard'); // or /login or /
            toast.error('Unauthorized access: Admins only');
        }
    }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: FileText, label: 'Applications', path: '/admin/applications' },
        { icon: Target, label: 'LinkedIn Bot', path: '/admin/outreach' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-outfit">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
                className="bg-navy text-white flex flex-col relative z-20 transition-all duration-300 shadow-xl"
            >
                {/* Header */}
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-[32px]">
                            <Logo className="h-8 w-8 text-yellow" />
                        </div>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col whitespace-nowrap"
                            >
                                <span className="font-black text-lg tracking-tight">LOXTR</span>
                                <span className="text-[10px] font-bold text-yellow tracking-[0.2em]">ADMIN</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                                    ${isActive
                                        ? 'bg-yellow text-navy shadow-lg shadow-yellow/20 font-bold'
                                        : 'text-blue-100 hover:bg-white/10 hover:text-white font-medium'}`}
                            >
                                <item.icon size={20} className={isActive ? 'text-navy' : 'text-blue-200 group-hover:text-white'} />
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}

                                {!sidebarOpen && isActive && (
                                    <div className="absolute left-full ml-4 bg-navy text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 space-y-4">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-blue-200 transition-colors group ${!sidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    >
                        {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
                {/* Top Bar */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-slate-800">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h1>

                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-400 hover:text-navy transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white font-black text-xs">
                                AD
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-navy leading-none">Super Admin</p>
                                <p className="text-slate-400 text-xs mt-0.5">admin@loxtr.com</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
