# 18 — UI Components (Reusable Library)

> Implemented in `frontend/components/ui/` (shadcn/ui-based primitives) and `frontend/components/` (composed/domain components). Each entry: purpose, key variants/props, where it's used.

## Navigation
- **Navbar** — logo, nav links, auth state (login/CTA vs avatar menu), mobile hamburger. Variants: transparent-over-hero (marketing), solid (app).
- **Sidebar** — collapsible, icon+label nav items, active-state sliding indicator pill (per `11_Animations.md`). Variants: Client, Admin, Support.
- **Breadcrumb** — path trail with truncation on mobile.
- **Tabs** — underline or pill style; used in Project Detail, Settings.
- **Footer** — multi-column link groups (marketing) / minimal (app).
- **Mobile Drawer** — slide-in nav for small screens.

## Buttons & Actions
- **Button** — variants: primary, secondary, ghost, danger; sizes: sm/default/lg; states: default/hover/press/loading/disabled (full spec in `16_Design_System.md`).
- **IconButton** — square, icon-only, used in table row actions, toolbars.
- **DropdownMenu** — trigger + menu list, used for user avatar menu, row actions, bulk actions.
- **SplitButton** — primary action + adjacent dropdown for secondary options (e.g., "Accept Proposal ▾").

## Forms
- **Input** — text/email/password/number variants, label, helper text, error state.
- **Textarea** — auto-growing, character counter (for description fields).
- **Select / Combobox** — searchable dropdown, used for Category selection, Assign team member.
- **Checkbox / CheckboxGroup**
- **RadioGroup**
- **Switch/Toggle** — used for settings (dark mode, notification preferences).
- **DatePicker** — used for deadline selection, report date ranges.
- **FileUpload/Dropzone** — multi-file, progress-per-file, preview thumbnails for images.
- **FormField wrapper** — standardizes label + control + helper/error text spacing across all inputs.

## Feedback & Status
- **Toast** — slide-in + auto-dismiss, variants: success/error/info/warning.
- **Alert/Banner** — inline persistent message (e.g., "email not verified" banner).
- **Modal/Dialog** — confirm actions (cancel project, delete coupon), scale+fade entrance.
- **Drawer (side panel)** — used for quick-view (e.g., notification details, filters on mobile).
- **Tooltip** — hover/focus-triggered, used for icon-only buttons and truncated text.
- **EmptyState** — illustration + message + CTA, used across all list views with zero data.
- **Skeleton Loader** — shimmer placeholders for dashboard lists/cards while loading.
- **Spinner** — indeterminate loading for short async actions.
- **ProgressBar** — linear, used for milestone progress, file upload, top-of-page navigation loads.

## Data Display
- **Card** — base container (soft shadow, thin border, `--radius-lg`); sub-variants: StatCard (dashboard KPI), FeatureCard (marketing), ProjectCard (client dashboard list).
- **Table** — sortable headers, row selection (checkbox), pagination footer, density variants (comfortable/compact for Admin).
- **Badge** — status pills (Pending, Approved, In Progress, Completed, Declined, Cancelled) — color mapped to semantic tokens.
- **Avatar** — with fallback initials, size variants, used in navbar, team assignment, messages.
- **Timeline** — vertical, used for Project activity log and How-It-Works marketing section.
- **Chart** — wraps Recharts; sub-types: LineChart (revenue trend), BarChart (funnel/category volume), DonutChart (status distribution). Consistent axis/tooltip/legend styling across all instances.
- **Accordion** — used for FAQ and collapsible settings sections.
- **KanbanBoard/KanbanCard** — Admin Projects Pipeline.
- **Countdown** — proposal expiry timer.

## Overlays & Communication
- **CommandPalette** — (Phase 2/F) quick-actions search, inspired by Linear pattern noted in `10_UI_Research.md`.
- **ChatThread/MessageBubble** — sender-aligned bubbles, timestamp, read-receipt icon, attachment preview.
- **MessageComposer** — text input + attach button + send button, typing-indicator hook-in.
- **NotificationBell** — badge count with pop-in animation, opens NotificationList dropdown.
- **NotificationList** — grouped-by-date list, mark-as-read interaction.

## Domain-Specific Composites
- **RequestWizardStep** — shared shell for the multi-step Submit-a-Project form (step indicator, back/next controls).
- **ProposalSummaryBlock** — price/timeline/deliverables/revision-policy display, reused in Proposal View, Admin Proposal Builder preview, and PDF export.
- **MilestoneList/MilestoneItem** — progress-linked checklist with animated status change.
- **InvoiceTable** — line items + totals, reused in-app and in print/PDF view.
- **ReviewCard** — rating stars + comment, used in Testimonials (public) and Reviews Moderation (admin).
- **TicketThread** — support conversation view, reused across Client, Support, and Admin panels with role-conditional internal-notes visibility.
- **GettingStartedChecklist** — Clerk-style onboarding checklist on first dashboard login.

## Cross-Cutting Rules
- Every component consumes design tokens from `16_Design_System.md` — no component-local color/spacing values.
- Every interactive component has a documented keyboard-navigable and `aria-*` accessible state before it's considered "done."
- Components are built in Storybook first (isolated states: default/hover/loading/error/empty) before being wired into real pages — catches inconsistency early.
