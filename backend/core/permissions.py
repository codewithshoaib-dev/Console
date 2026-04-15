from rest_framework.permissions import BasePermission
from .models import WorkspaceMembership


class CanDeleteEditMembership(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ("DELETE", "PATCH"):
            return True

        actor_role = request.actor_role
        target_role = obj.role

        ROLE_MATRIX = {
            "member": [],
            "admin": ["member"],
            "owner": ["admin", "member"],
        }


        return target_role in ROLE_MATRIX.get(actor_role, [])




class IsWorkspaceMember(BasePermission):
    def has_permission(self, request, view):

        workspace_id = getattr(request, "workspace_id", None)

        if not workspace_id or not request.user.is_authenticated:
            return False
        
        return WorkspaceMembership.objects.filter(
            user=request.user, workspace_id=workspace_id
        ).exists()


class IsWorkspaceAdmin(BasePermission):
    def has_permission(self, request, view):
        workspace_id = getattr(request, "workspace_id", None)

        if not workspace_id or not request.user.is_authenticated:
            return False
        
        return request.membership and request.actor_role in ["admin", "owner"]
