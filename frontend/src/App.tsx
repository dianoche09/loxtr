import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useGeo } from './context/GeoContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import Industries from './pages/Industries';
import IndustryDetail from './pages/IndustryDetail';
import ExportSolutions from './pages/ExportSolutions';
import PartnerProgram from './pages/PartnerProgram';
import Distribution from './pages/Distribution';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import NotFound from './pages/NotFound';
import ScrollToTop from './ScrollToTop';
import Logo from './components/Logo';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import WhatsAppButton from './components/geo/WhatsAppButton';
import ExitPopup from './components/ExitPopup';
import CookieConsent from './components/CookieConsent';

function Layout() {
  const { } = useGeo();
  const { } = useSettings(); // Use global settings
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);


  // Sync language with URL
  const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (path: string) => {
    navigate(`/${lang}${path}`);
    setMobileMenuOpen(false);
  };



  // DUAL INTERFACE MENUS
  const menuItems = {
    en: [
      { label: "Services", path: "/solutions" },
      { label: "Industries", path: "/industries" },
      { label: "About", path: "/about" },
      { label: "Insights", path: "/blog" },
      { label: "Contact", path: "/contact" }
    ],
    tr: [
      { label: "Hizmetler", path: "/cozumler" },
      { label: "Sektörler", path: "/sektorler" },
      { label: "Hakkımızda", path: "/about" },
      { label: "Akademi", path: "/blog" },
      { label: "İletişim", path: "/contact" }
    ]
  };



  return (
    <div className="min-h-screen bg-off-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-navy py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* LOGO AREA */}
          <div className="cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/${lang}`)}>
            <Logo />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-white font-medium">
            {menuItems[lang].map((item, idx) => (
              <a key={idx} onClick={() => handleNav(item.path)} className="hover:text-yellow transition-colors cursor-pointer">
                {item.label}
              </a>
            ))}

            <button
              onClick={() => {
                const newLang = lang === 'en' ? 'tr' : 'en';
                const currentPath = location.pathname;

                // Route Translation Map
                const routeMap: Record<string, Record<string, string>> = {
                  en: {
                    'solutions': 'cozumler',
                    'industries': 'sektorler',
                    'contact': 'contact',
                    'about': 'about',
                    'partner': 'partner',
                    'distribution': 'distribution',
                    'faq': 'faq',
                    'export-solutions': 'export-solutions'
                  },
                  tr: {
                    'cozumler': 'solutions',
                    'sektorler': 'industries',
                    'contact': 'contact',
                    'about': 'about',
                    'partner': 'partner',
                    'distribution': 'distribution',
                    'faq': 'faq',
                    'export-solutions': 'export-solutions'
                  }
                };

                const pathSegments = currentPath.split('/').filter(Boolean); // e.g., ['en', 'solutions']

                if (pathSegments.length < 2) {
                  navigate(`/${newLang}`);
                  return;
                }

                const currentPage = pathSegments[1];
                const translatedPage = routeMap[lang][currentPage] || currentPage;
                const remainingSegments = pathSegments.slice(2).join('/');

                const newPath = `/${newLang}/${translatedPage}${remainingSegments ? '/' + remainingSegments : ''}`;
                navigate(newPath);
              }}
              className="hover:opacity-80 transition-opacity ml-4 flex items-center justify-center"
              title={lang === 'en' ? "Türkçe'ye Geç" : "Switch to English"}
            >
              {lang === 'en' ? (
                // TR Flag (Uploaded Icon)
                <img src="/images/flags/flag_tr.png" alt="TR" className="w-8 h-8 object-contain" />
              ) : (
                // EN Flag (Uploaded Icon)
                <img src="/images/flags/flag_en.png" alt="EN" className="w-8 h-8 object-contain" />
              )}
            </button>

            {/* PARTNER CTA BUTTON */}
            <button
              onClick={() => setPartnerModalOpen(true)}
              className="bg-yellow hover:bg-yellow/90 text-navy font-bold px-5 py-2 rounded shadow-lg hover:shadow-yellow/20 transition-all flex items-center space-x-2 animate-pulse"
            >
              <span>{lang === 'en' ? 'Enter Turkish Market' : 'İhracata Başla'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-navy z-[60] flex flex-col p-8"
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="flex flex-col space-y-8 text-white text-2xl font-heading mt-12">
              {menuItems[lang].map((item, idx) => (
                <a key={idx} onClick={() => handleNav(item.path)} className="cursor-pointer">
                  {item.label}
                </a>
              ))}
              <div className="pt-8 border-t border-white/10 flex space-x-4 items-center">
                <span className="text-white/60 text-sm">Switch Language:</span>
                <button
                  onClick={() => { navigate('/en'); setMobileMenuOpen(false); }}
                  className={`p-2 rounded hover:bg-white/5 transition-all ${lang === 'en' ? 'bg-white/10' : ''}`}
                  title="Switch to English"
                >
                  <img src="/images/flags/flag_en.png" alt="English" className="w-8 h-8 object-contain" />
                </button>
                <button
                  onClick={() => { navigate('/tr'); setMobileMenuOpen(false); }}
                  className={`p-2 rounded hover:bg-white/5 transition-all ${lang === 'tr' ? 'bg-white/10' : ''}`}
                  title="Türkçe'ye Geç"
                >
                  <img src="/images/flags/flag_tr.png" alt="Türkçe" className="w-8 h-8 object-contain" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Outlet />

      <Footer />
      <WhatsAppButton />
      <ExitPopup lang={lang} />
      <CookieConsent />
      <ContactModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        lang={lang}
        title={lang === 'en' ? "Market Entry Application" : "İhracat Başvurusu"}
        inquiryTypes={lang === 'en'
          ? ["Distributorship Request", "Market Entry Inquiry", "Other Partnership"]
          : ["İhracat Yönetimi", "Yurtdışı Pazar Araştırması", "Diğer İşbirliği"]
        }
      />
    </div>
  );
}



// Redirector component to handle root path
function Redirector() {
  const { visitorType, loading } = useGeo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (visitorType === 'LOCAL') {
        navigate('/tr', { replace: true });
      } else {
        navigate('/en', { replace: true });
      }
    }
  }, [visitorType, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        {/* ScrollToTop component added here to listen to route changes */}
        <ScrollToTop />
        <Routes>
          {/* Root redirector */}
          <Route path="/" element={<Redirector />} />

          {/* ... authenticated routes ... */}

          <Route element={<Layout />}>
            <Route path="en" element={<Outlet />}>
              <Route index element={<Home />} />
              <Route path="solutions" element={<Solutions />} />
              <Route path="industries" element={<Industries />} />
              <Route path="industries/:slug" element={<IndustryDetail />} />
              <Route path="distribution" element={<Distribution />} />
              <Route path="partner" element={<PartnerProgram />} />
              <Route path="about" element={<About />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="export-solutions" element={<ExportSolutions />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="tr" element={<Outlet />}>
              <Route index element={<Home />} />
              <Route path="cozumler" element={<Solutions />} />

              <Route path="sektorler" element={<Industries />} />
              <Route path="sektorler/:slug" element={<IndustryDetail />} />
              <Route path="distribution" element={<Distribution />} />
              <Route path="partner" element={<PartnerProgram />} />
              <Route path="about" element={<About />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="export-solutions" element={<ExportSolutions />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Global 404 for unhandled root paths */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
