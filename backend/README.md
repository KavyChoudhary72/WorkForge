# NexusPulse Backend API

Node.js, Express, and MongoDB REST API server powering the **NexusPulse Multi-Tenant Project & Client Management SaaS Platform**.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Security**: JWT Authentication, bcryptjs hashing, RBAC middleware
- **Configuration**: Dotenv, CORS

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/          # MongoDB connection configuration (db.js)
│   ├── controllers/     # Request logic (authController, projectController, userController)
│   ├── middleware/      # Authentication & error handling
│   ├── models/          # Mongoose schemas (Organization, User, Client, Project, Task)
│   ├── routes/          # Express route definitions
│   └── server.js        # Express application entry point
├── .env.example         # Environment template file
├── .gitignore           # Backend gitignore rules
├── package.json         # Dependencies and scripts
└── README.md            # Backend API documentation
```

---

## 🚀 Getting Started

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and adjust settings:

```bash
cp .env.example .env
```

### 3. Running the API Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The API will run at `http://localhost:5000` (or specified `PORT`).

---

## 🔌 Core API Endpoints

### Health Check
- `GET /api/health` - Check API server status

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate & retrieve JWT token
- `GET /api/auth/me` - Fetch logged-in user profile (*Protected*)

### Projects (`/api/projects`)
- `GET /api/projects` - Get all projects for current tenant (*Protected*)
- `POST /api/projects` - Create a new project (*Admin/PM*)
- `GET /api/projects/:id` - Get project details (*Protected*)
- `PUT /api/projects/:id` - Update project (*Admin/PM*)
- `DELETE /api/projects/:id` - Delete project (*Admin*)

### Users & Team (`/api/users`)
- `GET /api/users` - Get workspace team members (*Protected*)
- `PUT /api/users/profile` - Update personal profile (*Protected*)
