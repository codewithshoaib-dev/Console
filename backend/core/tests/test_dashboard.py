import time
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

class DashboardPerformanceTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="password"
        )
        self.client.force_authenticate(user=self.user)

    def test_dashboard_speed(self):
        start = time.time()
        response = self.client.get("/api/admin/dashboard/")
        end = time.time()

        duration = end - start
        print(f"Dashboard endpoint responded in {duration:.4f} seconds")

        self.assertEqual(response.status_code, 200)
        self.assertLess(duration, 0.5, "Dashboard endpoint is too slow!")  
