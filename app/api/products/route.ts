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
        updatedAt: 1,
        imageCount: { $size: { $ifNull: ["$images", []] } },
      }
    ).lean();

    const transformedProducts = products.map((prod) => {
      const { _id, highlighted, inventory_size, imageCount, updatedAt, ...rest } = prod as unknown as {
        _id: { toString: () => string };
        highlighted?: boolean;
        inventory_size?: number;
        imageCount?: number;
        updatedAt?: Date | string;
      };
      const count = typeof imageCount === "number" ? imageCount : 0;
      const idStr = _id.toString();
      const version = updatedAt ? new Date(updatedAt).getTime() : Date.now();

      // Generate versioned URLs for each image to bust stale browser cache upon reordering
      const formattedImages = Array.from(
        { length: count },
        (_, i) => `/api/images/${idStr}/${i}?v=${version}`
      );

      return {
        id: idStr,
        ...rest,
        highlighted: Boolean(highlighted),
        inventory_size: typeof inventory_size === "number" ? inventory_size : 0,
        images: formattedImages,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: transformedProducts.length,
        data: transformedProducts,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      discount_price,
      tag,
      category,
      occasions,
      one_liner,
      description,
      highlighted,
      inventory_size,
      imagesData,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      );
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json(
        { success: false, error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Process image buffers from base64
    const imagesBuffers: Buffer[] = [];
    if (Array.isArray(imagesData)) {
      for (const item of imagesData) {
        if (item && typeof item.base64 === "string" && item.base64) {
          const cleanBase64 = item.base64.replace(/^data:image\/\w+;base64,/, "");
          imagesBuffers.push(Buffer.from(cleanBase64, "base64"));
        } else if (typeof item === "string" && item) {
          const cleanBase64 = item.replace(/^data:image\/\w+;base64,/, "");
          imagesBuffers.push(Buffer.from(cleanBase64, "base64"));
        }
      }
    }

    const sanitizedOccasions = Array.isArray(occasions)
      ? occasions.map((o: unknown) => String(o).trim()).filter(Boolean)
      : [];

    const newProduct = new Product({
      name: String(name).trim(),
      price: Number(price),
      discount_price: discount_price !== undefined ? Number(discount_price) : 0,
      tag: tag ? String(tag).trim() : "",
      category: String(category).trim(),
      occasions: sanitizedOccasions,
      images: imagesBuffers,
      one_liner: one_liner ? String(one_liner).trim() : "",
      description: description ? String(description).trim() : "",
      highlighted: Boolean(highlighted),
      inventory_size: inventory_size !== undefined ? Number(inventory_size) : 0,
    });

    const saved = await newProduct.save();
    const idStr = saved._id.toString();
    const version = saved.updatedAt ? new Date(saved.updatedAt).getTime() : Date.now();

    const formattedImages = Array.from(
      { length: imagesBuffers.length },
      (_, i) => `/api/images/${idStr}/${i}?v=${version}`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: idStr,
          name: saved.name,
          price: saved.price,
          discount_price: saved.discount_price,
          tag: saved.tag,
          category: saved.category,
          occasions: saved.occasions,
          one_liner: saved.one_liner,
          description: saved.description,
          highlighted: saved.highlighted,
          inventory_size: saved.inventory_size,
          images: formattedImages,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
