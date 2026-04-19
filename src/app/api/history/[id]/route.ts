import { NextRequest, NextResponse } from "next/server";
import { getSiteById, getChanges, getLatestSnapshots } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const site = await getSiteById(params.id);
    if (!site) {
      return NextResponse.json({ success: false, error: "Site introuvable" }, { status: 404 });
    }

    const [changes, snapshots] = await Promise.all([
      getChanges(params.id),
      getLatestSnapshots(params.id, 5),
    ]);

    return NextResponse.json({
      success: true,
      data: { site, changes, snapshots },
    });
  } catch (error) {
    console.error("[GET /api/history/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
