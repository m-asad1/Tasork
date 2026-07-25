# 12 — Database Planning (Conceptual — No SQL Yet)

## Entities Overview
1. **User** — all human accounts (client, admin, super_admin, support, team_member)
2. **Role / Permission** — RBAC definitions
3. **SolutionRequest** — the initial submission
4. **RequestAttachment** — files uploaded with a request
5. **Category** — service taxonomy (e.g., Web Development, Design)
6. **Proposal** — the quote sent for a request
7. **ProposalRevision** — version history of a proposal if amended
8. **Milestone** — payment/delivery checkpoints within a project
9. **Project** — created once a proposal is accepted and paid
10. **ProjectAssignment** — links internal team members to a project
11. **Deliverable** — files delivered to the client per milestone
12. **RevisionRequest** — client-requested changes to a deliverable
13. **Message** — communication thread entries
14. **MessageAttachment**
15. **Payment**
16. **Invoice**
17. **Refund**
18. **Coupon**
19. **CouponRedemption**
20. **Referral**
21. **ReferralCredit**
22. **Review**
23. **SupportTicket**
24. **SupportTicketMessage**
25. **Notification**
26. **NotificationPreference**
27. **AuditLog**
28. **BlogPost / CMSPage / FAQItem / Testimonial** (CMS entities)
29. **Session** (refresh token tracking)

## Core Relationships
- `User` 1—N `SolutionRequest` (a client submits many requests)
- `SolutionRequest` N—1 `Category`
- `SolutionRequest` 1—N `RequestAttachment`
- `SolutionRequest` 1—1 `Proposal` (current active proposal) / 1—N `ProposalRevision` (history)
- `Proposal` (accepted) 1—1 `Project`
- `Project` 1—N `Milestone`
- `Milestone` 1—N `Deliverable`
- `Milestone` 1—N `Payment`
- `Deliverable` 1—N `RevisionRequest`
- `Project` N—N `User` (team members) via `ProjectAssignment`
- `Project` 1—N `Message` (project thread)
- `Message` 1—N `MessageAttachment`
- `Project`/`SolutionRequest` 1—N `Invoice`
- `Payment` N—1 `Invoice`
- `Payment` 1—0/1 `Refund`
- `Coupon` 1—N `CouponRedemption` N—1 `User`
- `User` 1—1 `Referral` (own code) ; `Referral` 1—N `ReferralCredit`
- `Project` 1—1 `Review` (per completed project)
- `User` 1—N `SupportTicket`
- `SupportTicket` 1—N `SupportTicketMessage`
- `User` 1—N `Notification`
- `User` 1—1 `NotificationPreference` (per-event matrix, could be normalized to N rows per event type)
- `User` (actor) 1—N `AuditLog`
- `User` (role) N—1 `Role`, `Role` N—N `Permission`

## Primary Keys
All tables use **UUID v4** primary keys (`id`) — avoids sequential ID leakage, safe for public exposure (e.g., in URLs), and works cleanly with distributed/future sharding.

## Foreign Keys (Representative, Not Exhaustive)
| Table | FK Column | References |
|---|---|---|
| solution_requests | user_id | users.id |
| solution_requests | category_id | categories.id |
| proposals | request_id | solution_requests.id |
| projects | proposal_id | proposals.id |
| milestones | project_id | projects.id |
| deliverables | milestone_id | milestones.id |
| project_assignments | project_id, user_id | projects.id, users.id |
| messages | project_id, sender_id | projects.id, users.id |
| payments | invoice_id, milestone_id | invoices.id, milestones.id |
| invoices | project_id | projects.id |
| refunds | payment_id | payments.id |
| coupon_redemptions | coupon_id, user_id | coupons.id, users.id |
| referral_credits | referral_id, source_project_id | referrals.id, projects.id |
| reviews | project_id, user_id | projects.id, users.id |
| support_tickets | user_id, assigned_to | users.id, users.id |
| notifications | user_id | users.id |
| audit_logs | actor_id | users.id |

## Indexes (Planned)
- `users(email)` — unique index, primary login lookup
- `solution_requests(user_id, status)` — dashboard filtering
- `solution_requests(status, created_at)` — Admin review queue ordering
- `projects(status)` — pipeline views
- `messages(project_id, created_at)` — thread pagination
- `payments(status)` — reconciliation/reporting
- `notifications(user_id, read_at)` — unread count queries
- `audit_logs(actor_id, created_at)` — audit trail lookups
- `coupon_redemptions(coupon_id, user_id)` — unique constraint to prevent double redemption where applicable

## Enumerations (planned as DB enums or lookup tables)
- `RequestStatus`: pending_review, approved, declined, proposal_sent, awaiting_payment, converted, cancelled
- `ProjectStatus`: unassigned, in_progress, in_review, delivered, revision_requested, completed, cancelled, disputed
- `PaymentStatus`: pending, succeeded, failed, refunded, partially_refunded
- `PaymentMethodType`: card, wallet
- `UserRole`: guest, customer, support, team_member, admin, super_admin
- `TicketStatus`: open, in_progress, resolved, closed
- `NotificationChannel`: in_app, email, sms

## Soft Delete & Auditability
- Sensitive entities (`User`, `Project`, `Payment`, `Proposal`) use soft-delete (`deleted_at`) rather than hard delete, to preserve financial/audit integrity.
- All monetary tables (`Payment`, `Refund`, `Invoice`) are append-only/immutable once finalized; corrections happen via new compensating records, never in-place edits.

## Notes for Implementation Phase
- Final schema will be authored in `database/schema.prisma` as the single source of truth.
- An ERD diagram will be generated from the Prisma schema (`prisma-erd-generator`) and stored in `database/erd/`.
- No raw SQL migrations are hand-written outside of Prisma-generated migrations unless a specific performance tuning need arises (documented separately if so).
