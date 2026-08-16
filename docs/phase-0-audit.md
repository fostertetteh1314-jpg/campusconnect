# KOBO Phase 0 audit

Date: 2026-08-13  
Branch: `main`  
Baseline commit: `6c6d3ab`

## What exists

- React/Vite/Tailwind frontend with public home, marketplace, services, listing/service details, registration and login.
- Authenticated dashboard, profile, listing/service CRUD, favourites, direct messages, and admin screens.
- Express/Mongoose API with JWT authentication, Cloudinary uploads, pagination for listings/services, ownership checks for listing/service update and deletion, and Socket.IO messaging.
- MongoDB indexes for listing/service text search and unique favourites.

## Baseline verification

- No automated tests or CI configuration existed.
- Frontend dependencies were absent and its lockfile was out of sync, so the initial `vite build` could not run.
- Backend dependencies installed, but `npm audit` reported seven production vulnerabilities: five high, one moderate, and one low.
- No local environment file or test database configuration is present, so the live API cannot be exercised safely against a real database from this workspace.

## Critical findings

1. The HTTP CORS callback accepts disallowed origins, defeating the allowlist.
2. Socket.IO trusts `userId` and `senderId` supplied by the client. An unauthenticated client can impersonate another user and persist messages.
3. JWT access tokens live in local storage and remain valid for 30 days. There is no refresh-token rotation, revocation, session history, reset flow, or reauthentication.
4. Service updates pass `req.body` directly to Mongoose, enabling mass assignment of fields such as provider and moderation state.
5. Controllers lack schema validation, bounded pagination, consistent errors, request IDs, rate limiting, security headers, sanitization, and structured/redacted logs.
6. Cloudinary upload handling has no explicit byte limit or MIME allowlist and uses a vulnerable Multer major version.
7. Public detail responses expose seller/provider phone numbers. This conflicts with protected-checkout goals and encourages off-platform payment.
8. Admin mutations do not validate IDs/statuses or record audit events. Admin creation requires direct database editing.
9. Prices are general floating-point numbers, unsuitable for the future financial layer. Existing price fields must be migrated carefully before orders/payments are introduced.
10. Destructive deletion is used for listings. Future transaction records must snapshot terms and must never cascade-delete financial history.

## Incomplete product flows

The repository has no orders, checkout, payments, webhook verification, ledger, balances, withdrawals, offers, inventory reservation, delivery confirmation, reviews tied to orders, buyer requests, service packages/milestones, verification, disputes, notifications, fraud controls, or transactional audit trail.

## Proposed schema additions after Phase 0

- User verification/session/login-history fields and explicit roles/permissions.
- Listing integer `priceMinor`, inventory, lifecycle/moderation state, location/campus, fulfilment methods, and engagement counters.
- Conversation and contextual Message models plus Offer.
- Order snapshots with a server-owned transition history.
- PaymentEvent, LedgerTransaction/LedgerEntry, WalletAccount, Withdrawal, Refund, and reconciliation records.
- Delivery, Review, Dispute/Evidence, Verification, Notification, AuditLog, Campus, BuyerRequest, ServicePackage, and Milestone.

## Proposed versioned route additions

Introduce the transaction layer under `/api/v1`: users, verifications, campuses, search, conversations, offers, orders, payments, payment webhooks, deliveries, reviews, disputes, wallet, withdrawals, notifications, and transaction administration. Preserve existing `/api` routes during a documented compatibility window.

## Phase 0 change surface

- Server composition, CORS/Socket.IO, security middleware, validation/error handling, logging, uploads, and authorization.
- Existing controllers/routes/models only where needed for validation, safe field whitelisting, normalized identity fields, and compatibility.
- Frontend branding, service terminology, API/socket configuration, and obvious fabricated statistics.
- Package manifests/lockfiles, environment example, policy documentation, tests, and CI.

## Deferred decisions and limitations

- Payment, OTP, email, identity-verification, and analytics providers are not selected.
- Ghana-specific legal review is required before holding customer funds or calling the workflow escrow.
- Phase 0 will not introduce the transaction schemas above; it establishes the safe baseline on which they can be built.
