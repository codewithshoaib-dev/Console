from django.urls import path

from core.views.audit_logs import AuditLogsView
from core.views.auth import LoginView, RefreshView
from core.views.contacts import ListContactsView, CreateContactsView, DetailContactsView
from core.views.imports import UploadImportView, CommitImportView, ListImportsView, ImportRejectedView, ImportRowPreviewView
from core.views.workspaces import WorkspaceListView, CreateWorkspaceView
from core.views.members import MemberDetailView, MemberListCreateView
from core.views.dashboard import DashboardAPIView
from core.views.invite_members import CreateInviteView, SignupFromInviteView, ConfirmTokenStatusView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('admin/dashboard/<int:workspace_id>/', DashboardAPIView.as_view(), name='admin-dashboard'),
    path("workspaces/", WorkspaceListView.as_view()),
    path("workspaces/create/", CreateWorkspaceView.as_view()),
    path("workspace/<int:workspace_id>/members/invite/", CreateInviteView.as_view(), name="create-invite"),
    path("invite/<uuid:token>/members/signup/", SignupFromInviteView.as_view(), name="signup-from-invite"),
     path("invite/<uuid:token>/members/token/status/", ConfirmTokenStatusView.as_view()),
    path("workspaces/<int:workspace_id>/members/", MemberListCreateView.as_view()),
    path("workspaces/<int:workspace_id>/members/<int:user_id>/", MemberDetailView.as_view()),
    path("workspaces/<int:workspace_id>/logs/", AuditLogsView.as_view() ),
    path("workspaces/<int:workspace_id>/imports/upload/", UploadImportView.as_view(), name="upload-import"),
    path("workspaces/<int:workspace_id>/imports/<int:session_id>/commit/", CommitImportView.as_view(), name="commit-import"),
    path("workspaces/<int:workspace_id>/imports/<int:session_id>/reject/", ImportRejectedView.as_view(), name="reject-import"),
    path("workspaces/<int:workspace_id>/imports/", ListImportsView.as_view(), name="list-imports"),
    path("workspaces/<int:workspace_id>/imports/<int:session_id>/rows/", ImportRowPreviewView.as_view()),
    path("workspaces/<int:workspace_id>/contacts/", ListContactsView.as_view(), name="list-contacts"),
     path("workspaces/<int:workspace_id>/contacts/create/", CreateContactsView.as_view(), name="create-contacts"),
     path("workspaces/<int:workspace_id>/contacts/<int:contact_id>/", DetailContactsView.as_view(), name="delete-contacts"),


]
