# KOBO

KOBO is a mobile-first marketplace for University of Cape Coast students: discover items and services, negotiate in context, pay safely, confirm fulfilment, and withdraw seller earnings.

## Current deployment architecture

- `frontend/` — React/Vite application deployed on Vercel
- `supabase/` — production Postgres schema, RLS policies, Auth profile trigger, and Storage bucket
- Google Cloud Run — selected production runtime for the backend API
- `cloudflare/` — optional gateway configuration retained for a future DNS/WAF layer
- `backend/` — Express implementation and transaction test suite being migrated from Mongoose to Supabase for Cloud Run
- Moolre — mobile-money collections, payment reconciliation, payouts, SMS, and OTP delivery

## Included transaction safeguards

- Durable external references for every collection and payout
- Provider status reconciliation before ledger mutation
- Idempotent payment and transfer event processing
- Integer-pesewa, balanced ledger entries and seller wallets
- Phone verification with hashed, expiring, one-use OTPs
- Inventory reservation, fulfilment confirmation, reviews, disputes, and admin-reviewed withdrawals
- RLS enabled on every exposed Supabase table; financial/audit tables are service-only

## Local development

```bash
npm run install:all
copy backend\.env.example backend\.env
npm run dev
```

Run quality gates with `npm test` and `npm run check`. See [SETUP.md](./SETUP.md) for Supabase, Cloudflare, Moolre, and release configuration.
