import { NextResponse } from "next/server";
import featuredData from "@/data/featured.json";

export async function GET() {
  return NextResponse.json(featuredData);
}
