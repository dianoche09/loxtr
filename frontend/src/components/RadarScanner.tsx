import { motion } from 'framer-motion';

const RadarScanner = () => {
    return (
        <div className="relative flex flex-col items-center justify-center p-12 md:p-20 bg-[#001D3D] rounded-[3rem] text-white overflow-hidden border border-blue-500/30 shadow-[0_0_50px_rgba(30,58,138,0.5)] h-[400px]">
            {/* LASER SCAN LINE */}
            <motion.div
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent z-20 shadow-[0_0_15px_rgba(96,165,250,1)] opacity-60"
            />

            {/* RADAR CIRCLES */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 border-2 border-blue-500/10 rounded-full flex items-center justify-center">
                {/* Rotating Sweep */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent border-t-2 border-blue-400/30 opacity-40 origin-center"
                />

                {/* Pulsing Grid Arcs */}
                <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-4 border border-blue-400/20 rounded-full"
                />

                {/* Inner Rings */}
                <div className="w-3/4 h-3/4 border border-blue-500/10 rounded-full flex items-center justify-center">
                    <div className="w-1/2 h-1/2 border border-blue-500/5 rounded-full" />
                </div>

                {/* Pulsing Data Points (Targets) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-1/4 right-1/3 w-2 h-2 bg-yellow rounded-full shadow-[0_0_10px_#fbbf24]"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                    className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
                    className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                />

                {/* Center Blip */}
                <div className="relative">
                    <div className="w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_20px_#60a5fa]" />
                    <motion.div
                        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500 rounded-full"
                    />
                </div>
            </div>

            <div className="mt-12 text-center z-10 relative">
                <motion.h3
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-2xl font-black tracking-[0.3em] text-blue-400 uppercase italic"
                >
                    LOX AI <span className="text-yellow">RADAR</span>
                </motion.h3>
                <div className="flex items-center justify-center gap-3 mt-4">
                    <span className="h-[1px] w-8 bg-blue-500/30" />
                    <p className="text-blue-200/50 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                        Scanning Global Logistics Data
                    </p>
                    <span className="h-[1px] w-8 bg-blue-500/30" />
                </div>
            </div>

            {/* Backdrop Glow */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};

export default RadarScanner;
