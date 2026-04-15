from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import ImportSession, Contact, Workspace, AuditLog, ImportRow, WorkspaceMembership
User = get_user_model()

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    
    id = serializers.ReadOnlyField(source="user.id")
    username = serializers.ReadOnlyField(source="user.username")
    email = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = WorkspaceMembership
        fields = ["id", "username", "email", "role"]

class ImportSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportSession
        fields = ["id", "workspace", "uploaded_by", "original_filename", "status", "headers", "row_count", "created_at"]

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ["id", "email", "name", "company", "created_at"]


class ContactCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact

        fields = ["workspace", "email", "name", "company"]

        extra_kwargs = {
            'workspace': {'read_only': True} 
        }

    def create(self, validated_data):

        return Contact.objects.create(
          **validated_data
        )

class ContactUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact

        fields = ["workspace", "email", "name", "company"]

    def update(self, instance,  validated_data):
        return super().update(instance, validated_data)

MAX_WORKSPACES_PER_USER = 5

class WorkspaceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ["name"]

    def validate(self, attrs):
        user = self.context["request"].user
        current_count = Workspace.objects.filter(owner=user).count()
        if current_count >= MAX_WORKSPACES_PER_USER:
            raise serializers.ValidationError(
                f"Workspace limit reached. Maximum allowed: {MAX_WORKSPACES_PER_USER}"
            )
        return attrs

    def create(self, validated_data):
        return Workspace.objects.create(
            owner=self.context["request"].user,
            **validated_data
        )
    
class ImportRowPreviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportRow
        fields = ["id", "row_index", "raw_data", "is_valid", "errors"]

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", default="system")
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    before = serializers.JSONField(required=False, allow_null=True)
    after = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "actor_role",
            "workspace",
            "action",
            "model_name",
            "object_id",
            "status",
            "before",
            "after",
            "ip_address",
            "request_id",
            "timestamp",
        ]


class SignupFromInviteSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        token = self.context.get("invite_token")
        if not token or not token.is_valid():
            raise serializers.ValidationError("Invalid or expired invite token.")
        return attrs

    def create(self, validated_data):
        token = self.context.get("invite_token")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        WorkspaceMembership.objects.create(
            user=user,
            workspace=token.workspace,
            role="member"
        )
        token.used = True
        token.save()
        return user