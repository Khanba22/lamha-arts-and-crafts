"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  X,
  ShoppingBag,
  Sparkles,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { ProductItem } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useImageCache } from "@/context/ImageContext";
import { FilterDrawer } from "./FilterDrawer";

interface ProductCatalogProps {
  products: ProductItem[];
  loading: boolean;
}

const PAGE_SIZE = 12;

export function ProductCatalog({ products, loading }: ProductCatalogProps) {
  const { addToCart } = useCart();
  const { preloadImages, getCachedUrl } = useImageCache();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  // Pagination state (Progressive scroll loading)
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    searchQuery,
    selectedCategories,
    selectedOccasions,
    selectedPriceRanges,
    inStockOnly,
    sortBy,
  ]);

  // UI state for filter popover/modal
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  // Close filter panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterDrawerOpen(false);
      }
    };
    if (filterDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterDrawerOpen]);

  // Derive unique categories from products
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Derive unique occasions from products
  const availableOccasions = useMemo(() => {
    const occs = new Set(products.flatMap((p) => p.occasions || []).filter(Boolean));
    return Array.from(occs).sort();
  }, [products]);

  // Calculate dynamic price ranges in differential brackets of 500
  const priceBrackets = useMemo(() => {
    if (products.length === 0) return [];
    const validPrices = products.map((p) =>
      p.discount_price && p.discount_price > 0 ? p.discount_price : p.price
    );
    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);

    // Starting bound rounded down to the nearest 100
    const startFloor = Math.floor(minPrice / 100) * 100;
    const brackets: { id: string; label: string; min: number; max: number }[] = [];

    // First bracket reaches the next multiple of 500
    let next500 = Math.ceil((startFloor + 1) / 500) * 500;
    if (next500 <= startFloor) next500 = startFloor + 500;

    brackets.push({
      id: `${startFloor}-${next500}`,
      label: `₹${startFloor} – ₹${next500}`,
      min: startFloor,
      max: next500,
    });

    let current = next500;
    while (current < maxPrice) {
      const upper = current + 500;
      brackets.push({
        id: `${current}-${upper}`,
        label: `₹${current} – ₹${upper}`,
        min: current,
        max: upper,
      });
      current = upper;
    }

    return brackets;
  }, [products]);

  // Toggle helpers
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const togglePriceRange = (rangeId: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId) ? prev.filter((r) => r !== rangeId) : [...prev, rangeId]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedOccasions([]);
    setSelectedPriceRanges([]);
    setInStockOnly(false);
    setSortBy("featured");
  };

  const totalActiveFiltersCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedOccasions.length > 0 ? 1 : 0) +
    (selectedPriceRanges.length > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(q);
          const matchDesc = prod.description?.toLowerCase().includes(q);
          const matchOneLiner = prod.one_liner?.toLowerCase().includes(q);
          const matchCat = prod.category?.toLowerCase().includes(q);
          const matchOcc = prod.occasions?.some((occ) => occ.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchOneLiner && !matchCat && !matchOcc) {
            return false;
          }
        }

        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(prod.category)
        ) {
          return false;
        }

        if (selectedOccasions.length > 0) {
          const hasOcc = prod.occasions?.some((occ) => selectedOccasions.includes(occ));
          if (!hasOcc) return false;
        }

        if (selectedPriceRanges.length > 0) {
          const hasDiscount = prod.discount_price > 0 && prod.discount_price < prod.price;
          const price = hasDiscount ? prod.discount_price : prod.price;
          const matchesAnyRange = selectedPriceRanges.some((rangeId) => {
            const bracket = priceBrackets.find((b) => b.id === rangeId);
            if (!bracket) return false;
            return price >= bracket.min && price <= bracket.max;
          });
          if (!matchesAnyRange) return false;
        }

        if (inStockOnly && prod.inventory_size !== 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const hasDiscountA = a.discount_price > 0 && a.discount_price < a.price;
        const priceA = hasDiscountA ? a.discount_price : a.price;

        const hasDiscountB = b.discount_price > 0 && b.discount_price < b.price;
        const priceB = hasDiscountB ? b.discount_price : b.price;

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);

        if (a.highlighted && !b.highlighted) return -1;
        if (!a.highlighted && b.highlighted) return 1;
        return 0;
      });
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedOccasions,
    selectedPriceRanges,
    inStockOnly,
    sortBy,
    priceBrackets,
  ]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Preload images ONLY for the currently visible products
  useEffect(() => {
    if (visibleProducts.length > 0) {
      const currentImages = visibleProducts
        .map((p) => p.images?.[0])
        .filter(Boolean);
      preloadImages(currentImages);
    }
  }, [visibleProducts, preloadImages]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (visibleCount >= filteredProducts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) =>
              Math.min(prev + PAGE_SIZE, filteredProducts.length)
            );
            setIsLoadingMore(false);
          }, 120);
        }
      },
      { rootMargin: "350px" }
    );

    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [visibleCount, filteredProducts.length]);

  const handleAddToCart = (product: ProductItem) => {
    const hasDiscount = product.discount_price > 0 && product.discount_price < product.price;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        discount_price: hasDiscount ? product.discount_price : undefined,
        image: product.images[0],
      },
      1
    );

    setAddedItemId(product.id);
    setTimeout(() => {
      setAddedItemId(null);
    }, 1200);
  };

  const formatOccasionLabel = (occ: string) => {
    return occ
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" & ");
  };

  return (
    <section id="our-products" className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header of Our Products with description */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="font-script font-semibold text-xs sm:text-sm tracking-wider uppercase text-brand-pink block">
            Handmade with cultural devotion
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-peacock tracking-tight">
            Our Products
          </h2>
          <p className="font-sans text-sm sm:text-base text-brand-charcoal/80 leading-relaxed max-w-2xl">
            Explore authentic hand-designed Shubh Labh hangings, T-light sets, Haldi Kumkum platters,
            and festive adornments created to bring elegance and divine blessings to your spaces.
          </p>
        </div>

        {/* Structural Control Row (No Nested Boxes) */}
        <div className="pb-6 border-b border-border-soft space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Component 1: Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, occasions..."
                className="w-full rounded-lg border border-border-soft bg-brand-cream pl-9 pr-8 py-2 text-sm text-brand-charcoal placeholder:text-brand-charcoal/45 focus:border-brand-peacock focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right Side: Filter Trigger and Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilterDrawerOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                  filterDrawerOpen || totalActiveFiltersCount > 0
                    ? "border-brand-peacock bg-peacock-tint text-brand-peacock"
                    : "border-border-soft bg-brand-cream text-brand-charcoal hover:border-brand-peacock"
                }`}
                aria-expanded={filterDrawerOpen}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {totalActiveFiltersCount > 0 && (
                  <span className="text-xs font-bold text-brand-peacock">
                    ({totalActiveFiltersCount})
                  </span>
                )}
              </button>

              <div className="relative inline-flex items-center">
                <ArrowUpDown className="absolute left-3 w-4 h-4 text-brand-charcoal/50 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-lg border border-border-soft bg-brand-cream pl-9 pr-8 py-2 text-sm font-medium text-brand-charcoal focus:border-brand-peacock focus:outline-none hover:border-brand-peacock transition-colors cursor-pointer"
                  aria-label="Sort products by"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              {totalActiveFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-charcoal/60 hover:text-brand-pink transition-colors px-1"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick-Access Occasion Bar (Plain Segmented Links, No Candy Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-medium text-brand-charcoal/50 whitespace-nowrap mr-1">
              Occasion:
            </span>
            <button
              onClick={() => setSelectedOccasions([])}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedOccasions.length === 0
                  ? "bg-brand-peacock text-brand-ivory"
                  : "text-brand-charcoal/75 hover:text-brand-peacock hover:bg-peacock-tint"
              }`}
            >
              All
            </button>
            {availableOccasions.map((occ) => {
              const active = selectedOccasions.includes(occ);
              return (
                <button
                  key={occ}
                  onClick={() => toggleOccasion(occ)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-brand-peacock text-brand-ivory"
                      : "text-brand-charcoal/75 hover:text-brand-peacock hover:bg-peacock-tint"
                  }`}
                >
                  {formatOccasionLabel(occ)}
                </button>
              );
            })}
          </div>

        </div>

        {/* Amazon-style Left-Side Slide-Out Filter Drawer */}
        <FilterDrawer
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          categories={availableCategories}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          occasions={availableOccasions}
          selectedOccasions={selectedOccasions}
          onToggleOccasion={toggleOccasion}
          formatOccasionLabel={formatOccasionLabel}
          priceBrackets={priceBrackets}
          selectedPriceRanges={selectedPriceRanges}
          onTogglePriceRange={togglePriceRange}
          inStockOnly={inStockOnly}
          onToggleInStockOnly={setInStockOnly}
          onClearAll={clearAllFilters}
          totalActiveFiltersCount={totalActiveFiltersCount}
          matchingProductsCount={filteredProducts.length}
        />

        {/* Active Filter Indicators (Compact Hairline Tags, No Floating Pills) */}
        {totalActiveFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-xs text-brand-charcoal/50">Filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-brand-cream px-2.5 py-1 text-xs text-brand-charcoal">
                <span>&quot;{searchQuery}&quot;</span>
                <button onClick={() => setSearchQuery("")} aria-label="Remove search query">
                  <X className="w-3 h-3 text-brand-charcoal/50 hover:text-brand-charcoal" />
                </button>
              </span>
            )}

            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-brand-cream px-2.5 py-1 text-xs text-brand-charcoal"
              >
                <span>{cat}</span>
                <button onClick={() => toggleCategory(cat)} aria-label={`Remove category ${cat}`}>
                  <X className="w-3 h-3 text-brand-charcoal/50 hover:text-brand-charcoal" />
                </button>
              </span>
            ))}

            {selectedOccasions.map((occ) => (
              <span
                key={occ}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-brand-cream px-2.5 py-1 text-xs text-brand-charcoal"
              >
                <span>{formatOccasionLabel(occ)}</span>
                <button onClick={() => toggleOccasion(occ)} aria-label={`Remove occasion ${occ}`}>
                  <X className="w-3 h-3 text-brand-charcoal/50 hover:text-brand-charcoal" />
                </button>
              </span>
            ))}

            {selectedPriceRanges.map((rangeId) => (
              <span
                key={rangeId}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-brand-cream px-2.5 py-1 text-xs text-brand-charcoal"
              >
                <span>₹{rangeId}</span>
                <button onClick={() => togglePriceRange(rangeId)} aria-label={`Remove price range ${rangeId}`}>
                  <X className="w-3 h-3 text-brand-charcoal/50 hover:text-brand-charcoal" />
                </button>
              </span>
            ))}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-brand-cream px-2.5 py-1 text-xs text-brand-charcoal">
                <span>In Stock Only</span>
                <button onClick={() => setInStockOnly(false)} aria-label="Remove in stock filter">
                  <X className="w-3 h-3 text-brand-charcoal/50 hover:text-brand-charcoal" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product Grid (Single Surface Level Cards, No Box-in-Box Framing) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border-soft bg-brand-cream/40 p-4 animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-brand-ivory rounded-lg" />
                <div className="h-4 bg-brand-charcoal/10 rounded w-3/4" />
                <div className="h-3 bg-brand-charcoal/10 rounded w-1/2" />
                <div className="h-9 bg-brand-peacock/15 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-border-soft bg-brand-cream/30 py-16 px-6 text-center space-y-3 mt-6">
            <Sparkles className="w-8 h-8 text-brand-gold/60 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-brand-charcoal">
              No products found
            </h3>
            <p className="text-sm text-brand-charcoal/70 max-w-sm mx-auto">
              No items matched your current filter criteria.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-peacock px-4 py-2 text-xs font-semibold text-brand-ivory hover:bg-brand-peacock/90"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
              {visibleProducts.map((product) => {
                const hasRealDiscount =
                  product.discount_price > 0 && product.discount_price < product.price;
                const displayPrice = hasRealDiscount ? product.discount_price : product.price;
                const isJustAdded = addedItemId === product.id;

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-border-soft bg-brand-cream/50 overflow-hidden transition-colors hover:border-brand-peacock/40"
                  >
                    {/* Single Surface Card: Clickable to Product Preview */}
                    <Link
                      href={`/products/${product.id}`}
                      className="block focus:outline-none"
                      aria-label={`View details for ${product.name}`}
                    >
                      <div className="relative aspect-square w-full bg-brand-cream border-b border-border-subtle overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={getCachedUrl(product.images[0])}
                            alt={product.name}
                            fill
                            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            unoptimized
                          />
                        ) : (
                          <ShoppingBag className="w-10 h-10 text-brand-peacock/20" />
                        )}

                        {/* Quiet Top Left Indicator (No Floating Pill Sticker) */}
                        {product.highlighted && (
                          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-brand-ivory px-2 py-0.5 rounded border border-border-gold">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-sans text-[11px] font-semibold text-brand-charcoal/60 uppercase tracking-wider truncate">
                            {product.category}
                          </span>
                          {product.inventory_size === 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-peacock flex-shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-peacock" />
                              <span>In Stock</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-base font-bold text-brand-charcoal line-clamp-1 group-hover:text-brand-peacock transition-colors">
                          {product.name}
                        </h3>

                        {product.one_liner ? (
                          <p className="font-sans text-xs text-brand-charcoal/70 line-clamp-2 min-h-[32px] leading-relaxed">
                            {product.one_liner}
                          </p>
                        ) : (
                          <p className="font-sans text-xs text-brand-charcoal/70 line-clamp-2 min-h-[32px] leading-relaxed">
                            {product.description?.slice(0, 80)}...
                          </p>
                        )}
                      </div>
                    </Link>

                    {/* Card Action Row */}
                    <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-2 border-t border-border-subtle mt-auto">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-price text-lg font-bold text-brand-peacock">
                          ₹{displayPrice}
                        </span>
                        {hasRealDiscount && (
                          <span className="font-price text-xs text-brand-charcoal/45 line-through">
                            ₹{product.price}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isJustAdded
                            ? "bg-brand-gold text-brand-ivory"
                            : "bg-brand-peacock text-brand-ivory hover:bg-brand-peacock/90"
                        }`}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scrollable Pagination Sentinel & Status */}
            <div className="w-full flex flex-col items-center justify-center pt-10 pb-4">
              {visibleCount < filteredProducts.length ? (
                <div ref={sentinelRef} className="flex flex-col items-center gap-2.5 py-4">
                  <div className="w-6 h-6 border-2 border-brand-peacock/20 border-t-brand-peacock rounded-full animate-spin" />
                  <span className="font-sans text-xs font-medium text-brand-charcoal/60 tracking-wide">
                    Loading more handcrafted treasures ({visibleProducts.length} of {filteredProducts.length})...
                  </span>
                </div>
              ) : filteredProducts.length > PAGE_SIZE ? (
                <div className="text-center py-6 border-t border-border-soft w-full max-w-sm mx-auto">
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-charcoal/50">
                    Showing all {filteredProducts.length} handcrafted products
                  </span>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
