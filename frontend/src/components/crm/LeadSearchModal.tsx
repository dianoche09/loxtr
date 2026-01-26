
import { useState, useEffect } from 'react'
import { leadsAPI, aiAPI, discoveryAPI } from '../../services/crm/api'
import toast from 'react-hot-toast'
import { Search, Plus, Filter, Check, X, ChevronDown, ChevronUp, Sparkles, ShoppingBag, Globe, Building2, ChevronRight, Wand2, Lock, Unlock, Eye, Radar } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/crm/AuthContext'

interface LeadSearchModalProps {
    isOpen: boolean
    onClose: () => void
    onLeadsUnlocked?: (leads: any[]) => void
    initialProduct?: string
    initialIndustry?: string
    initialMarkets?: string[]
}

type Step = 'search' | 'refine' | 'loading' | 'results'

export default function LeadSearchModal({
    isOpen,
    onClose,
    onLeadsUnlocked,
    initialProduct,
    initialIndustry,
    initialMarkets
}: LeadSearchModalProps) {
    const { user } = useAuth()
    const [step, setStep] = useState<Step>('search')
    const [isSuggesting, setIsSuggesting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState(initialProduct || '')
    const [industry, setIndustry] = useState(initialIndustry || '')
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>(initialMarkets || [])
    const [suggestions, setSuggestions] = useState<{ industries: string[], markets: Array<{ country: string, reason: string }> }>({
        industries: [],
        markets: []
    })
    const [results, setResults] = useState<any[]>([])
    const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set())

    // Auto-prefill logic - slightly adjusted to not show everything immediately if empty
    useEffect(() => {
        if (isOpen && user) {
            // Only auto-prefill if the user hasn't typed anything yet
            if (!searchTerm && user.portfolio?.products?.length) {
                // We keep it empty for "wow" factor as requested, or just pre-fill searchTerm
                // setSearchTerm(user.portfolio.products[0].name)
            }
        }
    }, [isOpen, user])

    // Debounced suggestion fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm && searchTerm.length > 2) {
                fetchSuggestions()
            } else {
                setSuggestions({ industries: [], markets: [] })
            }
        }, 800)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const fetchSuggestions = async () => {
        setIsSuggesting(true)
        try {
            const res = await aiAPI.getDiscoverySuggestions({ product: searchTerm }) as any
            if (res.success) {
                setSuggestions({
                    industries: res.data.industries || [],
                    markets: res.data.markets || []
                })
            }
        } catch (err) {
            console.error('Failed to fetch suggestions')
        } finally {
            setIsSuggesting(false)
        }
    }

    const handleRunDiscovery = async () => {
        if (!searchTerm || !industry || selectedMarkets.length === 0) {
            return toast.error('Please fill in all fields')
        }

        setStep('loading')
        setLoading(true)

        try {
            const res = await discoveryAPI.runDiscovery({
                product: searchTerm,
                industry,
                targetMarkets: selectedMarkets,
                count: 15
            }) as any

            if (res.success && res.data?.leads) {
                setResults(res.data.leads)
                const allIndexes = new Set<number>(res.data.leads.map((_: any, i: number) => i))
                setSelectedResults(allIndexes)
                setStep('results')
            } else {
                toast.error('No leads found')
                setStep('search')
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Discovery failed')
            setStep('search')
        } finally {
            setLoading(false)
        }
    }

    const handleUnlockLeads = async () => {
        if (selectedResults.size === 0) return toast.error('Select at least one lead')

        setLoading(true)
        const leadsToSave = results.filter((_, i) => selectedResults.has(i))

        try {
            const res = await leadsAPI.createLeadsBulk(leadsToSave) as any
            if (res.success) {
                toast.success(`Successfully unlocked ${res.data.leads.length} leads!`)
                if (onLeadsUnlocked) onLeadsUnlocked(res.data.leads)
                onClose()
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to unlock leads')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-outfit">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`bg-white rounded-[2.5rem] w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ${step === 'results' ? 'max-w-6xl h-[90vh]' : 'max-w-2xl'}`}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">AI Lead Radar Wizard</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                {step === 'search' ? 'Define Target' : step === 'results' ? 'Market Results' : 'Analyzing'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                    {step === 'search' && (
                        <div className="space-y-8">
                            {/* Product Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">What are you exporting?</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Enter product name (e.g. Electric Bicycles)"
                                        className="w-full px-6 py-5 bg-white border-2 border-slate-100 focus:border-navy/50 rounded-[2rem] outline-none font-bold text-slate-700 transition-all text-xl shadow-sm group-hover:shadow-md"
                                        autoFocus
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                        {isSuggesting && <LoadingSpinner size="sm" />}
                                        <ShoppingBag className="text-slate-300" size={24} />
                                    </div>
                                </div>
                            </motion.div>

                            <AnimatePresence>
                                {searchTerm.length > 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-8 overflow-hidden"
                                    >
                                        {/* Industry Selection */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Target Buyer Industry</label>
                                                {isSuggesting && (
                                                    <span className="text-[10px] font-black text-navy/50 flex items-center gap-1.5 px-2 py-0.5 bg-navy/5 rounded-lg">
                                                        <Sparkles size={10} className="animate-pulse" />
                                                        AI ANALYZING...
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {isSuggesting && suggestions.industries.length === 0 ? (
                                                    [1, 2, 3].map(i => (
                                                        <div key={i} className="h-10 w-32 bg-slate-100 animate-pulse rounded-xl" />
                                                    ))
                                                ) : (
                                                    (suggestions.industries || []).map((ind, idx) => (
                                                        <motion.button
                                                            key={ind}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            onClick={() => setIndustry(ind)}
                                                            className={`px-5 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all ${industry === ind ? 'bg-navy border-navy text-white shadow-lg shadow-blue-100 scale-105' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}
                                                        >
                                                            {ind}
                                                        </motion.button>
                                                    ))
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={industry}
                                                    onChange={(e) => setIndustry(e.target.value)}
                                                    placeholder="Or type custom industry..."
                                                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 focus:border-navy/50 rounded-2xl outline-none font-bold text-slate-700 transition-all shadow-sm"
                                                />
                                                <Building2 className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                            </div>
                                        </div>

                                        {/* Market Selection */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recommended Markets</label>
                                                {isSuggesting && (
                                                    <span className="text-[10px] font-black text-navy/50 flex items-center gap-1.5 px-2 py-0.5 bg-navy/5 rounded-lg">
                                                        <Globe size={10} className="animate-pulse" />
                                                        SCANNING DEMAND...
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {isSuggesting && suggestions.markets.length === 0 ? (
                                                    [1, 2].map(i => (
                                                        <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-[1.5rem]" />
                                                    ))
                                                ) : (
                                                    suggestions.markets.map((m, idx) => (
                                                        <motion.button
                                                            key={m.country}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            onClick={() => {
                                                                setSelectedMarkets(prev => prev.includes(m.country) ? prev.filter(p => p !== m.country) : [...prev, m.country])
                                                            }}
                                                            className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all group ${selectedMarkets.includes(m.country) ? 'bg-navy/5/50 border-navy' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'}`}
                                                        >
                                                            <div className="flex items-center gap-4 text-left">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${selectedMarkets.includes(m.country) ? 'bg-navy' : 'bg-slate-50'}`}>
                                                                    {selectedMarkets.includes(m.country) ? <Check size={20} className="text-white" /> : <Globe size={20} className="text-slate-400" />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-slate-800 text-lg">{m.country}</div>
                                                                    <div className="text-xs font-bold text-slate-400 tracking-tight leading-relaxed max-w-sm">{m.reason}</div>
                                                                </div>
                                                            </div>
                                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedMarkets.includes(m.country) ? 'bg-navy border-navy text-white shadow-lg shadow-blue-100' : 'border-slate-200 bg-white'}`}>
                                                                {selectedMarkets.includes(m.country) && <Check size={16} />}
                                                            </div>
                                                        </motion.button>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRunDiscovery}
                                            disabled={!industry || selectedMarkets.length === 0}
                                            className="w-full py-6 bg-gradient-to-r from-navy to-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                                        >
                                            <Sparkles size={28} />
                                            Deep Scan Markets
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                            <div className="relative mb-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-40 h-40 border-[6px] border-slate-100 border-t-navy rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Radar size={56} className="text-navy animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4">Scanning Global Trade Data...</h3>
                            <p className="text-lg text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
                                Our AI is cross-referencing import records, company registries, and web signals in <strong>{selectedMarkets.join(', ')}</strong>.
                            </p>
                        </div>
                    )}

                    {step === 'results' && (
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-2xl font-black text-slate-900">Market Potential Matches</h3>
                                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-navy rounded-full"></div>
                                        <span className="text-sm font-bold text-slate-600">{selectedResults.size} selected</span>
                                    </div>
                                    <div className="h-4 w-[1px] bg-slate-200"></div>
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-bold text-slate-600">Locked Data</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6 pr-2">
                                <table className="w-full border-separate border-spacing-y-3">
                                    <thead className="sticky top-0 bg-white z-10 pb-4">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                                            <th className="px-6 py-2 w-12"><input type="checkbox" onChange={(e) => setSelectedResults(e.target.checked ? new Set(results.map((_, i) => i)) : new Set())} checked={selectedResults.size === results.length} className="w-5 h-5 rounded-lg" /></th>
                                            <th className="px-6 py-2">Company</th>
                                            <th className="px-6 py-2">Location</th>
                                            <th className="px-6 py-2">Contact Intelligence</th>
                                            <th className="px-6 py-2">Match Logic</th>
                                            <th className="px-6 py-2 text-right">Match</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((lead, idx) => (
                                            <motion.tr
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group transition-all ${selectedResults.has(idx) ? 'bg-navy/5/50' : 'hover:bg-slate-50/80 bg-slate-50/20'}`}
                                            >
                                                <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-slate-100">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedResults.has(idx)}
                                                        onChange={() => {
                                                            const next = new Set(selectedResults)
                                                            next.has(idx) ? next.delete(idx) : next.add(idx)
                                                            setSelectedResults(next)
                                                        }}
                                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-navy focus:ring-navy/50"
                                                    />
                                                </td>
                                                <td className="px-6 py-5 border-y border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-navy">
                                                            {lead.companyName[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-800">{lead.companyName}</div>
                                                            <div className="text-xs font-bold text-navy/50 uppercase">{lead.website || 'example.com'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 border-y border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">🌍</span>
                                                        <span className="text-sm font-bold text-slate-600">{lead.city && `${lead.city}, `}{lead.country}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 border-y border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="filter blur-[6px] grayscale select-none text-sm font-bold bg-slate-200 px-3 py-1 rounded-lg">
                                                            {lead.email || 'purchasing@company.com'}
                                                        </div>
                                                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">LOCKED</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 border-y border-slate-100 max-w-xs">
                                                    <p className="text-sm font-medium text-slate-500 leading-snug">{lead.logic || lead.reason}</p>
                                                </td>
                                                <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-slate-100 text-right">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs border border-emerald-100 shadow-sm">
                                                        {lead.aiScore || 95}%
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white shadow-2xl">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Price</span>
                                        <span className="text-2xl font-black">{selectedResults.size} <span className="text-sm text-slate-400 font-bold uppercase">Leads Quota</span></span>
                                    </div>
                                    <div className="h-10 w-[1px] bg-white/10"></div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Available</span>
                                        <span className="text-xl font-bold">{user?.subscription?.limits?.maxLeadsPerMonth ? (user.subscription.limits.maxLeadsPerMonth - (user.subscription.usage?.leadsUnlockedThisMonth || 0)) : 0} Remaining</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleUnlockLeads}
                                    disabled={loading || selectedResults.size === 0}
                                    className="px-10 py-4 bg-white text-navy rounded-[1.25rem] font-black text-lg hover:bg-navy/5 transition-all flex items-center gap-3 shadow-lg shadow-white/5 disabled:opacity-50"
                                >
                                    {loading ? <LoadingSpinner size="sm" /> : <>
                                        <Unlock size={20} />
                                        Unlock {selectedResults.size} Potential Buyers
                                    </>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
