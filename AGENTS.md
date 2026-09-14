<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Strict Color & Styling Rules — Lamha Arts and Craft

All styling must adhere strictly to the design tokens defined in `app/globals.css` and `design.md`.

## 1. Zero Hardcoding Rule
- **STRICT PROHIBITION**: Do NOT hardcode any colors in component styles or Tailwind classes (no `bg-[#146B6B]`, no `text-[#E6598C]`, no arbitrary Tailwind colors like `bg-teal-700`, `text-pink-500`, `border-gray-200`, `shadow-black`, etc.).
- All borders, background fills, text colors, badges, and shadows MUST use the semantic tokens defined in `app/globals.css`.
- If any new color, tint, border style, or shadow is required, it must first be declared as a CSS variable in `app/globals.css` before use.

## 2. Permitted Color & Theme Tokens
- **Backgrounds**:
  - `bg-brand-ivory` (Page base background)
  - `bg-brand-cream` (Cards, panels, modal surfaces)
  - `bg-brand-peacock` (Primary CTA, header nav, brand voice)
  - `bg-brand-pink` (Warm accents, sale badges, wishlist active)
  - `bg-brand-gold` (Punctuation highlights, featured badge)
  - `bg-peacock-tint`, `bg-pink-tint`, `bg-gold-tint` (Subtle overlays & pills)
- **Text**:
  - `text-brand-charcoal` (Primary readable body text)
  - `text-brand-peacock` (Primary headlines, links, brand statements)
  - `text-brand-pink` (Script accents, price accents, warm notes)
  - `text-brand-gold` (Fine gold accents, stars, metadata notes)
  - `text-brand-ivory` (Light text on peacock/pink buttons)
- **Borders**:
  - `border-border-soft` (Subtle peacock-tinted divider)
  - `border-border-subtle` (Neutral charcoal-tinted divider)
  - `border-border-gold` (Featured card border)
  - `border-border-pink` (Accent borders)
  - `border-brand-peacock`, `border-brand-gold`, `border-brand-pink`
- **Shadows**:
  - `shadow-card` (Warm charcoal soft elevation)
  - `shadow-card-hover` (Elevated card state)
  - `shadow-dropdown` (Menus and modals)
  - `shadow-gold` (Glow for featured items)
- **Typography**:
  - `font-display` / `font-serif` (Playfair Display for headlines & titles)
  - `font-script` (Alex Brush for handwritten accents in brand-pink)
  - `font-ui` / `font-sans` (Plus Jakarta Sans for prices, buttons, information)
