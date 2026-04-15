import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("forecast")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

FORECAST_API_KEY = os.getenv("FORECAST_API_KEY", "")
PORT = int(os.getenv("PORT", "8200"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
TIMESFM_MODEL = os.getenv("TIMESFM_MODEL", "google/timesfm-2.0-200m-pytorch")
