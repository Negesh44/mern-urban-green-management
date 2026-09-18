# Smart Urban Green Management System

> **Abstract:** MERN-stack web application for centralized urban green-space management with interactive mapping, environmental KPIs, and citizen reporting.

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/Negesh44/mern-urban-green-management)
[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-teal)](https://github.com/Negesh44/mern-urban-green-management)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8)](https://tailwindcss.com/)
[![Leaflet GIS](https://img.shields.io/badge/GIS-Leaflet%20%2B%20React--Leaflet-green)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

---

## 🌿 Project Overview

The **Smart Urban Green Management System** is an enterprise-grade civic platform designed for municipal governments, urban arborists, and citizens. It centralizes ecological stewardship by pairing spatial GIS tracking of municipal botanical assets with real-time phytosanitary telemetry, automated work order triage, and community environmental hazard reporting.

### Core Capabilities
- **Interactive GIS Mapping**: Spatial visualization of urban trees, municipal parks, urban forests, and linear green corridors powered by Leaflet and OpenStreetMap tiles with status-coded marker pins.
- **Executive Analytics & Environmental KPIs**: Administrative dashboard powered by Recharts with donut charts for tree health ratios, bar charts for asset categorization, and chronological canopy survival curves.
- **Green Asset Inventory & Registry**: Comprehensive registry recording botanical taxonomy, species, estimated age, area, condition, planting history, and GPS coordinates.
- **Citizen Hazard Reporting**: Citizens submit geo-tagged incident reports with auto-detected GPS coordinates, photo uploads via Multer, and transparent resolution tracking.
- **Maintenance & Work Orders**: Arborists schedule pruning, soil aeration, and pest remediation. Admins convert citizen hazard reports directly into asset maintenance tasks.
- **Dual Navigation Experience**: Dedicated collapsible **Admin Sidebar** (`Dashboard`, `Assets`, `Reports`, `Maintenance`) for municipal officials, and an intuitive **Top Navigation Bar** (`Green Map`, `Report Hazard`, `My Reports`) for citizens.
- **Role-Based Access Control (RBAC)**: Secure JWT authentication with distinct access policies for Citizens and Municipal Administrators.

---

## 🏗️ Technology Stack

### Frontend (`/client`)
- **Core**: React 19, Vite 8
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **GIS & Mapping**: Leaflet v1.9, React-Leaflet v5, OpenStreetMap
- **Visualizations**: Recharts v3.10 (Donut/Pie, Bar, and Spline Area charts)
- **Feedback & Notifications**: `react-hot-toast` with custom dark eco theme
- **HTTP Client**: Axios with centralized JWT interceptors
- **Routing**: React Router v7 with protected routes

### Backend (`/server`)
- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM (embedded persistent storage support)
- **Authentication**: JWT (JSON Web Tokens) with HTTP Bearer strategy + Bcrypt.js password hashing
- **File Storage**: Multer disk storage for canopy imagery and incident photos
- **Security & Middleware**: CORS, role-based authorization guards, error handler

---

## 📁 Repository Structure

```text
mern-urban-green-management/
├── package.json                   # Workspace orchestration scripts
├── .gitignore                     # Git exclusion rules
├── README.md                      # Comprehensive project documentation
├── client/                        # React Frontend (Vite)
│   ├── index.html
│   ├── vite.config.js             # Dev server config (Port 5180 with /api proxy)
│   └── src/
│       ├── App.jsx                # Router configuration & Toast provider
│       ├── main.jsx               # React DOM entry point
│       ├── index.css              # Tailwind CSS & Leaflet map styling
│       ├── components/
│       │   ├── AdminSidebar.jsx   # Dedicated executive admin sidebar
│       │   ├── Navbar.jsx         # Responsive citizen/guest top navigation
│       │   ├── Layout.jsx         # Dual navigation shell
│       │   ├── AssetMap.jsx       # Interactive GIS canopy map
│       │   ├── LocationPickerMap.jsx # Click-to-pin coordinate picker
│       │   ├── AssetFormModal.jsx # Add/Edit asset modal with photo upload
│       │   └── ProtectedRoute.jsx # Role-based route guard
│       ├── context/
│       │   └── AuthContext.jsx    # Session & JWT token provider
│       ├── pages/
│       │   ├── Landing.jsx        # Public hero page with abstract & CTAs
│       │   ├── Login.jsx          # Login with 1-click test credentials
│       │   ├── Signup.jsx         # User registration with role selection
│       │   ├── AdminDashboard.jsx # Executive KPI dashboard, inventory & charts
│       │   ├── AdminReports.jsx   # Incident triage & work order conversion
│       │   ├── CitizenDashboard.jsx # Public canopy map & nearby green reserves
│       │   ├── AssetDetail.jsx    # Asset telemetry & maintenance history
│       │   ├── ReportIssue.jsx    # Hazard reporting with geolocation
│       │   └── MyReports.jsx      # Citizen personal report tracker
│       └── services/
│           └── api.js             # Centralized Axios client
└── server/                        # Node.js Express Backend
    ├── server.js                  # Express application entry point (Port 5000)
    ├── seed.js                    # Database seeder (22 assets, logs, reports)
    ├── api_requests.http          # REST client specification collection
    ├── config/
    │   └── db.js                  # MongoDB connection handler & fallback
    ├── controllers/
    │   ├── authController.js      # Signup, login, me
    │   ├── assetController.js     # Asset CRUD & query filters
    │   ├── maintenanceController.js # Maintenance logs & work orders
    │   ├── reportController.js    # Citizen reporting & task conversion
    │   └── dashboardController.js # Aggregated KPIs, charts & attention alerts
    ├── middleware/
    │   ├── authMiddleware.js      # JWT verification guard
    │   ├── roleMiddleware.js      # Role restriction (Admin vs. Citizen)
    │   └── uploadMiddleware.js    # Multer file upload handler
    ├── models/
    │   ├── User.js                # User account schema (admin / citizen)
    │   ├── Asset.js               # Green asset schema (tree, park, forest, belt)
    │   ├── MaintenanceLog.js      # Maintenance log schema
    │   └── Report.js              # Incident hazard report schema
    ├── routes/
    │   ├── authRoutes.js
    │   ├── assetRoutes.js
    │   ├── maintenanceRoutes.js
    │   ├── reportRoutes.js
    │   └── dashboardRoutes.js     # Executive dashboard summary route
    └── tests/
        ├── api_test.js            # Asset & Maintenance test suite
        ├── report_test.js         # Citizen reporting test suite
        └── dashboard_test.js      # Executive dashboard & KPI test suite
```

---

## 🚀 Setup & Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Negesh44/mern-urban-green-management.git
cd mern-urban-green-management
```

### 2. Install Dependencies
```bash
# Install root orchestration dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Environment Variables Configuration
In the `server/` directory, create a `.env` file (referencing `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_urban_green
JWT_SECRET=super_secret_urban_green_jwt_key_2026_production
JWT_EXPIRE=30d
```

### 4. Seed the Database
Populates 22 botanical assets (trees, parks, urban forests, green belts), 5 maintenance logs, 3 citizen reports, and default test accounts:
```bash
cd server
node seed.js
cd ..
```

### 5. Start Both Applications
Open two terminal windows:

**Terminal 1 — Backend Server:**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd client
npm run dev
# Running on http://localhost:5180
```

---

## 🔑 Demonstration & Evaluation Accounts

The database includes pre-configured accounts for testing with 1-click Quick-Fill buttons on the Login page:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@citygreen.gov` | `Admin@123` | Executive KPI Dashboard, Asset CRUD, Incident Triage, Work Order Conversion |
| **Community Citizen** | `citizen@citygreen.gov` | `Citizen@123` | Interactive Green Map, Report Hazards (GPS + Photo), Track My Reports |

---

## 📡 Complete REST API Route Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register new citizen or administrator account |
| `POST` | `/api/auth/login` | Public | Authenticate user, return signed JWT and profile |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated session profile |

### Assets Management (`/api/assets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assets` | Private | Retrieve all assets (supports `?type=`, `?healthStatus=`, `?search=`) |
| `GET` | `/api/assets/:id` | Private | Retrieve single asset with populated maintenance history |
| `POST` | `/api/assets` | Admin | Create green asset (supports Multer image uploads) |
| `PUT` | `/api/assets/:id` | Admin | Update asset attributes, dimensions, or condition |
| `DELETE` | `/api/assets/:id` | Admin | Delete asset and cascade remove associated logs |

### Arboricultural Maintenance (`/api/maintenance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/maintenance/:assetId` | Private | Retrieve chronological maintenance history for asset |
| `POST` | `/api/maintenance` | Admin | Log arboricultural activity (pruning, irrigation, spraying) |

### Citizen Incident Reporting (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports` | Citizen | Submit hazard report with GPS coords and photo upload |
| `GET` | `/api/reports` | Private | Citizen views own reports; Admin views all municipal reports |
| `PUT` | `/api/reports/:id` | Admin | Update status (`Pending`, `In Progress`, `Resolved`) |
| `POST` | `/api/reports/:id/convert` | Admin | Convert incident report directly into an asset maintenance task |

### Executive Analytics & KPIs (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Admin | Aggregated metrics: assets by type, health ratios, green area, pending reports, 6-month overdue maintenance, and survival trends |

---

## 🧪 Automated Verification Suite

Run the end-to-end integration test suites:
```bash
# 1. Asset & Maintenance CRUD Test Suite (12 tests)
node server/tests/api_test.js

# 2. Citizen Reporting & Task Conversion Test Suite (9 tests)
node server/tests/report_test.js

# 3. Executive Dashboard & KPI Aggregation Test Suite
node server/tests/dashboard_test.js

# 4. Frontend Production Build Check
cd client && npm run build
```

---

## 📄 License
This project is licensed under the ISC License.
