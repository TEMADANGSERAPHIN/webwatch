import { NextRequest, NextResponse } from "next/server";
import { getAllSites, pushSnapshot, getLatestSnapshots, pushChange, updateSiteStatus } from "@/lib/db";
import { scrapeUrl, computeTextDiff, CHANGE_THRESHOLD } from "@/lib/scraper";
import { analyzeChanges } from "@/lib/analyzer";

// This endpoint can be triggered by Vercel Cron (vercel.json) or any scheduler.
// Protect it with a secret token in production.

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getAllSites();
  if (!sites.length) {
    return NextResponse.json({ success: true, data: { processed: 0 } });
  }

  const results = await Promise.allSettled(
    sites.map(async (site) => {
      const now = new Date().toISOString();
      try {
        await updateSiteStatus(site.id, "checking", now);
        const newContent = await scrapeUrl(site.url);
        const previousSnaps = await getLatestSnapshots(site.id, 1);
        const newSnap = await pushSnapshot(site.id, newContent);

        if (previousSnaps.length === 0) {
          await updateSiteStatus(site.id, "ok", now);
          return { id: site.id, status: "init" };
        }

        const diffScore = computeTextDiff(previousSnaps[0].content, newContent);
        const hasChanges = diffScore >= CHANGE_THRESHOLD;

        if (hasChanges) {
          let summary: string;
          try {
            summary = await analyzeChanges(site.url, previousSnaps[0].content, newContent);
          } catch {
            summary = `Changements détectés (différence de ${Math.round(diffScore * 100)}%).`;
          }
          await pushChange(site.id, summary, true, previousSnaps[0].id, newSnap.id);
          await updateSiteStatus(site.id, "changed", now, now);
          return { id: site.id, status: "changed" };
        } else {
          await updateSiteStatus(site.id, "ok", now);
          return { id: site.id, status: "ok" };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        await updateSiteStatus(site.id, "error", now);
        await pushChange(site.id, `Erreur : ${msg}`, false);
        return { id: site.id, status: "error", error: msg };
      }
    })
  );

  const summary = results.map((r) =>
    r.status === "fulfilled" ? r.value : { status: "error", error: String(r.reason) }
  );

  return NextResponse.json({
    success: true,
    data: {
      processed: sites.length,
      results: summary,
      runAt: new Date().toISOString(),
    },
  });
}

// Also support GET for simple health-check pings from schedulers
export async function GET(req: NextRequest) {
  return POST(req);
}
