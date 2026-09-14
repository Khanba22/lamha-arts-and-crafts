# No-Code-Node (ncn_v2) Anti-AI-Slop Design Guidelines

Universal constraints and tokens for No-Code-Node frontend interfaces to prevent LLMs from defaulting to generic AI-slop UI patterns.

---

## Why negative instructions fail (and how to fix that)

Vague negatives like "don't make it look AI-generated" or "be more creative" do not work: "generic" is not an actionable concept for a model. What works is **naming the exact pattern** to block at the level of a CSS class or component shape. The list below is written at that level.

---

## The core prompt block

Apply this block as a hard constraint for all frontend work in ncn_v2:

```
Avoid these AI-slop patterns. Treat every one as a hard constraint, not a preference:

BADGES & PILLS
- No pill-shaped badges/tags with a soft tinted background (bg-blue-50 text-blue-600 
  rounded-full) scattered around the page as decoration.
- No floating icon-in-a-circle or icon-in-a-rounded-square above every feature block.
- No "NEW" / "BETA" / status pills unless they encode real, current state.

BOXED TEXT / FLOATING CONTAINERS
- Don't wrap a single line of text or a lone icon in its own bordered/rounded 
  container just to give it visual weight (e.g. a checklist where every row is its 
  own dark rounded box with a border, or a label like "REAL-TIME COLLABORATION & 
  VERSIONING" boxed in a pill with an icon inside it). If the content is one line 
  and isn't a button or an input, it almost never needs a box.
- Don't put a small icon alone inside its own bordered square/circle as a standalone 
  element (icon floating in a rounded-square outline with nothing else around it) — 
  this is a strong AI-slop tell on its own.
- Default to plain text with weight/color/size doing the work of hierarchy: use an 
  accent-colored checkmark, dot, or leading glyph plus normal text, not a checkmark 
  plus text both encased in a bordered box. Reserve boxes for things that are 
  actually interactive (buttons, inputs, real cards with multiple pieces of content).
- If a list of items needs separation, use spacing, a hairline divider, or 
  alternating background tint on the row — not a border-and-corner-radius box 
  around every single row.

CARDS
- No identical rounded-2xl cards with the same soft grey shadow (rgba(0,0,0,.1)) 
  under every one, regardless of what each card actually contains.
- No left-side border only elements on ANY component (cards, containers, list items, 
  nav items, rows, headers, or panels; e.g. border-l-4, border-l-2, or any border-l-* 
  accent stripe). Never use a single-side left border as a generic accent, active-state 
  marker, or visual separator. That pattern belongs strictly to standard alert/status 
  banners when explicitly requested, never to arbitrary content decoration.
- No nested cards (a card inside a card inside a section) — flatten hierarchy instead.
- Don't give every container the same border-radius. Radius should map to a scale 
  (e.g. 4px controls, 8px cards, 0px panels), not be one global value.

DIV HIERARCHY (BOXES-IN-BOXES)
- Not every nesting level gets its own border + background + padding + radius. 
  A section > container > row > item chain should not turn into four visibly 
  nested boxes — most of those divs exist for layout/spacing only and should 
  carry no visual styling at all.
- Decide, up front, which nesting levels are "structural" (layout only: no 
  border, no background, no radius — just flex/grid + gap/padding) and which are 
  "surfaces" (an actual visual card/panel). As a default: at most ONE surface per 
  2–3 levels of nesting. If a div's only job is to hold children and add spacing, 
  it gets zero decoration.
- Watch for the compounding tell: a bordered/rounded parent whose direct children 
  are each also bordered/rounded — this is what produces the "boxes inside boxes 
  inside boxes" look. If a child already reads as separate content, its parent 
  almost never also needs a border+background.
- Use whitespace, a single hairline divider, or a subtle background-color 
  shift between adjacent zones (not full box treatment) to separate sections — 
  reserve full border+radius+shadow "surface" styling for content that's truly a 
  standalone unit (a modal, a real card in a card grid, a popover).

BACKGROUNDS
- No purple/blue/indigo gradient mesh or gradient-wash hero background.
- No glassmorphism (frosted, blurred, semi-transparent panels) unless the brief 
  specifically calls for a glass surface.
- No decorative blob/wave SVGs behind content.

LAYOUT
- No centered-badge + headline + subhead + 3-equal-column-card-grid as the default 
  page shape. If a grid is used, justify the number of columns from the content.
- No hero-with-floating-screenshot-on-a-gradient.
- No "Most Popular" middle-column pricing tier with a gradient highlight.

TYPOGRAPHY & CHROME
- Don't use Inter (or its most common substitute) as the only typeface without 
  a deliberate reason — pick something specific to the subject matter.
- No tracked-out ALL-CAPS eyebrow label above every heading.
- No meta text joined with middle dots (A · B · C) as a default separator.
- No em-dash-led labels ("WORD — fragment") applied everywhere as filler chrome.
- Don't accent a single word in a headline with italics/bold/color as the only 
  typographic move — earn emphasis through the type system, not one-off styling.

MOTION
- No fade-and-slide-up entrance animation on every section, and no hover-lift on 
  every card. Motion should answer a real action (open, confirm, expand) or mark 
  one deliberate moment — not decorate everything uniformly.

DEPTH & ICONS
- No dashboard mockup / fake product screenshot used purely as hero decoration.
- No generic line-icon library icon standing in for a concept with no visual link 
  to the actual subject matter.
```

---

## Make it enforceable: give it a design system, not just a "don't" list

Negative constraints work far better paired with **positive, concrete tokens** the model can actually honor.

```
Design tokens for No-Code-Node (ncn_v2):
- Base spacing unit: 4px. Use only 4/8/12/16/24/32/48/64 (px-2.5 py-1.5, px-4 py-2, p-4, p-6).
- Border radius: 6px (rounded-md) for badges and controls, 8px (rounded-lg) for inputs/buttons, 12px (rounded-xl) for cards, 0px for panels, sidebars, and canvas surfaces. No rounded-full except for user avatars.
- Borders: 1px solid only (rgba(255,255,255,0.08) or border-border), never 2px+. No single-side or left-side accent borders (border-l-*, border-r-2, border-l-4) on any element (cards, rows, tabs, inputs, containers, sidebars).
- Shadows: at most one subtle shadow token: 0 4px 16px rgba(0,0,0,0.4) or 0 1px 3px rgba(0,0,0,0.3). No colored glow halos, fake neon outer spreads, or dramatic drop-shadow stacking.
- Palette:
  - Root Canvas: #000000
  - Surface Base: #090a0f (sidebars, toolbars)
  - Surface Secondary: #11131a (cards, panel interiors)
  - Surface Elevated: #161922 (modals, dropdowns)
  - Primary Accent: #6366f1 (buttons, active indicator)
  - Text Primary: #f8fafc
  - Text Secondary: #94a3b8
  - Text Muted: #64748b
- Typography: Poppins for UI navigation and labels, monospace (ui-monospace, SFMono-Regular, Consolas) for schema properties, endpoints, code diffs, and system identifiers.
- Visual archetype: Obsidian Minimal / Technical IDE Workbench. Pure black backdrop, crisp 1px borders, purposeful data density, zero decorative gradients, zero decorative blob SVGs, zero glowing accent stripes.
```

A model given real hex values, a spacing scale, and a named archetype has something to check its own output against. "No gradients" alone gives it nothing to replace the gradient with, so it often reaches for the next most common default instead.

---

## The boxes-in-boxes fix (div hierarchy)

This is the most common structural cause of "AI slop" — worth its own explanation because it's not a style choice, it's a habit in how the model writes markup: it tends to give every `<div>` the same treatment (`rounded-lg border bg-* p-4`) regardless of whether that div is doing layout or actually presenting a unit of content. Nest three or four of those and you get concentric boxes.

**The fix is to classify every div into one of two roles before styling it, and only ever style one role:**

- **Structural divs** — exist only to group and space children (a flex row, a grid, a section wrapper). These get layout props only: `flex`, `grid`, `gap-*`, `p-*` for spacing. No `border`, no `bg-*`, no `rounded-*`, no `shadow-*`. Ever.
- **Surface divs** — represent one real, standalone visual unit (an actual card, a modal, a popover, a toolbar). These are the only divs allowed a border/background/radius/shadow combination — and once you're inside a surface div, its children go back to being structural until you hit the next genuinely separate unit.

```
✗ Boxes-in-boxes (every level styled)
<div class="border rounded-xl bg-zinc-900 p-6">          ← surface
  <div class="border rounded-lg bg-zinc-800 p-4">        ← surface (unnecessary)
    <div class="border rounded-md bg-zinc-800 p-3">      ← surface (unnecessary)
      <span>Node.js (Express)</span>
    </div>
  </div>
</div>

✓ One surface, rest structural
<div class="border rounded-xl bg-zinc-900 p-6">           ← surface
  <div class="flex flex-col gap-3">                       ← structural, no styling
    <div class="flex items-center gap-2">                 ← structural, no styling
      <CheckIcon class="text-emerald-400" />
      <span>Node.js (Express)</span>
    </div>
  </div>
</div>
```

A one-line rule to drop straight into a prompt:

```
Classify every div as either "structural" (layout/spacing only — no border, 
background, radius, or shadow) or "surface" (an actual standalone visual unit). 
Style surfaces only. Default to at most one surface per 2–3 levels of nesting. 
Before finishing, scan for any bordered/rounded div whose direct parent is also 
bordered/rounded — collapse or destyle one of the two.
```

---

## Process prompt (for agents/Claude Code specifically)

If you're using this inside an agentic workflow (Claude Code, a build agent, etc.), add a review step so the model checks its own work instead of shipping the first draft:

```
Before finishing: review your own output against the anti-slop list above. 
If two or more categories fail, revise before calling the UI done. State what 
you changed and why.
```

---

## Quick version (for short prompts / low context budget)

```
No pill badges with tinted backgrounds. No boxing a single line of text or a lone 
icon in its own bordered container (checklist rows, labels, standalone icons): use 
plain text with an accent glyph instead. Classify every div as structural 
(layout only, no styling) or surface (one real visual unit): never border, 
background, or radius on every nesting level; collapse bordered divs whose parent 
is also bordered. No left-side border only elements on any component (no border-l-* 
accent stripes on cards, rows, containers, or panels). No identical rounded-2xl cards 
with the same soft shadow on every one. No purple or blue gradient hero. No Inter-only 
typography: use Poppins and monospace. No fade-up entrance animation on every section. 
Adhere to the Obsidian Minimal technical workbench archetype.
```

---

### Notes
- Use the project design tokens defined above.
- These rules describe what to avoid by default. If a specific task explicitly asks for an exception, follow the prompt for that isolated case only.