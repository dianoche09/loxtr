import asyncio
import random
import os
import json
from playwright.async_api import async_playwright
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars from root .env
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
LOX_API_URL = "https://docs.loxtr.com/api/loxconvert/generate-comment" # Or local dev url

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[!] Error: Supabase credentials missing in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def human_delay(min_sec=3, max_sec=7):
    await asyncio.sleep(random.uniform(min_sec, max_sec))

async def scroll_page(page):
    await page.evaluate("window.scrollBy(0, random.randint(300, 700))")
    await human_delay(1, 3)

async def get_bot_settings():
    res = supabase.table("bot_settings").select("*").eq("id", 1).single().execute()
    return res.data if res.data else None

async def save_lead(lead_data):
    try:
        res = supabase.table("bot_outreach_leads").upsert(lead_data, on_conflict="post_url").execute()
        return res
    except Exception as e:
        print(f"[!] Save error: {e}")
        return None

async def get_approved_leads():
    res = supabase.table("bot_outreach_leads").select("*").eq("status", "approved").execute()
    return res.data or []

async def mark_lead_completed(lead_id):
    supabase.table("bot_outreach_leads").update({"status": "completed"}).eq("id", lead_id).execute()

async def run_outreach():
    settings = await get_bot_settings()
    if not settings or not settings.get("is_active"):
        print("[*] Bot is currently INACTIVE in settings. Skipping...")
        return

    keywords = settings.get("target_keywords", ["#ihracat", "#packinglist", "#evraktakibi", "#gümrük", "#dis_ticaret"])
    daily_limit = settings.get("daily_limit", 20)

    print(f"[*] Starting LOX AI Outreach Bot (Limit: {daily_limit})...")

    async with async_playwright() as p:
        # We use a user data dir to keep login state (persistent context)
        user_data_dir = os.path.join(os.path.dirname(__file__), "linkedin_session")
        context = await p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False, # Set False to handle manual login or 2FA first time
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.pages[0]

        # --- STEP 1: POST APPROVED COMMENTS ---
        approved_leads = await get_approved_leads()
        if approved_leads:
            print(f"[+] Found {len(approved_leads)} approved comments. Starting post cycle...")
            for lead in approved_leads:
                try:
                    print(f"[*] Posting comment to: {lead['post_url']}")
                    await page.goto(lead['post_url'])
                    await human_delay(5, 10)
                    
                    # Logic to find comment box and type (LinkedIn selectors change often)
                    # This is a simplified placeholder for the actual UI interaction
                    # Note: LinkedIn automation is strict, proceed with caution
                    comment_btn = await page.query_selector("button.comment-button")
                    if comment_btn:
                        await comment_btn.click()
                        await human_delay(2, 4)
                        await page.keyboard.type(lead['ai_suggested_comment'], delay=random.randint(50, 150))
                        await page.keyboard.press("Enter")
                        await mark_lead_completed(lead['id'])
                        print(f"    [V] Comment posted and marked completed.")
                    else:
                        print(f"    [!] Could not find comment button. Skipping.")
                except Exception as e:
                    print(f"    [!] Post error: {e}")

        # --- STEP 2: SCRAPE NEW LEADS ---
        for keyword in keywords:
            print(f"[*] Searching for keyword: {keyword}")
            search_url = f"https://www.linkedin.com/search/results/content/?keywords={keyword.replace(' ', '%20')}&origin=SWITCH_SEARCH_VERTICAL&sortBy=%22date_posted%22"
            await page.goto(search_url)
            await human_delay(6, 10)

            # Scrape visible posts
            posts = await page.query_selector_all(".entity-result__item, .update-components-text")
            print(f"[+] Found potential posts. Analyzing...")

            for post in posts[:10]: # Analyze top 10 per keyword
                try:
                    content = await post.inner_text()
                    # Basic filters
                    if len(content) < 50: continue
                    
                    # Extract URL (simplified logic)
                    # post_link_el = await post.query_selector("a[href*='/posts/']")
                    # url = await post_link_el.get_attribute("href") if post_link_el else None
                    url = f"https://www.linkedin.com/feed/update/urn:li:activity:{random.randint(1000000, 9999999)}" # Mock URL for demo if not found
                    
                    # Actually, LinkedIn's content search links are tricky. 
                    # Real bot would extract the accurate URN.

                    # Save as Pending Lead
                    await save_lead({
                        "author_name": "LinkedIn User",
                        "post_url": url,
                        "content_snippet": content[:500],
                        "detected_keyword": keyword,
                        "status": "pending",
                        "ai_suggested_comment": "Generating..." # Will be filled by UI or separate task
                    })
                except:
                    continue

        print("[*] Bot Session finished.")
        await context.close()

if __name__ == "__main__":
    asyncio.run(run_outreach())
