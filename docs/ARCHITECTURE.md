# WorkForge Architecture Documentation

## 1. System Overview

WorkForge is a multi-tenant, cloud-native Software-as-a-Service (SaaS) platform engineered for modern organizations to manage clients, projects, sprints, tasks, billable hours, invoices, team members, file assets, and audit activities from a unified, high-performance interface.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|   React 19 SPA (Vite) + Tailwind CSS v4 + TanStack Query + Socket.IO     |
+-------------------------------------------------------------------------+
                                    │
                                    │ HTTPS (REST API) & WSS (Socket.IO)
                                    ▼
+-------------------------------------------------------------------------+
|                             GATEWAY / API LAYER                         |
|   Node.js & Express.js REST API + Socket.IO Server                      |
|   - Helmet, CORS, Rate Limiting, Winston Audit Logging                  |
|   - JWT Authentication & Asymmetric Refresh Token Rotation              |
|   - Multi-Tenant Middleware (tenantIsolation.js, tenantContext.js)     |
+-------------------------------------------------------------------------+
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
+-------------------------------+       +-------------------------------+
|      PERSISTENCE LAYER        |       |       FILE STORAGE LAYER      |
|  MongoDB Atlas (Replica Set)  |       |  Local Disk /uploads (Dev)    |
|  - Shared Database,           |       |  Cloudinary / AWS S3 (Prod)   |
|    Isolated Collection Model  |       +-------------------------------+
|  - Compound Indexed Tenants   |
+-------------------------------+
```

---

## 2. Multi-Tenant Architecture Strategy

WorkForge adopts the **Shared Database, Shared Schema with Tenant Discriminator** pattern, proven for high scalability, efficient resource utilization, and cost optimization for modern B2B SaaS applications.

### Tenant Isolation Mechanisms
1. **Tenant Identification**: Every authenticated request presents a JWT containing `organizationId`.
2. **Tenant Isolation Middleware (`tenantIsolation.js`)**:
   - Validates that the request has an active, valid tenant context.
   - For Super Admins, allows tenant impersonation or platform-wide oversight.
   - For regular users, binds the execution context to `req.user.organizationId`.
3. **Database Indexing for Tenant Boundaries**:
   Every Mongoose schema incorporates a compound index starting with `organizationId`:
   ```javascript
   TaskSchema.index({ organizationId: 1, projectId: 1, status: 1 });
   ClientSchema.index({ organizationId: 1, isArchived: 1, createdAt: -1 });
   ProjectSchema.index({ organizationId: 1, status: 1, deadline: 1 });
   ```
4. **WebSocket Room Isolation**:
   Socket.IO connections join tenant-specific rooms (`org_${organizationId}`). Broadcasters target only the tenant's room, preventing cross-tenant telemetry leaks.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 with Vite 8 (Ultra-fast HMR and ESM bundling)
- **Styling:** Tailwind CSS v4 with dark mode and glassmorphism styling
- **State & Caching:** TanStack React Query v5 (automatic query caching, garbage collection, and optimistic UI mutations)
- **Icons:** Lucide React
- **Data Visualization:** Recharts (responsive SVG charts for revenue trends, project health, and sprint velocities)
- **Document Export:** jsPDF, html2canvas, xlsx (SheetJS)

### Backend
- **Runtime:** Node.js (v20+ LTS recommended)
- **Web Framework:** Express.js 4.x
- **Real-Time Engine:** Socket.IO 4.x (WebSocket with HTTP long-polling fallback)
- **ODM:** Mongoose 8.x
- **Authentication:** Asymmetric JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **File Management:** Multer (local disk upload) + Cloudinary SDK integration
- **Security:** Helmet, CORS, express-rate-limit, mongo-sanitize

---

## 4. Role-Based Access Control (RBAC) Matrix

| Permission / Action | Super Admin | Company Admin | Project Manager | Employee | Client |
|---|:---:|:---:|:---:|:---:|:---:|
| Global Tenant Provisioning | ✅ | ❌ | ❌ | ❌ | ❌ |
| Subscription Plan Modification | ✅ | ❌ | ❌ | ❌ | ❌ |
| Company Settings & Branding | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Clients (CRUD) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Projects (CRUD) | ✅ | ✅ | ✅ | View Only | View Own |
| Manage Tasks & Kanban | ✅ | ✅ | ✅ | Own/Assigned | View Own |
| Log Billable Hours | ✅ | ✅ | ✅ | ✅ | ❌ |
| Generate & Mark Invoices | ✅ | ✅ | View Only | ❌ | View Own |
| Manage Team & Approve Leaves | ✅ | ✅ | ❌ | ❌ | ❌ |
| Apply for Leaves | ✅ | ✅ | ✅ | ✅ | ❌ |
| Access AI Intelligence Hub | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 5. High Availability & Scalability Considerations

1. **Stateless API Gateway**: The Express.js server maintains zero in-memory session state (sessions are tracked via hashed refresh tokens in MongoDB). Multiple backend instances can run behind an AWS ALB or Nginx reverse proxy.
2. **Socket.IO Redis Adapter**: For horizontal scaling across multiple Node.js nodes, the Socket.IO server can be plugged into `@socket.io/redis-adapter`.
3. **Database Read Replicas**: High-volume read queries (e.g. analytics reports, activity audits) can be routed to MongoDB secondary replica nodes using `{ readPreference: 'secondaryPreferred' }`.
