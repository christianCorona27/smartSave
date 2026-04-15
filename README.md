# PricePilot Compare

PricePilot Compare is a lightweight static web app for comparing products and services while factoring in common eligibility discounts for students, seniors, and service members.

## Live Demo

[PricePilot Compare](https://christianCorona27.github.io/pricepilot-compare-app/)

## Features

- Compare products and services in one interface
- Toggle student, senior, and service member discount profiles
- Automatically apply the single best eligible discount per offer
- Search, filter, and sort offers by price or savings
- Add custom offers locally in the browser
- Persist custom offers with local storage

## Preview

### Desktop

![Desktop preview](preview/desktop.png)

### Mobile

![Mobile preview](preview/mobile.png)

## Files

- `index.html` - app structure and UI markup
- `styles.css` - layout, visual design, and responsive behavior
- `script.js` - sample data, filtering, discount logic, and rendering

## Run Locally

Since this is a static app, you can open `index.html` directly in a browser.

If you prefer a local server, you can use any simple static server, for example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## How It Works

1. Choose whether the shopper is a student, senior, or service member.
2. Browse the sample offers or add your own.
3. Search, filter, and sort the list.
4. The app calculates the final price by applying the best single eligible discount.

## Notes

- Discounts do not stack
- Custom offers are stored locally in the browser
- The included sample data is demo data and can be replaced easily

