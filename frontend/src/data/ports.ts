// Top container ports worldwide — UN/LOCODE based
// Covers ~95% of global container traffic
// Format: { code: UN/LOCODE, name: port name, country: ISO country, region: geographic region }

export interface Port {
    code: string;
    name: string;
    country: string;
    region: string;
}

export const PORTS: Port[] = [
    // Asia — East
    { code: 'CNSHA', name: 'Shanghai', country: 'CN', region: 'Asia' },
    { code: 'CNNGB', name: 'Ningbo-Zhoushan', country: 'CN', region: 'Asia' },
    { code: 'CNSHE', name: 'Shenzhen', country: 'CN', region: 'Asia' },
    { code: 'CNQIN', name: 'Qingdao', country: 'CN', region: 'Asia' },
    { code: 'CNTIA', name: 'Tianjin', country: 'CN', region: 'Asia' },
    { code: 'CNGUA', name: 'Guangzhou', country: 'CN', region: 'Asia' },
    { code: 'CNXIA', name: 'Xiamen', country: 'CN', region: 'Asia' },
    { code: 'CNDAL', name: 'Dalian', country: 'CN', region: 'Asia' },
    { code: 'HKHKG', name: 'Hong Kong', country: 'HK', region: 'Asia' },
    { code: 'TWKHH', name: 'Kaohsiung', country: 'TW', region: 'Asia' },
    { code: 'TWKEL', name: 'Keelung', country: 'TW', region: 'Asia' },
    { code: 'JPYOK', name: 'Yokohama', country: 'JP', region: 'Asia' },
    { code: 'JPTYO', name: 'Tokyo', country: 'JP', region: 'Asia' },
    { code: 'JPKOB', name: 'Kobe', country: 'JP', region: 'Asia' },
    { code: 'JPNGO', name: 'Nagoya', country: 'JP', region: 'Asia' },
    { code: 'JPOSA', name: 'Osaka', country: 'JP', region: 'Asia' },
    { code: 'KRPUS', name: 'Busan', country: 'KR', region: 'Asia' },
    { code: 'KRINC', name: 'Incheon', country: 'KR', region: 'Asia' },

    // Asia — Southeast
    { code: 'SGSIN', name: 'Singapore', country: 'SG', region: 'Asia' },
    { code: 'MYTPP', name: 'Port Klang', country: 'MY', region: 'Asia' },
    { code: 'MYPKG', name: 'Tanjung Pelepas', country: 'MY', region: 'Asia' },
    { code: 'THLCH', name: 'Laem Chabang', country: 'TH', region: 'Asia' },
    { code: 'VNHPH', name: 'Hai Phong', country: 'VN', region: 'Asia' },
    { code: 'VNSGN', name: 'Ho Chi Minh City', country: 'VN', region: 'Asia' },
    { code: 'IDJKT', name: 'Jakarta (Tanjung Priok)', country: 'ID', region: 'Asia' },
    { code: 'IDSBY', name: 'Surabaya', country: 'ID', region: 'Asia' },
    { code: 'PHMNL', name: 'Manila', country: 'PH', region: 'Asia' },
    { code: 'MMRGN', name: 'Yangon', country: 'MM', region: 'Asia' },
    { code: 'KHMPS', name: 'Sihanoukville', country: 'KH', region: 'Asia' },

    // Asia — South
    { code: 'INNSA', name: 'Nhava Sheva (Mumbai)', country: 'IN', region: 'Asia' },
    { code: 'INMAA', name: 'Chennai', country: 'IN', region: 'Asia' },
    { code: 'INMUN', name: 'Mundra', country: 'IN', region: 'Asia' },
    { code: 'INCCU', name: 'Kolkata', country: 'IN', region: 'Asia' },
    { code: 'LKCMB', name: 'Colombo', country: 'LK', region: 'Asia' },
    { code: 'BDCGP', name: 'Chittagong', country: 'BD', region: 'Asia' },
    { code: 'PKKHI', name: 'Karachi', country: 'PK', region: 'Asia' },

    // Middle East
    { code: 'AEJEA', name: 'Jebel Ali (Dubai)', country: 'AE', region: 'Middle East' },
    { code: 'AEAUH', name: 'Abu Dhabi (Khalifa)', country: 'AE', region: 'Middle East' },
    { code: 'OMSLL', name: 'Salalah', country: 'OM', region: 'Middle East' },
    { code: 'SAJED', name: 'Jeddah', country: 'SA', region: 'Middle East' },
    { code: 'SADMM', name: 'Dammam', country: 'SA', region: 'Middle East' },
    { code: 'BHAHS', name: 'Bahrain (Khalifa)', country: 'BH', region: 'Middle East' },
    { code: 'QADOH', name: 'Doha (Hamad)', country: 'QA', region: 'Middle East' },
    { code: 'KWKWI', name: 'Kuwait (Shuwaikh)', country: 'KW', region: 'Middle East' },
    { code: 'IRBND', name: 'Bandar Abbas', country: 'IR', region: 'Middle East' },
    { code: 'ILHFA', name: 'Haifa', country: 'IL', region: 'Middle East' },
    { code: 'ILASH', name: 'Ashdod', country: 'IL', region: 'Middle East' },

    // Turkey
    { code: 'TRIST', name: 'Istanbul (Ambarli)', country: 'TR', region: 'Europe' },
    { code: 'TRMER', name: 'Mersin', country: 'TR', region: 'Europe' },
    { code: 'TRIZM', name: 'Izmir (Alsancak)', country: 'TR', region: 'Europe' },
    { code: 'TRALI', name: 'Aliaga', country: 'TR', region: 'Europe' },
    { code: 'TRISK', name: 'Iskenderun', country: 'TR', region: 'Europe' },
    { code: 'TRGEM', name: 'Gemlik', country: 'TR', region: 'Europe' },
    { code: 'TRTEK', name: 'Tekirdag', country: 'TR', region: 'Europe' },

    // Europe — North
    { code: 'NLRTM', name: 'Rotterdam', country: 'NL', region: 'Europe' },
    { code: 'BEANR', name: 'Antwerp', country: 'BE', region: 'Europe' },
    { code: 'DEHAM', name: 'Hamburg', country: 'DE', region: 'Europe' },
    { code: 'DEBRV', name: 'Bremerhaven', country: 'DE', region: 'Europe' },
    { code: 'GBFXT', name: 'Felixstowe', country: 'GB', region: 'Europe' },
    { code: 'GBLGP', name: 'London Gateway', country: 'GB', region: 'Europe' },
    { code: 'GBSOU', name: 'Southampton', country: 'GB', region: 'Europe' },
    { code: 'FRLEH', name: 'Le Havre', country: 'FR', region: 'Europe' },
    { code: 'FRFOS', name: 'Fos-sur-Mer (Marseille)', country: 'FR', region: 'Europe' },
    { code: 'DKCPH', name: 'Copenhagen', country: 'DK', region: 'Europe' },
    { code: 'SEGOT', name: 'Gothenburg', country: 'SE', region: 'Europe' },
    { code: 'NOOSL', name: 'Oslo', country: 'NO', region: 'Europe' },
    { code: 'FIHEL', name: 'Helsinki', country: 'FI', region: 'Europe' },
    { code: 'PLGDY', name: 'Gdansk', country: 'PL', region: 'Europe' },
    { code: 'LVRIX', name: 'Riga', country: 'LV', region: 'Europe' },
    { code: 'IEDUB', name: 'Dublin', country: 'IE', region: 'Europe' },

    // Europe — Mediterranean
    { code: 'ESALG', name: 'Algeciras', country: 'ES', region: 'Europe' },
    { code: 'ESVLC', name: 'Valencia', country: 'ES', region: 'Europe' },
    { code: 'ESBCN', name: 'Barcelona', country: 'ES', region: 'Europe' },
    { code: 'ITGOA', name: 'Genoa', country: 'IT', region: 'Europe' },
    { code: 'ITGIT', name: 'Gioia Tauro', country: 'IT', region: 'Europe' },
    { code: 'ITLIV', name: 'Livorno', country: 'IT', region: 'Europe' },
    { code: 'ITNAP', name: 'Naples', country: 'IT', region: 'Europe' },
    { code: 'GRPIR', name: 'Piraeus', country: 'GR', region: 'Europe' },
    { code: 'MTMAR', name: 'Marsaxlokk', country: 'MT', region: 'Europe' },
    { code: 'PTLIS', name: 'Lisbon', country: 'PT', region: 'Europe' },
    { code: 'PTSIE', name: 'Sines', country: 'PT', region: 'Europe' },
    { code: 'HRRI', name: 'Rijeka', country: 'HR', region: 'Europe' },
    { code: 'SIKOP', name: 'Koper', country: 'SI', region: 'Europe' },
    { code: 'ROCND', name: 'Constanta', country: 'RO', region: 'Europe' },

    // Africa
    { code: 'EGPSD', name: 'Port Said', country: 'EG', region: 'Africa' },
    { code: 'EGALX', name: 'Alexandria', country: 'EG', region: 'Africa' },
    { code: 'MATNG', name: 'Tanger Med', country: 'MA', region: 'Africa' },
    { code: 'ZADUR', name: 'Durban', country: 'ZA', region: 'Africa' },
    { code: 'ZACPT', name: 'Cape Town', country: 'ZA', region: 'Africa' },
    { code: 'NGAPP', name: 'Apapa (Lagos)', country: 'NG', region: 'Africa' },
    { code: 'KEMBA', name: 'Mombasa', country: 'KE', region: 'Africa' },
    { code: 'DJJIB', name: 'Djibouti', country: 'DJ', region: 'Africa' },
    { code: 'GHTEM', name: 'Tema', country: 'GH', region: 'Africa' },
    { code: 'TZDAR', name: 'Dar es Salaam', country: 'TZ', region: 'Africa' },

    // Americas — North
    { code: 'USLAX', name: 'Los Angeles', country: 'US', region: 'Americas' },
    { code: 'USLGB', name: 'Long Beach', country: 'US', region: 'Americas' },
    { code: 'USNYC', name: 'New York / New Jersey', country: 'US', region: 'Americas' },
    { code: 'USSAV', name: 'Savannah', country: 'US', region: 'Americas' },
    { code: 'USHOU', name: 'Houston', country: 'US', region: 'Americas' },
    { code: 'USSEA', name: 'Seattle / Tacoma', country: 'US', region: 'Americas' },
    { code: 'USORF', name: 'Norfolk', country: 'US', region: 'Americas' },
    { code: 'USCHS', name: 'Charleston', country: 'US', region: 'Americas' },
    { code: 'USMIA', name: 'Miami', country: 'US', region: 'Americas' },
    { code: 'USBAL', name: 'Baltimore', country: 'US', region: 'Americas' },
    { code: 'CAHAL', name: 'Halifax', country: 'CA', region: 'Americas' },
    { code: 'CAVAN', name: 'Vancouver', country: 'CA', region: 'Americas' },
    { code: 'CAMTR', name: 'Montreal', country: 'CA', region: 'Americas' },

    // Americas — Latin
    { code: 'PAONX', name: 'Colon (Panama)', country: 'PA', region: 'Americas' },
    { code: 'PABLB', name: 'Balboa (Panama)', country: 'PA', region: 'Americas' },
    { code: 'BRSSZ', name: 'Santos', country: 'BR', region: 'Americas' },
    { code: 'BRITA', name: 'Itajai', country: 'BR', region: 'Americas' },
    { code: 'BRPNG', name: 'Paranagua', country: 'BR', region: 'Americas' },
    { code: 'MXMAN', name: 'Manzanillo', country: 'MX', region: 'Americas' },
    { code: 'MXLZC', name: 'Lazaro Cardenas', country: 'MX', region: 'Americas' },
    { code: 'MXVER', name: 'Veracruz', country: 'MX', region: 'Americas' },
    { code: 'CLSAI', name: 'San Antonio', country: 'CL', region: 'Americas' },
    { code: 'CLVAP', name: 'Valparaiso', country: 'CL', region: 'Americas' },
    { code: 'ARBUE', name: 'Buenos Aires', country: 'AR', region: 'Americas' },
    { code: 'COBUN', name: 'Buenaventura', country: 'CO', region: 'Americas' },
    { code: 'COCRG', name: 'Cartagena', country: 'CO', region: 'Americas' },
    { code: 'PECLL', name: 'Callao (Lima)', country: 'PE', region: 'Americas' },
    { code: 'ECGYE', name: 'Guayaquil', country: 'EC', region: 'Americas' },
    { code: 'JMKIN', name: 'Kingston', country: 'JM', region: 'Americas' },

    // Oceania
    { code: 'AUMEL', name: 'Melbourne', country: 'AU', region: 'Oceania' },
    { code: 'AUSYD', name: 'Sydney', country: 'AU', region: 'Oceania' },
    { code: 'AUBNE', name: 'Brisbane', country: 'AU', region: 'Oceania' },
    { code: 'AUFRE', name: 'Fremantle (Perth)', country: 'AU', region: 'Oceania' },
    { code: 'NZAKL', name: 'Auckland', country: 'NZ', region: 'Oceania' },
    { code: 'NZTAU', name: 'Tauranga', country: 'NZ', region: 'Oceania' },

    // Russia / CIS
    { code: 'RULED', name: 'St. Petersburg', country: 'RU', region: 'Europe' },
    { code: 'RUNVS', name: 'Novorossiysk', country: 'RU', region: 'Europe' },
    { code: 'RUVVO', name: 'Vladivostok', country: 'RU', region: 'Asia' },
];

// Search ports by name, code, or country
export function searchPorts(query: string, limit = 10): Port[] {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return PORTS
        .filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.country.toLowerCase() === q
        )
        .slice(0, limit);
}

// Get display label for a port
export function getPortLabel(port: Port): string {
    return `${port.name} (${port.code})`;
}
