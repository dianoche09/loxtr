import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration: Map Slugs to Visual Prompts
const BLOG_POSTS = [
    // --- ENGLISH POSTS ---
    {
        slug: 'why-turkey-target-market-2026',
        prompt: 'modern istanbul skyline bosphorus bridge business district financial growth potential photorealistic 4k daylight'
    },
    {
        slug: 'gateway-to-emea',
        prompt: 'world map focusing on turkey connecting europe asia africa logistics hub trade routes glowing lines high tech'
    },
    {
        slug: 'navigating-turkish-customs',
        prompt: 'customs clearance port shipping containers paperwork documents inspection professional industrial'
    },
    {
        slug: 'booming-sectors-turkey-international-partners',
        prompt: 'advanced manufacturing factory floor automotive textile production line turkey industrial automation'
    },
    {
        slug: 'cost-advantage-manufacturing-turkey-vs-eastern-europe',
        prompt: 'business factory worker quality control manufacturing plant cost efficiency comparison chart concept'
    },
    {
        slug: 'understanding-incoterms-2020-guide',
        prompt: 'international shipping container ship port crane logistic trade terms infographics style'
    },
    {
        slug: 'how-to-verify-turkish-suppliers',
        prompt: 'professional businessman shaking hands factory visit quality inspection checklist trust partnership'
    },
    {
        slug: 'private-label-manufacturing-turkey',
        prompt: 'luxury cosmetic bottles packaging design white label production line clean minimalist studio shot'
    },
    {
        slug: 'consumer-behavior-turkey-global-brands',
        prompt: 'young trendy people shopping in modern istanbul mall fashion retail lifestyle vibrant colors'
    },
    {
        slug: 'ecommerce-turkey-marketplaces-guide',
        prompt: 'ecommerce delivery package warehouse automation mobile shopping app interface logistics fulfillment'
    },
    {
        slug: 'overcoming-language-bureaucracy-barriers',
        prompt: 'international business meeting translator diverse team collaboration office bridge communication concept'
    },
    {
        slug: 'internal-logistics-turkey-port-to-shelf',
        prompt: 'truck fleet on highway transport logistics delivery cargo distribution turkey landscape'
    },

    // --- TURKISH POSTS ---
    {
        slug: 'ihracata-baslarken-yapilan-hatalar',
        slug_tr: 'ihracata-baslarken-yapilan-hatalar',
        prompt: 'cargo container shipping problem logistics mistake warning concept cinematic lighting'
    },
    {
        slug: 'yurtdisi-musteri-bulma-yontemleri',
        prompt: 'digital global network connection business handshake laptop map finding clients technology'
    },
    {
        slug: 'ihracat-destekleri-2026',
        prompt: 'financial growth upward arrow graph coins government support grant business success concept'
    },
    {
        slug: 'mikro-ihracat-nedir-rehber',
        prompt: 'small package courier delivery airplane global shipping ecommerce logistics micro export'
    },
    {
        slug: 'gumruk-islemlerinde-dikkat-edilmesi-gerekenler',
        prompt: 'customs officer stamping documents port cargo inspection legal regulation trade compliance'
    },
    {
        slug: 'akreditifli-odeme-nedir',
        prompt: 'secure banking document letter of credit finance trade money transaction vault concept'
    },
    {
        slug: 'avrupa-pazarina-giris-standartlar',
        prompt: 'european union flag ce mark standard quality certification industrial safety compliance'
    },
    {
        slug: 'insaat-kimyasallari-ihracati-firsatlar',
        prompt: 'construction site industrial chemicals paint bucket concrete mixer building materials export'
    },
    {
        slug: 'navlun-fiyatlari-lojistik-maliyet-dusurme',
        prompt: 'container ship ocean freight logistics chart cost calculation optimization business'
    },
    {
        slug: 'markanizi-globallestirmek-turquality',
        prompt: 'global brand launch stage spotlight world map audience marketing success'
    },
    {
        slug: 'b2b-platformlar-mi-loxtr-mi',
        prompt: 'scale weighing digital platform vs handshake service partnership business comparison'
    },
    {
        slug: 'lox-ile-calismanin-avantajlari',
        prompt: 'professional global team partnership office view city skyline success collaboration'
    }
];

const OUTPUT_DIR = path.join(__dirname, '../public/images/blog');

// Ensure directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Creating directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to download image
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                file.close();
                fs.unlink(filepath, () => { }); // Delete empty file
                reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Delete empty file
            reject(err);
        });
    });
};

// Main function
const generateImages = async () => {
    console.log(`Starting image generation for ${BLOG_POSTS.length} posts...`);

    for (const [index, post] of BLOG_POSTS.entries()) {
        const filename = `${post.slug}.jpg`;
        const filepath = path.join(OUTPUT_DIR, filename);

        if (fs.existsSync(filepath)) {
            console.log(`[${index + 1}/${BLOG_POSTS.length}] Skipping (Exists): ${filename}`);
            continue;
        }

        console.log(`[${index + 1}/${BLOG_POSTS.length}] Generating: ${filename} ...`);

        const encodedPrompt = encodeURIComponent(post.prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&seed=${index}&nologo=true`;

        try {
            await downloadImage(url, filepath);
            console.log(`   ✅ Saved.`);
        } catch (error) {
            console.error(`   ❌ Error downloading ${filename}:`, error.message);
        }

        // Polite delay (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('All operations completed.');
};

generateImages();
