"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ShoppingBag, Sparkles, MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";

export function Footer() {
  const whatsappNumber = "917875123939";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Namaste Lamha Arts & Craft! 🙏 I would like to place an order or inquire about your handcrafted collections."
  )}`;

  return (
    <footer className="w-full bg-brand-cream border-t border-border-soft text-brand-charcoal">
      {/* Prominent WhatsApp Call-To-Action Banner */}
      <div className="border-b border-border-soft bg-peacock-tint/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="font-script font-semibold text-xs sm:text-sm tracking-wider uppercase text-brand-pink block">
              Direct Artisan Consultation
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-peacock tracking-tight">
              Looking for Custom Décor or Bulk Festive Orders?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-brand-charcoal/75 max-w-xl">
              Connect directly with our founder and craft team on WhatsApp for bespoke trousseau packing, custom dimensions, and urgent dispatch requests.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-lg bg-brand-peacock px-6 py-3.5 text-sm font-semibold text-brand-ivory hover:bg-brand-peacock/90 shadow-card transition-all flex-shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat on WhatsApp (+91 78751 23939)</span>
          </a>
        </div>
      </div>

      {/* Main Footer Links & Information Grid */}
      <div className="mx-auto max-w-7xl py-14 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Col 1 & 2: Brand Heritage and Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border-soft bg-brand-ivory flex-shrink-0">
                <Image
                  src="/logo_badge.png"
                  alt="Lamha Arts & Craft Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-brand-peacock block">
                  LAMHA ARTS & CRAFT
                </span>
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold block">
                  We Create What You Imagine
                </span>
              </div>
            </Link>

            <p className="font-sans text-xs sm:text-sm text-brand-charcoal/75 leading-relaxed max-w-sm">
              Authentic Indian festive décor, Shubh Labh hangings, handcrafted T-lights, and luxury wedding trousseau packing, designed with cultural devotion in Maharashtra, India.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-brand-peacock">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Maharashtra Udyogratna Award 2026 Winner</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium text-brand-charcoal/80">
              <li>
                <Link href="/" className="hover:text-brand-peacock transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#our-products" className="hover:text-brand-peacock transition-colors">
                  Our Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-peacock transition-colors">
                  Our Story &amp; Heritage
                </Link>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-brand-peacock transition-colors"
                >
                  <span>Custom Orders</span>
                  <ArrowUpRight className="w-3 h-3 text-brand-charcoal/40" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Festive Collections */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
              Collections
            </h4>
            <ul className="space-y-2 text-xs font-medium text-brand-charcoal/80">
              <li>
                <Link href="/#our-products" className="hover:text-brand-peacock transition-colors">
                  Shubh Labh Hangings
                </Link>
              </li>
              <li>
                <Link href="/#our-products" className="hover:text-brand-peacock transition-colors">
                  T-Light Sets &amp; Diyas
                </Link>
              </li>
              <li>
                <Link href="/#our-products" className="hover:text-brand-peacock transition-colors">
                  Haldi Kumkum Platters
                </Link>
              </li>
              <li>
                <Link href="/#our-products" className="hover:text-brand-peacock transition-colors">
                  Torans &amp; Door Adornments
                </Link>
              </li>
              <li>
                <Link href="/#our-products" className="hover:text-brand-peacock transition-colors">
                  Luxury Trousseau Hampers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Studio Info */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wider">
              Artisan Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-charcoal/80">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-brand-peacock flex-shrink-0 mt-0.5" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-peacock transition-colors"
                >
                  +91 78751 23939 (WhatsApp)
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-peacock flex-shrink-0 mt-0.5" />
                <span>Maharashtra, India</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-peacock flex-shrink-0 mt-0.5" />
                <span>Mon to Sat: 10:00 AM to 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Craftsmanship Bar */}
      <div className="border-t border-border-soft bg-brand-cream/80 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-charcoal/60">
          <p>
            &copy; 2026 Lamha Arts &amp; Craft. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-brand-pink font-script text-xs font-semibold tracking-wider uppercase">
              Handmade with Cultural Devotion
            </span>
            <span>&bull;</span>
            <span>All India Dispatch</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
