# 💕 Twogether

A full-stack dating app with swipe-based discovery, mutual matching, and real-time chat.

**Live demo:** [twogether-app-seven.vercel.app](https://twogether-app-seven.vercel.app)

<!-- Add screenshots here, e.g.
![Discover](./screenshots/discover.png)
![Chat](./screenshots/chat.png)
-->

## Features

- **Auth:** signup and login with JWT (7-day expiry) and bcrypt-hashed passwords
- **Profiles:** name, bio, age, gender, gender preference, and photo upload (stored on Cloudinary)
- **Discover:** swipe cards with like / pass. Results respect both users' gender preferences and hide people you've already swiped on
- **Matching:** a match is created when two users like each other, and the other user gets a live notification if they're online
- **Likes tab:** see who liked you and like back to match instantly
- **Real-time chat:** instant messages, online status (green dot), and "Sent" / "Seen" receipts, all over Socket.io
- **Blocking:** block and unblock users. Blocked users can't message you
- **Protected routes:** logged-out users are redirected to login

## How it works

### Architecture

The backend runs one server that handles two kinds of traffic: normal REST requests and live WebSocket connections. Both are authenticated with the same JWT.

```mermaid
flowchart LR
    subgraph Client["Frontend - React + Vite"]
        UI["Pages: Discover, Likes, Messages, Chat"]
        AX["Axios with JWT interceptor"]
        SC["Socket.io client"]
    end

    subgraph Server["Backend - Express + Socket.io"]
        MW["JWT middleware"]
        API["REST API /api/*"]
        WS["Socket.io server"]
    end

    DB[("PostgreSQL via Prisma")]
    CL["Cloudinary"]

    UI --> AX
    UI --> SC
    AX -->|"HTTP + Bearer token"| MW
    MW --> API
    SC <-->|"WebSocket + JWT"| WS
    API --> DB
    WS --> DB
    API -->|"profile photos"| CL
```

### Swipe, match, chat flow

```mermaid
sequenceDiagram
    actor A as User A
    actor B as User B
    participant S as Server
    participant DB as PostgreSQL

    A->>S: POST /api/match/like (User B)
    S->>DB: Save like A to B
    S->>DB: Has B already liked A?

    alt B already liked A
        S->>DB: Create match
        S-->>B: Socket "newMatch" (if online)
        S-->>A: matched: true
    else No mutual like yet
        S-->>A: matched: false
    end

    Note over A,B: Once matched, they can chat

    A->>S: Socket "sendMessages"
    S->>DB: Check for blocks, save message
    S-->>B: Socket "newMessage"
    S-->>A: Socket "newMessage" (confirmation)
    B->>S: Socket "markAsSeen"
    S->>DB: Mark messages as seen
    S-->>A: Socket "messagesSeen"
```

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Axios, Socket.io Client, lucide-react |
| Backend | Node.js, Express 5, TypeScript, Socket.io |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT, bcryptjs |
| Uploads | Multer (memory storage) → Cloudinary |
| Deployment | Vercel (frontend) |

## Project structure

```
dating-app/
├── backend/
│   ├── prisma/            # schema, migrations, seed script + seed images
│   └── src/
│       ├── controllers/   # auth, profile, match, chat, block
│       ├── routes/
│       ├── middleware/    # JWT auth, multer upload
│       ├── lib/           # prisma + cloudinary clients
│       └── server.ts      # Express + Socket.io server
└── frontend/
    └── src/
        ├── pages/         # Intro, Login, Signup, Discover, Likes, Messages, Chat, Profile, Settings
        ├── components/    # AppLayout, BottomNav, ProtectedRoute
        ├── context/       # AuthContext, SocketContext
        └── lib/axios.ts   # Axios instance with JWT interceptor
```

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or hosted)
- A free [Cloudinary](https://cloudinary.com) account

### 1. Clone the repo

```bash
git clone https://github.com/shubhamwankhede658/dating-app.git
cd dating-app
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/dating_app
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5173
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run migrations and (optionally) seed 10 test users:

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

The API runs at `http://localhost:5000`.

> Seeded users (e.g. `arjun@test.com`, `priya@test.com`) all use the password `password123`.

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## API overview

All routes except register and login need an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/auth/me` | Get the current user |
| PUT | `/api/profile/me` | Update profile (multipart, with optional `photo`) |
| GET | `/api/match/profiles` | Profiles to swipe on |
| POST | `/api/match/like` | Like a user (creates a match if mutual) |
| POST | `/api/match/pass` | Pass on a user |
| GET | `/api/match/liked-me` | Users who liked you |
| GET | `/api/chat/matches` | Your matches |
| GET | `/api/chat/:matchId/messages` | Message history for a match |
| GET / POST / DELETE | `/api/block` | List, block, and unblock users |

### Socket.io events

| Event | Direction | Purpose |
| --- | --- | --- |
| `onlineUsers` | server → client | List of currently online user IDs |
| `sendMessages` | client → server | Send a chat message |
| `newMessage` | server → client | Deliver a message to sender and receiver |
| `markAsSeen` / `messagesSeen` | both | Seen receipts |
| `newMatch` | server → client | Live match notification |

The socket connection is authenticated with the same JWT on connect.

## Database schema

Five models: `User`, `Like` (also stores passes via a `status` field), `Match`, `Message`, and `Block`. See [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).

## Roadmap

- [ ] Automated tests and a CI pipeline (GitHub Actions)
- [ ] Distance-based and age-range filters
- [ ] Multiple photos per profile
- [ ] Persist online status across multiple server instances (currently in-memory)

## Author

**Shubham Wankhede**
[GitHub](https://github.com/shubhamwankhede658)
