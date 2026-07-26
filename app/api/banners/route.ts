// /app/api/banners/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.collection("banners").find({}).toArray();
    const banners = rows.map((row) => ({ ...row, _id: String(row._id) }));
    return NextResponse.json(banners);
  } catch (err) {
    console.error("API /banners error:", err);
    return NextResponse.json({ error: "No se pudieron cargar los banners" }, { status: 500 });
  }
}
