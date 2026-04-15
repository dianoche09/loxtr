import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("scraper")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "")
PORT = int(os.getenv("PORT", "8100"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
