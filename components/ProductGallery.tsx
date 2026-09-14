"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X, ShoppingBag } from "lucide-react";
import { useImageCache } from "@/context/ImageContext";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const { preloadImages, getCachedUrl } = useImageCache();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      preloadImages(images);
    }
  }, [images, preloadImages]);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[selectedIndex] : null;

  const goToNext = useCallback(() => {
    if (!hasImages) return;
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [hasImages, images.length]);

  const goToPrev = useCallback(() => {
    if (!hasImages) return;
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [hasImages, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, isLightboxOpen]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!hasImages) {
    return (
      <div className="aspect-square w-full rounded-xl border border-border-soft bg-brand-cream flex flex-col items-center justify-center p-8 text-brand-charcoal/40">
        <ShoppingBag className="w-16 h-16 mb-2 stroke-1" />
        <span className="text-sm font-medium">No preview images available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
      {/* Thumbnail Strip (Left column on large screens, horizontal scroll on mobile) */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto max-h-[540px] pb-2 lg:pb-0 scrollbar-none flex-shrink-0">
          {images.map((img, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border transition-all ${
                  isActive
                    ? "border-brand-peacock ring-1 ring-brand-peacock"
                    : "border-border-soft hover:border-brand-peacock/60 opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${idx + 1} of ${images.length}`}
              >
                <Image
                  src={getCachedUrl(img)}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image Stage */}
      <div
        className="relative flex-1 aspect-square w-full rounded-xl border border-border-soft bg-brand-cream overflow-hidden group select-none shadow-card"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentImage && (
          <Image
            src={getCachedUrl(currentImage)}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        {/* Top Floating Controls: Counter and Zoom */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {images.length > 1 ? (
            <span className="pointer-events-auto text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-brand-ivory/90 text-brand-charcoal border border-border-soft shadow-card">
              {selectedIndex + 1} / {images.length}
            </span>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="pointer-events-auto p-2 rounded-lg bg-brand-ivory/90 text-brand-charcoal hover:text-brand-peacock hover:bg-brand-ivory border border-border-soft shadow-card transition-colors"
            title="Open full-resolution zoom"
            aria-label="Zoom image"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Previous and Next Navigation Arrows (Visible when multiple images exist) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-ivory/90 text-brand-charcoal hover:text-brand-peacock hover:bg-brand-ivory border border-border-soft shadow-card transition-all sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-ivory/90 text-brand-charcoal hover:text-brand-peacock hover:bg-brand-ivory border border-border-soft shadow-card transition-all sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Mobile Swipe Guidance Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-1.5 pointer-events-none lg:hidden">
            {images.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all ${
                  dotIdx === selectedIndex
                    ? "w-5 bg-brand-peacock"
                    : "w-1.5 bg-brand-charcoal/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {isLightboxOpen && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-brand-charcoal/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-xs font-mono text-brand-ivory/80">
              {selectedIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-brand-ivory/20 text-brand-ivory hover:bg-brand-ivory/40 transition-colors"
              aria-label="Close zoomed preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative w-full max-w-4xl aspect-square max-h-[85vh]">
            <Image
              src={getCachedUrl(currentImage)}
              alt={`${productName} zoomed`}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-4 mt-4">
              <button
                type="button"
                onClick={goToPrev}
                className="p-2.5 rounded-full bg-brand-ivory/20 text-brand-ivory hover:bg-brand-ivory/40 transition-colors"
                aria-label="Previous zoomed image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="p-2.5 rounded-full bg-brand-ivory/20 text-brand-ivory hover:bg-brand-ivory/40 transition-colors"
                aria-label="Next zoomed image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
