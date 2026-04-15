from .workspaces import WorkspaceAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from core.models import WorkspaceMembership
from core.permissions import IsWorkspaceAdmin, CanDeleteEditMembership
from core.mixins import AuditLogMixin
from core.pagination import MembersPagination
from core.serializers import WorkspaceMemberSerializer

User = get_user_model()

class MemberListCreateView(WorkspaceAPIView, AuditLogMixin, ListAPIView):
    authentication_classes = [JWTAuthentication]
    pagination_class = MembersPagination
    serializer_class = WorkspaceMemberSerializer

    filter_backends = [SearchFilter]
    search_fields = ["user__username"]
    
    model = WorkspaceMembership

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsWorkspaceAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Assuming WorkspaceAPIView or a mixin provides the base queryset filtered by workspace
        return WorkspaceMembership.objects.filter(
            workspace_id=self.request.workspace_id
        ).select_related("user")


    def post(self, request, workspace_id):
        username = request.data.get("username")
        role = request.data.get("role")

        if not username:
            return Response({"error": "missing_username", "detail": "Username is required."}, 400)
        if not role:
            return Response({"error": "missing_role", "detail": "Role is required."}, 400)

        try:
            user, _ = User.objects.get_or_create(
                username=username,
            )
        except IntegrityError:
            return Response({"error": "invalid_user"}, 400)

        try:
            membership = WorkspaceMembership.objects.create(
                user=user,
                workspace_id=request.workspace_id,
                role=role,
            )
        except IntegrityError:
            return Response(
                {"error": "duplicate_membership", "detail": "User already in workspace."},
                400,
            )

        self.log_action(
            action="member_added",
            user=request.user,
            workspace_id=request.workspace_id,
            actor_role=request.actor_role,
            status="success",
            model_instance=membership,
            after={"username": username, "role": role},
        )
        return Response({"status": "added"}, status=201)

ROLE_MATRIX = {
    "member": [],
    "admin": ["member"],
    "owner": ["admin", "member"],
}



class MemberDetailView(WorkspaceAPIView, AuditLogMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin, CanDeleteEditMembership]
    model = WorkspaceMembership

    def patch(self, request, workspace_id, user_id):
        role = request.data.get("role")
        if not role:
            return Response({"error": "missing_role"}, 400)

        try:
            membership = self.get_queryset().get(user=user_id)

        except WorkspaceMembership.DoesNotExist:
            return Response({"error": "not_found"}, 404)
        
        self.check_object_permissions(request, membership)

        if membership.user_id == request.user.id:
            return Response({"error": "cannot_modify_self"}, 403)

        if role not in ROLE_MATRIX[request.actor_role]:
            return Response({"error": "denied_role_transition"}, 403)

        membership.role = role
        membership.save()

        self.log_action(
            action="member_role_updated",
            user=request.user,
            workspace_id=request.workspace_id,
            actor_role=request.actor_role,
            status="success",
            model_instance=membership,
            after={"role": role},
        )
        return Response({"status": "updated"}, status=200)

    def delete(self, request, workspace_id, user_id):
        try:
            membership = self.get_queryset().get(user=user_id)

        except WorkspaceMembership.DoesNotExist:
            return Response({"error": "not_found"}, 404)
        
        self.check_object_permissions(request, membership)

        if membership.user_id == request.user.id:
           return Response({"error": "cannot_delete_self"}, 403)

        self.log_action(
            action="member_deleted",
            user=request.user,
            workspace_id=request.workspace_id,
            actor_role=request.actor_role,
            status="success",
            model_instance=membership,
        )
        membership.delete()
        
        return Response({"status": "removed"})
