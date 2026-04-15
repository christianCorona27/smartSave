# PricePilot Compare

PricePilot Compare is a search-first comparison dashboard for products and services. It helps shoppers compare current prices, coupons, eligibility discounts, deal requirements, and price history across multiple retailers and providers in one interface.

## Live Demo

- App: [PricePilot Compare](https://christiancorona27.github.io/pricepilot-compare-app/)
- Repo: [christianCorona27/pricepilot-compare-app](https://github.com/christianCorona27/pricepilot-compare-app)

## What It Does

PricePilot Compare is built to answer a more realistic shopping question than just “what is the listed price?”

It compares:

- The same physical item across multiple retailers
- Equivalent service plans across multiple providers
- Regular price, current price, and final eligible price
- Coupons, membership discounts, and stack rules
- Deal requirements such as verification, autopay, new-customer rules, and account eligibility
- Dated price history for the currently selected item or service

## Current Features

- Search tracked products and services from one main search bar
- Filter by `All`, `Products`, or `Services`
- Sort by cheapest final price, biggest markdown, provider coverage, or name
- Compare seeded store/provider snapshots across:
- Amazon
- Best Buy
- Walmart
- Target
- AT&T Fiber
- Spectrum
- Verizon 5G Home
- Xfinity
- Google One
- Dropbox
- Microsoft 365
- iCloud+
- Toggle shopper profile modes:
- Student
- Senior
- Service Member
- Toggle coupon usage on or off
- Apply the best eligible membership discount automatically
- Stack coupons only when the provider rules allow stacking
- Show provider-by-provider requirement notes
- Show current price, regular price, and final eligible price together
- Show current markdown and total markdown
- Show history low and history high per provider
- Render a dated comparison chart for price history
- Show a detailed inspector for the currently selected item
- Responsive layout for desktop and mobile
- GitHub Pages deployment

## How Pricing Works

- `Regular price` is the baseline list price
- `Current price` is the current promoted/store snapshot price
- `Final price` is the lowest eligible price after applying:
- One membership discount at most
- One coupon when available
- Coupon stacking only if the provider explicitly allows it

Rules in the current app:

- Student, senior, and service member discounts do not stack with each other
- Coupons may stack with one membership discount only when marked `combinable`
- Requirements are shown directly on each provider card

## Data Model In This Version

This deployed version uses seeded snapshot data stored in the frontend so it can run safely as a static site.

That means:

- The UI and comparison logic are real
- The provider snapshots are demo data
- The price history is seeded history data
- No live retailer API keys are exposed in the browser

## Preview

### Desktop

![Desktop preview](preview/desktop.png)

### Mobile

![Mobile preview](preview/mobile.png)

## Files

- `index.html` - page structure, search layout, inspector, and comparison templates
- `styles.css` - visual system, layout, responsive behavior, chart framing, and provider card styling
- `script.js` - seeded dataset, pricing rules, filtering, sorting, chart rendering, and interaction logic
- `preview/desktop.png` - desktop preview image used in the README
- `preview/mobile.png` - mobile preview image used in the README

## Run Locally

Since this is a static app, you can open `index.html` directly in a browser.

If you want to use a local server instead:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Typical User Flow

1. Search for a product or equivalent service.
2. Filter to products or services if needed.
3. Choose whether the shopper is a student, senior, or service member.
4. Decide whether coupons should be included.
5. Review the tracked items list to find the best current deal.
6. Open the selected item in the inspector.
7. Compare providers, read requirements, and inspect the dated price history.

## Known Limitations

- Retailer/provider data is not live yet
- The app does not currently scrape the web in real time
- Price history is seeded, not collected automatically from a backend
- Item matching is curated rather than API-driven
- Some retailers do not expose public product APIs suitable for direct frontend use
- A static GitHub Pages app cannot safely store private API credentials

## Possible Updates Later

### Live Data

- Add real retailer/provider integrations through serverless functions or a backend
- Query official or approved APIs where available
- Add support for live web search handoff through backend search adapters
- Refresh current prices on a schedule
- Add region-aware availability and ZIP-code-specific pricing

### Price History

- Store real dated snapshots in a database
- Show 30-day, 90-day, and 1-year history ranges
- Add price alerts and threshold notifications
- Show “best time to buy” summaries

### Deals And Discounts

- Add more coupon sources and validation rules
- Support promo-code entry by the user
- Add store membership programs like Target Circle, Walmart+, and Prime-specific logic
- Add bundle discounts and trade-in value modeling
- Add financing and installment comparisons

### Search And Matching

- Add fuzzy matching for same-item SKUs across stores
- Add UPC, model number, and plan-tier matching
- Add category pages for laptops, phones, TVs, internet, streaming, cloud storage, and more
- Add saved searches and favorites

### User Experience

- Add compare-only mode for selected providers
- Add side-by-side provider diff view
- Add export to PDF or CSV
- Add shareable comparison links
- Add dark/light theme variations if wanted later

### Accounts And Automation

- Add login and saved shopper profiles
- Save discount preferences across devices
- Add recurring price checks
- Send email, SMS, or push alerts when a better deal appears

## Suggested Production Architecture

For a real live version, a good next architecture would be:

- Static or React frontend for the comparison UI
- Serverless/API layer for retailer/provider requests
- Database for normalized products, providers, requirements, and history snapshots
- Scheduled jobs for collecting and storing price history
- Optional alerts service for deal notifications

## Summary

PricePilot Compare already delivers the comparison experience, pricing logic, and history visualization layer. The biggest next upgrade is replacing seeded snapshots with live backend-powered retailer/provider data while keeping the same UI and pricing engine.
