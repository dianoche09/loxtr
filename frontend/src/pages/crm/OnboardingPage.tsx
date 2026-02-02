
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Globe,
    Package,
    Sparkles,
    Check,
    ArrowRight,
    MapPin,
    Target,
    User,
    Mail,
    Phone,
    Link as LinkIcon,
    Key,
    Plus,
    X,
    ChevronRight,
    ChevronDown,
    Wand2,
    CreditCard,
    Zap,
    ShieldCheck,
    Briefcase,
    Layers,
    Languages,
    Image,
    Building,
    Upload,
    Loader2,
    Search,
    Trophy,
    Factory,
    FileText,
    Lock,
    Eye,
    EyeOff,
    ExternalLink,
    Trash2
} from 'lucide-react';

import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/crm/LoadingSpinner';
import Logo from '../../components/Logo';
import { authAPI, aiAPI, hsCodeAPI, certificatesAPI, setupAPI, strategyAPI, icpAPI, leadsAPI } from '../../services/crm/api';
import { INDUSTRIES, COUNTRIES, LANGUAGES, PHONE_CODES } from '../../constants/crm/onboarding';

const steps = [
    {
        id: 'basics',
        title: 'Business Identity',
        description: 'Tell us who you are',
        icon: Building2
    },
    {
        id: 'products',
        title: 'Your Portfolio',
        description: 'What are you exporting?',
        icon: Package
    },
    {
        id: 'markets',
        title: 'Strategy',
        description: 'AI Market Recommendations',
        icon: Globe
    },
    {
        id: 'customers',
        title: 'Ideal Buyers',
        description: 'Who are we targeting?',
        icon: Target
    },
    {
        id: 'plans',
        title: 'Pricing',
        description: 'Choose your growth plan',
        icon: CreditCard
    }
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        jobTitle: '',
        phone: '',
        phoneCountryCode: '',
        website: '',
        country: '',
        industry: '',
        companyType: 'manufacturer' as 'manufacturer' | 'trader' | 'service_provider',
        city: '',
        companyDescription: '',
        preferredLanguage: 'English',
        logo: '',
        geminiKey: '',
        resendKey: '',
        productGroups: [] as Array<{
            name: string;
            hsCode: string;
            certificates: string[];
            usageAreas: string[];
        }>,
        targetMarkets: [] as string[],
        targetIndustries: [] as string[],
        targetJobTitles: [] as string[],
        targetCustomerProfile: [] as string[],
        subscription: 'free'
    });

    const [productSearch, setProductSearch] = useState('');
    const [hsSuggestions, setHsSuggestions] = useState<any[]>([]);
    const [isSearchingHs, setIsSearchingHs] = useState(false);
    const [certificateSuggestions, setCertificateSuggestions] = useState<any[]>([]);
    const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
    const [showHsDropdown, setShowHsDropdown] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: '',
        hsCode: '',
        certificates: [] as string[],
        usageAreas: [] as string[]
    });

    const [loadingMessage, setLoadingMessage] = useState('Initializing global intelligence...');
    const getLoadingMessages = () => [
        `🌐 Phase 1: Scanning Global Trade Databases...`,
        `🛡️ Phase 2: Matching Certifications & Standards...`,
        `📊 Phase 3: Calculating Market Entry Scores...`
    ];



    const [geminiStatus, setGeminiStatus] = useState<'neutral' | 'validating' | 'success' | 'error'>('neutral');
    const [resendStatus, setResendStatus] = useState<'neutral' | 'validating' | 'success' | 'error'>('neutral');

    const [isAnalyzingBuyerProfile, setIsAnalyzingBuyerProfile] = useState(false);
    const [buyerSuggestions, setBuyerSuggestions] = useState<{ suggested_industries: string[], suggested_roles: string[] }>({
        suggested_industries: [],
        suggested_roles: []
    });
    const [showGemini, setShowGemini] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiLoadingStage, setAiLoadingStage] = useState(0);

    const AI_LOADER_STAGES = [
        { msg: "AI is scanning global trade databases...", icon: Globe },
        { msg: "Analyzing cross-border demand patterns...", icon: Zap },
        { msg: "Identifying high-potential buyer segments...", icon: Target },
        { msg: "Mapping decision maker hierarchies...", icon: User },
        { msg: "Finalizing your export strategy...", icon: Sparkles }
    ];

    useEffect(() => {
        let interval: any;
        if (isAILoading) {
            setAiLoadingStage(0);
            interval = setInterval(() => {
                setAiLoadingStage(prev => (prev + 1) % AI_LOADER_STAGES.length);
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [isAILoading]);

    const triggerAITransition = async (task: () => Promise<void>, minDuration = 4000) => {
        setIsAILoading(true);
        const startTime = Date.now();
        try {
            await task();
        } finally {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDuration - elapsed);
            await new Promise(resolve => setTimeout(resolve, remaining));
            setIsAILoading(false);
        }
    };

    const [domainInfo, setDomainInfo] = useState<string | null>(null);

    const [showBioModal, setShowBioModal] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const [tempBio, setTempBio] = useState('');
    const [dnsInfo, setDnsInfo] = useState<any>(null);

    const currentSearchValRef = useRef('');

    const [usageAreaInput, setUsageAreaInput] = useState('');

    // Industry & Role Selector Modal States
    const [showIndustrySelectorModal, setShowIndustrySelectorModal] = useState(false);
    const [showRoleSelectorModal, setShowRoleSelectorModal] = useState(false);
    const [selectedStandardIndustries, setSelectedStandardIndustries] = useState<string[]>([]);
    const [selectedStandardRoles, setSelectedStandardRoles] = useState<string[]>([]);
    const [customIndustryInput, setCustomIndustryInput] = useState('');
    const [customRoleInput, setCustomRoleInput] = useState('');

    // Standard B2B Industries (not in AI top 5)
    const STANDARD_INDUSTRIES = [
        'Wholesalers / Distributors',
        'Retail Chains',
        'Government / Public Sector',
        'Automotive OEM',
        'Aerospace & Defense',
        'Textile Manufacturers',
        'Food & Beverage Processors',
        'Energy & Utilities',
        'Construction & Real Estate',
        'Pharmaceutical Companies',
        'Electronics Assembly',
        'Packaging Manufacturers'
    ];

    const STANDARD_ROLES = [
        'CEO / Managing Director',
        'VP of Operations',
        'Supply Chain Director',
        'Quality Assurance Manager',
        'Logistics Manager',
        'Import/Export Manager',
        'Production Manager',
        'Warehouse Manager'
    ];

    // Pricing & Payment States
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter' | 'pro'>('starter');

    // Certificate suggestions are now loaded dynamically based on industry
    // const availableCertificates = []; // Removed hardcoded list

    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [marketInput, setMarketInput] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([
        {
            region_name: 'Strategic Regions (Mock)',
            countries: [
                { id: 'de', country_name: 'Germany', country_code: 'DE', flag: '🇩🇪', match_score: 98, market_volume: '$4.5B', reason: 'Top importer in EU. Your REACH Certificate is mandatory here, giving you a massive advantage.', is_selected: true },
                { id: 'us', country_name: 'United States', country_code: 'US', flag: '🇺🇸', match_score: 94, market_volume: '$3.8B', reason: 'High demand in construction sector. Zero customs tax advantage for specific products.', is_selected: true },
                { id: 'uk', country_name: 'United Kingdom', country_code: 'GB', flag: '🇬🇧', match_score: 89, market_volume: '$2.1B', reason: 'Post-Brexit trade agreement favors Turkey. Fast logistics route via truck.', is_selected: true }
            ]
        }
    ]);

    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const getFlagEmoji = (countryCode: string) => {
        if (!countryCode) return '🌍';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

    const getCountryFlag = (countryName: string) => {
        // 1. Check AI suggestions first
        const aiMatch = (aiSuggestions || []).flatMap((r: any) => r.countries || [])
            .find((c: any) => c.country_name === countryName);
        if (aiMatch) return aiMatch.flag;

        // 2. Check COUNTRIES constant
        const match = COUNTRIES.find(c => c.name === countryName);
        if (match) {
            const codePoints = match.code
                .toUpperCase()
                .split('')
                .map(char => 127397 + char.charCodeAt(0));
            return String.fromCodePoint(...codePoints);
        }

        return '🌍';
    };

    const [isAutoFillingBio, setIsAutoFillingBio] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => setShowHsDropdown(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Sync Phone Code with Country (only when user manually changes country)
    useEffect(() => {
        if (!formData.country) return;
        const match = PHONE_CODES.find(p => p.country === formData.country);
        if (match) {
            setFormData(prev => ({ ...prev, phoneCountryCode: match.code }));
        }
    }, [formData.country]);

    // Load certificate suggestions when industry is set
    useEffect(() => {
        const loadCertificates = async () => {
            if (!formData.industry) return;

            setIsLoadingCertificates(true);
            try {
                const res = (await certificatesAPI.search(formData.industry)) as any;
                if (res.success && res.data) {
                    setCertificateSuggestions(res.data);
                }
            } catch (error) {
                console.error('Failed to load certificates:', error);
                // Fallback to empty array
                setCertificateSuggestions([]);
            } finally {
                setIsLoadingCertificates(false);
            }
        };
        loadCertificates();
    }, [formData.industry]);

    // Debounced HS Code Search (prevents API spam)
    const performHsSearch = async (val: string) => {
        if (val.length < 2) {
            setHsSuggestions([]);
            setShowHsDropdown(false);
            return;
        }

        setIsSearchingHs(true);
        try {
            // Step 1: Try database search
            let dbData = [];
            try {
                const dbRes = (await hsCodeAPI.search(val)) as any;
                if (dbRes.success && dbRes.data) {
                    dbData = dbRes.data;
                }
            } catch (dbErr) {
                console.warn('Database HS search failed, falling back to AI:', dbErr);
            }

            // If query changed while waiting, discard results
            if (currentSearchValRef.current !== val) return;

            if (dbData.length > 0) {
                setHsSuggestions(dbData);
                setShowHsDropdown(true);
            } else {
                // Step 2: Fallback to AI if database has no results or failed
                const aiRes = (await aiAPI.getHsCodeSuggestions({ product: val })) as any;

                // If query changed while waiting, discard results
                if (currentSearchValRef.current !== val) return;

                if (aiRes.success && aiRes.data && aiRes.data.length > 0) {
                    setHsSuggestions(aiRes.data);
                    setShowHsDropdown(true);
                } else {
                    setHsSuggestions([]);
                    setShowHsDropdown(false);
                }
            }
        } catch (error) {
            if (currentSearchValRef.current !== val) return;
            console.error('HS Code search failed completely', error);
            setHsSuggestions([]);
            setShowHsDropdown(false);
        } finally {
            if (currentSearchValRef.current === val) {
                setIsSearchingHs(false);
            }
        }
    };

    // Debounce timer ref
    const debounceTimerRef = useRef<any>(null);

    const handleHsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setProductSearch(val);
        setNewProduct(prev => ({ ...prev, name: val }));
        currentSearchValRef.current = val;

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer (300ms debounce)
        debounceTimerRef.current = setTimeout(() => {
            performHsSearch(val);
        }, 300);
    };

    // Helper: Get certificate suggestions based on HS Code chapter
    const getCertificatesByHsCode = (hsCode: string): string[] => {
        if (!hsCode || hsCode.length < 2) return [];

        const chapter = parseInt(hsCode.substring(0, 2));

        // HS Code Intelligence Map
        if (chapter >= 28 && chapter <= 40) {
            // Chemicals & Plastics
            return ['REACH (Chemical Safety)', 'ISO 14001 (Environmental)', 'RoHS (Hazardous Substances)'];
        } else if (chapter >= 84 && chapter <= 85) {
            // Machinery & Electronics
            return ['CE (European Conformity)', 'RoHS (Hazardous Substances)', 'UL (Safety Certification)', 'ISO 9001 (Quality Management)'];
        } else if (chapter >= 1 && chapter <= 24) {
            // Food & Agriculture
            return ['FDA (Food Safety)', 'HACCP (Food Safety)', 'Halal', 'Organic Certification'];
        } else if (chapter >= 50 && chapter <= 63) {
            // Textiles & Apparel
            return ['OEKO-TEX (Textile Safety)', 'GOTS (Organic Textiles)', 'ISO 14001 (Environmental)'];
        } else if (chapter >= 72 && chapter <= 83) {
            // Metals & Minerals
            return ['ISO 9001 (Quality Management)', 'ASTM (Material Standards)', 'DIN (German Standards)'];
        } else if (chapter >= 90 && chapter <= 92) {
            // Medical & Optical Equipment
            return ['CE (Medical Devices)', 'FDA (Medical Devices)', 'ISO 13485 (Medical Quality)'];
        }

        // Default: General quality standards
        return ['ISO 9001 (Quality Management)', 'ISO 14001 (Environmental)'];
    };

    const handleSelectHs = (item: { code: string, description: string }) => {
        // Get smart certificate suggestions based on HS Chapter
        const suggestedCerts = getCertificatesByHsCode(item.code);

        setNewProduct(prev => ({
            ...prev,
            name: item.description,
            hsCode: item.code,
            certificates: suggestedCerts  // ✨ Auto-suggest based on HS chapter
        }));
        setProductSearch(item.description);
        setShowHsDropdown(false);

        // Show toast to notify user
        if (suggestedCerts.length > 0) {
            toast.success(`✨ ${suggestedCerts.length} certificates auto-suggested for this product`, {
                duration: 3000,
                icon: '🛡️'
            });
        }
    };

    const handleAddProduct = () => {
        if (!newProduct.name || !newProduct.hsCode) {
            toast.error('Product name and HS Code are required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            productGroups: [...prev.productGroups, { ...newProduct }]
        }));
        setNewProduct({
            name: '',
            hsCode: '',
            certificates: [],
            usageAreas: []
        });
        setProductSearch('');
        setUsageAreaInput('');
        toast.success('Product added to portfolio');
    };

    const handleRemoveProduct = (index: number) => {
        setFormData(prev => ({
            ...prev,
            productGroups: prev.productGroups.filter((_, i) => i !== index)
        }));
    };
    // Logo removal (optional cleanup if logic remains)
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const handleAutoFillBio = async () => {
        if (!formData.website) {
            toast.error('Please enter a website first');
            return;
        }

        setIsAutoFillingBio(true);
        try {
            const res = (await aiAPI.generateBio({ website: formData.website })) as any;
            if (res.success && res.data) {
                const { bio, logo, products } = res.data;
                setFormData(prev => ({
                    ...prev,
                    companyDescription: bio,
                    logo: logo || prev.logo,
                    // Auto-add found products if they don't exist yet
                    productGroups: products && products.length > 0
                        ? [...prev.productGroups, ...products.map((p: string) => ({
                            name: p,
                            hsCode: '',
                            certificates: [],
                            usageAreas: []
                        }))]
                        : prev.productGroups
                }));

                if (logo && products?.length > 0) {
                    toast.success(`✨ Bio, logo and ${products.length} products found!`);
                } else if (logo) {
                    toast.success('✨ Bio and logo extracted from website!');
                } else {
                    toast.success('✨ Bio generated from website!');
                }
            }
        } catch (error: any) {
            console.error('Auto-fill bio error:', error);
            const message = error.response?.data?.error || 'Could not reach website. Please write a bio manually.';
            toast.error(message);
        } finally {
            setIsAutoFillingBio(false);
        }
    };

    const startWebsiteScraping = async () => {
        if (!formData.website) return;

        try {
            console.log('🕸️ Starting background website scraping...');

            // Run in background (not awaited) - don't block user flow
            aiAPI.generateBio({ website: formData.website })
                .then((res: any) => {
                    if (res.success && res.data) {
                        const { bio, logo, products } = res.data;

                        setFormData(prev => {
                            // Merge new products if any
                            const currentNames = prev.productGroups.map(p => p.name.toLowerCase());
                            const newProducts = (products || [])
                                .filter((p: string) => !currentNames.includes(p.toLowerCase()))
                                .map((p: string) => ({
                                    name: p,
                                    hsCode: '',
                                    certificates: [],
                                    usageAreas: []
                                }));

                            return {
                                ...prev,
                                companyDescription: bio || prev.companyDescription,
                                logo: logo || prev.logo,
                                productGroups: [...prev.productGroups, ...newProducts]
                            };
                        });

                        // Immediately save to backend (bio & logo only for now, products saved on next step)
                        authAPI.updateProfile({
                            companyDescription: bio,
                            logo: logo
                        });

                        console.log('✅ Website scraping complete');
                        const msg = products?.length > 0
                            ? `📝 Found info & ${products.length} products from website`
                            : '📝 Company bio extracted from website';

                        toast.success(msg, {
                            id: 'bio-scraped',
                            duration: 3000
                        });
                    }
                })
                .catch(err => {
                    console.warn('⚠️ Website scraping failed (non-blocking):', err);
                });
        } catch (error) {
            console.warn('⚠️ Could not start scraping:', error);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = (await authAPI.getCurrentUser()) as any;
                const user = res.data.user;
                if (user.onboardingCompleted) {
                    navigate('/dashboard');
                    return;
                }

                setFormData(prev => {
                    const newData = {
                        ...prev,
                        name: user.name || '',
                        email: user.email || '',
                        companyName: user.company || '',
                        jobTitle: user.jobTitle || '',
                        phone: user.phone || '',
                        website: user.website || '',
                        country: user.country || '',
                        industry: user.industry || '',
                        companyType: user.companyType || 'manufacturer',
                        city: user.city || '',
                        companyDescription: user.companyDescription || '',
                        preferredLanguage: user.preferredLanguage || 'English',
                        geminiKey: user.apiKeys?.gemini || '',
                        productGroups: (user.productGroups || []).map((p: any) =>
                            typeof p === 'string' ? { name: p, hsCode: '', certificates: [], keywords: [] } : p
                        ),
                        targetMarkets: user.targetMarkets || [],
                        targetCustomerProfile: user.targetCustomerProfile || [],
                        subscription: user.subscription || 'free'
                    };

                    // Auto-detect first incomplete step
                    let firstIncomplete = 0;
                    if (!newData.name || !newData.companyName || !newData.industry || !newData.website || !newData.phone) {
                        firstIncomplete = 0;
                    } else if (newData.productGroups.length === 0) {
                        firstIncomplete = 1;
                    } else if (newData.targetMarkets.length === 0) {
                        firstIncomplete = 2; // Strategy
                    } else if (newData.targetIndustries.length === 0) {
                        firstIncomplete = 3; // ICP
                    } else if (newData.subscription === 'free' && user.subscriptionStatus === 'trialing') {
                        // If they are on trial but haven't finished onboarding, stay on pricing
                        firstIncomplete = 4;
                    }

                    if (firstIncomplete > 0) {
                        setCurrentStep(firstIncomplete);
                        toast.success(`Continuing from Step ${firstIncomplete + 1}: ${steps[firstIncomplete].title}`, {
                            icon: '🔄',
                            duration: 4000
                        });
                    }

                    return newData;
                });

                // 🌍 IP-based Geo-Detection (only if user has no country set)
                if (!user.country || !user.city) {
                    try {
                        const geoRes = await fetch('https://ipapi.co/json/');
                        const geoData = await geoRes.json();

                        if (geoData.country_name) {
                            setFormData(prev => ({
                                ...prev,
                                country: prev.country || geoData.country_name,
                                city: prev.city || geoData.city || ''
                            }));
                            console.log(`🌍 Auto-detected location: ${geoData.city}, ${geoData.country_name}`);
                        }
                    } catch (geoError) {
                        console.warn('⚠️ Geo-detection failed, using default Turkey');
                        setFormData(prev => ({
                            ...prev,
                            country: prev.country || 'Turkey'
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };
        fetchUser();
    }, [navigate]);


    const savePartialProfile = async () => {
        try {
            await authAPI.updateProfile({
                name: formData.name,
                company: formData.companyName,
                jobTitle: formData.jobTitle,
                phone: formData.phone,
                phoneCountryCode: formData.phoneCountryCode,
                website: formData.website,
                country: formData.country,
                industry: formData.industry,
                companyType: formData.companyType,
                companyDescription: formData.companyDescription,
                preferredLanguage: formData.preferredLanguage,
                apiKeys: { gemini: formData.geminiKey },
                productGroups: formData.productGroups,
                targetMarkets: formData.targetMarkets,
                targetCustomerProfile: formData.targetCustomerProfile,
                subscription: formData.subscription as any,
                city: formData.city
            });
        } catch (error) {
            console.error('Failed to save partial profile:', error);
        }
    };

    // Rotate loading messages during analysis
    useEffect(() => {
        let interval: any;
        if (analyzing) {
            let i = 0;
            const messages = getLoadingMessages();
            setLoadingMessage(messages[0]);
            interval = setInterval(() => {
                const refreshedMessages = getLoadingMessages();
                i = (i + 1) % refreshedMessages.length;
                setLoadingMessage(refreshedMessages[i]);
            }, 800);

        }
        return () => clearInterval(interval);
    }, [analyzing]);

    const handleNext = async () => {
        if (currentStep === 0) {
            if (!formData.companyName || !formData.name || !formData.industry || !formData.website || !formData.phone) {
                toast.error('All marked fields are required');
                return;
            }
            if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
                toast.error('Please enter a valid website URL');
                return;
            }
            savePartialProfile(); // Background save

            // 🚀 NEW: Trigger background website scraping (non-blocking)
            if (formData.website && !formData.companyDescription) {
                startWebsiteScraping();
            }

            setCurrentStep(1);
        } else if (currentStep === 1) {
            if (formData.productGroups.length === 0) {
                toast.error('Please add at least one product');
                return;
            }
            savePartialProfile(); // Background save
            triggerAITransition(async () => {
                await generateAISummary();
            }, 5000);
        } else if (currentStep === 2) {
            if (formData.targetMarkets.length === 0) {
                toast.error('Please select at least three target markets');
                return;
            }
            savePartialProfile();
            triggerAITransition(async () => {
                await analyzeBuyerProfile();
                setCurrentStep(3);
            }, 6000);
        } else if (currentStep === 3) {
            if (formData.targetIndustries.length === 0 || formData.targetJobTitles.length === 0) {
                toast.error('Please select target segments and decision makers');
                return;
            }
            savePartialProfile();
            setCurrentStep(4);
        } else if (currentStep === 4) {
            await finishOnboarding();
        }
    };


    const analyzeMarkets = async () => {
        setAnalyzing(true);
        try {
            const res = (await strategyAPI.getRecommendations({
                products: formData.productGroups,
                originCountry: formData.country || 'Turkey'
            })) as any;

            if (res.success && res.data && res.data.recommendations) {
                // Transform backend data format to local state
                const recommendations = res.data.recommendations;

                // Group by region if needed, or just show as list
                // The current UI expects regions, but we can simplify
                setAiSuggestions([
                    {
                        region_name: 'AI Recommended Markets',
                        countries: recommendations.map((r: any) => ({
                            id: r.country.toLowerCase(),
                            country_name: r.country,
                            country_code: r.country, // Backend should ideally provide code
                            flag: getCountryFlag(r.country),
                            match_score: r.score,
                            reason: r.reasoning,
                            breakdown: r.breakdown,
                            market_volume: `$${(r.breakdown.tradeVolume * 12.5).toFixed(0)}M+ Annual`, // Proxy from score
                            is_selected: r.selected
                        }))
                    }
                ]);

                // Update selected markets
                const selectedCountries = recommendations
                    .filter((r: any) => r.selected)
                    .map((r: any) => r.country);

                setFormData(prev => ({
                    ...prev,
                    targetMarkets: selectedCountries
                }));
            }
        } catch (error) {
            console.error('AI Analysis failed:', error);
            toast.error('AI Analysis failed. Defining markets manually.');
        } finally {
            setAnalyzing(false);
        }
    };

    const analyzeBuyerProfile = async () => {
        if (buyerSuggestions.suggested_industries.length > 0) {
            return; // Only analyze once
        }

        console.log('🤖 Starting Buyer Profile Analysis...');
        setIsAnalyzingBuyerProfile(true);

        try {
            const res = (await icpAPI.generate({
                products: formData.productGroups,
                targetCountries: formData.targetMarkets
            })) as any;

            if (res.success && res.data) {
                const { targetIndustries, decisionMakers } = res.data;

                setBuyerSuggestions({
                    suggested_industries: targetIndustries.map((i: any) => i.name),
                    suggested_roles: decisionMakers.map((r: any) => r.title)
                });

                // Track backend reasoning/confidence if we want to show it in tooltips later
                // For now, just pre-select based on backend 'selected' flag
                setFormData(prev => ({
                    ...prev,
                    targetIndustries: targetIndustries.filter((i: any) => i.selected).map((i: any) => i.name),
                    targetJobTitles: decisionMakers.filter((r: any) => r.selected).map((r: any) => r.name)
                }));
            }
        } catch (error) {
            console.error('❌ Buyer profile analysis failed:', error);
            // Fallback (same as before)
            const fallback_industries = ['Wholesale Distributors', 'Industrial Manufacturers', 'Supply Chain Logistics'];
            const fallback_roles = ['Procurement Manager', 'Operations Director', 'Purchasing Lead'];

            setBuyerSuggestions({
                suggested_industries: fallback_industries,
                suggested_roles: fallback_roles
            });
            setFormData(prev => ({
                ...prev,
                targetIndustries: fallback_industries,
                targetJobTitles: fallback_roles
            }));
        } finally {
            setIsAnalyzingBuyerProfile(false);
        }
    };

    const finishOnboarding = async () => {
        setLoading(true);
        try {
            // 1. Save Profile & Complete Onboarding
            await authAPI.updateProfile({
                name: formData.name,
                company: formData.companyName,
                jobTitle: formData.jobTitle,
                phone: formData.phone,
                phoneCountryCode: formData.phoneCountryCode,
                website: formData.website,
                country: formData.country,
                industry: formData.industry,
                companyType: formData.companyType,
                companyDescription: formData.companyDescription,
                city: formData.city,
                preferredLanguage: formData.preferredLanguage,
                apiKeys: { gemini: formData.geminiKey },
                productGroups: formData.productGroups,
                targetMarkets: formData.targetMarkets,
                targetIndustries: formData.targetIndustries,
                targetJobTitles: formData.targetJobTitles,
                subscription: formData.subscription as any,
                onboardingCompleted: true
            });

            // 2. Trigger Initial "Hunt" (First Research) with WOW transition
            await triggerAITransition(async () => {
                try {
                    const primaryProduct = formData.productGroups[0];
                    if (primaryProduct) {
                        console.log('🚀 Triggering initial lead discovery for dashboard...');
                        await leadsAPI.discoverLeads({
                            product: primaryProduct.name,
                            targetMarkets: formData.targetMarkets.slice(0, 3), // Focus on top 3 for speed
                            industry: formData.targetIndustries[0] || formData.industry,
                            count: 5, // Just a few to start
                            groupName: 'Initial Research',
                            preview: false // Actually save them!
                        });
                    }
                } catch (discoveryError) {
                    console.warn('Initial discovery failed, user will start with empty dashboard', discoveryError);
                }
            }, 8000); // 8 second "WOW" transition for the first setup

            toast.success('Setup complete! Welcome to LOXTR.');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    const generateAISummary = async () => {
        setIsGeneratingBio(true);
        setShowBioModal(true);
        try {
            const res = (await aiAPI.generateValueProp({
                companyName: formData.companyName,
                industry: formData.industry,
                description: formData.companyDescription,
                products: formData.productGroups.map(p => p.name),
                certificates: Array.from(new Set(formData.productGroups.flatMap(p => p.certificates || [])))
            })) as any;

            if (res.success) {
                setTempBio(res.data);
            }
        } catch (error) {
            console.error('Failed to generate AI summary', error);
            setTempBio(`${formData.companyName} is a manufacturer in the ${formData.industry} sector, dedicated to delivering high-quality products to global markets.`);
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const handleAddIndustries = () => {
        const toAdd = [...selectedStandardIndustries];
        if (customIndustryInput.trim()) {
            toAdd.push(customIndustryInput.trim());
        }

        if (toAdd.length > 0) {
            setFormData(prev => ({
                ...prev,
                targetIndustries: [...new Set([...prev.targetIndustries, ...toAdd])]
            }));
            setBuyerSuggestions(prev => ({
                ...prev,
                suggested_industries: [...new Set([...prev.suggested_industries, ...toAdd])]
            }));
        }

        // Reset and close
        setSelectedStandardIndustries([]);
        setCustomIndustryInput('');
        setShowIndustrySelectorModal(false);
    };

    const handleAddRoles = () => {
        const toAdd = [...selectedStandardRoles];
        if (customRoleInput.trim()) {
            toAdd.push(customRoleInput.trim());
        }

        if (toAdd.length > 0) {
            setFormData(prev => ({
                ...prev,
                targetJobTitles: [...new Set([...prev.targetJobTitles, ...toAdd])]
            }));
            setBuyerSuggestions(prev => ({
                ...prev,
                suggested_roles: [...new Set([...prev.suggested_roles, ...toAdd])]
            }));
        }

        // Reset and close
        setSelectedStandardRoles([]);
        setCustomRoleInput('');
        setShowRoleSelectorModal(false);
    };

    const toggleMarket = (country: string) => {
        setFormData(prev => {
            if (prev.targetMarkets.includes(country)) {
                return { ...prev, targetMarkets: prev.targetMarkets.filter(c => c !== country) };
            } else {
                return { ...prev, targetMarkets: [...prev.targetMarkets, country] };
            }
        });
    };

    const addMarket = (country: string) => {
        setFormData(prev => {
            if (prev.targetMarkets.includes(country)) return prev;
            return { ...prev, targetMarkets: [...prev.targetMarkets, country] };
        });
    };

    return (
        <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4 py-12 font-outfit">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-yellow/5 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[750px] relative z-10"
            >
                {/* Sidebar Navigation */}
                <div className="w-full md:w-[22rem] bg-navy p-8 text-white flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-charcoal opacity-90" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex flex-col gap-4 mb-8">
                            <Logo className="h-10" />
                            <div className="h-1 w-8 bg-yellow rounded-full" />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-black leading-tight tracking-tight uppercase">
                                <span className="text-white/50 text-xs block mb-1">LOXTR Intelligence</span>
                                LOX <span className="text-yellow">AI RADAR</span>
                            </h2>
                        </div>

                        <div className="flex-1 space-y-8">
                            {steps.map((step, idx) => {
                                const isCompleted = idx < currentStep;
                                const isActive = idx === currentStep;
                                const isLocked = idx > currentStep;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => !isLocked && setCurrentStep(idx)}
                                        className={`flex items-start gap-4 transition-all duration-300 
                                        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer group'}`}
                                    >
                                        <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                                        ${isCompleted ? 'bg-yellow text-navy border-yellow shadow-lg shadow-yellow/20' :
                                                isActive ? 'bg-white text-navy border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110' :
                                                    'border-white/20 bg-white/5'}`}>
                                            {isCompleted ? <Check size={20} className="stroke-[3]" /> :
                                                isLocked ? <Lock size={16} className="text-white/40" /> :
                                                    <step.icon size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold leading-tight transition-colors ${isActive ? 'text-white' : 'text-blue-100/90 group-hover:text-white'}`}>
                                                    {step.title}
                                                </h3>
                                                {isCompleted && (
                                                    <span className="text-[8px] font-black bg-yellow/20 text-yellow px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                                                        Done
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-[11px] mt-1 font-medium transition-colors ${isActive ? 'text-blue-100' : 'text-blue-200/60'}`}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-10 border-t border-white/10 mt-auto">
                            <p className="text-xs text-blue-200/60 font-medium">STEP {currentStep + 1} OF {steps.length}</p>
                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 md:p-12 flex flex-col">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {/* STEP 0: BASICS */}
                            {currentStep === 0 && (
                                <motion.div
                                    key="basics"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Let's build your business profile</h2>
                                        <p className="text-slate-500 mt-2 text-lg">
                                            This data helps our AI benchmark you against the right competitors and design tailor-made export strategies.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            {/* Row 1: Identity */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-navy">Full Name <span className="text-red-500">*</span></label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="Your name"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-navy">Job Title</label>
                                                <div className="relative group">
                                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.jobTitle}
                                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="e.g. Export Manager"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Company Core */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-navy">Company Name <span className="text-red-500">*</span></label>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.companyName}
                                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="Company name"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1 relative">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-navy">Website <span className="text-red-500">*</span></label>
                                                <div className="relative group">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                    <input
                                                        type="url"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="https://company.com"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-4 left-2 flex items-center gap-1.5 whitespace-nowrap">
                                                    <div className="flex h-1 w-1 rounded-full bg-navy/50 animate-pulse" />
                                                    <span className="text-[8px] font-black uppercase tracking-tight text-navy/50/70">
                                                        AI will scan your website for products automatically
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Row 3: Business Details */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-navy">Business Type</label>
                                                <div className="relative group">
                                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                    <select
                                                        value={formData.companyType}
                                                        onChange={(e) => setFormData({ ...formData, companyType: e.target.value as any })}
                                                        className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                    >
                                                        <option value="manufacturer">Manufacturer (Factory Direct)</option>
                                                        <option value="trader">Trader / Distributor</option>
                                                        <option value="service_provider">Service Provider</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-emerald-600">Industry / Sector <span className="text-red-500">*</span></label>
                                                <div className="relative group">
                                                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                    <select
                                                        value={formData.industry}
                                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                        className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                    >
                                                        <option value="">Select Sector</option>
                                                        {INDUSTRIES.map(ind => (
                                                            <option key={ind} value={ind}>{ind}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                </div>
                                            </div>

                                            {/* Row 4: Location */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-indigo-600">Origin Country</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                                    <select
                                                        value={formData.country}
                                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                        className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                    >
                                                        <option value="">Select Country</option>
                                                        {COUNTRIES.map(c => (
                                                            <option key={c.code} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-indigo-600">Origin City</label>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="e.g. Istanbul, Berlin"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 5: Contact & Language */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-navy">Phone Number <span className="text-red-500">*</span></label>
                                                <div className="flex gap-2">
                                                    <div className="relative group w-32 shrink-0">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={14} />
                                                        <select
                                                            value={formData.phoneCountryCode}
                                                            onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                                                            className="w-full pl-9 pr-6 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                        >
                                                            <option value="">Code</option>
                                                            {PHONE_CODES.map(p => (
                                                                <option key={p.country} value={p.code}>{p.code} {p.country}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                                                    </div>
                                                    <div className="relative group flex-1">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                        <input
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                            placeholder={
                                                                formData.phoneCountryCode === '+90' ? '5XX XXX XX XX' :
                                                                    formData.phoneCountryCode === '+1' ? '(201) 555-0123' :
                                                                        '123 456 7890'
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-purple-600">Primary Export Language</label>
                                                <div className="relative group">
                                                    <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={16} />
                                                    <select
                                                        value={formData.preferredLanguage}
                                                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                                                        className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-navy/50 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                    >
                                                        {LANGUAGES.map(lang => (
                                                            <option key={lang} value={lang}>{lang}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 1: PRODUCTS */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="products"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Portfolio</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Define your offerings with technical precision for global markets.</p>
                                    </div>

                                    {/* Product Entry Form */}
                                    <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Product Discovery & HS Code */}
                                            <div className="space-y-6 md:col-span-2">
                                                <div className="space-y-1.5 relative">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                        <Search size={12} className="text-navy/50" />
                                                        Product Name & HS Code Finder
                                                    </label>
                                                    <div className="relative group">
                                                        <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy transition-colors" size={20} />
                                                        <input
                                                            type="text"
                                                            value={productSearch}
                                                            onChange={handleHsSearch}
                                                            className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-navy/50 transition-all outline-none font-bold text-slate-700 shadow-sm text-sm"
                                                            placeholder="e.g. Paints, Powder Polymer, Cellulose Ether..."
                                                        />
                                                        {isSearchingHs && (
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                                                <Loader2 size={20} className="animate-spin text-navy/50" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* HS Code Suggestions Dropdown */}
                                                    <AnimatePresence>
                                                        {showHsDropdown && hsSuggestions.length > 0 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                                                            >
                                                                <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter px-2">AI Suggested Matches</span>
                                                                </div>
                                                                {hsSuggestions.map((item, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => handleSelectHs(item)}
                                                                        className="w-full px-5 py-4 text-left hover:bg-navy/5 transition-colors border-b border-slate-50 last:border-0 flex flex-col gap-0.5"
                                                                    >
                                                                        <span className="text-navy font-black text-sm">{item.code}</span>
                                                                        <span className="text-slate-600 text-xs font-medium line-clamp-1">{item.description}</span>
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* HS Code Manual Override */}
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">HS Code (Auto-filled or Manual)</label>
                                                <div className="relative group">
                                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={newProduct.hsCode}
                                                        onChange={(e) => setNewProduct({ ...newProduct, hsCode: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-transparent rounded-xl focus:border-navy/50 transition-all outline-none font-mono font-black text-navy shadow-sm text-sm"
                                                        placeholder="e.g. 3209.10"
                                                    />
                                                </div>
                                            </div>

                                            {/* NEW: Usage Areas (Targeting) */}
                                            <div className="md:col-span-2 space-y-4">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                    <Target size={12} className="text-purple-500" />
                                                    Where is this product used? (Key Applications)
                                                </label>
                                                <div className="space-y-3">
                                                    <div className="relative group">
                                                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-600 transition-colors" size={16} />
                                                        <input
                                                            type="text"
                                                            value={usageAreaInput}
                                                            onChange={(e) => setUsageAreaInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && usageAreaInput.trim()) {
                                                                    e.preventDefault();
                                                                    setNewProduct({
                                                                        ...newProduct,
                                                                        usageAreas: [...newProduct.usageAreas, usageAreaInput.trim()]
                                                                    });
                                                                    setUsageAreaInput('');
                                                                }
                                                            }}
                                                            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-transparent rounded-xl focus:border-purple-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-sm"
                                                            placeholder="e.g. Retail, Construction, Beverage Industry... (Press Enter to add)"
                                                        />
                                                    </div>
                                                    {newProduct.usageAreas.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {newProduct.usageAreas.map((area, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-200 flex items-center gap-2"
                                                                >
                                                                    {area}
                                                                    <button
                                                                        onClick={() => {
                                                                            setNewProduct({
                                                                                ...newProduct,
                                                                                usageAreas: newProduct.usageAreas.filter((_, i) => i !== idx)
                                                                            });
                                                                        }}
                                                                        className="hover:text-purple-900 transition-colors"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Certificates (Context-Aware) */}
                                            <div className="md:col-span-2 space-y-4">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                    <Trophy size={12} className="text-amber-500" />
                                                    Compliance & Certificates
                                                    {isLoadingCertificates && <Loader2 size={10} className="animate-spin text-blue-400" />}
                                                </label>
                                                {!formData.industry ? (
                                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-bold">
                                                        ⚠️ Please select an industry in Step 1 to see relevant certificate suggestions.
                                                    </div>
                                                ) : certificateSuggestions.length === 0 && !isLoadingCertificates ? (
                                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs font-medium">
                                                        No certificate suggestions available. You can still add custom certificates below.
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {/* Quick Chips: Recommended Certificates */}
                                                        {certificateSuggestions.filter(c => c.recommended).length > 0 && (
                                                            <div className="mb-4">
                                                                <span className="text-[9px] font-black text-navy uppercase tracking-widest px-2 block mb-2">Recommended for {formData.industry}</span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {certificateSuggestions
                                                                        .filter(c => c.recommended)
                                                                        .map((cert) => (
                                                                            <button
                                                                                key={cert.code}
                                                                                onClick={() => {
                                                                                    const exists = newProduct.certificates.includes(cert.label);
                                                                                    setNewProduct({
                                                                                        ...newProduct,
                                                                                        certificates: exists
                                                                                            ? newProduct.certificates.filter(c => c !== cert.label)
                                                                                            : [...newProduct.certificates, cert.label]
                                                                                    });
                                                                                }}
                                                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${newProduct.certificates.includes(cert.label)
                                                                                    ? 'bg-navy border-navy text-white shadow-lg shadow-blue-200'
                                                                                    : 'bg-white border-blue-200 text-navy hover:bg-navy/5'
                                                                                    }`}
                                                                            >
                                                                                {cert.label}
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* All Other Certificates */}
                                                        <div>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 block mb-2">All Standards</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {certificateSuggestions.map((cert) => (
                                                                    <button
                                                                        key={cert.code}
                                                                        onClick={() => {
                                                                            const exists = newProduct.certificates.includes(cert.label);
                                                                            setNewProduct({
                                                                                ...newProduct,
                                                                                certificates: exists
                                                                                    ? newProduct.certificates.filter(c => c !== cert.label)
                                                                                    : [...newProduct.certificates, cert.label]
                                                                            });
                                                                        }}
                                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${newProduct.certificates.includes(cert.label)
                                                                            ? 'bg-navy border-navy text-white shadow-lg shadow-blue-200'
                                                                            : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                                                                            }`}
                                                                    >
                                                                        {cert.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddProduct}
                                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                                        >
                                            <Plus size={20} />
                                            Add Product to Export Portfolio
                                        </button>
                                    </div>

                                    {/* Added Products Grid */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Added Products ({formData.productGroups.length})</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formData.productGroups.length === 0 && (
                                                <div className="md:col-span-2 h-32 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 gap-2">
                                                    <Package size={24} className="opacity-20" />
                                                    <span className="text-xs font-bold">No products added yet</span>
                                                </div>
                                            )}
                                            {formData.productGroups.map((p, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all"
                                                >
                                                    <button
                                                        onClick={() => handleRemoveProduct(i)}
                                                        className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                    <div className="flex flex-col gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-[10px] font-black text-navy bg-navy/5 px-2 py-0.5 rounded-md font-mono border border-blue-100 italic">
                                                                    HS Code: {p.hsCode || '---'}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest block">Product Name:</span>
                                                                <h4 className="font-black text-slate-800 text-sm leading-tight">
                                                                    {p.name}
                                                                </h4>
                                                            </div>
                                                        </div>

                                                        {p.usageAreas && p.usageAreas.length > 0 && (
                                                            <div className="space-y-1.5">
                                                                <span className="text-[9px] font-bold text-purple-500 uppercase tracking-widest block">Key Applications:</span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {p.usageAreas.map((area, idx) => (
                                                                        <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[9px] font-black border border-purple-100">
                                                                            {area}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {p.certificates && p.certificates.length > 0 && (
                                                            <div className="space-y-1.5">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Certificates:</span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {p.certificates.map(c => (
                                                                        <span key={c} className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[9px] font-black uppercase border border-slate-100">
                                                                            {c}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* OLD STEP 2 (AI Setup) REMOVED */}

                            {/* STEP 2: STRATEGIC MARKETS - THE SHOWTIME SCREEN */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="markets"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    className="space-y-10"
                                >
                                    {analyzing ? (
                                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-10">
                                            <div className="relative">
                                                {/* Sophisticated Glow Loader */}
                                                <div className="absolute -inset-4 bg-navy/50/10 rounded-full blur-2xl animate-pulse"></div>
                                                <div className="w-32 h-32 border-[8px] border-slate-50 border-t-navy rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Sparkles size={48} className="text-navy" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 max-w-sm">
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">AI Strategy Session</h3>
                                                <div className="h-8 flex items-center justify-center overflow-hidden">
                                                    <AnimatePresence mode="wait">
                                                        <motion.p
                                                            key={loadingMessage}
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            exit={{ y: -20, opacity: 0 }}
                                                            className="text-navy font-black text-sm uppercase tracking-widest"
                                                        >
                                                            {loadingMessage}
                                                        </motion.p>
                                                    </AnimatePresence>
                                                </div>
                                                <div className="flex gap-1 justify-center">
                                                    {[0, 1, 2].map((i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                            className="w-1.5 h-1.5 bg-navy rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-12">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-emerald-100">Live Analysis Ready</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                                                        Global Expansion Strategy
                                                    </h2>
                                                    <p className="text-slate-500 text-lg font-bold">
                                                        Based on your
                                                        <span className="relative group mx-1 inline-block">
                                                            <span className="text-navy font-extrabold border-b-2 border-dashed border-blue-400 cursor-help pb-0.5">
                                                                {formData.productGroups[0]?.certificates?.length || 0} Certifications
                                                            </span>
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-slate-900 text-white p-4 rounded-2xl text-xs shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                                <div className="font-bold mb-2 border-b border-slate-700 pb-2">Analysis Foundation:</div>
                                                                <ul className="space-y-1.5">
                                                                    {(formData.productGroups[0]?.certificates || []).map((cert, i) => (
                                                                        <li key={i} className="flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                            {cert}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-b-slate-900"></div>
                                                            </div>
                                                        </span>
                                                        and <span className="text-slate-900 font-black italic">LOX AI RADAR</span>.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* AI Insight Regions & Rows */}
                                            <div className="space-y-12">
                                                {aiSuggestions.map((region: any, regionIdx: number) => (
                                                    <div key={regionIdx} className="space-y-6">
                                                        <div className="flex items-center gap-4 px-4">
                                                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                                                                {regionIdx === 0 ? <Trophy size={12} className="text-amber-500" /> : <Globe size={12} />}
                                                                {region.region_name?.includes('Mock') ? 'Top Strategic Opportunities' : region.region_name}
                                                            </h3>
                                                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            {region.countries?.map((country: any, i: number) => {
                                                                const boldCertificates = (reason: string, certificates: string[]) => {
                                                                    if (!reason || !certificates || certificates.length === 0) return reason;
                                                                    let processedReason = reason;
                                                                    certificates.forEach(cert => {
                                                                        const regex = new RegExp(`\\b(${cert})\\b`, 'gi');
                                                                        processedReason = processedReason.replace(regex, '<strong>$1</strong>');
                                                                    });
                                                                    return processedReason;
                                                                };

                                                                const processedReason = boldCertificates(country.reason, formData.productGroups[0]?.certificates || []);
                                                                const isSelected = formData.targetMarkets.includes(country.country_name);

                                                                return (
                                                                    <motion.div
                                                                        key={i}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: (regionIdx * 0.1) + (i * 0.05) }}
                                                                        onClick={() => toggleMarket(country.country_name)}
                                                                        className={`group flex items-center p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${isSelected
                                                                            ? 'border-navy bg-white shadow-xl shadow-navy/50/5 ring-4 ring-navy/5'
                                                                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 grayscale opacity-80'
                                                                            }`}
                                                                    >
                                                                        {/* Flag & Name */}
                                                                        <div className="flex items-center gap-6 w-1/4">
                                                                            <div className="text-5xl drop-shadow-sm group-hover:scale-110 transition-transform">{country.flag}</div>
                                                                            <div className="space-y-1">
                                                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">{country.country_name}</h4>
                                                                                <div className={`flex items-center gap-1.5 ${isSelected ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                                                                                    <Zap size={10} className="fill-navy/50 text-navy/50" />
                                                                                    <span className="text-[10px] font-black text-navy uppercase tracking-widest">{country.match_score}% High Match</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* AI Strategy Reasoning */}
                                                                        <div className="flex-1 px-8 border-l border-r border-slate-100">
                                                                            <p
                                                                                className="text-sm text-slate-600 leading-relaxed font-semibold italic text-balance"
                                                                                dangerouslySetInnerHTML={{ __html: `"${processedReason}"` }}
                                                                            ></p>
                                                                        </div>

                                                                        {/* Volume & Select */}
                                                                        <div className="w-1/4 flex items-center justify-end gap-10 pl-8">
                                                                            <div className="flex flex-col items-end gap-0.5">
                                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Est. Market Size</p>
                                                                                <p className="text-base font-black text-slate-900">{country.market_volume}</p>
                                                                            </div>

                                                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                                                ? 'bg-navy border-navy text-white shadow-lg shadow-blue-200'
                                                                                : 'bg-white border-slate-200 text-transparent'
                                                                                }`}>
                                                                                <Check size={16} strokeWidth={4} />
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Final Target List Section */}
                                            <div className="mt-16 pt-12 border-t border-slate-100">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Selected Target Markets</h3>
                                                        <p className="text-xs text-slate-400 font-bold">This is your final strategic expansion list.</p>
                                                    </div>
                                                    <span className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        {formData.targetMarkets.length} Total Selected
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    <AnimatePresence mode="popLayout">
                                                        {formData.targetMarkets.map(m => {
                                                            const aiCountry = aiSuggestions.flatMap((r: any) => r.countries || []).find((s: any) => s?.country_name === m);
                                                            return (
                                                                <motion.div
                                                                    key={m}
                                                                    layout
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                    className="group flex items-center justify-between p-3 px-6 rounded-2xl border border-slate-100 bg-white transition-all shadow-sm h-[60px]"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-2xl drop-shadow-sm">{getCountryFlag(m)}</div>
                                                                        <div className="flex flex-col">
                                                                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{m}</h4>
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                                {aiCountry ? 'Master Recommendation' : 'Custom Entry'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => toggleMarket(m)}
                                                                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                                                        title="Remove Market"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </AnimatePresence>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 px-6">
                                                            <span className="text-[10px] font-black text-navy uppercase tracking-widest animate-pulse">💡 Pro Tip:</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manually adding neighboring countries creates a stronger regional route.</span>
                                                        </div>
                                                        <motion.div
                                                            className="relative group"
                                                            animate={{
                                                                boxShadow: ["0 0 0 0px rgba(59, 130, 246, 0)", "0 0 0 10px rgba(59, 130, 246, 0.05)", "0 0 0 0px rgba(59, 130, 246, 0)"]
                                                            }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        >
                                                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                                                                <Search size={18} className="text-slate-400 group-focus-within:text-navy transition-colors" />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={marketInput}
                                                                onFocus={() => setShowCountryDropdown(true)}
                                                                onChange={(e) => {
                                                                    setMarketInput(e.target.value);
                                                                    setShowCountryDropdown(true);
                                                                }}
                                                                onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                                                                placeholder="Type a country name (e.g. Brazil, Canada...)"
                                                                className="relative w-full px-14 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] focus:bg-white focus:border-navy focus:border-solid outline-none text-sm font-bold text-slate-500 focus:text-slate-900 transition-all shadow-sm"
                                                            />

                                                            {showCountryDropdown && marketInput && (
                                                                <div className="absolute bottom-full left-0 right-0 mb-4 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] max-h-[300px] overflow-y-auto">
                                                                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a Country to Add</span>
                                                                    </div>
                                                                    {COUNTRIES.filter(c =>
                                                                        c.name.toLowerCase().includes(marketInput.toLowerCase()) &&
                                                                        !formData.targetMarkets.includes(c.name)
                                                                    ).slice(0, 10).map((c) => (
                                                                        <div
                                                                            key={c.code}
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault(); // Prevent input onBlur from closing this too fast
                                                                                addMarket(c.name);
                                                                                setMarketInput('');
                                                                                setShowCountryDropdown(false);
                                                                                toast.success(`${c.name} added to strategy`, { icon: getFlagEmoji(c.code) });
                                                                            }}
                                                                            className="px-8 py-4 hover:bg-navy/5 cursor-pointer flex items-center gap-4 transition-colors group/item"
                                                                        >
                                                                            <span className="text-2xl group-hover/item:scale-125 transition-transform">{getFlagEmoji(c.code)}</span>
                                                                            <span className="font-bold text-slate-700">{c.name}</span>
                                                                            <Plus size={14} className="ml-auto text-slate-300 group-hover/item:text-navy" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}


                            {/* STEP 3: IDEAL CUSTOMERS */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="customers"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Target size={16} className="text-navy" />
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Ideal Buyer Profile</h2>
                                        </div>
                                        <p className="text-slate-500 font-bold text-lg">
                                            AI has identified high-potential segments for <span className="text-navy font-black">{formData.productGroups[0]?.name || 'your product'}</span>.
                                        </p>
                                    </div>

                                    {isAnalyzingBuyerProfile ? (
                                        <div className="py-20 flex flex-col items-center justify-center gap-6">
                                            <div className="relative">
                                                <div className="w-20 h-20 border-4 border-blue-100 border-t-navy rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Zap size={24} className="text-navy animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <p className="text-lg font-black text-slate-900">Identifying Decision Makers...</p>
                                                <p className="text-sm text-slate-400 font-bold animate-pulse">Mapping industry purchase patterns & role hierarchies</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-10">
                                            {/* Section A: Target Industries */}
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-navy uppercase tracking-widest mb-1">Section A</span>
                                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Target Industries</h3>
                                                    </div>
                                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        {formData.targetIndustries.length} / 8 Selected
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {buyerSuggestions.suggested_industries.map(industry => {
                                                        const isSelected = formData.targetIndustries.includes(industry);
                                                        return (
                                                            <div
                                                                key={industry}
                                                                onClick={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        targetIndustries: isSelected
                                                                            ? prev.targetIndustries.filter(i => i !== industry)
                                                                            : [...prev.targetIndustries, industry]
                                                                    }))
                                                                }}
                                                                className={`group p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-4
                                                                    ${isSelected
                                                                        ? 'border-navy bg-navy/5/50 shadow-lg shadow-navy/50/5'
                                                                        : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'
                                                                    }`}
                                                            >
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-navy text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-navy/5'}`}>
                                                                    <Building2 size={24} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className={`font-black tracking-tight ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{industry}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">High Potential Segment</p>
                                                                </div>
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 text-transparent'}`}>
                                                                    <Check size={12} strokeWidth={4} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div
                                                        onClick={() => setShowIndustrySelectorModal(true)}
                                                        className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/30 flex items-center gap-4 cursor-pointer hover:border-slate-300 transition-all"
                                                    >
                                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                            <Plus size={24} />
                                                        </div>
                                                        <span className="font-bold text-slate-400">Add Custom Industry</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section B: Decision Makers */}
                                            <div className="space-y-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Section B</span>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Main Decision Makers</h3>
                                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        {formData.targetJobTitles.length} / 6 Selected
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    {buyerSuggestions.suggested_roles.map(role => {
                                                        const isSelected = formData.targetJobTitles.includes(role);
                                                        return (
                                                            <div
                                                                key={role}
                                                                onClick={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        targetJobTitles: isSelected
                                                                            ? prev.targetJobTitles.filter(r => r !== role)
                                                                            : [...prev.targetJobTitles, role]
                                                                    }))
                                                                }}
                                                                className={`px-6 py-4 rounded-full border-2 cursor-pointer transition-all flex items-center gap-3
                                                                    ${isSelected
                                                                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-black shadow-md'
                                                                        : 'border-slate-100 bg-white text-slate-500 hover:border-amber-200'
                                                                    }`}
                                                            >
                                                                <User size={16} className={isSelected ? 'text-amber-600' : 'text-slate-400'} />
                                                                <span className="text-sm tracking-tight">{role}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    <div
                                                        onClick={() => setShowRoleSelectorModal(true)}
                                                        className="px-6 py-4 rounded-full border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold flex items-center gap-2 cursor-pointer hover:border-slate-300"
                                                    >
                                                        <Plus size={14} /> Other Role
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 4: PLAN SELECTION */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="plans"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="text-center space-y-2">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Choose Your Plan</h2>
                                        <p className="text-slate-500 text-lg font-bold">Scale your global reach with AI-powered lead generation</p>
                                    </div>


                                    {/* Billing Cycle Toggle - Premium Pill Style */}
                                    <div className="flex items-center justify-center">
                                        <div className="p-1.5 bg-slate-100 rounded-full flex gap-1">
                                            <button
                                                onClick={() => setBillingCycle('monthly')}
                                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${billingCycle === 'monthly'
                                                    ? 'bg-white text-slate-900 shadow-md'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                Monthly
                                            </button>
                                            <button
                                                onClick={() => setBillingCycle('yearly')}
                                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                                    ? 'bg-gradient-to-r from-navy to-indigo-600 text-white shadow-lg shadow-blue-200'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                Yearly
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${billingCycle === 'yearly'
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    Save 20%
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Plan Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Free Trial */}
                                        <div className="relative p-8 rounded-[2.5rem] border-2 border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col">
                                            <div className="space-y-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                                    <Globe size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Explorer</h3>
                                                    <p className="text-sm text-slate-500 font-bold mt-1">Try before you buy</p>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-slate-900">$0</span>
                                                    <span className="text-slate-400 text-sm font-bold">/ 7 days</span>
                                                </div>
                                                <div className="pt-2 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <Zap size={16} className="text-amber-500" />
                                                        <span className="text-sm font-black text-slate-900">10 Verified Leads</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Trial pack for new hunters</p>
                                                </div>
                                            </div>
                                            <div className="mt-8 space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                    <span className="text-sm text-slate-700 font-medium">1 Market Analysis</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                    <span className="text-sm text-slate-700 font-medium">Basic Email Outreach</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <X size={16} className="text-slate-300 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                    <span className="text-sm text-slate-300 font-medium">Verified Emails</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedPlan('free');
                                                    finishOnboarding(); // Go straight to dashboard
                                                }}
                                                className="mt-8 w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                            >
                                                Start Free Trial
                                            </button>
                                        </div>

                                        {/* Starter (Most Popular) - HERO CARD */}
                                        <div className="relative rounded-[2.5rem] flex flex-col transform scale-110 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.35)]" style={{ zIndex: 10 }}>
                                            {/* Badge */}
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-navy to-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-lg z-20">
                                                ⚡ Most Popular
                                            </div>

                                            {/* Gradient Header */}
                                            <div className="p-8 pb-6 bg-gradient-to-br from-navy via-navy/50 to-indigo-600 rounded-t-[2.5rem]">
                                                <div className="space-y-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur text-white flex items-center justify-center">
                                                        <Zap size={28} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white tracking-tight">Starter</h3>
                                                        <p className="text-sm text-blue-100 font-bold mt-1">For growing exporters</p>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-5xl font-black text-white">
                                                            ${billingCycle === 'yearly' ? '39' : '49'}
                                                        </span>
                                                        <span className="text-blue-100 text-sm font-bold">/month</span>
                                                    </div>
                                                    {billingCycle === 'yearly' && (
                                                        <div className="text-xs text-white/90 font-bold bg-white/10 inline-block px-3 py-1 rounded-full">
                                                            $468/year (Save $120)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* White Body */}
                                            <div className="p-8 pt-6 bg-white rounded-b-[2.5rem] border-2 border-t-0 border-navy">
                                                <div className="pb-6 border-b border-blue-100">
                                                    <div className="flex items-center gap-2">
                                                        <Zap size={16} className="text-amber-500" />
                                                        <span className="text-sm font-black text-slate-900">500 Leads / mo</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Verified decision makers</p>
                                                </div>
                                                <div className="mt-6 space-y-3">
                                                    <div className="flex items-start gap-2">
                                                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                        <span className="text-sm text-slate-700 font-medium">3 Active Markets</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                        <span className="text-sm text-slate-700 font-medium">Email Campaign Templates</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                        <span className="text-sm text-slate-700 font-medium">CSV/Excel Export</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                        <span className="text-sm text-slate-700 font-medium">Priority Support</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPlan('starter');
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="mt-8 w-full py-4 bg-gradient-to-r from-navy to-indigo-600 text-white rounded-2xl font-black text-lg tracking-tight hover:shadow-2xl hover:shadow-blue-300 transition-all shadow-lg"
                                                >
                                                    Subscribe Now →
                                                </button>
                                            </div>
                                        </div>

                                        {/* Pro Hunter */}
                                        <div className="relative p-8 rounded-[2.5rem] border-2 border-indigo-200 bg-white hover:border-indigo-300 transition-all flex flex-col">
                                            <div className="space-y-4">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                                                    <ShieldCheck size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pro Hunter</h3>
                                                    <p className="text-sm text-slate-500 font-bold mt-1">For serious exporters</p>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black text-indigo-600">
                                                        ${billingCycle === 'yearly' ? '159' : '199'}
                                                    </span>
                                                    <span className="text-slate-400 text-sm font-bold">/month</span>
                                                </div>
                                                {billingCycle === 'yearly' && (
                                                    <div className="text-xs text-green-600 font-bold">
                                                        $1,908/year (Save $480)
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t border-indigo-100">
                                                    <div className="flex items-center gap-2">
                                                        <Zap size={16} className="text-amber-500" />
                                                        <span className="text-sm font-black text-slate-900">2,500 Leads / mo</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">High-volume export intelligence</p>
                                                </div>
                                            </div>
                                            <div className="mt-8 space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                    <span className="text-sm text-slate-700 font-medium">Unlimited Markets</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                    <span className="text-sm text-slate-700 font-medium font-black">✨ Verified Decision Maker Emails</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                    <span className="text-sm text-slate-700 font-medium">CRM Sync (Salesforce, HubSpot)</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                                    <span className="text-sm text-slate-700 font-medium">Dedicated Account Manager</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedPlan('pro');
                                                    setShowPaymentModal(true);
                                                }}
                                                className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black tracking-tight hover:bg-indigo-700 transition-all"
                                            >
                                                Go Pro
                                            </button>
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons - Hidden on Step 4 (Pricing) */}
                    {currentStep !== 4 && (
                        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                className={`flex items-center gap-2 px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
                            >
                                Back
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={
                                    loading ||
                                    (currentStep === 2 && analyzing) ||
                                    (currentStep === 3 && (formData.targetIndustries.length < 3 || formData.targetJobTitles.length < 3))
                                }
                                className="group flex items-center gap-3 px-10 py-5 bg-navy text-white rounded-[1.5rem] font-black tracking-tight hover:bg-blue-700 transition-all shadow-2xl shadow-navy/30 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                            >
                                {(loading || (currentStep === 2 && analyzing)) ? <LoadingSpinner size="sm" className="text-white" /> : (
                                    <>
                                        {currentStep === steps.length - 1 ? 'Start Exporting' : 'Continue'}
                                        <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div >

            <AnimatePresence>
                {showBioModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-navy/5 text-navy rounded-xl flex items-center justify-center">
                                        <Sparkles size={22} className={isGeneratingBio ? "animate-pulse" : ""} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Profile Confirmation</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Required</p>
                                    </div>
                                </div>

                                {isGeneratingBio ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                                        <div className="w-12 h-12 border-4 border-blue-100 border-t-navy rounded-full animate-spin"></div>
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900">Generating Value Proposition...</p>
                                            <p className="text-sm text-slate-400 font-medium">Combining portfolio data with industry insights</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-lg font-bold text-slate-800 leading-tight">Does this accurately represent <span className="text-navy">{formData.companyName}</span>?</p>
                                            <p className="text-xs text-slate-400 font-medium italic">We'll use this description to personalize your outreach campaigns.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-4 text-slate-300 group-focus-within:text-navy/50 transition-colors" size={18} />
                                                <textarea
                                                    value={tempBio}
                                                    onChange={(e) => setTempBio(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-navy/50 focus:shadow-lg focus:shadow-blue-100 transition-all outline-none font-bold text-slate-700 shadow-sm text-sm h-32 resize-none"
                                                    placeholder="Describe your company's value proposition..."
                                                />
                                                <div className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-300">
                                                    {tempBio.length} Characters
                                                </div>
                                            </div>

                                            {/* Validation Feedback */}
                                            {tempBio.trim().length > 0 && tempBio.trim().length < 50 && (
                                                <div className="text-xs text-orange-500 font-bold flex items-center gap-1 px-2">
                                                    ⚠️ Minimum 50 characters required ({50 - tempBio.trim().length} more)
                                                </div>
                                            )}

                                            {tempBio.trim().length >= 50 && (
                                                <div className="text-xs text-green-600 font-bold flex items-center gap-1 px-2">
                                                    ✓ Looking good!
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => {
                                                    // Validation check
                                                    if (tempBio.trim().length < 50) {
                                                        toast.error('Please provide a description of at least 50 characters');
                                                        return;
                                                    }

                                                    setFormData(prev => ({ ...prev, companyDescription: tempBio }));
                                                    setShowBioModal(false);
                                                    setCurrentStep(2); // Proceed to Strategy
                                                    analyzeMarkets(); // Trigger Market Discovery
                                                    savePartialProfile();
                                                }}
                                                disabled={tempBio.trim().length < 50}
                                                className={`w-full py-4 rounded-2xl font-black tracking-tight transition-all shadow-lg flex items-center justify-center gap-2 group/btn ${tempBio.trim().length < 50
                                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                                    : 'bg-navy text-white hover:bg-blue-700 shadow-blue-200'
                                                    }`}
                                            >
                                                Confirm & Continue
                                                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>

                                            <button
                                                onClick={generateAISummary}
                                                className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Sparkles size={16} /> Regenerate
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Industry Selector Modal */}
            <AnimatePresence>
                {showIndustrySelectorModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowIndustrySelectorModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Target Sectors</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select from common industries or add your own</p>
                                    </div>
                                    <button
                                        onClick={() => setShowIndustrySelectorModal(false)}
                                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-navy uppercase tracking-widest">Quick Select</span>
                                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                                        {STANDARD_INDUSTRIES.map((industry) => {
                                            const isSelected = selectedStandardIndustries.includes(industry);
                                            return (
                                                <div
                                                    key={industry}
                                                    onClick={() => {
                                                        setSelectedStandardIndustries(prev =>
                                                            isSelected
                                                                ? prev.filter(i => i !== industry)
                                                                : [...prev, industry]
                                                        );
                                                    }}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${isSelected
                                                        ? 'border-navy bg-navy/5/50'
                                                        : 'border-slate-100 hover:border-blue-200'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-navy border-navy' : 'border-slate-300'
                                                        }`}>
                                                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                                        {industry}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Custom Industry</span>
                                    <input
                                        type="text"
                                        value={customIndustryInput}
                                        onChange={(e) => setCustomIndustryInput(e.target.value)}
                                        placeholder="Type industry name (e.g., Marine Equipment)"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-purple-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedStandardIndustries([]);
                                            setCustomIndustryInput('');
                                            setShowIndustrySelectorModal(false);
                                        }}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddIndustries}
                                        className="flex-1 py-4 bg-navy text-white rounded-2xl font-black tracking-tight hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Add Selected ({selectedStandardIndustries.length + (customIndustryInput.trim() ? 1 : 0)})
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Role Selector Modal */}
            <AnimatePresence>
                {showRoleSelectorModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowRoleSelectorModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Decision Makers</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select job titles or add custom ones</p>
                                    </div>
                                    <button
                                        onClick={() => setShowRoleSelectorModal(false)}
                                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Common Roles</span>
                                    <div className="flex flex-wrap gap-3">
                                        {STANDARD_ROLES.map((role) => {
                                            const isSelected = selectedStandardRoles.includes(role);
                                            return (
                                                <div
                                                    key={role}
                                                    onClick={() => {
                                                        setSelectedStandardRoles(prev =>
                                                            isSelected
                                                                ? prev.filter(r => r !== role)
                                                                : [...prev, role]
                                                        );
                                                    }}
                                                    className={`px-5 py-3 rounded-full border-2 cursor-pointer transition-all flex items-center gap-2 ${isSelected
                                                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                                                        : 'border-slate-200 text-slate-700 hover:border-amber-200'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-600' : 'border-slate-300'
                                                        }`}>
                                                        {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                    <span className="text-sm font-bold">
                                                        {role}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Custom Role</span>
                                    <input
                                        type="text"
                                        value={customRoleInput}
                                        onChange={(e) => setCustomRoleInput(e.target.value)}
                                        placeholder="Type job title (e.g., Chief Technology Officer)"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-purple-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedStandardRoles([]);
                                            setCustomRoleInput('');
                                            setShowRoleSelectorModal(false);
                                        }}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddRoles}
                                        className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black tracking-tight hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Add Selected ({selectedStandardRoles.length + (customRoleInput.trim() ? 1 : 0)})
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
                        onClick={() => setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Complete Payment</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Secure Checkout</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                {/* Order Summary */}
                                <div className="p-6 bg-gradient-to-br from-navy/5 to-indigo-50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900">
                                                {selectedPlan === 'starter' ? 'Starter Plan' : 'Pro Hunter Plan'}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {billingCycle === 'yearly' ? 'Annual Subscription' : 'Monthly Subscription'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-navy">
                                                ${selectedPlan === 'starter'
                                                    ? (billingCycle === 'yearly' ? '39' : '49')
                                                    : (billingCycle === 'yearly' ? '159' : '199')
                                                }
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium">per month</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <Zap size={16} className="text-amber-500" />
                                        <span className="font-bold">
                                            {selectedPlan === 'starter' ? '500' : '5,000'} AI Credits included monthly
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Form Placeholder */}
                                <div className="space-y-4">
                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                                        <CreditCard className="mx-auto text-slate-300" size={48} />
                                        <div>
                                            <p className="font-black text-slate-900 text-lg">Payment Gateway Integration</p>
                                            <p className="text-sm text-slate-500 font-medium mt-1">
                                                Stripe / Iyzico payment form will load here
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                                            <ShieldCheck size={14} />
                                            <span>256-bit SSL Encrypted Payment</span>
                                        </div>
                                    </div>

                                    {/* Temporary: Simulate Payment */}
                                    <button
                                        onClick={async () => {
                                            setShowPaymentModal(false);
                                            toast.success('Payment successful! Redirecting to dashboard...');
                                            await finishOnboarding();
                                        }}
                                        className="w-full py-4 bg-navy text-white rounded-2xl font-black tracking-tight hover:bg-blue-700 transition-all shadow-lg shadow-blue-300 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Complete Payment (Demo)
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck size={14} />
                                        <span>Secure</span>
                                    </div>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                    <div className="flex items-center gap-1">
                                        <Check size={14} />
                                        <span>Cancel Anytime</span>
                                    </div>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                    <div>30-Day Money Back</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* AI PROCESSING OVERLAY - PREMIUM GLASSMORPHISM */}
            <AnimatePresence>
                {isAILoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="relative w-full max-w-xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-12 text-center overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]"
                        >
                            {/* Animated Background Orbs */}
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-navy/50/20 rounded-full blur-[100px] animate-pulse" />
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-center">
                                    <div className="relative group">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 10, -10, 0]
                                            }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="w-24 h-24 bg-gradient-to-br from-navy to-indigo-700 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-navy/50/40 border border-white/20"
                                        >
                                            <Sparkles size={40} className="text-white animate-pulse" />
                                        </motion.div>

                                        {/* Orbiting Icons */}
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={aiLoadingStage}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg text-navy"
                                            >
                                                {(() => {
                                                    const Icon = AI_LOADER_STAGES[aiLoadingStage].icon;
                                                    return <Icon size={20} />;
                                                })()}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-white tracking-tight">AI Intelligence Engine</h3>

                                    <div className="h-8 overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={aiLoadingStage}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="text-blue-200 font-bold tracking-wide"
                                            >
                                                {AI_LOADER_STAGES[aiLoadingStage].msg}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-400 to-navy"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 6, ease: "linear" }}
                                    />
                                </div>

                                <div className="flex justify-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Processing Real-Time Data</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
