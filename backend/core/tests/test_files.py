import io
import csv
import pytest

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from core.models import UploadedFile, ProcessedRecord, AuditLog, User, Workspace, WorkspaceMembership


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
def test_file_upload(api, users, workspace):
    owner, _, _, _ = users
    api.force_authenticate(owner)

    csv_bytes = b"email,name\nuser@test.com,User Name\n"
    file = SimpleUploadedFile("test.csv", csv_bytes, content_type="text/csv")

    resp = api.post(
        f"/api/workspaces/{workspace.id}/files/upload/",
        {"file": file},
        format="multipart"
    )

    assert resp.status_code == 200
    assert UploadedFile.objects.filter(workspace=workspace).count() == 1

    uploaded = UploadedFile.objects.first()

    assert AuditLog.objects.filter(
        action="file_uploaded",
        workspace=workspace,
        object_id=uploaded.id
    ).exists()


@pytest.mark.django_db
def test_file_processing(api, users, workspace):
    owner, _, _, _ = users
    api.force_authenticate(owner)

    csv_bytes = b"email,name\nu1@test.com,User1\nu2@test.com,User2\n"
    file = SimpleUploadedFile("data.csv", csv_bytes, content_type="text/csv")

    resp = api.post(
        f"/api/workspaces/{workspace.id}/files/upload/",
        {"file": file},
        format="multipart"
    )

    assert resp.status_code == 200 or resp.status_code == 201
    uploaded_id = resp.data["id"]

    resp2 = api.post(
        f"/api/workspaces/{workspace.id}/files/{uploaded_id}/process/"
    )
 
    assert resp2.status_code == 200
    assert ProcessedRecord.objects.filter(uploaded_file_id=uploaded_id).count() == 2

    assert AuditLog.objects.filter(
        action="file_processed",
        workspace=workspace
    ).exists()


@pytest.mark.django_db
def test_uploaded_file_list(api, users, workspace):
    owner, _, _, _ = users
    api.force_authenticate(owner)

    UploadedFile.objects.create(
        workspace=workspace,
        uploaded_by=owner,
        file="uploads/x.csv"
    )

    resp = api.get(f"/api/workspaces/{workspace.id}/files/")

    assert resp.status_code == 200
    assert len(resp.data) == 1
    assert "filename" in resp.data[0]


@pytest.mark.django_db
def test_processed_record_list(api, users, workspace):
    owner, _, _, _ = users
    api.force_authenticate(owner)

    uploaded = UploadedFile.objects.create(
        workspace=workspace,
        uploaded_by=owner,
        file="uploads/x.csv"
    )

    ProcessedRecord.objects.create(
        uploaded_file=uploaded,
        data={"a": 1}
    )
    ProcessedRecord.objects.create(
        uploaded_file=uploaded,
        data={"b": 2}
    )

    resp = api.get(
        f"/api/workspaces/{workspace.id}/files/{uploaded.id}/records/"
    )

    assert resp.status_code == 200
    assert len(resp.data) == 2
    assert resp.data[0] == {"a": 1}
