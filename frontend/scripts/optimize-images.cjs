#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts PNG images to WebP format for better performance
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');
const imagesToOptimize = [
    'about_hero.png',
    'distribution_hero_new.png',
    'export_card_bg.png',
    'hero_bg.png',
    'import_card_bg.png',
    'industries_hero.png',
    'partner_hero.png'
];

async function optimizeImages() {
    console.log('🖼️  Starting image optimization...\n');

    for (const imageName of imagesToOptimize) {
        const inputPath = path.join(imagesDir, imageName);
        const outputPath = path.join(imagesDir, imageName.replace('.png', '.webp'));

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Skipping ${imageName} - file not found`);
            continue;
        }

        try {
            const inputStats = fs.statSync(inputPath);

            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(outputPath);

            const outputStats = fs.statSync(outputPath);
            const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

            console.log(`✅ ${imageName} → ${imageName.replace('.png', '.webp')}`);
            console.log(`   ${(inputStats.size / 1024).toFixed(0)}KB → ${(outputStats.size / 1024).toFixed(0)}KB (${reduction}% smaller)\n`);

        } catch (error) {
            console.error(`❌ Error optimizing ${imageName}:`, error.message);
        }
    }

    console.log('✨ Image optimization complete!');
}

optimizeImages();
