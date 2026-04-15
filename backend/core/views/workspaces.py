from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.models import WorkspaceMembership, Workspace
from core.serializers import WorkspaceCreateSerializer
from rest_framework import status
from core.mixins import WorkspaceContextMixin, WorkspacePolicyMixin, ActionInjectionMixin

class WorkspaceAPIView(
    WorkspaceContextMixin,
    WorkspacePolicyMixin,
    ActionInjectionMixin,
    APIView
):
    """ Base view for workspace-scoped endpoints.
      Provides: 
      - request.workspace_id 
      - request.workspace
      - request.membership 
      - request.actor_role 
      
      """
    # Model this view operates on (used by get_queryset)
    model = None

    # Resource name used to resolve workspace actions for UI/permissions
    resource = None

    def initial(self, request, *args, **kwargs):
        # Load workspace, membership, and actor role into request
        self.resolve_workspace_context(request, **kwargs)

        # Build the request-level permission checker (request.can)
        request.can = self.build_permission_checker(request)

        super().initial(request, *args, **kwargs)

    def get_queryset(self):
        # Ensure model is set, then filter by workspace scope
        assert self.model is not None
        return self.model.objects.filter(workspace_id=self.request.workspace_id)


class WorkspaceListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = WorkspaceMembership.objects.filter(user=request.user).select_related("workspace")
        data = [{"id": m.workspace.id, "name": m.workspace.name, "role": m.role} for m in memberships]
        return Response(data)


class CreateWorkspaceView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WorkspaceCreateSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        workspace = serializer.save()

        return Response(
            {"id": workspace.id, "name": workspace.name},
            status=status.HTTP_201_CREATED
        )