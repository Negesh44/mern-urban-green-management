# Smart Urban Green Management System (Chennai Municipal Green Registry)

> **Abstract:** Enterprise MERN-stack web application for centralized urban green-space management with interactive Chennai GIS mapping, environmental KPIs, arborist work order dispatch, and citizen incident reporting.

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/Negesh44/mern-urban-green-management)
[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-teal)](https://github.com/Negesh44/mern-urban-green-management)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8)](https://tailwindcss.com/)
[![Leaflet GIS](https://img.shields.io/badge/GIS-Chennai%20Leaflet%20Map-green)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

---

## 🏛️ System Architecture: The MERN Stack

This system is built strictly following the **MERN** architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        R - React (Vite Frontend)                       │
│  • Citizen Community Portal: Green Map, Taxonomy, GPS Hazard Reporter │
│  • Admin Executive Console: Recharts KPIs, Inventory CRUD, Work Orders │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API (Axios + JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        E - Express.js & N - Node.js                    │
│  • Controllers: auth, assets, maintenance, reports, dashboard          │
│  • Middleware: JWT Auth Verification, RBAC Guards, Multer File Uploads │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ODM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             M - MongoDB                                │
│  • Collections: users, assets, maintenancelogs, reports                │
│  • Geo-Coordinates & Geospatial Indexes: Chennai Reference Anchors     │
└────────────────────────────────────────────────────────────────────────┘
```

- **M (MongoDB)**: Persistent NoSQL database storing User credentials (bcrypt hashed), Chennai botanical assets (species, GPS coordinates, dimensions, vitality), arborist maintenance work orders, and citizen hazard reports with photos.
- **E (Express.js)**: High-performance RESTful API backend handling routing, validation, error handling, and business logic.
- **R (React 19 with Vite)**: Single Page Application (SPA) with dedicated separate portals for Municipal Administrators and Citizens, animated charts (Recharts), and interactive maps (React-Leaflet).
- **N (Node.js)**: Asynchronous runtime powering backend services, file streaming, and database communication.

---

## 🌿 Dual Dedicated Portals

The application features two distinct, role-separated portals:

### 1. 🏢 Municipal Admin Executive Portal (`/admin/dashboard`)
*Designed for Greater Chennai Corporation (GCC) officials, arborists, and urban forestry planners:*
- **Executive Analytics & Environmental KPIs**: Real-time charts powered by Recharts (tree health ratios, green canopy area in hectares, chronological cohort survival trends).
- **Asset Inventory & CRUD Management**: Search, filter, add, edit, and delete Chennai trees, botanical parks, urban forests, and linear green corridors with photo upload.
- **Spatial Canopy Map**: Full-screen GIS Leaflet map showing all assets categorized by type and health condition.
- **Citizen Hazard Triage & Work Order Conversion (`/admin/reports`)**: Inspect community-reported tree hazards, update resolution triage states (`Pending` ➔ `In Progress` ➔ `Resolved`), and convert reports directly into arborist maintenance work orders with one click.
- **Executive Navigation**: Permanent executive sidebar with quick navigation between Analytics, Inventory, Map, Incident Triage, and Maintenance Action Items.

### 2. 🌳 Citizen Community Portal (`/citizen/dashboard`)
*Designed for Chennai residents, nature stewards, and civic volunteers:*
- **Interactive Chennai Green Map**: Real-time Leaflet map centered on Chennai (`13.0827° N, 80.2707° E`) displaying botanical landmarks like Semmozhi Poonga, Guindy National Park, Chetpet EcoPark, and Marina Beach Promenade.
- **Botanical Taxonomy & Adoption**: View tree species details, age, condition, and virtual tree adoption tracking.
- **GPS Hazard Reporter (`/citizen/report`)**: One-tap GPS coordinate detection, interactive click-to-pin location picker, camera photo upload, and instant dispatch to municipal crews.
- **My Reports Tracker (`/citizen/reports`)**: Live personal report tracking showing triage status badges and resolution updates.

---

## 📍 Chennai Map Reference & Pre-Seeded Botanical Assets

The system is configured with **Chennai, Tamil Nadu, India** as its geographical and municipal reference center (`lat: 13.0827, lng: 80.2707`):

### Catalogued Chennai Green Spaces:
1. **Parks**:
   - **Semmozhi Poonga Botanical Garden** (Cathedral Road, Teynampet - 89,000 m²)
   - **Chetpet EcoPark & Lake** (Chetpet - 65,000 m²)
   - **Anna Nagar Tower Park / Dr. Visveswaraya Park** (Anna Nagar - 110,000 m²)
   - **Nageswara Rao Park** (Luz, Mylapore - 45,000 m²)
   - **Tholkappia Poonga / Adyar Eco Park** (Adyar Estuary - 350,000 m²)
2. **Urban Forests & Reserves**:
   - **Guindy National Park & Biosphere Sanctuary** (Guindy - 2.7 km²)
   - **Nanmangalam Reserve Forest Sanctuary** (South Chennai - 3.2 km²)
   - **Pallikaranai Marshland Conservation Reserve** (Pallikaranai - 1.2 km²)
3. **Linear Green Belts**:
   - **Marina Beach Promenade Coastal Green Belt** (Kamarajar Salai)
   - **OMR IT Expressway Green Corridor** (Rajiv Gandhi Salai)
   - **Besant Nagar & Elliot's Coastal Buffer** (6th Avenue)
4. **Heritage Trees**:
   - Centuries-old Peepal at Kapaleeshwarar Temple Grove, Mylapore
   - Historic Great Banyan at Theosophical Society, Adyar
   - Coastal Casuarina at Marina Beach
   - Ancient Neem at San Thome High Road
   - Yellow Copperpod (Iyalvagai) at IIT Madras Campus Canopy
   - Cannonball Tree (Nagalingam) at Panagal Park, T. Nagar
   - Rain Trees (Samanea saman) along Nungambakkam High Road

---

## 💾 MongoDB Setup & Data Persistence Steps

To ensure user accounts, passwords, hazard reports, and tree records are saved permanently in MongoDB, choose one of the following two options:

### Option A: Free Cloud MongoDB Atlas (Recommended — 3 Minutes, Zero Windows Install)

1. **Create Free Account**:
   - Sign up at [https://cloud.mongodb.com](https://cloud.mongodb.com).
   - Create a free **M0 Sandbox Cluster** (select AWS / Mumbai `ap-south-1` region for lowest latency).
2. **Configure Database Access**:
   - In **Database Access**, create a user (e.g. `chennai_admin`) with a secure password.
3. **Configure Network Access**:
   - In **Network Access**, click **Add IP Address** ➔ Select **Allow Access From Anywhere** (`0.0.0.0/0`).
4. **Get Connection String**:
   - Click **Connect** ➔ **Drivers** (Node.js).
   - Copy connection URI (looks like `mongodb+srv://chennai_admin:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority`).
5. **Add to `.env`**:
   - Open `server/.env` and update:
     ```env
     PORT=5000
     MONGO_URI=mongodb+srv://chennai_admin:YOUR_PASSWORD@cluster0.xxx.mongodb.net/smart_urban_green?retryWrites=true&w=majority
     JWT_SECRET=super_secret_urban_green_jwt_key_2026
     NODE_ENV=development
     ```
6. **Seed Chennai Database**:
   ```bash
   node server/seed.js
   ```

---

### Option B: Local Windows MongoDB Community Service

1. **Download & Install**:
   - Download **MongoDB Community Server** (.msi) from [MongoDB Download Center](https://www.mongodb.com/try/download/community).
   - Check the box **"Install MongoDB as a Windows Service"** and install **MongoDB Compass** (optional GUI).
2. **Start the Windows Service**:
   - Open PowerShell as Administrator and run:
     ```powershell
     net start MongoDB
     ```
3. **Verify in `server/.env`**:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smart_urban_green
   JWT_SECRET=super_secret_urban_green_jwt_key_2026
   NODE_ENV=development
   ```
4. **Seed Chennai Database**:
   ```bash
   node server/seed.js
   ```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install-all
```

### 2. Seed Database with Chennai Green Assets
```bash
npm run seed
```

### 3. Start Both Frontend & Backend Concurrently
```bash
npm run dev
```
- **Backend API**: Running at `http://localhost:5000`
- **Frontend SPA**: Running at `http://localhost:5180`

---

## 🔑 Demonstration Accounts

The database comes pre-seeded with accounts for both portals:

| Portal | Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Executive Console** | `admin@citygreen.gov` | `Admin@123` | `admin` | Full Analytics, Asset CRUD, Incident Triage, Work Order Dispatch |
| **Citizen Green Portal** | `citizen@citygreen.gov` | `Citizen@123` | `citizen` | Chennai Canopy Map, GPS Incident Reporting, Personal Report Tracking |

---

## 📡 REST API Summary

| Route | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Public | Register new citizen or admin account |
| `/api/auth/login` | `POST` | Public | Authenticate user & receive JWT token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile |
| `/api/assets` | `GET` | Authenticated | List all green assets (filter by type/health) |
| `/api/assets` | `POST` | Admin | Add new green asset with photos |
| `/api/assets/:id` | `PUT` | Admin | Edit asset condition or details |
| `/api/assets/:id` | `DELETE` | Admin | Delete asset and cascade remove logs |
| `/api/reports` | `POST` | Citizen | Submit GPS-tagged hazard report with photo |
| `/api/reports` | `GET` | Authenticated | List reports (Citizen: own; Admin: all) |
| `/api/reports/:id` | `PUT` | Admin | Update status (`Pending` ➔ `In Progress` ➔ `Resolved`) |
| `/api/reports/:id/convert`| `POST` | Admin | Convert hazard report into maintenance task |
| `/api/dashboard/summary` | `GET` | Admin | Aggregated environmental KPIs & survival curves |

---

## 📄 License
Licensed under the ISC License.
