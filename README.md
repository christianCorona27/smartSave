# SmartSave

SmartSave is a focused price-tracking web app for one real workflow: saving a public product URL, tracking its readable price over time, and emailing the user when the price reaches a target.

The app also includes seeded demo data so the interface can be explored without creating a live tracker. Demo data is clearly labeled and should not be interpreted as live retailer, lender, dealership, coupon, or service-provider coverage.

## Core Workflow

1. Paste a public product URL.
2. SmartSave reads the page server-side and extracts available metadata such as title, price, image, hostname, currency, and confidence level.
3. The user reviews the extracted result, confirms the price, enters a target price, and provides an email address.
4. The backend stores the tracker in Netlify Blobs.
5. A scheduled Netlify Function re-fetches the saved URL.
6. SmartSave updates the current price, appends price history, and sends an email alert when the readable price is at or below the target.

This is the production-oriented part of the project.

## Live vs Demo

### Live Features

These features use backend logic and real stored tracker records:

- Public URL metadata extraction through `GET /api/link-preview`.
- Tracker creation through `POST /api/track-url`.
- Tracker storage with Netlify Blobs.
- Scheduled URL refresh through `netlify/functions/price-alert-sweep.mts`.
- Price history updates for saved live trackers.
- Email alerts through Resend when configured.
- Confidence labels for extracted prices:
  - High confidence: structured product metadata was found.
  - Medium confidence: a price candidate was found, but the user should confirm it.
  - Low confidence: manual confirmation is required.

### Demo Features

These are included for browsing, presentation, and UI testing only:

- Seeded product and service comparison cards.
- Demo retailer/provider names.
- Demo student, senior, service-member, and coupon assumptions.
- Demo vehicle/dealership and home APR examples.
- Demo ZIP-based local matching.
- Demo bulk/reorder planning helpers.
- Seeded historical price charts.

Demo examples are not connected to live retailer APIs, lender APIs, dealership inventory, coupon systems, or real-time provider feeds.

## What SmartSave Does Not Claim

SmartSave does not provide full real-time coverage across Amazon, Walmart, Target, Best Buy, dealerships, lenders, or service providers. Many sites block automated reads, hide prices behind JavaScript, require location selection, require account login, or change prices at checkout.

SmartSave reads public product-page metadata when available. If a page cannot be read reliably, the app surfaces that limitation instead of pretending live data exists.

## Current Features

- Public product URL input.
- Server-side URL validation for public pages.
- Title, price, image, description, hostname, currency, and confidence extraction.
- User confirmation before saving a tracker.
- Target price and email capture.
- Netlify Blobs tracker storage.
- Scheduled price refresh.
- Email alert when target price is met.
- Compact price history visualization.
- Recent tracked price points.
- Clear `Live Tracker`, `Demo Data`, and `Refresh Failed` badges.
- Personalized savings display for demo comparisons.
- Mobile-friendly dark navy UI.

## API Routes

### `GET /api/link-preview`

Reads public product-page metadata.

Example:

```text
/api/link-preview?url=https%3A%2F%2Fexample.com%2Fproduct
```

Typical response fields:

- `ok`
- `url`
- `hostname`
- `title`
- `description`
- `price`
- `currency`
- `image`
- `confidence`
- `message`

### `POST /api/track-url`

Creates a saved live tracker.

Example payload:

```json
{
  "url": "https://store.example.com/product",
  "confirmedTitle": "Example Product",
  "confirmedPrice": 199.99,
  "targetPrice": 149.99,
  "email": "you@example.com"
}
```

The backend re-fetches the URL before storing the tracker. If the page does not expose a readable price, the API returns an error rather than creating a fake live tracker.

### `GET /api/track-url`

Reads a stored tracker when given a tracker id and matching email. This lets the frontend refresh live tracker price history after scheduled backend checks.

Example:

```text
/api/track-url?id=tracker%2Fabc123&email=you%40example.com
```

## Scheduled Refresh

`netlify/functions/price-alert-sweep.mts` runs hourly on published Netlify deploys. It:

- Loads stored trackers from Netlify Blobs.
- Re-fetches each saved public URL.
- Updates title, image, current price, confidence, and status when available.
- Appends to `priceHistory`.
- Records refresh failures without stopping the full sweep.
- Sends an email alert when `currentPrice <= targetPrice` and the user has not already been alerted for that price.

## Environment Variables

Email alerts require these Netlify environment variables:

```text
RESEND_API_KEY=your_resend_api_key
ALERT_FROM_EMAIL=alerts@example.com
```

Without these values, trackers can still be stored and refreshed, but email delivery will not be sent.

## Run Locally

Install dependencies:

```powershell
npm install
```

Run a static-only preview:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-website.ps1
```

Run with Netlify Functions locally:

```powershell
npm run dev
```

Use the Netlify dev URL when testing `/api/link-preview` and `/api/track-url`.

## Build

```powershell
npm run build
```

The build writes static files to `dist/`. Netlify is configured to publish `dist` and bundle functions from `netlify/functions`.

## Project Structure

- `index.html` - application layout, live tracker entry point, demo catalog, and templates.
- `styles.css` - dark navy visual system, responsive layout, cards, badges, and chart styling.
- `script.js` - frontend state, live tracker flow, demo catalog behavior, price history rendering, and backend sync.
- `scripts/build.mjs` - static build script that writes the publishable app to `dist/`.
- `netlify/functions/link-preview.mts` - public URL metadata preview endpoint.
- `netlify/functions/track-url.mts` - tracker create/read endpoint.
- `netlify/functions/price-alert-sweep.mts` - scheduled tracker refresh and alert processor.
- `netlify/functions/lib/page-reader.mts` - shared public-page fetch and metadata parsing logic.
- `netlify/functions/lib/alerts.mts` - tracker storage, validation, and Resend email helpers.
- `netlify/functions/local-match.mts` - demo-only ZIP matching endpoint.
- `netlify/functions/lib/provider-directory.mts` - demo-only provider directory.
- `netlify.toml` - Netlify build and functions configuration.
- `.env.example` - example email environment variables.

## Limitations

- Public-page extraction depends on what the source site exposes in HTML metadata.
- JavaScript-rendered prices, account-only prices, cart prices, location-specific prices, and bot-protected pages may not be readable.
- SmartSave does not bypass authentication, anti-bot controls, paywalls, private networks, or checkout flows.
- Email delivery requires configured Resend credentials.
- Demo prices, discounts, APRs, and provider matches are seeded examples.
- The app does not purchase products, reserve inventory, apply coupons at checkout, or guarantee final checkout price.

## Future Features

- Retailer API integrations for a small number of officially supported stores.
- Browser extension for saving product pages directly while shopping.
- Expanded provider network with clear source labels and integration status.
- Smarter deal scoring that weighs price confidence, shipping, eligibility, fees, and history.
- Multi-item optimization for comparing carts, bundles, and recurring purchases.
