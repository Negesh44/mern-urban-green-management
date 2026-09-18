# Vercel Deployment Guide: Smart Urban Green Management System

This guide walks you through deploying the **Smart Urban Green Management System** (Vite + React frontend & Node.js Express backend) to **Vercel** with zero hassle.

---

## 🏗️ Deployment Architecture

The repository is pre-configured with **Vercel Monorepo Serverless Support**:
- **Frontend**: Vite Single Page Application built to `client/dist` and served through Vercel Edge Network.
- **Backend**: Express REST API executed as a Vercel Serverless Function via `api/index.js` and routed at `/api/*`.
- **Database**: Cloud-hosted [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Tier M0 cluster).
- **SPA Routing**: Pre-configured rewrites in `vercel.json` and `client/vercel.json` ensure refreshing subpaths (like `/admin/dashboard` or `/citizen/reports`) never returns 404.

---

## 📋 Prerequisites

1. **GitHub Account**: Connected to [https://github.com/Negesh44/mern-urban-green-management](https://github.com/Negesh44/mern-urban-green-management).
2. **Vercel Account**: Sign up for free at [vercel.com](https://vercel.com).
3. **MongoDB Atlas Account (Free)**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).

---

## Step 1: Set Up MongoDB Atlas (5 minutes)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a new **Free Shared Cluster (M0)**.
3. Under **Database Access**:
   - Click **Add New Database User**.
   - Set Authentication Method: **Password**.
   - Username: e.g. `urbangreen_admin`
   - Password: Click **Autogenerate Secure Password** or set one (save this password!).
   - Built-in Role: **Read and write to any database**.
4. Under **Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel's dynamic serverless IPs can connect.
5. In your cluster dashboard, click **Connect** -> **Drivers** (Node.js).
6. Copy your connection string provided by MongoDB Atlas (example format: `mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DB_NAME>?retryWrites=true&w=majority`).

---

## Step 2: Seed the Cloud Database (One-time)

Before or right after deploying, seed your MongoDB Atlas cluster with the initial assets, user accounts, and test reports:

In your local terminal:
```bash
# Windows PowerShell (paste your actual MongoDB Atlas connection string)
$env:MONGO_URI="<YOUR_MONGODB_ATLAS_CONNECTION_STRING>"
npm run seed
```

This populates:
- 22 municipal green assets (trees, parks, urban forests, green belts) with realistic Bangalore coordinates
- Default administrator (`admin@urbangreen.gov` / `Admin@123`)
- Default citizen (`citizen@urbangreen.gov` / `Citizen@123`)
- Historical maintenance records and citizen hazard reports

---

## Step 3: Deploy to Vercel (1-Click Import)

1. Open your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select your repository: **`Negesh44/mern-urban-green-management`** and click **Import**.
3. In the project configuration:
   - **Framework Preset**: Leave as **Other** (Vercel automatically detects `vercel.json`).
   - **Root Directory**: `./` (leave default root).
   - **Build and Output Settings**: Vercel automatically reads from `vercel.json`:
     - *Build Command*: `cd client && npm install && npm run build`
     - *Output Directory*: `client/dist`
4. Expand **Environment Variables** and add the following keys:

| Name | Value | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `<YOUR_MONGODB_ATLAS_CONNECTION_STRING>` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `urban_green_jwt_production_secret_key_2026_x89` | Strong secret key for JWT signing |
| `NODE_ENV` | `production` | Production environment flag |

5. Click **Deploy**.
6. Vercel will build the frontend and bundle the serverless functions in ~45 seconds. Once finished, you will receive a production URL (e.g. `https://mern-urban-green-management.vercel.app`).

---

## Step 4: Verify Your Live Deployment

Test the live URLs:
1. **Landing Page**: `https://<your-project>.vercel.app/`
2. **API Health Check**: `https://<your-project>.vercel.app/api/health`
   - Should return `{ "status": "healthy", "environment": "Vercel Serverless" }`
3. **Admin Dashboard**: `https://<your-project>.vercel.app/login`
   - Log in using `admin@urbangreen.gov` / `Admin@123`.
4. **Direct SPA Route Refresh**: Test refreshing `https://<your-project>.vercel.app/admin/dashboard` or `/citizen/reports`. The configured rewrites ensure smooth page reloads without 404 errors.

---

## 🛠️ Alternative: Separate Frontend & Backend Setup

If you prefer to host the Express API on a dedicated persistent backend provider (like **Render**, **Railway**, or **Fly.io**) and only the Vite frontend on Vercel:

1. **Deploy Backend** on Render / Railway with root directory `server`, build command `npm install`, start command `npm start`, and environment variable `MONGO_URI`.
2. **Deploy Frontend on Vercel**:
   - In Vercel, set **Root Directory** to `client`.
   - Framework Preset: **Vite**.
   - Add Environment Variable:
     - `VITE_API_URL`: `https://your-backend-service.onrender.com`
   - Deploy!

---

## 💡 Troubleshooting & FAQ

- **Issue**: *MongoDB connection timeout on cold start*
  - **Solution**: In MongoDB Atlas, ensure **Network Access** allows `0.0.0.0/0` (Anywhere). Vercel Serverless functions use dynamic IP addresses.
- **Issue**: *Images uploaded in serverless*
  - **Note**: In Vercel serverless functions, the file system is ephemeral. Images uploaded via Multer are written to `/tmp/uploads`. For persistent enterprise image storage in production, connect AWS S3 or Cloudinary.
- **Issue**: *CORS error*
  - **Solution**: The unified Vercel setup runs on the exact same domain, eliminating cross-origin CORS limitations.
