import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchPorts, getPortLabel, type Port } from '../../../data/ports';

interface Props {
    value: string;
    onChange: (port: Port | null, display: string) => void;
    placeholder: string;
    icon: React.ReactNode;
    accentColor?: string;
}

export default function PortAutocomplete({ value, onChange, placeholder, icon, accentColor = 'blue' }: Props) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<Port[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (text: string) => {
        setQuery(text);
        setHighlightIdx(-1);
        const found = searchPorts(text, 8);
        setResults(found);
        setIsOpen(found.length > 0);
        // Pass raw text up so parent still has something even if no port selected
        onChange(null, text);
    };

    const handleSelect = (port: Port) => {
        const label = getPortLabel(port);
        setQuery(label);
        setIsOpen(false);
        setResults([]);
        onChange(port, label);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIdx(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIdx(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && highlightIdx >= 0) {
            e.preventDefault();
            handleSelect(results[highlightIdx]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const focusBorderColor = accentColor === 'cyan' ? 'focus-within:border-cyan-500/50' : 'focus-within:border-blue-500/50';
    const borderColor = accentColor === 'cyan' ? 'border-cyan-500/20' : 'border-white/5';

    return (
        <div ref={ref} className="relative flex-1">
            <div className={`flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border ${borderColor} group ${focusBorderColor} transition-all`}>
                <span className="text-slate-500 group-focus-within:text-blue-400 shrink-0">
                    {icon}
                </span>
                <input
                    ref={inputRef}
                    placeholder={placeholder}
                    className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-600 font-medium"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                        if (query.length >= 2) {
                            const found = searchPorts(query, 8);
                            setResults(found);
                            setIsOpen(found.length > 0);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-30 top-full mt-2 w-full bg-[#1a1a1f] border border-white/10 rounded-xl max-h-72 overflow-y-auto shadow-2xl"
                    >
                        {results.map((port, idx) => (
                            <button
                                key={port.code}
                                onClick={() => handleSelect(port)}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between gap-3 ${
                                    idx === highlightIdx ? 'bg-blue-600/20' : 'hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-blue-400 font-mono font-bold text-xs shrink-0">{port.code}</span>
                                    <span className="text-white truncate">{port.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold shrink-0">{port.country}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
