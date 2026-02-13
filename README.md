# 🏠 Rentiful — Rental Property Management Platform

A full-stack rental property management platform that connects **tenants** looking for homes with **property managers** listing them. Built with **Next.js 16**, **Express.js**, **PostgreSQL + PostGIS**, **Prisma ORM**, and **Socket.IO** for real-time messaging.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Real-Time Messaging](#real-time-messaging)
- [Deployment](#deployment)

---

## Overview

**Rentiful** is a modern rental property marketplace that serves two types of users:

- **Tenants** — Browse and search properties on an interactive map, save favorites, apply for rentals, manage leases, make payments, and communicate with property managers in real-time.
- **Managers** — List and manage properties, review tenant applications (approve/deny with automatic lease generation), track payments, and message tenants directly.

The application features a rich landing page, an advanced search page with **Leaflet**-powered interactive maps and geolocation support, role-based dashboards, and a full real-time messaging system with typing indicators, read receipts, and online presence.

---

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure password hashing (bcrypt, 12 rounds)
- Role-based access control (Tenant / Manager) enforced on both client and server
- Route guarding with automatic redirects for unauthorized access
- Token verification via `/auth/me` endpoint
- Rate limiting on auth routes (10 requests per 15 minutes)

### 🏘️ Property Management (Managers)
- Create properties with multiple photo uploads (Multer + local storage)
- Define amenities, highlights, property type, pricing, beds/baths, square footage
- View and manage all listed properties
- Delete properties with cascade handling
- Track applications and lease status per property

### 🔍 Property Search (Tenants)
- Interactive **Leaflet** map with property markers
- **Geolocation detection** — auto-detect user location with reverse geocoding (Nominatim)
- Advanced filtering: location, price range, beds, baths, property type, square feet, amenities
- Proximity-based search using **PostGIS** geospatial queries
- Save/remove favorite properties

### 📝 Applications & Leases
- Tenants submit rental applications with personal details and messages
- Managers approve or deny applications
- **Automatic lease creation** when an application is approved
- Lease tracking with start/end dates, rent, and deposit
- Payment tracking (pending, paid, partially paid, overdue)

### 💬 Real-Time Messaging
- Full-featured chat system powered by **Socket.IO**
- Real-time message delivery with optimistic UI updates
- **Typing indicators** with automatic timeout
- **Read receipts** (Sent → Delivered → Read)
- **Online presence** tracking with green/offline status dots
- Conversation rooms tied to specific properties
- Unread message count with 30-second polling on the navbar
- Message search and date-grouped message display

### 🎨 UI/UX
- **Dark/Light theme** toggle with system preference detection (next-themes)
- Responsive design — mobile-optimized with collapsible sidebar
- Animated components with **Framer Motion**
- Toast notifications via **Sonner**
- shadcn/ui component library built on Radix UI primitives
- Error boundaries for graceful failure handling

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library (Radix UI + Tailwind) |
| **Redux Toolkit (RTK Query)** | State management & API data fetching |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Leaflet / React-Leaflet** | Interactive maps |
| **Framer Motion** | Animations |
| **React Hook Form + Zod** | Form handling & validation |
| **FilePond** | File/image upload UI |
| **Lucide React** | Icon library |
| **Font Awesome** | Additional icons |
| **date-fns** | Date formatting |
| **Sonner** | Toast notifications |
| **next-themes** | Dark/Light mode |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database ORM & migrations |
| **PostgreSQL** | Relational database |
| **PostGIS** | Geospatial queries & extensions |
| **Socket.IO** | Real-time WebSocket server |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt.js** | Password hashing |
| **Multer** | File upload handling |
| **Helmet** | HTTP security headers |
| **Morgan** | Request logging |
| **express-rate-limit** | Rate limiting |
| **Axios** | HTTP client (geocoding) |
| **@terraformer/wkt** | WKT to GeoJSON conversion |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Next.js 16)                  │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ App Router│  │RTK Query │  │ Socket.IO Client   │    │
│  │ (Pages)  │  │ (State)  │  │ (Real-time Events) │    │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘    │
│       │              │                 │                 │
└───────┼──────────────┼─────────────────┼────────────────┘
        │   REST API   │    WebSocket    │
        └──────────────┼─────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────┐
│               Server (Express + Socket.IO)              │
│  ┌──────────┐  ┌─────┴────┐  ┌──────────────────┐      │
│  │  Routes  │  │  Socket  │  │   Middleware      │      │
│  │Controllers│ │ Handlers │  │ (Auth, Rate Limit)│      │
│  └────┬─────┘  └────┬─────┘  └──────────────────┘      │
│       │              │                                   │
│       └──────┬───────┘                                   │
│         ┌────┴─────┐                                     │
│         │  Prisma  │                                     │
│         │   ORM    │                                     │
│         └────┬─────┘                                     │
└──────────────┼───────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │ PostgreSQL  │
        │  + PostGIS  │
        └─────────────┘
```

### Client Architecture

The frontend uses **Next.js App Router** with route groups for layout segmentation:

- `(nondashboard)` — Public pages: Landing, Search (with map)
- `(auth)` — Sign In, Sign Up (with AuthContext)
- `(dashboard)` — Role-guarded dashboards for Managers and Tenants

**Provider hierarchy:**
```
ThemeProvider → ErrorBoundary → StoreProvider (Redux) → AuthProvider → SocketProvider
```

### Server Architecture

Express server with a layered architecture:
- **Routes** → Define API endpoints and apply middleware
- **Controllers** → Business logic for each resource
- **Middleware** → Auth (JWT verification + role checking), rate limiting, input sanitization
- **Prisma** → Database access layer with type-safe queries

---

## Database Schema

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Manager  │────<│ Property │>────│ Location │
└──────────┘     └────┬─────┘     └──────────┘
                      │                (PostGIS coordinates)
         ┌────────────┼────────────┐
         │            │            │
    ┌────┴───┐   ┌────┴────┐  ┌───┴────────┐
    │ Lease  │   │Application│ │Conversation│
    └───┬────┘   └──────────┘  └─────┬──────┘
        │                            │
   ┌────┴───┐                   ┌────┴───┐
   │Payment │                   │Message │
   └────────┘                   └────────┘
         │
    ┌────┴───┐
    │ Tenant │  (favorites, properties, applications, leases)
    └────────┘
```

### Models

| Model | Description |
|---|---|
| **Manager** | Property managers with `cognitoId`, email, hashed password |
| **Tenant** | Renters with favorites, applications, leases |
| **Property** | Rental listings with amenities, highlights, photos, pricing |
| **Location** | Addresses with PostGIS `geography(Point, 4326)` coordinates |
| **Application** | Tenant rental applications (Pending / Approved / Denied) |
| **Lease** | Active leases with rent, deposit, start/end dates |
| **Payment** | Payment records (Pending / Paid / PartiallyPaid / Overdue) |
| **Conversation** | Chat threads between a tenant and manager (per property) |
| **Message** | Individual messages with status (Sent / Delivered / Read) |

---

## Project Structure

```
Rentiful/
├── client/                         # Next.js Frontend
│   ├── public/                     # Static assets
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          # Root layout (theme, providers, fonts)
│       │   ├── page.tsx            # Home → Landing page
│       │   ├── providers.tsx       # Redux + Auth + Socket provider composition
│       │   ├── SocketContext.tsx    # Socket.IO context & hooks
│       │   ├── (auth)/
│       │   │   ├── AuthContext.tsx  # Auth state management (login/register/logout)
│       │   │   ├── signin/         # Sign in page
│       │   │   └── signup/         # Sign up page (with password strength UI)
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx      # Dashboard layout (role-guarded, sidebar)
│       │   │   ├── managers/       # Manager dashboard pages
│       │   │   │   ├── properties/ # Property list + detail ([id])
│       │   │   │   ├── newproperty/# Create property form
│       │   │   │   ├── applications/# Review applications
│       │   │   │   ├── messages/   # Manager messaging
│       │   │   │   └── settings/   # Manager settings
│       │   │   └── tenants/        # Tenant dashboard pages
│       │   │       ├── favorites/  # Saved properties
│       │   │       ├── applications/# Application tracking
│       │   │       ├── residences/ # Current leases
│       │   │       ├── messages/   # Tenant messaging
│       │   │       └── settings/   # Tenant settings
│       │   └── (nondashboard)/
│       │       ├── landing/        # Landing page sections (Hero, Features, etc.)
│       │       └── search/         # Property search (Map, Filters, Listings)
│       ├── components/             # Shared components
│       │   ├── ui/                 # shadcn/ui primitives
│       │   ├── Navbar.tsx          # Global navigation bar
│       │   ├── AppSidebar.tsx      # Dashboard sidebar
│       │   ├── MessagesPage.tsx    # Reusable messaging interface
│       │   └── ...
│       ├── hooks/                  # Custom React hooks
│       ├── lib/                    # Utilities, constants, schemas
│       ├── state/                  # Redux store, RTK Query API
│       └── types/                  # TypeScript type definitions
│
├── server/                         # Express Backend
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.ts                # Database seeder
│   │   ├── migrations/            # Prisma migrations
│   │   └── seedData/              # JSON seed data files
│   ├── src/
│   │   ├── index.ts               # Express app entry point
│   │   ├── socket.ts              # Socket.IO event handlers
│   │   ├── controllers/           # Route handlers
│   │   │   ├── authControllers.ts
│   │   │   ├── propertyControllers.ts
│   │   │   ├── applicationControllers.ts
│   │   │   ├── leaseControllers.ts
│   │   │   ├── tenantControllers.ts
│   │   │   ├── managerControllers.ts
│   │   │   └── messageControllers.ts
│   │   ├── routes/                # Express route definitions
│   │   ├── middleware/            # Auth middleware (JWT + role-based)
│   │   └── lib/                   # Prisma client, validation, error handler
│   └── uploads/                   # Property image uploads
│       └── properties/
│
└── README.md                      # ← You are here
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **PostgreSQL** 14+ with **PostGIS** extension enabled
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/rentiful.git
cd rentiful
```

### 2. Set Up the Database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres
CREATE DATABASE rentiful;
\c rentiful
CREATE EXTENSION postgis;
\q
```

### 3. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 4. Configure Environment Variables

Create `.env` files in both `server/` and `client/` directories (see [Environment Variables](#environment-variables) below).

### 5. Run Database Migrations & Seed

```bash
cd server
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 6. Start Development Servers

```bash
# Terminal 1 — Start the backend
cd server
npm run dev       # Runs on http://localhost:3002

# Terminal 2 — Start the frontend
cd client
npm run dev       # Runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Variables

### Server (`server/.env`)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rentiful?schema=public"

# Authentication
JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRY="7d"

# Server
PORT=3002
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL="http://localhost:3000"
```

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register a new user (tenant/manager) | No |
| `POST` | `/auth/login` | Login with email & password | No |
| `GET` | `/auth/me` | Get current authenticated user | Yes |

### Properties
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/properties` | List properties with filters | No |
| `GET` | `/properties/:id` | Get property details | No |
| `POST` | `/properties` | Create a new property | Manager |
| `DELETE` | `/properties/:id` | Delete a property | Manager |
| `GET` | `/properties/:id/leases` | Get leases for a property | Yes |
| `GET` | `/properties/:id/payments` | Get payments for a property | Yes |

### Tenants
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/tenants/:cognitoId` | Get tenant profile | Tenant |
| `PUT` | `/tenants/:cognitoId` | Update tenant settings | Tenant |
| `GET` | `/tenants/:cognitoId/current-residences` | Get current residences | Tenant |
| `POST` | `/tenants/:cognitoId/favorites/:propertyId` | Add to favorites | Tenant |
| `DELETE` | `/tenants/:cognitoId/favorites/:propertyId` | Remove from favorites | Tenant |

### Managers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/managers/:cognitoId/properties` | Get managed properties | Manager |
| `PUT` | `/managers/:cognitoId` | Update manager settings | Manager |

### Applications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/applications` | List applications (with userId/userType filters) | Yes |
| `POST` | `/applications` | Submit an application | Yes |
| `PUT` | `/applications/:id/status` | Update application status (approve/deny) | Yes |

### Leases & Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/leases` | List leases | Yes |
| `GET` | `/leases/:id/payments` | Get payments for a lease | Yes |

### Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/messages/conversations` | Get all conversations | Yes |
| `POST` | `/messages/conversations` | Get or create a conversation | Yes |
| `GET` | `/messages/conversations/:id/messages` | Get messages (paginated) | Yes |
| `POST` | `/messages/send` | Send a message | Yes |
| `GET` | `/messages/unread-count` | Get unread message count | Yes |

### Health
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Health check (includes DB status) | No |
| `GET` | `/` | API info | No |

---

## Real-Time Messaging

The messaging system uses **Socket.IO** for bidirectional real-time communication.

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `conversation:join` | Client → Server | Join a conversation room |
| `conversation:leave` | Client → Server | Leave a conversation room |
| `message:send` | Client → Server | Send a new message |
| `message:new` | Server → Client | New message received |
| `message:notification` | Server → Client | Message notification (for users not in the conversation room) |
| `message:read` | Client → Server | Mark messages as read |
| `messages:read` | Server → Client | Read receipt confirmation |
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |
| `user:typing` | Server → Client | Typing indicator broadcast |
| `user:online` | Server → Client | User online status change |

### Authentication

Socket connections are authenticated via JWT tokens passed in `socket.handshake.auth.token`. The server middleware verifies the token before allowing the connection.

---

## Deployment

### Railway

The server includes a `railway.toml` for deployment on [Railway](https://railway.app/):

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start"
```

### PM2 (EC2/VPS)

Use the included `ecosystem.config.js` for PM2 process management:

```bash
pm2 start ecosystem.config.js
```

### Production Build

```bash
# Server
cd server
npm run build         # Generates Prisma client + compiles TypeScript
npm run start         # Starts from dist/

# Client
cd client
npm run build         # Next.js production build
npm run start         # Starts production server
```

---

## Security Features

- **Helmet** — Sets secure HTTP headers
- **CORS** — Whitelist-based origin validation
- **Rate Limiting** — Auth routes (10/15min), General (100/min)
- **Input Sanitization** — Custom middleware strips malicious content
- **Password Hashing** — bcrypt with cost factor 12
- **JWT Expiry** — Configurable token expiration (default 7 days)
- **Graceful Shutdown** — Properly closes DB connections on SIGTERM/SIGINT

---

## License

This project is licensed under the ISC License.
