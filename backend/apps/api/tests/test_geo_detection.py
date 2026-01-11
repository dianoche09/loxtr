from django.test import TestCase, Client, override_settings
from django.core.cache import cache
from unittest.mock import patch, MagicMock

class GeoDetectionTestCase(TestCase):
    
    def setUp(self):
        self.client = Client()
        cache.clear()
    
    def tearDown(self):
        cache.clear()
    
    @patch('middleware.geo_detection.GeoLocationMiddleware._detect_country')
    def test_turkish_ip_detection(self, mock_detect):
        mock_detect.return_value = 'TR'
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/tr/')
    
    @patch('middleware.geo_detection.GeoLocationMiddleware._detect_country')
    def test_us_ip_detection(self, mock_detect):
        mock_detect.return_value = 'US'
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/en/')
    
    @patch('middleware.geo_detection.GeoLocationMiddleware._detect_country')
    def test_cookie_override_to_global(self, mock_detect):
        mock_detect.return_value = 'TR'
        self.client.cookies['force_view'] = 'GLOBAL'
        response = self.client.get('/')
        self.assertEqual(response.url, '/en/')
    
    def test_set_view_preference_global(self):
        response = self.client.get('/set-view/GLOBAL/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/en/')
        self.assertIn('force_view', response.cookies)
        self.assertEqual(response.cookies['force_view'].value, 'GLOBAL')
