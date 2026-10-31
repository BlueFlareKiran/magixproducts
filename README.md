> **Deploying to GitHub + Vercel?** Start with [`DEPLOY_GITHUB_VERCEL.md`](DEPLOY_GITHUB_VERCEL.md) for the full Windows/GitHub/Vercel/token setup and live product-management checks.

# Final slideshow and image text layout

Everyday favorites on Home now displays one product feature at a time. The right tool for every room appears only on collection/category pages, as a full-width room-photo slideshow. Both have automatic progression every 6.5 seconds, arrows, dots, pause, keyboard arrows and touch swipe. Hover/focus pauses progression and reduced-motion settings disable autoplay. Inactive slides are inert.

Text is placed directly over room photos and the Products, About, Contact and story backgrounds. White caption boards have been removed, including from the brand caption above the animated logo. Shadows are applied to text only; no blue filters or background-image replacement were added. Product presentation areas and dialogs keep their normal surfaces.

Build and 10 existing regression tests passed; browser visual checks remain unverified in this environment.

---

# Visibility and hero-product update

- Removed photo tint overlays on Products, About, Contact, the story section and lifestyle cards. Existing photographs are unchanged. Solid text cards preserve readability without filtering the photos.
- Removed the broom image from the homepage slideshow background. Explore our brooms now opens a focused hero-product dialog with the supplied broom, 90+ Days usage life and the usage note. It also offers enquiry and category links. Escape, Close and backdrop click dismiss the dialog.
- Moved We Mean Clean and MOP-BRUSH-BROOM-WIPER above the animated logo in a compact white caption panel for readable text in both themes and on mobile.
- Build and all 10 existing regression tests passed. Browser visual checks remain unverified in this environment.

---

# Hero slideshow and clear-background update

The homepage now cycles between the existing animated logo and the client-supplied hero broom every 8 seconds. Previous/next arrows, slide dots and pause/resume are included. Autoplay pauses on hover, keyboard focus and inactive browser tabs; reduced-motion preferences disable autoplay.

The second slide displays **Our hero product**, **90+ Days usage life**, and: “Note: 90+ days is based on various usage conditions and customer feedback. Actual usage life depends on how the product is used.”

The existing `public/brand/home-banner.webp` is byte-for-byte unchanged. Its shade/gradient overlays, filter and background pseudo-elements are removed in BOTH light and dark modes. Product-only CSS blending helps the supplied broom photograph sit on the banner; it does not filter or alter the background photograph.

Build and the 10 existing regression tests passed. Browser visual verification remains unavailable in this environment. The complete project includes all products, assets, admin logic and setup instructions below.

---

# Final client logo and banner update

The hero uses two independent transparent image layers in `public/brand/`: `magix-cloud-tm.png` (stationary) and `magix-tools-ring.png` (rotating). The ring rotates around its own center over 70 seconds, supports pause/resume, and respects reduced-motion settings. The readable cloud carries TM, and the header, footer and favicon use the updated cloud.

Under the emblem: **We Mean Clean** and **MOP-BRUSH-BROOM-WIPER**.

The hero now features a warm, sunlit home photograph, with an ivory overlay in light mode and a charcoal overlay in dark mode. Original product data and admin/API logic are unchanged.

The supplied JPEG was used as the reference for regenerated transparent assets. These are restored interpretations, not pixel-exact extractions or native vector artwork. Native generated dimensions are recorded in `BRAND_ASSETS.md`; no native-4K claim is made. The original reference remains in `design/reference/`.

Build and all 10 existing tests pass. Browser visual QA remains unavailable in this environment; review at desktop and phone widths locally before launch.

# Premium blue UI update

This package contains the complete updated Magix website, including the original catalogue, images, PDF, API routes and admin tools.

## Run on Windows / macOS / Linux

1. Install Node.js 22 or newer.
2. Extract this ZIP and open the `magixproducts_page-main` folder in VS Code.
3. Open a terminal in that folder and run:

```sh
npm ci
npm run dev
```

4. Open http://localhost:3000.

The public catalogue works without credentials. For admin login, copy `.env.example` to `.env.local`, configure your own values, and restart the dev server. In Windows PowerShell, use `Copy-Item .env.example .env.local`. Production publishing also requires the GitHub settings described below.

## Design changes

- Navy, blue and warm white design with the original yellow Magix branding.
- Light/dark toggle in the header; remembers the visitor’s preference and initially follows the system theme.
- Slow rotating product ring with a stationary, legible central logo; pause/resume control and reduced-motion support.
- Cinematic room-photography backgrounds using the supplied local assets. No video downloads or new animation dependencies.
- Refined category/product cards, responsive layouts, sticky navigation and keyboard focus indicators.
- Room scenes use horizontal scrolling; favourite products use a stable grid for easier browsing.
- Shared styling across Home, Products, product details, About, Contact and admin screens.

The visual layer lives in `app/premium.css`; shared page components are in `src/MagixSite.tsx`.

## Validation of this update

`npm run typecheck`, `npm run build` and all 10 tests in `npm test` passed. Tests cover the 118-product catalogue, image references, authentication and publishing logic using mocked GitHub requests. Live production credentials and deployment were not tested. Browser visual QA was unavailable because the managed preview launcher supplied flags unsupported by Next.js; review desktop/mobile appearance in your local browser before launch.

---

# Magix Household Products

Next.js App Router site for the Magix catalogue. The public site needs no login. An administrator can stage product edits, preview them, and publish through server-side GitHub Contents API calls. The repository token stays on the server.

## Local setup

Use Node.js 22 or newer and npm. From this repository root:

```sh
npm ci
cp .env.example .env.local
# Set MAGIX_ADMIN_USERNAME, MAGIX_ADMIN_PASSWORD and MAGIX_SESSION_SECRET in .env.local
npm run dev
```

Open `http://localhost:3000`. Home, Products, seven category pages, individual products, and Contact are public. Products has a **Manage products** login; `/admin` opens the same management area. The supplied 118 products, their images, PDF, and QR codes are in this repository.

With no GitHub settings in development, admin publishing writes `data/catalog.json` and `data/uploads/` locally. This is for local testing only. `src/catalog.json` is the bundled fallback catalogue and is intentionally separate; keep it in sync with the checked-in `data/catalog.json` when changing the initial seed. Real admin edits should go through Apply changes.

Run checks with:

```sh
npm run lint
npm run typecheck
npm run build
npm test
```

The test suite mocks GitHub responses and needs no credentials. It does not write to the production repository.

## Configuration

See [.env.example](.env.example) for all variable names and placeholders. `.env.local` is ignored by Git.

| Variable | Local development | Vercel production |
| --- | --- | --- |
| `MAGIX_ADMIN_USERNAME` | Required for admin | Required |
| `MAGIX_ADMIN_PASSWORD` | Required for admin | Required; choose a strong unique value |
| `MAGIX_SESSION_SECRET` | Required for admin; at least 32 characters | Required; at least 32 random characters |
| `GITHUB_MAGIX_REPO` | Optional together with token | Required; `owner/repository` |
| `GITHUB_MAGIX_TOKEN` | Optional together with repo | Required; repository scoped, Contents read/write |
| `GITHUB_MAGIX_BRANCH` | Defaults to `main` | Branch containing the catalogue |
| `GITHUB_MAGIX_PATH` | Defaults to `data/catalog.json` | Catalogue path on that branch |
| `GITHUB_MAGIX_UPLOAD_PATH` | Defaults to `data/uploads` | Image folder on that branch |

Never set these as `NEXT_PUBLIC_` variables. Set the actual production values in Vercel project environment settings after this audit. The GitHub repository and branch must already contain the catalogue JSON. The token's owner must have access to the repository, and branch rules must allow Contents API commits. Production editing fails closed if GitHub configuration is missing. The public site can show its bundled catalogue with a warning during a GitHub outage; that fallback can be older than the live catalogue.

## Publishing workflow

1. Open Products → Manage products and sign in.
2. Add, edit, hide, or restore products. Changes stay in browser memory and appear in **Preview changes**. Leaving the page loses unapplied changes.
3. Click **Apply changes**. Selected JPG, PNG, or WebP files (up to 5 MB each) are optimized in the browser to WebP (under 900 KB). The authenticated server validates and uploads them, then validates catalogue data and the catalogue's SHA and writes the JSON through the GitHub Contents API.
4. Click **Open website** to verify. Public catalogue requests use `no-store`, so a successful publish appears without a manual redeploy. GitHub commits on the deployment branch may also trigger a Vercel build.

If a catalogue write fails after an image upload, the product change remains staged and the uploaded image can be reused on retry. An uploaded file can remain unreferenced in GitHub if the user abandons the edit. GitHub Contents API writes to separate files are not atomic. Concurrent catalogue changes are rejected through SHA comparison. Use **Refresh published** and review the preview before trying again; staged edits remain in the browser. Failed uploads and write conflicts do not publish product data.

Uploaded private-repository images are served by `/api/media/<filename>` through server-side GitHub access. The browser sees neither the GitHub token nor the private repository URL. Existing images, QR files, and PDF are served from `public/`.

## Vercel preparation

Deploy this repository as a Next.js project. Configure all production variables above. Keep `.env` and `.env.local` out of Git. Use a repository scoped fine-grained token with only Contents read/write, and verify the selected branch's protection rules. After setting environment variables, redeploy once to load them. Subsequent catalogue changes do not require redeployment.

Before calling the deployment production ready, test real credentials in a preview environment: failed and valid login, create/edit/hide/restore, image upload, Apply changes, public visibility, private image delivery, SHA conflicts, and the actual GitHub commit. Check the seven category pages, a product page, contact links, QR codes, and PDF on desktop and mobile. The in-memory login limiter is per server instance, so add platform-level rate limiting or a WAF if exposed to sustained attacks across instances.
