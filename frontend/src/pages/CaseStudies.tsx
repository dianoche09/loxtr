import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { ArrowRight, Trophy, TrendingUp, Building2 } from 'lucide-react';
import { caseStudiesService } from '../services/caseStudies';
import type { CaseStudy } from '../services/caseStudies';
import { useGeo } from '../context/GeoContext';
import SEO from '../components/seo/SEO';

const CaseStudies = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const { } = useGeo();

    const [cases, setCases] = useState<CaseStudy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isTR = lang === 'tr';

    useEffect(() => {
        const fetchCases = async () => {
            try {
                setLoading(true);
                // EN -> Market Entry (Foreign entering Turkey)
                // TR -> Export (Turkish going Global)
                const type = isTR ? 'export' : 'market_entry';
                const data = await caseStudiesService.getCaseStudies({ type });
                setCases(data);
            } catch (err) {
                console.error('Failed to fetch case studies:', err);
                setError('Failed to load success stories.');
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, [lang, isTR]);

    const pageTitle = isTR ? 'Başarı Hikayeleri' : 'Success Stories';
    const pageSubtitle = isTR
        ? 'Türk markalarını dünya pazarlarına taşıyan yolculuklarımız.'
        : 'Real results for global brands entering the Turkish market.';

    return (
        <div className="pt-20 min-h-screen bg-white">
            <SEO
                title={`${pageTitle} - LOXTR`}
                description={pageSubtitle}
            />

            {/* Hero Section */}
            <section className="bg-navy text-white py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-heading mb-6 text-yellow">{pageTitle}</h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">{pageSubtitle}</p>
                    </motion.div>
                </div>
            </section>

            {/* Attributes Filter / Stats (Optional/Placeholder) */}
            <div className="bg-navy-800 py-6 border-b border-gray-100">
                <div className="container mx-auto px-6 flex justify-center space-x-12 text-center">
                    {/* Could add aggregated stats here like "50+ Brands", "$100M+ Volume" */}
                </div>
            </div>

            {/* Case Studies Grid */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-20">{error}</div>
                    ) : cases.length === 0 ? (
                        <div className="text-center text-gray-500 py-20">
                            {isTR ? 'Henüz eklenmiş bir başarı hikayesi yok.' : 'No case studies available yet.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {cases.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group"
                                >
                                    <Link to={`/${lang}/case-studies/${item.slug}`} className="block h-full">
                                        <div className="relative overflow-hidden rounded-xl aspect-video mb-6 bg-gray-100">
                                            {item.featured_image ? (
                                                <img
                                                    src={item.featured_image}
                                                    alt={isTR ? item.title_tr : item.title_en}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-navy/5 text-navy/20">
                                                    <Trophy className="w-16 h-16" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-yellow text-navy px-3 py-1 font-bold text-sm rounded uppercase tracking-wider">
                                                {item.client_industry}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-navy mb-3 group-hover:text-yellow transition-colors">
                                            {isTR ? item.title_tr : item.title_en}
                                        </h3>

                                        {item.metrics && Object.keys(item.metrics).length > 0 && (
                                            <div className="flex gap-4 mb-4 text-sm font-medium text-navy/70">
                                                {Object.entries(item.metrics).slice(0, 2).map(([key, value]) => (
                                                    <div key={key} className="flex items-center bg-gray-50 px-3 py-1 rounded">
                                                        <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                                                        <span>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-4 text-navy font-bold border-t border-gray-100 pt-4">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Building2 className="w-4 h-4 mr-2" />
                                                {item.client_company}
                                            </div>
                                            <span className="flex items-center group-hover:translate-x-1 transition-transform">
                                                {isTR ? 'İncele' : 'Read Case'} <ArrowRight className="ml-2 w-4 h-4" />
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CaseStudies;
