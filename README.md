# PortfolioLab

A paper-trading web app: browse the ~500 companies of the S&P 500, follow their
price history, and buy or sell shares with a virtual starting balance of
30,000 $. Your holdings, portfolio value and transaction history are tracked
per account.

**Stack:** Next.js 16 (App Router, Server Components, Server Actions) · React 19 ·
TypeScript · Prisma 7 · PostgreSQL 17 · Auth.js (NextAuth v5) · Tailwind CSS 4 ·
Docker

## Try it locally

Requirements: [Docker](https://docs.docker.com/get-docker/) with Docker Compose.

```bash
git clone <this repository>
cd portfoliolab
docker compose up -d --build
```

Open <http://localhost:3000> and click **Try the demo**. No configuration,
API key or Google account is needed.

The first start takes a few minutes: images are built, the database schema is
created, and the companies and their price history are loaded. Follow it with
`docker compose logs -f seed`; the app starts when the seed has finished.

> **The stock prices in the demo are simulated** (deterministic random walk per
> company over the last 300 trading days). They are not real market data. The
> app shows a notice saying so. See [Using real market data](#using-real-market-data).

Stop it with `docker compose down` (add `-v` to also delete the database).

## Features

- **Stocks:** list of S&P 500 companies with their latest price, search and pagination
- **Company page:** sector, sub-industry, headquarters, foundation year, weekly price history
- **Trading:** buy or sell shares at the latest closing price; balance and holdings are checked before each order
- **Dashboard:** total portfolio value, available cash, owned positions
- **Transactions:** full history of buy and sell orders, searchable
- **Authentication:** Google sign-in, plus an optional passwordless demo account

## Architecture

```mermaid
flowchart LR
    Browser -->|HTTP| App
    subgraph Docker Compose
        App["app<br/>Next.js standalone server"] -->|Prisma + pg| DB[("db<br/>PostgreSQL")]
        Migrate["migrate<br/>prisma migrate deploy"] --> DB
        Seed["seed<br/>companies + simulated prices"] --> DB
        Prices["prices (optional profile)<br/>Twelve Data import"] --> DB
    end
    App -.->|OAuth| Google[Google]
    Prices -.->|REST| TD[Twelve Data API]
```

Startup order: `db` (healthy) → `migrate` → `seed` → `app`. The one-off jobs
exit when done, and both seed steps are idempotent, so `docker compose up` can
be run any number of times.

### Project structure

```
app/
  page.tsx                 Sign-in page
  main/                    Authenticated area (layout redirects anonymous users)
    stocks/                Company list, company pages, trading form
    dashboard/             Portfolio value and positions
    transactions/          Order history
  actions/                 Server-side data access (Prisma queries, buy/sell)
  components/              UI components (tables, search, pagination, buttons)
  api/auth/[...nextauth]/  Auth.js route handlers
auth.ts                    Auth.js configuration (Google + demo providers)
proxy.ts                   Next.js proxy (formerly middleware) running Auth.js
lib/prisma.ts              Prisma client using the pg driver adapter
prisma/                    Schema and SQL migrations
data/
  companies.csv            S&P 500 constituents
  parser.ts                Loads companies.csv into the database
  simulate_prices.ts       Generates the simulated price history
  api.ts                   Imports real daily prices from Twelve Data
Dockerfile                 Multi-stage build: deps → builder → tools / runner
docker-compose.yml         Full stack with sensible defaults
```

### Implementation notes

- **Consistent orders.** A buy or sell runs inside a single Prisma interactive
  transaction: it reads the balance, latest price and current holding, checks
  them, then updates cash, holdings and the transaction log together.
- **Exact money arithmetic.** Prices and balances are stored as
  `DECIMAL(10,2)` and computed with Prisma's `Decimal`, never with
  floating-point numbers.
- **Accounts created at sign-in.** An Auth.js `signIn` callback upserts the
  user record with the starting balance, so every page can rely on it.
- **Small production image.** Next.js `standalone` output; the runtime image
  contains only the traced server files and runs as a non-root user.
- **Reproducible demo data.** Simulated prices are seeded by the company
  symbol, and only companies without prices are filled, so simulated and real
  data are never mixed.

## Configuration

Every variable has a default in `docker-compose.yml`. To change one, copy
`.env.example` to `.env` and uncomment it.

| Variable | Default | Purpose |
|---|---|---|
| `APP_PORT` | `3000` | Host port of the app |
| `AUTH_URL` | `http://localhost:3000` | Public URL; must match `APP_PORT` or your domain |
| `AUTH_SECRET` | public demo value | Session signing secret. **Set your own** (`openssl rand -base64 32`) before exposing the app |
| `DEMO_MODE` | `true` | Shows **Try the demo** (shared account, no password) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | empty | Enables **Sign in with Google** when both are set |
| `SIMULATED_PRICES` | `true` | Generates simulated prices and shows the notice |
| `TWELVE_KEY` | empty | Twelve Data API key for the optional import |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `portfoliolab` | Database credentials |

**Google sign-in:** create an OAuth client in the Google Cloud console and add
`http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
(use your `AUTH_URL` instead of `localhost:3000` if different). Google accepts
plain `http` only for `localhost`; any other host needs HTTPS and a domain name.

## Using real market data

Real daily prices can be imported from [Twelve Data](https://twelvedata.com)
with your own API key. Start from an empty database so simulated and real
prices are not mixed:

```bash
docker compose down -v
SIMULATED_PRICES=false TWELVE_KEY=your_key docker compose --profile import up -d --build
docker compose logs -f prices
```

The import fetches 300 daily candles per company, one request every 1.5 s, so
it takes at least 13 minutes. Twelve Data's individual plans restrict their
data to personal or internal use, so imported prices should not be published or
redistributed.

## Development without Docker

Requires Node.js 22 and a PostgreSQL database. Create `.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/portfoliolab
AUTH_SECRET=any-long-random-string
DEMO_MODE=true
```

Then:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npx tsx data/parser.ts
npx tsx data/simulate_prices.ts
npm run dev
```

## Useful commands

```bash
docker compose ps                    # status (one-off jobs show "Exited (0)")
docker compose logs -f app           # app logs
docker compose up -d --build         # rebuild after code changes
docker compose down -v               # stop and delete the database
```
