# Vercel Backend Deployment Guide

## Backend on Vercel Serverless Functions

The backend is deployed as Vercel Serverless Functions.

### Structure
- `api/index.js`: Entry point that wraps the Express app
- `server/`: Express server code
- `vercel.json`: Vercel configuration

### Environment Variables (Set in Vercel Dashboard)
```
NODE_ENV=production
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.jsrqjmovbuhuhbmxyqsh
DB_PASSWORD=13572468bodeAa
DB_NAME=postgres
JWT_SECRET=4d8209bb6b394f8161f3500d4d3342acaedb63a75ccc3b462b29306380fc4cb34b3be2878d9cc719647607630f179bee06dc8e746d6dd12ad501b81fee9e063c
FRONTEND_URL=https://your-frontend-url.vercel.app
ALLOW_DEV_SEED=false
```

### Deployment Steps
1. Push code to GitHub
2. Create new Vercel project from GitHub repo
3. Framework: Other
4. Root Directory: `.`
5. Add environment variables in Vercel dashboard
6. Deploy

### Endpoints
All API routes are accessible at: `https://your-backend.vercel.app/api/*`

Example:
- Health: `https://your-backend.vercel.app/health`
- Products: `https://your-backend.vercel.app/api/products`
- Auth: `https://your-backend.vercel.app/api/auth/login`

### Note
Socket.io may have limitations on Vercel serverless. For real-time chat, consider using Supabase Realtime or Pusher as alternative.
