# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

KOBO primarily serves university students in Ghana, beginning with UCC, who need to buy and sell products, hire or offer services, request quotations, negotiate, and transact safely from a mobile phone. The wider Ghanaian public is a supported secondary audience.

## Product Purpose

KOBO is a mobile-first social marketplace that combines discovery, intentional search, in-app negotiation, and protected transaction workflows. Success means users can complete trustworthy local product and service transactions while always understanding where their money is and what happens next.

## Positioning

KOBO combines a social discovery feed and a conventional searchable marketplace with campus-aware identity, local fulfilment, and `Kobo Protected Payment`. The product must not claim regulated escrow until the payment partner, fund-flow structure, and Ghana-specific legal review permit that language.

## Operating Context

Users browse on budget phones and slower networks, search within a campus or nearby location, message counterparties, pay using Ghana-supported mobile money or cards, and arrange campus pickup, a safe public meetup, delivery, or digital service fulfilment. Administrators moderate content; finance administrators reconcile transactions; sensitive administrative and financial actions require explicit backend permissions and audit records.

## Capabilities and Constraints

- Preserve and evolve the existing React, Vite, Tailwind, Express, MongoDB, Mongoose, Cloudinary, and Socket.IO application rather than rebuilding it.
- Existing scope includes authentication, profiles, product and service listings, search/filtering, favourites, direct messaging, dashboards, and basic administration.
- The MVP must add phone verification, conversations and offers, product orders, one payment-provider sandbox, signed idempotent webhooks, an immutable balanced ledger, fulfilment confirmation, verified reviews, disputes, seller withdrawals, and auditable administration.
- All money is calculated by the server in integer pesewas and displayed as Ghana cedi. Provider webhooks are the payment source of truth.
- Existing data and API compatibility should be preserved where practical. Financial history must never be cascade-deleted or edited in place.
- `Academic Support` replaces `Assignment Help`; examination cheating, impersonation, and completing graded work for another person are prohibited.
- Production deployment remains undecided and is out of scope unless explicitly authorized. The documented direction is Vercel for the frontend, Render for the backend, MongoDB Atlas, and Cloudinary.
- The payment provider, legal fund-flow structure, OTP provider, identity-verification provider, and final data-retention periods remain open decisions.

## Brand Commitments

- Product name: KOBO.
- Tagline: Find am. Pay safe.
- Primary market: Ghana, launching as a controlled UCC pilot.
- Voice: plain, locally intelligible, trustworthy, and explicit about money and next actions.
- Binding visual direction from the product brief is reserved for the design-system phase: warm off-white, deep charcoal, vivid lime or mango, restrained cobalt trust and coral alert accents, editorial headings, clear Ghana cedi typography, and mobile-first interaction.

## Evidence on Hand

- The current application source is the evidence for existing functionality.
- The supplied `KOBO_CODEX_MASTER_BUILD_BRIEF.md` is the product, security, and delivery brief.
- No verified production statistics, testimonials, payment-provider agreement, legal approval, identity assets, or production credentials are present. Future UI must not fabricate them.

## Product Principles

1. Trust before growth.
2. Mobile first and usable on constrained networks.
3. Local by default for currency, campuses, locations, and payment language.
4. Support both social discovery and intentional search.
5. Keep both parties informed and protect them with evidence-based workflows.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Core flows must work at 320px, remain keyboard and screen-reader usable, show visible focus, use approximately 44px touch targets, avoid colour-only status, respect reduced motion, and provide complete loading, empty, error, disabled, success, offline, retry, and reconnect states.
