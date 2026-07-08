<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev          # start dev server on localhost:3000
npm run build        # production build
npm run lint         # ESLint (eslint-config-next v16)
npx prisma generate  # regenerate Prisma client into generated/prisma/
```

There are no tests, no typecheck script, and no pre-commit hooks.

## Two databases, two Prisma clients

This project talks to **two separate databases** via Prisma v7 driver adapters. Do not mix them up.

| Concern | Database | Adapter | Prisma client | Env vars |
|---|---|---|---|---|
| Ecommerce (products, orders, categories, auth) | MariaDB / MySQL | `@prisma/adapter-mariadb` | `src/lib/prisma.ts` → `generated/prisma/client` | `DATABASE_HOST/PORT/USER/PASSWORD/NAME` |
| Chat + LangGraph checkpointing | PostgreSQL | `@prisma/adapter-pg` | `src/db/index.ts` → `generated/prisma/client` | `PG_HOST/PORT/USER/PASSWORD/DATABASE` |

Both use the same Prisma schema (`prisma/schema.prisma`) but connect to different databases with different adapters. The generated client output is `generated/prisma/` (non-standard — not inside `node_modules`).

- `src/lib/prisma.ts` — singleton PrismaClient for MariaDB. Used by most app code and the agent tools.
- `src/db/index.ts` — singleton PrismaClient + raw `pg.Pool` for PostgreSQL. Used by LangGraph checkpointer.

## App structure (Next.js App Router)

Route groups:
- `src/app/(front)/` — public pages (home, about, product catalog, chat)
- `src/app/(admin)/` — admin dashboard. Protected by `AdminGuard` in layout — checks `session.user.role === 'admin'`, redirects to `/` otherwise.
- `src/app/(auth)/` — sign-in / sign-up pages

API routes:
- `src/app/api/auth/[...all]/` — better-auth handler
- `src/app/api/chatv19/route.ts` — LangChain chat agent endpoint
- `src/app/api/chat-history/` — chat history CRUD

Import alias: `@/*` → `./src/*`

## Auth (better-auth)

- `src/lib/auth.ts` — server-side auth instance with MySQL adapter, email+password
- `src/lib/auth-client.ts` — client-side auth client with inferred `role` field
- User model has `role` field (`user` | `admin`), not exposed in sign-up input
- Session: 7-day expiry, refreshed after 1 day

## LangChain AI agent

- **Tools** in `src/agent-tools/index.ts`: `get_current_date`, `search_product_database` (searches products table), `execute_sql` (read-only SELECT on MariaDB), `load_skill` (loads skill content into context)
- **Middleware** in `src/agent-middlewares/skill-prompt.ts`: injects available skills list into the system prompt
- **Skills** in `src/skills/index.ts`: loaded at startup from `.agents/skills/*.md` files (YAML frontmatter + markdown body). Adding a new skill means creating a new `.md` file there.
- Chat API at `src/app/api/chatv19/route.ts`

## UI stack

- **Tailwind CSS v4** with `@tailwindcss/postcss` plugin (no `tailwind.config.ts`)
- **shadcn/ui** components in `src/components/ui/` with "radix-nova" style, RSC mode
- CSS variables in `src/app/globals.css` (oklch colors, light + dark)
- `next-themes` for theme switching
- `cn()` helper in `src/lib/utils.ts` via `tailwind-merge` + `clsx`

## Style conventions

- No comments in code (unless truly necessary)
- Components use PascalCase filenames matching export
- Thai language UI (`lang="th"`, Thai fonts: Prompt for front, K2D for admin)
