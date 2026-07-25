# 08 — Project Folder Structure

```
Tasork/
│
├── docs/                          # All planning & architecture docs (this set)
│   ├── 01_Project_Identity.md
│   ├── 02_Business_Model.md
│   ├── 03_Master_Features.md
│   ├── 04_User_Flow.md
│   ├── 05_Pages.md
│   ├── 06_Sitemap.md
│   ├── 07_Technology.md
│   ├── 08_Project_Structure.md
│   ├── 09_Development_Standards.md
│   ├── 10_UI_Research.md
│   ├── 11_Animations.md
│   ├── 12_Database_Planning.md
│   ├── 13_API_Planning.md
│   ├── 14_Security.md
│   └── 15_Roadmap.md
│
├── assets/                        # Brand & design assets
│   ├── logo/
│   ├── icons/
│   ├── illustrations/
│   └── brand-guidelines/
│
├── ui/                             # Design system source of truth
│   ├── design-tokens/              # colors, spacing, typography as code
│   ├── components/                 # Figma/Storybook component specs
│   └── wireframes/
│
├── database/                       # DB planning & migrations reference
│   ├── erd/                        # entity relationship diagrams
│   ├── schema.prisma                # Prisma schema (source of truth)
│   └── seed/                        # seed scripts for local/dev data
│
├── api/                            # API contract & docs
│   ├── openapi.yaml                 # OpenAPI/Swagger spec
│   └── postman/                     # Postman collection
│
├── frontend/                       # Next.js application
│   ├── app/                         # App Router routes
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── (admin)/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui-based primitives
│   │   ├── forms/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── lib/                         # api client, utils, hooks
│   ├── styles/
│   ├── public/
│   ├── tests/
│   └── package.json
│
├── backend/                        # NestJS application
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── requests/
│   │   │   ├── proposals/
│   │   │   ├── projects/
│   │   │   ├── payments/
│   │   │   ├── messaging/
│   │   │   ├── notifications/
│   │   │   ├── coupons/
│   │   │   ├── referrals/
│   │   │   ├── reviews/
│   │   │   ├── support/
│   │   │   ├── cms/
│   │   │   └── admin/
│   │   ├── common/                  # guards, interceptors, decorators, filters
│   │   ├── config/
│   │   └── main.ts
│   ├── prisma/
│   ├── test/
│   └── package.json
│
├── infra/                          # Infrastructure as code (Phase 2+)
│   ├── docker/
│   ├── github-actions/
│   └── terraform/                   # if/when migrating to AWS
│
├── .github/
│   └── workflows/                   # CI/CD pipelines
│
├── .env.example
├── README.md
└── LICENSE
```

## Purpose of Each Top-Level Folder
| Folder | Purpose |
|---|---|
| `docs/` | Single source of truth for product/architecture decisions |
| `assets/` | Brand identity files reused across marketing and app |
| `ui/` | Design system definitions independent of implementation |
| `database/` | Schema, ERDs, and seed data — versioned separately from app code for clarity |
| `api/` | Contract-first API documentation, consumable by frontend/QA/partners |
| `frontend/` | The Next.js client application |
| `backend/` | The NestJS API server |
| `infra/` | Deployment and infrastructure configuration |
| `.github/` | CI/CD automation |
