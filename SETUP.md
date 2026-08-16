# KOBO deployment setup

## Supabase

The production project is `kobo-campus-marketplace` (`wifeeqkxyxpjcfypgugk`) in `eu-west-2`. Apply migrations in order, then run the Supabase security and performance advisors. The migrations create Postgres tables, RLS policies, the Auth profile trigger, and a constrained public image bucket.

Configure the Auth site URL as `https://kobo-campus-marketplace.vercel.app` and keep `http://localhost:5173` as a local redirect. Never expose the secret/service-role key in browser code.

## Moolre

Required server-side secrets are `MOOLRE_API_USER`, `MOOLRE_PUBLIC_KEY`, `MOOLRE_PRIVATE_KEY`, `MOOLRE_VAS_KEY`, `MOOLRE_ACCOUNT_NUMBER`, and the approved `MOOLRE_SENDER_ID`. Start with `MOOLRE_ENV=sandbox`.

Register this callback:

```text
https://<cloudflare-worker-domain>/api/v1/payments/webhooks/moolre
```

The gateway restricts callbacks to Moolre's documented source addresses. The backend also reconciles every callback with Moolre's status API before any ledger mutation. Keep `MOOLRE_SANDBOX_SKIP_OTP=false` except in isolated sandbox automation.

## Google Cloud Run

The backend deployment target is Cloud Run. Authenticate the Google Cloud CLI, select the owner-approved billing project, store Supabase and Moolre credentials in Secret Manager, and deploy the backend in `europe-west2`. Do not place secret values in source-controlled environment files.

## Optional Cloudflare Worker

Replace `PROJECT_REF` in `cloudflare/wrangler.jsonc`, authenticate Wrangler, and deploy:

```bash
npm --prefix cloudflare install
npx --prefix cloudflare wrangler login
npx --prefix cloudflare wrangler secret put GATEWAY_SHARED_SECRET
npm --prefix cloudflare run deploy
```

Store the same secret in the upstream Supabase function and reject requests without `X-KOBO-Gateway`. Do not commit `.dev.vars` or credentials.

## Frontend and release

Set `VITE_API_URL=https://<cloudflare-worker-domain>/api` in Vercel, rebuild, and deploy. Before live Moolre keys, run `npm test`, `npm run check`, Supabase advisors, one duplicate-callback collection test, one completed order, and one approved withdrawal. Confirm each financial action creates exactly one balanced ledger transaction.
