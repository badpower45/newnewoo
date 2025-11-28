# Supabase Edge Functions Deployment (Backend on Supabase)

This sets up read-only API endpoints on Supabase, avoiding paid servers. Live chat/socket features are omitted.

## Prerequisites
- Supabase project (already used for your PostgreSQL database)
- Supabase CLI installed

## Configure Supabase CLI
```powershell
npm i -g supabase
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

## Functions
- `health`: GET `https://<project-ref>.functions.supabase.co/health`
- `products`: GET `https://<project-ref>.functions.supabase.co/products?category=Fruits&branchId=1`

## Deploy
From repo root:
```powershell
supabase functions deploy health
supabase functions deploy products
```

## Environment Variables
Edge functions need:
- `SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
- `SUPABASE_ANON_KEY`: from Project Settings → API

Set per function:
```powershell
supabase functions secrets set SUPABASE_URL=https://<project-ref>.supabase.co -f health
supabase functions secrets set SUPABASE_ANON_KEY=<anon-key> -f health
supabase functions secrets set SUPABASE_URL=https://<project-ref>.supabase.co -f products
supabase functions secrets set SUPABASE_ANON_KEY=<anon-key> -f products
```

## Frontend Configuration
Update `.env` for Vite:
```
VITE_API_URL=https://<project-ref>.functions.supabase.co
VITE_SOCKET_URL= # leave empty or same; chat disabled
```
Then update API calls to use `VITE_API_URL` with paths `/products`, etc.

## Notes
- This approach is read-only for now. Write operations (orders/cart) can be added with Row Level Security and RPCs later.
- Keep existing Supabase Postgres schema; these functions read directly from it.
