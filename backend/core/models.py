from django.db import models, IntegrityError
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass


user = get_user_model()


class Workspace(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(user, on_delete=models.PROTECT)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        # Ensure owner is set
        if not self.owner_id:
            raise ValueError("Workspace must have an owner.")

        is_new = self._state.adding
        super().save(*args, **kwargs)

        # Automatically create membership for owner on creation
        if is_new:
            try:
                WorkspaceMembership.objects.create(
                    user=self.owner,
                    workspace=self,
                    role="owner",
                )
            except IntegrityError:
                pass  # already exists, unlikely


class WorkspaceMembership(models.Model):
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    user = models.ForeignKey(user, on_delete=models.CASCADE)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "workspace")
        indexes = [
            models.Index(fields=["workspace", "role"]),
        ]


class AuditStatus(models.TextChoices):
    SUCCESS = "success", "Success"
    FAILED = "failed", "Failed"
    DENIED = "denied", "Denied"

class AuditLog(models.Model):
    user = models.ForeignKey(user, on_delete=models.SET_NULL, null=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)
    model_name = models.CharField(max_length=50)
    object_id = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=AuditStatus.choices, db_index=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    
    before = models.JSONField(blank=True, null=True)
    after = models.JSONField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    request_id = models.CharField(max_length=50, null=True, blank=True)
    actor_role = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
        models.Index(fields=["workspace", "timestamp"]),
        models.Index(fields=["model_name"]),
        models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.action} ({self.status}) by {self.user}"

class ImportSession(models.Model):
    STATUS_CHOICES = [
        ("preview", "Preview"),
        ("committed", "Committed"),
        ("rejected", "Rejected")
    ]

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to="imports/")
    original_filename = models.CharField(max_length=255, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="preview", db_index=True)
    headers = models.JSONField(null=True, blank=True)
    row_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    valid_rows = models.PositiveIntegerField(default=0)
    invalid_rows = models.PositiveIntegerField(default=0)

    committed_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["workspace", "created_at"]),
        ]

class ImportRow(models.Model):
    session = models.ForeignKey(
        ImportSession,
        related_name="rows",
        on_delete=models.CASCADE
    )

    row_index = models.PositiveIntegerField()
    raw_data = models.JSONField()
    is_valid = models.BooleanField(default=True)
    errors = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["row_index"]
        unique_together = [("session", "row_index")]
        indexes = [
            models.Index(fields=["session", "row_index"]),
            models.Index(fields=["session", "is_valid"]),
        ]


class Contact(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    user = models.ForeignKey(user, on_delete=models.SET_NULL, null=True)
    email = models.EmailField()
    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

class InviteToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at