import os
import secrets
import threading

from django.core.management import call_command
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


def run_seed():
    call_command("seed_db")


class TriggerSeedView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token = request.headers.get("X-CRON-TOKEN", "")

        if not secrets.compare_digest(
            token,
            os.environ["CRON_SECRET"]
        ):
            return Response(
                {"detail": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        threading.Thread(
            target=run_seed,
            daemon=True
        ).start()

        return Response(
            {"status": "started"},
            status=status.HTTP_202_ACCEPTED
        )