import csv
from django.db import transaction
from django.http import Http404
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from core.models import ImportSession, Contact, ImportRow
from core.permissions import IsWorkspaceAdmin
from core.mixins import AuditLogMixin
from core.serializers import ImportSessionSerializer, ImportRowPreviewSerializer
from .workspaces import WorkspaceAPIView
import re
import io, threading
from rest_framework.generics import ListAPIView
from core.pagination import ImportPreviewPagination, ImportPagination
from django.shortcuts import get_object_or_404

class UploadImportView(AuditLogMixin, WorkspaceAPIView):
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin]
    model = ImportSession

    REQUIRED_FIELDS = {"email", "name"}
    FIELD_ALIASES = {
        "email": {"email", "email_address", "e-mail", "mail"},
        "name": {"name", "full_name", "first_name", "firstname"},
        "company": {"company", "company_name", "organization", "organisation"},
    }
    MAX_PREVIEW_ROWS = 5000

    def post(self, request, workspace_id):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "no_file"}, status=400)

        if not file.name.lower().endswith(".csv"):
            return Response({"error": "invalid_file_type"}, status=400)

        session = ImportSession.objects.create(
            workspace_id=request.workspace_id,
            uploaded_by=request.user,
            file=file,
            status="preview",
            original_filename=file.name,
        )

        # Start background processing
        threading.Thread(
            target=self._process_import_session,
            args=(session.id, request.user.id, request.actor_role),
            daemon=True
        ).start()

        return Response(
            {
                "session_id": session.id,
                "status": session.status,
                "message": "Import session created. Processing in background.",
            },
            status=201,
        )

    def _normalize_header(self, value):
        value = value.strip().lower().replace("\ufeff", "")
        return re.sub(r"[^\w]+", "_", value)

    def _open_csv(self, file):
        file.seek(0)
        raw = file.read()
        text = None
        for encoding in ("utf-8-sig", "utf-16", "latin-1", "utf-8"):
            try:
                text = raw.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        if text is None:
            raise UnicodeDecodeError("utf", b"", 0, 1, "unsupported encoding")

        try:
            dialect = csv.Sniffer().sniff(text[:4096])
            if dialect.delimiter not in [",", ";", "\t", "|"]:
                dialect = csv.get_dialect("excel")
        except Exception:
            dialect = csv.get_dialect("excel")

        return csv.DictReader(io.StringIO(text), dialect=dialect)

    def _process_import_session(self, session_id, user_id, actor_role):
        session = ImportSession.objects.get(id=session_id)
        session.status = "processing"
        session.save(update_fields=["status"])

        try:
            reader = self._open_csv(session.file)
            if not reader.fieldnames:
                raise csv.Error("missing headers")

            normalized = {self._normalize_header(h): h for h in reader.fieldnames}

            resolved_headers = {}
            for field, aliases in self.FIELD_ALIASES.items():
                for alias in aliases:
                    key = self._normalize_header(alias)
                    if key in normalized:
                        resolved_headers[field] = normalized[key]
                        break

            missing = self.REQUIRED_FIELDS - resolved_headers.keys()
            if missing:
                session.status = "rejected"
                session.save(update_fields=["status"])
                return

            rows = []
            valid_count = 0
            invalid_count = 0

            for index, raw_row in enumerate(reader):
                if index >= self.MAX_PREVIEW_ROWS:
                    break

                data = {}
                errors = []

                for field, source in resolved_headers.items():
                    value = (raw_row.get(source) or "").strip()
                    data[field] = value

                if not data.get("email") or "@" not in data["email"]:
                    errors.append("Invalid email")
                if not data.get("name"):
                    errors.append("Missing name")

                is_valid = not errors
                if is_valid:
                    valid_count += 1
                else:
                    invalid_count += 1

                rows.append(
                    ImportRow(
                        session=session,
                        row_index=index + 1,
                        raw_data=data,
                        is_valid=is_valid,
                        errors=errors or None,
                    )
                )

            ImportRow.objects.bulk_create(rows, batch_size=500)

            session.headers = resolved_headers
            session.row_count = valid_count + invalid_count
            session.valid_rows = valid_count
            session.invalid_rows = invalid_count
            session.status = "preview"
            session.save(
                update_fields=["headers", "row_count", "valid_rows", "invalid_rows", "status"]
            )

        except UnicodeDecodeError:
            session.status = "rejected"
            session.save(update_fields=["status"])
        except csv.Error:
            session.status = "rejected"
            session.save(update_fields=["status"])


class CommitImportView(AuditLogMixin, WorkspaceAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin]
    model = ImportSession

    def post(self, request, workspace_id, session_id):
        session = self.get_queryset().filter(
            id=session_id,
            status="preview"
        ).first()

        if not session:
            self.log_action(
                action="import_commit_failed_not_found",
                user=request.user,
                workspace_id=request.workspace_id,
                actor_role=request.actor_role,
                status="failed",
                after={"session_id": session_id},
            )
            return Response(
                {"error": "not_found_or_not_committable"},
                status=404,
            )

        valid_rows = ImportRow.objects.filter(
            session=session,
            is_valid=True,
        )

        if not valid_rows.exists():
            self.log_action(
                action="import_commit_failed_no_valid_rows",
                user=request.user,
                workspace_id=request.workspace_id,
                actor_role=request.actor_role,
                status="failed",
                model_instance=session,
            )
            return Response(
                {"error": "no_valid_rows"},
                status=400,
            )

        contacts = []
        for row in valid_rows.iterator():
            data = row.raw_data

            contacts.append(
                Contact(
                    workspace_id=workspace_id,
                    email=data.get("email", ""),
                    name=data.get("name", ""),
                    company=(data.get("company") or "").strip(),
                )
            )

        with transaction.atomic():
            Contact.objects.bulk_create(
                contacts,
                batch_size=500,
                ignore_conflicts=True,
            )

            session.status = "committed"
            session.save(update_fields=["status"])

        self.log_action(
            action="import_committed",
            user=request.user,
            workspace_id=request.workspace_id,
            actor_role=request.actor_role,
            status="success",
            model_instance=session,
            after={
                "imported_rows": len(contacts),
                "skipped_rows": session.invalid_rows,
            },
        )

        return Response(
            {
                "status": "committed",
                "imported_rows": len(contacts),
                "skipped_rows": session.invalid_rows,
            },
            status=200,
        )

class ListImportsView(WorkspaceAPIView, ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = ImportPagination
    serializer_class = ImportSessionSerializer

    model = ImportSession



class ImportRowPreviewView(WorkspaceAPIView, ListAPIView):
    authentication_classes = [JWTAuthentication]
    serializer_class = ImportRowPreviewSerializer
    pagination_class = ImportPreviewPagination
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin]

    def get_queryset(self):
        session = get_object_or_404(
        ImportSession,
        id=self.kwargs["session_id"],
        workspace_id=self.request.workspace_id)

        qs = ImportRow.objects.filter(session=session).select_related("session")
        
        self.request._import_session = qs.first().session

        invalid_only = self.request.query_params.get("invalidOnly")
        if invalid_only == "true":
            qs = qs.filter(is_valid=False)

        return qs

class ImportRejectedView(AuditLogMixin, WorkspaceAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin]
    model = ImportSession

    def delete(self, request, workspace_id, session_id):
        session = self.get_queryset().filter(id=session_id, status="preview").first()
        if not session:
            return Response({"error": "session_not_found"}, status=status.HTTP_404_NOT_FOUND)

        self.log_action(
            action="session_deleted",
            user=request.user,
            workspace_id=request.workspace_id,
            actor_role=request.actor_role,
            status="success",
            model_instance=session,
        )
        session.delete()
        return Response({"detail": "session deleted successfully"}, status=status.HTTP_200_OK)
