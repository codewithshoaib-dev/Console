from django.utils import timezone
from django.db.models import Count, Q, Sum
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .workspaces import WorkspaceAPIView
from core.models import Contact, ImportSession, AuditLog, WorkspaceMembership

from django.db.models.functions import TruncDate

def get_daily_trend(qs, date_field, days=5, aggregate=Count("id"), extra_filter=None):
    now = timezone.now()
    start = (now - timezone.timedelta(days=days - 1)).date()  

    base_qs = qs
    if extra_filter:
        base_qs = base_qs.filter(**extra_filter)

    data = (
        base_qs
        .annotate(day=TruncDate(date_field))
        .values("day")
        .annotate(value=aggregate)
        .filter(day__gte=start)  
        .order_by("day")
    )

    result_map = {entry["day"]: entry["value"] for entry in data}

    trend = []
    for i in range(days):
        day = start + timezone.timedelta(days=i)
        trend.append(result_map.get(day, 0))

    return trend


class DashboardAPIView(WorkspaceAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):
        user = request.user
        workspace_id = request.workspace_id

        now = timezone.now()
        week_ago = now - timezone.timedelta(days=7)
        two_weeks_ago = now - timezone.timedelta(days=14)
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

        active_users_last_week = logs_qs.filter(timestamp__gte=two_weeks_ago).filter(timestamp__lte=week_ago).values("user_id").distinct().count()

        change_in_active_users = active_users_7d - active_users_last_week


        active_users_trend = get_daily_trend(
            logs_qs,
            "timestamp",
            aggregate=Count("user_id", distinct=True)
            )

        contacts_trend = get_daily_trend(
            contacts_qs,
            "created_at"
        )

        import_trend = get_daily_trend(
            imports_qs,
            "created_at",
            aggregate=Sum("row_count")
        )

        failed_actions_trend = get_daily_trend(
            logs_qs,
            "timestamp",
            extra_filter={"status__in": ["failed", "denied"]}
        )



        metrics = {
            "active_users_7d": active_users_7d,
            "change_in_active_users": change_in_active_users,
            "active_users_trend": active_users_trend,

            "contacts_7d": contacts_qs.filter(created_at__gte=week_ago).count(),
            "contacts_trend": contacts_trend,

            "import_success_rate": (
                import_stats["committed"] / import_stats["total"]
                if import_stats["total"] else 0
            ),
            "rows_processed_7d": import_stats["rows_7d"] or 0,
            "import_trend": import_trend,

            "failed_actions_24h": log_stats["failed_24h"],
            "failed_actions_trend": failed_actions_trend,
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
