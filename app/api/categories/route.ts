import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { catalogCategories } from "@/data/catalog-categories";

export async function GET() {
  try {
    const db = await getDb();

    const collections = await db.listCollections({ name: { $in: ["categories", "categorias"] } }).toArray();
    const collectionName = collections.find((collection) => collection.name === "categories")?.name ?? collections[0]?.name;

    if (collectionName) {
      const stored = await db.collection(collectionName).find({}).sort({ order: 1 }).toArray();

      if (stored.length > 0) {
        const parents = stored.filter((category) => !category.parentId);
        const categories = parents.map((parent) => ({
          ...parent,
          _id: String(parent._id),
          children: stored
            .filter((category) => String(category.parentId ?? "") === String(parent._id))
            .map((child) => ({ ...child, _id: String(child._id) })),
        }));

        return NextResponse.json({ success: true, categories });
      }
    }

    return NextResponse.json({ success: true, categories: catalogCategories });
  } catch (error) {
    console.error("Error /api/categories:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
