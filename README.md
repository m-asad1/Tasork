# Tasork

> Describe it. We'll solve it.

Tasork is a SaaS platform connecting clients with a managed team of experts who deliver custom-scoped digital solutions through a Request → Review → Proposal → Execution workflow.

This repository is a **Turborepo monorepo** containing the full Tasork product: marketing site, customer/admin web app, and API.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query |
| Client state | Zustand |
| HTTP client | Axios |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache/Queue | Redis + BullMQ |
| Realtime | Socket.io |
| Auth | JWT (access + refresh) + Passport + Google OAuth |
| API docs | Swagger / OpenAPI |

See `/docs` for the full 32-document product and engineering blueprint (identity, business model, features, architecture, design system, security, etc.) produced in Sprints 1–2.

## Monorepo Structure

```
tasork/
├── apps/
│   ├── web/              # Next.js frontend (marketing + auth + dashboard + admin)
│   └── api/               # NestJS backend API
├── packages/
│   ├── ui/                 # Shared React component library
│   ├── config/             # Shared Tailwind / build config
│   ├── types/               # Shared TypeScript types/interfaces
│   ├── eslint-config/        # Shared ESLint config
│   └── tsconfig/             # Shared tsconfig base files
├── docs/                     # Product & engineering documentation (01–32)
├── scripts/                   # Repo automation scripts
└── .github/workflows/          # CI/CD pipelines
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Docker (for local Postgres/Redis)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local infra (Postgres + Redis + MinIO)
docker compose up -d

# 3. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Run database migrations
npm run db:migrate --workspace=apps/api

# 5. Start all apps in dev mode
npm run dev
```

- Web app: http://localhost:3000
- API: http://localhost:4000
- API docs (Swagger): http://localhost:4000/api/docs

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run all apps in development mode |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run all test suites |
| `npm run format` | Format code with Prettier |

## Documentation

Full engineering standards live in [`docs/09_Development_Standards.md`](./docs/09_Development_Standards.md). Read before contributing.

## License

Proprietary — see [LICENSE](./LICENSE).
