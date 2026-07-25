# 19 — State Management Planning

> Split by nature of the data: **server state** (anything that lives in the database, fetched over the API) uses TanStack Query. **Client/UI state** (theme, modals, wizard step, local form drafts) uses React Context + `useState`/`useReducer`. Global client stores are intentionally minimal — most state should be either server-owned or component-local.

## 1. Authentication State
- **Owner:** React Context (`AuthProvider`) wrapping the app, backed by TanStack Query (`useQuery(['auth', 'me'])`).
- **Shape:** `{ user, role, permissions, isAuthenticated, isLoading }`.
- **Persistence:** access token held in memory only (never localStorage, to reduce XSS exfiltration risk); refresh token lives in an HTTP-only cookie managed by the backend.
- **Actions:** `login()`, `logout()`, `refreshSession()` — `refreshSession` triggered automatically by the API client on a 401 before retrying the original request.
- **Invalidations:** on `logout()`, all TanStack Query caches are cleared to prevent stale/leaked data across accounts on shared devices.

## 2. Theme (Dark/Light Mode)
- **Owner:** `ThemeProvider` (React Context) + CSS variable swap at the `<html>` root.
- **Shape:** `{ theme: 'light' | 'dark' | 'system', setTheme() }`.
- **Persistence:** stored server-side on the user's profile (`NotificationPreference`-style per-user setting) once authenticated, so preference follows the user across devices; falls back to OS `prefers-color-scheme` for guests.
- **No flash-of-wrong-theme:** resolved server-side (Next.js) via a cookie read before first paint.

## 3. Projects (Client & Admin)
- **Owner:** TanStack Query — server state, never duplicated into a client store.
- **Keys:** `['projects', filters]`, `['project', id]`, `['project', id, 'milestones']`, `['project', id, 'messages']`.
- **Mutations:** optimistic updates for low-risk actions (marking a notification read, approving a deliverable) with rollback on error; non-optimistic (wait-for-server) for payment and status-changing actions where correctness matters more than perceived speed.
- **Real-time overlay:** WebSocket events (see `24_Messaging.md`) trigger targeted `queryClient.invalidateQueries()` calls rather than maintaining a parallel real-time store — one source of truth per entity.

## 4. Notifications
- **Owner:** TanStack Query for the list/history (`['notifications']`), plus a lightweight Context for the unread badge count fed by WebSocket push so the bell updates instantly without a full refetch.
- **Shape:** `{ items[], unreadCount }`.
- **Sync:** on WebSocket `notification:new` event → prepend to cache + increment `unreadCount`; on mark-as-read → optimistic decrement + mutation.

## 5. Messages
- **Owner:** TanStack Query per-project thread (`['messages', projectId]`), paginated (infinite query, newest-first with reverse scroll).
- **Real-time:** WebSocket subscription per open thread appends incoming messages directly to the query cache (`setQueryData`) rather than refetching the whole thread.
- **Local-only state:** composer draft text, typing-indicator flag, and attachment-in-progress list are component-local (`useState`) — never persisted globally, cleared on send/unmount.

## 6. Settings (Account/Notification Preferences)
- **Owner:** TanStack Query (server state) for persisted settings; form-local state (React Hook Form) for in-progress edits before save.
- **Pattern:** form initializes from the query cache, mutation on submit invalidates the settings query — standard "form syncs from server, writes back to server" loop, no separate global settings store.

## 7. User (Profile)
- Folded into Authentication State (`AuthProvider`'s `user` object) rather than a separate store — avoids two sources of truth for "who is logged in and what can they do."
- Profile *edits* go through a TanStack Query mutation (`useMutation`) that invalidates `['auth', 'me']` on success.

## 8. Payments
- **Owner:** TanStack Query, fully server-state — no client-side caching of sensitive payment data beyond what's needed to render the current view.
- **Checkout flow state (in-progress payment):** transient, held in a dedicated `useReducer` local to the checkout component (selected method, coupon input, processing/error state) — discarded once the flow completes or is abandoned, never persisted.
- **Webhook-driven truth:** payment status shown to the user is always re-derived from the backend (via query invalidation after Stripe redirect/webhook), never optimistically assumed successful before confirmation.

## 9. UI-Only Global State (Context, minimal by design)
- **Modal/Drawer manager** — which modal (if any) is open + its props; single source to avoid modal-stacking bugs.
- **Toast queue** — active toast notifications and their auto-dismiss timers.
- **Wizard state (Submit-a-Project)** — current step, per-step form data (via React Hook Form's multi-step pattern), held in a `RequestWizardProvider` scoped only to that flow, discarded on completion/exit.
- **Sidebar collapsed/expanded** — persisted to a cookie/localStorage-free preference (server-synced if it proves worth persisting; otherwise session-only).

## 10. Guiding Rules
- **Never duplicate server data into a global client store "for convenience."** If it can be refetched or read from cache, it should be — TanStack Query's cache *is* the global store for server data.
- **Client state is scoped as narrowly as possible.** Default to component-local `useState`; promote to Context only when 3+ unrelated components genuinely need the same value.
- **No Redux/MobX/Zustand-style global store planned for MVP** — the Context + TanStack Query split covers all identified needs above without the added boilerplate/indirection. Revisit only if cross-cutting client state genuinely outgrows Context (unlikely given this data model).
- **WebSocket events are a signal to refetch/patch cache, not an alternate state source** — prevents drift between "real-time state" and "REST-fetched state."
