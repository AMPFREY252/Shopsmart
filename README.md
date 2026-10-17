# ShopSmart

Single-page shop POS: sales, stock, customers, suppliers, staff, expenses, and reports. Data stays in the browser (`localStorage`). No backend.

Live site: serve `index.html` (GitHub Pages from the repo root).

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Platform owner | `super@shopsmart.com` | `super123` |
| Shop admin | `admin@kabalebest.com` | `admin123` |
| Cashier | `cashier@kabalebest.com` | `cashier123` |

Same admin/cashier passwords work on the other seeded shops (`admin@rushoroza.com`, `admin@kigeziwholesale.com`).

## Run locally

Open `index.html` in a browser, or from this folder:

```bash
npx --yes serve .
```

## Build

Source lives in `parts/`. Rebuild the hosted page after edits:

```bash
npm install
npm run build
```

That concatenates `parts/*` into `index.html` and inlines the Tailwind CSS.

## GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Deploy from branch → `main` (root).
3. Commit the built `index.html` after `npm run build`.
