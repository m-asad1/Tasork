# 29 — Analytics Planning

> Stack: PostHog (product analytics, funnels, session data) + Plausible (privacy-friendly web analytics) + Stripe/DB-derived revenue reporting, per `07_Technology.md`.

## 1. Analytics Layers
1. **Web analytics (Plausible):** anonymous, cookie-free marketing-site traffic — sessions, sources, page views, bounce.
2. **Product analytics (PostHog):** authenticated + anonymous in-app behavioral events, funnels, session replay (opt-in/consent-gated), feature flags for gradual rollouts.
3. **Business analytics (internal DB + admin dashboards):** revenue, project throughput, proposal conversion — the "source of truth" numbers, computed from the transactional database rather than a third-party tool, so finance and product numbers never disagree.

## 2. Core KPIs
### Acquisition
- Visitors, unique visitors, traffic by source/channel
- Signup rate (visitor → registered account)

### Activation
- Guest/registered → project request submitted rate
- Time from signup to first project submission

### Proposal Funnel
- Requests submitted → reviewed (and time-to-review)
- Reviewed → approved vs. declined (and decline reasons, categorized)
- Proposal sent → proposal accepted rate
- Time from proposal sent → accepted/expired

### Revenue
- MRR-equivalent for recurring/subscription revenue (future); primarily **GMV** (gross project value) and **net revenue** for the request-based model
- Average project value
- Advance payment → final payment completion rate
- Revenue by service category
- Refund rate, refund amount as % of revenue

### Retention / Repeat Business
- Repeat client rate (clients with 2+ completed projects)
- Time between a client's projects
- Referral-driven signups and revenue (ties to referral system in `02_Business_Model.md`)

### Operational
- Average project delivery time vs. quoted timeline (SLA adherence)
- Revision requests per project (quality signal)
- Support ticket volume and resolution time
- Admin/team utilization (projects per staff member)

### Satisfaction
- Post-project review/rating average
- NPS (optional, sent post-delivery)

## 3. Funnels (Defined in PostHog)
1. **Core Conversion Funnel:** Landing page view → Submit Project form started → form completed → account created/verified → request submitted.
2. **Monetization Funnel:** Request submitted → reviewed → proposal sent → proposal accepted → advance payment completed → project completed → final payment (if milestone-based) completed.
3. **Engagement Funnel:** Login → dashboard view → project detail view → message sent (measures whether clients actually engage with the workspace, not just submit and disappear).

## 4. Event Taxonomy (Naming Convention)
`object_action` in snake_case, consistent across the app (mirrors the naming convention in `09_Development_Standards.md`):
- `project_request_started`, `project_request_submitted`
- `proposal_viewed`, `proposal_accepted`, `proposal_declined`, `proposal_expired`
- `payment_initiated`, `payment_succeeded`, `payment_failed`
- `message_sent`, `file_uploaded`, `review_submitted`
- `referral_link_shared`, `referral_signup_converted`
- `coupon_applied`
Every event carries a standard property set: `user_id` (if authenticated), `role`, `timestamp`, `entity_id` (project/proposal/payment id), `source` (web/mobile).

## 5. Admin Analytics Dashboard (feeds `21_Dashboard.md` / `27_Admin_Panel.md`)
- Revenue over time (daily/weekly/monthly, filterable by service category)
- Funnel visualization (request → proposal → payment → completion)
- Cohort retention view (by signup month)
- Top service categories by volume and revenue
- Team performance (avg. review time, avg. delivery time per staff member)
- Churn/decline reasons breakdown

## 6. Privacy & Consent
- Cookie/consent banner gates non-essential analytics (session replay, marketing pixels); Plausible is cookie-free and exempt from consent requirements in most jurisdictions.
- PostHog configured with IP anonymization and PII scrubbing on event properties (no raw file contents, message bodies, or payment details ever sent as event properties — only IDs and metadata).
- Session replay (if enabled) masks all form inputs and file/message content by default.
- Aligns with `14_Security.md` and confidentiality principles in `02_Business_Model.md`.

## 7. Reporting Cadence
- Real-time: admin dashboard (live KPIs).
- Weekly: internal ops review (funnel health, SLA adherence, support backlog).
- Monthly: business review (revenue, growth, retention, category performance) — exportable as PDF/CSV for stakeholders.

## 8. Tooling Access & Roles
- Super Admin: full access to PostHog, Plausible, and revenue dashboards.
- Admin: revenue and operational dashboards, no raw session replay access.
- Support: ticket/response metrics only.
- Access governed by the RBAC model defined in `14_Security.md`.
