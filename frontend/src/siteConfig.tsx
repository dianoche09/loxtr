import {
    Cpu,
    Factory,
    Stethoscope,
    Car,
    HardHat,
    Shirt,
    Utensils,
    FlaskConical,
    Gem,
    Armchair,
    Package,
    Wrench,
    Warehouse,
    Truck,
    Store,
    ShieldCheck,
    TrendingUp
} from 'lucide-react';
import React from 'react';

export const CONFIG = {
    company: {
        name: "LOXTR",
        tagline: "Locate • Obtain • Xport",
        email: "info@loxtr.com",
        phone: "+90 530 763 5710",
        whatsapp: "+90 530 763 5710",
        legal: {
            en: "LOXTR Global Trade & Logistics Solutions",
            tr: "LOXTR Dış Ticaret ve Lojistik Çözümleri Ltd. Şti."
        },
        address: {
            en: "Next Level Loft Office, No:3, Cankaya, Ankara, Turkey",
            tr: "Next Level Loft Ofis, No:3, Çankaya, Ankara, Türkiye"
        }
    },
    socials: {
        linkedin: "https://linkedin.com/company/loxtrcom",
        instagram: "https://instagram.com/loxtrcom",
        youtube: "https://youtube.com/@loxtrcom",
        twitter: "https://x.com/loxtrcom",
        facebook: "https://facebook.com/loxtrcom"
    },
    hero: {
        en: {
            headline: "YOUR GATEWAY TO THE TURKISH MARKET.",
            subheadline: "LOXTR is your authorized distribution partner in Turkey. Manage imports, warehousing, and B2B sales without setting up a local entity.",
            ctaPrimary: "ENTER THE MARKET",
            ctaSecondary: "SOURCING FROM TURKEY?"
        },
        tr: {
            headline: "SİZİN DIŞ TİCARET DEPARTMANINIZ.",
            subheadline: "LOXTR ile ihracatın karmaşıklığını yönetin. Ürününüzü global pazarlara, gümrük, lojistik ve tahsilat garantisiyle taşıyoruz.",
            ctaPrimary: "İHRACATA BAŞLA",
            ctaSecondary: "GLOBAL MARKA ALIMI"
        }
    },
    features: {
        en: [
            {
                title: "MARKET ACCESS",
                desc: "Direct connections with verified local dealers and retailers.",
                icon: React.createElement(Store, { className: "w-8 h-8 text-yellow" })
            },
            {
                title: "LOGISTICS HUB",
                desc: "Strategic bonded warehousing in Istanbul Free Zones.",
                icon: React.createElement(Warehouse, { className: "w-8 h-8 text-yellow" })
            },
            {
                title: "COMPLIANCE",
                desc: "Full management of TSE, CE, and Customs regulations.",
                icon: React.createElement(ShieldCheck, { className: "w-8 h-8 text-yellow" })
            },
            {
                title: "GROWTH SUPPORT",
                desc: "Dedicated account managers and marketing support for rapid scaling.",
                icon: React.createElement(TrendingUp, { className: "w-8 h-8 text-yellow" })
            }
        ],
        tr: [
            {
                title: "PAZAR ERİŞİMİ",
                desc: "Onaylı bayiler ve perakendeciler ile doğrudan bağlantı.",
                icon: React.createElement(Store, { className: "w-8 h-8 text-yellow" })
            },
            {
                title: "LOJİSTİK ÜSSÜ",
                desc: "İstanbul Serbest Bölgelerinde stratejik antrepo yönetimi.",
                icon: React.createElement(Warehouse, { className: "w-8 h-8 text-yellow" })
            },
            {
                title: "MEVZUAT UYUMU",
                desc: "TSE, CE ve Gümrük düzenlemelerinin tam yönetimi.",
                icon: React.createElement(ShieldCheck, { className: "w-8 h-8 text-yellow" })
            },
            {
                title: "BÜYÜME DESTEĞİ",
                desc: "Hızlı ölçeklenme için özel hesap yöneticileri ve pazarlama desteği.",
                icon: React.createElement(TrendingUp, { className: "w-8 h-8 text-yellow" })
            }
        ]
    },
    partnershipModels: {
        en: [
            {
                title: "Exclusive Distribution Partner",
                desc: "For brands seeking a sole representative in Turkey. We manage import, compliance, marketing, and sales.",
                icon: React.createElement(ShieldCheck, { className: "w-10 h-10 text-yellow" }),
                features: ["Full market representation", "Local inventory management", "Marketing & brand building"]
            },
            {
                title: "Service Ecosystem Partner",
                desc: "For logistics, customs, and legal firms. Integrate your services into LOXTR's infrastructure.",
                icon: React.createElement(Truck, { className: "w-10 h-10 text-yellow" }),
                features: ["Revenue sharing model", "Lead generation access", "Technology integration"]
            },
            {
                title: "Channel Sales Partner",
                desc: "For local distributors. Access our portfolio of global brands and become an authorized reseller.",
                icon: React.createElement(Store, { className: "w-10 h-10 text-yellow" }),
                features: ["Exclusive brand access", "Competitive pricing", "Training & certification"]
            }
        ],
        tr: [
            {
                title: "Münhasır Distribütör",
                desc: "Türkiye'de tek temsilci arayan markalar için. İthalat, uyum, pazarlama ve satışı biz yönetiyoruz.",
                icon: React.createElement(ShieldCheck, { className: "w-10 h-10 text-yellow" }),
                features: ["Tam pazar temsili", "Lokal stok yönetimi", "Pazarlama & marka inşası"]
            },
            {
                title: "Hizmet Ekosistemi Ortağı",
                desc: "Lojistik, gümrük ve hukuk firmaları için. Hizmetlerinizi LOXTR altyapısına entegre edin.",
                icon: React.createElement(Truck, { className: "w-10 h-10 text-yellow" }),
                features: ["Gelir paylaşım modeli", "Talep oluşturma erişimi", "Teknoloji entegrasyonu"]
            },
            {
                title: "Kanal Satış Ortağı",
                desc: "Yerel distribütörler için. Global marka portföyümüze erişin ve yetkili satıcı olun.",
                icon: React.createElement(Store, { className: "w-10 h-10 text-yellow" }),
                features: ["Özel marka erişimi", "Rekabetçi fiyatlandırma", "Eğitim & sertifikasyon"]
            }
        ]
    },
    stats: {
        en: [
            { label: "Active Brands", value: "8" },
            { label: "Focus Markets", value: "12" },
            { label: "Portfolios", value: "Premium" },
            { label: "Est. Year", value: "2025" }
        ],
        tr: [
            { label: "Aktif Marka", value: "8" },
            { label: "Odak Pazar", value: "12" },
            { label: "Ürün Portföyü", value: "Premium" },
            { label: "Kuruluş Yılı", value: "2025" }
        ]
    },
    industries: [
        {
            name: { en: "Consumer Electronics", tr: "Tüketici Elektroniği" },
            slug: "consumer-electronics",
            icon: React.createElement(Cpu, { className: "w-6 h-6" }),
            heroImage: "/images/industries/electronics.png",
            description: {
                en: "Distribution of global electronics brands to Turkish retailers.",
                tr: "AB standartlarına uygun yerli teknoloji ürünlerinin ihracatı."
            },
            products: {
                en: ["PCB Boards", "Smart Home Devices", "IoT Sensors", "Consumer Audio", "LED Displays", "Capacitors"],
                tr: ["PCB Kartlar", "Akıllı Ev Cihazları", "IoT Sensörleri", "Tüketici Elektroniği", "LED Ekranlar", "Kapasitörler"]
            },
            stats: { label: "Growth", value: "+15% YoY" },
            marketAnalysis: {
                en: {
                    title: "High Tech Adoption & Assembly Hub",
                    desc: "Turkey is not just a consumer market; it's a massive assembly hub for TV and white goods (Vestel, Arçelik).",
                    stats: [
                        { label: "TV Prod.", value: "#1 in EU" },
                        { label: "E-Com Vol", value: "$18B+" }
                    ]
                },
                tr: {
                    title: "Teknoloji İhracat Potansiyeli",
                    desc: "Türkiye'nin teknoloji ihracatı yazılımın ötesine geçerek donanımda da büyüyor. Vestel ve Arçelik gibi devler ile Avrupa pazarında beyaz eşya lideriyiz.",
                    stats: [
                        { label: "İhracat Artışı", value: "%22" },
                        { label: "Hedef Pazar", value: "MENA" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["8528 (Monitors/TV)", "8517 (Phone Parts)", "8544 (Insulated Cables)", "8534 (Printed Circuits)"],
                topExportDestinations: ["United Kingdom", "Germany", "France", "Iraq", "Italy"],
                topImportOrigins: ["China", "Vietnam", "South Korea", "Germany", "Taiwan"],
                didYouKnow: {
                    en: "Turkey is Europe's largest manufacturer of television sets and white goods.",
                    tr: "Türkiye, Avrupa'nın en büyük televizyon ve beyaz eşya üreticisidir."
                }
            }
        },
        {
            name: { en: "Industrial Machinery", tr: "Endüstriyel Makine" },
            slug: "industrial-machinery",
            icon: React.createElement(Factory, { className: "w-6 h-6" }),
            heroImage: "/images/industries/machinery.png",
            description: {
                en: "Supply of heavy processing equipment to Turkish factories.",
                tr: "Ağır işleme ekipmanları ve CNC ünitelerinin global satışı."
            },
            products: {
                en: ["CNC Machines", "Hydraulic Presses", "Automation Robots", "Industrial Valves", "Pumps & Compressors", "Conveyor Systems"],
                tr: ["CNC Tezgahları", "Hidrolik Presler", "Otomasyon Robotları", "Endüstriyel Vanalar", "Pompa & Kompresör", "Konveyör Sistemleri"]
            },
            stats: { label: "Ranking", value: "Top 10" },
            marketAnalysis: {
                en: {
                    title: "Factory of Europe",
                    desc: "Turkey is the manufacturing powerhouse of the region.",
                    stats: [
                        { label: "Machinery Import", value: "$32B" },
                        { label: "Growth", value: "Automation" }
                    ]
                },
                tr: {
                    title: "Makine İhracatının Altın Çağı",
                    desc: "Türk makine sektörü fiyat/performans avantajıyla Avrupa'nın dikkatini çekiyor.",
                    stats: [
                        { label: "İhracat", value: "$25B" },
                        { label: "KG Değeri", value: "$6.2" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["8418 (Refrigerators)", "8450 (Washing Machines)", "8415 (Air Conditioning)", "8479 (Special Machinery)"],
                topExportDestinations: ["Germany", "United Kingdom", "USA", "Italy", "France"],
                topImportOrigins: ["China", "Germany", "Italy", "Japan", "USA"],
                didYouKnow: {
                    en: "The Turkish machinery sector exports to over 200 countries, with Germany being the top partner.",
                    tr: "Türk makine sektörü 200'den fazla ülkeye ihracat yapmaktadır; en büyük pazar Almanya'dır."
                }
            }
        },
        {
            name: { en: "Medical & Healthcare", tr: "Medikal & Sağlık" },
            slug: "medical-healthcare",
            icon: React.createElement(Stethoscope, { className: "w-6 h-6" }),
            heroImage: "/images/industries/medical.png",
            description: {
                en: "Importing certified medical devices for Turkish hospitals.",
                tr: "CE/FDA sertifikalı tıbbi cihaz ve sarf malzemelerinin ihracatı."
            },
            products: {
                en: ["Surgical Instruments", "Hospital Furniture", "Disposables", "Diagnostic Kits", "Orthopedic Implants", "Protective Gear"],
                tr: ["Cerrahi Aletler", "Hastane Mobilyaları", "Tek Kullanımlık Ürünler", "Tanı Kitleri", "Ortopedik İmplantlar", "Koruyucu Ekipman"]
            },
            stats: { label: "Certifications", value: "CE & FDA" },
            marketAnalysis: {
                en: {
                    title: "Health Tourism Hub Needs Tech",
                    desc: "With over $4B in annual health tourism revenue, Turkey's private hospitals demand state-of-the-art diagnostic equipment.",
                    stats: [
                        { label: "Health Tourism", value: "1.2M Patients" },
                        { label: "Device Import", value: "85% Share" }
                    ]
                },
                tr: {
                    title: "Sarf Malzemelerinde Global Oyuncu",
                    desc: "Pandemi sonrası Türk medikal tekstili ve tek kullanımlık ürünleri güvenilirliğini kanıtladı.",
                    stats: [
                        { label: "Pazar Payı", value: "Artıyor" },
                        { label: "Sertifika", value: "MDR Uyumlu" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["9018 (Medical Instruments)", "3004 (Medicaments)", "9021 (Orthopedic Appliances)", "3006 (Pharm. Goods)"],
                topExportDestinations: ["Germany", "Iraq", "USA", "United Kingdom", "Azerbaijan"],
                topImportOrigins: ["USA", "Germany", "China", "Switzerland", "Ireland"],
                didYouKnow: {
                    en: "Turkey is a leading regional hub for clinical trials and health tourism, attracting over 1M patients annually.",
                    tr: "Türkiye, yılda 1 milyondan fazla hasta ile dünyanın en önemli sağlık turizmi merkezlerinden biridir."
                }
            }
        },
        {
            name: { en: "Automotive Parts", tr: "Otomotiv Yedek Parça" },
            slug: "automotive-parts",
            icon: React.createElement(Car, { className: "w-6 h-6" }),
            heroImage: "/images/industries/automotive.png",
            description: {
                en: "Aftermarket parts distribution network in Turkey.",
                tr: "Global otomotiv devlerine OEM parça tedariği."
            },
            products: {
                en: ["Brake Pads", "Suspension Parts", "Engine Components", "Filters", "Car Batteries", "Safety Glass"],
                tr: ["Fren Balataları", "Süspansiyon Parçaları", "Motor Aksamı", "Filtreler", "Akü & Batarya", "Oto Camları"]
            },
            stats: { label: "Volume", value: "$30B+" },
            marketAnalysis: {
                en: {
                    title: "Supplying the OEM Giants",
                    desc: "Home to factories for Ford, Toyota, Fiat, and Renault, Turkey needs a constant flow of Tier-2 and Tier-3 technical components.",
                    stats: [
                        { label: "Production", value: "1.3M Vehicles" },
                        { label: "Aftermarket", value: "High Demand" }
                    ]
                },
                tr: {
                    title: "Yan Sanayide Dünya Markası",
                    desc: "TAYSAD üyesi Türk firmaları artık sadece parça üretmiyor, sistem tasarlıyor.",
                    stats: [
                        { label: "İhracat", value: "$30B+" },
                        { label: "Yerlilik", value: "%65" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["8708 (Parts & Acc.)", "8703 (Passenger Cars)", "8704 (Transport Vehicles)", "8701 (Tractors)"],
                topExportDestinations: ["Germany", "France", "United Kingdom", "Italy", "Spain"],
                topImportOrigins: ["Germany", "China", "Spain", "France", "Italy"],
                didYouKnow: {
                    en: "One out of every 4 buses produced in Europe is made in Turkey.",
                    tr: "Avrupa'da üretilen her 4 otobüsten 1'i Türkiye'de üretilmektedir."
                }
            }
        },
        {
            name: { en: "Construction Materials", tr: "Yapı Malzemeleri" },
            slug: "construction-materials",
            icon: React.createElement(HardHat, { className: "w-6 h-6" }),
            heroImage: "/images/industries/construction.png",
            description: {
                en: "Sourcing premium Turkish marble for global projects.",
                tr: "Mermer ve doğal taşlarımızın dünya projelerine satışı."
            },
            products: {
                en: ["Natural Stone", "Marble", "Insulation", "Ceramics", "Aluminum Profiles", "Cement & Plaster"],
                tr: ["Doğal Taş", "Mermer", "Yalıtım Malzemeleri", "Seramik & Fayans", "Alüminyum Profil", "Çimento & Alçı"]
            },
            stats: { label: "Material", value: "#1 Global" },
            marketAnalysis: {
                en: {
                    title: "Mega-Projects Require Specialization",
                    desc: "While Turkey exports basic materials, it IMPORTS high-tech insulation and smart building systems.",
                    stats: [
                        { label: "Urban Trans.", value: "$400B Plan" },
                        { label: "Import Need", value: "Green Tech" }
                    ]
                },
                tr: {
                    title: "Türk Mermeri ve Seramiği",
                    desc: "Dünya doğal taş rezervlerinin %40'ına sahibiz. İtalya ve İspanya'ya rakip değil, artık pazar lideriyiz.",
                    stats: [
                        { label: "Rezerv", value: "%40 Global" },
                        { label: "Lider", value: "Blok Mermer" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["6802 (Worked Stone/Marble)", "2515 (Marble/Travertine)", "7214 (Iron/Steel Bars)", "7604 (Aluminium Bars)"],
                topExportDestinations: ["USA", "Israel", "Iraq", "United Kingdom", "Germany"],
                topImportOrigins: ["China", "Russia", "Germany", "Italy", "Spain"],
                didYouKnow: {
                    en: "Turkey holds 40% of the world's natural stone and marble reserves.",
                    tr: "Türkiye dünya doğal taş ve mermer rezervlerinin %40'ına sahiptir."
                }
            }
        },
        {
            name: { en: "Textile & Apparel", tr: "Tekstil & Hazır Giyim" },
            slug: "textile-apparel",
            icon: React.createElement(Shirt, { className: "w-6 h-6" }),
            heroImage: "/images/industries/textile.png",
            description: {
                en: "Sourcing high-quality fabrics and ready-to-wear.",
                tr: "Hazır giyim ve kumaş koleksiyonlarının ihracatı."
            },
            products: {
                en: ["Organic Cotton", "Denim", "Home Textiles", "Activewear", "Towels & Bathrobes", "Socks & Hosiery"],
                tr: ["Organik Pamuk", "Denim Kumaş", "Ev Tekstili", "Spor Giyim", "Havlu & Bornoz", "Çorap & İç Giyim"]
            },
            stats: { label: "Speed", value: "2 Weeks" },
            marketAnalysis: {
                en: {
                    title: "Luxury & Technical Fabric Import",
                    desc: "Despite being a textile giant, Turkey imports huge volumes of luxury brand ready-to-wear and technical outdoor fabrics.",
                    stats: [
                        { label: "Fashion Retail", value: "Booming" },
                        { label: "Raw Material", value: "Synthetic" }
                    ]
                },
                tr: {
                    title: "Hızlı Moda ve Sürdürülebilirlik",
                    desc: "Zara, H&M gibi devlerin ana tedarikçisiyiz. Artık sadece fason değil, kendi markalarımızla premium lige çıkıyoruz.",
                    stats: [
                        { label: "Termin", value: "2 Hafta" },
                        { label: "Standart", value: "Eco-Label" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["6109 (T-Shirts)", "6203 (Suits/Ensembles)", "5702 (Carpets)", "6302 (Bed Linen)"],
                topExportDestinations: ["Germany", "Spain", "United Kingdom", "Netherlands", "USA"],
                topImportOrigins: ["China", "Bangladesh", "Vietnam", "Italy", "Egypt"],
                didYouKnow: {
                    en: "Turkey is the 3rd largest supplier of textiles to the EU and 6th largest globally.",
                    tr: "Türkiye, AB'nin en büyük 3. ve dünyanın en büyük 6. tekstil tedarikçisidir."
                }
            }
        },
        {
            name: { en: "Food & Beverage", tr: "Gıda & İçecek" },
            slug: "food-beverage",
            icon: React.createElement(Utensils, { className: "w-6 h-6" }),
            heroImage: "/images/industries/food.png",
            description: {
                en: "Importing gourmet products into local retail chains.",
                tr: "Paketli gıda ve tarım ürünlerinin ihracatı."
            },
            products: {
                en: ["Confectionery", "Dried Fruits", "Olive Oil", "Pasta", "Fruit Juices", "Spices & Herbs"],
                tr: ["Şekerleme & Çikolata", "Kuru Meyve", "Zeytinyağı", "Makarna & Bakliyat", "Meyve Suları", "Baharatlar"]
            },
            stats: { label: "Output", value: "#1 EU" },
            marketAnalysis: {
                en: {
                    title: "Gourmet & Exotic Tastes",
                    desc: "Turkish consumers are increasingly seeking international flavors (Asian sauces, premium European cheeses).",
                    stats: [
                        { label: "Retail Chains", value: "40,000+" },
                        { label: "Coffee", value: "High Growth" }
                    ]
                },
                tr: {
                    title: "Anadolu'nun Bereketini İhraç Et",
                    desc: "Fındık, kuru incir ve kayısıda dünya lideriyiz. Artık dökme ürün yerine, markalı ve paketli ürüne odaklanıyoruz.",
                    stats: [
                        { label: "Liderlik", value: "Fındık/İncir" },
                        { label: "Hedef", value: "Paketli Ürün" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["0802 (Dried Fruits/Nuts)", "1905 (Bread/Pastry)", "1509 (Olive Oil)", "2009 (Fruit Juices)"],
                topExportDestinations: ["Germany", "Iraq", "Russia", "USA", "Italy"],
                topImportOrigins: ["Russia", "Ukraine", "Brazil", "USA", "Germany"],
                didYouKnow: {
                    en: "Turkey produces 70% of the world's hazelnuts.",
                    tr: "Dünya fındık üretiminin %70'ini tek başına Türkiye karşılamaktadır."
                }
            }
        },
        {
            name: { en: "Cosmetics & Personal Care", tr: "Kozmetik & Kişisel Bakım" },
            slug: "cosmetics",
            icon: React.createElement(Gem, { className: "w-6 h-6" }),
            heroImage: "/images/industries/cosmetics.png",
            description: {
                en: "Distributing global beauty brands to pharmacies.",
                tr: "Özel markalı (Private Label) kozmetik üretimi ve ihracatı."
            },
            products: {
                en: ["Skincare", "Perfumes", "Hair Care", "Soap", "Essential Oils", "Wet Wipes"],
                tr: ["Cilt Bakımı", "Parfümeri", "Saç Bakımı", "Doğal Sabunlar", "Uçucu Yağlar", "Islak Mendil"]
            },
            stats: { label: "Growth", value: "Double Digit" },
            marketAnalysis: {
                en: {
                    title: "Pharmacy & Beauty Chain Demand",
                    desc: "The 'Dermo-cosmetic' sector is exploding in Turkey. Consumers trust pharmacy channels for premium skincare.",
                    stats: [
                        { label: "Pharmacies", value: "27,000+" },
                        { label: "K-Beauty", value: "Trending" }
                    ]
                },
                tr: {
                    title: "Private Label Merkezi",
                    desc: "Dünyanın en büyük markaları fason üretim için Türkiye'yi seçiyor.",
                    stats: [
                        { label: "Üretim", value: "Esnek" },
                        { label: "Maliyet", value: "Rekabetçi" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["3304 (Beauty/Makeup Prep)", "3305 (Hair Preparations)", "3401 (Soaps)", "3307 (Shaving Preps)"],
                topExportDestinations: ["Iraq", "Russia", "USA", "Netherlands", "UK"],
                topImportOrigins: ["France", "Germany", "USA", "South Korea", "Italy"],
                didYouKnow: {
                    en: "Turkey's 'Private Label' cosmetics manufacturing is one of the fastest growing in the EMEA region.",
                    tr: "Türkiye'nin 'Private Label' (Fason) kozmetik üretimi EMEA bölgesinde en hızlı büyüyen sektördür."
                }
            }
        },
        {
            name: { en: "Chemicals", tr: "Kimya Sanayii" },
            slug: "chemicals",
            icon: React.createElement(FlaskConical, { className: "w-6 h-6" }),
            heroImage: "/images/industries/chemicals.png",
            description: {
                en: "Industrial chemical supply for Turkish manufacturing.",
                tr: "Endüstriyel kimyasal ve ham madde ihracatı."
            },
            products: {
                en: ["Polymers", "Paints", "Fertilizers", "Petrochemicals", "Detergents", "Industrial Adhesives"],
                tr: ["Polimerler", "Boya Kimyasalları", "Gübreler", "Petrokimya", "Deterjan", "Sanayi Yapıştırıcıları"]
            },
            stats: { label: "Quality", value: "High Grade" },
            marketAnalysis: {
                en: {
                    title: "Raw Material Dependency",
                    desc: "Since Turkey is a net importer of petrochemicals, industries are hungry for imported polymers and specialized additives.",
                    stats: [
                        { label: "Import Dep.", value: "High" },
                        { label: "Buyer", value: "Industrial" }
                    ]
                },
                tr: {
                    title: "Boya ve Temizlik Kimyasalları",
                    desc: "Türkiye bölgesinin boya üretim üssüdür. İnşaat ve otomotiv boyalarında net ihracatçıyız.",
                    stats: [
                        { label: "Boya", value: "Bölgesel Lider" },
                        { label: "Deterjan", value: "Yüksek Hacim" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["3901 (Polymers of Ethylene)", "3100 (Fertilizers)", "2800 (Inorganic Chemicals)", "3402 (Cleaning Agents)"],
                topExportDestinations: ["Italy", "Netherlands", "Spain", "Germany", "USA"],
                topImportOrigins: ["Russia", "China", "Germany", "USA", "Saudi Arabia"],
                didYouKnow: {
                    en: "The chemical industry is Turkey's largest export sector, surpassing automotive in recent months.",
                    tr: "Kimya sanayii, son aylarda otomotivi geçerek Türkiye'nin en büyük ihracat kalemi olmuştur."
                }
            }
        },
        {
            name: { en: "Home & Garden", tr: "Ev & Bahçe" },
            slug: "home-garden",
            icon: React.createElement(Armchair, { className: "w-6 h-6" }),
            heroImage: "/images/industries/home.png",
            description: {
                en: "Sourcing furniture and kitchenware.",
                tr: "Mobilya ve mutfak gereçlerinin global satışı."
            },
            products: {
                en: ["Furniture", "Cookware", "Glassware", "Garden Tools", "Mattresses", "Lighting Fixtures"],
                tr: ["Mobilya", "Pişirme Gereçleri", "Züccaciye", "Bahçe Aletleri", "Yatak & Baza", "Aydınlatma"]
            },
            stats: { label: "Award", value: "Winner" },
            marketAnalysis: {
                en: {
                    title: "Modern Design Inputs",
                    desc: "There is a niche high-end market for Scandinavian and Italian design furniture in Turkey.",
                    stats: [
                        { label: "Luxury Seg.", value: "Growing" },
                        { label: "DIY Market", value: "Expanding" }
                    ]
                },
                tr: {
                    title: "Mobilya ve Züccaciye Devi",
                    desc: "İnegöl ve Kayseri gibi mobilya kentlerimizden dünyaya tasarım ihraç ediyoruz.",
                    stats: [
                        { label: "Tasarım", value: "Modern" },
                        { label: "Navlun", value: "Avantajlı" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["9403 (Furniture)", "7013 (Glassware)", "7323 (Kitchenware)", "9405 (Lamps/Lighting)"],
                topExportDestinations: ["Germany", "USA", "France", "Iraq", "Israel"],
                topImportOrigins: ["China", "Italy", "Germany", "Poland", "Vietnam"],
                didYouKnow: {
                    en: "Turkey is among the top 5 global exporters of glass tableware (Paşabahçe).",
                    tr: "Türkiye, cam sofra eşyasında (Paşabahçe) dünyanın en büyük 5 ihracatçısı arasındadır."
                }
            }
        },
        {
            name: { en: "Packaging", tr: "Ambalaj & Paketleme" },
            slug: "packaging",
            icon: React.createElement(Package, { className: "w-6 h-6" }),
            heroImage: "/images/industries/packaging.png",
            description: {
                en: "Supply of sustainable packaging solutions.",
                tr: "Ambalaj ve paketleme çözümlerinin ihracatı."
            },
            products: {
                en: ["Corrugated Boxes", "Flexible Packaging", "Rigid Plastics", "Paper Bags", "Wooden Pallets", "Labeling Solutions"],
                tr: ["Oluklu Mukavva", "Esnek Ambalaj", "Sert Plastikler", "Kağıt Çantalar", "Ahşap Paletler", "Etiket Sistemleri"]
            },
            stats: { label: "Eco", value: "Friendly" },
            marketAnalysis: {
                en: {
                    title: "Tech-Packaging Solution Need",
                    desc: "Turkey's massive food export sector needs high-barrier, multi-layer films to extend shelf life.",
                    stats: [
                        { label: "Food Export", value: "Driver" },
                        { label: "Tech Need", value: "Barrier Films" }
                    ]
                },
                tr: {
                    title: "Avrupa'nın Ambalaj Tedarikçisi",
                    desc: "Avrupa'daki her 3 üründen 1'inin ambalajı Türkiye'den gidebilir.",
                    stats: [
                        { label: "Kapasite", value: "Yüksek" },
                        { label: "Lojistik", value: "Hızlı" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["3923 (Plastic Packing)", "4819 (Paper/Carton Boxes)", "7010 (Glass Bottles)", "4811 (Coated Paper)"],
                topExportDestinations: ["UK", "Germany", "Israel", "Italy", "USA"],
                topImportOrigins: ["China", "Germany", "Italy", "South Korea", "USA"],
                didYouKnow: {
                    en: "Turkey consumes and recycles packaging at EU standard rates, making it a key circular economy partner.",
                    tr: "Türkiye, Avrupa'nın en büyük esnek ambalaj üreticilerinden biridir."
                }
            }
        },
        {
            name: { en: "Tools & Hardware", tr: "Hırdavat & El Aletleri" },
            slug: "tools-hardware",
            icon: React.createElement(Wrench, { className: "w-6 h-6" }),
            heroImage: "/images/industries/tools.png",
            description: {
                en: "Distribution of professional power tools.",
                tr: "El aletleri ve hırdavat ürünlerinin ihracatı."
            },
            products: {
                en: ["Hand Tools", "Power Tool Accessories", "Fasteners", "Safety Gear", "Drill Bits", "Hammers & Pliers"],
                tr: ["El Aletleri", "Elektrikli Alet Aksesuarları", "Bağlantı Elemanları", "İş Güvenliği", "Matkap Uçları", "Çekiç & Pense"]
            },
            stats: { label: "Grade", value: "Industrial" },
            marketAnalysis: {
                en: {
                    title: "Professional Grade Equipment",
                    desc: "Construction and manufacturing boom drives demand for top-tier professional power tools.",
                    stats: [
                        { label: "Construction", value: "Driver" },
                        { label: "Brand Loy.", value: "High" }
                    ]
                },
                tr: {
                    title: "Hırdavat ve Bağlantı Elemanları",
                    desc: "Vida, cıvata ve bağlantı elemanlarında Avrupa'nın en büyük tedarikçilerindeniz.",
                    stats: [
                        { label: "Kalite", value: "DIN/ISO" },
                        { label: "Stok", value: "Güçlü" }
                    ]
                }
            },
            tradeData: {
                hsCodes: ["8205 (Hand Tools)", "7318 (Screws/Bolts)", "8508 (Electromechanical Tools)", "8207 (Interchangeable Tools)"],
                topExportDestinations: ["Germany", "Iraq", "USA", "France", "Romania"],
                topImportOrigins: ["China", "Germany", "Taiwan", "USA", "Mexico"],
                didYouKnow: {
                    en: "Turkey's fasteners industry provides crucial bolts and screws to the European automotive lines.",
                    tr: "Türk bağlantı elemanları sektörü, Avrupa otomotiv hatlarının kritik tedarikçisidir."
                }
            }
        }
    ]
};
