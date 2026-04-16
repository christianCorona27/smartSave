import type { Config } from "@netlify/functions";
import { readPublicProductPage } from "./lib/page-reader.mts";
import { getPriceTrackerStore, sendPriceAlertEmail, type PriceTracker } from "./lib/alerts.mts";

const MAX_TRACKERS_PER_RUN = 25;
const MAX_HISTORY_POINTS = 40;

function appendHistory(tracker: PriceTracker, price: number, checkedAt: string) {
  const lastPoint = tracker.priceHistory[tracker.priceHistory.length - 1];
  if (!lastPoint || lastPoint.price !== price) {
    tracker.priceHistory.push({ date: checkedAt, price });
  }
  tracker.priceHistory = tracker.priceHistory.slice(-MAX_HISTORY_POINTS);
}

export default async () => {
  const store = getPriceTrackerStore();
  const { blobs } = await store.list({ prefix: "tracker/" });
  let processed = 0;

  for (const blob of blobs) {
    if (processed >= MAX_TRACKERS_PER_RUN) {
      break;
    }
    processed += 1;

    const tracker = await store.get(blob.key, { type: "json" }) as PriceTracker | null;
    if (!tracker) {
      continue;
    }

    const checkedAt = new Date().toISOString();
    const page = await readPublicProductPage(tracker.url);

    if (!page.ok || !page.price) {
      tracker.status = page.ok ? "price-missing" : "source-error";
      tracker.updatedAt = checkedAt;
      tracker.lastCheckedAt = checkedAt;
      await store.setJSON(blob.key, tracker);
      continue;
    }

    tracker.title = page.title || tracker.title;
    tracker.description = page.description || tracker.description;
    tracker.image = page.image || tracker.image;
    tracker.currency = page.currency || tracker.currency;
    tracker.lastPrice = page.price;
    tracker.lastConfidence = page.confidence;
    tracker.status = "tracking";
    tracker.updatedAt = checkedAt;
    tracker.lastCheckedAt = checkedAt;
    appendHistory(tracker, page.price, checkedAt);

    const alreadyAlertedForPrice = tracker.lastAlertedPrice === tracker.lastPrice;
    if (tracker.lastPrice <= tracker.targetPrice && !alreadyAlertedForPrice) {
      const emailSent = await sendPriceAlertEmail(tracker);
      if (emailSent) {
        tracker.status = "alerted";
        tracker.lastAlertedAt = checkedAt;
        tracker.lastAlertedPrice = tracker.lastPrice;
      }
    }

    await store.setJSON(blob.key, tracker);
  }

  console.log(`SmartSave price sweep processed ${processed} tracker(s).`);
};

export const config: Config = {
  schedule: "@hourly"
};
