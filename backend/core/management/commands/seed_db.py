from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from pathlib import Path
import random
import json
import sys

from core.models import (
    Workspace,
    WorkspaceMembership,
    AuditLog,
    ImportSession,
    ImportRow,
    Contact
)

User = get_user_model()


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--users", type=int, default=5)
        parser.add_argument("--workspaces", type=int, default=3)
        parser.add_argument("--contacts", type=int, default=60)
        parser.add_argument("--imports", type=int, default=8)
        parser.add_argument("--rows", type=int, default=120)
        parser.add_argument("--audits", type=int, default=300)


    def handle(self, *args, **opts):
        total_users = opts["users"]
        total_workspaces = opts["workspaces"]

        created = {
            "users": 0,
            "workspaces": 0,
            "memberships": 0,
            "contacts": 0,
            "imports": 0,
            "rows": 0,
            "audits": 0,
        }

        self.stdout.write("\nSeeding portfolio dataset...\n")

        users = self.create_users(total_users, created)
        workspaces = self.create_workspaces(users, total_workspaces, created)
        self.create_memberships(users, workspaces, created)
        self.create_contacts(users, workspaces, created, opts["contacts"])
        self.create_imports(users, workspaces, created, opts["imports"], opts["rows"])
        self.create_audit_logs(users, workspaces, created, opts["audits"])

        self.stdout.write("\nDone.\n")
        for k, v in created.items():
            self.stdout.write(f"{k}: {v}")
        self.stdout.write("")

    def safe(self, label, fn):
        try:
            return fn()
        except Exception as e:
            self.stderr.write(f"Failed {label}: {e}")
            return None

    def create_users(self, count, created):
        self.stdout.write("Creating users...")
        base = [
            ("alex", "alex@acme.io"),
            ("sarah", "sarah@nova.co"),
            ("michael", "michael@orbit.dev"),
            ("emily", "emily@cloudly.app"),
            ("daniel", "daniel@flowhq.io"),
            ("lisa", "lisa@quantum.io"),
        ]

        users = []
        for i in range(count):
            username, email = base[i % len(base)]
            
            # 1. Check if user exists
            u = User.objects.filter(username=username).first()
            
            if not u:
                u = self.safe("user", lambda: User.objects.create_user(
                    username=username,
                    email=email,
                    password="password123"
                ))
                if u:
                    created["users"] += 1
            
            if u:
                users.append(u)
                self.stdout.write(f"  user: {u.username} (Password Hashed)")

        return users

    def create_workspaces(self, users, count, created):
        self.stdout.write("Creating workspaces...")
        names = [
            "Acme CRM",
            "Nova Analytics",
            "Orbit Sales",
            "Cloudly Ops",
            "Flow Internal",
        ]

        user_map = {u.username: u for u in users}
        
        preferred_owners = [
            user_map.get("sarah"),
            user_map.get("daniel")
        ]
  
        preferred_owners = [u for u in preferred_owners if u]

        workspaces = []
        for i in range(count):
            
            if i < len(preferred_owners):
                owner = preferred_owners[i]
            else:
                owner = random.choice(users)

            ws = self.safe("workspace", lambda: Workspace.objects.create(
                name=names[i % len(names)],
                owner=owner,
            ))
            
            if ws:
                workspaces.append(ws)
                created["workspaces"] += 1
                self.stdout.write(f"  workspace: {ws.name} (owner: {owner.username})")
        
        return workspaces

    def create_memberships(self, users, workspaces, created):
        self.stdout.write("Creating memberships...")
        roles = ["admin", "member"]
        for ws in workspaces:
            for u in random.sample(users, k=min(3, len(users))):
                if u == ws.owner:
                    continue
                m = self.safe("membership", lambda: WorkspaceMembership.objects.get_or_create(
                    user=u,
                    workspace=ws,
                    defaults={"role": random.choice(roles)}
                )[0])
                if m:
                    created["memberships"] += 1
                    self.stdout.write(f"  {u.username} -> {ws.name}")

    def create_contacts(self, users, workspaces, created, total):
        self.stdout.write("Creating contacts...")
        first_names = ["John","Maya","Tom","Anna","Ryan","Sara","Alex","Nina","Leo","Emma"]
        last_names = ["Carter","Singh","Brooks","Keller","Chen","Williams","Brown","Garcia"]
        companies = ["Stripe","Notion","Linear","Figma","Vercel","Supabase","Sentry","Postmark"]

        for ws in workspaces:
            for i in range(total):
                fn = random.choice(first_names)
                ln = random.choice(last_names)
                name = f"{fn} {ln}"
                email = f"{fn.lower()}.{ln.lower()}{i}@{random.choice(companies).lower()}.com"

                c = self.safe("contact", lambda: Contact.objects.create(
                    workspace=ws,
                    user=random.choice(users),
                    name=name,
                    email=email,
                    company=random.choice(companies),
                ))
                if c:
                    created["contacts"] += 1

    def create_imports(self, users, workspaces, created, sessions, rows_per):
        self.stdout.write("Creating import sessions...")

        for ws in workspaces:
            for s in range(sessions):
                uploader = random.choice(users)
                session = self.safe("import session", lambda: ImportSession.objects.create(
                    workspace=ws,
                    uploaded_by=uploader,
                    file="imports/demo.csv",
                    original_filename="bulk_leads.csv",
                    status=random.choice(["preview","committed"]),
                    headers=["email","name","company"],
                    row_count=rows_per,
                    valid_rows=int(rows_per * 0.9),
                    invalid_rows=int(rows_per * 0.1),
                    committed_at=timezone.now(),
                ))

                if not session:
                    continue

                created["imports"] += 1

                for i in range(rows_per):
                    valid = random.random() > 0.1
                    data = {
                        "email": f"user{i}@company{i%20}.com" if valid else "bad-email",
                        "name": f"Contact {i}",
                        "company": f"Company {i%20}"
                    }

                    r = self.safe("import row", lambda: ImportRow.objects.create(
                        session=session,
                        row_index=i,
                        raw_data=data,
                        is_valid=valid,
                        errors=None if valid else {"email":"Invalid"},
                    ))
                    if r:
                        created["rows"] += 1


    def create_audit_logs(self, users, workspaces, created, total):
        self.stdout.write("Creating audit logs...")

        actions = [
            ("create","Contact"),
            ("update","Contact"),
            ("delete","Contact"),
            ("import","ImportSession"),
            ("invite","WorkspaceMembership"),
        ]

        for _ in range(total):
            ws = random.choice(workspaces)
            u = random.choice(users)
            action, model = random.choice(actions)

            log = self.safe("audit", lambda: AuditLog.objects.create(
                user=u,
                workspace=ws,
                action=action,
                model_name=model,
                object_id=random.randint(1, 5000),
                status=random.choices(
                    ["success","failed","denied"],
                    weights=[0.8,0.15,0.05]
                )[0],
                ip_address=f"10.0.0.{random.randint(2,254)}",
                request_id=f"req_{random.randint(100000,999999)}",
                actor_role=random.choice(["owner","admin","member"]),
                before={"field":"old"},
                after={"field":"new"},
            ))
            if log:
                created["audits"] += 1

