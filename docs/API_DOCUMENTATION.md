# WorkForge REST API Reference

All requests must communicate with base URI: `http://localhost:5000/api` (or production host `https://<your-backend-domain>/api`).  
Protected endpoints require a valid Bearer token in the `Authorization` header:  
`Authorization: Bearer <accessToken>`

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new company workspace and initial Company Admin user. |
| `POST` | `/api/auth/login` | Public | Standard login for Company Admin, Project Manager, and Employee. |
| `POST` | `/api/auth/admin-login` | Public | Restricted login exclusively for Super Admin accounts. |
| `POST` | `/api/auth/refresh-token` | Public | Issue new access token using valid refresh token cookie/body. |
| `POST` | `/api/auth/activate-trial` | User | Activate 7-day free trial on current workspace account. |
| `POST` | `/api/auth/logout` | User | Invalidate current session refresh token. |
| `POST` | `/api/auth/logout-all` | User | Revoke all active sessions across all devices for this account. |
| `GET` | `/api/auth/sessions` | User | List all active device sessions with browser, OS, IP, and timestamps. |
| `DELETE` | `/api/auth/sessions/:sessionId` | User | Revoke a specific remote device session. |
| `PUT` | `/api/auth/update-profile` | User | Update user profile details, biography, avatar, and skills tags. |
| `PUT` | `/api/auth/update-organization` | Admin | Update company name, currency, timezone, and tax rate. |

---

## 2. Super Admin Endpoints (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/analytics` | Super Admin | Get platform metrics (total MRR, active tenants, pipeline projects). |
| `GET` | `/api/admin/organizations` | Super Admin | List all company tenant workspaces in the platform. |
| `POST` | `/api/admin/organizations` | Super Admin | Provision a new tenant organization with admin credentials. |
| `PATCH` | `/api/admin/organizations/:id/status`| Super Admin | Toggle tenant status between Active and Suspended. |
| `PATCH` | `/api/admin/organizations/:id/plan` | Super Admin | Upgrade or downgrade tenant subscription plan. |
| `DELETE` | `/api/admin/organizations/:id` | Super Admin | Permanently delete organization and clean up tenant data. |

---

## 3. Client Management Endpoints (`/api/clients`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/clients` | Authenticated | List tenant clients. Supports query parameters `search`, `status`, `isArchived`. |
| `POST` | `/api/clients` | Authenticated | Create a new client record with contact person, address, and GST number. |
| `GET` | `/api/clients/:id` | Authenticated | Get detailed record for a specific client. |
| `PUT` | `/api/clients/:id` | Authenticated | Update client details and notes. |
| `PATCH` | `/api/clients/:id/archive` | Authenticated | Toggle client archival status (`isArchived: true / false`). |
| `DELETE` | `/api/clients/:id` | Admin | Delete a client record. |

---

## 4. Project Management Endpoints (`/api/projects`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Authenticated | List all projects scoped to tenant. Supports `status` and `clientId` filters. |
| `POST` | `/api/projects` | Authenticated | Create new project with code, budget, deadline, and assigned team. |
| `GET` | `/api/projects/:id` | Authenticated | Get full project details, milestones, budget, and attachments. |
| `PUT` | `/api/projects/:id` | Authenticated | Update project status, progress percentage, budget spent, and team. |
| `DELETE` | `/api/projects/:id` | Admin | Delete project and associated records. |

---

## 5. Task Management Endpoints (`/api/tasks`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Authenticated | List tasks. Query by `projectId`, `assignedTo`, `status`. |
| `POST` | `/api/tasks` | Authenticated | Create a task with priority, labels, checklist items, and due date. |
| `GET` | `/api/tasks/:id` | Authenticated | Retrieve task details with comments thread. |
| `PUT` | `/api/tasks/:id` | Authenticated | Update task attributes, checklist items, and assigned user. |
| `PATCH` | `/api/tasks/:id/status` | Authenticated | Quick status update for Kanban board transitions. |
| `POST` | `/api/tasks/:id/comments` | Authenticated | Append a comment to the task discussion thread. |
| `DELETE` | `/api/tasks/:id` | Authenticated | Delete a task. |

---

## 6. Time Tracking Endpoints (`/api/time`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/time` | Authenticated | List time log entries for tenant. |
| `POST` | `/api/time` | Authenticated | Record a work session with hours, billable flag, and rate. |
| `DELETE` | `/api/time/:id` | Authenticated | Remove an incorrect time log entry. |

---

## 7. Invoices & Billing Endpoints (`/api/invoices`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/invoices` | Authenticated | List all workspace invoices. Query by `status`, `clientId`. |
| `POST` | `/api/invoices` | Authenticated | Generate tax invoice with items, subtotal, tax rate, discount, and total. |
| `GET` | `/api/invoices/:id` | Authenticated | Get invoice details for PDF rendering. |
| `PATCH` | `/api/invoices/:id/status` | Authenticated | Update payment status (e.g. mark 'Paid'). |
| `DELETE` | `/api/invoices/:id` | Admin | Void/delete an invoice. |

---

## 8. File Assets Endpoints (`/api/files`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/files` | Authenticated | List files uploaded by tenant. |
| `POST` | `/api/files` | Authenticated | Upload file asset via `multipart/form-data` (`file`, `category`, `projectId`). |
| `DELETE` | `/api/files/:id` | Authenticated | Delete a file asset. |

---

## 9. Team & HR Leaves Endpoints (`/api/leaves`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/leaves` | Authenticated | List all employee leave requests in workspace. |
| `POST` | `/api/leaves` | Authenticated | Submit an employee leave application. |
| `PATCH` | `/api/leaves/:id/status` | Admin/Manager | Approve or reject a leave application. |
| `DELETE` | `/api/leaves/:id` | Authenticated | Cancel a pending leave request. |

---

## 10. Audit Activity Logs (`/api/activity`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/activity` | Authenticated | Fetch paginated, immutable audit trail for the active tenant. |

---

## 11. AI Intelligence Hub (`/api/ai`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/project-health` | Authenticated | Run predictive health audit on project deliverables and budget velocity. |
| `POST` | `/api/ai/summarize-task` | Authenticated | Generate concise AI executive summary of complex technical sprint tasks. |
| `POST` | `/api/ai/sentiment-analysis`| Authenticated | Analyze client communications and feedback sentiment. |
