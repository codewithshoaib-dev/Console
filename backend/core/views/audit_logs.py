from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsWorkspaceAdmin
from core.serializers import AuditLogSerializer
from .workspaces import WorkspaceAPIView
from core.models import AuditLog
from core.pagination import AuditLogPagination
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from core.filters import AuditLogFilter

class AuditLogsView(WorkspaceAPIView, ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = AuditLogSerializer
    pagination_class = AuditLogPagination

    filter_backends = [DjangoFilterBackend]
    filterset_class = AuditLogFilter

    def get_queryset(self):
        qs = AuditLog.objects.filter(
            workspace_id=self.request.workspace_id
        ).select_related('user').order_by('-timestamp')
        
        return qs

