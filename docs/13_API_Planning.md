# 13 — API Planning

> Contract-first reference. Final source of truth will live in `api/openapi.yaml` (NestJS Swagger-generated, kept in sync). All routes are prefixed with `/api/v1`. All authenticated routes require a valid JWT access token (`Authorization: Bearer <token>`) unless marked Public.

## Conventions
- Resource names are kebab-case, plural (`/solution-requests`, not `/solutionRequest`).
- Standard verbs: `GET` (read), `POST` (create), `PUT` (full update), `PATCH` (partial update), `DELETE` (soft delete where applicable).
- Pagination: `?page=1&limit=20` on all list endpoints, response includes `{ data, meta: { total, page, limit, totalPages } }`.
- Filtering/sorting: `?status=pending_review&sort=-created_at`.
- Errors follow the shared shape: `{ statusCode, message, errorCode, timestamp }`.
- File uploads use `multipart/form-data`, routed through the upload pipeline (validation + ClamAV scan) before persisting to Cloudflare R2.

---

## 1. Auth
```
POST   /auth/register                  Public
POST   /auth/login                     Public
POST   /auth/logout                    Auth
POST   /auth/refresh-token             Public (refresh cookie)
POST   /auth/verify-email              Public
POST   /auth/resend-verification       Public
POST   /auth/forgot-password           Public
POST   /auth/reset-password            Public
POST   /auth/2fa/enable                Auth (F)
POST   /auth/2fa/verify                Auth (F)
GET    /auth/sessions                  Auth
DELETE /auth/sessions/:sessionId       Auth
```

## 2. Users
```
GET    /users/me                       Auth
PATCH  /users/me                       Auth
PATCH  /users/me/password              Auth
DELETE /users/me                       Auth (deactivate/soft-delete)
GET    /users                          Admin
GET    /users/:id                      Admin
PATCH  /users/:id/status               Admin (suspend/reactivate)
GET    /users/:id/audit-logs           Admin
```

## 3. Categories (Services Taxonomy)
```
GET    /categories                     Public
GET    /categories/:slug               Public
POST   /categories                     Admin
PATCH  /categories/:id                 Admin
DELETE /categories/:id                 Admin
```

## 4. Solution Requests
```
POST   /solution-requests                       Auth/Guest-intake
GET    /solution-requests                        Auth (own) / Admin (all)
GET    /solution-requests/:id                    Auth (own) / Admin
PATCH  /solution-requests/:id                    Auth (own, pre-review only)
DELETE /solution-requests/:id                    Auth (own, withdraw pre-review)
POST   /solution-requests/:id/attachments        Auth
DELETE /solution-requests/:id/attachments/:fileId Auth
PATCH  /solution-requests/:id/review-decision    Admin (approve/decline + reason)
PATCH  /solution-requests/:id/assign-reviewer    Admin
```

## 5. Proposals
```
POST   /solution-requests/:id/proposals          Admin (create/build)
GET    /solution-requests/:id/proposals          Auth (own) / Admin
GET    /proposals/:id                            Auth (own) / Admin
PATCH  /proposals/:id                             Admin (revise → new version)
POST   /proposals/:id/send                        Admin
POST   /proposals/:id/accept                      Auth (client)
POST   /proposals/:id/request-changes             Auth (client)
POST   /proposals/:id/decline                     Auth (client)
GET    /proposals/:id/pdf                         Auth (own) / Admin
GET    /proposals/:id/revisions                   Auth (own) / Admin
```

## 6. Projects
```
GET    /projects                        Auth (own) / Admin (all)
GET    /projects/:id                    Auth (own) / Admin
PATCH  /projects/:id/status             Admin
POST   /projects/:id/assignments        Admin
DELETE /projects/:id/assignments/:userId Admin
GET    /projects/:id/activity-log       Auth (own) / Admin
POST   /projects/:id/cancel             Auth (client) / Admin
```

## 7. Milestones
```
GET    /projects/:id/milestones          Auth (own) / Admin
POST   /projects/:id/milestones          Admin
PATCH  /milestones/:id                    Admin
PATCH  /milestones/:id/status             Admin (team updates progress)
```

## 8. Deliverables
```
POST   /milestones/:id/deliverables       Admin/Team
GET    /milestones/:id/deliverables       Auth (own) / Admin
GET    /deliverables/:id/download         Auth (own) / Admin
POST   /deliverables/:id/approve          Auth (client)
POST   /deliverables/:id/revision-requests Auth (client)
GET    /deliverables/:id/revision-requests Auth (own) / Admin
PATCH  /revision-requests/:id/status       Admin/Team
```

## 9. Messages
```
GET    /projects/:id/messages            Auth (own) / Admin
POST   /projects/:id/messages            Auth (own) / Admin
POST   /messages/:id/attachments         Auth (own) / Admin
GET    /messages/search                  Auth (own, ?q=&projectId=)
```

## 10. Payments & Invoices
```
POST   /projects/:id/payments/checkout   Auth (client — creates Stripe session)
POST   /webhooks/stripe                  Public (signature-verified)
GET    /payments                         Auth (own) / Admin
GET    /payments/:id                     Auth (own) / Admin
POST   /payments/:id/refund              Admin
GET    /invoices                         Auth (own) / Admin
GET    /invoices/:id                     Auth (own) / Admin
GET    /invoices/:id/pdf                 Auth (own) / Admin
```

## 11. Coupons & Referrals
```
POST   /coupons/validate                 Auth (checks code at checkout)
GET    /coupons                          Admin
POST   /coupons                          Admin
PATCH  /coupons/:id                      Admin
DELETE /coupons/:id                      Admin
GET    /referrals/me                     Auth
GET    /referrals/me/credits             Auth
POST   /referrals/redeem                 Auth
GET    /referrals/settings               Admin
PATCH  /referrals/settings               Admin
```

## 12. Reviews
```
POST   /projects/:id/review              Auth (client, post-completion)
PATCH  /reviews/:id                       Auth (own, within edit window)
GET    /reviews                           Public (approved only) / Admin (all)
PATCH  /reviews/:id/moderate              Admin (approve/hide)
```

## 13. Support
```
POST   /support-tickets                   Auth
GET    /support-tickets                   Auth (own) / Support / Admin
GET    /support-tickets/:id               Auth (own) / Support / Admin
POST   /support-tickets/:id/messages      Auth (own) / Support / Admin
PATCH  /support-tickets/:id/status        Support/Admin
PATCH  /support-tickets/:id/escalate      Support
POST   /support-tickets/:id/rating        Auth (client, post-resolution)
```

## 14. Notifications
```
GET    /notifications                     Auth
PATCH  /notifications/:id/read            Auth
PATCH  /notifications/read-all            Auth
GET    /notifications/preferences         Auth
PATCH  /notifications/preferences         Auth
```

## 15. CMS
```
GET    /cms/blog                          Public
GET    /cms/blog/:slug                    Public
POST   /cms/blog                          Admin
PATCH  /cms/blog/:id                      Admin
DELETE /cms/blog/:id                      Admin
GET    /cms/faq                           Public
POST   /cms/faq                           Admin
PATCH  /cms/faq/:id                       Admin
GET    /cms/testimonials                  Public
POST   /cms/testimonials                  Admin
GET    /cms/pages/:slug                   Public
PATCH  /cms/pages/:slug                   Admin
```

## 16. Admin — Analytics & Platform
```
GET    /admin/dashboard/kpis              Admin
GET    /admin/analytics/funnel            Admin
GET    /admin/analytics/revenue           Admin
GET    /admin/audit-logs                  Super Admin
GET    /admin/settings                    Super Admin
PATCH  /admin/settings                    Super Admin
GET    /admin/staff                       Super Admin
POST   /admin/staff                       Super Admin
PATCH  /admin/staff/:id/role              Super Admin
GET    /admin/export/:resource            Admin (CSV/Excel — requests, payments, users)
```

## 17. Search
```
GET    /search                            Public (?q=&scope=blog|faq)
```

## Rate Limiting Notes (applied via NestJS Throttler)
- `/auth/login`, `/auth/register`, `/auth/forgot-password` — strict limits (e.g., 5/min/IP).
- `/solution-requests` (POST) — moderate limit to prevent spam submissions.
- `/webhooks/stripe` — excluded from user-facing throttling, verified by signature instead.

## Versioning Strategy
- URL-based versioning (`/api/v1/...`). Breaking changes ship as `/api/v2/...` with a documented deprecation window for v1.
