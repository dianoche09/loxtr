import { motion } from 'framer-motion';

const LogoMarquee = () => {
    // Using the generated brand logos image
    const logosImage = "/images/brand_logos_set.webp";

    return (
        <div className="bg-white py-12 border-b border-gray-100 overflow-hidden">
            <div className="container mx-auto px-6 mb-8 text-center">
                <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Collaborating with Emerging & Established Brands</p>
            </div>

            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex space-x-20 whitespace-nowrap items-center py-4"
                    animate={{
                        x: [0, -1000],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 20,
                            ease: "linear",
                        },
                    }}
                >
                    {/* Placeholder for the generated logos - repeated for seamless loop */}
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 h-16 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                            <img
                                src={logosImage}
                                alt="Partner Logo"
                                className="h-full w-auto object-contain"
                                style={{
                                    // Slice the generated image into 6 logos by using object-position and fixed width
                                    // This is a creative way to use a single "set" image
                                    width: '180px',
                                    objectPosition: `${(i % 6) * 20}% 0%`,
                                }}
                            />
                        </div>
                    ))}
                </motion.div>

                {/* Duplicate for seamless marquee */}
                <motion.div
                    className="flex space-x-20 whitespace-nowrap items-center py-4"
                    animate={{
                        x: [0, -1000],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 20,
                            ease: "linear",
                            delay: 0
                        },
                    }}
                    aria-hidden="true"
                >
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 h-16 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                            <img
                                src={logosImage}
                                alt="Partner Logo"
                                className="h-full w-auto object-contain"
                                style={{
                                    width: '180px',
                                    objectPosition: `${(i % 6) * 20}% 0%`,
                                }}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default LogoMarquee;
