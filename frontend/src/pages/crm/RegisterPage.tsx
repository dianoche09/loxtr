import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Building, ArrowRight, Sparkles, Check, Globe, Zap, ShieldCheck, Rocket, Star } from 'lucide-react';
import Logo from '../../components/Logo';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/crm/AuthContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, isLoading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        company: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const COMPANIES = [
        "Atlas Global Trade", "Meridian Logistics", "Vertex Supply Chain", "Pacific Rim Exports",
        "Zenith Trading Corp", "Nova Freight Systems", "Horizon Import-Export", "OmniFlow Global",
        "Stellar Maritime", "Apex International", "Solstice Trading", "Echo Logistics Group",
        "Quantum Trade Solutions", "Pioneer Global", "Unity Cargo Systems", "Spectrum Supply",
        "Vantage Global Trade", "Capital Freight", "Delta Shipping Lines", "Summit International",
        "BlueHorizon Traders", "Terra Nova Logistics", "Global Link Partners", "Velocity Exports",
        "Prime Source Trading"
    ];

    const [currentCompany, setCurrentCompany] = useState(COMPANIES[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomCompany = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
            setCurrentCompany(randomCompany);
        }, 3500); // Change every 3.5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                email: formData.email,
                name: formData.name,
                password: formData.password,
                company: formData.company
            });
            // AuthContext handles success toast and will trigger redirect via auth state change
            navigate('/onboarding');
        } catch (err: any) {
            // Error toast is handled by AuthContext
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-off-white flex items-center justify-center p-4 py-12 font-outfit">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-yellow/5 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Back to Home Button */}
            <Link
                to="/"
                className="fixed top-8 left-8 z-50 flex items-center gap-2 text-navy/40 hover:text-navy font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
            >
                <div className="w-8 h-8 rounded-full border border-navy/10 flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all">
                    <ArrowRight className="rotate-180" size={14} />
                </div>
                <span>Back to Home</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row relative z-10"
            >
                {/* Branding Section */}
                <div className="w-full md:w-[35%] bg-navy p-8 text-white flex flex-col justify-between relative overflow-hidden text-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-charcoal opacity-90" />

                    <div className="relative z-10">
                        <div className="flex flex-col gap-4 mb-8">
                            <Logo className="h-10" />
                            <div className="h-1 w-8 bg-yellow rounded-full" />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight uppercase">
                                <span className="text-white/50 text-xs block mb-1">LOXTR Intelligence</span>
                                LOX <span className="text-yellow">AI RADAR</span>
                            </h2>

                            <div className="space-y-4 pt-2">
                                {[
                                    { icon: Globe, text: "Leverage LOXTR Global Network", color: "text-blue-400" },
                                    { icon: Zap, text: "AI-Powered Lead Discovery", color: "text-yellow" },
                                    { icon: ShieldCheck, text: "Integrated Trade Workflow", color: "text-green-400" }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                            <item.icon size={18} className={item.color} />
                                        </div>
                                        <span className="font-bold text-xs tracking-wide text-white/90">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="relative">
                                <Star className="text-yellow fill-yellow w-4 h-4" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-navy animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none">48+ Companies Joined</p>
                                <p className="text-[9px] text-white/50 mt-1">Last joined: <span className="text-yellow font-bold uppercase transition-all duration-500">{currentCompany}</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="flex-1 p-8 md:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-navy tracking-tight uppercase">Join LOX AI RADAR</h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Start finding global buyers with AI-powered intelligence.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="text-slate-300" size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy focus:ring-2 focus:ring-navy/5 transition-all outline-none font-bold text-navy text-sm shadow-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="text-slate-300" size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy focus:ring-2 focus:ring-navy/5 transition-all outline-none font-bold text-navy text-sm shadow-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Company Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Building className="text-slate-300" size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy focus:ring-2 focus:ring-navy/5 transition-all outline-none font-bold text-navy text-sm shadow-sm"
                                            placeholder="Meridian Shipping"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy focus:ring-2 focus:ring-navy/5 transition-all outline-none font-bold text-navy text-sm shadow-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Confirm</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy focus:ring-2 focus:ring-navy/5 transition-all outline-none font-bold text-navy text-sm shadow-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy text-white py-4 px-6 rounded-xl font-bold tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 uppercase text-xs"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Register
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-500 text-xs font-medium tracking-tight">
                            Already registered?{' '}
                            <Link to="/login" className="text-navy hover:underline font-bold">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
