from .workspaces import WorkspaceAPIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.models import Contact
from core.serializers import ContactSerializer, ContactCreateSerializer, ContactUpdateSerializer
from core.permissions import IsWorkspaceAdmin
from rest_framework.permissions import IsAuthenticated
from core.mixins import AuditLogMixin, ClientIPMixin

from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.filters import OrderingFilter, SearchFilter
from core.pagination import CustomContactsPagination

class ListContactsView(WorkspaceAPIView, ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ContactSerializer
    model = Contact
    resource = "contacts"

    filter_backends = [SearchFilter, OrderingFilter]
    pagination_class = CustomContactsPagination
    search_fields = ["name"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]



class CreateContactsView(ClientIPMixin, AuditLogMixin, WorkspaceAPIView, CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin]
    serializer_class = ContactCreateSerializer
    model = Contact

    def perform_create(self, serializer):
        contact = serializer.save(workspace=self.request.workspace)

        self.log_action(
            action="create_contact",
            user=self.request.user,
            workspace_id=self.request.workspace_id,
            actor_role=self.request.actor_role,
            model_instance=contact,
            status="success",
            after=serializer.data,
            ip_address=self.get_client_ip(),
            request_id=self.request.headers.get("X-Request-ID"),
        )



class DetailContactsView(ClientIPMixin, AuditLogMixin, WorkspaceAPIView, RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin]
    model = Contact
    lookup_url_kwarg = "contact_id"


    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return ContactUpdateSerializer
        return ContactSerializer


    def perform_destroy(self, instance):
        after_data = {
            "id": instance.id,
            "name": instance.name,
            "email": instance.email,
            "company": instance.company,
        }

        instance.delete()

        self.log_action(
            action="delete_contact",
            user=self.request.user,
            workspace_id=self.request.workspace_id,
            actor_role=self.request.actor_role,
            status="success",
            after=after_data,
            ip_address=self.get_client_ip(),
            request_id=self.request.headers.get("X-Request-ID"),
        )
        
    def perform_update(self, serializer):
        instance = self.get_object()

        before_data = {
            "id": instance.id,
            "name": instance.name,
            "email": instance.email,
            "company": instance.company,
        }

        contact = serializer.save()

        self.log_action(
            action="update_contact",
            user=self.request.user,
            workspace_id=self.request.workspace_id,
            actor_role=self.request.actor_role,
            status="success",
            model_instance=contact,
            before=before_data,
            after=serializer.data,
            ip_address=self.get_client_ip(),
            request_id=self.request.headers.get("X-Request-ID"),
        )


