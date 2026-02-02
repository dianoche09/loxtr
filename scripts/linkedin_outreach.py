import asyncio
import random
from playwright.async_api import async_playwright

# --- CONFIGURATION ---
LINKEDIN_USERNAME = "your_email@example.com"
LINKEDIN_PASSWORD = "your_password"
KEYWORDS = [
    "çeki listesi", "packing list help", "gümrük müşavirliği", 
    "ihracat operasyon", "manual data entry", "lojistik otomasyon"
]
PROMO_MESSAGE = (
    "Merhaba, bu konuda manuel işleri otomatiğe bağlayan ücretsiz bir araç geliştirdik. "
    "Belgelerinizi saniyeler içinde Excel'e çevirebilirsiniz: https://docs.loxtr.com"
)

async def human_delay(min_sec=2, max_sec=5):
    await asyncio.sleep(random.uniform(min_sec, max_sec))

async def scroll_page(page):
    await page.evaluate("window.scrollBy(0, 500)")
    await human_delay(1, 2)

async def run_outreach():
    async with async_playwright() as p:
        # Launch browser (headed mode to see what's happening and handle potential 2FA)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        print("[*] Navigating to LinkedIn...")
        await page.goto("https://www.linkedin.com/login")
        
        # Manual Login / Check if already logged in
        # (Recommendation: Log in manually the first time or use browser cookies)
        print("[!] Please log in manually if prompted, or fill credentials in config.")
        
        # Simple Search Demo
        search_query = random.choice(KEYWORDS)
        print(f"[*] Searching for keyword: {search_query}")
        
        await page.goto(f"https://www.linkedin.com/search/results/content/?keywords={search_query.replace(' ', '%20')}&origin=SWITCH_SEARCH_VERTICAL")
        await human_delay(5, 8)

        # Iterate through posts
        posts = await page.query_selector_all(".entity-result__item")
        print(f"[+] Found {len(posts)} potential posts to interact with.")

        for i, post in enumerate(posts[:5]):  # Limit to 5 per run for safety
            await scroll_page(page)
            print(f"[*] Analyzing post {i+1}...")
            
            # Here you would add logic to click 'Comment' and type the PROMO_MESSAGE
            # WARNING: Automated commenting is high-risk. Better to start with 'Like' 
            # and manually messaging high-value leads.
            
            # await post.click("button:has-text('Like')")
            # print("    [V] Liked.")
            
            await human_delay(3, 7)

        print("[*] Session finished. Closing in 10 seconds...")
        await asyncio.sleep(10)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_outreach())
