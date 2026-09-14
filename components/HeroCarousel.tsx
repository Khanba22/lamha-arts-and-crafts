"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ShoppingBag,
} from "lucide-react";
import { ProductItem } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";

interface HeroCarouselProps {
  products: ProductItem[];
  loading: boolean;
}

export function HeroCarousel({ products, loading }: HeroCarouselProps) {
  const { addToCart } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = React.useMemo(() => {
    const withImages = products.filter((p) => p.images && p.images.length > 0);
    const highlighted = withImages.filter((p) => p.highlighted);
    return highlighted.length > 0 ? highlighted : withImages.slice(0, 6);
  }, [products]);

  const totalSlides = slides.length;

  // Ensure index stays in bounds if slides count changes
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [totalSlides, currentIndex]);

  // Scroll-out parallax tracking
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const visible = Math.min(1, Math.max(0, -rect.top / rect.height));
      setScrollProgress(visible);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = useCallback(
    (nextIdx: number) => {
      if (transitioning || nextIdx === currentIndex) return;
      setTransitioning(true);
      setCurrentIndex(nextIdx);
      setTimeout(() => setTransitioning(false), 700);
    },
    [transitioning, currentIndex],
  );

  const goToPrev = useCallback(() => {
    if (!totalSlides) return;
    goTo(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  }, [goTo, currentIndex, totalSlides]);

  const goToNext = useCallback(() => {
    if (!totalSlides) return;
    goTo(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  }, [goTo, currentIndex, totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1 || isPaused || isDragging) return;
    timerRef.current = setInterval(goToNext, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, isDragging, goToNext]);

  // Touch / drag
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };
  const onTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX > 50) goToPrev();
      else if (touchDeltaX < -50) goToNext();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setTouchStartX(e.clientX);
    setTouchDeltaX(0);
    setIsPaused(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    setTouchDeltaX(e.clientX - touchStartX);
  };
  const onMouseUp = () => {
    if (isDragging && touchStartX !== null) {
      if (touchDeltaX > 50) goToPrev();
      else if (touchDeltaX < -50) goToNext();
    }
    setIsDragging(false);
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  if (loading) {
    return (
      <div className="w-full h-[70svh] md:h-[92vh] lg:h-[calc(100vh-5rem)] min-h-[380px] md:min-h-[550px] bg-brand-cream animate-pulse" />
    );
  }
  if (!totalSlides) return null;

  const slide = slides[currentIndex];
  const hasDiscount =
    slide.discount_price > 0 && slide.discount_price < slide.price;
  const displayPrice = hasDiscount ? slide.discount_price : slide.price;

  // Scroll-out: content lifts and fades as user scrolls
  const contentOpacity = Math.max(0, 1 - scrollProgress * 2.5);
  const contentY = scrollProgress * 80;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[70svh] md:h-[92vh] lg:h-[calc(100vh-5rem)] min-h-[380px] md:min-h-[550px] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (isDragging) onMouseUp();
        setIsPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      aria-roledescription="carousel"
      aria-label="Featured Collections"
    >
      {/* Background slides */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: idx === currentIndex ? 1 : 0,
            zIndex: idx === currentIndex ? 1 : 0,
          }}
          aria-hidden={idx !== currentIndex}
        >
          <Image
            src={s.images[0]}
            alt={s.name}
            fill
            priority={idx === 0}
            className="object-cover object-center"
            sizes="100vw"
            unoptimized
          />
        </div>
      ))}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(14,22,20,0.85) 0%, rgba(14,22,20,0.45) 45%, rgba(14,22,20,0.15) 75%, transparent 100%)",
        }}
      />
      {/* Subtle top bar fade for header legibility */}
      <div
        className="absolute inset-x-0 top-0 h-28 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(14,22,20,0.35) 0%, transparent 100%)",
        }}
      />

      {/* Left arrow */}
      <button
        onClick={goToPrev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full text-brand-ivory/60 hover:text-brand-ivory transition-colors"
        style={{
          background: "rgba(14,22,20,0.18)",
          backdropFilter: "blur(4px)",
        }}
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right arrow */}
      <button
        onClick={goToNext}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full text-brand-ivory/60 hover:text-brand-ivory transition-colors"
        style={{
          background: "rgba(14,22,20,0.18)",
          backdropFilter: "blur(4px)",
        }}
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Centered Content — scrolls up and fades out */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 sm:px-16 pb-14 sm:pb-0 pointer-events-none"
        style={{
          opacity: contentOpacity,
          transform: `translateY(-${contentY}px)`,
          transition: "none",
        }}
      >
        <div className="max-w-2xl w-full pointer-events-auto space-y-5">
          {/* Category label — subdued, no icon */}
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-brand-ivory/55">
            {slide.category}
          </p>

          {/* Product name */}
          <h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-ivory leading-tight"
            style={{ textShadow: "0 2px 32px rgba(0,0,0,0.5)" }}
          >
            {slide.name}
          </h2>

          {/* One-liner */}
          {(slide.one_liner || slide.description) && (
            <p className="font-sans text-sm sm:text-base text-brand-ivory/65 max-w-md mx-auto leading-relaxed">
              {slide.one_liner ?? slide.description?.slice(0, 120) + "…"}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline justify-center gap-2.5">
            <span className="font-price text-2xl sm:text-3xl font-bold text-brand-ivory tracking-tight">
              ₹{displayPrice}
            </span>
            {hasDiscount && (
              <span className="font-price text-sm text-brand-ivory/40 line-through">
                ₹{slide.price}
              </span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
            <button
              onClick={() =>
                addToCart(
                  {
                    id: slide.id,
                    name: slide.name,
                    price: slide.price,
                    discount_price: slide.discount_price,
                    image: slide.images[0],
                  },
                  1,
                )
              }
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-brand-ivory transition-all active:scale-[0.97]"
              style={{
                background: "rgba(20,107,107,0.75)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(20,107,107,0.5)",
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Bag
            </button>

            <Link
              href={`/products/${slide.id}`}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-brand-ivory/80 hover:text-brand-ivory transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar: dots + scroll cue */}
      <div
        className="absolute bottom-0 inset-x-0 z-20 flex flex-col items-center pb-7 gap-5 pointer-events-none"
        style={{
          opacity: contentOpacity,
          transform: `translateY(-${contentY * 0.5}px)`,
          transition: "none",
        }}
      >
        {/* Dot indicators */}
        {totalSlides > 1 && (
          <div className="flex items-center gap-2 pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`h-1 rounded-full transition-all duration-400 ${
                  currentIndex === idx
                    ? "w-7 bg-brand-ivory/80"
                    : "w-1 bg-brand-ivory/25 hover:bg-brand-ivory/45"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Explore All scroll cue */}
        <a
          href="#our-products"
          className="pointer-events-auto flex flex-col items-center gap-1.5 text-brand-ivory/40 hover:text-brand-ivory/70 transition-colors"
          aria-label="Scroll to products"
        >
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em]">
            Explore All
          </span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
