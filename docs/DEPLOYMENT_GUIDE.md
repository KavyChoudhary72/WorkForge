# WorkForge Production Deployment Guide

This guide provides step-by-step instructions for deploying the WorkForge SaaS Platform to production environments using Vercel (Frontend), Render / Railway (Backend), and MongoDB Atlas (Database).

---

## 1. Prerequisites & Cloud Accounts

Ensure you have created and configured accounts on:
1. **MongoDB Atlas** (Cloud Database cluster)
2. **Render** or **Railway** (Containerized Node.js Web Service)
3. **Vercel** or **Netlify** (Static Frontend SPA Hosting)
4. **Cloudinary** (Optional: For cloud asset delivery, otherwise local disk storage is active)

---

## 2. Database Setup (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a new Cluster (M0 Free or M10+ Production Dedicated).
3. Under **Database Access**, create a user (e.g. `workforge_admin`) with read/write permissions.
4. Under **Network Access**, add `0.0.0.0/0` (or your backend provider's IP range) to the IP Access List.
5. Click **Connect** -> **Connect your application** (Driver: Node.js) and copy the connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/workforge_production?retryWrites=true&w=majority
   ```

---

## 3. Backend Deployment (Render / Railway)

### Option A: Deploy via Render (`render.yaml`)
WorkForge includes a ready-to-use `render.yaml` blueprint.

1. Push your repository to GitHub.
2. In the Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Configure the required Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A high-entropy 64-character secret key
   - `JWT_REFRESH_SECRET`: A different high-entropy 64-character secret key
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://workforge-saas.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`: (Optional)
   - `CLOUDINARY_API_KEY`: (Optional)
   - `CLOUDINARY_API_SECRET`: (Optional)
5. Render will execute:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

### Option B: Deploy Backend via Railway (`railway.json` / `Procfile`)
WorkForge includes automated `railway.json`, `Procfile`, and `nixpacks.toml` configurations.

1. Log in to [Railway](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository: `KavyChoudhary72/WorkForge`.
4. (Optional but recommended) In Railway Service Settings -> **Source** -> Set **Root Directory** to `/backend` (or leave as root, as root-level fallback configs are pre-configured).
5. In Railway Service -> **Variables**, add your environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Railway injects this automatically, but setting 5000 is good fallback)
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: High-entropy access token secret (min 32 characters)
   - `REFRESH_TOKEN_SECRET`: High-entropy refresh token secret (min 32 characters)
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://work-forge.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API Key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret
   - `RAZORPAY_KEY_ID`: `rzp_test_...` (or live)
   - `RAZORPAY_SECRET`: Your Razorpay Secret
   - `GEMINI_API_KEY`: Your Gemini API key
6. Railway will automatically build via Nixpacks and deploy with a public domain (e.g. `https://workforge-production.up.railway.app`).
7. Update your Vercel frontend environment variable:
   - `VITE_API_BASE_URL`: `https://workforge-production.up.railway.app/api`
   - `VITE_SOCKET_URL`: `https://workforge-production.up.railway.app`

---

## 4. Frontend Deployment (Vercel)

WorkForge includes a ready-to-use `vercel.json` SPA routing configuration.

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the Project Configuration screen:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend API URL (e.g. `https://workforge-api.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your Render backend base URL (e.g. `https://workforge-api.onrender.com`)
6. Click **Deploy**. Vercel will build the frontend and assign an SSL-secured `.vercel.app` production domain.

---

## 5. Post-Deployment Seed & Health Check

1. **Verify Backend Health**:
   Open `https://workforge-api.onrender.com/health` in your browser. Expected response:
   ```json
   { "status": "OK", "timestamp": "2026-09-19T14:35:00.000Z" }
   ```
2. **Seed Initial Super Admin**:
   Run the seeding script against your production MongoDB URI or use MongoDB Atlas mongosh:
   ```bash
   node backend/src/scripts/seedSuperAdmin.js
   ```
   Default Super Admin credentials:
   - Email: `admin@saas.com`
   - Password: `SuperAdminPassword123!`
   *(Immediately log in and update the password under Settings!)*
3. **Verify WebSocket Handshake**:
   Open Developer Tools -> Network -> WS tab in your browser on the deployed Vercel site. Confirm that the Socket.IO connection establishes with HTTP 101 Switching Protocols.
