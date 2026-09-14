# Design System — Lamha Arts and Craft
*Theme: "Marigold Pop", re-grounded in the brand logo · v3*

## 1. Where this design comes from

Every decision below traces back to one source: the logo. That's deliberate — a customer's first and most repeated brand touchpoint is the logo, so the website should feel like it was built *around* it, not paired with it as an afterthought.

What the logo actually tells us about the brand:
- **A tall, confident serif monogram** (the L and C) — structured, a little formal, not childish or playful-only.
- **A loose, handwritten script** for "Arts" in pink — the one moment of warmth and informality against the structured serif. This contrast (structured serif + free-hand script) is the core typographic idea of the whole brand, not just the logo.
- **Delicate watercolor florals with fine gold linework** — hand-illustrated, not clip-art, not a repeating pattern. Used once, generously, as a focal illustration — not tiled as a background texture.
- **A thin circular ring** enclosing the monogram — restraint. One clean geometric line holding an otherwise organic mark together.
- **Gold used only as accent marks** (a sparkle, a small flower) — never as a fill, never as a gradient. Gold is punctuation, not paint.
- **The tagline, "We create what you imagine"** — this is a made-to-order, customisable-craft promise. The site should feel like it's introducing you to a maker, not just listing SKUs.

**The job of the website, in one line:** feel like this logo, expanded into a room — structured and calm where the logo is calm (the ring, the serif), warm and human where the logo is warm (the script, the florals), and let the products carry the rest of the color.

---

## 2. Color system

Pulled directly from the logo's three brand colors, with roles assigned — this is a *system*, not a swatch list. Each color has a job; none of them are decorative filler.

| Role | Color | Hex | Job |
|---|---|---|---|
| **Anchor** | Deep peacock teal | `#146B6B` | The brand's "voice" color — primary text on light backgrounds, the monogram color, nav, footer, primary buttons. This is what makes the site feel like *this* brand and not a generic pink-and-gold craft site. |
| **Warmth** | Rose pink | `#E6598C` | The "Arts" script color — reserved for warmth-and-emphasis moments: sale badges, the odd handwritten-style callout, hover states, wishlist/heart icon. Used like the script in the logo — one accent stroke, not a wash. |
| **Detail** | Muted gold | `#B98A3E` | Punctuation only — thin dividers, small icon marks, star/sparkle accents between sections, border on a "featured" card. Never a background fill, never gradient gold. |
| **Base** | Warm ivory | `#FBF7F0` | Page background. Reads as the paper the logo sits on, not stark e-commerce white. |
| **Surface** | Soft cream | `#F3ECE0` | Card and panel backgrounds — one step down from the base, for separating product cards without a hard border. |
| **Ink** | Deep charcoal-teal | `#20302E` | Body text — softer than pure black, keeps the teal family consistent even in text you don't consciously notice. |

**Why no orange/marigold here, despite the theme name:** the brand's own palette is stronger and more specific than a generic festive palette — teal and rose-pink are a much less common pairing in this category than the usual red/gold "Indian decor" default, which makes the site instantly recognizable as *this* brand rather than a template. That specificity is more valuable than matching a generic "festive" mood board.

**How the pop happens without a loud background:** teal + rose-pink are both fully saturated colors used at full strength wherever they appear (buttons, badges, the script accent) — they're just used in small, confident doses against the calm ivory base, the same ratio the logo itself uses (mostly white, with teal/pink/gold doing focused work). That's what "poppy but not cluttered" means in practice.

---

## 3. Typography

Two families, directly inheriting the logo's serif-plus-script contrast:

- **Display serif** (headlines, product names, section titles) — a tall, slightly classic serif with the same personality as the logo's "L" and "C": confident vertical strokes, a little editorial, not delicate. This carries the brand's *structure*.
- **Script accent** (used sparingly — a homepage lead-in line, "handmade with love" style moments, maybe the category label for one hero product) — a loose, warm script echoing the pink "Arts" in the logo. This is a seasoning, not a base ingredient: never body text, never more than one line at a time, always in the rose-pink.
- **Body / UI sans** (paragraphs, buttons, prices, navigation, product descriptions) — a clean, humanist sans with good legibility at small sizes. Its whole job is to disappear and let the serif and script do the talking.

**Rule of thumb:** if you're not sure whether something should be serif, script, or sans — ask whether it's a *statement* (serif), a *feeling* (script), or *information* (sans). Prices, sizes, and delivery details are always sans, no exceptions — festive shouldn't come at the cost of a customer misreading a price.

---

## 4. Design terminology, and what each one means for this site specifically

A shared vocabulary so future decisions ("should this be a hero?", "is this enough whitespace?") have a clear answer, not a vibe check.

- **Hero** — the first full-width section on any page. On the homepage, this should be one strong lifestyle or product image (a decorated home, a toran in situ, or a maker at work) with the display serif headline and, optionally, one script line — not a slideshow of five competing offers.
- **Whitespace (negative space)** — the empty ivory around and between elements. Treat it as a design material, not leftover space: the logo works because of how much white surrounds a small, detailed mark. The site should breathe the same way — generous padding around product photos, no cramming five categories into one row on mobile.
- **Visual hierarchy** — the order the eye is guided in: biggest/boldest first (hero headline), then structure (category names, serif), then detail (price, material, sans), then decoration (gold divider marks) last. If a gold sparkle is competing with the price for attention, the hierarchy is broken.
- **Focal point** — the one thing on a section a viewer's eye lands on first. Every section should have exactly one — usually a product photo or the headline, never a decorative flourish.
- **Accent color** — teal and pink aren't "the brand colors" used everywhere equally; they're accents applied with intention (see the color table). A page that's 80% teal has lost the plot as much as one that's 80% pink.
- **Motif** — a small repeating brand mark (here: the thin circle ring, the small gold sparkle/flower from the logo's tagline divider). Use motifs as *punctuation* between sections (a thin ring around a category icon, a small gold sparkle between two testimonials) — never as a repeating background pattern or border.
- **Texture vs. pattern** — texture (subtle paper grain, fabric weave) can sit quietly behind content; pattern (repeating paisley, florals, mandalas) competes with products and should be avoided per the original brief. The logo's florals are an *illustration*, appearing once, not a pattern.
- **Grid** — the invisible column structure product cards and content sit on. Keep it consistent (e.g. a 4-column desktop grid collapsing to 2-column mobile) so the page feels ordered even when individual products are visually busy.
- **Badge** — the small colored label on a product card ("Bestseller", "New", "Sale"). These should be sans-serif, small, and use rose-pink or gold sparingly — they're information, not decoration, even though they're colorful.
- **Card** — the container around each product (photo + name + price). Should use the soft cream surface color, no heavy shadow, no gold border by default — reserve any gold border treatment for genuinely featured/bestseller items so it still means something.
- **Micro-interaction** — small feedback moments (a heart icon filling in rose-pink on wishlist, a gentle scale on hover). These should feel handmade and warm, echoing the script accent — not slick SaaS animation.

---

## 5. Imagery direction

- **Product photography:** keep the existing dark-cloth-backdrop style for individual product shots — it's already a strong, consistent brand asset and makes the saturated product colors glow. Don't force products onto white studio backgrounds to "match" the site; let the ivory site background be the mat *around* the dark product photos, the way a gallery frame sits around a dark painting.
- **Lifestyle/hero photography:** warmer, in-situ shots (a decorated doorway, a pooja thali in use, a table styled with a runner) — daylight, warm tones, a home setting. This is where the ivory/cream palette lives.
- **Illustration:** if you use any illustrated elements beyond the logo (section dividers, empty-state graphics), match the logo's own hand-drawn floral/linework style — thin gold line, soft pink watercolor fill. Never a different illustration style competing with the logo's.

## 6. What the site needs to accomplish

Beyond "look nice" — the design should functionally do these things:
1. **Make the maker visible.** The tagline is a promise of custom, handmade work — product pages and the homepage should surface the "who made this" and "can this be customized" story, not just specs and price.
2. **Let color mean something.** Because the products are already maximalist, the site's restrained use of teal/pink/gold needs to consistently mean the same things (teal = structure/navigation, pink = warmth/action, gold = detail/festive punctuation) so customers learn the system quickly.
3. **Build trust for gifting purchases.** Many of these are bought as gifts or for a specific festival/occasion — the design should make it easy to browse by occasion (Diwali, Janmashtami, housewarming) and reassure on delivery timing, since gifting has a deadline attached.
4. **Scale gracefully.** With 100+ SKUs across many categories, the calm ivory base and consistent grid need to hold up over a large, dense catalogue — not just a curated homepage.

## 7. What's next
1. Confirm two specific typeface names (one serif, one script, one sans) for approval.
2. Turn the color table into implementation-ready CSS variables, including states (hover, disabled, sale, bestseller).
3. Design the core components against real catalogue items: product card, category grid, product detail page, and the homepage hero, using this system.