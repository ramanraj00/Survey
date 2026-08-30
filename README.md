# 📋 Survey Management System

A full-stack **Demand-Side Survey Management Platform** built for **DISCOM (Distribution Company)** operations. The system enables field agents to collect detailed electricity consumer surveys (Residential, Commercial, Industrial) and provides admins with tools to review, audit, edit, approve, and export survey data to Excel.

---

## 📸 Overview

| Feature | Description |
|---------|-------------|
| **Multi-step Survey Forms** | Category-specific data collection (Residential / Commercial / Industrial / Inventory) |
| **Role-Based Access** | Agent and Admin roles with invite-only registration |
| **Optimistic Concurrency Control** | Version-based conflict detection on every save |
| **Granular Audit Logging** | Field-level change tracking for admin edits |
| **Soft Validation Engine** | 2-layer validation (conditional + generic null-check) with warnings |
| **Excel Export** | Structured `.xlsx` export of approved surveys with category-specific sheets |
| **Survey Lifecycle** | `DRAFT → SUBMITTED → APPROVED` workflow |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** + **Express 5** | REST API Server |
| **PostgreSQL** (Neon Serverless) | Cloud-hosted database |
| **Drizzle ORM** + **Drizzle Kit** | Type-safe ORM & migrations |
| **Better Auth** | Session-based authentication with Drizzle adapter |
| **Argon2** | Password hashing |
| **XLSX** | Excel file generation for survey export |
| **express-rate-limit** | Rate limiting on auth endpoints |
| **Vercel** | Serverless deployment |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **React Router DOM 7** | Client-side routing |
| **Framer Motion** | Animations & transitions |
| **Lucide React** | Icon library |
| **Recharts** | Dashboard charts & visualizations |
| **OxLint** | Linting |

---

## 📁 Project Structure

```
Survey/
├── Backend/
│   ├── server.js              # Express app, routes, auth endpoints
│   ├── auth.js                # Better Auth configuration
│   ├── db.js                  # PostgreSQL connection (Drizzle + pg Pool)
│   ├── middlewares.js         # Auth, RBAC, ownership, status & version checks
│   ├── drizzle.config.js      # Drizzle Kit configuration
│   ├── migrate.mjs            # Custom migration script
│   ├── vercel.json            # Vercel deployment config
│   ├── .env                   # Environment variables
│   │
│   ├── models/                # Database schemas (Drizzle ORM)
│   │   ├── auth-schema.js     # User, Session, Account, Verification tables
│   │   ├── schema.js          # Surveys, Invitations, CommonDetails, Inventory, AuditLogs
│   │   ├── residential.js     # Residential profiles, appliances, EV, solar, etc.
│   │   ├── commercial.js      # Commercial profiles, shifts, controls
│   │   ├── industrial.js      # Industrial profiles, processes, dependencies, controls
│   │   └── demand_response.js # DR profiles, load selections, commercial/industrial DR
│   │
│   ├── routes/                # API route handlers
│   │   ├── surveys.js         # Agent CRUD: create, read, update sections, validate, submit
│   │   ├── admin.js           # Admin: stats, survey list, 360-view, edit with audit, approve, invitations
│   │   └── export.js          # Excel export of approved surveys
│   │
│   ├── services/              # Business logic
│   │   ├── surveyFetcher.js   # Fetches full 360° survey view (concurrent queries)
│   │   └── validator.js       # 2-layer soft validation engine
│   │
│   └── scripts/               # Dev/test/migration utility scripts
│
└── Frontend/
    ├── index.html             # Entry HTML
    ├── vite.config.js         # Vite config with API proxy
    ├── vercel.json            # Vercel SPA rewrite + API proxy
    │
    └── src/
        ├── main.jsx           # React entry point
        ├── App.jsx            # Routing (agent & admin protected routes)
        ├── App.css            # Global styles
        ├── index.css          # Base CSS
        │
        ├── context/
        │   └── SurveyContext.jsx  # Survey state, version tracking, save dispatcher
        │
        ├── hooks/
        │   └── useBaseRoute.js    # Dynamic base route helper
        │
        ├── components/common/     # Reusable UI components
        │   ├── AppLayout.jsx      # Main layout shell
        │   ├── ProtectedRoute.jsx # Role-based route guard
        │   ├── FormInput.jsx      # Form input component
        │   ├── Select.jsx         # Dropdown select
        │   ├── Button.jsx         # Button component
        │   ├── Card.jsx           # Card container
        │   ├── Toast.jsx          # Toast notifications
        │   ├── ArrayTable.jsx     # Dynamic array/table editor
        │   ├── DataViewer.jsx     # Read-only data display
        │   ├── IsometricCubes.jsx # Background animation
        │   └── PixelWaveBg.jsx    # Background animation
        │
        └── pages/
            ├── Login/             # Login page
            ├── Signup/            # Invite-based signup
            ├── Dashboard/
            │   ├── AgentDashboard.jsx    # Agent's survey overview
            │   └── AdminDashboard.jsx    # Admin stats & charts
            ├── SurveyList/        # Survey listing pages
            ├── SurveyCreate/      # New survey creation
            ├── SurveySubmit/      # Survey submission with validation
            ├── Admin/Agents/      # Agent management
            │
            └── Survey/            # Multi-step survey forms
                ├── Common/        # Common details form (Section A)
                ├── Inventory/     # Equipment inventory (Section B)
                ├── Residential/   # Residential survey (Section C)
                │   └── sections/  # Profile, Appliances, EV, Solar, etc.
                ├── Commercial/    # Commercial survey (Section D)
                │   └── sections/  # Profile, Shifts, Controls, Flexibility
                ├── Industrial/    # Industrial survey (Section E)
                │   └── sections/  # Profile, Processes, Dependencies, Controls
                ├── DemandResponse/ # DR willingness (Section C4/D4/E4)
                └── Admin/         # Admin 360° survey view with audit logs
```

---

## 🗄️ Database Schema

The application uses **20+ PostgreSQL tables** organized by survey category:

### Core Tables
| Table | Description |
|-------|-------------|
| `user` | Users (agents & admins) with role field |
| `session` | Active user sessions (Better Auth) |
| `account` | Auth accounts (email/password) |
| `verification` | Email verification tokens |
| `invitations` | Invite-only registration tokens (SHA-256 hashed) |
| `surveys` | Core survey record with status, version, agent reference |
| `survey_common_details` | Section A — common survey info (address, meter, consumption) |
| `survey_audit_logs` | Field-level audit trail for admin edits |
| `inventory_items` | Section B — equipment/load inventory |

### Residential Tables (Section C)
| Table | Description |
|-------|-------------|
| `residential_profiles` | Household info, routine, built area |
| `residential_occupancy` | Time-period occupancy (morning/day/evening/night) |
| `residential_appliances` | Appliance details & flexibility |
| `ev_charging` | Electric vehicle charging profile |
| `backup_power_sources` | Inverter/UPS details |
| `solar_installations` | Rooftop solar details |
| `residential_common_loads_info` | Apartment common area management |
| `residential_common_loads` | Lifts, pumps, other shared loads |
| `residential_load_flexibility` | Load adjustment willingness |

### Commercial Tables (Section D)
| Table | Description |
|-------|-------------|
| `commercial_profiles` | Business type, operating hours, shifts |
| `commercial_shifts` | Shift timings |
| `commercial_controls` | BMS, solar, DG, UPS, EV charging |

### Industrial Tables (Section E)
| Table | Description |
|-------|-------------|
| `industrial_profiles` | Industry sector, production nature, schedules |
| `industrial_shifts` | Production shift timings |
| `production_processes` | Process details, interruptibility, restart behavior |
| `process_dependencies` | Inter-process dependency mapping |
| `industrial_controls` | PLC, SCADA, timers, central control |

### Demand Response Tables
| Table | Description |
|-------|-------------|
| `demand_response_profiles` | Willingness, notice, incentive preferences |
| `dr_load_selections` | Specific loads selected for DR participation |
| `commercial_demand_response` | Commercial-specific DR fields |
| `industrial_demand_response` | Industrial-specific DR fields |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/sign-in/email` | Login (rate-limited) |
| `POST` | `/api/auth/sign-up/email` | ⛔ Blocked (invite-only) |
| `POST` | `/api/auth/accept-invite` | Accept invitation & create account (rate-limited) |
| `*` | `/api/auth/*` | Better Auth handlers (sessions, etc.) |

### Agent — Survey Operations
> All routes require authentication + `agent` or `admin` role

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/surveys` | List agent's surveys |
| `POST` | `/api/surveys` | Create new draft survey |
| `GET` | `/api/surveys/:id` | Get full survey (360° view) |
| `PUT` | `/api/surveys/:id/common` | Save common details |
| `PUT` | `/api/surveys/:id/inventory` | Save inventory items |
| `PUT` | `/api/surveys/:id/residential` | Save residential data |
| `PUT` | `/api/surveys/:id/commercial` | Save commercial data |
| `PUT` | `/api/surveys/:id/industrial` | Save industrial data |
| `PUT` | `/api/surveys/:id/demand-response` | Save demand response data |
| `GET` | `/api/surveys/:id/validate` | Run soft validation |
| `POST` | `/api/surveys/:id/submit` | Submit survey (DRAFT → SUBMITTED) |

### Admin — Management
> All routes require authentication + `admin` role

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/surveys` | Paginated survey list (filters: status, category, agent, date, search) |
| `GET` | `/api/admin/surveys/:id` | Full survey + agent email + audit logs |
| `PATCH` | `/api/admin/surveys/:id/common` | Edit common details (with field-level audit) |
| `PATCH` | `/api/admin/surveys/:id/inventory` | Edit inventory (with element-level audit) |
| `PATCH` | `/api/admin/surveys/:id/residential` | Edit residential data (with audit) |
| `PATCH` | `/api/admin/surveys/:id/commercial` | Edit commercial data (with audit) |
| `PATCH` | `/api/admin/surveys/:id/industrial` | Edit industrial data (with audit) |
| `PATCH` | `/api/admin/surveys/:id/demand-response` | Edit DR data (with audit) |
| `POST` | `/api/admin/surveys/:id/approve` | Approve survey (SUBMITTED → APPROVED) |
| `GET` | `/api/admin/invitations` | List all invitations |
| `POST` | `/api/admin/invitations` | Create invitation (returns token) |
| `GET` | `/api/admin/surveys/:id/export` | Export approved survey as Excel (.xlsx) |

---

## 🔐 Authentication & Authorization

### Invite-Only Registration
1. **Admin** creates an invitation with email & role → receives a secure token
2. Token is shared with the invitee (link / copy)
3. Invitee visits `/signup?token=<TOKEN>` and creates their account
4. Token is SHA-256 hashed and verified; invitation is marked `ACCEPTED`
5. Public signup is **explicitly blocked** (returns 403)

### Role-Based Access Control
| Role | Access |
|------|--------|
| `agent` | Create surveys, fill forms, submit |
| `admin` | View all surveys, edit with audit trail, approve, export, manage invitations |

### Middleware Pipeline
```
requireAuth → requireRole → checkSurveyOwnership → checkSurveyStatus → checkVersionBody
```

---

## ⚡ Key Architectural Patterns

### 1. Optimistic Concurrency Control (OCC)
Every save operation requires a `version` field. The server atomically increments the version using:
```sql
UPDATE surveys SET version = version + 1
WHERE id = :id AND version = :clientVersion
```
If no rows match, a **409 Conflict** is returned — preventing stale overwrites.

### 2. Granular Audit Logging
Admin edits trigger **field-level audit logging**:
- Each changed field gets its own audit row with `oldValue` / `newValue`
- Normalization prevents false audits (`null` ≈ `""` ≈ `undefined`)
- Array sections use entity-level diffing (per inventory item, per appliance, etc.)

### 3. Soft Validation Engine
The validator uses a **2-layer approach**:
- **Layer 1 (Conditional)**: Evaluates business rules to mark fields as N/A (e.g., skip EV fields if `hasEV === false`)
- **Layer 2 (Generic)**: Traverses the data tree and flags any `null` / `undefined` / `""` fields as warnings
- Surveys can always be submitted — warnings are persisted but don't block submission

### 4. Concurrent Data Fetching
The `fetchFullSurvey()` service runs **23 parallel queries** via `Promise.all()` to load the complete 360° survey view in a single call.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** database (or [Neon](https://neon.tech) serverless)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Survey
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
ALLOWED_ORIGIN=http://localhost:5173
```

Run database migrations:
```bash
npx drizzle-kit push
```

Start the server:
```bash
npm run dev       # Development (with file watching)
# or
npm start         # Production
```

The backend runs on `http://localhost:3000`.

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` with API proxy to the backend.

### 4. Create Admin User
Use the seed script or create the first admin manually via the database, then use admin invitations for subsequent users.

---

## 📦 Available Scripts

### Backend
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `node --watch server.js` | Start with auto-reload |
| `start` | `node server.js` | Production start |

### Frontend
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Dev server with HMR |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |
| `lint` | `oxlint` | Run linter |

---

## 🌐 Deployment

Both frontend and backend are configured for **Vercel** deployment:

- **Backend**: Uses `@vercel/node` runtime with all requests routed to `server.js`
- **Frontend**: SPA with:
  - `/api/*` requests proxied to backend (`https://survey-backend-lime.vercel.app`)
  - All other routes fallback to `index.html` (client-side routing)

---

## 🔄 Survey Lifecycle

```mermaid
graph LR
    A[Agent Creates Survey] --> B[DRAFT]
    B -->|Fill Forms| B
    B -->|Agent Submits| C[SUBMITTED]
    C -->|Admin Reviews & Edits| C
    C -->|Admin Approves| D[APPROVED]
    D -->|Admin Exports| E[Excel Download .xlsx]
```

1. **DRAFT** — Agent fills multi-step forms (Common → Category-specific → Inventory → Demand Response)
2. **SUBMITTED** — Agent submits; validation warnings are captured and persisted
3. **APPROVED** — Admin reviews, edits (with full audit trail), and approves
4. **Export** — Only approved surveys can be exported as structured Excel files

---

## 🛡️ Security Features

- ✅ **Invite-only registration** — Public signup is disabled
- ✅ **Rate limiting** — 20 requests per 15 minutes on auth endpoints
- ✅ **SHA-256 token hashing** — Invitation tokens are never stored in plaintext
- ✅ **Role-based middleware** — Every route enforces required roles
- ✅ **Survey ownership checks** — Agents can only access their own surveys
- ✅ **Status-based locking** — Submitted/Approved surveys are locked from agent edits
- ✅ **Parameterized SQL** — All queries use Drizzle ORM (no raw SQL injection risk)
- ✅ **CORS** — Restricted to allowed origin
- ✅ **Graceful shutdown** — Handles SIGTERM/SIGINT for clean process exit

---

## 📄 License

ISC

---

> Built with ❤️ for DISCOM demand-side management and energy flexibility surveys.
