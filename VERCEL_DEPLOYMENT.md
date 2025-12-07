# 🚀 Vercel Deployment Guide - Lumina Fresh Market

## 📋 Environment Variables for Vercel

### Backend (Server) - Required Variables

Set these in your Vercel project settings for the **backend** deployment:

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | **CRITICAL** - Secret key for JWT tokens (min 32 chars) | `a1b2c3d4e5f6...` (64 chars recommended) |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:port/db` |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.netlify.app` |

#### Alternative Database Variables (if not using DATABASE_URL):

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `aws-0-us-east-1.pooler.supabase.com` |
| `DB_USER` | Database username | `postgres.your-ref` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_NAME` | Database name | `postgres` |
| `DB_PORT` | Database port | `6543` |
| `DB_SSL` | Enable SSL | `true` |

---

### Frontend - Required Variables

Set these in your Vercel/Netlify project for the **frontend** deployment:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.vercel.app/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | `https://your-backend.vercel.app` |

#### Optional Frontend Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `VITE_FACEBOOK_APP_ID` | Facebook App ID | `123456789` |

---

## 🔧 Deployment Steps

### Option 1: Vercel Backend + Netlify Frontend

#### Backend (Vercel):

1. Create new project from `server/` folder
2. Set environment variables (see above)
3. Deploy

```bash
cd server
vercel --prod
```

#### Frontend (Netlify):

1. Create new project from root folder
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables
5. Deploy

---

### Option 2: Separate Vercel Projects

#### Backend:

1. Push `server/` to separate repo OR use monorepo settings
2. Root directory: `server`
3. Framework preset: Other
4. Build command: (leave empty)
5. Output directory: (leave empty)

#### Frontend:

1. Root directory: `.` (root)
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

---

## ⚠️ Important Notes

### 1. Socket.io on Vercel

Vercel's serverless functions have a **10-second timeout** on the free tier. 
Socket.io long-polling works but real-time features may be limited.

**Recommendation**: Use a dedicated server (Railway, Render) for Socket.io, 
or upgrade to Vercel Pro for longer timeouts.

### 2. Database Connection

- **Supabase Pooler** is recommended for serverless (port 6543)
- Direct connection (port 5432) may hit connection limits
- Always enable SSL for production

### 3. JWT Secret Generation

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. CORS Configuration

Update `FRONTEND_URL` in backend to match your frontend domain:

```env
FRONTEND_URL=https://your-app.netlify.app,https://www.your-domain.com
```

---

## 📁 Project Structure for Deployment

```
newnewoo/
├── server/              # Backend (deploy to Vercel/Railway)
│   ├── api/
│   │   └── index.js     # Serverless entry point
│   ├── vercel.json
│   └── package.json
│
├── src/                 # Frontend source
├── dist/                # Frontend build output
├── vite.config.ts
├── netlify.toml         # Netlify config
└── package.json
```

---

## 🔍 Troubleshooting

### "Cannot connect to database"

- Check `DATABASE_URL` or individual `DB_*` variables
- Ensure Supabase allows connections from Vercel IPs
- Try using the pooler connection (port 6543)

### "JWT verification failed"

- Ensure `JWT_SECRET` is identical on frontend and backend
- Check token isn't expired
- Clear localStorage and login again

### "CORS error"

- Update `FRONTEND_URL` in backend environment
- Check vercel.json CORS headers
- Ensure frontend URL matches exactly (including https)

### "Socket.io not connecting"

- Check `VITE_SOCKET_URL` matches backend URL (without /api)
- Socket.io may not work well on free Vercel tier
- Consider using Render or Railway for real-time features

---

## ✅ Pre-Deployment Checklist

- [ ] Generate strong `JWT_SECRET` (64+ characters)
- [ ] Set up Supabase/PostgreSQL database
- [ ] Run migrations on database
- [ ] Set all environment variables
- [ ] Test locally with production env vars
- [ ] Deploy backend first
- [ ] Update frontend `VITE_API_URL` with backend URL
- [ ] Deploy frontend
- [ ] Test login/register functionality
- [ ] Test order creation
- [ ] Monitor logs for errors
