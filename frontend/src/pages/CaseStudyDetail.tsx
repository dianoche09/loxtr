import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Trophy, Quote, TrendingUp } from 'lucide-react';
import { caseStudiesService } from '../services/caseStudies';
import type { CaseStudy } from '../services/caseStudies';
import SEO from '../components/seo/SEO';

const CaseStudyDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Determine language from URL manually or handle generic
    const isTR = window.location.pathname.startsWith('/tr');
    const lang = isTR ? 'tr' : 'en';

    useEffect(() => {
        const fetchCase = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await caseStudiesService.getCaseStudyBySlug(slug);
                setCaseStudy(data);
            } catch (err) {
                console.error('Failed to fetch case study:', err);
                setError(isTR ? 'Hikaye bulunamadı.' : 'Case study not found.');
            } finally {
                setLoading(false);
            }
        };

        fetchCase();
    }, [slug, isTR]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
            </div>
        );
    }

    if (error || !caseStudy) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-20">
                <p className="text-xl text-navy mb-4">{error || 'Not Found'}</p>
                <Link to={`/${lang}/case-studies`} className="text-yellow font-bold hover:underline">
                    {isTR ? 'Listeye Dön' : 'Back to List'}
                </Link>
            </div>
        );
    }

    const title = isTR ? caseStudy.title_tr : caseStudy.title_en;
    const challenge = isTR ? caseStudy.challenge_tr : caseStudy.challenge_en;
    const solution = isTR ? caseStudy.solution_tr : caseStudy.solution_en;
    const result = isTR ? caseStudy.result_tr : caseStudy.result_en;
    const testimonial = isTR ? caseStudy.testimonial_text_tr : caseStudy.testimonial_text_en;

    return (
        <div className="pt-20 min-h-screen bg-white font-body">
            <SEO
                title={`${title} - LOXTR Case Study`}
                description={challenge.substring(0, 150) + '...'}
                ogImage={caseStudy.featured_image || undefined}
            />

            {/* Hero */}
            <section className="relative h-[60vh] bg-navy flex items-end">
                {caseStudy.featured_image && (
                    <div className="absolute inset-0">
                        <img
                            src={caseStudy.featured_image}
                            alt={title}
                            className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
                    </div>
                )}

                <div className="container mx-auto px-6 pb-20 relative z-10 text-white">
                    <Link to={`/${lang}/case-studies`} className="inline-flex items-center text-white/60 hover:text-yellow mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {isTR ? 'Başarı Hikayelerine Dön' : 'Back to Success Stories'}
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-block px-3 py-1 bg-yellow text-navy font-bold rounded text-sm mb-4 uppercase tracking-widest">
                            {caseStudy.client_industry}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight max-w-4xl">
                            {title}
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Story */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Challenge */}
                        <div>
                            <h2 className="text-3xl font-heading text-navy mb-6 flex items-center">
                                <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-4"><TrendingUp className="w-6 h-6 rotate-180" /></span>
                                {isTR ? 'Zorluk' : 'The Challenge'}
                            </h2>
                            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line">
                                {challenge}
                            </div>
                        </div>

                        {/* Solution */}
                        <div>
                            <h2 className="text-3xl font-heading text-navy mb-6 flex items-center">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-4"><Building2 className="w-6 h-6" /></span>
                                {isTR ? 'Çözüm' : 'Our Solution'}
                            </h2>
                            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line">
                                {solution}
                            </div>
                        </div>

                        {/* Result */}
                        <div>
                            <h2 className="text-3xl font-heading text-navy mb-6 flex items-center">
                                <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-4"><Trophy className="w-6 h-6" /></span>
                                {isTR ? 'Sonuç' : 'The Result'}
                            </h2>
                            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line">
                                {result}
                            </div>
                        </div>

                        {/* Testimonial */}
                        {testimonial && (
                            <div className="bg-navy p-10 rounded-2xl text-white relative overflow-hidden">
                                <Quote className="absolute top-4 left-4 w-16 h-16 text-white/10" />
                                <blockquote className="relative z-10 text-xl md:text-2xl font-light italic mb-6">
                                    "{testimonial}"
                                </blockquote>
                                <div className="flex items-center space-x-4">
                                    {caseStudy.client_logo && (
                                        <img src={caseStudy.client_logo} alt="Logo" className="w-12 h-12 bg-white rounded-full p-1" />
                                    )}
                                    <div>
                                        <div className="font-bold">{caseStudy.testimonial_author}</div>
                                        <div className="text-white/60 text-sm">{caseStudy.testimonial_role}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Client Info Card */}
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                            <h3 className="font-heading text-xl text-navy mb-6 border-b border-gray-200 pb-4">
                                {isTR ? 'Müşteri Profili' : 'Client Profile'}
                            </h3>

                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">{isTR ? 'Şirket' : 'Company'}</dt>
                                    <dd className="font-bold text-navy text-lg">{caseStudy.client_company}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">{isTR ? 'Sektör' : 'Industry'}</dt>
                                    <dd className="font-bold text-navy">{caseStudy.client_industry}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 mb-1">{isTR ? 'Ülke' : 'Location'}</dt>
                                    <dd className="font-bold text-navy flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-yellow" />
                                        {caseStudy.client_country}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Metrics Card */}
                        {caseStudy.metrics && Object.keys(caseStudy.metrics).length > 0 && (
                            <div className="bg-yellow p-8 rounded-2xl text-navy">
                                <h3 className="font-heading text-xl mb-6 border-b border-navy/10 pb-4">
                                    {isTR ? 'Rakamlarla Başarı' : 'Key Metrics'}
                                </h3>
                                <div className="space-y-6">
                                    {Object.entries(caseStudy.metrics).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="text-4xl font-bold mb-1">{value}</div>
                                            <div className="opacity-70 text-sm uppercase tracking-wider font-bold">{key.replace(/_/g, ' ')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
};

export default CaseStudyDetail;
