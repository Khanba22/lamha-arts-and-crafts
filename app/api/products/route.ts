import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    // Fetch products excluding heavy binary image buffers to keep JSON payload ultra-fast
    const products = await Product.find(
      {},
      {
        name: 1,
        price: 1,
        discount_price: 1,
        tag: 1,
        category: 1,
        occasions: 1,
        one_liner: 1,
        description: 1,
        highlighted: 1,
        inventory_size: 1,
        imageCount: { $size: { $ifNull: ["$images", []] } },
      }
    ).lean();

    const transformedProducts = products.map((prod) => {
      const { _id, highlighted, inventory_size, imageCount, ...rest } = prod as unknown as {
        _id: { toString: () => string };
        highlighted?: boolean;
        inventory_size?: number;
        imageCount?: number;
      };
      const count = typeof imageCount === "number" ? imageCount : 0;
      const idStr = _id.toString();

      // Generate cached CDN-ready URLs for each image
      const formattedImages = Array.from(
        { length: count },
        (_, i) => `/api/images/${idStr}/${i}`
      );

      return {
        id: idStr,
        ...rest,
        highlighted: Boolean(highlighted),
        inventory_size: typeof inventory_size === "number" ? inventory_size : 0,
        images: formattedImages,
      };
    });

    return NextResponse.json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts,
    });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
