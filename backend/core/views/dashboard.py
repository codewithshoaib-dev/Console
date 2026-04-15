from django.utils import timezone
from django.db.models import Count, Q, Sum
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .workspaces import WorkspaceAPIView
from core.models import Contact, ImportSession, AuditLog, WorkspaceMembership


class DashboardAPIView(WorkspaceAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):
        user = request.user
        workspace_id = request.workspace_id

        now = timezone.now()
        week_ago = now - timezone.timedelta(days=7)
        day_ago = now - timezone.timedelta(days=1)

        contacts_qs = Contact.objects.filter(workspace_id=workspace_id)
        imports_qs = ImportSession.objects.filter(workspace_id=workspace_id)
        members_qs = WorkspaceMembership.objects.filter(workspace_id=workspace_id)
        logs_qs = AuditLog.objects.filter(workspace_id=workspace_id)

        recent_contacts = list(
            contacts_qs
            .order_by("-created_at")
            .values("id", "name", "email", "company", "created_at")[:5]
        )

        recent_imports = list(
            imports_qs
            .order_by("-created_at")
            .values("id", "original_filename", "status", "row_count", "created_at")[:5]
        )

        recent_logs = list(
            logs_qs
            .select_related("user")
            .order_by("-timestamp")
            .values("id", "action", "status", "user__username", "timestamp")[:5]
        )

        recent_members = list(
            members_qs
            .select_related("user")
            .order_by("-joined_at")
            .values("id", "user__username", "role", "joined_at")[:5]
        )

        import_stats = imports_qs.aggregate(
            total=Count("id"),
            committed=Count("id", filter=Q(status="committed")),
            rows_7d=Sum("row_count", filter=Q(created_at__gte=week_ago))
        )

        log_stats = logs_qs.aggregate(
            total=Count("id"),
            failed_24h=Count("id", filter=Q(timestamp__gte=day_ago, status__in=["failed", "denied"]))
        )

        active_users_7d = logs_qs.filter(timestamp__gte=week_ago).values("user_id").distinct().count()
        active_workspaces_7d = logs_qs.filter(timestamp__gte=week_ago).values("workspace_id").distinct().count()

        metrics = {
            "active_users_7d": active_users_7d,
            "active_workspaces_7d": active_workspaces_7d,

            "members_total": members_qs.count(),
            "admins_total": members_qs.filter(role="admin").count(),

            "contacts_total": contacts_qs.count(),
            "contacts_7d": contacts_qs.filter(created_at__gte=week_ago).count(),

            "imports_total": import_stats["total"],
            "import_success_rate": (
                import_stats["committed"] / import_stats["total"]
                if import_stats["total"] else 0
            ),
            "rows_processed_7d": import_stats["rows_7d"] or 0,

            "failed_actions_24h": log_stats["failed_24h"],

            "owned_workspaces": WorkspaceMembership.objects.filter(
                user=user,
                role="owner"
            ).count(),

            "member_workspaces": WorkspaceMembership.objects.filter(
                user=user
            ).count(),
        }

        return Response({
            "metrics": metrics,
            "recent": {
                "contacts": recent_contacts,
                "imports": recent_imports,
                "logs": recent_logs,
                "members": recent_members,
            },
        })
