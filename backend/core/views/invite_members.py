from rest_framework import generics, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from core.models import Workspace, InviteToken
from core.serializers import SignupFromInviteSerializer
from core.permissions import IsWorkspaceAdmin
from .workspaces import WorkspaceAPIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView

from django.utils import timezone
from datetime import timedelta

class CreateInviteView(WorkspaceAPIView, generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceAdmin]  


    def create(self, request, *args, **kwargs):
        invite = InviteToken.objects.create(
            workspace = self.request.workspace,
            expires_at = timezone.now() + timedelta(days=2)
        )
  
        return Response({"invite_link": f"http://localhost:5173/invite/{invite.token}/"})

class ConfirmTokenStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        is_valid = InviteToken.objects.get(
            token = token
        ).is_valid()

        if is_valid:
            return Response({"message": "Token is valid"}, 200)
        
        return Response({"error": "Expired or invalid token!"}, 400)
        
        


class SignupFromInviteView(generics.CreateAPIView):
    serializer_class = SignupFromInviteSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        token = get_object_or_404(InviteToken, token=self.kwargs["token"])
        return {"invite_token": token}
