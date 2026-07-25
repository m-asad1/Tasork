# 22 — Proposal System

> The Proposal is the contractual and trust-critical centerpiece of Tasork's model — it's the moment a "Solution Request" becomes a commitment on both sides. This document fully specifies its data, lifecycle, and presentation.

## 1. Proposal Fields (Full Spec)
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `requestId` | FK → SolutionRequest | one active proposal per request |
| `version` | integer | starts at 1, incremented on each revision (see §5) |
| `title` | string | usually mirrors the request title, editable |
| `summary` | rich text | reviewer's framing of the solution/approach |
| `lineItems[]` | array | `{ description, quantity, unitPrice, subtotal }` — builds up the price transparently |
| `subtotal` | decimal | sum of line items |
| `rushFee` | decimal, nullable | shown as its own line if the client requested expedited delivery |
| `discount` | decimal, nullable | from an applied coupon/referral credit at acceptance time (not baked in at proposal-build time) |
| `tax` | decimal, nullable | region-based (F for full automation, manual override at MVP) |
| `total` | decimal | computed |
| `currency` | enum | USD at MVP, multi-currency-ready field (F) |
| `deliverables[]` | array of strings | explicit, itemized — what the client receives, avoids scope ambiguity |
| `timeline` | structured | estimated start date, estimated delivery date, and a `milestones[]` breakdown if multi-milestone |
| `paymentPlan` | enum + structured | `full_upfront` \| `percentage_split` (with `{ percentage, dueOn }[]`) |
| `revisionRoundsIncluded` | integer | e.g., 2 (per `02_Business_Model.md` §6) |
| `revisionWindowDays` | integer | e.g., 7 days post-delivery |
| `expiresAt` | timestamp | proposal auto-expires if not accepted in time |
| `status` | enum | see §3 |
| `preparedBy` | FK → User (staff) | internal accountability |
| `sentAt` | timestamp, nullable | |
| `respondedAt` | timestamp, nullable | |
| `clientComment` | text, nullable | populated on "Request Changes" |
| `internalNotes` | text, nullable | staff-only, never rendered to client |

## 2. ProposalRevision (Version History)
- Every time a proposal is edited after being sent (typically in response to "Request Changes"), the **prior version is snapshotted** into `ProposalRevision` before the live `Proposal` row is updated.
- Client-facing "Proposal History" (`GET /proposals/:id/revisions`) shows a simple timeline: version number, date, high-level summary of what changed (price delta, timeline delta) — not a raw diff, to keep it human-readable.
- Internally, revisions are also visible to Admin for audit purposes (why did the price change between v1 and v2).

## 3. Status Lifecycle
```
draft
  ↓ (Admin sends)
sent
  ↓                              ↓                    ↓
accepted                    changes_requested      declined
  ↓                              ↓ (Admin revises, new version)
awaiting_payment                sent (v2)
  ↓ (payment success)
converted (→ Project created)

[any sent/awaiting_payment state] → expired (if expiresAt passes with no action)
```
- **`draft`** — Admin is still building it in the Proposal Builder; not visible to the client.
- **`sent`** — client notified, countdown timer starts (see §4).
- **`accepted`** — client action; request status flips to `awaiting_payment` on the parent `SolutionRequest`.
- **`changes_requested`** — client comment captured, Admin re-enters Proposal Builder pre-filled with prior version.
- **`declined`** — terminal for this proposal; request marked `Declined by Client`, archived (client may submit a fresh, unrelated request).
- **`expired`** — system-driven (BullMQ scheduled job checks `expiresAt`); client notified expiry occurred, can request a fresh proposal via Support if still interested.
- **`converted`** — terminal success state; triggers `Project` creation (per `12_Database_Planning.md` relationships).

## 4. Expiry / Countdown
- Default expiry window configurable per proposal (e.g., 5–7 days), reflected in the `Countdown` component (`18_UI_Components.md`) on the Proposal View page.
- **Warning notification** sent at a configurable threshold before expiry (e.g., 24h remaining) to nudge a decision.
- Expired proposals are **not silently deleted** — retained for records/audit, just flagged `expired` and no longer actionable by the client.

## 5. Revision / Change Request Flow
```
Client clicks "Request Changes" on Proposal View
   ↓
Modal: comment field (required) — what needs to change
   ↓
POST /proposals/:id/request-changes
   ↓
Proposal.status = changes_requested; SolutionRequest.status reverts to in_review
   ↓
Admin notified → opens Proposal Builder pre-filled from current version + sees client comment inline
   ↓
Admin edits → POST /proposals/:id (creates version N+1, snapshots N into ProposalRevision)
   ↓
Admin sends → status = sent (v2) → countdown restarts
```
- No hard cap on revision rounds at the proposal-negotiation stage (pre-acceptance) — the fixed revision count in §1 (`revisionRoundsIncluded`) applies to **post-delivery deliverable revisions**, a distinct concept (see `13_API_Planning.md` §8 Deliverables).

## 6. Acceptance Flow
```
Client clicks "Accept Proposal"
   ↓
Confirmation modal (restates total + payment plan, requires explicit confirm — no accidental accepts)
   ↓
POST /proposals/:id/accept
   ↓
Proposal.status = accepted; SolutionRequest.status = awaiting_payment
   ↓
Redirect to Payment flow (23_Payment_System.md)
```

## 7. PDF Export
- **Trigger:** `GET /proposals/:id/pdf`, available to both client (their own) and Admin.
- **Content:** `ProposalSummaryBlock` component rendered in a print-optimized layout (`17_Wireframes.md` → Print/PDF Views) — no nav/sidebar chrome, Tasork letterhead, generated timestamp, unique proposal ID/version footer for traceability.
- **Consistency rule:** the PDF renderer reuses the exact same `ProposalSummaryBlock` React component used on-screen (via server-side rendering to PDF), so the in-app view and downloaded PDF can never visually drift apart.

## 8. Proposal Builder (Admin-Facing)
- **Layout** (per `17_Wireframes.md` → Request Review Detail → Proposal Builder): left pane shows the original request (description, files, category) for constant reference; right pane is the builder form.
- **Line-item builder:** add/remove/reorder rows, live-updating subtotal/total as line items change (no separate "calculate" step).
- **Templates:** common project types can start from a saved line-item/timeline template (Admin-managed, reduces repetitive typing for frequent categories) — Phase 2 enhancement, not MVP-blocking.
- **Preview before send:** builder has a "Preview as Client" toggle rendering the exact `ProposalSummaryBlock` the client will see, before the send action is confirmed.

## 9. Notifications Tied to Proposals
| Event | Recipient | Channel |
|---|---|---|
| Proposal sent | Client | In-app + email |
| Proposal expiring soon | Client | In-app + email |
| Proposal expired | Client | In-app + email |
| Changes requested | Admin (assigned reviewer) | In-app + email |
| Proposal accepted | Admin | In-app |
| Proposal declined | Admin | In-app |

## 10. Guardrails & Edge Cases
- A `SolutionRequest` can have only **one non-terminal proposal at a time** — prevents confusing parallel proposal threads.
- Editing a `sent` proposal directly (without going through `changes_requested`) is disallowed — all edits after send flow through the versioning path in §5, preserving an honest history.
- Currency and payment-plan fields are locked once a proposal reaches `accepted` — later edits (e.g., a change order per `04_User_Flow.md` Flow 9) are modeled as a **new, separate proposal** linked to the same project rather than a mutation of the original.
