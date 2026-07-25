# 25 — Notification System

> Event-driven, multi-channel, user-controllable. One trigger can fan out to several channels depending on the recipient's saved preferences — never hardcoded to a single delivery method.

## 1. Architecture Overview
```
Domain event occurs (e.g., proposal.sent, payment.succeeded)
   ↓
Event emitted internally (NestJS EventEmitter / domain event)
   ↓
Notification service resolves: which users, which template, which channels (per NotificationPreference)
   ↓
In-app: Notification row created immediately → WebSocket push → bell badge updates
   ↓
Email/SMS: queued as a BullMQ job → processed async → sent via Resend/Twilio → delivery status tracked
```
- **Why async for email/SMS:** keeps the triggering API request fast (e.g., accepting a proposal shouldn't wait on an email provider round-trip) — in-app notification is synchronous (instant), everything else is queued (`07_Technology.md` BullMQ/Redis).

## 2. Channels
| Channel | Status | Provider |
|---|---|---|
| In-App | MVP | Native (Notification table + WebSocket push) |
| Email | MVP | Resend + React Email templates |
| SMS | Future (F) | Twilio |
| Push (browser/mobile) | Future (F) | Web Push API / FCM once mobile apps exist |
| WhatsApp | Future (F) | Twilio WhatsApp Business API — evaluated once international client base justifies it |

## 3. Notification Data Model
| Field | Notes |
|---|---|
| `id` | UUID |
| `userId` | recipient |
| `type` | enum, matches trigger event (e.g., `proposal_sent`, `payment_succeeded`) |
| `title` / `body` | rendered from template at creation time (not re-rendered later — protects against template edits altering historical notifications) |
| `linkTo` | deep link (e.g., `/proposals/:id`) — clicking a notification always lands the user in the right context, never a generic dashboard |
| `readAt` | nullable |
| `createdAt` | |
| `channelsSent[]` | which channels actually fired for this event (for delivery-status visibility) |

## 4. Event Triggers (Representative Matrix)
| Event | In-App | Email | Recipient |
|---|---|---|---|
| Request submitted (confirmation) | ✓ | ✓ | Client |
| Request approved/declined | ✓ | ✓ | Client |
| Proposal sent | ✓ | ✓ | Client |
| Proposal expiring soon | ✓ | ✓ | Client |
| Proposal accepted/declined/changes requested | ✓ | ✓ | Admin (assigned reviewer) |
| Payment succeeded/failed | ✓ | ✓ | Client |
| Milestone status updated | ✓ | ✓ | Client |
| Deliverable released | ✓ | ✓ | Client |
| Revision request submitted | ✓ | ✓ | Admin/Team |
| New message (thread inactive) | ✓ | ✓ (digest-aware, see §7) | Client / Team |
| Support ticket reply | ✓ | ✓ | Ticket opener |
| Refund issued | ✓ | ✓ | Client |
| New request in queue | ✓ | — | Admin |
| Staff account created/role changed | ✓ | ✓ | Affected staff |
| Suspicious login / session reuse flagged | ✓ | ✓ | Affected user |

## 5. User Preference Matrix
- Settings → Notifications: a per-event-category × per-channel grid (`Switch/Toggle` components), e.g., "Messages" row with In-App / Email columns independently toggleable.
- **Non-overridable events:** security-critical notifications (password changed, suspicious login, session reuse) always send regardless of preference — cannot be disabled, since suppressing them would undermine account security.
- Preferences stored as `NotificationPreference`, one row/matrix per user (`12_Database_Planning.md`), read/written via `GET/PATCH /notifications/preferences`.

## 6. Templates (Admin-Editable)
- **CMS-managed:** Admin → Notification Templates lists every event type with an editable subject/body template supporting variable interpolation (e.g., `{{clientName}}`, `{{proposalTotal}}`, `{{projectTitle}}`).
- **Brand consistency:** all email templates built on a shared React Email base layout (Tasork header/footer, consistent typography per `16_Design_System.md`) so Admin edits copy, not structure — prevents accidental brand drift.
- **Preview:** template editor includes a live preview with sample variable data before saving.

## 7. Digest Mode (Future / F)
- Daily/weekly summary option for lower-urgency events (e.g., non-critical message activity) to reduce inbox fatigue for high-volume clients — deferred post-MVP; MVP sends real-time per-event emails only.

## 8. In-App Notification Center
- `NotificationBell` (badge count, pop-in animation per `11_Animations.md`) → opens `NotificationList` dropdown, grouped by date (Today / Yesterday / Earlier).
- Full `/notifications` page mirrors the dropdown with pagination, "mark all as read" action, and filter by type.
- Unread count uses the lightweight Context pattern fed by WebSocket push, avoiding a full refetch on every new notification (`19_State_Management.md` §4).

## 9. Delivery Status Tracking
- Each queued email/SMS job records outcome: `queued → sent → delivered/opened (where provider supports it) → failed`.
- Failed sends are retried with backoff (BullMQ retry policy) up to a capped attempt count, then logged to Sentry for investigation rather than silently dropped.
- Admin-facing visibility (Phase 2): a simple delivery-status column on the Notification Templates or a dedicated log view, useful for diagnosing "client says they never got the email" support cases.

## 10. Security & Privacy Notes
- Notification bodies never include sensitive data unnecessarily (e.g., full payment card numbers, full file contents) — link-outs to the authenticated in-app view instead.
- Unsubscribe/preference-management links in every marketing-adjacent email (not transactional ones) per standard email compliance practice (CAN-SPAM/GDPR-aligned).
