# 24 — Messaging System

> One threaded conversation per project, shared between the client and the assigned internal team, with a parallel internal-only channel for staff. Real-time via WebSocket, persisted via REST/Postgres as the source of truth.

## 1. Architecture Overview
- **Transport:** WebSocket (Socket.IO on NestJS gateway) for live delivery; REST endpoints (`13_API_Planning.md` §9) remain the durable read/write path — WebSocket events **patch the existing TanStack Query cache**, they never act as an independent state source (`19_State_Management.md` §5, §10).
- **Rooms:** one Socket.IO room per `projectId`; clients join on opening a Project Detail → Messages tab, leave on navigating away.
- **Fallback:** if WebSocket connection drops, the thread still functions via polling/refetch-on-focus (TanStack Query default) — degrades gracefully, never a hard failure.

## 2. Message Data Model (cross-ref `12_Database_Planning.md`)
| Field | Notes |
|---|---|
| `id` | UUID |
| `projectId` | FK |
| `senderId` | FK → User |
| `senderRole` | denormalized snapshot at send-time (customer/team_member/admin/support) — used for bubble alignment/styling without an extra join |
| `body` | sanitized rich text (mentions/links allowed, no raw HTML — per `14_Security.md` §5) |
| `attachments[]` | via `MessageAttachment` |
| `visibility` | `client_visible` \| `internal_only` (see §5) |
| `readBy[]` | array of `{userId, readAt}` for read-receipt support |
| `createdAt` | |

## 3. Real-Time Chat Flow
```
User opens Project Detail → Messages tab
   ↓
GET /projects/:id/messages (paginated, newest-first, infinite query)
   ↓
Client joins WebSocket room `project:{id}`
   ↓
User types → POST /projects/:id/messages
   ↓
Server persists → broadcasts `message:new` to room
   ↓
All connected clients in room: setQueryData appends message directly to cache (no refetch)
   ↓
Recipient(s) not currently viewing the thread → notification pipeline triggered (25_Notifications.md)
```

## 4. Attachments
- Uploaded via the shared file pipeline (`26_File_Management.md`): validated, ClamAV-scanned, stored in R2, referenced via `MessageAttachment`.
- **Inline preview:** images render as thumbnails directly in the message bubble; documents show a filename/size chip with a download icon.
- **Size/type limits:** same global limits as project file uploads (`26_File_Management.md` §4), enforced both client- and server-side.
- Attachment upload progress is shown inline in the `MessageComposer` (per `18_UI_Components.md`), not blocking the rest of the composer.

## 5. Internal Staff-Only Channel
- Same `Message` table, distinguished by `visibility: internal_only` — lets Admin/Team discuss a project without a parallel schema, while guaranteeing client-visible queries (`GET /projects/:id/messages` as `customer` role) always filter to `client_visible` only at the query layer (never a client-side filter, to avoid any accidental leak).
- Rendered as a visually distinct tab/panel (different background tint) in the Admin/Team project view so staff never confuse which channel they're posting in.

## 6. Typing Indicator (F, post-MVP nice-to-have)
- Ephemeral WebSocket event (`typing:start` / `typing:stop`), **not persisted** — pure UI signal, held as component-local state only (`19_State_Management.md` §5).
- Debounced client-side (send `typing:start` once, auto `typing:stop` after ~3s of inactivity) to avoid event spam.

## 7. Read Receipts (F, post-MVP)
- On thread open, client fires a "mark thread read up to message X" call; `readBy[]` updated per message.
- Rendered as a small checkmark/avatar under the last message the recipient has seen — kept subtle, not a prominent feature, to avoid social pressure/anxiety patterns common in consumer chat apps.

## 8. Message Search
- `GET /messages/search?q=&projectId=` — searches within a single project's thread (not cross-project, to respect confidentiality boundaries) via PostgreSQL full-text search on `body` (`07_Technology.md`).
- Surfaced as a search icon in the thread header; results highlight the matching message and scroll it into view rather than opening a separate results page.

## 9. Notification Integration
- Every new message where the recipient is **not currently connected to that project's WebSocket room** triggers a notification (in-app + email per user preference, `25_Notifications.md`).
- If the recipient *is* actively viewing the thread, no redundant notification fires — avoids notification fatigue for an active conversation.
- Unread message count feeding the dashboard stat card (`21_Dashboard.md`) is maintained via the same lightweight Context pattern used for the notification bell (`19_State_Management.md` §4).

## 10. Moderation & Audit (Admin)
- Messages are never hard-deleted (preserves dispute/audit trail per `02_Business_Model.md` §13) — Admin can hide a message (soft flag) if it violates platform policy, logged to `AuditLog`.
- Support/Admin have read access to any project's client-visible thread when handling an escalated ticket or dispute (RBAC-scoped, per `14_Security.md` §3), but internal notes tied to *other* projects remain scoped to assigned staff only.

## 11. Performance & Pagination
- Thread loads newest-first with reverse infinite scroll (load-older-on-scroll-up), matching the `['messages', projectId]` TanStack Query key pattern (`19_State_Management.md` §5).
- Index `messages(project_id, created_at)` (per `12_Database_Planning.md`) supports efficient pagination at scale.

## 12. Accessibility & UX Notes
- Message bubbles are sender-aligned (client left/right convention consistent across the app) with clear role labels for anyone other than "me" (e.g., "Support Team," "Project Manager") rather than exposing individual staff names by default, preserving the "role-level point of contact" principle from `03_Master_Features.md` #63.
- Composer supports keyboard `Enter` to send / `Shift+Enter` for newline, standard chat-app convention.
