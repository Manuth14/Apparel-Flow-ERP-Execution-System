# AI Optimization & Architectural Report - ApparelFlow ERP

## 1. Tools & Prompting
In developing the ApparelFlow ERP system, modern AI engineering tools were leveraged strategically across different phases of the lifecycle:
- **ChatGPT & Claude:** Utilized for high-level system scaffolding, planning the Prisma database schema architecture, drafting state-machine workflows (handling transitions between `CUTTING_IN_PROGRESS`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, and `IN_SEWING`), and formulating automated test cases.
- **GitHub Copilot / Cursor:** Used for inline code autocompletion, generating boilerplate React Server Components, and establishing Tailwind CSS layout structures for workstation dashboards.

## 2. Flawed / Broken AI Code
While AI tools accelerated initial development, raw outputs exhibited critical architectural vulnerabilities that required intervention:
- **Client-Side-Only RBAC Enforcements:** Initial AI-generated route handlers checked user permissions purely via incoming client headers or local storage flags without verifying HTTP-only cookies or executing database validation, which would allow unauthorized users to bypass restrictions via API testing tools like Postman.
- **Race-Condition-Prone State Transitions:** AI-suggested order status update logic performed decoupled database reads and writes (`prisma.cuttingOrder.findUnique` followed by `prisma.cuttingOrder.update`) without atomic transactions, creating a major vulnerability for double-processing race conditions when concurrent workstation requests hit the server.

## 3. Human Refactoring
Engineering judgment and manual refactoring were applied to harden the codebase:
- **Server-Side Middleware Hardening:** Replaced client-dependent permission checks with robust server-side RBAC wrappers (`requireRole`) that extract and cryptographically verify JWT claims from secure HTTP-only cookies on every request.
- **Atomic Transactions:** Wrapped state updates, verification logs, and audit trails inside strict Prisma transactions (`prisma.$transaction`) to ensure atomicity and rollback safety during order rejections or resubmissions.

## 4. Defensive Architecture
To ensure absolute integrity and prevent unauthorized status overrides, the system architecture incorporates:
- **Strict State-Machine Governance:** Order states follow a rigid, unidirectional workflow. For example, moving an order to `IN_SEWING` is strictly restricted to orders currently in the `VERIFIED` state, and rejected orders must pass through a mandatory supervisor resubmission workflow accompanied by a documented rejection note.
- **API Guardrails & Isolation:** Workstation endpoints explicitly isolate data queries (e.g., the sewing queue query targets strictly `VERIFIED` status), eliminating status leakage and preventing unauthorized role override attempts from altering production batch lifecycles.