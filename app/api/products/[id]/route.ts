import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findById(id, {
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
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const { _id, highlighted, inventory_size, imageCount, updatedAt, ...rest } = product as unknown as {
      _id: { toString: () => string };
      highlighted?: boolean;
      inventory_size?: number;
      imageCount?: number;
      updatedAt?: Date | string;
    };

    const count = typeof imageCount === "number" ? imageCount : 0;
    const idStr = _id.toString();
    const version = updatedAt ? new Date(updatedAt).getTime() : Date.now();

    const formattedImages = Array.from(
      { length: count },
      (_, i) => `/api/images/${idStr}/${i}?v=${version}`
    );

    return NextResponse.json({
      success: true,
      data: {
        id: idStr,
        ...rest,
        highlighted: Boolean(highlighted),
        inventory_size: typeof inventory_size === "number" ? inventory_size : 0,
        images: formattedImages,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching product by ID:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

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

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (price !== undefined) updateData.price = Number(price);
    if (discount_price !== undefined) updateData.discount_price = Number(discount_price);
    if (tag !== undefined) updateData.tag = String(tag).trim();
    if (category !== undefined) updateData.category = String(category).trim();
    if (occasions !== undefined) {
      updateData.occasions = Array.isArray(occasions)
        ? occasions.map((o: unknown) => String(o).trim()).filter(Boolean)
        : [];
    }
    if (one_liner !== undefined) updateData.one_liner = String(one_liner).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (highlighted !== undefined) updateData.highlighted = Boolean(highlighted);
    if (inventory_size !== undefined) updateData.inventory_size = Number(inventory_size);

    // Handle reordered and newly uploaded images if provided
    if (Array.isArray(imagesData)) {
      const currentDoc = await Product.findById(id);
      if (currentDoc) {
        const currentImages = currentDoc.images || [];
        const newImagesBuffers: Buffer[] = [];

        for (const item of imagesData) {
          if (item && item.type === "existing" && typeof item.index === "number") {
            const raw = currentImages[item.index];
            if (raw) {
              newImagesBuffers.push(raw);
            }
          } else if (item && item.type === "new" && typeof item.base64 === "string") {
            const cleanBase64 = item.base64.replace(/^data:image\/\w+;base64,/, "");
            newImagesBuffers.push(Buffer.from(cleanBase64, "base64"));
          }
        }

        updateData.images = newImagesBuffers;
      }
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found to update" },
        { status: 404 }
      );
    }

    const { _id, images, updatedAt, ...rest } = updated as unknown as {
      _id: { toString: () => string };
      images?: unknown[];
      updatedAt?: Date | string;
    };
    const count = Array.isArray(images) ? images.length : 0;
    const idStr = _id.toString();
    const version = updatedAt ? new Date(updatedAt).getTime() : Date.now();

    const formattedImages = Array.from(
      { length: count },
      (_, i) => `/api/images/${idStr}/${i}?v=${version}`
    );

    return NextResponse.json({
      success: true,
      data: {
        id: idStr,
        ...rest,
        images: formattedImages,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

