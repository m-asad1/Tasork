# 23 — Payment Workflow

> All money movement funnels through Stripe — Tasork never touches raw card data (`14_Security.md` §13). This document specifies the full payment surface: gateway integration, invoicing, coupons, refunds, and milestones.

## 1. Payment Gateway (Stripe)
- **Integration model:** Stripe Checkout Session (hosted, PCI-compliant out of the box) for MVP — avoids building custom card forms. Stripe Elements considered for Phase 2 if a more embedded UX is wanted.
- **Flow:** `POST /projects/:id/payments/checkout` (or `/solution-requests/:id/...` pre-project for the initial advance) creates a Stripe Checkout Session server-side → client redirects to Stripe-hosted page → Stripe redirects back to a Tasork `return_url` with the session result.
- **Source of truth:** payment status is **never** trusted from the redirect alone — always re-confirmed via the Stripe webhook (`POST /webhooks/stripe`, signature-verified) before `Payment.status` flips to `succeeded` (per `19_State_Management.md` §8 "Webhook-driven truth").
- **Supported methods:** card, digital wallets (Apple Pay/Google Pay via Stripe's built-in support) at MVP; local payment rails evaluated per market later (`02_Business_Model.md` §5).

## 2. Milestone-Based Payments
- Each `Proposal.paymentPlan` defines either `full_upfront` or `percentage_split` with N milestones (e.g., 50% advance / 50% on delivery, or 3+ splits for larger projects).
- On proposal acceptance, the corresponding `Milestone` rows are created with a `Payment` expectation attached to each (amount + `dueOn` trigger, e.g., "on project start" or "on delivery of Milestone 2").
- The client only sees the **next actionable payment** prominently (Proposal View / Project Detail); future milestone amounts are visible but not payable until their trigger condition is met — prevents confusion about what's due *right now*.

## 3. Checkout Flow (Detailed)
```
Client clicks "Pay Advance" (or "Pay Milestone 2")
   ↓
Checkout modal: shows amount, milestone description
   ↓
Optional: apply coupon code / apply referral credit (see §4)
   ↓
Selects payment method
   ↓
Redirect to Stripe Checkout
   ↓
[Success] → Stripe webhook confirms → Payment.status = succeeded
   → Milestone marked paid → Project.status transitions (unassigned → in_progress on first payment)
   → Invoice auto-generated → Confirmation + receipt emailed
   ↓
[Failure/Cancel] → returned to Tasork with an inline error/retry option, no partial state left dangling
```
- **Local checkout state:** held in a `useReducer` scoped to the checkout component only (selected method, coupon input, processing/error flags) — discarded once the flow completes or is abandoned (`19_State_Management.md` §8), never leaked into global state.

## 4. Coupons & Referral Credits
- **Coupon validation:** `POST /coupons/validate` checked at checkout time (not baked into the proposal) — validates expiry, usage limits, and category restrictions server-side before applying a discount.
- **Types:** percentage-off, flat-amount-off; scoped optionally to specific categories or first-time clients only (Welcome Coupon per `02_Business_Model.md` §15).
- **Referral credit:** pulled from `ReferralCredit` balance, applied as a deduction at checkout, capped so a client can't reduce a payment below a configurable minimum (prevents $0 "free project" edge cases via credit stacking).
- **Stacking rule:** one coupon + referral credit may be combined unless a coupon is explicitly marked non-stackable by Admin.
- **Redemption tracking:** `CouponRedemption` row created on successful use, enforcing per-user usage limits via a unique constraint where applicable (`12_Database_Planning.md`).

## 5. Invoices
- **Auto-generated** on every successful payment — one `Invoice` per payment event, line-itemized to match the proposal's `lineItems` proportionally to the milestone paid.
- **Fields:** invoice number (sequential, human-readable — e.g., `TSK-2026-000482`), client billing info, line items, subtotal, discount applied, tax (if applicable), total, payment method (last 4 digits only), payment date, status.
- **Access:** `GET /invoices`, `GET /invoices/:id`, `GET /invoices/:id/pdf` — client sees only their own; Admin sees all.
- **PDF rendering:** reuses the `InvoiceTable` component (`18_UI_Components.md`) in the same print-optimized layout pattern as Proposal PDFs.
- **Immutability:** invoices are append-only once issued (`12_Database_Planning.md` §Soft Delete) — corrections happen via a credit note / adjustment record, never an in-place edit, preserving financial audit integrity.

## 6. Tax Handling
- **MVP:** manual tax line, Admin-set percentage per proposal if applicable (no automated jurisdiction detection yet).
- **Future (F):** region-based automatic tax calculation (`02_Business_Model.md` §4, `12_Database_Planning.md` notes) — likely via Stripe Tax once multi-region billing is prioritized.

## 7. Refunds
- **Trigger:** Admin-initiated only (`POST /payments/:id/refund`) — clients cannot self-service a refund, consistent with the Refund Policy (`02_Business_Model.md` §7) requiring PM assessment.
- **Types:** full refund (pre-work-start cancellations, Tasork non-delivery) or partial (work-in-progress cancellations, assessed manually).
- **Processing:** issued via Stripe's refund API against the original payment intent; `Refund` row created linked 1—0/1 to the `Payment`, with a required `reason` and `justification` field for audit (`02_Business_Model.md` §7 "logged with justification").
- **Status propagation:** `Payment.status` moves to `refunded` or `partially_refunded`; a corresponding negative-line credit note is reflected on the original invoice view rather than mutating the original invoice total.
- **Notification:** client notified in-app + email on any refund with the amount and a brief reason summary.

## 8. Payment History & Receipts
- **Client view** (`My Projects → Payments & Invoices`): table of all payments across all projects — date, project, amount, status, linked invoice.
- **Receipt:** lightweight, single-payment-confirmation PDF distinct from the full Invoice (useful for quick expense-reporting use cases) — auto-attached to the payment-confirmation email.
- **Filtering/sorting:** by project, date range, status — standard list-page pattern shared with other Admin/Client tables (`18_UI_Components.md` → Table).

## 9. Failure Handling
- **Failed payment:** `Payment.status = failed`, client shown a specific (Stripe-provided, sanitized) decline reason where available (e.g., "card declined," "insufficient funds") with an immediate retry option — no dead-end error screens.
- **Auto-retry (F):** scheduled retry for recoverable failures (e.g., temporary bank decline) — deferred post-MVP; MVP relies on manual client retry.
- **Webhook idempotency:** every Stripe webhook event is processed idempotently (checked against a stored `stripeEventId`) so retried webhook deliveries never double-credit a payment.

## 10. Security Notes (cross-ref `14_Security.md`)
- Webhook endpoint (`/webhooks/stripe`) is signature-verified against Stripe's webhook secret, excluded from standard auth/rate-limiting (verified by signature instead, per `13_API_Planning.md` Rate Limiting Notes).
- No card data ever stored or logged by Tasork's own servers — Stripe token/reference IDs only.
- All payment and refund actions write an `AuditLog` entry (actor, amount, target, timestamp).
