import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Building2, Globe, ShieldCheck, Rocket, Target } from 'lucide-react';
import Logo from '../../components/Logo';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/crm/AuthContext';
import { useSearchParams } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo');
    const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            if (redirectTo) {
                window.location.href = redirectTo;
                return;
            }
            if (!user.onboardingCompleted) {
                navigate('/onboarding');
            } else {
                navigate('/crm/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            // Redirect handled by useEffect after auth state changes
        } catch (err: any) {
            // Error toast is handled by AuthContext
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-off-white flex items-center justify-center p-4 font-outfit">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-yellow/5 rounded-full blur-3xl opacity-50" />
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
                className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[500px] relative z-10"
            >
                {/* Branding Section */}
                <div className="w-full md:w-[40%] bg-navy p-8 text-white flex flex-col justify-between relative overflow-hidden text-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-charcoal opacity-90" />

                    <div className="relative z-10">
                        <div className="flex flex-col gap-4 mb-8">
                            <Logo className="h-10" />
                            <div className="h-1 w-8 bg-yellow rounded-full" />
                        </div>

                        <div className="space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl font-black leading-tight uppercase tracking-tight"
                            >
                                <span className="text-white/50 text-xs block mb-1">LOXTR INTELLIGENCE</span>
                                L.O.X <span className="text-yellow">AI RADAR</span>
                            </motion.h2>

                            <p className="text-white/70 text-sm font-medium leading-relaxed border-l-2 border-yellow/30 pl-4">
                                Harnessing AI to discover global opportunities while LOXTR handles the physical infrastructure.
                            </p>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-white/80">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                        <Target size={16} className="text-yellow" />
                                    </div>
                                    <p className="font-bold text-xs tracking-wide">AI Buyer Identification</p>
                                </div>
                                <div className="flex items-center gap-3 text-white/80">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                        <Globe size={16} className="text-yellow" />
                                    </div>
                                    <p className="font-bold text-xs tracking-wide">LOXTR Ecosystem Access</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-8">
                        <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3">
                            <div className="relative">
                                <Rocket className="text-yellow w-5 h-5" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-navy animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-yellow uppercase tracking-widest mb-1">48+ Companies Trading</p>
                                <p className="text-[10px] text-white/70 font-medium leading-none">
                                    Recent activity: <span className="text-white font-bold uppercase transition-all duration-500">{currentCompany}</span> just found a buyer.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Form */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-navy tracking-tight uppercase">Partner Login</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Step into the intelligence layer of global trade.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="text-slate-300" size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy focus:ring-2 focus:ring-navy/5 transition-all outline-none font-bold text-navy text-sm"
                                    placeholder="partner@loxtr.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[10px] font-bold text-navy hover:text-black uppercase tracking-wider transition-colors">Forgot?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="text-slate-300" size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-navy focus:ring-2 focus:ring-navy/5 transition-all outline-none font-bold text-navy text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-navy text-white py-4 px-6 rounded-xl font-bold tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-xs"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Log In
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-xs font-medium">
                        Not a partner yet?{' '}
                        <Link to="/register" className="text-navy hover:underline font-bold">
                            Join LOX AI RADAR
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
