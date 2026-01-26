
import {
    X, Building2, Globe, Mail, MapPin, Tag, StickyNote, Sparkles, Lightbulb, Shield,
    Factory, Ship, ArrowRight, TrendingUp, DollarSign, Package, AlertTriangle, Scale, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { leadsAPI } from '../../services/crm/api'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'
import SupplyChainIntelModal from './SupplyChainIntelModal'

interface LeadModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    initialData?: any
}

export default function LeadModal({ isOpen, onClose, onSuccess, initialData }: LeadModalProps) {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'general' | 'intel'>('general')
    const [formData, setFormData] = useState({
        companyName: '',
        website: '',
        email: '',
        country: '',
        city: '',
        industry: '',
        notes: '',
        aiReasoning: '',
        potentialProducts: [] as string[],
        emailSource: 'manual',
        validationStatus: 'unknown'
    })
    const [showFullIntel, setShowFullIntel] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                companyName: initialData.companyName || '',
                website: initialData.website || '',
                email: initialData.email || '',
                country: initialData.country || '',
                city: initialData.city || '',
                industry: initialData.industry || '',
                notes: initialData.notes || '',
                aiReasoning: initialData.aiReasoning || '',
                potentialProducts: initialData.potentialProducts || [],
                emailSource: initialData.emailSource || 'manual',
                validationStatus: initialData.validationStatus || 'unknown'
            })
            setActiveTab('general')
        } else {
            setFormData({
                companyName: '',
                website: '',
                email: '',
                country: '',
                city: '',
                industry: '',
                notes: '',
                aiReasoning: '',
                potentialProducts: [],
                emailSource: 'manual',
                validationStatus: 'unknown'
            })
            setActiveTab('general')
        }
    }, [initialData, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (initialData) {
                await leadsAPI.updateLead(initialData.id, formData)
                toast.success('Lead updated successfully!')
            } else {
                await leadsAPI.createLead({
                    ...formData,
                    status: 'new',
                    source: 'manual',
                    aiScore: 0
                })
                toast.success('Lead created successfully!')
            }

            onClose()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.response?.data?.error || `Failed to ${initialData ? 'update' : 'create'} lead`)
        } finally {
            setLoading(false)
        }
    }

    const getCountryFlag = (country: string) => {
        const flags: Record<string, string> = {
            'Turkey': '🇹🇷',
            'China': '🇨🇳',
            'India': '🇮🇳',
            'USA': '🇺🇸',
            'United States': '🇺🇸',
            'Germany': '🇩🇪',
            'Italy': '🇮🇹',
            'France': '🇫🇷',
            'Spain': '🇪🇸',
            'UK': '🇬🇧',
            'United Kingdom': '🇬🇧',
            'Russia': '🇷🇺',
            'Japan': '🇯🇵',
            'South Korea': '🇰🇷',
        }
        return flags[country] || '🌐'
    }

    const getLogoUrl = (website?: string) => {
        if (!website) return null
        try {
            const domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
            return `https://logo.clearbit.com/${domain}`
        } catch {
            return null
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-outfit">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${initialData ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-200 border-slate-300'}`}>
                            {initialData && getLogoUrl(formData.website) ? (
                                <img
                                    src={getLogoUrl(formData.website)!}
                                    alt={formData.companyName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-slate-400 font-black text-2xl">' + formData.companyName.charAt(0) + '</div>';
                                    }}
                                />
                            ) : (
                                <Building2 className={`w-8 h-8 ${initialData ? 'text-navy' : 'text-slate-500'}`} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                {initialData ? formData.companyName : 'Add New Lead'}
                            </h2>
                            <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                {initialData ? (
                                    <>
                                        <span>{getCountryFlag(formData.country)}</span>
                                        {formData.country}
                                    </>
                                ) : 'Manually add prospect'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-slate-100 bg-white">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-navy text-navy' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        General Info
                    </button>
                    {initialData && (
                        <button
                            onClick={() => setActiveTab('intel')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'intel' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" /> Supply Chain Intel
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                {/* AI Insights Section */}
                                {(formData.aiReasoning || formData.potentialProducts.length > 0) && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-navy/5 p-6 rounded-2xl border border-indigo-100 space-y-4 shadow-sm">
                                        <div className="flex items-center justify-between text-indigo-700 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={18} />
                                                <h3>AI Match Analysis</h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!initialData) return;
                                                    setLoading(true);
                                                    try {
                                                        const res: any = await leadsAPI.enrichLead(initialData.id);
                                                        if (res.success) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                aiReasoning: res.data.matchSummary,
                                                                potentialProducts: res.data.potentialUseCases
                                                            }));
                                                            toast.success('AI Analysis refreshed!');
                                                        }
                                                    } catch (e) {
                                                        toast.error('Failed to refresh AI analysis.');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="text-[10px] uppercase tracking-widest bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors"
                                            >
                                                Refresh Match
                                            </button>
                                        </div>

                                        {formData.aiReasoning && (
                                            <div className="space-y-3">
                                                <div>
                                                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-1 opacity-70">Strategic Reasoning</h4>
                                                    <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                                                        "{formData.aiReasoning}"
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-white/50 rounded-xl border border-indigo-100/50">
                                                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Suggested Sales Angle</h4>
                                                    <p className="text-xs text-indigo-700 font-bold italic">
                                                        "Focus on their recent activity in {formData.industry} and position turkey's logistical speed as a solution to their current local supply constraints."
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {formData.potentialProducts.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1 opacity-70">
                                                    <Lightbulb size={12} />
                                                    Product Recommendations
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.potentialProducts.map((prod, i) => (
                                                        <span key={i} className="group px-3 py-1.5 bg-white text-indigo-600 border border-indigo-200/50 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2">
                                                            {prod}
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({
                                                                    ...prev,
                                                                    potentialProducts: prev.potentialProducts.filter((_, idx) => idx !== i)
                                                                }))}
                                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Company Details</h3>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy/50 outline-none font-medium"
                                                placeholder="e.g. Acme Corp"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Website</label>
                                            <div className="relative">
                                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="url"
                                                    value={formData.website}
                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy/50 outline-none font-medium"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Industry</label>
                                            <input
                                                type="text"
                                                value={formData.industry}
                                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy/50 outline-none font-medium"
                                                placeholder="e.g. Manufacturing"
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Contact Info</h3>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy/50 outline-none font-medium"
                                                    placeholder="contact@company.com"
                                                />
                                            </div>
                                            {formData.emailSource !== 'manual' && (
                                                <div className="flex gap-2 mt-2">
                                                    <div className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1.5 font-bold ${formData.emailSource === 'predicted' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
                                                        {formData.emailSource === 'predicted' ? <Sparkles size={10} /> : <Shield size={10} />}
                                                        <span className="capitalize">{formData.emailSource} Email</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    value={formData.country}
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy/50 outline-none font-medium"
                                                    placeholder="e.g. USA"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy/50 outline-none font-medium"
                                                    placeholder="e.g. New York"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'intel' && (
                            <div className="space-y-6">
                                <IntelTabContent lead={initialData} onOpenFull={() => setShowFullIntel(true)} />
                            </div>
                        )}

                        <SupplyChainIntelModal
                            isOpen={showFullIntel}
                            onClose={() => setShowFullIntel(false)}
                            lead={initialData}
                        />

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <LoadingSpinner size="sm" className="text-white" />}
                        {loading ? 'Saving...' : 'Save Lead'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

function IntelTabContent({ lead, onOpenFull }: { lead: any; onOpenFull: () => void }) {
    const [loading, setLoading] = useState(true);
    const [intel, setIntel] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIntel = async () => {
            try {
                setLoading(true);
                setError(null);
                const response: any = await leadsAPI.getSupplyChainIntel(lead.id);
                if (response.success && response.data && response.data.competitor) {
                    setIntel(response.data);
                } else {
                    setError('Could not generate intelligence for this route.');
                }
            } catch (err) {
                console.error('Intel Error:', err);
                setError('Service temporarily unavailable.');
            } finally {
                setLoading(false);
            }
        };
        if (lead?.id) fetchIntel();
    }, [lead?.id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-500 font-bold text-sm">Analyzing supply chain routes...</p>
        </div>
    );

    if (error || !intel || !intel.competitor) return (
        <div className="p-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Analysis Incomplete</h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    AI couldn't generate the competitive analysis. Please check your **Gemini API Key** in .env or try manual configuration.
                </p>
            </div>
            <button
                type="button"
                onClick={onOpenFull}
                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg"
            >
                <Zap className="w-4 h-4 text-yellow-400" />
                Configure Strategy Manually
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Ship className="w-20 h-20" />
                </div>
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Strategic Logistics Analysis</h3>
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Dominant Competitor ({intel.competitor.name})</p>
                        <p className="font-bold">~{intel.competitor.transit_time_days} Days</p>
                    </div>
                    <ArrowRight className="text-slate-600" />
                    <div className="flex-1 text-right">
                        <p className="text-[10px] font-black text-emerald-400 uppercase">Direct from {intel.user?.origin_country || 'Turkey'}</p>
                        <p className="font-bold">~{intel.user?.transit_time_days || 12} Days</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onOpenFull}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-navy/5 transition-all flex items-center justify-center gap-2"
                >
                    <Zap className="w-5 h-5 text-navy" />
                    Open Strategic AI Matrix
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-navy/5 rounded-2xl border border-blue-100 italic text-blue-800 text-sm font-medium">
                    "Leverage the {intel.user?.transit_time_days || 12}-day lead time to undercut {intel.competitor.name}'s long-haul risk."
                </div>
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 italic text-purple-800 text-sm font-medium">
                    "Strategy: {intel.user?.suggested_strategy || 'Faster Delivery'} to solve {intel.competitor.likely_pain_point || 'Supply Chain Risk'}."
                </div>
            </div>
        </div>
    );
}
