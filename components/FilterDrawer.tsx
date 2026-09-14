"use client";

import React, { useEffect, useState } from "react";
import { X, ChevronDown, RotateCcw } from "lucide-react";

export interface PriceBracket {
  id: string;
  label: string;
  min: number;
  max: number;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Category filter
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
  // Occasion filter
  occasions: string[];
  selectedOccasions: string[];
  onToggleOccasion: (occ: string) => void;
  formatOccasionLabel: (occ: string) => string;
  // Price filter
  priceBrackets: PriceBracket[];
  selectedPriceRanges: string[];
  onTogglePriceRange: (rangeId: string) => void;
  // Stock filter
  inStockOnly: boolean;
  onToggleInStockOnly: (val: boolean) => void;
  // Actions
  onClearAll: () => void;
  totalActiveFiltersCount: number;
  matchingProductsCount: number;
}

export function FilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onToggleCategory,
  occasions,
  selectedOccasions,
  onToggleOccasion,
  formatOccasionLabel,
  priceBrackets,
  selectedPriceRanges,
  onTogglePriceRange,
  inStockOnly,
  onToggleInStockOnly,
  onClearAll,
  totalActiveFiltersCount,
  matchingProductsCount,
}: FilterDrawerProps) {
  // Accordion state for Amazon-style expandable filter keys
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    occasions: true,
    availability: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-brand-charcoal/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface (0px radius for sidebar/drawer per design tokens) */}
      <aside
        role="dialog"
        aria-label="Product filters"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm bg-brand-cream border-r border-border-soft shadow-dropdown flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft bg-brand-cream">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-brand-peacock tracking-tight">
              Filters
            </h3>
            {totalActiveFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-brand-peacock bg-peacock-tint rounded-md">
                {totalActiveFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {totalActiveFiltersCount > 0 && (
              <button
                onClick={onClearAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-charcoal/60 hover:text-brand-pink transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-peacock-tint transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter List - Amazon Style Headings */}
        <div className="flex-1 overflow-y-auto divide-y divide-border-soft">
          {/* 1. Categories Section */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => toggleSection("categories")}
              className="w-full flex items-center justify-between px-5 py-2 text-left hover:bg-peacock-tint/50 transition-colors"
              aria-expanded={expandedSections.categories}
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
                  Category
                </span>
                {selectedCategories.length > 0 && (
                  <span className="text-xs font-semibold text-brand-pink">
                    ({selectedCategories.length})
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-brand-charcoal/50 transition-transform duration-200 ${
                  expandedSections.categories ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSections.categories && (
              <div className="px-5 pt-2 pb-3 space-y-2">
                {categories.map((cat) => {
                  const checked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center justify-between text-sm text-brand-charcoal hover:text-brand-peacock cursor-pointer py-0.5 select-none"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleCategory(cat)}
                          className="w-4 h-4 rounded border-border-soft text-brand-peacock focus:ring-0 cursor-pointer accent-[#146B6B]"
                        />
                        <span className={checked ? "font-semibold text-brand-peacock" : ""}>
                          {cat}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Price Range Section */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between px-5 py-2 text-left hover:bg-peacock-tint/50 transition-colors"
              aria-expanded={expandedSections.price}
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
                  Price
                </span>
                {selectedPriceRanges.length > 0 && (
                  <span className="text-xs font-semibold text-brand-pink">
                    ({selectedPriceRanges.length})
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-brand-charcoal/50 transition-transform duration-200 ${
                  expandedSections.price ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSections.price && (
              <div className="px-5 pt-2 pb-3 space-y-2">
                {priceBrackets.map((bracket) => {
                  const checked = selectedPriceRanges.includes(bracket.id);
                  return (
                    <label
                      key={bracket.id}
                      className="flex items-center justify-between text-sm text-brand-charcoal hover:text-brand-peacock cursor-pointer py-0.5 select-none"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onTogglePriceRange(bracket.id)}
                          className="w-4 h-4 rounded border-border-soft text-brand-peacock focus:ring-0 cursor-pointer accent-[#146B6B]"
                        />
                        <span className={checked ? "font-semibold text-brand-peacock" : ""}>
                          {bracket.label}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Occasion Section */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => toggleSection("occasions")}
              className="w-full flex items-center justify-between px-5 py-2 text-left hover:bg-peacock-tint/50 transition-colors"
              aria-expanded={expandedSections.occasions}
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
                  Occasion
                </span>
                {selectedOccasions.length > 0 && (
                  <span className="text-xs font-semibold text-brand-pink">
                    ({selectedOccasions.length})
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-brand-charcoal/50 transition-transform duration-200 ${
                  expandedSections.occasions ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSections.occasions && (
              <div className="px-5 pt-2 pb-3 space-y-2">
                {occasions.map((occ) => {
                  const checked = selectedOccasions.includes(occ);
                  return (
                    <label
                      key={occ}
                      className="flex items-center justify-between text-sm text-brand-charcoal hover:text-brand-peacock cursor-pointer py-0.5 select-none"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleOccasion(occ)}
                          className="w-4 h-4 rounded border-border-soft text-brand-peacock focus:ring-0 cursor-pointer accent-[#146B6B]"
                        />
                        <span className={checked ? "font-semibold text-brand-peacock" : ""}>
                          {formatOccasionLabel(occ)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Availability Section */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => toggleSection("availability")}
              className="w-full flex items-center justify-between px-5 py-2 text-left hover:bg-peacock-tint/50 transition-colors"
              aria-expanded={expandedSections.availability}
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
                  Availability
                </span>
                {inStockOnly && (
                  <span className="text-xs font-semibold text-brand-pink">(1)</span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-brand-charcoal/50 transition-transform duration-200 ${
                  expandedSections.availability ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSections.availability && (
              <div className="px-5 pt-2 pb-3">
                <label className="flex items-center gap-3 text-sm text-brand-charcoal hover:text-brand-peacock cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => onToggleInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-border-soft text-brand-peacock focus:ring-0 cursor-pointer accent-[#146B6B]"
                  />
                  <span className={inStockOnly ? "font-semibold text-brand-peacock" : ""}>
                    In Stock Only (Ready to dispatch)
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer (Sticky Actions) */}
        <div className="p-4 border-t border-border-soft bg-brand-cream flex items-center gap-3">
          <button
            type="button"
            onClick={onClearAll}
            className="flex-1 py-2.5 px-3 rounded-lg border border-border-soft bg-brand-cream text-brand-charcoal hover:text-brand-pink text-xs font-semibold tracking-wide transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-2 py-2.5 px-4 rounded-lg bg-brand-peacock text-brand-ivory hover:bg-brand-peacock/90 text-xs font-semibold tracking-wide transition-colors text-center"
          >
            Show {matchingProductsCount} {matchingProductsCount === 1 ? "Result" : "Results"}
          </button>
        </div>
      </aside>
    </>
  );
}
