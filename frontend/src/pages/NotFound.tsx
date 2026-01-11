// 404 Page
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/seo/SEO';

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

    const t = {
        title: "Page Not Found | LOXTR",
        headline: "404",
        sub: lang === 'en' ? "Lost at sea?" : "Rotadan mı saptınız?",
        desc: lang === 'en' ?
            "The page you are looking for has been moved, removed, or possibly never existed." :
            "Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.",
        home: lang === 'en' ? "Return Home" : "Ana Sayfaya Dön",
        back: lang === 'en' ? "Go Back" : "Geri Dön"
    };

    return (
        <div className="bg-navy min-h-screen flex items-center justify-center text-white p-6 relative overflow-hidden">
            <SEO
                title={t.title}
                description={lang === 'en' ? "The page you are looking for does not exist." : "Aradığınız sayfa bulunamadı."}
            />

            {/* Background Decor */}
            <div className="absolute inset-0 bg-[url('/images/hero_bg.webp')] bg-cover bg-center opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/95 to-navy" />

            <div className="relative z-10 text-center max-w-lg">
                <div className="text-[10rem] font-heading font-bold text-yellow/20 leading-none select-none">
                    {t.headline}
                </div>
                <h1 className="text-3xl font-bold mb-4 -mt-10 relative z-20">{t.sub}</h1>
                <p className="text-white/60 mb-8 leading-relaxed">
                    {t.desc}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => navigate(`/${lang}`)}
                        className="bg-yellow text-navy px-8 py-3 rounded-lg font-bold hover:bg-white transition-colors flex items-center w-full sm:w-auto justify-center"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        {t.home}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="border border-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition-colors flex items-center w-full sm:w-auto justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t.back}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
