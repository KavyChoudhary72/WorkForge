# WorkForge Enterprise: Multi-Tenant Project & Client Management SaaS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-emerald?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socketdotio)](https://socket.io/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passed-brightgreen)](./MANUAL_TESTING_REPORT.md)

**WorkForge Enterprise** is a production-grade, multi-tenant Software-as-a-Service (SaaS) platform engineered for modern organizations to manage clients, projects, sprints, tasks, billable hours, invoices, team members, file assets, and audit activities from a unified, high-performance interface.

---

## 📚 Technical Documentation Suite

Comprehensive architectural, schema, security, and deployment documentation is available in the [`docs/`](./docs) directory:

- 🏛 **[System Architecture & Multi-Tenancy Strategy](./docs/ARCHITECTURE.md)**
- 🗄 **[Database Schema & Compound Indexing Specification](./docs/DATABASE_SCHEMA.md)**
- 📡 **[REST API Reference & Route Matrix](./docs/API_DOCUMENTATION.md)**
- 🚀 **[Production Cloud Deployment Guide (Vercel & Render)](./docs/DEPLOYMENT_GUIDE.md)**
- 🛡 **[Security, Encryption & Compliance Practices](./docs/SECURITY_PRACTICES.md)**
- 🔮 **[Future Roadmap & Strategic Enhancements](./docs/FUTURE_IMPROVEMENTS.md)**
- 🧪 **[Manual QA & Testing Report (15 Modules Verified)](./MANUAL_TESTING_REPORT.md)**
- 📮 **[Postman API Collection Export](./postman_collection.json)**

---

## 🏗 Full-Stack Architecture

The workspace is organized into a clean, systematic full-stack directory structure separating client and server concerns:

```
project&clientManagement/
├── frontend/                     # React 19 + Vite 8 Single Page Application
│   ├── src/
│   │   ├── components/           # Reusable UI components & modals
│   │   ├── context/              # AuthContext, DataContext, SocketContext
│   │   ├── pages/                # 15 Workspace page modules
│   │   ├── services/api.js       # Axios client with JWT refresh interceptor
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json               # Vercel SPA routing configuration
│   └── package.json
├── backend/                      # Node.js + Express + MongoDB REST API Server
│   ├── src/
│   │   ├── config/               # db.js, socket.js (Tenant-isolated events)
│   │   ├── controllers/          # Business logic handlers (auth, admin, clients, projects, etc.)
│   │   ├── middleware/           # auth, tenantIsolation, upload (Multer), error handlers
│   │   ├── models/               # Mongoose schemas with compound tenant indexes
│   │   ├── routes/               # Modular Express API routes
│   │   └── server.js             # HTTP + Socket.IO server entry point
│   ├── uploads/                  # Local asset storage directory (Multer)
│   ├── render.yaml               # Render cloud deployment blueprint
│   ├── run_all_tests.js          # Master automated test runner
│   └── package.json
├── docs/                         # Comprehensive 6-part documentation suite
├── MANUAL_TESTING_REPORT.md      # Detailed 15-module QA test cases
├── postman_collection.json       # Ready-to-import Postman API collection
├── .gitignore                    # Unified workspace root gitignore
└── README.md                     # Platform overview & instructions
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher (v20+ recommended)
- **npm**: v9.x or higher
- **MongoDB**: MongoDB Atlas or local MongoDB instance

---

### 1. Backend Setup

1. Navigate to `backend/` and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/workforge?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_access_key_min_32_chars
   JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min_32_chars
   CLIENT_URL=http://localhost:5173
   ```

3. Run automated tests to verify database connectivity and all 11 features:
   ```bash
   npm test
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend REST API and WebSocket server will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a second terminal, navigate to `frontend/` and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend client will launch at `http://localhost:5173`.*

3. Build for production:
   ```bash
   npm run build
   ```

---

## 🔐 Credentials & Default Accounts

### Pre-Configured Test Accounts

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `admin@saas.com` | `SuperAdminPassword123!` | `/super-admin-portal` or `/admin/login` |
| **Company Admin** | `peter@oscorp.com` | `password123` | Oscorp Industries Workspace |
| **Project Manager**| `pm@oscorp.com` | `password123` | Oscorp Projects & Tasks |
| **Employee** | `dev@oscorp.com` | `password123` | Assigned Tasks & Timelogs |

---

## 🌟 Key Application Features

1. **Multi-Tenant Data Isolation**: Complete logical tenant isolation backed by compound indexes (`{ organizationId: 1, ... }`) and tenant-scoped queries.
2. **Role-Based Access Control (RBAC)**: 5 distinct roles (`Super Admin`, `Company Admin`, `Project Manager`, `Employee`, `Client`) with granular API route protection.
3. **Dual-Token Authentication & Inactivity Timeout**: 15-minute access tokens with silent token rotation and 30-minute idle inactivity auto-logout.
4. **Interactive Kanban Board**: Drag-and-drop task boards with priority flags, checklist completion bars, and real-time discussion comments.
5. **Real-time Socket.IO Engine**: Live push notifications for task updates, project milestone changes, invoice payments, and employee leave requests.
6. **Time Tracking & Billing**: Live stopwatch timer and manual logs with automated billable hour utilization metrics.
7. **Invoice & Tax PDF Generation**: Dynamic tax and discount calculations with high-resolution client-facing PDF generation (`jsPDF`).
8. **File Manager**: Multi-category file management with Multer multipart disk uploads and Cloudinary integration support.
9. **Team & HR Leave Management**: Directory with skills badges, performance reviews, and leave request submission/approval workflows.
10. **Executive Dashboard**: Interactive Recharts analytics including Revenue dynamics, Active Projects, Active Clients, Completed Tasks velocity, and upcoming deadlines widget.
11. **Reports & Exports**: Multi-format exports across 5 reporting domains in Excel (`.xlsx`), CSV, and PDF formats.
12. **AI Intelligence Hub**: Predictive project health audits, task complexity summarization, and sentiment analysis.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
