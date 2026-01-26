import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Building, Key, CreditCard, Save, Tag, X, Plus, Package, Upload,
  Loader2, Briefcase, Layers, Search, Trophy, Factory, FileText, ChevronDown,
  ChevronUp, Brain, Cpu, Zap, Network, Fingerprint, Gauge, Lightbulb, CheckCircle2,
  ShieldCheck, Globe, Sparkles, Check, RefreshCw, Link
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI, authAPI, uploadAPI, aiAPI, settingsAPI, productsAPI } from '../../services/crm/api';
import { useQuery } from '@tanstack/react-query';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: userResponse, refetch, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser
  });

  const user = userResponse?.data?.user;
  const [activeTab, setActiveTab] = useState<'persona' | 'knowledge' | 'api' | 'billing'>('persona');

  // Hero collapse state
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(() => {
    const saved = localStorage.getItem('settingsHeroCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('settingsHeroCollapsed', JSON.stringify(isHeroCollapsed));
  }, [isHeroCollapsed]);

  const [formData, setFormData] = useState({
    profile: {
      senderName: '',
      jobTitle: '',
      companyName: '',
      industry: '',
      language: 'English' as 'English' | 'Turkish' | 'German',
      logoUrl: '',
      signature: '',
    },
    aiPersona: {
      tone: 'professional' as 'professional' | 'friendly' | 'aggressive',
    },
    apiKeys: {
      gemini: '',
      resend: '',
    },
    integrations: {
      smtp: {
        host: '',
        port: 587,
        user: '',
        pass: '',
      },
      crm: {
        salesforce: { connected: false },
        hubspot: { connected: false },
        zoho: { connected: false },
      },
    },
    portfolio: {
      products: [] as Array<{
        id: string;
        name: string;
        hsCode: string;
        certificates: string[];
        capacity?: string;
        usp?: string;
        trainingScore: number;
      }>
    }
  });

  const [productSearch, setProductSearch] = useState('');
  const [hsSuggestions, setHsSuggestions] = useState<any[]>([]);
  const [isSearchingHs, setIsSearchingHs] = useState(false);
  const [showHsDropdown, setShowHsDropdown] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    hsCode: '',
    certificates: [] as string[],
    capacity: '',
    usp: ''
  });

  const availableCertificates = ['ISO 9001', 'ISO 14001', 'CE', 'FDA', 'Halal', 'Kosher', 'GMP', 'REACH', 'OEKO-TEX'];
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verifyingApi, setVerifyingApi] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  // Training Score Calculation & Animation Logic
  const trainingScore = useMemo(() => {
    if (!user) return 0;
    const productsCount = user.portfolio?.products?.length || 0;
    const score = Math.min(100, Math.round(
      (productsCount * 15) +
      (user.profile?.logoUrl ? 10 : 0) +
      (user.profile?.companyName ? 10 : 0) +
      (user.apiKeys?.gemini ? 20 : 0)
    ));
    return score;
  }, [user]);

  const [brainPulse, setBrainPulse] = useState(false);
  const prevScoreRef = useRef(trainingScore);

  useEffect(() => {
    if (trainingScore > prevScoreRef.current) {
      setBrainPulse(true);
      const timer = setTimeout(() => setBrainPulse(false), 1000);
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = trainingScore;
  }, [trainingScore]);

  const getLogoUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    return `${baseUrl}${path}`;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const formDataFile = new FormData();
    formDataFile.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = (await uploadAPI.uploadLogo(formDataFile)) as any;
      if (res.success && res.data.url) {
        setFormData(prev => ({
          ...prev,
          profile: { ...prev.profile, logoUrl: res.data.url }
        }));
        // Auto update profile logo
        await settingsAPI.updateProfile({ profile: { logoUrl: res.data.url } });
        toast.success('Logo uploaded and AI vision updated!');
        refetch();
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        profile: {
          senderName: user.profile?.senderName || user.name || '',
          jobTitle: user.profile?.jobTitle || user.jobTitle || '',
          companyName: user.profile?.companyName || user.company || '',
          industry: user.profile?.industry || user.industry || '',
          language: (user.profile?.language || user.preferredLanguage || 'English') as any,
          logoUrl: user.profile?.logoUrl || user.logo || '',
          signature: user.profile?.signature || '',
        },
        aiPersona: {
          tone: (user.aiPersona?.tone || 'professional') as any,
        },
        apiKeys: {
          gemini: user.apiKeys?.gemini || '',
          resend: user.apiKeys?.resend || '',
        },
        integrations: {
          smtp: user.integrations?.smtp || { host: '', port: 587, user: '', pass: '' },
          crm: user.integrations?.crm || { salesforce: { connected: false }, hubspot: { connected: false }, zoho: { connected: false } },
        },
        portfolio: {
          products: user.portfolio?.products || []
        }
      });
    }
  }, [user]);

  const handleRestartOnboarding = async () => {
    if (!window.confirm('This will restart the setup wizard. Continue?')) return;

    try {
      setIsSaving(true);
      await settingsAPI.restartOnboarding();
      toast.success('Redirecting to Setup Wizard...');
      setTimeout(() => navigate('/onboarding'), 1000);
    } catch (error) {
      toast.error('Failed to reset onboarding state');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await settingsAPI.updateProfile({
        profile: formData.profile,
        aiPersona: formData.aiPersona
      });
      toast.success('AI Persona Updated Successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to update persona');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateIntegrations = async () => {
    setIsSaving(true);
    setVerifyingApi(true);
    try {
      await settingsAPI.updateIntegrations({
        apiKeys: formData.apiKeys,
        integrations: formData.integrations
      });
      toast.success('Connections saved successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to save connections');
    } finally {
      setIsSaving(false);
      setVerifyingApi(false);
    }
  };

  const handleTestSmtp = async () => {
    const { host, port, user: smtpUser, pass } = formData.integrations.smtp;
    if (!host || !port || !smtpUser || !pass) {
      toast.error('Please fill in all SMTP fields before testing');
      return;
    }
    setIsTestingSmtp(true);
    try {
      const res = await settingsAPI.testSmtp({ host, port, user: smtpUser, pass }) as any;
      if (res.data?.success || res.success) {
        toast.success(res.data?.message || 'SMTP Verified Successfully!', { icon: '📧' });
        refetch(); // To update the verified status
      } else {
        toast.error(res.data?.error || 'SMTP Test failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed. Check credentials/firewall.');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleCrmToggle = async (crm: 'salesforce' | 'hubspot' | 'zoho') => {
    const isConnected = formData.integrations.crm[crm].connected;
    if (!isConnected) {
      // Simulation: normally would open OAuth
      toast.success(`Connecting to ${crm.charAt(0).toUpperCase() + crm.slice(1)}...`);
      const updatedIntegrations = {
        ...formData.integrations,
        crm: {
          ...formData.integrations.crm,
          [crm]: { connected: true }
        }
      };
      setFormData(prev => ({ ...prev, integrations: updatedIntegrations }));
      await settingsAPI.updateIntegrations({ integrations: updatedIntegrations });
      toast.success('Connected successfully');
      refetch();
    } else {
      const updatedIntegrations = {
        ...formData.integrations,
        crm: {
          ...formData.integrations.crm,
          [crm]: { connected: false }
        }
      };
      setFormData(prev => ({ ...prev, integrations: updatedIntegrations }));
      await settingsAPI.updateIntegrations({ integrations: updatedIntegrations });
      toast('Disconnected', { icon: '🔌' });
      refetch();
    }
  }

  // HS Code Search
  useEffect(() => {
    const searchHs = async () => {
      if (productSearch.length < 2) {
        setHsSuggestions([]);
        return;
      }
      setIsSearchingHs(true);
      try {
        const res = await aiAPI.searchHsCodes(productSearch);
        setHsSuggestions(res.data?.codes || []);
        setShowHsDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingHs(false);
      }
    };
    const timeout = setTimeout(searchHs, 500);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  const addProductGroup = async () => {
    if (!newProduct.name || !newProduct.hsCode) {
      toast.error('Please enter product name and HS Code');
      return;
    }
    try {
      setIsSaving(true);
      await settingsAPI.addProduct(newProduct);
      setNewProduct({ name: '', hsCode: '', certificates: [], capacity: '', usp: '' });
      setProductSearch('');
      toast.success('Product taught to AI Brain!', { icon: '🧠' });
      refetch();
    } catch (error) {
      toast.error('Failed to add product');
    } finally {
      setIsSaving(false);
    }
  };

  const removeProductGroup = async (id: string) => {
    try {
      await productsAPI.deleteProduct(id);
      toast.success('Product removed');
      refetch();
    } catch (error) {
      toast.error('Failed to remove product');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-outfit">

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

        {/* 1. Header: System Brain (Collapsible Hero) */}
        <motion.div
          variants={item}
          animate={{ padding: isHeroCollapsed ? "1rem 2rem" : "2rem" }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] text-white relative overflow-hidden shadow-xl transition-all duration-300"
        >
          <button
            onClick={() => setIsHeroCollapsed(!isHeroCollapsed)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-50 backdrop-blur-md transition-colors"
          >
            {isHeroCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          {/* Background Neural Network Effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
              <path d="M0,200 Q200,100 400,200 T800,200" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10" className="animate-[dash_20s_linear_infinite]" />
              <path d="M0,200 Q200,300 400,200 T800,200" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
              <circle cx="400" cy="200" r="100" fill="url(#grad1)" filter="url(#glow)" opacity="0.3" />
              <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(100,100,255)', stopOpacity: 0 }} />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            </svg>
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {isHeroCollapsed ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex items-center gap-4 h-10"
                >
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight">SYSTEM BRAIN</h1>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
                      <Cpu className="w-4 h-4 text-cyan-300" />
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">AI Configuration Center</span>
                    </div>
                    <h1 className="text-4xl font-black mb-3">System Brain</h1>
                    <p className="text-lg text-indigo-100 max-w-2xl font-medium leading-relaxed">
                      Manage your AI persona, product knowledge, and API connections to power your autonomous sales engine.
                    </p>
                  </div>

                  {/* Brain Health Widget */}
                  <div className="hidden lg:block bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl min-w-[200px] text-center">
                    <div className="flex justify-center mb-2">
                      <div className={`relative transition-transform duration-300 ${brainPulse ? 'scale-125' : ''}`}>
                        <Brain className={`w-10 h-10 ${trainingScore > 70 ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-500`} />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ${trainingScore > 70 ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-ping'}`}></div>
                      </div>
                    </div>
                    <div className={`text-3xl font-black transition-all duration-300 ${brainPulse ? 'text-white scale-110' : 'text-white'}`}>
                      {trainingScore}%
                    </div>
                    <div className="text-xs uppercase tracking-wider font-bold text-indigo-200 mt-1">Brain Trained</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'persona', icon: Fingerprint, label: 'Identity & AI Persona' },
            { id: 'knowledge', icon: DatabaseIcon, label: 'Product Knowledge Base' },
            { id: 'api', icon: Network, label: 'Neural Connections' },
            { id: 'billing', icon: CreditCard, label: 'Billing & Usage' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-violet-600 shadow-lg scale-105 border border-violet-100'
                : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-12">
            <AnimatePresence mode="wait">

              {/* 1. Identity & AI Persona */}
              {activeTab === 'persona' && (
                <motion.div
                  key="persona"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Fingerprint className="w-8 h-8 text-violet-500" />
                        Identity & AI Persona
                      </h2>
                      <p className="text-slate-500 mt-1 font-medium">Define who the AI is when it speaks to your customers.</p>
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Update Persona
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* Logo & Branding */}
                      <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                            {formData.profile.logoUrl ? (
                              <img src={getLogoUrl(formData.profile.logoUrl)} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                              <Building className="w-10 h-10 text-slate-300" />
                            )}
                            {uploadingLogo && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 p-2 bg-violet-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-violet-700 transition-transform hover:scale-110">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          </label>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Corporate Identity</h4>
                          <p className="text-xs text-slate-500 max-w-[200px] mb-2">Upload visual identity. AI uses this for generating branded reports.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Sender Name</label>
                          <input
                            value={formData.profile.senderName}
                            onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, senderName: e.target.value } })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                          <input
                            value={formData.profile.jobTitle}
                            onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, jobTitle: e.target.value } })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                            placeholder="e.g. Sales Director"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tone of Voice (AI Personality)</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['professional', 'friendly', 'aggressive'].map(tone => (
                            <button
                              key={tone}
                              onClick={() => setFormData({ ...formData, aiPersona: { ...formData.aiPersona, tone: tone as any } })}
                              className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all capitalize ${formData.aiPersona.tone === tone
                                ? 'border-violet-500 bg-violet-50 text-violet-700'
                                : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                          This affects how the AI writes emails and handles objections.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                        <input
                          value={formData.profile.companyName}
                          onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, companyName: e.target.value } })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                        <input
                          value={formData.profile.industry}
                          onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, industry: e.target.value } })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                          placeholder="e.g. Textile Manufacturing"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Website Language</label>
                        <select
                          value={formData.profile.language}
                          onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, language: e.target.value as any } })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                        >
                          <option value="English">English</option>
                          <option value="Turkish">Turkish</option>
                          <option value="German">German</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Signature</label>
                        <textarea
                          value={formData.profile.signature}
                          onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, signature: e.target.value } })}
                          placeholder="Your professional signature... AI will append this to all outgoing emails."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all h-24 resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 md:col-span-2">
                      <div className="flex items-center justify-between p-6 bg-amber-50 rounded-3xl border border-amber-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                            <RefreshCw className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">Setup Wizard</h4>
                            <p className="text-sm text-slate-500 font-medium">Want to re-configure your AI from scratch? Restart the onboarding process.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRestartOnboarding}
                          className="px-6 py-3 bg-white text-amber-700 border border-amber-200 rounded-xl font-bold hover:bg-amber-100 transition-colors shadow-sm"
                        >
                          Restart Onboarding
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. Knowledge Base (Portfolio) */}
              {activeTab === 'knowledge' && (
                <motion.div
                  key="knowledge"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Package className="w-8 h-8 text-navy/50" />
                        Product Knowledge Base
                      </h2>
                      <p className="text-slate-500 mt-1 font-medium">Teach AI what you sell. The more details, the better it sells.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold">Training Score: {trainingScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Add New Product Form */}
                    <div className="xl:col-span-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                      <h3 className="text-lg font-black text-slate-900 mb-6 relative z-10 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-navy" /> Teach New Product
                      </h3>

                      <div className="space-y-4 relative z-10">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">HS Code / Product Name</label>
                          <div className="relative">
                            <input
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              placeholder="Focus input to search HS..."
                              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-bold placeholder:font-medium focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                            {isSearchingHs && <div className="absolute right-3 top-3"><Loader2 className="w-5 h-5 animate-spin text-navy/50" /></div>}
                            {/* Suggestions Dropdown (Simplified) */}
                            {showHsDropdown && hsSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                                {hsSuggestions.map((hs: any, i) => (
                                  <div
                                    key={i}
                                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                    onClick={() => {
                                      setNewProduct({ ...newProduct, hsCode: hs.code, name: hs.description });
                                      setProductSearch(hs.code);
                                      setShowHsDropdown(false);
                                    }}
                                  >
                                    <div className="font-bold text-navy">{hs.code}</div>
                                    <div className="text-xs text-slate-600">{hs.description}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Certificates</label>
                            <div className="flex flex-wrap gap-2">
                              {availableCertificates.slice(0, 4).map(cert => (
                                <span
                                  key={cert}
                                  onClick={() => {
                                    const exists = newProduct.certificates.includes(cert);
                                    setNewProduct({
                                      ...newProduct,
                                      certificates: exists ? newProduct.certificates.filter(c => c !== cert) : [...newProduct.certificates, cert]
                                    })
                                  }}
                                  className={`text-[10px] px-2 py-1 rounded-lg cursor-pointer border font-bold ${newProduct.certificates.includes(cert)
                                    ? 'bg-navy text-white border-navy'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Capacity</label>
                            <input
                              value={newProduct.capacity}
                              onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
                              placeholder="e.g. 500k/mo"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Unique Selling Point (USP)</label>
                          <input
                            value={newProduct.usp}
                            onChange={(e) => setNewProduct({ ...newProduct, usp: e.target.value })}
                            placeholder="e.g. Fastest delivery in 24h"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                          />
                        </div>

                        <button
                          onClick={addProductGroup}
                          className="w-full py-4 bg-gradient-to-r from-navy to-indigo-600 text-white rounded-xl font-black shadow-lg shadow-navy/50/30 hover:shadow-navy/50/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                          <Brain className="w-5 h-5" />
                          Train AI on This Product
                        </button>
                      </div>
                    </div>

                    {/* Right: Product List */}
                    <div className="xl:col-span-2 space-y-4">
                      {formData.portfolio.products.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-slate-400">Knowledge Base Empty</h3>
                          <p className="text-slate-400">Add products to start training your AI sales agent.</p>
                        </div>
                      ) : (
                        formData.portfolio.products.map((product, idx) => (
                          <div key={product.id || idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center text-navy font-black text-sm">
                                {product.hsCode.slice(0, 4)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{product.name || 'Unnamed Product'}</h4>
                                <div className="flex gap-2 mt-1">
                                  {product.certificates.map(c => (
                                    <span key={c} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded-md font-medium border border-green-100">{c}</span>
                                  ))}
                                  {product.capacity && <span className="text-[10px] px-1.5 py-0.5 bg-navy/5 text-blue-700 rounded-md font-medium border border-blue-100">{product.capacity}</span>}
                                  {product.usp && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold border border-amber-100 flex items-center gap-1"><Zap className="w-2 h-2" /> USP: {product.usp}</span>}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeProductGroup(product.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. Neural Connections (API & CRM) */}
              {activeTab === 'api' && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Network className="w-8 h-8 text-cyan-500" />
                        Neural Connections
                      </h2>
                      <p className="text-slate-500 mt-1 font-medium">Connect your AI brain to external capabilities.</p>
                    </div>
                    <button
                      onClick={handleUpdateIntegrations}
                      disabled={isSaving}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {verifyingApi ? "Verifying..." : "Saving..."}
                        </div>
                      ) : (
                        <>
                          <Save className="w-5 h-5" /> Save Connections
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200 relative group transition-all hover:bg-white hover:shadow-xl hover:border-cyan-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <Brain className="w-6 h-6 text-cyan-500" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900">Reasoning Engine</h3>
                            <div className="text-xs font-bold text-slate-400">Google Gemini Flash</div>
                          </div>
                        </div>
                        {(formData.apiKeys.gemini || verifyingApi) && (
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ring-1 transition-all ${verifyingApi ? 'bg-yellow-100 text-yellow-700 ring-yellow-200' : 'bg-green-100 text-green-700 ring-green-200 animate-pulse'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${verifyingApi ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></span>
                            {verifyingApi ? "Testing..." : "Live"}
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="password"
                          value={formData.apiKeys.gemini}
                          onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, gemini: e.target.value } })}
                          className="w-full pl-10 pr-4 py-4 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-cyan-200 outline-none transition-shadow group-hover:shadow-inner"
                          placeholder="sk-..."
                        />
                        <Key className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                      </div>
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
                        <Zap className="w-3 h-3 text-cyan-500" /> Powering your intelligent reasoning engine.
                      </p>
                    </div>

                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200 relative group transition-all hover:bg-white hover:shadow-xl hover:border-violet-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <Mail className="w-6 h-6 text-violet-500" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900">Communication Node</h3>
                            <div className="text-xs font-bold text-slate-400">Resend API</div>
                          </div>
                        </div>
                        {(formData.apiKeys.resend || verifyingApi) && (
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ring-1 transition-all ${verifyingApi ? 'bg-yellow-100 text-yellow-700 ring-yellow-200' : 'bg-green-100 text-green-700 ring-green-200'
                            }`}>
                            {verifyingApi ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            {verifyingApi ? "Verifying..." : "Connected"}
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="password"
                          value={formData.apiKeys.resend}
                          onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, resend: e.target.value } })}
                          className="w-full pl-10 pr-4 py-4 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-shadow group-hover:shadow-inner"
                          placeholder="re_..."
                        />
                        <Key className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                      </div>
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
                        <Globe className="w-3 h-3 text-violet-500" /> Enabling high-deliverability global outreach.
                      </p>
                    </div>

                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200 relative group transition-all hover:bg-white hover:shadow-xl hover:border-emerald-200 md:col-span-2">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <Layers className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900">SMTP Server Credentials</h3>
                            <div className="text-xs font-bold text-slate-400">Custom Mail Server Node</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {user?.integrations?.smtp?.verified && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black ring-1 ring-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          <button
                            onClick={handleTestSmtp}
                            disabled={isTestingSmtp}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${isTestingSmtp ? 'bg-slate-100 text-slate-400' : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100'}`}
                          >
                            {isTestingSmtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            {isTestingSmtp ? "Testing..." : "Test Connection"}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                          value={formData.integrations.smtp?.host}
                          onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, smtp: { ...formData.integrations.smtp!, host: e.target.value } } })}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                          placeholder="SMTP Host (e.g. smtp.gmail.com)"
                        />
                        <input
                          type="number"
                          value={formData.integrations.smtp?.port}
                          onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, smtp: { ...formData.integrations.smtp!, port: parseInt(e.target.value) } } })}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                          placeholder="Port"
                        />
                        <input
                          value={formData.integrations.smtp?.user}
                          onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, smtp: { ...formData.integrations.smtp!, user: e.target.value } } })}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                          placeholder="Username/Email"
                        />
                        <input
                          type="password"
                          value={formData.integrations.smtp?.pass}
                          onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, smtp: { ...formData.integrations.smtp!, pass: e.target.value } } })}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                          placeholder="Password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CRM Integrations */}
                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-indigo-500" /> Enterprise CRM Ecosystem
                    </h3>
                    <div className="space-y-4">
                      {/* Salesforce */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#00A1E0]/10 rounded-xl flex items-center justify-center">
                            <span className="font-black text-[#00A1E0] text-xl">SF</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">Salesforce</h4>
                            <p className="text-xs text-slate-500 font-medium">Sync leads and deals automatically.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${formData.integrations.crm.salesforce.connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {formData.integrations.crm.salesforce.connected ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleCrmToggle('salesforce')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.integrations.crm.salesforce.connected ? 'bg-navy' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.integrations.crm.salesforce.connected ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>

                      {/* HubSpot */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-orange-300 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#FF7A59]/10 rounded-xl flex items-center justify-center">
                            <span className="font-black text-[#FF7A59] text-xl">HS</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">HubSpot</h4>
                            <p className="text-xs text-slate-500 font-medium">Push interested prospects to pipeline.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${formData.integrations.crm.hubspot.connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {formData.integrations.crm.hubspot.connected ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleCrmToggle('hubspot')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.integrations.crm.hubspot.connected ? 'bg-orange-500' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.integrations.crm.hubspot.connected ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Zoho */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-yellow-300 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#F3C52C]/10 rounded-xl flex items-center justify-center">
                            <span className="font-black text-[#666] text-xl">Z</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">Zoho CRM</h4>
                            <p className="text-xs text-slate-500 font-medium">Basic contact synchronization.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${formData.integrations.crm.zoho.connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {formData.integrations.crm.zoho.connected ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleCrmToggle('zoho')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.integrations.crm.zoho.connected ? 'bg-yellow-500' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.integrations.crm.zoho.connected ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 4. Billing (Subscription) */}
              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-8">
                    <CreditCard className="w-8 h-8 text-emerald-500" />
                    Billing & Usage
                  </h2>

                  <div className="relative overflow-hidden rounded-[2rem] p-8 text-white">
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute top-1/2 -left-24 w-64 h-64 bg-navy/50 rounded-full blur-3xl opacity-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider mb-2">
                          <Sparkles className="w-3 h-3 text-yellow-300" /> Current Plan
                        </div>
                        <h3 className="text-4xl font-black mb-1 capitalize">{user?.subscription?.planId || 'EXPLORER'} Plan</h3>
                        <p className="text-slate-300 font-medium">
                          {user?.subscription?.currentPeriodEnd ? `Renews on ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}` : 'No active subscription'}
                        </p>
                      </div>

                      <div className="w-full md:w-1/2 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-slate-200">Lead Quota This Month</span>
                          <span className="text-white">
                            {user?.subscription?.usage?.leadsUnlockedThisMonth || 0} / {user?.subscription?.limits?.maxLeadsPerMonth || 10}
                          </span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-1000"
                            style={{ width: `${Math.min(100, ((user?.subscription?.usage?.leadsUnlockedThisMonth || 0) / (user?.subscription?.limits?.maxLeadsPerMonth || 10)) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-400">
                          {Math.round(((user?.subscription?.usage?.leadsUnlockedThisMonth || 0) / (user?.subscription?.limits?.maxLeadsPerMonth || 10)) * 100)}% of your monthly capacity used.
                        </p>
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            const { data } = await paymentAPI.createPortalSession();
                            if (data?.url) {
                              window.location.href = data.url;
                            } else {
                              toast.error('Failed to open billing portal');
                            }
                          } catch (error: any) {
                            toast.error(error.response?.data?.error || 'Failed to open billing portal');
                          }
                        }}
                        className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black hover:bg-slate-100 transition-colors shadow-lg"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
  )
}
