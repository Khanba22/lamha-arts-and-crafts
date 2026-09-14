"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle, Menu, X, BookOpen } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const { openDrawer, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappMessage = encodeURIComponent(
    "Namaste Lamha Arts & Craft! 🙏 I would like to inquire about your handcrafted festive and pooja decor collections."
  );
  const whatsappUrl = `https://wa.me/917875123939?text=${whatsappMessage}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-soft bg-brand-ivory/95 backdrop-blur-md shadow-card transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo and Title */}
        <Link
          href="/"
          className="group flex items-center gap-3.5 focus:outline-none"
          aria-label="Lamha Arts & Craft Home"
        >
          {/* Logo circular badge */}
          <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-border-pink bg-brand-ivory p-0.5 shadow-card transition-transform group-hover:scale-105">
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <Image
                src="/logo_badge.png"
                alt="Lamha Arts & Craft Logo"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          {/* Brand Typography */}
          <div className="flex flex-col justify-center">
            <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-brand-peacock group-hover:opacity-90">
              LAMHA ARTS & CRAFT
            </span>
            <span className="font-sans text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-charcoal/70">
              WE CREATE WHAT YOU IMAGINE
            </span>
          </div>
        </Link>

        {/* Right Desktop: Navigation Tabs & Actions */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {/* Our Story Tab */}
          <Link
            href="/about"
            className="group flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-charcoal transition-colors hover:text-brand-peacock"
          >
            <BookOpen className="w-4 h-4 text-brand-charcoal/60 group-hover:text-brand-peacock transition-colors" />
            <span>Our Story</span>
          </Link>

          {/* WhatsApp Contact Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-peacock-tint px-4 py-2 text-sm font-semibold text-brand-peacock transition-all hover:border-brand-peacock hover:bg-brand-peacock hover:text-brand-ivory shadow-card hover:shadow-card-hover"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Contact</span>
          </a>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={openDrawer}
            className="relative inline-flex items-center gap-2 rounded-full bg-brand-peacock px-4 py-2 text-sm font-semibold text-brand-ivory shadow-card transition-all hover:bg-brand-peacock/90 hover:shadow-card-hover active:scale-[0.98]"
            aria-label={`Shopping cart with ${totalItems} items`}
          >
            <ShoppingBag className="w-4 h-4 text-brand-ivory" />
            <span>Cart</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-pink px-1.5 text-xs font-bold text-brand-ivory shadow-card">
              {totalItems}
            </span>
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Cart Trigger */}
          <button
            onClick={openDrawer}
            className="relative rounded-full p-2 text-brand-peacock bg-peacock-tint hover:bg-peacock-tint-strong"
            aria-label={`Shopping cart with ${totalItems} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-pink px-1 text-[10px] font-bold text-brand-ivory">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-brand-charcoal hover:bg-brand-cream"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Drawer / Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border-soft bg-brand-cream/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-charcoal hover:bg-brand-ivory hover:text-brand-peacock"
            >
              <BookOpen className="w-4 h-4 text-brand-peacock" />
              <span>Our Story</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border border-border-soft bg-peacock-tint px-4 py-2.5 text-sm font-semibold text-brand-peacock hover:bg-brand-peacock hover:text-brand-ivory"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Contact</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
