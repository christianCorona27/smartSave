const MAX_RESPONSE_CHARS = 250_000;
const REQUEST_TIMEOUT_MS = 9_000;

export interface ProductPageResult {
  ok: boolean;
  url: string;
  hostname: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  image: string;
  confidence: "high" | "medium" | "low";
  message: string;
  status?: number;
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    return true;
  }
  if (host === "::1" || host === "0.0.0.0") {
    return true;
  }
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) {
    return true;
  }
  const private172 = host.match(/^172\.(\d{1,2})\./);
  return Boolean(private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31);
}

export function parsePublicUrl(rawUrl: string) {
  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    throw new Error("Paste a valid http or https URL.");
  }

  if (!["http:", "https:"].includes(target.protocol) || isBlockedHost(target.hostname)) {
    throw new Error("Only public http or https product pages can be checked.");
  }

  target.hash = "";
  return target;
}

function cleanText(value?: string | null) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }
  return "";
}

export function parsePrice(value?: string | number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const match = String(value || "").replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  return match ? Number(match[1]) : null;
}

function findJsonLdPrices(html: string) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(cleanText(block[1]));
      const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length) {
        const node = queue.shift();
        if (!node || typeof node !== "object") {
          continue;
        }
        const type = Array.isArray(node["@type"]) ? node["@type"].join(" ") : String(node["@type"] || "");
        if (/Product|Offer|Service/i.test(type)) {
          const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          const price = parsePrice(offer?.price ?? offer?.lowPrice ?? node.price);
          if (price) {
            return {
              price,
              currency: cleanText(offer?.priceCurrency || node.priceCurrency || "USD"),
              title: cleanText(node.name),
              image: Array.isArray(node.image) ? node.image[0] : cleanText(node.image)
            };
          }
        }
        Object.values(node).forEach((value) => {
          if (value && typeof value === "object") {
            if (Array.isArray(value)) {
              queue.push(...value);
            } else {
              queue.push(value);
            }
          }
        });
      }
    } catch {
      // Many commerce pages include invalid JSON-LD. Continue with metadata extraction.
    }
  }
  return null;
}

async function readLimitedText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    return response.text();
  }
  const decoder = new TextDecoder();
  let output = "";
  while (output.length < MAX_RESPONSE_CHARS) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    output += decoder.decode(value, { stream: true });
  }
  return output.slice(0, MAX_RESPONSE_CHARS);
}

export async function readPublicProductPage(rawUrl: string): Promise<ProductPageResult> {
  const target = parsePublicUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(target.toString(), {
      signal: controller.signal,
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent": "SmartSave price tracker metadata reader"
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        url: target.toString(),
        hostname: target.hostname,
        title: "",
        description: "",
        price: null,
        currency: "USD",
        image: "",
        confidence: "low",
        status: response.status,
        message: `The source returned HTTP ${response.status}. Try another public product page.`
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return {
        ok: false,
        url: target.toString(),
        hostname: target.hostname,
        title: "",
        description: "",
        price: null,
        currency: "USD",
        image: "",
        confidence: "low",
        message: "This URL did not return an HTML product page."
      };
    }

    const html = await readLimitedText(response);
    const jsonLd = findJsonLdPrices(html);
    const title = jsonLd?.title || firstMatch(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<title[^>]*>([\s\S]*?)<\/title>/i
    ]);
    const description = firstMatch(html, [
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ]);
    const metaPrice = parsePrice(firstMatch(html, [
      /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']price["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ]));
    const loosePrice = parsePrice(firstMatch(html, [
      /(?:sale|current|price)[^$]{0,80}\$\s?([0-9][0-9,]*(?:\.[0-9]{2})?)/i,
      /\$\s?([0-9][0-9,]*(?:\.[0-9]{2})?)/
    ]));
    const price = jsonLd?.price || metaPrice || loosePrice;
    const image = jsonLd?.image || firstMatch(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ]);

    return {
      ok: true,
      url: target.toString(),
      hostname: target.hostname,
      title,
      description,
      price,
      currency: jsonLd?.currency || "USD",
      image,
      confidence: jsonLd?.price ? "high" : price ? "medium" : "low",
      message: price
        ? "SmartSave found a public page price candidate. Confirm it before tracking."
        : "SmartSave found page metadata, but no reliable price candidate on this page."
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      url: target.toString(),
      hostname: target.hostname,
      title: "",
      description: "",
      price: null,
      currency: "USD",
      image: "",
      confidence: "low",
      message: error instanceof Error && error.name === "AbortError"
        ? "The source took too long to respond. Try another public product page."
        : "SmartSave could not read this source. Try another public product page."
    };
  }
}

