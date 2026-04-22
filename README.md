# Console

A multi-tenant workspace platform designed for managing structured data workflows, team collaboration, and audit tracking. Built with **React (Vite)** and **Django REST Framework**.

---

## Overview
**Console** is designed for teams that need controlled data ingestion and clear operational visibility. It provides isolated workspaces, role-based access, and a structured pipeline for importing, validating, and committing data.

---

## Key Capabilities

### Workspace-based Architecture
* **Isolated Environments:** Separate environments for each team or project.
* **Scoped Permissions:** Data and access controls are strictly bounded by the workspace.

### Role-Based Access Control (RBAC)
* **Granular Roles:** Owner, Admin, and User roles.
* **Tailored Permissions:** Access is specifically tuned for data operations and team management.

### CSV Processing Pipeline
* **Backend Processing:** Efficiently upload and process CSV files via Django.
* **Staging Area:** Data is staged before final persistence to ensure integrity.
* **Validation:** Row-level validation with clear error visibility.
* **Safe Commit:** Only valid records are committed into the live system.

### Management and Security
* **Contact Management:** Automatic extraction from datasets or manual creation/editing.
* **Audit Logging:** Tracks critical system actions for full traceability.
* **JWT Auth:** Secure access and refresh token flow using Simple JWT.
* **Team Onboarding:** Invite members via unique links for seamless workspace setup.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), TypeScript, Tailwind CSS |
| **Backend** | Django, Django REST Framework |
| **Auth** | Simple JWT |

---

## Architecture Highlights

* **Staging-First Data Flow:** Imported data is validated before being committed, reducing the risk of corrupt or incomplete records.
* **Audit-First Design:** Key operations are logged to provide accountability across the system.
* **Multi-Tenant Structure:** Workspaces are isolated by design, supporting scalable usage across different teams.

---

## Use Cases

* Internal tools for managing operational data.
* CRM-like systems with controlled data imports.
* Admin dashboards for teams handling structured datasets.
* Multi-team platforms requiring clear access control and auditability.

---

## Project Goal
Console was built to demonstrate a production-style system addressing real-world concerns: robust data validation pipelines, complex permission systems, and traceable operations.
