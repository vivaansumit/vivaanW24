# Vivaan — Production Deployment Guide

## Prerequisites

- [Supabase account](https://supabase.com) (free tier works)
- [Vercel account](https://vercel.com) (free tier works)
- Node.js 18+ and npm

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization, name it "vivaan" (or any name), set a database password
4. Wait for provisioning (~2 minutes)

### 1.2 Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (looks like: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`)
5. This is your `DATABASE_URL`

### 1.3 Get Supabase API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client!**

### 1.4 Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Name it `media` (must match `SUPABASE_STORAGE_BUCKET` env var)
4. Toggle **Public bucket** ON
5. Set **File size limit** to `52428800` (50MB)
6. Add allowed MIME types:
   ```
   image/png
   image/jpeg
   image/jpg
   image/gif
   image/webp
   video/mp4
   video/webm
   video/quicktime
   ```
7. Click **Create bucket**

### 1.5 Push Database Schema

In your terminal (with `DATABASE_URL` set):

```bash
npx drizzle-kit push
```

This creates all tables in your Supabase database.

### 1.6 Seed Initial Data

Start the dev server:

```bash
npm run dev
```

Then visit `http://localhost:3000/api/seed` in your browser, or:

```bash
curl http://localhost:3000/api/seed
```

This creates:
- Admin user: `admin@vivaan.com` / `Vivaan@Secure2026`
- Sample posts, reels, portfolio items
- Social links, highlights
- Theme configuration

## Step 2: Local Testing

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`

3. Run migrations:
   ```bash
   npx drizzle-kit push
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

5. Test:
   - Upload a photo via admin dashboard → should appear in Supabase Storage
   - Visit `http://localhost:3000` → should show homepage
   - Visit `http://localhost:3000/admin/login` → login with admin credentials
   - Visit `http://localhost:3000/profile/vivaan` → public profile (no login required)

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Vivaan portfolio CMS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vivaan.git
git push -u origin main
```

### 3.2 Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Click **Deploy**

### 3.3 Configure Environment Variables

In Vercel project dashboard → **Settings** → **Environment Variables**, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your Supabase connection string | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | **Production only** (secret!) |
| `SUPABASE_STORAGE_BUCKET` | `media` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL (e.g., `https://vivaan.vercel.app`) | Production, Preview, Development |

⚠️ **Important**: Mark `SUPABASE_SERVICE_ROLE_KEY` as "Secret" in Vercel.

### 3.4 Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the latest deployment → **Redeploy**
3. Wait for build to complete (~2-3 minutes)

### 3.5 Seed Production Database

After deployment, seed the production database:

```bash
curl -X POST https://your-project.vercel.app/api/seed
```

Or visit `https://your-project.vercel.app/api/seed` in your browser.

## Step 4: Verify Deployment

- ✅ Visit your Vercel URL → homepage loads
- ✅ Visit `/admin/login` → login works
- ✅ Upload a photo in admin → appears in Supabase Storage bucket
- ✅ Visit `/profile/vivaan` → public profile loads (no login required)
- ✅ Create a post → appears on public profile
- ✅ Edit homepage → changes appear immediately

## Step 5: Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `vivaan.com`)
3. Follow DNS instructions
4. Wait for SSL certificate (~1-2 minutes)

## Troubleshooting

### Database connection fails

- Check `DATABASE_URL` format matches Supabase URI format
- Ensure database password is correct
- Check Supabase project is not paused (free tier pauses after inactivity)

### Uploads fail

- Verify Supabase Storage bucket exists and is named `media`
- Check bucket is set to **Public**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check bucket file size limit (should be 50MB)

### Images don't load

- Check `next.config.ts` includes Supabase domains in `remotePatterns`
- Verify image URLs are public (check in Supabase Storage)

### Build fails on Vercel

- Check all environment variables are set
- Verify `NODE_ENV` is set to `production`
- Check Node.js version is 18+

## Security Notes

- Never commit `.env` to Git
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — keep it secret
- Use Vercel's "Secret" feature for sensitive env vars
- Consider enabling Supabase Row Level Security for additional protection
- Regularly rotate API keys in Supabase dashboard

## Cost Estimation

**Supabase Free Tier:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth/month
- 50,000 monthly active users

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless functions (100 GB-hours/month)

For a personal portfolio, both free tiers are more than sufficient.

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team

---

**Default Admin Credentials:**
- Email: `admin@vivaan.com`
- Password: `Vivaan@Secure2026`

Change these after first login via `/admin/profile`.
