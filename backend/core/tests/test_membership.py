import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from core.models import Workspace, WorkspaceMembership
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def users():
    owner = User.objects.create_user(username="owner", email="owner@test.com", password="pass")
    admin = User.objects.create_user(username="admin", email="admin@test.com", password="pass")
    member = User.objects.create_user(username="member", email="member@test.com", password="pass")
    outsider = User.objects.create_user(username="outsider", email="out@test.com", password="pass")
    return owner, admin, member, outsider


@pytest.fixture
def workspace(users):
    owner, admin, member, _ = users
    ws = Workspace.objects.create(name="Test WS")
    WorkspaceMembership.objects.create(user=owner, workspace=ws, role="owner")
    WorkspaceMembership.objects.create(user=admin, workspace=ws, role="admin")
    WorkspaceMembership.objects.create(user=member, workspace=ws, role="member")
    return ws


@pytest.mark.django_db
def test_workspace_list(api, users, workspace):
    owner, _, _, outsider = users

    api.force_authenticate(owner)
    res = api.get("/api/workspaces/")
    assert res.status_code == 200
    assert len(res.data) == 1
    assert res.data[0]["name"] == "Test WS"

    api.force_authenticate(outsider)
    res = api.get("/api/workspaces/")
    assert res.status_code == 200
    assert res.data == []


@pytest.mark.django_db
def test_member_list_as_admin(api, users, workspace):
    owner, admin, member, _ = users
    api.force_authenticate(admin)

    res = api.get(f"/api/workspaces/{workspace.id}/members/")
    assert res.status_code == 200
    assert len(res.data) == 3

@pytest.mark.django_db
def test_member_list_forbidden_for_member(api, users, workspace):
    _, _, member, _ = users
    api.force_authenticate(member)

    res = api.get(f"/api/workspaces/{workspace.id}/members/")
    assert res.status_code == 403


@pytest.mark.django_db
def test_add_member(api, users, workspace):
    owner, _, _, _ = users
    api.force_authenticate(owner)

    res = api.post(
        f"/api/workspaces/{workspace.id}/members/",
        {"email": "new@test.com", "role": "member"},
        format="json"
    )
    assert res.status_code == 200
    assert WorkspaceMembership.objects.filter(
        workspace=workspace,
        user__email="new@test.com"
    ).exists()

@pytest.mark.django_db
def test_add_member_forbidden(api, users, workspace):
    _, _, member, _ = users
    api.force_authenticate(member)

    res = api.post(
        f"/api/workspaces/{workspace.id}/members/",
        {"email": "x@test.com", "role": "member"},
        format="json"
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_update_role(api, users, workspace):
    owner, admin, member, _ = users
    api.force_authenticate(admin)

    res = api.patch(
        f"/api/workspaces/{workspace.id}/members/{member.id}/",
        {"role": "admin"},
        format="json"
    )
    assert res.status_code == 200

    member_refresh = WorkspaceMembership.objects.get(workspace=workspace, user=member)
    assert member_refresh.role == "admin"


@pytest.mark.django_db
def test_remove_member(api, users, workspace):
    owner, _, member, _ = users
    api.force_authenticate(owner)

    res = api.delete(
        f"/api/workspaces/{workspace.id}/members/{member.id}/"
    )
    assert res.status_code == 200
    assert not WorkspaceMembership.objects.filter(workspace=workspace, user=member).exists()


@pytest.mark.django_db
def test_outsider_blocked(api, users, workspace):
    _, _, _, outsider = users
    api.force_authenticate(outsider)

    res = api.get(f"/api/workspaces/{workspace.id}/members/")
    assert res.status_code == 403


from core.models import AuditLog

@pytest.mark.django_db
def test_audit_log_created_on_add(api, users, workspace):
    owner, _, _, _ = users
    api.force_authenticate(owner)

    api.post(
        f"/api/workspaces/{workspace.id}/members/",
        {"email": "audit@test.com", "role": "member"},
        format="json"
    )

    assert AuditLog.objects.filter(
        action="member_added",
        workspace=workspace
    ).exists()
