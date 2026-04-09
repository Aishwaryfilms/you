# You eSports Website

A single-page React + Vite website for You eSports with:

- Hero, About, Roster, Creators, Merch, and Reach Out sections
- Built-in admin overlay backed by server-side password verification
- Background contact form delivery to `youesportsmail@gmail.com`

## Tech Stack

- React 18
- Vite 5
- Express API for admin auth
- Plain CSS embedded in `src/App.jsx`

## Requirements

- Node.js 18+
- npm 9+

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create server env file:

```bash
copy .env.server.example .env.server
```

3. Set backend admin credentials in `.env.server`:

```env
ADMIN_PASS_HASH=scrypt:your_salt_hex:your_hash_base64
ADMIN_JWT_SECRET=long_random_secret_here
```

Generate `ADMIN_PASS_HASH` from a password:

```bash
node -e "const c=require('crypto');const p='YOUR_PASSWORD';const s=c.randomBytes(16).toString('hex');const h=c.scryptSync(p,s,32).toString('base64');console.log('scrypt:'+s+':'+h);"
```

4. Start backend API (terminal 1):

```bash
npm run server
```

5. Start frontend dev server (terminal 2):

```bash
npm run dev
```

6. Open:

http://localhost:5173

## Available Scripts

```bash
npm run dev      # Start dev server
npm run server   # Start admin auth backend
npm run build    # Build production bundle
npm run preview  # Preview production build locally
```

## Admin Auth Backend

Admin login is now verified on the server, so the password is no longer exposed in browser inspect tools.

Server config (`.env.server`):

- `ADMIN_PASS_HASH`
- `ADMIN_JWT_SECRET`
- `ADMIN_API_PORT` (default `8787`)
- `ADMIN_ALLOWED_ORIGINS` (comma separated)

Frontend can override API URL with:

- `VITE_ADMIN_API_URL` (defaults to `http://localhost:8787`)

For static hosting (for example GitHub Pages) without a backend, the app can use a hashed fallback check in the browser.

Optional frontend hash config (build-time):

- `VITE_ADMIN_PASS_HASH` (SHA-256 hex)
- `VITE_ADMIN_HASH_SALT`

By default during local dev, admin API calls use `/api/*` and are proxied by Vite to `http://localhost:8787`.

## Contact Form

The Reach Out form sends without opening the user's mail app.

Current destination inbox is configured in `src/App.jsx`:


- `CONTACT_EMAIL = "youesportsmail@gmail.com"`

Fields sent by the form:

- `subject`
- `name`
- `email`
- `phone`
- `department`
- `message`

## Project Structure

```text
youesports/
|- .env.server.example
|- index.html
|- package.json
|- server/
|  |- server.js
|- vite.config.js
|- src/
|  |- main.jsx
|  |- App.jsx
|- README.md
```

## Customization Guide

Main editable areas inside `src/App.jsx`:

- `SOCIAL_LINKS` for social buttons
- `depts` for Reach Out departments
- `rosterData` for team rosters
- `creatorsInitial` for creator cards

Server-side admin credentials are configured in `.env.server`, not in frontend code.

## Build and Deploy

### Frontend Deployment (GitHub Pages)

The frontend is automatically built and deployed to GitHub Pages via `.github/workflows/deploy.yml`.

**Setup:**
1. Go to `Settings > Pages`
2. Set `Source` to `GitHub Actions`
3. Push to `main` — workflow runs automatically

Frontend deploys to: https://Aishwaryfilms.github.io/you

### Backend Deployment (Admin API)

The admin panel requires a Node.js backend server for authentication. Without it, admin login won't work on GitHub Pages (static-only).

**To deploy the backend:**
- See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions.
- TL;DR: Deploy to Render, Railway, or Heroku, then set GitHub secret `ADMIN_API_URL`.

### For Static-Only Hosting (without backend)

If you only deploy the frontend without a backend server:
- Admin login will **not work** on GitHub Pages.
- Contact form will function normally.
- To enable admin features, you **must** deploy backend (see DEPLOYMENT.md).

## Troubleshooting

- **Admin login says "Cannot reach admin server"**: 
  - If on GitHub Pages: backend not deployed yet. See [DEPLOYMENT.md](DEPLOYMENT.md).
  - If local Dev: Start backend with `npm run server` in another terminal.
  - Check GitHub secret `ADMIN_API_URL` is set to your deployed backend.

- **"Incorrect password. Try again."**: 
  - Verify `.env.server` has correct `ADMIN_PASS_HASH`.
  - Default password: `websitepass123!`

- **Form submits but no email arrives**: 
  - Check spam/junk folder.
  - Verify destination email in `src/App.jsx` (`CONTACT_EMAIL`).

- **"Incorrect password" even with correct password**: 
  - Stop/restart `npm run server`.
  - Ensure `.env.server` is not gitignored (check `.gitignore`).

- **Supabase admin routes return 500 error**:
  - Check `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` set correctly on backend.
  - Ensure service role key is used (not anon key).

- **GitHub Actions deploy workflow fails**:
  - Check workflow logs in GitHub repo > Actions tab.
  - Verify `ADMIN_API_URL` GitHub secret is set for production builds.

## Notes

- Admin password validation happens on backend when API is available, with a hashed frontend fallback for static-only deployments.
- Admin-edited roster/creator data is still in-memory on the client unless you add persistence endpoints.
