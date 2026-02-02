import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    Send,
    Trash2,
    ExternalLink,
    Sparkles,
    Terminal,
    RefreshCcw,
    CheckCircle,
    AlertCircle,
    User,
    MessageSquare,
    Target,
    Settings as SettingsIcon,
    ArrowRight
} from 'lucide-react';
import { supabase } from '../../supabase';
import toast from 'react-hot-toast';

// --- COMPONENTS ---

// Radar Animation (inspired by Lox AI Radar)
const RadarAnimation = ({ active }: { active: boolean }) => (
    <div className="relative w-16 h-16">
        <div className={`absolute inset-0 rounded-full border-2 border-blue-500/20 ${active ? 'animate-ping' : ''}`} />
        <div className="absolute inset-0 rounded-full border border-blue-500/40" />
        <div className={`absolute inset-0 rounded-full border-t-2 border-blue-500 ${active ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
        <div className="absolute inset-[30%] rounded-full bg-blue-500/20 flex items-center justify-center">
            <Target size={16} className={active ? 'text-blue-400 animate-pulse' : 'text-slate-500'} />
        </div>
    </div>
);

const OutreachManager = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>(["[SYSTEM] Command Center Initialized...", "[BOT] Waiting for instructions..."]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch Initial Data
    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchLeads(), fetchSettings()]);
            setLoading(false);
        };
        init();

        // Subscribe to changes in leads
        const leadsSubscription = supabase
            .channel('bot_leads_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_outreach_leads' }, () => {
                fetchLeads();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(leadsSubscription);
        };
    }, []);

    const fetchLeads = async () => {
        const { data, error } = await supabase
            .from('bot_outreach_leads')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (!error) setLeads(data || []);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('bot_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (!error) setSettings(data);
    };

    const toggleBot = async () => {
        if (!settings) return;
        const newState = !settings.is_active;

        const { error } = await supabase
            .from('bot_settings')
            .update({ is_active: newState })
            .eq('id', 1);

        if (!error) {
            setSettings({ ...settings, is_active: newState });
            addLog(`[SYSTEM] Bot ${newState ? 'STARTED' : 'STOPPED'}`);
            toast.success(`Bot ${newState ? 'started' : 'stopped'}`);
        }
    };

    const handleApprove = async (leadId: string, comment: string) => {
        setActionLoading(leadId);
        const { error } = await supabase
            .from('bot_outreach_leads')
            .update({ status: 'approved', ai_suggested_comment: comment })
            .eq('id', leadId);

        if (!error) {
            setLeads(leads.filter(l => l.id !== leadId));
            addLog(`[APPROVAL] Lead approved for posting: ${leadId.slice(0, 8)}`);
            toast.success('Lead approved! Bot will post shortly.');
        }
        setActionLoading(null);
    };

    const handleReject = async (leadId: string) => {
        const { error } = await supabase
            .from('bot_outreach_leads')
            .update({ status: 'rejected' })
            .eq('id', leadId);

        if (!error) {
            setLeads(leads.filter(l => l.id !== leadId));
            addLog(`[ACTION] Lead rejected: ${leadId.slice(0, 8)}`);
        }
    };

    const handleRegenerate = async (lead: any) => {
        setActionLoading(`gen-${lead.id}`);
        try {
            const response = await fetch('/api/loxconvert/generate-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postContent: lead.content_snippet,
                    authorName: lead.author_name,
                    keyword: lead.detected_keyword
                })
            });
            const data = await response.json();
            if (data.suggestedComment) {
                const { error } = await supabase
                    .from('bot_outreach_leads')
                    .update({ ai_suggested_comment: data.suggestedComment })
                    .eq('id', lead.id);

                if (!error) {
                    setLeads(leads.map(l => l.id === lead.id ? { ...l, ai_suggested_comment: data.suggestedComment } : l));
                    toast.success('AI Comment regenerated');
                    addLog(`[AI] Comment regenerated for lead ${lead.id.slice(0, 8)}`);
                }
            }
        } catch (err) {
            toast.error('AI Regeneration failed');
        }
        setActionLoading(null);
    };

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="animate-spin text-blue-500"><RefreshCcw /></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            {/* TOP COMMAND BAR */}
            <div className="bg-[#0c1223] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[100px]" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <RadarAnimation active={settings?.is_active} />
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                Outreach <span className="text-blue-500 italic">Command Center</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`w-2 h-2 rounded-full ${settings?.is_active ? 'bg-green-500' : 'bg-slate-600'} animate-pulse`} />
                                <span className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none">
                                    Bot Status: {settings?.is_active ? 'ACTIVE & SCANNING' : 'IDLE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                        <div className="px-6 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pending Approval</p>
                            <p className="text-2xl font-black text-white">{leads.length}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <button
                            onClick={toggleBot}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                                ${settings?.is_active
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95'}`}
                        >
                            {settings?.is_active ? <><Pause size={18} /> STOP OUTREACH</> : <><Play size={18} /> START OUTREACH</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: INTELLIGENCE QUEUE */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-black text-navy uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={20} className="text-blue-500" />
                            Intelligence Queue
                        </h2>
                        <span className="text-slate-400 text-xs font-bold">{leads.length} Opportunities Found</span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {leads.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center"
                            >
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Target size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-navy mb-2">No pending opportunities</h3>
                                <p className="text-slate-400 max-w-sm mx-auto">The bot is currently scanning for relevant LinkedIn posts based on your keywords.</p>
                            </motion.div>
                        ) : (
                            leads.map((lead) => (
                                <motion.div
                                    key={lead.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy font-black text-lg border border-navy/10 group-hover:bg-navy group-hover:text-yellow transition-colors">
                                                {lead.author_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-navy text-lg leading-tight flex items-center gap-2">
                                                    {lead.author_name}
                                                    <a href={lead.post_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        #{lead.detected_keyword}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleReject(lead.id)}
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-100">
                                        <p className="text-slate-600 text-sm italic leading-relaxed line-clamp-3">
                                            "{lead.content_snippet}"
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Sparkles size={12} className="text-blue-500" />
                                                Gemini Prepared Reply
                                            </label>
                                            <button
                                                onClick={() => handleRegenerate(lead)}
                                                disabled={actionLoading === `gen-${lead.id}`}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                                            >
                                                <RefreshCcw size={10} className={actionLoading === `gen-${lead.id}` ? 'animate-spin' : ''} />
                                                Regenerate
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm font-medium text-navy focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all min-h-[100px]"
                                                defaultValue={lead.ai_suggested_comment}
                                                id={`comment-${lead.id}`}
                                            />
                                            <div className="absolute bottom-4 right-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                                                LOX SALES ENGINEER AI
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                const comment = (document.getElementById(`comment-${lead.id}`) as HTMLTextAreaElement).value;
                                                handleApprove(lead.id, comment);
                                            }}
                                            disabled={!!actionLoading}
                                            className="w-full bg-navy text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-navy/20 hover:bg-blue-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {actionLoading === lead.id ? (
                                                <RefreshCcw size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={18} />
                                                    Approve & Add to Outbox
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: SETTINGS & LOGS */}
                <div className="lg:col-span-4 space-y-8">
                    {/* BOT STATUS CARD */}
                    <div className="bg-[#0c1223] rounded-[2rem] p-6 border border-white/10 shadow-xl overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 blur-2xl" />

                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <SettingsIcon size={16} className="text-blue-500" />
                            Bot Configurations
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Target Keywords</label>
                                <div className="flex flex-wrap gap-2">
                                    {settings?.target_keywords?.map((tag: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-blue-400 text-xs font-mono">
                                            {tag}
                                        </span>
                                    ))}
                                    <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Daily Capacity</p>
                                    <p className="text-xl font-black text-white">{settings?.daily_limit || 20} <span className="text-[10px] text-slate-500 ml-1">Comments</span></p>
                                </div>
                                <RadarAnimation active={settings?.is_active} />
                            </div>
                        </div>
                    </div>

                    {/* LIVE OPERATIONAL LOGS */}
                    <div className="bg-[#0c1223] rounded-[2rem] p-6 border border-white/10 shadow-xl min-h-[400px] flex flex-col">
                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Terminal size={16} className="text-blue-500" />
                            Operational Log
                        </h3>

                        <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className={`${log.includes('[AI]') ? 'text-blue-400' : log.includes('[SYSTEM]') ? 'text-yellow' : log.includes('[APPROVAL]') ? 'text-green-400' : 'text-slate-400'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Outreach</p>
                            <p className="text-2xl font-black text-navy leading-none">1,248</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversion</p>
                            <p className="text-2xl font-black text-blue-600 leading-none">4.2%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutreachManager;
