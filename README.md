# ApparelFlow ERP System

ApparelFlow is an enterprise resource planning (ERP) system built for apparel manufacturing operations. It streamlines the full production lifecycle from fabric cutting and quality inspection to automated routing into the sewing production queue.

## 🔗 Live Demo
- **Live Application:** [https://apparel-flow-erp.netlify.app/](https://apparel-flow-erp.netlify.app/)

## 1. Architecture & Tech Stack
- **Framework:** Next.js App Router (React Server Components, Server Actions & API Routes)
- **Database & ORM:** PostgreSQL (**Neon** serverless database) powered by Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication & Security:** Secure JWT-based HTTP-only cookies enforcing strict Role-Based Access Control (`cutting_supervisor`, `cutting_verifier`, `sewing_supervisor`).

## 2. Database Schema & State Machine
- **User:** Manages system operators and multi-role assignments.
- **Recipe & RecipeComponent:** Garment design specifications and component breakdowns.
- **CuttingOrder:** Core tracking for production batches, target quantities, fabric rolls, actual fabric yards used, and strict state-machine governance:
    - `CUTTING_IN_PROGRESS` $\rightarrow$ `PENDING_VERIFICATION` $\rightarrow$ `VERIFIED` (or `REJECTED`)
    - `REJECTED` orders can be resubmitted back to `PENDING_VERIFICATION` via supervisor action.
    - `VERIFIED` orders move into `IN_SEWING`.
- **VerificationItem & VerificationLog:** Traffic-light item inspections, wastage cap percentages, and audit trails managed during the cutting verification stage.

## 3. Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Cutting Supervisor** | `cutting.sup@apparelflow.com` | `password123` |
| **Cutting Verifier** | `verifier@apparelflow.com` | `password123` |
| **Sewing Supervisor** | `sewing.sup@apparelflow.com` | `password123` |

## 4. Local Setup & Installation
1. **Clone and install dependencies:**
   ```bash
   npm install

2. **Configure Environment Variables (.env):**

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/apparel_flow?sslmode=require"
JWT_SECRET="your_secure_jwt_secret_key"
```

## 5. Database Migration & Seeding:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 6. Run Development Local Server:
```bash
npm run dev
```

## 7. Netlify Deployment Configuration
   Ensure the following environment variables are added under your Netlify site settings (Site configuration > Environment variables):

- **DATABASE_URL** — Neon PostgreSQL connection string (with sslmode=require).
- **JWT_SECRET** — Secure random secret string for JWT authentication.

## 8. Automated Testing Suite
 The project includes tests covering RBAC, state transitions, and workstation queue isolations:
- tests/gatekeeper.test.ts
- tests/reject.test.ts
- tests/rbac.test.ts
- tests/sewing-queue.test.ts

1. **Run tests using:**
```bash
npm test
```