"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ArrowUpDown,
  X,
  ShoppingBag,
  Sparkles,
  Check,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { ProductItem } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";

interface ProductCatalogProps {
  products: ProductItem[];
  loading: boolean;
}

export function ProductCatalog({ products, loading }: ProductCatalogProps) {
  const { addToCart } = useCart();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

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
  // e.g. min: 299, max: 2300 -> 200-500, 500-1000, 1000-1500, 1500-2000, 2000-2500
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
      label: `₹${startFloor} - ₹${next500}`,
      min: startFloor,
      max: next500,
    });

    let current = next500;
    while (current < maxPrice) {
      const upper = current + 500;
      brackets.push({
        id: `${current}-${upper}`,
        label: `₹${current} - ₹${upper}`,
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
        // Search filter
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

        // Category multi-select
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(prod.category)
        ) {
          return false;
        }

        // Occasions multi-select
        if (selectedOccasions.length > 0) {
          const hasOcc = prod.occasions?.some((occ) => selectedOccasions.includes(occ));
          if (!hasOcc) return false;
        }

        // Price range multi-select
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

        // In stock checkbox: inventory_size == 0
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
        // Default: featured first
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
    <section id="our-products" className="scroll-mt-20 w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header of Our Products with description */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="font-script text-2xl sm:text-3xl text-brand-pink">
            Exquisite Handcrafted Creations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-peacock tracking-tight">
            Our Products
          </h2>
          <p className="font-sans text-sm sm:text-base text-brand-charcoal/75 leading-relaxed">
            Explore authentic hand-designed Shubh Labh hangings, T-light sets, Haldi Kumkum platters,
            and festive adornments created to bring elegance and divine blessings to your spaces.
          </p>
        </div>

        {/* Three Component Layout Bar: Search (Left) + Filter & Sort (Right) */}
        <div className="rounded-2xl bg-brand-cream/80 border border-border-soft p-4 sm:p-5 shadow-card mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Component 1: Search Bar at Left */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search handcrafted products, categories, occasions..."
                className="w-full rounded-full border border-border-soft bg-brand-ivory pl-10 pr-10 py-2.5 text-sm text-brand-charcoal placeholder:text-brand-charcoal/45 focus:border-brand-peacock focus:outline-none focus:ring-1 focus:ring-brand-peacock transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right Side: Component 2 (Filter) and Component 3 (Sort) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Component 2: Filter Button */}
              <button
                onClick={() => setFilterDrawerOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all shadow-card ${
                  filterDrawerOpen || totalActiveFiltersCount > 0
                    ? "border-brand-peacock bg-brand-peacock text-brand-ivory"
                    : "border-border-soft bg-brand-ivory text-brand-charcoal hover:border-brand-peacock hover:text-brand-peacock"
                }`}
                aria-expanded={filterDrawerOpen}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {totalActiveFiltersCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-pink px-1.5 text-xs font-bold text-brand-ivory">
                    {totalActiveFiltersCount}
                  </span>
                )}
              </button>

              {/* Component 3: Sort Controls */}
              <div className="relative inline-flex items-center">
                <ArrowUpDown className="absolute left-3 w-4 h-4 text-brand-charcoal/50 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-full border border-border-soft bg-brand-ivory pl-9 pr-8 py-2.5 text-sm font-medium text-brand-charcoal focus:border-brand-peacock focus:outline-none shadow-card hover:border-brand-peacock transition-all cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-charcoal/70 hover:text-brand-pink transition-colors px-2 py-1"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick-Access Occasion Chips Bar for 1-Tap Discovery */}
          <div className="mt-4 pt-3 border-t border-border-soft/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-brand-charcoal/60 whitespace-nowrap mr-1">
              Quick Filter:
            </span>
            <button
              onClick={() => setSelectedOccasions([])}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                selectedOccasions.length === 0
                  ? "bg-brand-peacock text-brand-ivory shadow-card"
                  : "bg-brand-ivory border border-border-soft text-brand-charcoal/80 hover:border-brand-peacock"
              }`}
            >
              All Occasions
            </button>
            {availableOccasions.map((occ) => {
              const active = selectedOccasions.includes(occ);
              return (
                <button
                  key={occ}
                  onClick={() => toggleOccasion(occ)}
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-brand-peacock text-brand-ivory shadow-card"
                      : "bg-brand-ivory border border-border-soft text-brand-charcoal/80 hover:border-brand-peacock hover:text-brand-peacock"
                  }`}
                >
                  {formatOccasionLabel(occ)}
                </button>
              );
            })}
          </div>

          {/* Expandable Detailed Filter Drawer */}
          {filterDrawerOpen && (
            <div className="mt-5 pt-5 border-t border-border-soft space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Price Range Filter */}
                <div className="space-y-2.5">
                  <h4 className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
                    Price Range (₹500 Differential)
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                    {priceBrackets.map((bracket) => {
                      const checked = selectedPriceRanges.includes(bracket.id);
                      return (
                        <label
                          key={bracket.id}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                            checked
                              ? "border-brand-peacock bg-peacock-tint text-brand-peacock"
                              : "border-border-soft bg-brand-ivory text-brand-charcoal hover:border-brand-peacock/40"
                          }`}
                        >
                          <span>{bracket.label}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePriceRange(bracket.id)}
                            className="rounded text-brand-peacock focus:ring-0 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Category Multi-Select Filter */}
                <div className="space-y-2.5">
                  <h4 className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
                    Categories
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                    {availableCategories.map((cat) => {
                      const checked = selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                            checked
                              ? "border-brand-peacock bg-peacock-tint text-brand-peacock"
                              : "border-border-soft bg-brand-ivory text-brand-charcoal hover:border-brand-peacock/40"
                          }`}
                        >
                          <span className="truncate pr-2">{cat}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategory(cat)}
                            className="rounded text-brand-peacock focus:ring-0 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Occasions & Inventory Filter */}
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <h4 className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
                      Occasions
                    </h4>
                    <div className="space-y-1.5">
                      {availableOccasions.map((occ) => {
                        const checked = selectedOccasions.includes(occ);
                        return (
                          <label
                            key={occ}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                              checked
                                ? "border-brand-peacock bg-peacock-tint text-brand-peacock"
                                : "border-border-soft bg-brand-ivory text-brand-charcoal hover:border-brand-peacock/40"
                            }`}
                          >
                            <span>{formatOccasionLabel(occ)}</span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOccasion(occ)}
                              className="rounded text-brand-peacock focus:ring-0 cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer-Facing In Stock Checkbox (Refined Copy) */}
                  <div className="pt-2 border-t border-border-soft">
                    <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border-gold bg-gold-tint/50 cursor-pointer transition-all hover:bg-gold-tint">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded text-brand-peacock focus:ring-0 cursor-pointer h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" />
                          <span>In Stock Only</span>
                        </span>
                        <span className="text-[10px] text-brand-charcoal/70">
                          Handcrafted and ready for immediate dispatch
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Filter Panel Footer Action */}
              <div className="flex items-center justify-between pt-3 border-t border-border-soft">
                <span className="text-xs font-medium text-brand-charcoal/70">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} match
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-brand-charcoal/70 hover:text-brand-pink"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="rounded-full bg-brand-peacock px-4 py-1.5 text-xs font-semibold text-brand-ivory hover:bg-brand-peacock/90"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Badges */}
        {totalActiveFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-medium text-brand-charcoal/60">Active:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-brand-cream px-3 py-1 text-xs text-brand-charcoal">
                Search: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3 text-brand-charcoal/50 hover:text-brand-charcoal" />
                </button>
              </span>
            )}

            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-peacock-tint px-3 py-1 text-xs font-medium text-brand-peacock"
              >
                {cat}
                <button onClick={() => toggleCategory(cat)}>
                  <X className="w-3 h-3 text-brand-peacock/70 hover:text-brand-peacock" />
                </button>
              </span>
            ))}

            {selectedOccasions.map((occ) => (
              <span
                key={occ}
                className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-pink-tint px-3 py-1 text-xs font-medium text-brand-pink"
              >
                {formatOccasionLabel(occ)}
                <button onClick={() => toggleOccasion(occ)}>
                  <X className="w-3 h-3 text-brand-pink/70 hover:text-brand-pink" />
                </button>
              </span>
            ))}

            {selectedPriceRanges.map((rangeId) => (
              <span
                key={rangeId}
                className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-brand-cream px-3 py-1 text-xs text-brand-charcoal"
              >
                ₹{rangeId}
                <button onClick={() => togglePriceRange(rangeId)}>
                  <X className="w-3 h-3 text-brand-charcoal/50 hover:text-brand-charcoal" />
                </button>
              </span>
            ))}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border-gold bg-gold-tint px-3 py-1 text-xs font-medium text-brand-gold">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}>
                  <X className="w-3 h-3 text-brand-gold/70 hover:text-brand-gold" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product Grid Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-brand-cream/60 border border-border-soft p-4 animate-pulse space-y-3"
              >
                <div className="w-full aspect-square rounded-xl bg-brand-ivory" />
                <div className="h-4 bg-brand-charcoal/10 rounded w-3/4" />
                <div className="h-3 bg-brand-charcoal/10 rounded w-1/2" />
                <div className="h-8 bg-brand-peacock/15 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-brand-cream/40 py-16 px-6 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-brand-gold/60 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-brand-charcoal">
              No products found
            </h3>
            <p className="text-sm text-brand-charcoal/70 max-w-sm mx-auto">
              No items matched your current filter criteria. Try clearing some filters or searching for different terms.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-peacock px-5 py-2 text-xs font-semibold text-brand-ivory hover:bg-brand-peacock/90"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const hasRealDiscount =
                product.discount_price > 0 && product.discount_price < product.price;
              const displayPrice = hasRealDiscount ? product.discount_price : product.price;
              const isJustAdded = addedItemId === product.id;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border-soft bg-brand-cream/60 p-3.5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:border-brand-peacock/30"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-cream/40 border border-border-soft flex items-center justify-center p-2.5">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          unoptimized
                        />
                      ) : (
                        <ShoppingBag className="w-10 h-10 text-brand-peacock/20" />
                      )}

                      {/* Highlighted Badge */}
                      {product.highlighted && (
                        <div className="absolute top-2.5 left-2.5 rounded-full border border-border-gold bg-brand-ivory/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-brand-gold shadow-card">
                          Featured
                        </div>
                      )}

                      {/* In Stock Badge */}
                      {product.inventory_size === 0 && (
                        <div className="absolute top-2.5 right-2.5 rounded-full border border-border-soft bg-brand-ivory/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-brand-peacock shadow-card">
                          In Stock
                        </div>
                      )}
                    </div>

                    {/* Content info */}
                    <div className="pt-3.5 pb-2 space-y-1.5">
                      <span className="font-sans text-[11px] font-semibold text-brand-peacock uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-brand-charcoal line-clamp-1 group-hover:text-brand-peacock transition-colors">
                        {product.name}
                      </h3>
                      {product.one_liner ? (
                        <p className="font-sans text-xs text-brand-charcoal/70 line-clamp-2 min-h-[32px]">
                          {product.one_liner}
                        </p>
                      ) : (
                        <p className="font-sans text-xs text-brand-charcoal/70 line-clamp-2 min-h-[32px]">
                          {product.description?.slice(0, 80)}...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Add to Cart Footer */}
                  <div className="pt-2 border-t border-border-soft/60 flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-base font-bold text-brand-peacock">
                        ₹{displayPrice}
                      </span>
                      {hasRealDiscount && (
                        <span className="font-sans text-xs text-brand-charcoal/50 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-card transition-all active:scale-[0.98] ${
                        isJustAdded
                          ? "bg-brand-gold text-brand-ivory"
                          : "bg-brand-peacock text-brand-ivory hover:bg-brand-peacock/90 hover:shadow-card-hover"
                      }`}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
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
        )}
      </div>
    </section>
  );
}
