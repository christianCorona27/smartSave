import { jsonResponse, readPublicProductPage } from "./lib/page-reader.mts";

export default async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const requestUrl = new URL(req.url);
  const rawUrl = requestUrl.searchParams.get("url") || "";

  try {
    const result = await readPublicProductPage(rawUrl);
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Unable to inspect that URL."
    }, 400);
  }
};

export const config = {
  path: "/api/link-preview"
};
