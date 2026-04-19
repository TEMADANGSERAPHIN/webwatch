import { NextRequest, NextResponse } from "next/server";
import { getSiteById, pushSnapshot, getLatestSnapshots, pushChange, updateSiteStatus } from "@/lib/db";
import { scrapeUrl, computeTextDiff, CHANGE_THRESHOLD } from "@/lib/scraper";
import { analyzeChanges, generateInitialSummary } from "@/lib/analyzer";

export async function POST(req: NextRequest) {
  try {
    const { siteId } = await req.json();

    if (!siteId) {
      return NextResponse.json({ success: false, error: "siteId manquant" }, { status: 400 });
    }

    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ success: false, error: "Site introuvable" }, { status: 404 });
    }

    await updateSiteStatus(siteId, "checking", new Date().toISOString());

    let newContent: string;
    try {
      newContent = await scrapeUrl(site.url);
    } catch (scrapeError) {
      const errMsg = scrapeError instanceof Error ? scrapeError.message : "Erreur de scraping";
      await updateSiteStatus(siteId, "error", new Date().toISOString());
      await pushChange(siteId, `Erreur de scraping : ${errMsg}`, false);
      return NextResponse.json({ success: false, error: errMsg }, { status: 502 });
    }

    const previousSnaps = await getLatestSnapshots(siteId, 1);
    const newSnap = await pushSnapshot(siteId, newContent);
    const now = new Date().toISOString();

    // Premier scraping - pas de comparaison possible
    if (previousSnaps.length === 0) {
      let summary: string;
      try {
        summary = await generateInitialSummary(site.url, newContent);
      } catch {
        summary = "Premier snapshot enregistré avec succès.";
      }
      await pushChange(siteId, `Surveillance démarrée. ${summary}`, false, undefined, newSnap.id);
      await updateSiteStatus(siteId, "ok", now);
      return NextResponse.json({
        success: true,
        data: { siteId, hasChanges: false, summary, checkedAt: now },
      });
    }

    const previousContent = previousSnaps[0].content;
    const diffScore = computeTextDiff(previousContent, newContent);
    const hasChanges = diffScore >= CHANGE_THRESHOLD;

    let summary: string;
    if (hasChanges) {
      try {
        summary = await analyzeChanges(site.url, previousContent, newContent);
      } catch {
        summary = `Changements détectés (différence de ${Math.round(diffScore * 100)}% du contenu). Analyse IA indisponible.`;
      }
      await pushChange(siteId, summary, true, previousSnaps[0].id, newSnap.id);
      await updateSiteStatus(siteId, "changed", now, now);
    } else {
      summary = "Aucun changement significatif détecté.";
      await updateSiteStatus(siteId, "ok", now);
    }

    return NextResponse.json({
      success: true,
      data: { siteId, hasChanges, summary, checkedAt: now },
    });
  } catch (error) {
    console.error("[POST /api/scrape]", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
