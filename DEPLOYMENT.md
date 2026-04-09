# Deployment Guide

## Overview

This project has two parts:
- **Frontend**: Static React app deployed to GitHub Pages (https://Aishwaryfilms.github.io/you)
- **Backend (Admin API)**: Node.js server with admin panel, Supabase integration, and JWT auth

Admin login on GitHub Pages requires the backend server to be deployed and configured.

---

## 1. Deploy the Server (via Render)

### Step 1: Create a Render Account
1. Go to https://render.com and sign up (free tier available).
2. Connect your GitHub account.

### Step 2: Create a Web Service
1. In Render dashboard, click **New +** → **Web Service**.
2. Select your `Aishwaryfilms/you` repository.
3. Choose:
   - **Name**: `you-admin-api` (or your preference)
   - **Environment**: Node
   - **Build Command**: `npm install` (default)
   - **Start Command**: `npm start`
   - **Plan**: Free (if you want free tier; paid plans are ~$7/month)

### Step 3: Set Environment Variables
In the Render web service **Environment** section, add:

```
PORT=8787
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE=YOUR_SERVICE_ROLE_KEY_HERE
ADMIN_PASS_HASH=scrypt:0921de9a048ecd4efebdf9da:tfaqarpFMyihHc5iFiRyWMwtHWzmaOEmCfHhevj4piHHl6if1Y3LYsLI/kKIQV2aHxOeO+kefT+blbGlarTjAA==
ADMIN_JWT_SECRET=YOUR_LONG_RANDOM_SECRET_HERE
ADMIN_ALLOWED_ORIGINS=https://Aishwaryfilms.github.io
```

**Where to get these values:**
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE`: From your Supabase project settings → API.
- `ADMIN_PASS_HASH`: Already generated (password: `websitepass123!`). Copy from your local `.env.server`.
- `ADMIN_JWT_SECRET`: Generate a long random string (e.g., `openssl rand -base64 32` or use https://generate-random.org/).
- `ADMIN_ALLOWED_ORIGINS`: Your GitHub Pages URL.

### Step 4: Deploy
Click **Create Web Service**. Render will build and deploy automatically.

- **Service URL**: e.g., `https://you-admin-api.onrender.com`
- **Note**: Free tier services sleep after 15 min of inactivity; first request wakes them (~30s delay).

---

## 2. Configure GitHub Secrets

1. Go to your GitHub repo **Settings** → **Secrets and variables** → **Actions**.
2. Add these secrets:

| Secret Name | Value |
|---|---|
| `ADMIN_API_URL` | `https://your-service-name.onrender.com` (replace with your Render service URL) |
| `RENDER_API_KEY` | (Optional) Your Render API key for automated deploys |
| `RENDER_SERVICE_ID` | (Optional) Your Render service ID for automated deploys |

---

## 3. Test the Setup

After pushing changes to `main`:

1. **GitHub Actions**: Check that both workflows run:
   - ✅ Deploy to GitHub Pages (frontend)
   - ✅ Deploy Server (if secrets are set)

2. **Admin Login on GitHub Pages**:
   - Go to https://Aishwaryfilms.github.io/you
   - Click **Admin** (or appropriate button).
   - Enter password: `websitepass123!`
   - Should authenticate via your deployed backend.

3. **Local Testing** (optional):
   ```bash
   # In one terminal
   npm run server
   
   # In another terminal, test login:
   curl -X POST -H "Content-Type: application/json" \
     -d '{"password":"websitepass123!"}' \
     http://localhost:8787/api/admin/login
   ```

---

## 4. Server Endpoints

All require `Authorization: Bearer <JWT_TOKEN>` header (except `/api/admin/login`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login with password → receive JWT |
| GET | `/api/admin/verify` | Verify JWT token |
| GET | `/api/admin/users` | List Supabase users |
| GET | `/api/admin/posts` | List posts from Supabase |
| POST | `/api/admin/posts` | Create post |
| PUT | `/api/admin/posts/:id` | Update post |
| DELETE | `/api/admin/posts/:id` | Delete post |

---

## 5. Troubleshooting

### Admin login says "Cannot reach admin server"
- ✅ Check `VITE_ADMIN_API_URL` secret is set in GitHub.
- ✅ Check your Render service is deployed and running (no errors in logs).
- ✅ Check `ADMIN_ALLOWED_ORIGINS` includes your GitHub Pages URL.

### "Incorrect password. Try again."
- ✅ Verify `ADMIN_PASS_HASH` is correct on the Render service.
- ✅ Default password is: `websitepass123!`

### Supabase routes return 500
- ✅ Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` are set.
- ✅ Verify service role key (not anon key) is used.
- ✅ Check Supabase project has a `posts` table (create it if missing).

---

## 6. Next Steps

- [ ] Deploy the server to Render.
- [ ] Add `ADMIN_API_URL` secret to GitHub.
- [ ] Test admin login on GitHub Pages.
- [ ] Monitor GitHub Actions for any workflow failures.
- [ ] (Optional) Set `RENDER_API_KEY` + `RENDER_SERVICE_ID` for automated deploys.
