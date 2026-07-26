import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

interface ProductSearchResult {
  _id: string;
  title?: string;
  name?: string;
  price?: number;
  image?: string;
}

export async function GET(req: NextRequest) {
  try {
    const query =
      req.nextUrl.searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const db = await getDb();

    const products = await db
      .collection("products")
      .find({
        $or: [
          {
            name: {
              $regex: query,
              $options: "i",
            },
          },
          {
            title: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      })
      .limit(10)
      .toArray();

    const results: ProductSearchResult[] = products.map((product) => ({
      _id: product._id.toString(),
      title: product.title ?? product.name ?? "Producto",
      price: product.price ?? 0,
      image:
        product.image ??
        product.images?.[0] ??
        "/placeholder-product.png",
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("API /search error:", error);

    return NextResponse.json(
      {
        error: "No se pudo realizar la búsqueda",
      },
      {
        status: 500,
      }
    );
  }
}