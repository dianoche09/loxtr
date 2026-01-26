import { motion } from 'framer-motion';
import { Globe, Activity, BarChart3, ShieldAlert, Cpu, Search, Database, Fingerprint } from 'lucide-react';

const RadarDashboard = () => {
    return (
        <div className="w-full aspect-[16/9] bg-[#05070A] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-mono text-[10px] text-white/70 relative">
            {/* Top Navigation Bar */}
            <div className="h-12 border-b border-white/5 bg-black/40 flex items-center justify-between px-6 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]/30 border border-[#FF3B30]/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]/30 border border-[#FFCC00]/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#34C759]/30 border border-[#34C759]/50" />
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-yellow font-black tracking-[0.3em] text-[10px] animate-pulse">SYSTEM STATUS: NOMINAL</span>
                </div>
                <div className="flex items-center gap-8 text-[9px] font-bold text-white/30">
                    <div className="flex items-center gap-2">
                        <Database size={12} className="text-yellow/40" />
                        <span>L.O.X CORE v8.2</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-yellow" />
                        <span>BUFFER: 98.2%</span>
                    </div>
                    <span className="text-white/20">01:14:02 UTC</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Side Panels Left: Intelligence Feed */}
                <div className="w-72 border-r border-white/5 p-5 flex flex-col gap-6 bg-black/40 backdrop-blur-sm">
                    {/* Live Signal Analysis */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-white/30">
                            <span>Signal processing</span>
                            <span className="text-yellow">LIVE</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow/5 to-transparent" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-yellow/10 border border-yellow/20 flex items-center justify-center">
                                        <Globe className="text-yellow w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white">GEN-X NODE</div>
                                        <div className="text-[8px] text-white/30 uppercase tracking-tighter">EU-Sourcing-Alpha</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[7px] uppercase tracking-widest font-bold">
                                        <span>Discovery Strength</span>
                                        <span className="text-yellow">98.2%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '98%' }}
                                            transition={{ duration: 2 }}
                                            className="h-full bg-yellow shadow-[0_0_10px_#facc15]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="space-y-4">
                        <div className="text-[7px] font-black uppercase tracking-widest text-white/30">Pattern Recognition</div>
                        <div className="h-24 bg-black/60 rounded-xl border border-white/10 flex items-end justify-between p-3 overflow-hidden relative">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                            {[...Array(14)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [10, Math.random() * 60 + 10, 10] }}
                                    transition={{ duration: 0.6 + Math.random(), repeat: Infinity }}
                                    className="w-2 bg-yellow/30 rounded-t-sm"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sector Insights */}
                    <div className="mt-auto space-y-4">
                        <div className="text-[7px] font-black uppercase tracking-widest text-white/30">Anomalies Detected</div>
                        <div className="space-y-2">
                            {[
                                { label: 'STEEL-EU', val: '+12.4%', trend: 'up' },
                                { label: 'TEXTILE-JP', val: 'SIG-LOST', trend: 'down' }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-[8px] font-bold tracking-tighter">{item.label}</span>
                                    <span className={`text-[8px] font-black ${item.trend === 'up' ? 'text-yellow' : 'text-red-500'}`}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main View: Global Trade Radar */}
                <div className="flex-1 relative bg-[#020305] overflow-hidden">
                    {/* Tactical Grid */}
                    <div className="absolute inset-0 opacity-10 z-0"
                        style={{ backgroundImage: 'radial-gradient(#facc15 1px, transparent 0)', backgroundSize: '40px 40px' }}
                    />

                    {/* Radar Scanning Line */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-10"
                        style={{
                            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(245, 158, 11, 0.1) 90deg, transparent 90deg)'
                        }}
                    />

                    {/* Arcs and Points (Strategic Illustration) */}
                    <div className="absolute inset-0 z-20">
                        <svg className="w-full h-full opacity-40" viewBox="0 0 800 500">
                            {/* Trade Arcs */}
                            <motion.path
                                d="M150,200 Q400,100 650,200"
                                fill="none" stroke="#facc15" strokeWidth="1" strokeDasharray="5,10"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.path
                                d="M400,200 Q100,300 150,200"
                                fill="none" stroke="#facc15" strokeWidth="0.5" strokeDasharray="3,6"
                                className="opacity-30"
                            />

                            {/* Strategic Hubs */}
                            {[
                                { x: 150, y: 200, label: 'NEW YORK BASE', active: false },
                                { x: 400, y: 200, label: 'LONDON HUB', active: true },
                                { x: 650, y: 200, label: 'TOKYO SECTOR', active: false },
                                { x: 500, y: 350, label: 'DUBAI PORT', active: true },
                                { x: 180, y: 380, label: 'IST BASE', active: true }
                            ].map((point, i) => (
                                <g key={i}>
                                    {point.active && (
                                        <motion.circle
                                            cx={point.x} cy={point.y} r={12}
                                            stroke="#facc15" strokeWidth="0.5" fill="none"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: [0.5, 2, 0.5], opacity: [0, 0.5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                                        />
                                    )}
                                    <circle cx={point.x} cy={point.y} r={point.active ? 3 : 1.5} fill={point.active ? '#facc15' : '#ffffff20'} />
                                    <text x={point.x + 8} y={point.y + 3} fill="white" fontSize="7" fontWeight="black" opacity="0.4" className="tracking-widest uppercase">
                                        {point.label}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* Detected Lead Overlay (Top Left) */}
                    <div className="absolute top-6 left-6 z-30">
                        <div className="bg-[#05070A]/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 w-56 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Fingerprint size={12} className="text-yellow" />
                                <span className="text-[8px] font-black uppercase text-white/50 tracking-widest">Lead Fingerprint</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: 'KRONOS LOGISTICS', type: 'BUYER', score: '98%' },
                                    { name: 'TITAN TRADING', type: 'IMPORTER', score: '94%' }
                                ].map((lead, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black text-white group-hover:text-yellow transition-colors">{lead.name}</span>
                                            <span className="text-yellow font-black text-[7px]">{lead.score}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[6px] text-white/20 font-black">{lead.type}</span>
                                            <div className="w-16 h-0.5 bg-white/5 rounded-full">
                                                <div className="h-full bg-yellow/40" style={{ width: lead.score }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Console */}
                    <div className="absolute bottom-6 left-6 right-6 z-30 flex gap-6">
                        <div className="flex-1 bg-[#05070A]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex gap-8 items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-yellow rounded-full animate-ping" />
                                    <div className="space-y-1">
                                        <div className="text-[7px] font-black text-white/40 uppercase tracking-widest">SCANNING ASSETS</div>
                                        <div className="text-[9px] font-black text-yellow uppercase">ALL SYSTEMS GO</div>
                                    </div>
                                </div>
                                <div className="h-6 w-px bg-white/5" />
                                <div className="space-y-1 text-left">
                                    <div className="text-[7px] font-black text-white/20 uppercase tracking-widest">THREAT LVL</div>
                                    <div className="text-[9px] font-black text-white uppercase tracking-tighter">MINIMAL - V4.0</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Search size={14} className="text-white/20" />
                                <Barcode size={10} /> { /* Just for visual noise */}
                            </div>
                        </div>
                        <div className="bg-[#CB4D45]/10 border border-[#CB4D45]/20 rounded-xl p-4 px-8 flex items-center gap-4">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
                            <span className="text-[#CB4D45] font-black uppercase tracking-widest text-[8px]">Unfiltered Flows: 0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple visual noise component
const Barcode = ({ size }: { size: number }) => (
    <div className="flex gap-[1px]">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/10" style={{ width: Math.random() * 2 + 1, height: size }} />
        ))}
    </div>
);

export default RadarDashboard;
