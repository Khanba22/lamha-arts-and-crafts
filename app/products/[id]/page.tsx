"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Sparkles,
  ShieldCheck,
  Package,
  Clock,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useProducts, ProductItem } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useImageCache } from "@/context/ImageContext";
import { ProductGallery } from "@/components/ProductGallery";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const { products, loading: contextLoading } = useProducts();
  const { addToCart } = useCart();
  const { getCachedUrl } = useImageCache();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Attempt to resolve from context first, otherwise fetch by ID
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!id) return;

      const foundInContext = products.find((p) => p.id === id);
      if (foundInContext) {
        setProduct(foundInContext);
        setLoading(false);
        return;
      }

      // If products in context are still loading, wait
      if (contextLoading) {
        return;
      }

      // Fetch directly from single product API
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.data) {
          setProduct(data.data);
          setError(null);
        } else {
          setError(data.error || "Product not found");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load product";
        setError(msg);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, products, contextLoading]);

  // Handle Add to Cart with quantity
  const handleAddToCart = () => {
    if (!product) return;
    const hasDiscount =
      product.discount_price > 0 && product.discount_price < product.price;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        discount_price: hasDiscount ? product.discount_price : undefined,
        image: product.images[0],
      },
      quantity,
    );

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1500);
  };

  // Handle Share / Copy Link
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1500);
      } catch {
        // Fallback
      }
    }
  };

  // Related recommendations ranked by matching occasion, then by similar category
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];

    const currentOccasions = new Set(
      (product.occasions || []).map((occ) => occ.toLowerCase().trim()),
    );

    const candidates = products.filter((p) => p.id !== product.id);

    // Score and rank candidates:
    // Tier 4: Same Occasion AND Same Category (highest priority)
    // Tier 3: Same Occasion (different category)
    // Tier 2: Same Category (fallback if fewer items match occasion)
    // Tier 1: General catalog / Highlighted fallback
    const scored = candidates.map((p) => {
      const pOccasions = (p.occasions || []).map((occ) =>
        occ.toLowerCase().trim(),
      );
      const sharedOccasionsCount = pOccasions.filter((occ) =>
        currentOccasions.has(occ),
      ).length;
      const isSameOccasion = sharedOccasionsCount > 0;
      const isSameCategory =
        Boolean(p.category && product.category) &&
        p.category.toLowerCase().trim() ===
          product.category.toLowerCase().trim();

      let tier = 1;
      if (isSameOccasion && isSameCategory) {
        tier = 4;
      } else if (isSameOccasion) {
        tier = 3;
      } else if (isSameCategory) {
        tier = 2;
      }

      return {
        product: p,
        tier,
        sharedOccasionsCount,
        highlighted: p.highlighted ? 1 : 0,
      };
    });

    scored.sort((a, b) => {
      if (b.tier !== a.tier) return b.tier - a.tier;
      if (b.sharedOccasionsCount !== a.sharedOccasionsCount) {
        return b.sharedOccasionsCount - a.sharedOccasionsCount;
      }
      return b.highlighted - a.highlighted;
    });

    return scored.slice(0, 4).map((item) => item.product);
  }, [product, products]);

  // Price calculations
  const hasDiscount =
    product &&
    product.discount_price > 0 &&
    product.discount_price < product.price;
  const displayPrice = hasDiscount
    ? product.discount_price
    : (product?.price ?? 0);
  const savings =
    hasDiscount && product ? product.price - product.discount_price : 0;
  const savingsPercentage =
    hasDiscount && product ? Math.round((savings / product.price) * 100) : 0;

  // Pre-filled WhatsApp inquiry
  const whatsappText = encodeURIComponent(
    `Namaste Lamha Arts & Craft! 🙏 I am interested in "${product?.name}" (₹${displayPrice}). Could you please share more details or availability?`,
  );
  const whatsappUrl = `https://wa.me/917083989848?text=${whatsappText}`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-peacock border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-brand-charcoal/70">
          Loading handcrafted details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-peacock">
          Product Not Found
        </h2>
        <p className="text-sm text-brand-charcoal/70 max-w-md">
          {error ||
            "The requested item is no longer available or the link is incorrect."}
        </p>
        <Link
          href="/#our-products"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-peacock px-4 py-2 text-sm font-semibold text-brand-ivory hover:bg-brand-peacock/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-brand-ivory">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Top Breadcrumb and Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-soft">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-brand-charcoal/60"
          >
            <Link
              href="/"
              className="hover:text-brand-peacock transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/#our-products"
              className="hover:text-brand-peacock transition-colors"
            >
              Our Products
            </Link>
            <span>/</span>
            <span className="text-brand-charcoal font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>

          <Link
            href="/#our-products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-peacock hover:text-brand-peacock/80 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Viewer Gallery (cols 1-7) */}
          <div className="lg:col-span-7 w-full">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Right Column: Product Details & Actions (cols 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category and Stock Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-gold">
                {product.category}
              </span>
              {product.inventory_size === 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-peacock bg-peacock-tint px-2.5 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-peacock" />
                  <span>In Stock (Ready to dispatch)</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-peacock tracking-tight leading-tight">
                {product.name}
              </h1>
              <span className="font-script font-semibold text-xs tracking-wider uppercase text-brand-pink block">
                Handcrafted with cultural devotion
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 py-2 border-y border-border-soft">
              <span className="font-price text-3xl sm:text-4xl font-bold text-brand-peacock tracking-tight">
                ₹{displayPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="font-price text-base text-brand-charcoal/45 line-through">
                    ₹{product.price}
                  </span>
                  <span className="font-price text-xs font-bold text-brand-pink bg-pink-tint px-2 py-0.5 rounded-md">
                    {savingsPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description / One Liner */}
            <div className="space-y-2 text-sm text-brand-charcoal/85 leading-relaxed">
              {product.one_liner && (
                <p className="font-medium text-brand-charcoal">
                  {product.one_liner}
                </p>
              )}
              {product.description && (
                <p className="whitespace-pre-line text-brand-charcoal/75">
                  {product.description}
                </p>
              )}
            </div>

            {/* Occasions Tags */}
            {product.occasions && product.occasions.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-brand-charcoal/60 uppercase tracking-wider">
                  Perfect For:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.occasions.map((occ) => (
                    <span
                      key={occ}
                      className="px-2.5 py-1 text-xs rounded-md border border-border-soft bg-brand-cream text-brand-charcoal capitalize"
                    >
                      {occ.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Control Row */}
            <div className="space-y-4 pt-4 border-t border-border-soft">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-brand-charcoal/70 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-border-soft rounded-lg bg-brand-cream overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-sm font-semibold text-brand-charcoal hover:bg-peacock-tint disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-brand-charcoal min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-sm font-semibold text-brand-charcoal hover:bg-peacock-tint transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-3 px-6 text-sm font-semibold tracking-wide transition-all ${
                    addedSuccess
                      ? "bg-brand-gold text-brand-ivory shadow-gold"
                      : "bg-brand-peacock text-brand-ivory hover:bg-brand-peacock/90 shadow-card"
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag ({quantity})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-soft bg-brand-cream hover:bg-peacock-tint py-3 px-4 text-sm font-semibold text-brand-peacock transition-colors"
                  title="Inquire about customization on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Inquire</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-lg border border-border-soft bg-brand-cream hover:bg-peacock-tint text-brand-charcoal/70 hover:text-brand-peacock transition-colors self-center sm:self-auto"
                  title="Copy link"
                  aria-label="Share product"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-brand-peacock" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Artisanal Trust Assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-border-soft text-xs text-brand-charcoal/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>100% Handcrafted</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-peacock flex-shrink-0" />
                <span>Damage-Safe Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-pink flex-shrink-0" />
                <span>Express Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-border-soft space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-script font-semibold text-xs tracking-wider uppercase text-brand-pink block">
                  More curated pieces
                </span>
                <h3 className="font-serif text-2xl font-bold text-brand-peacock">
                  You May Also Like
                </h3>
              </div>
              <Link
                href="/#our-products"
                className="text-xs font-semibold text-brand-peacock hover:underline"
              >
                View Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => {
                const relHasDiscount =
                  rel.discount_price > 0 && rel.discount_price < rel.price;
                const relPrice = relHasDiscount
                  ? rel.discount_price
                  : rel.price;

                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="group rounded-xl border border-border-soft bg-brand-cream overflow-hidden flex flex-col hover:border-brand-peacock/60 transition-colors shadow-card"
                  >
                    <div className="relative aspect-square w-full bg-brand-cream overflow-hidden">
                      {rel.images && rel.images[0] ? (
                        <Image
                          src={getCachedUrl(rel.images[0])}
                          alt={rel.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-charcoal/30">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold truncate">
                        {rel.category}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-brand-charcoal line-clamp-1 group-hover:text-brand-peacock transition-colors">
                        {rel.name}
                      </h4>
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="font-price text-sm font-bold text-brand-peacock">
                          ₹{relPrice}
                        </span>
                        {relHasDiscount && (
                          <span className="font-price text-[11px] text-brand-charcoal/45 line-through">
                            ₹{rel.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
