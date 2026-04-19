import { NextRequest, NextResponse } from "next/server";
import { getAllSites, addSite } from "@/lib/db";
import { isValidUrl } from "@/lib/utils";
import { AddUrlPayload } from "@/types";

export async function GET() {
  try {
    const sites = await getAllSites();
    return NextResponse.json({ success: true, data: sites });
  } catch (error) {
    console.error("[GET /api/urls]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des sites" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: AddUrlPayload = await req.json();
    const { url, label } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: "URL manquante" }, { status: 400 });
    }

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json({ success: false, error: "URL invalide" }, { status: 400 });
    }

    const site = await addSite(normalizedUrl, label);
    return NextResponse.json({ success: true, data: site }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/urls]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'ajout du site" },
      { status: 500 }
    );
  }
}
