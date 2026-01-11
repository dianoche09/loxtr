from django.http import HttpResponse
from django.conf import settings

def error_404(request, exception):
    return render(request, '404.html', status=404)

def error_500(request):
    return render(request, '500.html', status=500)

def robots_txt(request):
    lines = [
        "User-agent: *",
        "Allow: /en/",
        "Allow: /tr/",
        "Disallow: /admin/",
        f"Sitemap: {settings.SITE_URL if hasattr(settings, 'SITE_URL') else ''}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")
