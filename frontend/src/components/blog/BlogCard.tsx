import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '../data/blog-content';

interface BlogCardProps {
    post: BlogPost;
    lang: 'en' | 'tr';
}

const BlogCard: React.FC<BlogCardProps> = ({ post, lang }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
        >
            <div className="relative h-64 overflow-hidden">
                {/* Placeholder gradient if no image, or real image */}
                <div className={`absolute inset-0 bg-gradient-to-br ${lang === 'en' ? 'from-navy to-blue-900' : 'from-yellow/20 to-orange-500/20'
                    }`} />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-navy font-bold px-3 py-1 rounded text-xs uppercase tracking-wide">
                    {post.category}
                </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center space-x-4 text-gray-400 text-xs mb-4">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {post.publishDate}
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                    </div>
                </div>

                <h3 className="text-xl font-bold font-heading text-navy mb-3 line-clamp-2 group-hover:text-yellow transition-colors">
                    {post.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                </p>

                <div className="mt-auto">
                    <button
                        onClick={() => navigate(`/${lang}/blog/${post.slug}`)}
                        className="text-navy font-bold text-sm flex items-center space-x-2 group-hover:space-x-4 transition-all"
                    >
                        <span>{lang === 'en' ? 'Read Article' : 'Devamını Oku'}</span>
                        <ArrowRight className="w-4 h-4 text-yellow" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default BlogCard;
