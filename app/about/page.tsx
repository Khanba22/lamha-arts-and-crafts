import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  Sparkles,
  Trophy,
  Heart,
  Gift,
  Palette,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story & Heritage | Lamha Arts & Craft",
  description:
    "Discover the journey of Lamha Arts & Craft, founded by Megha Baheti. Winner of the Maharashtra Udyogratna Award 2026 for handcrafted festive and pooja décor.",
};

export default function AboutPage() {
  const whatsappNumber = "917875123939";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Namaste Lamha Arts & Craft! 🙏 I read your story and would like to inquire about custom handcrafted pieces."
  )}`;

  return (
    <div className="w-full bg-brand-ivory text-brand-charcoal">
      {/* 1. Hero Banner */}
      <section className="border-b border-border-soft bg-brand-cream/60 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <span className="font-script font-semibold text-xs sm:text-sm tracking-wider uppercase text-brand-pink block">
            Handcrafted with cultural devotion
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-peacock tracking-tight">
            Our Journey &amp; Heritage
          </h1>
          <p className="font-sans text-sm sm:text-base text-brand-charcoal/75 italic max-w-xl mx-auto">
            &ldquo;We Create What You Imagine&rdquo;
          </p>
          <div className="pt-2 max-w-2xl mx-auto">
            <p className="font-sans text-sm sm:text-base text-brand-charcoal/85 leading-relaxed">
              At <strong className="text-brand-peacock font-semibold">Lamha Arts &amp; Craft</strong>, every creation is more than just beautiful packaging; it is a celebration of emotions, traditions, and unforgettable festive moments.
            </p>
          </div>
        </div>
      </section>

      {/* 2. The Story Behind The Brand & Founder Profile */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-border-soft">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Founder Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-gold">
                The Story Behind The Brand
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand-peacock tracking-tight leading-tight">
                Passion for Artistry, Driven by Heart
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-brand-charcoal/80 leading-relaxed font-sans">
              <p>
                Founded with a passion for handcrafted artistry and thoughtful design, Lamha Arts &amp; Craft has grown into a trusted destination for luxury trousseau packing, wedding gifting, festive hampers, customized gift packaging, and elegant pooja décor accessories.
              </p>
              <p>
                Every piece is carefully handcrafted with premium materials, deep attention to traditional motifs, and an unwavering commitment to excellence. From divine Shubh Labh wall accents to intricately embellished organza potlis, our work reflects the sacred spirit of Indian celebrations.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/#our-products"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-peacock px-5 py-3 text-xs font-semibold tracking-wide text-brand-ivory hover:bg-brand-peacock/90 shadow-card transition-all"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border-soft bg-brand-cream hover:bg-peacock-tint px-5 py-3 text-xs font-semibold tracking-wide text-brand-peacock transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire Custom Order</span>
              </a>
            </div>
          </div>

          {/* Right Column: Founder Photograph */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-xl border border-border-soft bg-brand-cream overflow-hidden shadow-card">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src="/founder.jpg"
                  alt="Megha Baheti, Founder of Lamha Arts & Craft"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
              <div className="p-4 border-t border-border-soft bg-brand-cream text-center space-y-0.5">
                <h3 className="font-serif text-lg font-bold text-brand-peacock">
                  Megha Baheti
                </h3>
                <span className="font-sans text-xs font-semibold text-brand-gold uppercase tracking-wider block">
                  Founder &amp; Creative Director
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recognition & Excellence: Maharashtra Udyogratna Award 2026 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-brand-cream/40 border-b border-border-soft">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Award Ceremony Photo */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
            <div className="relative w-full max-w-md rounded-xl border border-border-gold bg-brand-cream overflow-hidden shadow-card">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/award-ceremony.jpg"
                  alt="Maharashtra Udyogratna Award 2026 Ceremony"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
              </div>
              <div className="p-3.5 border-t border-border-gold bg-brand-ivory text-center">
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                  Maharashtra Udyogratna 2026 Ceremony
                </span>
              </div>
            </div>
          </div>

          {/* Award Context */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="space-y-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-gold">
                Recognition &amp; Excellence
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand-peacock tracking-tight leading-tight">
                Maharashtra Udyogratna Award 2026
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-brand-charcoal/80 leading-relaxed font-sans">
              <p>
                Our dedication to creativity, cultural reverence, and customer satisfaction was officially recognized with the prestigious <strong className="text-brand-charcoal font-semibold">Maharashtra Udyogratna Award 2026</strong>.
              </p>
              <p>
                This honor reflects our commitment to artisan innovation, meticulous craftsmanship, and local woman-led entrepreneurship. This milestone inspires us to keep crafting timeless festive creations that bring joy and divine blessings into homes across India.
              </p>
            </div>

            {/* Award highlight card */}
            <div className="rounded-lg border border-border-gold bg-gold-tint/50 p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-md bg-brand-ivory text-brand-gold flex-shrink-0 border border-border-gold">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-brand-peacock uppercase tracking-wide">
                  State Recognition for Craft &amp; Innovation
                </h4>
                <p className="text-xs text-brand-charcoal/70">
                  Awarded for excellence in handcrafted trousseau and festive heritage art.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Serving India With Love */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-border-soft">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-gold">
            Serving India With Love
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand-peacock tracking-tight">
            Every Moment Deserves Elegance
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-brand-charcoal/80 leading-relaxed font-sans text-left sm:text-center">
            <p>
              Whether it is a wedding, engagement, baby shower, housewarming, or festive pooja, we believe every sacred moment deserves to be presented with elegance and affection.
            </p>
            <p>
              Today, Lamha Arts &amp; Craft proudly serves patrons across India, turning festive aspirations into tangible heirlooms. We remain steadfast in our promise of authenticity, custom artistry, and heartfelt service.
            </p>
          </div>
        </div>
      </section>

      {/* 5. What We Stand For: Four Core Pillars */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-brand-cream/30 border-b border-border-soft">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-2">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-gold">
              What We Stand For
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand-peacock tracking-tight">
              Our Craft Commitments
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-border-soft bg-brand-cream p-6 flex flex-col items-center text-center space-y-3 shadow-card">
              <div className="p-3 rounded-lg bg-peacock-tint text-brand-peacock">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-brand-peacock uppercase tracking-wide">
                Handcrafted with Care
              </h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-sans">
                Every piece is shaped by hand using premium materials, ensuring uniqueness and authentic durability in each creation.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-border-soft bg-brand-cream p-6 flex flex-col items-center text-center space-y-3 shadow-card">
              <div className="p-3 rounded-lg bg-peacock-tint text-brand-peacock">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-brand-peacock uppercase tracking-wide">
                Luxury Packaging
              </h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-sans">
                Trousseau packing, wedding hampers, and gift boxes crafted to create indelible impressions for families and guests.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-border-soft bg-brand-cream p-6 flex flex-col items-center text-center space-y-3 shadow-card">
              <div className="p-3 rounded-lg bg-peacock-tint text-brand-peacock">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-brand-peacock uppercase tracking-wide">
                Customized Creations
              </h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-sans">
                We bring personal visions to reality. Every design is customized to your specific festival theme, colors, and preferences.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-xl border border-border-soft bg-brand-cream p-6 flex flex-col items-center text-center space-y-3 shadow-card">
              <div className="p-3 rounded-lg bg-peacock-tint text-brand-peacock">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-brand-peacock uppercase tracking-wide">
                Award-Winning Honor
              </h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-sans">
                Honored with the Maharashtra Udyogratna Award 2026 for artistic innovation and craftsmanship excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing Call-To-Action */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center bg-brand-ivory">
        <div className="mx-auto max-w-2xl space-y-6">
          <blockquote className="font-serif text-2xl sm:text-3xl font-bold text-brand-peacock italic">
            &ldquo;We Create What You Imagine&rdquo;
          </blockquote>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand-charcoal/60">
            Lamha Arts &amp; Craft
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/#our-products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-peacock px-6 py-3.5 text-xs font-semibold tracking-wide text-brand-ivory hover:bg-brand-peacock/90 shadow-card transition-all"
            >
              <span>Shop Handcrafted Collections</span>
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border-soft bg-brand-cream hover:bg-peacock-tint px-6 py-3.5 text-xs font-semibold tracking-wide text-brand-peacock shadow-card transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Custom Order</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
