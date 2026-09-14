import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  try {
    const { id, index } = await params;
    const imageIndex = parseInt(index, 10);

    if (!mongoose.Types.ObjectId.isValid(id) || isNaN(imageIndex) || imageIndex < 0) {
      return new Response("Invalid image parameters", { status: 400 });
    }

    await connectDB();

    // Query only the requested image buffer using $slice
    const product = await Product.findById(id, {
      images: { $slice: [imageIndex, 1] },
    }).lean();

    if (!product || !product.images || product.images.length === 0) {
      return new Response("Image not found", { status: 404 });
    }

    const raw = product.images[0];
    let buf: Buffer;

    if (Buffer.isBuffer(raw)) {
      buf = raw;
    } else if (
      raw &&
      typeof raw === "object" &&
      "buffer" in raw &&
      Buffer.isBuffer((raw as { buffer: unknown }).buffer)
    ) {
      buf = (raw as { buffer: Buffer }).buffer;
    } else {
      buf = Buffer.from(raw as string | Uint8Array);
    }

    let mime = "image/webp";
    if (buf.length > 4) {
      if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
        mime = "image/png";
      } else if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
        mime = "image/jpeg";
      } else if (
        buf[0] === 0x52 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x46
      ) {
        mime = "image/webp";
      }
    }

    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: unknown) {
    console.error("Error serving image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
