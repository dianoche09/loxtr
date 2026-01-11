import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Truck, FileText, Wallet, Users, Package } from 'lucide-react';
import SEO from '../components/seo/SEO';

const CATEGORIES = {
    en: [
        { id: 'general', label: 'General', icon: <MessageCircle className="w-6 h-6" /> },
        { id: 'partnership', label: 'Partnership', icon: <Users className="w-6 h-6" /> },
        { id: 'logistics', label: 'Logistics', icon: <Truck className="w-6 h-6" /> },
        { id: 'compliance', label: 'Legal & Customs', icon: <FileText className="w-6 h-6" /> },
        { id: 'finance', label: 'Payments', icon: <Wallet className="w-6 h-6" /> },
        { id: 'products', label: 'Products', icon: <Package className="w-6 h-6" /> },
    ],
    tr: [
        { id: 'general', label: 'Genel', icon: <MessageCircle className="w-6 h-6" /> },
        { id: 'partnership', label: 'Ortaklık', icon: <Users className="w-6 h-6" /> },
        { id: 'logistics', label: 'Lojistik', icon: <Truck className="w-6 h-6" /> },
        { id: 'compliance', label: 'Gümrük & Yasal', icon: <FileText className="w-6 h-6" /> },
        { id: 'finance', label: 'Ödemeler', icon: <Wallet className="w-6 h-6" /> },
        { id: 'products', label: 'Ürünler', icon: <Package className="w-6 h-6" /> },
    ]
};

const FAQ = () => {
    const location = useLocation();
    const lang = location.pathname.startsWith('/tr') ? 'tr' : 'en';
    const [activeCategory, setActiveCategory] = useState('general');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const content = {
        en: {
            title: "Frequently Asked Questions | LOXTR",
            desc: "Answers to common questions about our export management and distribution services.",
            hero: {
                title: "How can we help you?",
                subtitle: "Find quick answers to your questions about trading with Turkey."
            },
            questions: {
                general: [
                    { q: "What is LOXTR?", a: "LOXTR is a B2B trade facilitator connecting Turkish manufacturers with global buyers. We act as your strategic partner for market entry into Turkey or sourcing from Turkey." },
                    { q: "What's the difference between 'Market Entry' and 'Sourcing'?", a: "Market Entry is for international brands wanting to sell IN Turkey (we become your authorized distributor). Sourcing is for companies wanting to buy FROM Turkey (we connect you with verified manufacturers)." },
                    { q: "Do you work with individuals?", a: "No, LOXTR is strictly B2B. We only work with registered companies that have valid business licenses." },
                    { q: "Which industries do you cover?", a: "We cover 12+ key industries including Consumer Electronics, Industrial Machinery, Medical & Healthcare, Automotive Parts, Construction Materials, Textile & Apparel, Food & Beverage, Cosmetics, Chemicals, Home & Garden, Packaging, and Tools & Hardware." },
                    { q: "Where is LOXTR located?", a: "Our headquarters is in Istanbul, Turkey. We operate warehouses in Istanbul, Izmir, and Mersin." }
                ],
                partnership: [
                    { q: "How do I become a partner?", a: "Submit your application through our Partner Program page. We'll evaluate your business, schedule a discovery call, and present a customized partnership proposal within 5-7 business days." },
                    { q: "What are the partner requirements?", a: "You must be a registered business entity (not an individual), have a valid trade license, and demonstrate a commitment to professional trade standards." },
                    { q: "Do you offer exclusive distribution rights?", a: "Yes, we offer exclusive territorial distribution rights for qualified partners. This ensures no internal competition in your protected region." },
                    { q: "What support do partners receive?", a: "Partners receive: dedicated account manager, marketing materials, co-investment opportunities, market intelligence reports, and priority access to new products." },
                    { q: "Is there a partnership fee?", a: "There are no upfront fees. We work on a mutually agreed performance-based model tied to actual success." },
                ],
                logistics: [
                    { q: "Do you have your own warehouses?", a: "Yes, we operate secured bonded and non-bonded facilities in Istanbul, Izmir, and Mersin Free Zones." },
                    { q: "What is your typical shipping time?", a: "Domestic Turkey: 24-48 hours. Export to EU: 3-5 days (truck). Export to USA: 10-14 days (sea), 3-5 days (air)." },
                    { q: "Can you handle temperature-controlled shipments?", a: "Yes, our warehouses have temperature-controlled zones for pharmaceuticals, cosmetics, and perishable goods (2-8°C and 15-25°C zones)." },
                    { q: "What are your working hours?", a: "Warehouse operations: Monday-Saturday, 8 AM - 6 PM. Office hours: Monday-Friday, 9 AM - 6 PM (GMT+3)." },
                    { q: "Do you provide real-time shipment tracking?", a: "Yes, all shipments include real-time GPS tracking with automated SMS/email notifications at key milestones." }
                ],
                compliance: [
                    { q: "Who handles customs clearance?", a: "LOXTR handles all export customs clearance from Turkey. Import clearance in your country depends on Incoterms. We offer DDP (Delivered Duty Paid) to select EU countries." },
                    { q: "Are products CE certified?", a: "Yes, we ensure all sourced products meet EU/Global standards (CE, ISO, FDA, REACH) before shipment. We provide full documentation." },
                    { q: "What are your Incoterms?", a: "We support all standard Incoterms: EXW, FOB, CIF, DAP, DDP. The choice depends on your preference and destination country." },
                    { q: "Do you handle product registration in Turkey?", a: "Yes, for Market Entry clients, we manage all required product registrations (Ministry of Health, TSE certification, etc.)." },
                    { q: "What trade compliance measures do you follow?", a: "We strictly follow OFAC sanctions, EU trade restrictions, and AML/KYC regulations. All clients undergo thorough verification." }
                ],
                finance: [
                    { q: "What payment methods do you accept?", a: "We accept SWIFT (USD/EUR/GBP), SEPA transfers, and Letter of Credit (LC) for commercial orders." },
                    { q: "Is there a minimum order value?", a: "Minimum order values are determined based on the product category and destination to ensure logistic efficiency." },
                    { q: "Do you offer payment terms?", a: "For established partners (6+ months trading history), we offer Net 30/60 payment terms subject to credit approval." },
                    { q: "How does your Escrow system work?", a: "For large-scale transactions, funds are held in a neutral escrow account and released to the supplier only after verification or independent inspection approval." },
                    { q: "What currency do you invoice in?", a: "We invoice in USD, EUR, or GBP based on your preference. TRY (Turkish Lira) is also available for domestic transactions." },
                    { q: "Are there hidden fees?", a: "No. Our pricing is transparent. Any applicable fees (customs, warehousing, insurance) are clearly stated in the quote." }
                ],
                products: [
                    { q: "Can I request product samples?", a: "Yes, we can arrange sample shipments. Sample and shipping costs are calculated based on the specific items and delivery location." },
                    { q: "Do you offer private label manufacturing?", a: "Yes, we connect you with Turkish manufacturers who specialize in private label/OEM production." },
                    { q: "How do you ensure product quality?", a: "We conduct pre-shipment inspections through SGS, Bureau Veritas, or TÜV. Factory audits are also available upon request." },
                    { q: "Can you customize products?", a: "Yes, many of our partner manufacturers offer customization (logos, packaging, specifications). MOQ and lead times vary." },
                    { q: "What is your return policy?", a: "Defective products can be returned within 30 days with full documentation. Return shipping costs depend on fault determination." }
                ]
            }
        },
        tr: {
            title: "Sıkça Sorulan Sorular | LOXTR",
            desc: "İhracat ve distribütörlük hizmetlerimizle ilgili merak edilenler.",
            hero: {
                title: "Nasıl yardımcı olabiliriz?",
                subtitle: "İhracat, lojistik ve bayilik süreçleriyle ilgili sorularınıza hızlı yanıtlar."
            },
            questions: {
                general: [
                    { q: "LOXTR tam olarak ne yapıyor?", a: "LOXTR, Türk üreticileri için global ihracat departmanı, yabancı markalar için ise Türkiye distribütörlük hizmeti veren bir B2B ticaret platformudur." },
                    { q: "'İhracat Yönetimi' ile 'Bayilik' arasındaki fark nedir?", a: "İhracat Yönetimi: Türk üreticilerin ürünlerini yurt dışına satışını yönetiyoruz. Bayilik: Yurt dışındaki markaların Türkiye'deki yetkili distribütörü oluyoruz." },
                    { q: "Bireylerle çalışıyor musunuz?", a: "Hayır, LOXTR sadece kayıtlı ticari şirketlerle (B2B) çalışmaktadır. Bireysel müşteriler kabul edilmemektedir." },
                    { q: "Hangi sektörlerde hizmet veriyorsunuz?", a: "Elektronik, Makine Sanayii, Medikal, Otomotiv Yan Sanayi, İnşaat Malzemeleri, Tekstil, Gıda, Kozmetik, Kimya, Ev Tekstili, Ambalaj ve Hırdavat sektörlerinde uzmanız." },
                    { q: "Ofisleriniz nerede?", a: "Merkez ofisimiz İstanbul'dadır. İstanbul, İzmir ve Mersin serbest bölgelerinde depolarımız bulunmaktadır." }
                ],
                partnership: [
                    { q: "Tedarikçi nasıl olabilirim?", a: "Ortaklık sayfamızdaki formu doldurun. İş planınızı değerlendirip, 5-7 iş günü içinde size özel bir teklif sunuyoruz." },
                    { q: "Tedarikçi olmanın şartları nelerdir?", a: "Kayıtlı bir şirket olmalısınız, ticaret sicil belgesi ve profesyonel ticari standartlara uyum gereklidir." },
                    { q: "Münhasır bölge hakkı veriyor musunuz?", a: "Evet, nitelikli ortaklara belirli bölgelerde münhasır distribütörlük hakkı veriyoruz. Bu sizin bölgenizde iç rekabet olmayacağını garanti eder." },
                    { q: "Ortak olarak ne gibi destekler alırım?", a: "Özel hesap yöneticisi, pazarlama materyalleri, ortak yatırım fırsatları, pazar raporları ve yeni ürünlere öncelikli erişim." },
                    { q: "Ortaklık ücreti var mı?", a: "Peşin ödeme yoktur. Karşılıklı mutabık kalınan, performansa dayalı iş birliği modeliyle çalışıyoruz." },
                ],
                logistics: [
                    { q: "Kendi depolarınız var mı?", a: "Evet, İstanbul, İzmir ve Mersin serbest bölgelerinde güvenli antrepo ve depo alanlarımız mevcuttur." },
                    { q: "Teslimat süresi nedir?", a: "Türkiye içi: 24-48 saat. Avrupa'ya ihracat: 3-5 gün (kara yolu). ABD'ye ihracat: 10-14 gün (deniz), 3-5 gün (hava)." },
                    { q: "Soğuk zincir taşıma yapıyor musunuz?", a: "Evet, depolarımızda ilaç, kozmetik ve gıda için sıcaklık kontrollü alanlar bulunmaktadır (2-8°C ve 15-25°C)." },
                    { q: "Çalışma saatleriniz nedir?", a: "Depo: Pazartesi-Cumartesi, 08:00-18:00. Ofis: Pazartesi-Cuma, 09:00-18:00." },
                    { q: "Gönderi takibi yapabiliyor muyum?", a: "Evet, tüm gönderilerimizde GPS takip ve kritik noktalarda SMS/e-posta bildirimleri var." }
                ],
                compliance: [
                    { q: "Gümrük işlemlerini kim yapıyor?", a: "Türkiye çıkış gümrüğünü biz yönetiyoruz. Varış ülke gümrüğü teslim şekline (Incoterms) göre değişir. Seçili AB ülkelerine DDP (gümrüklü teslimat) sunuyoruz." },
                    { q: "Ürünler CE sertifikalı mı?", a: "Evet, tüm ürünlerin sevkiyat öncesi CE, ISO, FDA, REACH standartlarına uygun olduğunu doğruluyoruz. Tam dokümantasyon sağlıyoruz." },
                    { q: "Hangi Incoterms'leri kullanıyorsunuz?", a: "EXW, FOB, CIF, DAP, DDP gibi tüm standart Incoterms'leri destekliyoruz. Tercih ve hedef ülkeye göre seçim yapılır." },
                    { q: "Türkiye'de ürün kaydı yapıyor musunuz?", a: "Evet, yabancı markalar için Sağlık Bakanlığı, TSE sertifikasyonu gibi tüm gerekli kayıtları yönetiyoruz." },
                    { q: "Ticaret uyum önlemleriniz nelerdir?", a: "OFAC yaptırımları, AB ticaret kısıtlamaları ve AML/KYC düzenlemelerine sıkı sıkıya uyuyoruz. Tüm müşteriler kapsamlı doğrulamadan geçer." }
                ],
                finance: [
                    { q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", a: "Ticari siparişler için SWIFT (USD/EUR/GBP), SEPA transferleri ve Akreditif (LC) kabul ediyoruz." },
                    { q: "Minimum sipariş tutarı var mı?", a: "Lojistik verimlilik için minimum sipariş tutarları ürün kategorisine ve varış noktasına göre belirlenir." },
                    { q: "Vadeli ödeme yapabiliyor muyuz?", a: "6+ ay işlem geçmişi olan yerleşik ortaklara kredi onayına tabi 30/60 gün vade sunuyoruz." },
                    { q: "Escrow sistemi nasıl çalışıyor?", a: "Yüksek hacimli işlemlerde para tarafsız escrow hesabında tutulur ve ancak doğrulama veya bağımsız denetim sonrası tedarikçiye aktarılır." },
                    { q: "Hangi para biriminde fatura kesiyorsunuz?", a: "Tercihinize göre USD, EUR veya GBP. Türkiye içi işlemler için TRY de mümkündür." },
                    { q: "Gizli ücretler var mı?", a: "Hayır. Fiyatlandırmamız şeffaftır. Gümrük, depolama, sigorta gibi ek ücretler teklif aşamasında açıkça belirtilir." }
                ],
                products: [
                    { q: "Numune talep edebilir miyim?", a: "Evet, numune gönderimi ayarlayabiliriz. Numune ve kargo maliyetleri ürüne ve lokasyona göre hesaplanmaktadır." },
                    { q: "Fason (Private Label) üretim yapıyor musunuz?", a: "Evet, fason/OEM üretimde uzmanlaşmış Türk üreticileriyle bağlantı kuruyoruz. Minimum sipariş miktarları geçerlidir." },
                    { q: "Ürün kalitesini nasıl garanti ediyorsunuz?", a: "SGS, Bureau Veritas veya TÜV aracılığıyla sevkiyat öncesi denetimler yapıyoruz. Talep üzerine fabrika denetimleri de mevcut." },
                    { q: "Ürünleri özelleştirebilir miyiz?", a: "Evet, birçok ortağımız özelleştirme (logo, ambalaj, özellik) sunuyor. MOQ ve teslimat süreleri değişkenlik gösterir." },
                    { q: "İade politikanız nedir?", a: "Hatalı ürünler tam dokümantasyonla 30 gün içinde iade edilebilir. İade kargo maliyeti kusur tespitine göre belirlenir." }
                ]
            }
        }
    };

    const t = content[lang];
    const currentQuestions = t.questions[activeCategory as keyof typeof t.questions] || [];
    const categories = CATEGORIES[lang];

    return (
        <div className="bg-white min-h-screen pt-20">
            <SEO title={t.title} description={t.desc} />

            {/* HERO */}
            <section className="relative py-20 px-6 overflow-hidden bg-navy text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy"></div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white">{t.hero.title}</h1>
                    <p className="text-xl text-white/70 font-light">{t.hero.subtitle}</p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-16 max-w-6xl">

                {/* CATEGORY NAV */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                    {categories.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setOpenIndex(0); }}
                            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-3 ${activeCategory === cat.id
                                ? 'bg-navy text-white border-navy shadow-xl scale-105'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-yellow hover:text-navy hover:shadow-lg'
                                }`}
                        >
                            <div className={`${activeCategory === cat.id ? 'text-yellow' : 'text-gray-400'}`}>
                                {cat.icon}
                            </div>
                            <span className="font-bold text-sm tracking-wide text-center">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* QUESTIONS COUNT */}
                <div className="mb-8 text-center">
                    <p className="text-gray-500 text-sm">
                        {currentQuestions.length} {lang === 'en' ? 'questions' : 'soru'}
                    </p>
                </div>

                {/* QUESTIONS */}
                <div className="space-y-4">
                    {currentQuestions.map((item: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-lg hover:border-yellow/50 transition-all"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-start justify-between p-6 text-left group"
                            >
                                <span className={`font-bold text-lg pr-4 ${openIndex === i ? 'text-navy' : 'text-gray-700 group-hover:text-navy'}`}>
                                    {item.q}
                                </span>
                                <div className="flex-shrink-0 mt-1">
                                    {openIndex === i ?
                                        <ChevronUp className="w-6 h-6 text-yellow" /> :
                                        <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-yellow transition-colors" />
                                    }
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-off-white"
                                    >
                                        <div className="p-6 pt-0 text-gray-700 leading-relaxed border-t-2 border-gray-100 mt-2">
                                            {item.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* STILL HAVE Qs? */}
                <div className="mt-20 text-center bg-navy p-12 rounded-2xl">
                    <h3 className="text-white text-2xl font-bold mb-4">
                        {lang === 'en' ? "Still have questions?" : "Hala sorularınız mı var?"}
                    </h3>
                    <p className="text-white/60 mb-6">
                        {lang === 'en' ? "Can't find the answer you're looking for? Reach out to our support team." : "Aradığınız cevabı bulamadınız mı? Destek ekibimize ulaşın."}
                    </p>
                    <a
                        href={`/${lang}/contact`}
                        className="inline-block bg-yellow hover:bg-yellow/90 text-navy font-bold px-8 py-4 rounded-lg transition-all shadow-lg"
                    >
                        {lang === 'en' ? "Contact Support" : "Destek Ekibine Yazın"}
                    </a>
                </div>

            </div>
        </div>
    );
};

export default FAQ;
