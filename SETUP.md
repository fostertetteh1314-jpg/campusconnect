# CampusConnect — Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier is fine)
- Cloudinary account (free tier is fine)

---

## 1. Clone & Install

```bash
cd campusconnect
npm run install:all
```

---

## 2. Configure Backend

Copy `.env.example` to `.env` inside the `backend/` folder:

```bash
cp backend/.env.example backend/.env
```

Fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/campusconnect
JWT_SECRET=pick_any_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### Get MongoDB URI
1. Go to mongodb.com/atlas → create free cluster
2. Database Access → create a user with password
3. Network Access → allow `0.0.0.0/0`
4. Connect → Drivers → copy the URI, replace `<password>`

### Get Cloudinary credentials
1. Go to cloudinary.com → sign up free
2. Dashboard shows Cloud Name, API Key, API Secret

---

## 3. Run Dev Servers

From the root `campusconnect/` folder:

```bash
npm run dev
```

This runs both servers together:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

Or run separately:
```bash
npm run dev:backend   # Express + Socket.io
npm run dev:frontend  # Vite + React
```

---

## 4. Create Admin Account

1. Register a normal account at `/register`
2. In MongoDB Atlas, find your user document and change `role` from `"user"` to `"admin"`
3. Sign back in — you'll see the Admin Panel link

---

## 5. Deploy

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
# Set VITE_API_URL env var if needed
```

### Backend → Render
- Connect GitHub repo to Render
- Root directory: `backend`
- Build: `npm install`
- Start: `node server.js`
- Add all env vars from `.env`

### Database → MongoDB Atlas
Already hosted — just use the Atlas URI.

---

## Features Built

- User auth (register, login, JWT)
- Browse marketplace with search + filters
- Product detail pages with image gallery
- Post/edit/delete listings (with Cloudinary images)
- Services marketplace
- In-app real-time chat (Socket.io)
- Save/favorite items
- User dashboard & profile
- Admin panel (users, listings, reports)
- Report system
- Mobile responsive (Tailwind CSS)
