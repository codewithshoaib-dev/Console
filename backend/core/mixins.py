from .models import AuditLog
from .utils import WORKSPACE_ACTIONS
from .models import WorkspaceMembership, Workspace
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied
class WorkspacePolicyMixin:
    def build_permission_checker(self, request):
        role = request.actor_role
        cache = {}

        def can(resource, action, obj=None):
            key = (resource, action, getattr(obj, "id", None))
            if key in cache:
                return cache[key]

            rule = WORKSPACE_ACTIONS.get(resource, {}).get(action)

            if not rule:
                result = (False, "Action not defined")
            elif callable(rule):
                result = rule(request, obj)
            elif role in rule:
                result = (True, None)
            else:
                result = (False, "Insufficient role")

            cache[key] = result
            return result

        return can
    
class ActionInjectionMixin:
    def resolve_global_actions(self, request):
        resource = self.resource
        if not resource:
            return {}

        actions = {}
        for action in WORKSPACE_ACTIONS.get(resource, {}):
            allowed, reason = request.can(resource, action)
            actions[action] = {
                "allowed": allowed,
                "reason": reason
            }
        return actions

    def finalize_response(self, request, response, *args, **kwargs):
        if request.method == "GET" and isinstance(response.data, dict):
            response.data["actions"] = self.resolve_global_actions(request)
        return super().finalize_response(request, response, *args, **kwargs)

    
class WorkspaceContextMixin:
    def resolve_workspace_context(self, request, **kwargs):
        workspace_id = kwargs.get("workspace_id")
        if not workspace_id:
            raise NotFound("workspace_id is required in the URL")

        request.workspace_id = workspace_id
        request.workspace = get_object_or_404(Workspace, id=workspace_id)

        membership = WorkspaceMembership.objects.filter(
            user=request.user,
            workspace_id=workspace_id
        ).select_related("workspace").first()

        if not membership:
            raise PermissionDenied("You are not a member of this workspace.")

        request.membership = membership
        request.actor_role = membership.role


class ClientIPMixin:
    def get_client_ip(self):
        x_forwarded_for = self.request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return self.request.META.get("REMOTE_ADDR")


class AuditLogMixin:
    """
    Generic audit log mixin.
    Assumes the caller provides:
      - workspace
      - actor_role
    """

    def log_action(
        self,
        action,
        user,
        workspace_id,
        actor_role=None,
        model_instance=None,
        status="success",
        before=None,
        after=None,
        ip_address=None,
        request_id=None,
    ):
        object_id = getattr(model_instance, "id", None) if model_instance else 0
        model_name = model_instance.__class__.__name__ if model_instance else ""

        AuditLog.objects.create(
            user=user,
            workspace_id=workspace_id,
            actor_role=actor_role,
            action=action,
            model_name=model_name,
            object_id=object_id,
            status=status,
            before=before,
            after=after,
            ip_address=ip_address,
            request_id=request_id,
        )
