"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, ArrowDown } from "lucide-react";
import { ProductItem } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";

interface HeroCarouselProps {
  products: ProductItem[];
  loading: boolean;
}

export function HeroCarousel({ products, loading }: HeroCarouselProps) {
  const { addToCart } = useCart();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter for highlighted products with images, or fallback to first products with images
  const slides = React.useMemo(() => {
    const withImages = products.filter((p) => p.images && p.images.length > 0);
    const highlighted = withImages.filter((p) => p.highlighted);
    const chosen = highlighted.length >= 3 ? highlighted.slice(0, 6) : withImages.slice(0, 6);
    return chosen;
  }, [products]);

  const totalSlides = slides.length;

  // Chaining navigation: left from 0 goes to last, right from last goes to 0
  const goToPrev = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  // Auto-rotating in 2 seconds (2000ms), paused on hover or active touch/drag
  useEffect(() => {
    if (totalSlides <= 1 || isPaused || isDragging) return;

    timerRef.current = setInterval(() => {
      goToNext();
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [totalSlides, isPaused, isDragging, goToNext]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      // Threshold of 40px for swipe trigger
      if (touchDeltaX > 40) {
        // Swiped right -> prev slide (or chaining from first to last)
        goToPrev();
      } else if (touchDeltaX < -40) {
        // Swiped left -> next slide (or chaining from last to first)
        goToNext();
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setTouchStartX(e.clientX);
    setTouchDeltaX(0);
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    setTouchDeltaX(e.clientX - touchStartX);
  };

  const handleMouseUp = () => {
    if (isDragging && touchStartX !== null) {
      if (touchDeltaX > 40) {
        goToPrev();
      } else if (touchDeltaX < -40) {
        goToNext();
      }
    }
    setIsDragging(false);
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  if (loading) {
    return (
      <div className="w-full h-80 sm:h-96 md:h-[460px] bg-brand-cream/50 animate-pulse flex items-center justify-center border-b border-border-soft">
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-8 h-8 text-brand-gold animate-spin" />
          <span className="font-serif text-sm text-brand-peacock">Loading featured handcrafted decor...</span>
        </div>
      </div>
    );
  }

  if (totalSlides === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const hasRealDiscount =
    currentSlide.discount_price > 0 && currentSlide.discount_price < currentSlide.price;
  const displayPrice = hasRealDiscount ? currentSlide.discount_price : currentSlide.price;

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-cream/60 border-b border-border-soft select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      aria-roledescription="carousel"
      aria-label="Featured Collections Carousel"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[360px] md:min-h-[420px]">
          {/* Left Text / Info Panel */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-center space-y-4 text-left">
            <div className="inline-flex items-center gap-2 w-fit rounded-full border border-border-gold bg-gold-tint px-3 py-1 text-xs font-semibold text-brand-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Heritage Collection</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-peacock tracking-tight leading-tight">
              {currentSlide.name}
            </h2>

            {currentSlide.one_liner ? (
              <p className="font-sans text-sm sm:text-base text-brand-charcoal/80 max-w-lg leading-relaxed">
                {currentSlide.one_liner}
              </p>
            ) : (
              <p className="font-sans text-sm sm:text-base text-brand-charcoal/80 max-w-lg leading-relaxed">
                {currentSlide.description?.slice(0, 140)}...
              </p>
            )}

            {/* Price & Action Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-brand-peacock">
                  ₹{displayPrice}
                </span>
                {hasRealDiscount && (
                  <span className="font-sans text-sm text-brand-charcoal/50 line-through">
                    ₹{currentSlide.price}
                  </span>
                )}
              </div>

              <button
                onClick={() =>
                  addToCart(
                    {
                      id: currentSlide.id,
                      name: currentSlide.name,
                      price: currentSlide.price,
                      discount_price: currentSlide.discount_price,
                      image: currentSlide.images[0],
                    },
                    1
                  )
                }
                className="inline-flex items-center gap-2 rounded-full bg-brand-peacock px-5 py-2.5 text-sm font-semibold text-brand-ivory shadow-card hover:bg-brand-peacock/90 hover:shadow-card-hover transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <a
                href="#our-products"
                className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-brand-ivory px-4 py-2.5 text-sm font-medium text-brand-charcoal hover:border-brand-peacock hover:text-brand-peacock transition-colors"
              >
                <span>Browse All</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Product Image Showcase */}
          <div className="md:col-span-6 lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-2xl border border-border-gold bg-brand-ivory p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-brand-cream/50 flex items-center justify-center">
                <Image
                  src={currentSlide.images[0]}
                  alt={currentSlide.name}
                  fill
                  priority
                  className="object-contain p-2 transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized
                />
              </div>

              {/* Category Pill Overlay */}
              <div className="absolute top-6 left-6 rounded-full bg-brand-ivory/90 backdrop-blur-xs border border-border-soft px-3 py-1 text-xs font-semibold text-brand-peacock shadow-card">
                {currentSlide.category}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls: Arrows & Indicators */}
        <div className="mt-6 flex items-center justify-between border-t border-border-soft pt-4">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-brand-peacock"
                    : "w-2.5 bg-brand-charcoal/20 hover:bg-brand-charcoal/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft bg-brand-ivory text-brand-charcoal hover:border-brand-peacock hover:bg-peacock-tint hover:text-brand-peacock shadow-card transition-all"
              aria-label="Previous slide (swipes left/chains to last)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-sans text-xs font-medium text-brand-charcoal/60 px-1">
              {currentIndex + 1} / {totalSlides}
            </span>
            <button
              onClick={goToNext}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft bg-brand-ivory text-brand-charcoal hover:border-brand-peacock hover:bg-peacock-tint hover:text-brand-peacock shadow-card transition-all"
              aria-label="Next slide (swipes right/chains to first)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
