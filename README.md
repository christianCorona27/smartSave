# SmartSave

SmartSave is a focused price-tracking web app. The real workflow is intentionally narrow:

1. A user pastes a public product URL.
2. SmartSave extracts title, price, image, source, and metadata from the page when available.
3. The user confirms the price, enters a target price, and adds an email address.
4. The backend stores the tracker in Netlify Blobs.
5. A scheduled Netlify Function re-fetches the public page.
6. SmartSave sends an email alert through Resend when the latest readable price meets the target.

Seeded product, service, vehicle, and APR examples are still included so the interface is easy to browse, but they are clearly labeled as demo-only data.

## Live Demo

- Netlify app: [SmartSave on Netlify](https://smartsave-compare.netlify.app/)
- GitHub Pages static fallback: [SmartSave](https://christiancorona27.github.io/smartSave/)
- Repository: [christianCorona27/smartSave](https://github.com/christianCorona27/smartSave)

Use the Netlify app for backend routes. GitHub Pages can show the static UI, but it cannot run URL extraction, tracker storage, scheduled checks, or email alerts.

## What Is Real

- `GET /api/link-preview?url=...` reads a public product page and extracts reusable metadata.
- `POST /api/track-url` validates the URL, email, and target price, re-checks the page, and stores the tracker.
- `price-alert-sweep` runs hourly on Netlify published deploys and re-fetches stored tracker URLs.
- Netlify Blobs stores tracker records and compact price history.
- Resend sends email alerts when the latest readable price is at or below the target.

## Demo-Only Data

The browseable catalog is seeded so judges and testers can explore the UI without needing to paste URLs first. These examples are not live data:

- Retailer comparisons
- Service-provider comparisons
- Student, senior, service-member, and coupon assumptions
- Vehicle and dealership examples
- Home APR examples
- ZIP-based local matching
- Bulk and reorder helpers
- Seeded price-history charts

These are useful UI demonstrations, not claims of real retailer, lender, dealership, or coupon integrations.

## Current Features

- Public product URL input
- Safe server-side URL validation that blocks private/local hosts
- Title, price, image, description, hostname, currency, and confidence extraction
- User-confirmed title and current price before saving
- Target price and email capture
- Backend tracker storage with Netlify Blobs
- Hourly scheduled price refresh
- Email alert when the target is met
- Local saved-watch display in the browser
- Demo catalog search, filters, category dropdowns, and price-history visualization
- Clear labels separating live URL trackers from demo-only examples
- Mobile-responsive blue-black UI with product imagery and source badges

## API Routes

### `GET /api/link-preview`

Reads public HTML metadata from a product page.

Example:

```text
/api/link-preview?url=https%3A%2F%2Fexample.com%2Fproduct
```

Returns:

- `title`
- `description`
- `price`
- `currency`
- `image`
- `hostname`
- `confidence`
- `message`

### `POST /api/track-url`

Stores a live price tracker.

Expected JSON:

```json
{
  "url": "https://store.example.com/product",
  "confirmedTitle": "Example Product",
  "confirmedPrice": 199.99,
  "targetPrice": 149.99,
  "email": "you@example.com"
}
```

The backend re-fetches the URL before storing the tracker. If the page does not expose a reusable price, the API returns a clear error instead of creating a fake live tracker.

### Scheduled Function

`netlify/functions/price-alert-sweep.mts` runs hourly on Netlify published deploys. It reads stored trackers, re-fetches each public URL, updates compact price history, and sends an email when the target is met.

## Environment Variables

Set these in Netlify for email alerts:

```text
RESEND_API_KEY=your_resend_api_key
ALERT_FROM_EMAIL=alerts@example.com
```

Without these values, trackers can be stored, but email delivery will not be sent.

## Run Locally

Static-only preview:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-website.ps1
```

Then open `http://localhost:5173/`.

Backend-enabled local development:

```powershell
npm install
npm run dev
```

Use the Netlify dev URL for `/api/link-preview` and `/api/track-url`.

## Files

- `index.html` - focused URL tracker UI, demo catalog layout, templates, and accessibility structure
- `styles.css` - blue-black visual identity, responsive layout, tracker panels, catalog cards, and mobile behavior
- `script.js` - frontend state, URL extraction flow, target capture, demo catalog behavior, and backend tracker sync
- `netlify/functions/link-preview.mts` - public URL metadata extraction endpoint
- `netlify/functions/track-url.mts` - tracker creation endpoint
- `netlify/functions/price-alert-sweep.mts` - hourly scheduled refresh and alert processor
- `netlify/functions/lib/page-reader.mts` - shared public-page reader and metadata parser
- `netlify/functions/lib/alerts.mts` - tracker storage, email validation, and Resend delivery helpers
- `netlify/functions/local-match.mts` - demo-only ZIP matching endpoint
- `netlify/functions/lib/provider-directory.mts` - demo-only local provider directory
- `netlify.toml` - Netlify Functions configuration
- `.env.example` - required email environment variables

## Limitations

- Some major retailers block automated reads or render prices only after JavaScript, login, location selection, or cart state.
- SmartSave reads public metadata only; it does not bypass paywalls, private pages, bot protection, carts, or account-only pricing.
- Email alerts depend on Netlify scheduled functions and configured Resend credentials.
- Demo catalog prices and histories are seeded examples, not live market data.
- The app does not purchase products, apply coupons, reserve inventory, or guarantee checkout price.

## Future Features

- User accounts so trackers sync across devices.
- Official retailer API adapters for a small set of supported stores.
- Tracker detail pages with backend price-history charts.
- Optional SMS alerts after email alerts are stable.
- Browser extension or bookmarklet for saving product pages faster.
