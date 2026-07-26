import Image from "next/image";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import AddToCartButton from "@/app/components/AddToCartButton";

export const dynamic = "force-dynamic";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  image: string;
  category?: string;
  shippingDays?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  try {
    const db = await getDb();
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) });

    if (!product) {
      return null;
    }

    return {
      _id: String(product._id),
      name: typeof product.title === "string" ? product.title : typeof product.name === "string" ? product.name : "Producto",
      description: typeof product.description === "string" ? product.description : undefined,
      price: typeof product.price === "number" ? product.price : 0,
      comparePrice: typeof product.comparePrice === "number" ? product.comparePrice : undefined,
      image: typeof product.image === "string" ? product.image : "/placeholder-product.png",
      category: typeof product.category === "string" ? product.category : undefined,
      shippingDays: typeof product.shippingDays === "string" ? product.shippingDays : "24-48 hs",
    };
  } catch (error) {
    console.error("ERROR PRODUCT PAGE:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Producto no encontrado
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10">

      <Link href="/">
        ← Volver
      </Link>

      <section className="grid md:grid-cols-2 gap-10 mt-8">

        <div className="relative h-[500px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        <div>

          <h1 className="text-4xl font-bold">
            {product.name}
          </h1>

          <p className="mt-5 text-gray-600">
            {product.description}
          </p>

          <div className="mt-6">

            {product.comparePrice && (
              <span className="line-through text-gray-400">
                ${product.comparePrice}
              </span>
            )}

            <p className="text-3xl font-bold">
              ${product.price}
            </p>

          </div>

          <p className="mt-5">
            🚚 Envío: {product.shippingDays}
          </p>

          <AddToCartButton
            item={{
              _id: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
            }}
            className="
              mt-8
              bg-black
              text-white
              px-8
              py-4
              rounded-xl
            "
          />

        </div>

      </section>

    </main>
  );
}
