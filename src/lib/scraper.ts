if (!process.env.FIRECRAWL_API_KEY) {
  throw new Error("FIRECRAWL_API_KEY is not defined");
}

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    content?: string;
    metadata?: {
      title?: string;
      description?: string;
    };
  };
  error?: string;
}

export async function scrapeUrl(url: string): Promise<string> {
  const response = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 1000,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firecrawl error ${response.status}: ${text}`);
  }

  const result: FirecrawlResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Firecrawl returned no data");
  }

  const content = result.data.markdown || result.data.content || "";
  if (!content) {
    throw new Error("Firecrawl returned empty content");
  }

  return content;
}

export function computeTextDiff(before: string, after: string): number {
  if (!before) return 1;
  const beforeWords = new Set(before.toLowerCase().split(/\s+/));
  const afterWords = new Set(after.toLowerCase().split(/\s+/));
  const union = new Set([...beforeWords, ...afterWords]);
  const intersection = new Set([...beforeWords].filter((w) => afterWords.has(w)));
  return 1 - intersection.size / union.size;
}

export const CHANGE_THRESHOLD = 0.02; // 2% change triggers analysis
