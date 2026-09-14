import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  discount_price: number;
  tag: string;
  category: string;
  occasions: string[];
  images: Buffer[];
  one_liner: string;
  description: string;
  highlighted: boolean;
  inventory_size: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount_price: { type: Number, default: 0 },
    tag: { type: String, default: "" },
    category: { type: String, required: true },
    occasions: { type: [String], default: [] },
    images: { type: [Buffer], default: [] },
    one_liner: { type: String, default: "" },
    description: { type: String, default: "" },
    highlighted: { type: Boolean, default: false },
    inventory_size: { type: Number, default: 0 },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
