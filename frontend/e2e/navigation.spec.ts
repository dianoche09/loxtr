import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {

    test('Home Page Navigation EN', async ({ page }) => {
        // 1. Visit Home
        await page.goto('/');

        await expect(page.locator('h1')).toBeVisible();

        // EN Button is "Enter the Market"
        await page.click('text=Enter the Market');

        // Goes to /en/partner
        await expect(page).toHaveURL(/.*\/en\/partner/);
        await expect(page.locator('h1')).toContainText('Grow with LOXTR');

        // 3. Go back Home
        await page.goto('/en');

        // 4. Click Secondary Button "Sourcing from Turkey?"
        await page.click('text=Sourcing from Turkey?');

        // Goes to /en/industries
        await expect(page).toHaveURL(/.*\/en\/industries/);

        // The previous test failed here because H1 was different.
        // In Industries.tsx:
        // lang === 'en' ? "Industrial Excellence" : "Endüstriyel Mükemmeliyet"
        // And second line: "Across 12 Key Sectors"
        // The text 'Sectors We Cover' was from Home page section title, not Industries page H1.
        // We should expect "Industrial Excellence".

        await expect(page.locator('h1')).toContainText('Industrial Excellence');
    });

    test('Export Solutions Navigation', async ({ page }) => {
        await page.goto('/en/export-solutions');

        // Main CTA "Get a Free Consultation" -> /partner
        await page.click('text=Get a Free Consultation');
        await expect(page).toHaveURL(/.*\/en\/partner/);
    });

    test('Distribution Navigation', async ({ page }) => {
        await page.goto('/en/distribution');

        // CTA: "Check Warehousing Capacity" -> /partner
        await page.click('text=Check Warehousing Capacity');
        await expect(page).toHaveURL(/.*\/en\/partner/);
    });

    test('Solutions Page Navigation', async ({ page }) => {
        await page.goto('/en/solutions');

        // EN Mode: Main Service "Market Entry & Distribution". Button: "Partner With Us"
        await page.click('text=Partner With Us');
        await expect(page).toHaveURL(/.*\/en\/partner/);

        // Go back
        await page.goto('/en/solutions');

        // EN Mode: Secondary Service "Sourcing & Procurement". Button: "Start Sourcing"
        await page.click('text=Start Sourcing');
        await expect(page).toHaveURL(/.*\/en\/industries/);
    });

    test('Language Switching', async ({ page }) => {
        await page.goto('/en');

        // Click EN button to switch to TR
        await page.click('button:has-text("EN")');

        await expect(page).toHaveURL(/.*\/tr/);

        // TR Headline: "Sizin Dış Ticaret Departmanınız."
        await expect(page.locator('h1')).toContainText('Sizin Dış Ticaret Departmanınız');

        // Switch back
        await page.click('button:has-text("TR")');
        await expect(page).toHaveURL(/.*\/en/);
    });

});
