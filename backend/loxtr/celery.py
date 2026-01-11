import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'loxtr.settings')

# Create Celery app
app = Celery('loxtr')

# Load config from Django settings (namespace='CELERY')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Periodic tasks (Celery Beat)
app.conf.beat_schedule = {
    # Daily cache warming (7 AM Istanbul time)
    'warm-cache-daily': {
        'task': 'apps.analytics.tasks.warm_cache',
        'schedule': crontab(hour=7, minute=0),
    },
    
    # Weekly analytics report (Monday 9 AM)
    'weekly-analytics-report': {
        'task': 'apps.analytics.tasks.generate_weekly_report',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),
    },
    
    # Daily database backup (2 AM)
    'daily-backup': {
        'task': 'apps.core.tasks.backup_database',
        'schedule': crontab(hour=2, minute=0),
    },
    
    # Update GeoIP database (monthly, 1st day at 3 AM)
    'update-geoip-database': {
        'task': 'apps.core.tasks.update_geoip_database',
        'schedule': crontab(hour=3, minute=0, day_of_month=1),
    },
}

# Task configuration
app.conf.task_routes = {
    'apps.applications.tasks.*': {'queue': 'high_priority'},
    'apps.analytics.tasks.*': {'queue': 'low_priority'},
}

# Task time limits
app.conf.task_soft_time_limit = 60  # 1 minute
app.conf.task_time_limit = 120  # 2 minutes hard limit

# Result expiration
app.conf.result_expires = 3600  # 1 hour

# Task serialization
app.conf.task_serializer = 'json'
app.conf.result_serializer = 'json'
app.conf.accept_content = ['json']

# Timezone
app.conf.timezone = 'Europe/Istanbul'
app.conf.enable_utc = True

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery setup."""
    print(f'Request: {self.request!r}')
