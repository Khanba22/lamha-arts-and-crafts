"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Check,
  Plus,
  Sparkles,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Star,
  AlertCircle,
  PackagePlus,
} from "lucide-react";
import { ProductItem } from "@/context/ProductsContext";

const POPULAR_OCCASIONS = [
  "Diwali",
  "Pooja",
  "Wedding",
  "Housewarming",
  "Haldi Kumkum",
  "Ganesh Chaturthi",
  "Navratri",
  "Raksha Bandhan",
  "Trousseau Packing",
  "Return Gifts",
];

const POPULAR_TAGS = ["BESTSELLER", "NEW", "FESTIVE", "HANDMADE", "EXCLUSIVE", "LIMITED"];

interface ImageUploadItem {
  id: string;
  url: string; // Base64 data URL
  name: string;
  size: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (newProduct: ProductItem) => void;
  existingCategories: string[];
  existingTags: string[];
}

export default function AddProductModal({
  isOpen,
  onClose,
  onProductCreated,
  existingCategories,
  existingTags,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [inventorySize, setInventorySize] = useState("10");

  const [category, setCategory] = useState(
    existingCategories.length > 0 ? existingCategories[0] : "Toran"
  );
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [tag, setTag] = useState("");
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const [occasions, setOccasions] = useState<string[]>([]);
  const [customOccasionInput, setCustomOccasionInput] = useState("");

  const [oneLiner, setOneLiner] = useState("");
  const [description, setDescription] = useState("");
  const [highlighted, setHighlighted] = useState(false);

  const [imagesList, setImagesList] = useState<ImageUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  // Reset form
  const handleReset = () => {
    setName("");
    setPrice("");
    setDiscountPrice("");
    setInventorySize("10");
    setCategory(existingCategories.length > 0 ? existingCategories[0] : "Toran");
    setIsCustomCategory(false);
    setCustomCategory("");
    setTag("");
    setIsCustomTag(false);
    setCustomTag("");
    setOccasions([]);
    setCustomOccasionInput("");
    setOneLiner("");
    setDescription("");
    setHighlighted(false);
    setImagesList([]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Image Processing Helpers
  const processFiles = async (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    const newItems: ImageUploadItem[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: `upload-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        url: base64,
        name: file.name,
        size: file.size,
      });
    }

    setImagesList((prev) => [...prev, ...newItems]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagesList.length) return;
    const list = [...imagesList];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setImagesList(list);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    handleMoveImage(index, 0);
  };

  // Occasions handling
  const handleToggleOccasion = (occ: string) => {
    setOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const handleAddCustomOccasion = () => {
    const trimmed = customOccasionInput.trim();
    if (!trimmed) return;
    if (!occasions.includes(trimmed)) {
      setOccasions((prev) => [...prev, trimmed]);
    }
    setCustomOccasionInput("");
  };

  const handleRemoveOccasion = (occ: string) => {
    setOccasions((prev) => prev.filter((o) => o !== occ));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage("Please provide a valid product price.");
      return;
    }

    const finalCategory =
      category === "custom" || isCustomCategory ? customCategory.trim() : category.trim();

    if (!finalCategory) {
      setErrorMessage("Please specify a category for the product.");
      return;
    }

    const finalTag = tag === "custom" || isCustomTag ? customTag.trim() : tag.trim();

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        price: parsedPrice,
        discount_price: discountPrice ? parseFloat(discountPrice) || 0 : 0,
        category: finalCategory,
        tag: finalTag,
        occasions,
        one_liner: oneLiner.trim(),
        description: description.trim(),
        highlighted,
        inventory_size: parseInt(inventorySize, 10) || 0,
        imagesData: imagesList.map((img) => ({
          base64: img.url,
        })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setSuccessMessage("Product added successfully to catalog!");
        onProductCreated(data.data);
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || "Failed to create product.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error creating product";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const numPrice = parseFloat(price) || 0;
  const numDiscount = parseFloat(discountPrice) || 0;
  const hasValidDiscount = numDiscount > 0 && numDiscount < numPrice;
  const discountPercent = hasValidDiscount
    ? Math.round(((numPrice - numDiscount) / numPrice) * 100)
    : 0;

  const combinedCategories = Array.from(
    new Set([...existingCategories, "Toran", "Diyas", "Shubh Labh", "Wall Hangings", "Puja Thali", "Gifts"])
  ).sort();

  const combinedTags = Array.from(new Set([...POPULAR_TAGS, ...existingTags])).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-brand-charcoal/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-border-gold bg-brand-cream shadow-dropdown overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-soft bg-brand-cream px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-peacock text-brand-ivory shadow-card">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-script font-semibold text-xs tracking-wider uppercase text-brand-pink block">
                Catalog Management
              </span>
              <h2 className="font-serif text-xl font-bold text-brand-peacock">
                Add New Product
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-brand-charcoal/60 hover:bg-peacock-tint hover:text-brand-peacock transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-peacock-tint border border-border-soft p-3.5 text-xs font-medium text-brand-peacock">
              <Check className="w-4 h-4 shrink-0 text-brand-peacock" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-pink-tint border border-border-pink p-3.5 text-xs font-medium text-brand-pink">
              <AlertCircle className="w-4 h-4 shrink-0 text-brand-pink" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-brand-charcoal block">
              Product Title / Name <span className="text-brand-pink">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Ganesha Floral Bandhanwar Toran"
              className="w-full rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
            />
          </div>

          {/* Pricing & Stock Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                Regular Price (₹) <span className="text-brand-pink">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1499"
                className="w-full rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm font-price text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                Discount Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="999 (Optional)"
                className="w-full rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm font-price text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
              />
              {hasValidDiscount && (
                <span className="inline-block text-[11px] text-brand-pink font-semibold">
                  {discountPercent}% OFF badge active
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                Stock / Inventory Size
              </label>
              <input
                type="number"
                min="0"
                value={inventorySize}
                onChange={(e) => setInventorySize(e.target.value)}
                placeholder="10"
                className="w-full rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm font-price text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Category & Tag Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                Category <span className="text-brand-pink">*</span>
              </label>
              <select
                value={isCustomCategory ? "custom" : category}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(val);
                  }
                }}
                className="w-full rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none shadow-xs"
              >
                {combinedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ Add Custom Category...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  required
                  placeholder="Enter custom category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border-gold bg-brand-ivory px-3.5 py-2 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
                />
              )}
            </div>

            {/* Tag / Badge */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                Badge / Tag (Optional)
              </label>
              <select
                value={isCustomTag ? "custom" : tag}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setIsCustomTag(true);
                  } else {
                    setIsCustomTag(false);
                    setTag(val);
                  }
                }}
                className="w-full rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none shadow-xs"
              >
                <option value="">(No Badge)</option>
                {combinedTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="custom">+ Add Custom Tag...</option>
              </select>

              {isCustomTag && (
                <input
                  type="text"
                  placeholder="Enter tag (e.g. EXCLUSIVE)..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value.toUpperCase())}
                  className="mt-2 w-full rounded-xl border border-border-gold bg-brand-ivory px-3.5 py-2 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
                />
              )}
            </div>
          </div>

          {/* Occasions Multi-Select & Custom Tag Adder */}
          <div className="space-y-2.5">
            <label className="font-sans text-xs font-semibold text-brand-charcoal block">
              Festive Occasions &amp; Placement
            </label>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_OCCASIONS.map((occ) => {
                const isSelected = occasions.includes(occ);
                return (
                  <button
                    type="button"
                    key={occ}
                    onClick={() => handleToggleOccasion(occ)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-brand-peacock text-brand-ivory shadow-xs"
                        : "bg-brand-ivory border border-border-soft text-brand-charcoal hover:border-brand-peacock"
                    }`}
                  >
                    {isSelected ? `✓ ${occ}` : `+ ${occ}`}
                  </button>
                );
              })}
            </div>

            {/* Selected Tags list */}
            {occasions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {occasions.map((occ) => (
                  <span
                    key={occ}
                    className="inline-flex items-center gap-1.5 rounded-full bg-peacock-tint border border-border-soft px-3 py-1 text-xs font-medium text-brand-peacock"
                  >
                    <span>{occ}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOccasion(occ)}
                      className="hover:text-brand-pink cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add custom occasion input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add other festive occasion..."
                value={customOccasionInput}
                onChange={(e) => setCustomOccasionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomOccasion();
                  }
                }}
                className="flex-1 rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2 text-xs text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomOccasion}
                className="rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2 text-xs font-semibold text-brand-peacock hover:bg-peacock-tint transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tagline / One-Liner */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-brand-charcoal block">
              Short Tagline / Hero One-Liner
            </label>
            <input
              type="text"
              placeholder="e.g. Handcrafted floral pearl toran for auspicious home entryway"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              className="w-full rounded-xl border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-xs"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-brand-charcoal block">
              Full Product Story &amp; Details <span className="text-brand-pink">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe handcrafted materials, care instructions, artisans behind the piece, and decor recommendations..."
              className="w-full rounded-xl border border-border-soft bg-brand-ivory p-3.5 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 leading-relaxed focus:border-brand-peacock focus:outline-none resize-y shadow-xs"
            />
          </div>

          {/* Highlight on Homepage Hero Banner Switch */}
          <div className="flex items-center justify-between rounded-2xl border border-border-gold bg-gold-tint/40 p-4 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span className="font-serif text-sm font-bold text-brand-peacock">
                  Feature in Homepage Hero Carousel
                </span>
              </div>
              <p className="font-sans text-xs text-brand-charcoal/70">
                Display this product in the premier top banner slideshow on the storefront.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={highlighted}
              onClick={() => setHighlighted(!highlighted)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                highlighted ? "bg-brand-peacock" : "bg-brand-charcoal/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-brand-ivory shadow-card ring-0 transition duration-200 ease-in-out ${
                  highlighted ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Image Upload & Reorder Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Product Image Gallery ({imagesList.length})
                </label>
                <p className="text-[11px] text-brand-charcoal/60">
                  Upload multiple photos. Image #1 will be the primary storefront cover.
                </p>
              </div>

              <label
                htmlFor="new-product-file-input"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-gold bg-gold-tint/70 px-3.5 py-1.5 text-xs font-semibold text-brand-peacock hover:bg-gold-tint transition-all cursor-pointer shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-brand-gold" />
                <span>+ Upload Images</span>
                <input
                  id="new-product-file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? "border-brand-peacock bg-peacock-tint"
                  : "border-border-soft bg-brand-ivory/60 hover:bg-brand-ivory"
              }`}
            >
              <UploadCloud className="w-8 h-8 text-brand-gold mx-auto mb-2 opacity-80" />
              <p className="font-serif text-sm text-brand-peacock font-semibold">
                Drag &amp; drop product photos here
              </p>
              <p className="text-xs text-brand-charcoal/50 mt-1">
                Supports JPG, PNG, WEBP. You can upload multiple high-resolution photos.
              </p>
            </div>

            {/* Uploaded Images Gallery & Reordering Grid */}
            {imagesList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {imagesList.map((img, idx) => {
                  const isCover = idx === 0;

                  return (
                    <div
                      key={img.id}
                      className={`relative flex flex-col rounded-xl overflow-hidden border transition-all ${
                        isCover
                          ? "border-border-gold bg-gold-tint/30 shadow-card"
                          : "border-border-soft bg-brand-ivory"
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="relative w-full aspect-square bg-brand-ivory overflow-hidden">
                        <Image
                          src={img.url}
                          alt={img.name || `Upload ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />

                        {/* Cover / Index Badge */}
                        <div className="absolute top-1.5 left-1.5">
                          {isCover ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold px-2 py-0.5 text-[9px] font-bold text-brand-ivory tracking-wider uppercase shadow-xs">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Cover</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-brand-charcoal/70 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-brand-ivory">
                              #{idx + 1}
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 rounded-full bg-brand-ivory/90 backdrop-blur-xs p-1 text-brand-charcoal hover:bg-pink-tint hover:text-brand-pink transition-colors shadow-xs cursor-pointer"
                          title="Remove this image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Controls Row */}
                      <div className="p-2 flex items-center justify-between gap-1 border-t border-border-soft bg-brand-cream/60">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, idx - 1)}
                          className="p-1 rounded bg-brand-ivory border border-border-soft text-brand-charcoal/70 hover:text-brand-peacock disabled:opacity-20 cursor-pointer"
                          title="Move Earlier"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(idx)}
                            className="text-[10px] font-semibold text-brand-peacock hover:text-brand-gold transition-colors truncate px-1 cursor-pointer"
                            title="Set as main cover image"
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                            Main Cover
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={idx === imagesList.length - 1}
                          onClick={() => handleMoveImage(idx, idx + 1)}
                          className="p-1 rounded bg-brand-ivory border border-border-soft text-brand-charcoal/70 hover:text-brand-peacock disabled:opacity-20 cursor-pointer"
                          title="Move Later"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-soft">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-border-soft bg-brand-ivory px-4 py-2.5 text-xs font-medium text-brand-charcoal hover:border-brand-peacock transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-peacock px-6 py-2.5 text-xs font-semibold text-brand-ivory shadow-card hover:bg-brand-peacock/90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Product...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
