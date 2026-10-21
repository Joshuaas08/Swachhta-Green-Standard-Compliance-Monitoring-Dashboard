# Swachhta & Green Standard Compliance Monitoring Dashboard (MERN)

A production-ready full-stack MERN (MongoDB, Express.js, React, Node.js) platform for auditing, scoring, and maintaining institutional cleanliness and green standards compliance.

---

## 🏛️ System Overview & Architecture

The system enables institutions to systematically benchmark facilities across 5 sustainability categories:
1. **Cleanliness & Hygiene** (Weights 1–5)
2. **Waste Segregation** (Weights 1–5)
3. **Water Conservation** (Weights 1–5)
4. **Energy Efficiency** (Weights 1–5)
5. **Air Quality & Environment** (Weights 1–5)

### 🧮 Compliance Calculation Engine
$$\text{Compliance Score } \% = \left(\frac{\sum (\text{Item Weight} \times \text{Status Multiplier})}{\sum \text{Item Weight}}\right) \times 100$$

- **Status Multipliers**:
  - `PASS` = 1.0 (Full points earned)
  - `PARTIAL` = 0.5 (Half points earned)
  - `FAIL` = 0.0 (Zero points earned)

- **Official Compliance Tiers**:
  - 🟢 **90% – 100%**: **Excellent**
  - 🟢 **75% – 89%**: **Good**
  - 🟡 **60% – 74%**: **Needs Improvement**
  - 🔴 **0% – 59%**: **Poor**

- **Automated Issue Workflow**:
  - Every `FAIL` item on an inspection checklist automatically spawns a tracked `Issue` with priority mapped to criterion weight ($W \ge 4 \implies \text{CRITICAL}$, $W=3 \implies \text{HIGH}$, $W \le 2 \implies \text{MEDIUM/LOW}$).
  - Full remediation lifecycle: `OPEN` $\to$ `IN_PROGRESS` $\to$ `RESOLVED` $\to$ `CLOSED` with audit trail and proof photo attachments.

---

## 👥 Role-Based Access Control (RBAC)

Pre-seeded accounts with 1-click test switchers in the UI:

| Role | Email | Password | Responsibilities |
|---|---|---|---|
| **System Admin** | `admin@swachhta.gov.in` | `Admin@123` | Full control: Manage users, buildings, zones, criteria weights, and institutional settings. |
| **Inspector** | `inspector@swachhta.gov.in` | `Inspector@123` | Conduct on-site facility audits, score checklists, attach photo evidence, view live scoring meter. |
| **Maintenance / Mgmt** | `maintenance@swachhta.gov.in` | `Maintain@123` | Review executive analytics, assign technicians, resolve non-conformance issues with proof. |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- *(Optional)* MongoDB (If no MongoDB is running, the app automatically boots an embedded in-memory MongoDB instance with pre-seeded data).

### 1. Run Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs at `http://localhost:5000`*

### 2. Run Frontend Client
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 🧪 Running Tests
To verify all calculations and API endpoints:
```bash
cd backend
npm test
```
Tests both unit tests for the compliance engine formula and integration tests for auth, buildings, criteria, audits, and issues.

---

## 📁 Project Structure

```
fsd-project/
├── backend/
│   ├── config/             # DB connector (MongoDB + Memory fallback)
│   ├── controllers/        # auth, building, criteria, inspection, issue, analytics
│   ├── middleware/         # JWT auth, RBAC authorization, multer upload, errorHandler
│   ├── models/             # Mongoose schemas: User, Building, Criteria, Inspection, Issue
│   ├── routes/             # Express API route definitions
│   ├── utils/              # Compliance scoring engine & grade classifier
│   ├── seeder.js           # Comprehensive realistic dataset seeder
│   ├── server.js           # Express app entrypoint
│   └── test/               # Automated unit & integration tests
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, ScoreBadge, ProtectedRoute
│   │   ├── context/        # AuthContext (JWT, role helpers, demo switchers)
│   │   ├── pages/          # Login, Dashboard, Buildings, Criteria, NewInspection,
│   │   │                   # InspectionDetails, InspectionsList, Issues, Analytics
│   │   ├── services/       # Axios API client & endpoints
│   │   ├── App.jsx         # Routing & ProtectedRoute configuration
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── package.json
```
