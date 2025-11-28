# 🚀 Lumina Fresh Market - Deployment Guide

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Supabase account (free tier works)
- [ ] Netlify account (for frontend)
- [ ] Render/Railway account (for backend)

---

## 🗄️ Database Setup (Supabase)

### 1. Create Database
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Save your database password!

### 2. Run Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `server/schema.sql`
3. Execute the SQL

### 3. Get Connection Details
```
Settings → Database → Connection Pooling
- Host: aws-0-region.pooler.supabase.com
- Port: 6543
- User: postgres.xxxxx
- Database: postgres
```

### 4. Important: Rotate Credentials
⚠️ If you committed `.env` files to Git:
1. Settings → Database → Reset Password
2. Update all your environment variables

---

## 🖥️ Backend Deployment (Render)

### Option A: Via Dashboard

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - New → Web Service
   - Connect your GitHub repo

2. **Configure Service**
   ```
   Name: lumina-backend
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**
   Add these in Render dashboard:
   ```env
   NODE_ENV=production
   PORT=3001
   DB_HOST=your-pooler.supabase.com
   DB_USER=postgres.xxxxx
   DB_PORT=6543
   DB_PASSWORD=your-password
   DB_NAME=postgres
   DB_SSL=true
   JWT_SECRET=your-generated-secret
   FRONTEND_URL=https://your-app.netlify.app
   ALLOW_DEV_SEED=false
   ```

4. **Generate JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Note your backend URL: `https://lumina-backend.onrender.com`

### Health Check
Visit: `https://your-backend.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-11-28T...",
  "environment": "production"
}
```

---

## 🎨 Frontend Deployment (Netlify)

### 1. Configure Environment

Create `.env.production` locally:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### 2. Deploy via Dashboard

1. **Connect Repository**
   - Go to [Netlify](https://app.netlify.com)
   - Add new site → Import from Git
   - Connect GitHub repo

2. **Build Settings**
   ```
   Base directory: (leave empty or root)
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   In Netlify Dashboard → Site settings → Environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait 2-5 minutes
   - Note your URL: `https://your-app.netlify.app`

### 3. Update Backend CORS

Go back to Render → Environment Variables:
```env
FRONTEND_URL=https://your-app.netlify.app
```
(Trigger redeploy)

---

## ✅ Post-Deployment Checklist

### Backend Tests
- [ ] Visit `/health` endpoint (should return `ok`)
- [ ] Visit `/` endpoint (should show API info)
- [ ] Test POST `/api/auth/register` (create account)
- [ ] Test POST `/api/auth/login` (login)
- [ ] Test GET `/api/products` (list products)

### Frontend Tests
- [ ] Homepage loads
- [ ] Can browse products
- [ ] Can register new account
- [ ] Can login
- [ ] Can add to cart
- [ ] Can checkout (create order)
- [ ] Chat widget appears
- [ ] Admin panel accessible at `/admin`

### Performance
- [ ] Run Lighthouse test (target: 85+)
- [ ] Test on mobile device
- [ ] Check loading speed (<3s)

---

## 🔒 Security Final Checks

### Critical
- [ ] `.env` files NOT in Git
- [ ] Database password rotated if exposed
- [ ] JWT secret is strong (64+ chars random)
- [ ] CORS configured correctly
- [ ] Rate limiting active (check logs)

### Recommended
- [ ] Add custom domain
- [ ] Enable HTTPS (automatic on Netlify/Render)
- [ ] Set up monitoring (UptimeRobot, etc.)
- [ ] Configure backup strategy

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port binding error (should auto-assign)
```

### Frontend can't connect to backend
```bash
# Verify CORS settings
# Check browser console for errors
# Ensure VITE_API_URL is correct
# Check backend is running (health endpoint)
```

### Database connection issues
```bash
# Verify credentials in Supabase dashboard
# Use connection pooler (port 6543) not direct (5432)
# Ensure DB_SSL=true
# Check IP allowlist in Supabase (should be disabled for ease)
```

### 502 Bad Gateway (Render)
```bash
# Service might be sleeping (free tier)
# Wait 30s and retry
# Check build/start logs for errors
```

---

## 📊 Monitoring Setup (Optional)

### UptimeRobot
1. Sign up at [UptimeRobot](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.onrender.com/health`
   - Interval: 5 minutes

### Sentry (Error Tracking)
```bash
npm install @sentry/react @sentry/node
# Follow Sentry setup guide
```

---

## 🔄 CI/CD (Auto-Deploy)

Both Netlify and Render auto-deploy on Git push:
1. Push to `main` branch
2. Wait 2-10 minutes
3. Changes go live automatically

To disable:
- Netlify: Site settings → Build & deploy → Stop auto publishing
- Render: Settings → Auto-Deploy → Manual deploy

---

## 💰 Cost Estimate

| Service | Free Tier | Paid (Starter) |
|---------|-----------|----------------|
| Supabase | 500MB DB, 2GB bandwidth | $25/mo (8GB DB) |
| Render | 750 hours/mo (sleeps after 15m idle) | $7/mo (always on) |
| Netlify | 100GB bandwidth | $19/mo (Pro) |
| **Total** | **$0/mo** | **~$51/mo** |

---

## 🎉 Launch Checklist

Before going live:
- [ ] Test all user flows end-to-end
- [ ] Seed initial products and branches
- [ ] Create admin account
- [ ] Test order creation and admin approval
- [ ] Verify email/SMS notifications (if implemented)
- [ ] Check mobile responsiveness
- [ ] Run security audit
- [ ] Set up analytics (Google Analytics)
- [ ] Prepare support documentation

---

## 📞 Support

For deployment issues:
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs

Good luck with your deployment! 🚀
