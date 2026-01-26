
import { useState, useEffect } from 'react'
import { leadsAPI, authAPI, aiAPI } from '../../services/crm/api'
import toast from 'react-hot-toast'
import { Plus, Filter, Check, X, ChevronDown, ChevronUp, Sparkles, ShoppingBag, Globe, Building2, ChevronRight, Wand2 } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/crm/AuthContext'
import { useAISuggestions } from '../../hooks/crm/useAISuggestions'

interface AILeadDiscoveryProps {
    onLeadsDiscovered?: (leads: any[]) => void
    isOpen?: boolean
    onClose?: () => void
}

type DiscoveryStep = 'product' | 'industry' | 'markets' | 'loading' | 'results';

export default function AILeadDiscovery({ onLeadsDiscovered, isOpen: externalIsOpen, onClose }: AILeadDiscoveryProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const isControlled = externalIsOpen !== undefined
    const isOpen = isControlled ? externalIsOpen : internalIsOpen

    const [step, setStep] = useState<DiscoveryStep>('product');
    const [loading, setLoading] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        products: [] as string[],
        targetMarkets: [] as string[],
        industry: '',
        count: 20,
        groupName: ''
    })

    const [newProduct, setNewProduct] = useState('')
    const [newMarket, setNewMarket] = useState('');
    const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [expandedLead, setExpandedLead] = useState<number | null>(null);

    const { user } = useAuth();
    const { loading: suggesting, suggestions: aiSuggestions, fetchSuggestions, setSuggestions: setAiSuggestions } = useAISuggestions();

    const handleClose = () => {
        if (isControlled && onClose) {
            onClose()
        } else {
            setInternalIsOpen(false)
        }
        if (step === 'results' || step === 'loading') {
            setStep('product');
            setDiscoveredLeads([]);
        }
    }

    // Reset and Load Defaults every time modal opens
    useEffect(() => {
        if (isOpen && user) {
            // Reset Steps and Helper State
            setStep('product');
            setNewProduct('');
            setNewMarket('');
            setDiscoveredLeads([]);
            setAiSuggestions(null);

            // Fetch industry suggestions if products exist in portfolio
            const defaultProducts = (user as any).productGroups?.map((p: any) => p.name) || [];
            if (defaultProducts.length > 0) {
                fetchSuggestions('industry', defaultProducts.join(', '));
            }

            setFormData({
                products: defaultProducts,
                targetMarkets: (user as any).strategy?.targetCountries?.filter((c: any) => c.selected).map((c: any) => c.country) || [],
                industry: (user as any).icp?.targetIndustries?.[0]?.name || '',
                count: 20,
                groupName: ''
            });
        }
    }, [isOpen, user]);


    const handleNextStep = () => {
        if (step === 'product') {
            let currentProducts = [...formData.products];
            if (newProduct.trim() && !currentProducts.includes(newProduct.trim())) {
                currentProducts.push(newProduct.trim());
                setFormData(prev => ({ ...prev, products: currentProducts }));
                setNewProduct('');
            }

            if (currentProducts.length === 0) return toast.error('Please enter at least one product');
            fetchSuggestions('industry', currentProducts.join(', '));
            setStep('industry');
        } else if (step === 'industry') {
            if (!formData.industry) return toast.error('Please select or enter a target industry');
            setStep('markets');
        }
    };

    const handleDiscover = async () => {
        let currentMarkets = [...formData.targetMarkets];
        if (newMarket.trim() && !currentMarkets.includes(newMarket.trim())) {
            currentMarkets.push(newMarket.trim());
            setFormData(prev => ({ ...prev, targetMarkets: currentMarkets }));
        }

        if (currentMarkets.length === 0) {
            return toast.error('Please select at least one target market');
        }

        setLoading(true)
        setStep('loading')

        try {
            const response = (await leadsAPI.discoverLeads({
                ...formData,
                product: formData.products.join(', '), // Send as comma separated string for backward compat
                targetMarkets: currentMarkets,
                preview: true
            })) as any

            if (response.success && response.data && response.data.leads && response.data.leads.length > 0) {
                setDiscoveredLeads(response.data.leads);
                const allIndexes = new Set<number>(response.data.leads.map((_: any, i: number) => i));
                setSelectedLeads(allIndexes);
                setStep('results');
            } else {
                toast.error('No leads found. Try broader criteria.');
                setStep('markets');
            }
        } catch (error: any) {
            toast.error(error.message || 'Discovery failed');
            setStep('markets');
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSelected = async () => {
        if (selectedLeads.size === 0) return toast.error('Select at least one lead');
        setLoading(true);
        const leadsToSave = discoveredLeads.filter((_, i) => selectedLeads.has(i));
        try {
            const response = (await leadsAPI.createLeadsBulk(leadsToSave)) as any;
            if (response.success && response.data && response.data.leads) {
                toast.success(`Successfully saved ${response.data.leads.length} leads!`);
                if (onLeadsDiscovered) onLeadsDiscovered(response.data.leads);
                handleClose();
            } else {
                toast.error('Failed to save leads: No leads returned.');
            }
        } catch (error) {
            toast.error('Failed to save leads');
        } finally {
            setLoading(false);
        }
    };

    const toggleMarket = (market: string) => {
        setFormData(prev => ({
            ...prev,
            targetMarkets: prev.targetMarkets.includes(market)
                ? prev.targetMarkets.filter(m => m !== market)
                : [...prev.targetMarkets, market]
        }));
    };

    const visibleLeads = discoveredLeads.filter(lead => countryFilter === 'all' || lead.country === countryFilter);
    const countries = Array.from(new Set(discoveredLeads.map(l => l.country)));

    if (!isOpen) {
        if (isControlled) return null;
        return (
            <button
                onClick={() => setInternalIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy to-indigo-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg font-medium"
            >
                <ShoppingBag size={18} />
                Discover Leads
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-outfit">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-3xl w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${step === 'results' ? 'max-w-5xl h-[85vh]' : 'max-w-xl'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-navy p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Lead Discovery</h2>
                            <div className="flex items-center gap-2 mt-1">
                                {['product', 'industry', 'markets'].map((s, i) => (
                                    <div key={s} className={`h-1 rounded-full transition-all ${(i === 0 && step === 'product') ||
                                        (i === 1 && step === 'industry') ||
                                        (i === 2 && step === 'markets') ? 'w-8 bg-navy' : 'w-4 bg-gray-200'
                                        }`} />
                                ))}
                                <span className="text-xs text-gray-400 font-medium ml-2 uppercase tracking-wider">
                                    {step === 'results' ? 'Results' : 'Setup'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">

                    {/* STEP 1: PRODUCT */}
                    {step === 'product' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">What are you selling?</h3>
                                <p className="text-gray-500 mt-2">Enter your products or services to start discovery.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={newProduct}
                                            onChange={(e) => {
                                                setNewProduct(e.target.value);
                                                fetchSuggestions('industry', e.target.value);
                                            }}
                                            placeholder="e.g., Apple, Pear, Orange"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-navy/50 focus:bg-white rounded-2xl outline-none text-lg transition-all"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newProduct ? (setFormData(prev => ({ ...prev, products: [...prev.products, newProduct.trim()] })), setNewProduct('')) : handleNextStep())}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-navy">
                                            <Sparkles size={24} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { if (newProduct) { setFormData(prev => ({ ...prev, products: [...prev.products, newProduct.trim()] })); setNewProduct(''); } }}
                                        className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>

                                {formData.products.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                                            {formData.products.map((p, i) => (
                                                <span key={i} className="bg-navy/5 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-100">
                                                    {p}
                                                    <X size={14} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => setFormData(prev => ({ ...prev, products: prev.products.filter((_, idx) => idx !== i) }))} />
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, products: [] }))}
                                            className="text-xs text-slate-400 font-bold hover:text-red-500 transition-colors flex items-center gap-1"
                                        >
                                            <X size={12} /> Clear all products (Reset Search Context)
                                        </button>

                                        {/* Inline AI Suggestion for Step 1 */}
                                        {aiSuggestions && Array.isArray(aiSuggestions) && step === 'product' && (
                                            <div className="bg-navy/5/50 p-4 rounded-2xl border border-blue-100/50 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="text-[10px] font-black text-navy uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Sparkles size={12} /> AI Industry Match Suggestion
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(aiSuggestions as string[]).map(suggestion => (
                                                        <button
                                                            key={suggestion}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, industry: suggestion }));
                                                                handleNextStep();
                                                            }}
                                                            className="text-xs font-bold px-3 py-1.5 bg-white text-blue-700 rounded-lg border border-blue-100 hover:bg-navy hover:text-white transition-all shadow-sm"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleNextStep}
                                className="w-full py-4 bg-navy text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                            >
                                Continue to Industry
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: INDUSTRY */}
                    {step === 'industry' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Identify Target Industry</h3>
                                <p className="text-gray-500 mt-2">Who would be the most likely buyers for {formData.products.join(', ')}?</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Custom Industry</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => {
                                            setFormData({ ...formData, industry: e.target.value });
                                            fetchSuggestions('market', e.target.value, { product: formData.products.join(', ') });
                                        }}
                                        placeholder="Enter target industry..."
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-navy/50 focus:bg-white rounded-2xl outline-none transition-all"
                                    />
                                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Wand2 size={14} className="text-navy" />
                                    AI Suggestions
                                </label>
                                {suggesting ? (
                                    <div className="flex items-center gap-3 p-4 bg-navy/5 text-navy rounded-2xl border border-blue-100 italic font-medium">
                                        <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                                        Analyzing buyer behavior...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {Array.isArray(aiSuggestions) && aiSuggestions.map(ind => (
                                            typeof ind === 'string' && (
                                                <button
                                                    key={ind}
                                                    onClick={() => setFormData({ ...formData, industry: ind })}
                                                    className={`text-left px-5 py-3 rounded-2xl border transition-all flex items-center justify-between group ${formData.industry === ind ? 'bg-navy border-navy text-white shadow-lg' : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-navy/5'
                                                        }`}
                                                >
                                                    <span className="font-medium">{ind}</span>
                                                    {formData.industry === ind ? <Check size={18} /> : <Plus size={18} className="text-gray-300 group-hover:text-blue-400" />}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleNextStep}
                                className="w-full py-4 bg-navy text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                            >
                                Continue to Markets
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* STEP 3: MARKETS */}
                    {step === 'markets' && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Choose Regions</h3>
                                <p className="text-gray-500 mt-2">Select countries where you want to find buyers.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Add Country</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMarket}
                                        onChange={(e) => setNewMarket(e.target.value)}
                                        placeholder="Type country name..."
                                        className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-navy/50 focus:bg-white rounded-2xl outline-none transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), toggleMarket(newMarket), setNewMarket(''))}
                                    />
                                    <button
                                        onClick={() => { if (newMarket) { toggleMarket(newMarket); setNewMarket(''); } }}
                                        className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                                {formData.targetMarkets.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {formData.targetMarkets.map(m => (
                                            <span key={m} className="bg-navy text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm animate-in fade-in scale-in">
                                                {m}
                                                <X size={14} className="cursor-pointer" onClick={() => toggleMarket(m)} />
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Globe size={14} className="text-navy" />
                                    Recommended Regions
                                </label>
                                {suggesting ? (
                                    <div className="flex items-center gap-3 p-4 bg-navy/5 text-navy rounded-2xl border border-blue-100 italic font-medium">
                                        <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                                        Analyzing global trade routes...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {Array.isArray(aiSuggestions) && aiSuggestions.map(m => (
                                            typeof m === 'object' && m !== null && 'country' in m && (
                                                <button
                                                    key={m.country}
                                                    onClick={() => toggleMarket(m.country)}
                                                    className={`text-left px-5 py-3 rounded-2xl border transition-all flex items-center justify-between group ${formData.targetMarkets.includes(m.country) ? 'bg-navy border-navy text-white shadow-lg' : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-navy/5'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="font-bold">{m.country}</div>
                                                        <div className={`text-xs mt-0.5 line-clamp-1 ${formData.targetMarkets.includes(m.country) ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            {m.reason}
                                                        </div>
                                                    </div>
                                                    {formData.targetMarkets.includes(m.country) ? <Check size={18} /> : <Plus size={18} className="text-gray-300 group-hover:text-blue-400" />}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleDiscover}
                                disabled={formData.targetMarkets.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-navy to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Sparkles size={20} />
                                {loading ? 'Analyzing Market...' : `Find Buyers in ${formData.targetMarkets.join(', ')}`}
                            </button>
                        </div>
                    )}

                    {/* LOADING STATE */}
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="relative mb-10">
                                <div className="w-32 h-32 border-4 border-blue-100 border-t-navy rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Wand2 size={40} className="text-navy animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Searching Global Databases</h3>
                            <p className="text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
                                Our AI is scanning real-world trade data and company lists in <strong>{formData.targetMarkets.join(', ')}</strong> to find the perfect matches for you.
                            </p>
                        </div>
                    )}

                    {/* STEP 4: RESULTS */}
                    {step === 'results' && (
                        <div className="space-y-6">
                            {/* Filter Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                                        <Filter size={16} className="text-gray-400" />
                                        <select
                                            value={countryFilter}
                                            onChange={(e) => setCountryFilter(e.target.value)}
                                            className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none"
                                        >
                                            <option value="all">All Countries</option>
                                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">
                                        {visibleLeads.length} leads matching filters
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedLeads(selectedLeads.size === visibleLeads.length ? new Set() : new Set(visibleLeads.map((_, i) => i)))}
                                        className="text-sm font-bold text-navy hover:underline"
                                    >
                                        {selectedLeads.size === visibleLeads.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>

                            {/* Results Table-like Cards */}
                            <div className="grid grid-cols-1 gap-4">
                                {visibleLeads.map((lead, idx) => {
                                    const globalIndex = discoveredLeads.indexOf(lead);
                                    const isSelected = selectedLeads.has(globalIndex);
                                    const isExpanded = expandedLead === globalIndex;

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-6 bg-white border-2 rounded-3xl transition-all cursor-pointer ${isSelected ? 'border-navy shadow-xl shadow-navy/5' : 'border-gray-50 hover:border-blue-100 hover:shadow-lg hover:shadow-navy/5/20'
                                                }`}
                                            onClick={() => setExpandedLead(isExpanded ? null : globalIndex)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); const next = new Set(selectedLeads); isSelected ? next.delete(globalIndex) : next.add(globalIndex); setSelectedLeads(next); }}
                                                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-navy border-navy text-white' : 'border-gray-200'
                                                        }`}
                                                >
                                                    {isSelected && <Check size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900">{lead.companyName}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm text-gray-500 font-medium">📍 {lead.city}, {lead.country}</span>
                                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${lead.aiScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {lead.aiScore || 90}% AI MATCH
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                                    </div>

                                                    {!isExpanded && (
                                                        <p className="mt-3 text-sm text-gray-500 line-clamp-1 italic italic leading-relaxed">
                                                            {lead.logic || lead.reason}
                                                        </p>
                                                    )}

                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="mt-6 pt-6 border-t border-gray-100 space-y-4"
                                                            >
                                                                <div>
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">AI Analysis</label>
                                                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{lead.logic || lead.reason}</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-6">
                                                                    <div>
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Website</label>
                                                                        <a href={lead.website} target="_blank" className="text-navy font-bold text-sm hover:underline">{lead.website || 'N/A'}</a>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contact</label>
                                                                        <span className="text-gray-700 font-bold text-sm">{lead.email || 'N/A'}</span>
                                                                        {lead.emailSource === 'predicted' && <span className="ml-2 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">AI Predicted</span>}
                                                                    </div>
                                                                </div>
                                                                {lead.potentialProducts && (
                                                                    <div>
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">They might also need</label>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {lead.potentialProducts.map((p: any) => (
                                                                                <span key={p} className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold border border-gray-100">{p}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        {['industry', 'markets'].includes(step) && (
                            <button onClick={() => setStep(step === 'industry' ? 'product' : 'industry')} className="text-gray-500 font-bold hover:text-gray-900 px-4">
                                Back
                            </button>
                        )}
                        {step === 'results' && (
                            <button onClick={() => setStep('markets')} className="text-gray-500 font-bold hover:text-gray-900 px-4">
                                Refine Search
                            </button>
                        )}
                    </div>
                    <div>
                        {step === 'results' && (
                            <button
                                onClick={handleSaveSelected}
                                disabled={loading || selectedLeads.size === 0}
                                className="px-10 py-4 bg-navy text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <LoadingSpinner size="sm" /> : (
                                    <>
                                        Add {selectedLeads.size} Selected Leads
                                        <Check size={20} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
