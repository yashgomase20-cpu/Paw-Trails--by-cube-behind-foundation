# 🚀 Paw Trails — Vercel & Supabase Production Deployment Guide

This guide walks you through connecting your **GitHub repository** to **Supabase** (database) and **Vercel** (hosting & serverless backend) with **no fake data**, **no local server prerequisites**, and full production security.

---

## 📋 Architecture Overview

- **Hosting & Serverless:** Vercel automatically serves the static website (`/` and `/admin.html`) and executes API routes (`/api/*`).
- **Database:** Supabase PostgreSQL stores real submissions for adoptions, rescue reports, volunteers, contact messages, donations, and animals catalog.
- **Zero Local Server:** Once deployed, everything runs in the cloud 24/7.

---

## 🛠️ Step 1: Initialize Git & Push to GitHub

> ⚠️ **Important:** Run `git init` inside this project directory (`Paw-Trails-Website-Contact-Form-Working`), so you don't accidentally track parent folder files.

In your terminal (PowerShell or Bash) in the project root:

```bash
# 1. Initialize local git repository in this project folder
git init

# 2. Set default branch to main
git branch -M main

# 3. Stage all project files (our .gitignore keeps secrets & node_modules safe)
git add .

# 4. Commit files
git commit -m "Paw Trails: Production Vercel & Supabase integration"

# 5. Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🗄️ Step 2: Set Up Supabase Database (Clean / No Fake Data)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (e.g. `paw-trails`).
3. Click **SQL Editor** in the left sidebar.
4. Click **New Query**, open the file `supabase-schema.sql` in your project, copy its entire contents, and paste into the Supabase SQL Editor.
5. Click **Run**.

### What this creates:
- ✅ `admin_users` — Real administrator user ready for dashboard login (`admin` / `admin123`).
- ✅ `stats` — Real baseline impact counters row (`animals_fed`, `animals_rescued`, etc.).
- ✅ `animals` — Catalog table for rescued indie dogs.
- ✅ `adoptions` — **Clean table** (0 rows, ready for real adoption forms).
- ✅ `reports` — **Clean table** (0 rows, ready for real distress calls).
- ✅ `volunteers` — **Clean table** (0 rows, ready for real volunteer signups).
- ✅ `contacts` — **Clean table** (0 rows, ready for real contact messages).
- ✅ `donations` — **Clean table** (0 rows, ready for real donation tracking).
- ✅ Performance indexes and Row Level Security (RLS) policies.

---

## 🔑 Step 3: Copy Supabase Keys

In your Supabase project:
1. Go to **Project Settings** (gear icon in left sidebar) -> **API**.
2. Copy two values:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **service_role secret key** (under *Project API keys* -> click *Reveal secret key*)

> ⚠️ The `service_role` key is private and gives your Vercel backend serverless function permission to read and write to all tables securely.

---

## ▲ Step 4: Deploy on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository (`<YOUR_REPO_NAME>`).
4. **Leave Root Directory as `./`** (do not change it).
5. Open the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Your Supabase service_role key |
| `JWT_SECRET` | `pawtrails-secure-production-key-2026` | Random secure string for auth |
| `NODE_ENV` | `production` | Production environment flag |

6. Click **Deploy**!

---

## 🌐 Verifying the Deployment

Once Vercel finishes deploying (usually under 60 seconds), your app will be live:

- **Main Website:** `https://<your-project>.vercel.app/`
- **Admin Management Portal:** `https://<your-project>.vercel.app/admin.html`
- **Backend API Health Check:** `https://<your-project>.vercel.app/api/health`
- **Backend API Stats:** `https://<your-project>.vercel.app/api/stats`

### Initial Admin Login Credentials:
- **Username / Email:** `admin` (or `admin@pawtrails.org`)
- **Default Password:** `admin123`
- *(You can change this password directly inside the admin portal under Settings/Account after login!)*
