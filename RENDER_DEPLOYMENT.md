# KOBO Render Deployment - Environment Variables & Setup Guide

## 🔐 Secure Secrets Generated

Copy these into Render dashboard (Settings → Environment Variables):

```
JWT_SECRET=e9667284a22d03f80b919bb68aa9137b908e3ab19c51c8d70b362e82fccdedaa
AUDIT_IP_SALT=d29287c28072b75f31f892421bcea740be1e0ba03b10866bf6a8a24f757c5405
```

⚠️ Save these securely. Never commit to git or share publicly.

---

## 🗄️ MongoDB Atlas Setup (Required)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new project called "KOBO"

### Step 2: Create Cluster
1. Click **"Create Deployment"**
2. Select **M0 (Free)** tier
3. Select region: **eu-west-1** (closest to your users)
4. Create cluster (takes ~5-10 minutes)

### Step 3: Configure Network & User
1. Go to **Network Access** (left sidebar)
   - Click **"Add IP Address"**
   - Select **"Allow access from anywhere"** (or restrict to Render IPs)
2. Go to **Database Users** (left sidebar)
   - Click **"Add Database User"**
   - Username: `kobo_app` (or similar)
   - Password: Generate strong password (save it!)
   - Built-in Role: **Read and write to any database**

### Step 4: Get Connection String
1. Click **"Connect"** next to your cluster
2. Select **"Drivers"**
3. Copy the connection string that looks like:
   ```
   mongodb+srv://kobo_app:<password>@cluster0.xxxxx.mongodb.net/kobo?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

This is your **MONGO_URI** for Render.

---

## 📋 Complete Environment Variables Checklist

### In Render Dashboard (Settings → Environment Variables):

**Database:**
- [ ] `MONGO_URI` = `mongodb+srv://kobo_app:PASSWORD@cluster.xxxxx.mongodb.net/kobo?retryWrites=true&w=majority`

**Secrets (Use generated values above):**
- [ ] `JWT_SECRET` = `e9667284a22d03f80b919bb68aa9137b908e3ab19c51c8d70b362e82fccdedaa`
- [ ] `AUDIT_IP_SALT` = `d29287c28072b75f31f892421bcea740be1e0ba03b10866bf6a8a24f757c5405`

**Frontend URLs:**
- [ ] `CLIENT_URL` = `https://kobo-campus-marketplace.vercel.app`
- [ ] `ALLOWED_ORIGINS` = `https://kobo-campus-marketplace.vercel.app`

**Cloudinary (Image uploads):**
- [ ] `CLOUDINARY_CLOUD_NAME` = (from Cloudinary dashboard)
- [ ] `CLOUDINARY_API_KEY` = (from Cloudinary dashboard)
- [ ] `CLOUDINARY_API_SECRET` = (from Cloudinary dashboard)

**Moolre (Mobile money):**
- [ ] `MOOLRE_API_USER` = (from Moolre)
- [ ] `MOOLRE_PUBLIC_KEY` = (from Moolre)
- [ ] `MOOLRE_PRIVATE_KEY` = (from Moolre)
- [ ] `MOOLRE_VAS_KEY` = (from Moolre)
- [ ] `MOOLRE_ACCOUNT_NUMBER` = (from Moolre)
- [ ] `MOOLRE_SENDER_ID` = `KOBO`

**Admin:**
- [ ] `ADMIN_BOOTSTRAP_EMAIL` = (your admin email)

### Already Set in render.yaml:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `JWT_ACCESS_TTL` = `15m`
- `REFRESH_TOKEN_DAYS` = `30`
- `RATE_LIMIT_DISABLED` = `false`
- `MOOLRE_ENV` = `production`
- `MOOLRE_SANDBOX_SKIP_OTP` = `false`
- `PLATFORM_FEE_BPS` = `500`
- `OTP_PROVIDER` = `console`

---

## 🚀 Next Steps After Deployment

1. **Test health endpoint:**
   ```bash
   curl https://kobo-backend.onrender.com/api/health
   ```

2. **Update Vercel frontend** with new backend URL:
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Set `VITE_API_URL` = `https://kobo-backend.onrender.com/api`
   - Redeploy

3. **Register Moolre webhook** (after getting credentials):
   ```
   https://kobo-backend.onrender.com/api/v1/payments/webhooks/moolre
   ```

4. **Test full flow:**
   - Login
   - Create listing
   - Place order
   - Complete payment
   - Verify ledger transaction

---

## ⚠️ Production Checklist

- [ ] MongoDB Atlas credentials saved securely
- [ ] All environment variables set in Render
- [ ] render.yaml pushed to git
- [ ] Backend deployed and health check passing
- [ ] Frontend VITE_API_URL updated
- [ ] CORS ALLOWED_ORIGINS includes Vercel domain
- [ ] Moolre webhook registered
- [ ] Test transaction completed successfully
