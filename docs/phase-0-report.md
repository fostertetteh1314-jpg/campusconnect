# KOBO Phase 0 delivery report

> Historical baseline: the limitations recorded in this Phase 0 report were subsequently addressed by the transactional MVP documented in `mvp-delivery-report.md`.

Date: 2026-08-13

## Completed work

- Recorded durable product truth in `PRODUCT.md` and the baseline findings in `docs/phase-0-audit.md`.
- Rebranded user-facing CampusConnect references to KOBO while preserving package/deployment identifiers.
- Removed fabricated homepage statistics and adopted the supplied tagline and Ghana cedi formatting.
- Renamed new `Assignment Help` services to `Academic Support`, retained legacy read compatibility, added a dry-run-first data migration, and published the academic-integrity policy.
- Replaced permissive HTTP and Socket.IO CORS behavior with an environment-driven allowlist that is mandatory in production.
- Added authenticated Socket.IO handshakes and made the server, not the client, authoritative for message sender identity.
- Added security headers, bounded body/upload sizes, upload MIME checks, endpoint rate limits, unsafe-key rejection, Zod request validation, safe update whitelists, request IDs, consistent API errors, and structured logs with sensitive fields redacted.
- Reduced the access-token default from 30 days to two hours and pinned JWT verification to HS256. Refresh-token rotation and cookie storage remain a later authentication phase.
- Stopped public listing/service detail responses from populating seller phone numbers.
- Normalized Ghana phone numbers, enforced duplicate checks, and added a guarded production index migration that refuses to apply while duplicates exist.
- Upgraded vulnerable dependencies, repaired the frontend lockfile, added reproducible root installs, and added CI.
- Added real integration tests using an isolated MongoDB instance, including ownership, admin separation, validation, CORS, request IDs, NoSQL-style payload rejection, anonymous-socket rejection, and sender-impersonation prevention.

## Environment and migration changes

- Backend now requires `MONGO_URI` and a `JWT_SECRET` of at least 32 characters at startup.
- Production requires `CLIENT_URL` or `ALLOWED_ORIGINS`.
- Optional `JWT_ACCESS_TTL` defaults to `2h`.
- Frontend deployment URLs now come from `VITE_API_URL` and `VITE_SOCKET_URL`; hard-coded Render URLs were removed.
- Run `npm run migrate:academic-support` and `npm run migrate:phone-index` as dry runs before their explicit `-- --apply` forms. No migration was run against user data.

## Verification

- `npm test`: 8/8 backend integration tests passed.
- `npm run check`: backend syntax passed and Vite 8 production build passed.
- `npm audit` at root, backend, and frontend: zero known vulnerabilities after lockfile upgrades.
- `git diff --check`: passed.
- Impeccable detector pass: seven warnings were found in touched UI files and corrected (incumbent purple/indigo category gradients and conditional gray-on-colour class composition).

## Remaining limitations

- Phase 0 does not implement phone OTP, refresh-token rotation/revocation, password reset, administrator 2FA, or the controlled admin-bootstrap workflow.
- Existing prices remain floating-point listing fields for compatibility. The transaction layer must introduce integer pesewa snapshots and migrate financial calculations before checkout.
- Existing messaging still uses pairwise Message records rather than Conversation/context models; Phase 0 secures the current transport but does not redesign it.
- No production database, Cloudinary account, payment provider, or deployment was accessed. Data migrations therefore remain deliberately unapplied.
- No live browser screenshot was captured because the workspace has no safe local database/media environment. The production frontend bundle and mechanical UI checks passed.

## Next phase

Phase 1: establish the committed KOBO design system and mobile shell, then incrementally migrate the home discovery modes, navigation, browsing/detail surfaces, creation flows, accessibility states, and responsive behavior without replacing the working application architecture.
