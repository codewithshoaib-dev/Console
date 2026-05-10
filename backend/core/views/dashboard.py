from django.utils import timezone
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .workspaces import WorkspaceAPIView
from core.models import (
    Contact,
    ImportSession,
    AuditLog,
    WorkspaceMembership,
)


def get_daily_trend(
    qs,
    date_field,
    days=7,
    aggregate=Count("id"),
    extra_filter=None,
):
    now = timezone.now()
    start = (now - timezone.timedelta(days=days - 1)).date()

    if extra_filter:
        qs = qs.filter(**extra_filter)

    data = (
        qs.annotate(day=TruncDate(date_field))
        .filter(day__gte=start)
        .values("day")
        .annotate(value=aggregate)
        .order_by("day")
    )

    result_map = {
        entry["day"]: entry["value"] or 0
        for entry in data
    }

    return [
        result_map.get(
            start + timezone.timedelta(days=i),
            0
        )
        for i in range(days)
    ]



def get_period_change(
    qs,
    date_field,
    current_start,
    previous_start,
    aggregate="count",
    sum_field=None,
    filters=None,
):
    filters = filters or {}

    current_qs = qs.filter(
        **filters,
        **{
            f"{date_field}__gte": current_start,
        },
    )

    previous_qs = qs.filter(
        **filters,
        **{
            f"{date_field}__gte": previous_start,
            f"{date_field}__lt": current_start,
        },
    )

    if aggregate == "count":
        current = current_qs.count()
        previous = previous_qs.count()

    elif aggregate == "distinct_users":
        current = (
            current_qs.values("user_id")
            .distinct()
            .count()
        )

        previous = (
            previous_qs.values("user_id")
            .distinct()
            .count()
        )

    elif aggregate == "sum":
        current = (
            current_qs.aggregate(
                total=Sum(sum_field)
            )["total"]
            or 0
        )

        previous = (
            previous_qs.aggregate(
                total=Sum(sum_field)
            )["total"]
            or 0
        )

    else:
        raise ValueError(
            f"Unsupported aggregate: {aggregate}"
        )

    if previous == 0:
        change = 100.0 if current > 0 else 0.0
    else:
        change = round(
            ((current - previous) / previous) * 100,
            1,
        )

    return {
        "current": current,
        "change": change,
        "positive": current > previous,
    }


class DashboardAPIView(WorkspaceAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):
        workspace_id = request.workspace_id

        now = timezone.now()
        week_ago = now - timezone.timedelta(days=7)
        two_weeks_ago = now - timezone.timedelta(days=14)

        contacts_qs = Contact.objects.filter(
            workspace_id=workspace_id
        )

        imports_qs = ImportSession.objects.filter(
            workspace_id=workspace_id
        )

        members_qs = WorkspaceMembership.objects.filter(
            workspace_id=workspace_id
        )

        logs_qs = AuditLog.objects.filter(
            workspace_id=workspace_id
        )

        recent_contacts = list(
            contacts_qs.order_by("-created_at")
            .values(
                "id",
                "name",
                "email",
                "company",
                "created_at",
            )[:5]
        )

        recent_imports = list(
            imports_qs.order_by("-created_at")
            .values(
                "id",
                "original_filename",
                "status",
                "row_count",
                "created_at",
            )[:5]
        )

        recent_logs = list(
            logs_qs.select_related("user")
            .order_by("-timestamp")
            .values(
                "id",
                "action",
                "status",
                "user__username",
                "timestamp",
            )[:5]
        )

        recent_members = list(
            members_qs.select_related("user")
            .order_by("-joined_at")
            .values(
                "id",
                "user__username",
                "role",
                "joined_at",
            )[:5]
        )

        active_users = get_period_change(
            logs_qs,
            date_field="timestamp",
            current_start=week_ago,
            previous_start=two_weeks_ago,
            aggregate="distinct_users",
        )

        contacts = get_period_change(
            contacts_qs,
            date_field="created_at",
            current_start=week_ago,
            previous_start=two_weeks_ago,
        )

        processed_rows = get_period_change(
            imports_qs,
            date_field="created_at",
            current_start=week_ago,
            previous_start=two_weeks_ago,
            aggregate="sum",
            sum_field="row_count",
        )

        failed_actions = get_period_change(
            logs_qs,
            date_field="timestamp",
            current_start=week_ago,
            previous_start=two_weeks_ago,
            filters={
                "status__in": [
                    "failed",
                    "denied",
                ]
            },
        )

        metrics = {
                "active_users_7d": active_users["current"],
                "change_in_active_users": active_users["change"],
                "change_in_active_users_positive": active_users["positive"],
                "active_users_trend": get_daily_trend(
                    logs_qs,
                    "timestamp",
                    aggregate=Count(
                        "user_id",
                        distinct=True,
                    ),
                ),

                "contacts_7d": contacts["current"],
                "change_in_contacts": contacts["change"],
                "change_in_contacts_positive": contacts["positive"],
                "contacts_trend": get_daily_trend(
                    contacts_qs,
                    "created_at",
                ),

                
                "rows_processed_7d": processed_rows["current"],
                "change_in_processed_rows": processed_rows["change"],
                "change_in_processed_rows_positive": processed_rows["positive"],
                "rows_processed_trend": get_daily_trend(
                    imports_qs,
                    "created_at",
                    aggregate=Sum("row_count"),
                ),

                "failed_actions_7d": failed_actions["current"],
                "change_in_failed_actions": failed_actions["change"],
                "change_in_failed_actions_positive": failed_actions["positive"],
                "failed_actions_trend": get_daily_trend(
                    logs_qs,
                    "timestamp",
                    extra_filter={
                        "status__in": [
                            "failed",
                            "denied",
                        ]
                    },
                ),
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