"use client";

import React from "react";
import { useProducts } from "@/context/ProductsContext";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCatalog } from "@/components/ProductCatalog";

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* 1. Hero Auto-Rotating Chaining Carousel (2 seconds, swipe/drag enabled) */}
      <HeroCarousel products={products} loading={loading} />

      {/* 2. Our Products with 3-Component Search, Filter & Sort Layout */}
      <ProductCatalog products={products} loading={loading} />

      {/* 3. Our Story Section Anchor */}
      <section
        id="our-story"
        className="scroll-mt-24 w-full py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream/60 border-t border-border-soft"
      >
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            The Heritage of Lamha Arts &amp; Craft
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-peacock">
            Our Story
          </h2>
          <p className="font-sans text-sm sm:text-base text-brand-charcoal/80 leading-relaxed max-w-2xl mx-auto">
            Lamha Arts &amp; Craft was born from a passion for timeless Indian celebrations and artisan craft.
            Every ornament, platter, and decorative piece is meticulously handmade, blending cultural tradition
            with modern festive aesthetics.
          </p>
        </div>
      </section>
    </div>
  );
}
