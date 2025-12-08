# Frontend Deployment Guide

Backend: `https://bkaa.vercel.app/api`

## Update API base URL
- Set the frontend API base URL to `https://bkaa.vercel.app/api` (check your API config file, e.g., `services/api.ts` or similar). Ensure CORS on backend includes your frontend domain.

## Option A: Deploy to Vercel (recommended, fast)
1) From repo root (frontend lives at repository root), push latest code to GitHub.
2) In Vercel: New Project → import repo.
   - Framework: Vite/React
   - Root Directory: `.` (repo root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3) Environment Variables:
   - `VITE_API_URL=https://bkaa.vercel.app/api`
4) Deploy. After deploy, test: `https://<your-frontend>.vercel.app`.

## Option B: Deploy to Netlify
1) Push code to GitHub.
2) New Site → Import repo.
   - Build command: `npm run build`
   - Publish directory: `dist`
3) Env vars: `VITE_API_URL=https://bkaa.vercel.app/api`
4) Deploy and test.

## Option C: Static upload to cPanel
1) Build locally:
   ```bash
   npm install
   npm run build
   ```
   Output will be in `dist/`.
2) Zip the `dist` folder and upload to `public_html` on cPanel (or a subfolder).
3) Point domain/subdomain to that folder. Ensure backend CORS allows the domain.

## Quick checks after deploy
- Open `/` and verify products load (no CORS errors in console).
- Network call to `/api/products` should hit `https://bkaa.vercel.app/api/products` and return 200.
- If 500 appears, check backend logs on Vercel.

## Common gotchas
- Always rebuild after changing `VITE_API_URL`.
- If you see CORS errors, add your frontend domain to `FRONTEND_URL` env in backend and redeploy backend.
- Clear browser cache or use hard refresh after deploy.
