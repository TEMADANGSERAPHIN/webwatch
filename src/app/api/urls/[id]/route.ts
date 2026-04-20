import { NextRequest, NextResponse } from "next/server";
import { deleteSite, getSiteById } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await getSiteById(id);
    if (!site) {
      return NextResponse.json({ success: false, error: "Site introuvable" }, { status: 404 });
    }
    await deleteSite(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/urls/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
