# Accounting App – MVP

Internal bookkeeping workflow prototype: Client → Engagement → Upload Document → Background Processing → Normalized Transactions → Junior Prepares → Senior Reviews → Export.

## Stack

- Next.js 16 (App Router) + TypeScript
- TailwindCSS
- Prisma + PostgreSQL
- DB-backed job queue + worker script

## Quick Start

### 1. Start PostgreSQL

Using Docker Compose:
```bash
docker compose up -d
```

Or start a local Postgres and create the database:
```bash
psql -U postgres -c "CREATE USER bookkeeper WITH PASSWORD 'bookkeeper' CREATEDB;"
psql -U postgres -c "CREATE DATABASE bookkeeper OWNER bookkeeper;"
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run migrations and seed

```bash
pnpm db:migrate
pnpm seed
```

### 4. Start the app

```bash
pnpm dev      # starts web app on http://localhost:3000
pnpm worker   # starts background job worker (separate terminal)
```

## Demo Credentials

The login page offers two roles:
- **Junior Bookkeeper** (Sarah Chen) – Prepares transactions for review
- **Senior Reviewer** (David Thompson) – Reviews and approves transactions

## Workflow

1. Login as Junior or Senior
2. Browse clients from the client list
3. Upload documents (CSV fully parsed; PDF/XLSX simulated)
4. Background worker processes documents into transactions with AI/rule classifications
5. Junior reviews transactions in the review queue (categorize, prepare)
6. Senior reviews prepared transactions (approve/review)
7. Export reviewed transactions as CSV

## Keyboard Shortcuts (Review Queue)

| Key | Action |
|-----|--------|
| `j` / `k` or `↓` / `↑` | Navigate rows |
| `Space` | Toggle selection |
| `Enter` | Prepare (junior) / Review (senior) focused row |
| `1`-`9`, `0` | Quick-set category |
| `Ctrl+A` | Select all |

## Categories

1. Advertising
2. Meals & Entertainment
3. Office Expenses
4. Professional Fees
5. Travel
6. Vehicle
7. Software / Subscriptions
8. Bank Charges
9. Owner Draw / Personal
0. Uncategorized

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, clients, documents, transactions, export)
│   ├── clients/       # Client list, detail, upload, review, export pages
│   └── login/         # Login page
├── components/        # Shared components (Navbar, ReviewQueue)
└── lib/               # Core libraries (db, auth, storage, classifier, csv-parser, constants)
prisma/
├── schema.prisma      # Data model
├── seed.ts            # Demo data seed script
└── migrations/        # Database migrations
```
