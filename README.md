# mern-urban-green-management

> **Smart Urban Green Management System** — A full-stack MERN platform for municipal green asset tracking, interactive GIS canopy mapping, maintenance work orders, and citizen environmental hazard reporting.

---

## 🌿 Overview

Smart Urban Green Management System provides a comprehensive digital platform for urban ecological stewardship. It bridges municipal green infrastructure management with active citizen participation.

### Key Capabilities
- **Interactive GIS Mapping**: Leaflet & React-Leaflet powered spatial map of all catalogued urban assets with custom health status color-coding.
- **Green Asset Inventory**: Track taxonomy, estimated age, dimensions, condition, planting date, and coordinate telemetry for trees, parks, urban forests, and linear green belts.
- **Maintenance & Work Orders**: Log arboricultural maintenance activities (pruning, irrigation, pest remediation) with chronological history tracking.
- **Citizen Hazard Reporting**: Citizens report fallen limbs, tree diseases, and infrastructure hazards with auto-detected GPS coordinates and photos.
- **Admin Triage & Conversion**: Municipal administrators triage incident alerts, update statuses, and convert hazard reports into maintenance tasks.
- **Role-Based Access Control (RBAC)**: Secure JWT authentication with distinct access policies for Citizens and Municipal Admins.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/client`)
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Mapping & GIS**: Leaflet, React-Leaflet, OpenStreetMap Tiles
- **Charts & Telemetry**: Recharts
- **HTTP Client**: Axios with centralized request/response JWT interceptors
- **Routing**: React Router v7 with protected routes

### Backend (`/server`)
- **Runtime & Framework**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM (embedded persistent storage support)
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt.js password hashing
- **File Uploads**: Multer disk storage for canopy imagery and incident photos
- **Security**: CORS, role-based authorization middleware

---

## 📁 Repository Structure

```text
mern-urban-green-management/
├── package.json                   # Workspace orchestration scripts
├── .gitignore                     # Git exclusion rules
├── README.md                      # Documentation
├── client/                        # React Frontend (Vite)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                # Router configuration
│       ├── main.jsx               # Entry point with BrowserRouter
│       ├── index.css              # Tailwind CSS & Leaflet styles
│       ├── components/
│       │   ├── AssetMap.jsx       # Interactive GIS map with color-coded markers
│       │   ├── LocationPickerMap.jsx # Click-to-pin mini-map
│       │   ├── AssetFormModal.jsx # Add/Edit modal with image upload
│       │   ├── Navbar.jsx         # Contextual navigation
│       │   ├── Layout.jsx         # App shell
│       │   └── ProtectedRoute.jsx # RBAC route guard
│       ├── context/
│       │   └── AuthContext.jsx    # Session & auth state provider
│       ├── pages/
│       │   ├── Landing.jsx        # Landing page
│       │   ├── Login.jsx          # Login with 1-click test credentials
│       │   ├── Signup.jsx         # Registration with role selection
│       │   ├── AdminDashboard.jsx # Admin asset table, map & analytics
│       │   ├── AdminReports.jsx   # Admin incident triage & maintenance dispatch
│       │   ├── CitizenDashboard.jsx # Citizen view & nearby reserves
│       │   ├── AssetDetail.jsx    # Asset view & maintenance history
│       │   ├── ReportIssue.jsx    # Hazard reporting with geolocation
│       │   └── MyReports.jsx      # Citizen report tracking
│       └── services/
│           └── api.js             # Centralized Axios instance
└── server/                        # Node.js Express Backend
    ├── server.js                  # App entry point
    ├── seed.js                    # Database seeder (22 assets, logs, reports)
    ├── api_requests.http          # HTTP REST client collection
    ├── config/
    │   └── db.js                  # MongoDB connection handler
    ├── controllers/
    │   ├── authController.js      # Signup, login, me
    │   ├── assetController.js     # Asset CRUD & query filters
    │   ├── maintenanceController.js # Maintenance logs
    │   └── reportController.js    # Citizen reporting & task conversion
    ├── middleware/
    │   ├── authMiddleware.js      # JWT verification
    │   ├── roleMiddleware.js      # Role restriction (Admin vs. Citizen)
    │   └── uploadMiddleware.js    # Multer file upload handler
    ├── models/
    │   ├── User.js                # User schema
    │   ├── Asset.js               # Asset schema (tree, park, forest, belt)
    │   ├── MaintenanceLog.js      # Maintenance log schema
    │   └── Report.js              # Incident report schema
    ├── routes/
    │   ├── authRoutes.js
    │   ├── assetRoutes.js
    │   ├── maintenanceRoutes.js
    │   └── reportRoutes.js
    └── tests/
        ├── api_test.js            # Asset & Maintenance test suite
        └── report_test.js         # Citizen reporting test suite
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Negesh44/mern-urban-green-management.git
cd mern-urban-green-management

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Seed Database
```bash
cd ../server
node seed.js
```

### 4. Running the Application
In separate terminal windows:

```bash
# Start Backend (runs on http://localhost:5000)
cd server
npm run dev

# Start Frontend (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 🔑 Default Test Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@citygreen.gov` | `Admin@123` | Full Admin Operations, Asset CRUD, Incident Triage, Work Order Conversion |
| **Citizen** | `citizen@citygreen.gov` | `Citizen@123` | Citizen Map, Report Hazards, Track My Reports |

---

## 📄 License
ISC
