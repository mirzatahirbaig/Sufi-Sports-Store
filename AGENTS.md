# AI Build Prompt — Customer Website (MVP2, Angular)

> Paste this entire prompt into your AI coding assistant. This assumes **MVP1 (ASP.NET Core Backend + Admin Portal, PostgreSQL, Dockerized)** is already built and its public API is stable at `/api/v1/...`.

---

## 1. Project Context

You are acting as a **Senior Angular / Frontend Architect**. Build **MVP2**: a public, read-only, **no-login** customer-facing website that consumes the existing MVP1 backend's public API.

This site is purely a **presentation layer** — no business logic, no data mutation except a single contact-form submission. All content (products, banners, articles, contact info) is managed elsewhere, in the MVP1 Admin Portal.

**Do not** build login/registration, cart, checkout, or any authenticated feature in this phase — those are explicitly out of scope.

---

## 1.1 Business Domain & Brand Context (Critical — Drives All UI Decisions)

**The business is a boxing gear manufacturer.** This is not a generic content site — it is the manufacturer's **digital storefront/showcase**, and it must look, feel, and function like a real **e-commerce store**, even though checkout is deferred to a later phase.

Keep this in mind for every UI decision in this prompt:

- **Visual tone**: bold, high-contrast, athletic/performance branding — think sports/fitness e-commerce (product-hero photography, strong typography, action-oriented imagery), not a soft corporate/blog aesthetic.
- **Product categories** (typical for a boxing gear manufacturer — confirm exact taxonomy with the backend/admin data, but design for these): Boxing Gloves, Hand Wraps, Headgear, Punching Bags & Stands, Focus Mitts/Pads, Protective Gear (mouthguards, groin guards, shin guards), Apparel (shorts, rash guards, robes), Accessories (bag gloves, grip bars).
- **Even though there's no cart/checkout yet, the UI must read as e-commerce**, not a brochure:
  - Product cards show **price, category, and stock status** prominently (already in the DTO).
  - A **category filter/navigation** (by product type) on the product listing page, not just a flat paginated grid.
  - Product detail pages follow standard e-commerce layout conventions: large image gallery/zoom, price, stock badge, key specs (size/weight/material where applicable), description, related/similar products.
  - Home page follows e-commerce landing patterns: hero banner (promotions/new arrivals), **shop-by-category tiles**, featured products grid, trust/value badges (e.g., "Manufacturer Direct," "Durable Materials," "Pro-Grade Quality" — placeholder copy, confirm real value props with the business).
  - Since there's no login/cart in MVP2, replace typical "Add to Cart" affordances with a clear **"Enquire" / "Contact for Order"** call-to-action on product cards and detail pages that routes to the Contact page (pre-filling the product name/reference if feasible) — this keeps the e-commerce *feel* while respecting the no-transaction scope of this phase.
  - Design the product card and detail components so a **future "Add to Cart" button can be dropped in later** without restructuring the layout (i.e., leave the visual/component slot for it).
- **Imagery expectations**: product photos are gear-on-white or lifestyle/action shots; design the gallery component to handle both aspect ratios cleanly (don't assume square-only or hero-only imagery).
- **Terminology**: use e-commerce-standard labels the audience expects — "Shop," "New Arrivals," "Best Sellers" (if `IsFeatured` doubles as this), "In Stock"/"Out of Stock," "Specifications" — not generic CMS terms like "Items" or "Entries."

---

## 2. Tech Stack (Mandatory)

| Layer | Technology |
|---|---|
| Framework | Angular (latest stable LTS version — confirm exact version before starting) |
| Component style | **Standalone components** (no NgModules) |
| Language | TypeScript, strict mode enabled (`strict: true` in `tsconfig.json`) |
| Styling | SCSS, component-scoped styles, a shared design-tokens file (colors, spacing, typography) — no inline styles |
| State/data | Angular `signals` for local/component state; RxJS only for HTTP streams and async composition |
| HTTP layer | Angular `HttpClient` via a typed `ApiService` per resource (`ProductService`, `BannerService`, `ArticleService`, `ContactService`) |
| Forms | Reactive Forms (`FormGroup`/`FormControl`) for the contact form, with built-in + custom validators |
| Rendering | **Angular Universal (SSR)** — required for SEO on product/article pages (see Section 5) |
| Testing | Jasmine + Karma (unit), consider Playwright/Cypress for a small smoke-test suite on critical pages |
| Containerization | Docker multi-stage build → served via **Nginx** (consistent with MVP1's "no server installs" goal) |

---

## 3. Architecture Requirements (Non-Negotiable)

Use a **feature-based folder structure**, not a type-based one:

```
/src/app
  /core
    /services        → ApiService base, interceptors (error handling, base URL), environment config access
    /models           → TypeScript interfaces matching backend DTOs exactly (Product, Banner, Article, ContactRequest, etc.)
  /shared
    /components       → TopBar, Footer, LoadingSpinner, ErrorState, Pagination, SEO/meta helper — reusable, presentation-only, no business logic
    /pipes, /directives
  /features
    /home             → Landing page: banner carousel + featured products
    /products          → Product list + product detail
    /articles          → Blog/article list + article detail
    /contact           → Contact form + contact-us info display
  /layout             → Shell component wrapping TopBar + RouterOutlet + Footer
```

**Enforce these rules strictly (mirrors MVP1's discipline — consistency across the stack matters):**

- **SOLID & DRY** — no duplicated fetch/mapping logic; shared logic lives in `core` services or shared utilities.
- **File length limit:** no `.ts` file exceeds **100 lines** (component class or service). Split large components into a **container (smart) component + presentational (dumb) sub-components**.
- **Function length limit:** no method exceeds **10 lines**. Extract private helpers aggressively.
- **One component/service/pipe per file.**
- **No business/mapping logic in templates (`.html`)** — templates bind to already-shaped view models exposed by the component.
- **No deprecated Angular APIs** — no `NgModule`-based bootstrapping, no `HttpClientModule` import pattern (use `provideHttpClient()`), no legacy `*ngIf`/`*ngFor` if the project's Angular version supports the new built-in control flow (`@if`, `@for`) — use the modern syntax.
- **Strictly typed** — no `any`; every API response is typed against an interface matching the backend DTO contract.
- **Presentational components must be pure** — inputs/outputs only, no direct service injection where avoidable.

---

## 4. Functional Requirements

### 4.1 Top Bar (global, all pages)
- Logo, primary nav links (Home, Products, Blog, Contact), sourced from `GET /api/v1/contact-info` where applicable (e.g., phone/email in a top strip).
- Responsive: collapses to a mobile hamburger menu below a defined breakpoint.
- Sticky on scroll (optional, confirm with stakeholder before implementing).

### 4.2 Home Page
- **Hero banner carousel**: fetched from `GET /api/v1/banners`, auto-rotating, respects `active date range` already filtered server-side, includes prev/next controls and pause-on-hover. Treat this as the storefront's promotional hero (new arrivals, seasonal offers), not a generic slideshow.
- **Shop-by-category tiles** (Gloves, Wraps, Headgear, Bags, Protective Gear, Apparel, Accessories — see Section 1.1) linking into filtered product listing views.
- **Featured products** section (a.k.a. "Best Sellers"/"New Arrivals" depending on copy chosen): `GET /api/v1/products?featured=true`, shown as a responsive product-card grid with price, stock badge, and category.
- **Trust/value badges** row (manufacturer-direct quality, materials, craftsmanship — confirm real copy with the business).
- Graceful **empty states** (no banners / no featured products) — never show a broken/blank section.

### 4.3 Product Listing & Detail
- `GET /api/v1/products` — paginated grid **with category filter/navigation** (not a flat list), styled as a storefront shop page: filter sidebar or top filter bar by category, price sort if the backend supports it. Confirm whether pagination/filtering is query-param-driven server-side (likely) or client-side, and mirror the backend's actual contract exactly.
- **Note**: category-based filtering and per-product specs (weight, size, material) assume the MVP1 `Product` entity carries a `Category` field and a flexible specs/attributes structure — flag to the backend team if these aren't yet present, since the storefront UI depends on them.
- Each product card shows image, name, category, price, and stock status at a glance — standard e-commerce card conventions.
- Product detail page: `GET /api/v1/products/{id}`, includes image gallery (zoomable), price, stock status badge, key specs (size/weight/material where applicable to the item — e.g., glove weight in oz, wrap length), full description, and a **related/similar products** row.
- **"Enquire" / "Contact for Order" CTA** in place of "Add to Cart" (see Section 1.1) — routes to the Contact page, pre-filling product reference where feasible.
- **Loading skeletons** while fetching, **error state** component (with retry action) if the API call fails — never a blank white page.

### 4.4 Blog / Articles Listing & Detail
- `GET /api/v1/articles` — paginated list (title, excerpt, cover image, published date).
- `GET /api/v1/articles/{slug}` — full article detail; render backend-provided HTML content **safely** (Angular's `DomSanitizer`, and confirm the backend already sanitizes on write — do not trust raw HTML blindly even so).
- Article URLs use the **slug**, not the numeric ID, for SEO-friendly routing (`/blog/:slug`).

### 4.5 Contact Page
- Display contact info from `GET /api/v1/contact-info` (address, phone, email, social links, embedded map if coordinates are provided).
- Contact form → `POST /api/v1/contact`:
  - Client-side validation mirrors backend rules (required fields, email format, max lengths) — but **never assume client validation is sufficient**; still handle and surface backend validation errors returned in the standard `{ success, data, message, errors }` envelope.
  - Disable submit button + show spinner while request is in flight; prevent double-submits.
  - Show a clear success confirmation and a clear, actionable error message on failure (not just backend's message).
  - **Honeypot field or simple client-side spam deterrent** as a first line of defense (server already rate-limits, per MVP1 spec).

---

## 5. SEO & Performance Requirements

Since this is a public marketing/content site, SEO matters far more than in the Admin Portal:

- **Angular Universal (SSR)** so product and article pages are crawlable and have correct `<title>`/meta tags at first paint, not injected client-side only.
- Per-page **dynamic meta tags** (title, description, Open Graph image) via Angular's `Meta` and `Title` services — especially for product detail and article detail pages (so shared links render properly on social media).
- **Lazy-loaded routes** per feature (`loadComponent`) so the initial bundle stays small.
- **Image optimization**: use `NgOptimizedImage` directive for all images from the API/CMS.
- **Core Web Vitals awareness**: avoid layout shift (reserve image dimensions), defer non-critical JS, minimize main-thread blocking work.
- `sitemap.xml` and `robots.txt` generation strategy — even a simple static/manually-updated version for MVP2, note the need for a dynamic generator in a future phase if content volume grows.

---

## 6. Error Handling & Resilience

- **Global HTTP interceptor** for:
  - Attaching the base API URL from environment config (`environment.ts` / `environment.prod.ts`).
  - Centralized error handling — network failures, 4xx/5xx — mapped to a consistent `ApiError` shape the UI can render.
  - Timeout handling with a sensible default (e.g., 10s) and retry-once for idempotent GET requests only.
- Every feature page that fetches data must handle **three states explicitly**: loading, error (with retry), and empty (no data) — never leave a state unhandled.

---

## 7. Dockerization (Mandatory — Consistent with MVP1's Deployment Model)

- **Multi-stage Dockerfile**:
  - Stage 1 (`build`): Node LTS image — `npm ci`, `ng build` (production + SSR build if Universal is used).
  - Stage 2 (`final`): lightweight Nginx (or Node, if SSR requires a running Node server rather than static Nginx hosting) image serving the built output.
  - Use a **non-root user** in the final image.
  - `.dockerignore` excludes `node_modules/`, `dist/`, `.angular/`, `.git/`.
- If SSR is used, the final stage runs the Angular Universal Node server (`node dist/.../server.mjs` or equivalent) rather than plain static Nginx — confirm which based on the Angular version's SSR output structure.
- **docker-compose.yml** integrates this as a new service (`customer-web`) alongside the existing MVP1 `webapi`/`adminportal`/`database` services, on the same Docker network, so the frontend can reach the API via an internal service name or a configured public API base URL (confirm whether this is same-origin behind a reverse proxy or a separate subdomain — this affects CORS config already defined in MVP1).
- Environment-driven API base URL — **never hardcode** the backend URL; inject via build-time environment config or runtime-injected config (e.g., a small `config.json` fetched on app init, so the same Docker image can be promoted across environments without rebuilding).

---

## 8. Additional Rules I'm Adding (recommended for best AI output)

- **Design tokens first**: before building pages, establish a shared SCSS variables/tokens file (colors, spacing scale, typography scale, breakpoints) reflecting the **bold, athletic, e-commerce brand tone** described in Section 1.1 — not a generic default palette — so components stay visually consistent without repeated magic values.
- **Accessibility (a11y) baseline**: semantic HTML, proper heading hierarchy, `alt` text on all images (sourced from backend or a sensible fallback), keyboard-navigable carousel and forms, sufficient color contrast — this is a public marketing site, treat a11y as a requirement, not a nice-to-have.
- **Mobile-first responsive design** — build and test at mobile breakpoints first, then scale up, not the reverse.
- **No direct DOM manipulation** — use Angular's template/binding system and `Renderer2` only if absolutely unavoidable.
- **Barrel files (`index.ts`) avoided or used sparingly** — they can hide circular dependency issues in Angular's build; prefer direct imports.
- **Consistent naming**: `*.component.ts`, `*.service.ts`, `*.model.ts`, `*.guard.ts` suffixes; kebab-case selectors prefixed appropriately (e.g., `app-product-card`).
- **API contract drift protection**: TypeScript interfaces in `/core/models` should be treated as the single source of truth mirrored from MVP1's DTOs — flag any mismatch rather than silently coercing types.
- **No secrets or API keys in the frontend bundle** — anything sensitive stays server-side; this app only ever calls the already-public, anonymous MVP1 endpoints.
- Ask clarifying questions **before** assuming: exact Angular version, whether SSR output serves via Node or is pre-rendered static (SSG) for content pages, and whether the customer site shares a domain with the API (same-origin) or needs CORS across subdomains.
- dont run the project by your own (dont create dummy data)
- **Always** check the **environment variables** that whether the data is comming or not before creating the component
- dont run subagent for testing 

---

## 9. Explicitly Out of Scope for MVP2

- User authentication/registration/login.
- Cart, checkout, payments.
- User reviews/ratings/comments on products or articles.
- Search functionality beyond simple listing/pagination (unless explicitly requested later).
- CMS-style content editing on the frontend — all content management remains in the MVP1 Admin Portal.

---

### End of Prompt