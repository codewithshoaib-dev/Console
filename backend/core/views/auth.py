from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate, get_user_model



User = get_user_model()



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = authenticate(
            username=request.data.get("username"),
            password=request.data.get("password")
        )

        if not user:
            return Response({"error": "Invalid credentials"}, status=401)

        refresh = RefreshToken.for_user(user)

        resp = Response({
            "access": str(refresh.access_token),
            "user": {"id": user.id, "username": user.username}
        })

        resp.set_cookie(
            "refresh",
            str(refresh),
            httponly=True,
            secure=False,   # True in prod
            samesite="Lax",
            max_age=60 * 60 * 24 * 14
        )

        return resp

class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token:
            return Response({"error": "No refresh token"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token
        except Exception:
            return Response({"error": "Invalid refresh"}, status=401)


        return Response({
            "access": str(access)
        })