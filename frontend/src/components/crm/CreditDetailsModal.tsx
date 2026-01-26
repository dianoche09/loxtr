import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowRight } from 'lucide-react';

interface CreditDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 pb-6 bg-gradient-to-br from-navy via-navy/50 to-indigo-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Credit Dashboard</h2>
                                    <p className="text-blue-100 text-sm font-bold mt-1">Coming Soon</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <X size={24} className="text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 text-center">
                            <Zap size={48} className="mx-auto mb-4 text-yellow" />
                            <p className="text-slate-600 mb-6">
                                Detailed credit tracking and analytics coming in the next update.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-navy text-white rounded-2xl font-black hover:bg-black transition-all flex items-center gap-2 mx-auto"
                            >
                                Got It
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreditDetailsModal;
