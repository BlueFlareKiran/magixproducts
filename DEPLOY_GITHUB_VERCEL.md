# Deploy Magix on GitHub + Vercel with live product management

This guide is for the **complete Magix Next.js website** in this ZIP. The public website is hosted by Vercel; GitHub holds its code and the live product catalogue. The private admin login on `/admin` uses a server-side GitHub token to commit catalogue changes. **You do not enter a GitHub token on the public website.**

## A. Prepare the project

1. Install Git, and Node.js 22 or a newer release supported by Next.js and Vercel.
2. Extract this ZIP into a folder such as `C:\Projects\magix-website`. **The folder containing `package.json` is the repository root**, not a parent folder.
3. Open this folder in a terminal. Run:

   ```powershell
   npm ci
   npm run typecheck
   npm test
   npm run build
   ```

4. The `.gitignore` already prevents `.env.local`, `node_modules`, and `.next` from being committed. Never upload secrets, tokens, or actual `.env.local` files.

## B. Create the GitHub repository and upload the website

1. Sign in at https://github.com and create an **empty private** repository, e.g. `magix-website`. Do **not** pre-add a README, license, or `.gitignore`; this project already has these files where needed.
2. In Windows PowerShell **inside the extracted project folder**, run:

   ```powershell
   git init
   git add .
   git commit -m "Initial Magix website"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/magix-website.git
   git push -u origin main
   ```

   Replace `YOUR_GITHUB_USERNAME` and the repository name. Authenticate Git using Git Credential Manager, GitHub Desktop or GitHub CLI as needed; GitHub passwords cannot be used for Git over HTTPS.
3. Confirm `data/catalog.json` exists on the **main** branch of the GitHub repository. It contains the original 118 product records.

If you use GitHub Desktop instead, choose **File > Add local repository**, select this folder, initialize it if asked, commit, and publish it as a private GitHub repository.

## C. Create the fine-grained GitHub token for product editing

1. In GitHub select **Profile photo > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**.
2. Set a meaningful name such as `Magix Vercel catalogue writer`, the account that owns the repository as **Resource owner**, and a suitable expiration period. Plan to renew/rotate it.
3. Under **Repository access**, choose **Only select repositories**, and select your new `magix-website` repository.
4. Under **Repository permissions**, grant **Contents: Read and write**. Metadata read permission is normally automatic; no broad account or workflow permissions are needed for this app.
5. Generate the token and copy it immediately into your password manager. **Do not paste it into ChatGPT, GitHub code, README, a client component, or a `NEXT_PUBLIC_` variable.**
6. Repository/org rules must allow this token owner to create commits on the branch selected below. Some organizations require token approval. For protected branches, use an approved publishing branch and adapt your deployment workflow rather than bypassing protections.

This token is for your **website server to edit products in GitHub**. It is separate from the Vercel-to-GitHub connection used to deploy code.

## D. Import the GitHub project into Vercel

1. Visit https://vercel.com/new and sign in.
2. Select **Add New > Project**, connect your GitHub account using Vercel's GitHub integration, select `magix-website`, and choose **Import**.
3. For this extracted ZIP, set **Root Directory** to `./` (repository root), **Framework Preset** to `Next.js` (normally detected), and keep the default build and output settings.
4. Set Node.js version to a supported version (Node.js 22 is compatible with this project) if the project setting requires a choice.
5. Under **Environment Variables**, create the following **server-only** variables. Apply them to **Production** for the first launch (and a carefully isolated Preview environment only if necessary). Replace every placeholder value:

   | Name | Example / value |
   |---|---|
   | `MAGIX_ADMIN_USERNAME` | `magix-admin` (choose your own) |
   | `MAGIX_ADMIN_PASSWORD` | A long, random, unique password |
   | `MAGIX_SESSION_SECRET` | At least 32 random characters |
   | `GITHUB_MAGIX_REPO` | `YOUR_GITHUB_USERNAME/magix-website` |
   | `GITHUB_MAGIX_TOKEN` | Your fine-grained GitHub token |
   | `GITHUB_MAGIX_BRANCH` | `main` |
   | `GITHUB_MAGIX_PATH` | `data/catalog.json` |
   | `GITHUB_MAGIX_UPLOAD_PATH` | `data/uploads` |

   **Never** prepend `NEXT_PUBLIC_` to secret variable names. The app reads these values only on the server. Example to create a strong session secret in a local Node terminal: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
6. Select **Deploy**. Wait for Vercel to show a successful deployment and open the generated `https://...vercel.app` address. If you added or changed variables after the initial deployment, **redeploy** the project; environment changes do not rewrite an already built deployment.

## E. Use the live product manager

1. Open `https://YOUR-VERCEL-SITE.vercel.app/admin`, or choose **Manage products** from the Products page.
2. Log in using `MAGIX_ADMIN_USERNAME` / `MAGIX_ADMIN_PASSWORD`, **not** your GitHub login or token.
3. Add or edit a product (product name, category, code, price, description, specifications, image), then select **Stage product / Stage changes**.
4. Use **Preview changes**, then click **Apply changes**. The website validates the updates, uploads any optimized WebP images to `data/uploads/` through GitHub, and commits the merged `data/catalog.json`.
5. Visit `/products`, the appropriate category, and the product page. The public catalogue is read dynamically from GitHub, so successful changes should become visible without waiting for a redeployment (although a GitHub commit may independently trigger a Vercel deployment).
6. To remove a product from public view use **Hide** rather than deleting repository records; use **Restore** to show it again.

## F. Verify in production before launch

- Homepage, Products, all seven category pages, product details, About, Contact, downloads, and QR images work.
- `/admin` rejects incorrect passwords, accepts correct credentials, and supports logout.
- Add a test product with a new image, publish it, verify it appears publicly, edit it, hide it, and restore it.
- In GitHub, confirm `data/catalog.json` and `data/uploads/<uuid>.webp` have the new commits.
- Refresh the admin after a second editor changes the catalogue: outdated edits should be rejected with a conflict, not overwrite concurrent changes.
- Check Vercel **Logs** if a request returns a 503 error. Review on both desktop and mobile.

## G. Common problems

| Symptom | Check |
|---|---|
| `Admin login is not configured` | All three `MAGIX_ADMIN_*` variables exist in the environment for the deployed version; the session secret is 32+ characters. Redeploy. |
| `Production editing requires...` | Both `GITHUB_MAGIX_REPO` and `GITHUB_MAGIX_TOKEN` are set in Vercel. Redeploy. |
| `GitHub read failed (401/403/404)` | Repository spelling and ownership, selected token repository, Contents permission, token expiry, selected branch, and `data/catalog.json`. GitHub may return 404 for unauthorized private repositories. |
| `GitHub write failed (403)` | Contents permission, branch protection/rulesets, organization approval, and token owner repository write access. |
| `GitHub rejected the update...` | Another change was committed. Click **Refresh published**, review staged work, and retry. |
| Live page shows an old catalogue with a warning | GitHub API is unavailable or misconfigured; app falls back to its bundled snapshot. Fix the connection rather than editing the bundled snapshot. |
| Uploaded image fails | Check GitHub commit in `data/uploads`, valid WebP after browser optimization, and the private image API request `/api/media/<uuid>.webp`. |
| Repository does not appear in Vercel | Configure Vercel's GitHub App permission to access the repository. Personal account repository imports usually require being its owner. |
| Build fails | Confirm the **project root is the directory containing `package.json`**, framework Next.js, no stale build overrides, and install dependencies with `npm ci`. |

## Notes on production design

- This is a small catalogue content store, not a transactional database, ordering system, or inventory/stock management system.
- GitHub API image reads and writes have rate limits. For high traffic or many product images, migrate images to Vercel Blob or another object store, and consider database/CMS storage.
- A GitHub Contents write is one commit per product image and one for the catalogue, so product publishing is not a multi-file atomic transaction.
- Admin login rate limiting in this starter is in-memory per server instance; for a publicly accessible admin, add Vercel Firewall/WAF or durable, distributed rate limiting.
- Token expiry or rotation requires updating `GITHUB_MAGIX_TOKEN` in Vercel and deploying the updated environment.

Official references:
- Vercel deployment: https://vercel.com/docs/git
- Vercel environment variables: https://vercel.com/docs/environment-variables
- GitHub Contents API permissions: https://docs.github.com/en/rest/repos/contents
- GitHub fine-grained token setup: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
