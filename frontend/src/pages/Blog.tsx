import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { getPostsByLang } from '../data/blog-content';
import BlogCard from '../components/blog/BlogCard';
import SEO from '../components/seo/SEO';

const Blog = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const posts = getPostsByLang(lang);

    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    const t = {
        en: {
            title: "Insights & Market Analysis",
            subtitle: "Expert guides on entering the Turkish market, logistics, and supply chain management.",
            heroTag: "LOXTR BLOG"
        },
        tr: {
            title: "İhracat Rehberi ve Analizler",
            subtitle: "Global pazarlara açılmak, gümrük süreçleri ve lojistik hakkında uzman içerikleri.",
            heroTag: "LOXTR BLOG"
        }
    }[lang];

    return (
        <div className="bg-off-white min-h-screen pt-20">
            <SEO
                title={t.title}
                description={t.subtitle}
                // Determine canonical URL dynamically based on lang
                canonicalUrl={`https://www.loxtr.com/${lang}/blog`}
            />

            {/* Hero Section */}
            <section className="relative h-[60vh] bg-navy overflow-hidden flex items-center justify-center text-center" ref={ref}>
                <motion.div style={{ y }} className="absolute inset-0 opacity-30">
                    {/* Abstract Background */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-navy to-navy"></div>
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-yellow/5 rounded-full blur-[100px]"></div>
                </motion.div>

                <div className="relative z-10 container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-yellow text-xs font-bold tracking-[0.2em] mb-6 backdrop-blur">
                            {t.heroTag}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
                            {t.title}
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
                            {t.subtitle}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 relative z-20 -mt-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <BlogCard key={post.id} post={post} lang={lang} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Blog;
