# Twogether — Frontend

React + TypeScript frontend for the Twogether dating app — auth screens, swipe-based discovery, real-time chat, and profile management.

**Live demo:** [twogether-app-seven.vercel.app](https://twogether-app-seven.vercel.app)
**Backend repo/API:** see `../backend`

Demo login: `arjun0@test.com` / `password123` (or sign up with a new account)

## Tech stack

- **Framework:** React (Vite), TypeScript
- **Routing:** React Router
- **HTTP:** Axios (with an interceptor that auto-attaches the JWT to every request)
- **Real-time:** Socket.io Client
- **State:** React Context (no external state library — Auth and Socket state each live in their own Provider)

## Features

- Signup/login with client-side auth state persisted in `localStorage`
- Protected routes — logged-out users are redirected to `/login`; logged-in users skip the intro screen automatically
- Profile page: name, bio, age, gender, gender preference, and photo upload with an instant client-side preview before saving
- Discover: swipeable card UI with like/pass, showing name, age, and bio
- Likes tab: grid of people who liked you, tap to like back and match instantly
- Messages: matches list with live online status, last-message preview, and a live "New message" / "Seen" indicator that updates without a refresh
- Chat: real-time message delivery, auto-scroll, seen receipts, and a block option from the chat menu
- Settings: view/unblock blocked users, log out

## Real-time behavior

The app keeps a single Socket.io connection alive for the whole session (set up in `SocketContext`, authenticated with the JWT on connect). It's used for:
- Broadcasting who's currently online (green dot across Messages, Discover matches, and Chat)
- Delivering new messages instantly to whichever page the user is on
- Live match notifications — if someone likes you back while you're active elsewhere in the app, you get notified immediately
- Live seen-receipt updates, so "Sent" flips to "Seen" without navigating away and back

## Project structure

```
src/
├── pages/            # one component per full screen
├── components/        # Header, BottomNav, ProtectedRoute, AppLayout, Logo
├── context/           # AuthContext (user/token), SocketContext (live connection + online users)
└── lib/               # axios instance with base URL + auth interceptor
```

## Running locally

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. Needs the backend running locally too (see `../backend`).

### `.env`

```
VITE_API_URL=http://localhost:5000
```

## Build & deploy

```bash
npm run build
```

Deployed on Vercel with:
- **Root directory:** `frontend`
- **Framework preset:** Vite (auto-detected)
- **Environment variable:** `VITE_API_URL` set to the live backend URL
- `vercel.json` rewrites all routes to `index.html` so client-side routes (like `/chat/:matchId`) don't 404 on refresh

## What I'd improve with more time

- Move auth token storage from `localStorage` to relying on an `httpOnly` cookie, to reduce XSS exposure
- Add infinite scroll/pagination to Discover instead of loading the full feed at once
- Extract shared inline styles into a proper CSS/theme system instead of repeating style objects across pages
