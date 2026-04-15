import time
from django.urls import reverse
from rest_framework.test import APIClient
from django.test import TestCase
from django.contrib.auth import get_user_model
from core.models import Workspace, WorkspaceMembership

User = get_user_model()

class DashboardSpeedTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="perfuser",
            password="pass1234",
        )
        self.workspace = Workspace.objects.create(name="Perf Workspace")
        WorkspaceMembership.objects.create(
            user=self.user,
            workspace=self.workspace,
            role="owner",
        )
        self.client.force_authenticate(user=self.user)

    def test_dashboard_speed(self):
        url = reverse(
            "admin-dashboard",
            kwargs={"workspace_id": self.workspace.id},
        )

        start = time.perf_counter()
        response = self.client.get(url)
        duration = time.perf_counter() - start

        assert response.status_code == 200
        print(f"Dashboard latency: {duration * 1000:.2f} ms")
