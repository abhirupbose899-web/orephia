# Orephia Design Guidelines

## Design Approach

**Reference-Based Luxury E-Commerce**

Drawing inspiration from Net-a-Porter, Farfetch, and Matches Fashion, Orephia embodies sophisticated femininity through editorial-quality presentation. The design prioritizes generous whitespace, large-scale imagery, and refined typography with a distinctive rose-gold and wine-red color palette that communicates luxury and aspiration.

**Core Design Principles:**
- Editorial elegance with magazine-quality layouts
- Visual hierarchy with product imagery center stage
- Sophisticated restraint in color and animation usage
- Luxurious spaciousness through strategic whitespace

---

## Color System

**Primary Palette:**
- **Rose Gold** (#B76E79): Primary brand color for CTAs, accents, interactive elements, active states
- **Wine Red** (#722F37): Deep accent for hover states, secondary buttons, emphasis elements
- **White** (#FFFFFF): Primary background, card backgrounds, clean base

**Functional Colors:**
- Text Primary: #1A1A1A (near-black for body text)
- Text Secondary: #6B6B6B (labels, metadata)
- Text Light: #9CA3AF (placeholder text)
- Borders: #E5E7EB (dividers, input borders)
- Background Subtle: #F9FAFB (alternating sections)

**Application Rules:**
- Rose-gold for all primary CTAs, links, active navigation items, selected sizes/colors
- Wine-red for hover states on rose-gold elements, secondary CTAs, sale badges
- Maintain high contrast ratios for accessibility (minimum 4.5:1)
- Use white generously as breathing room between sections

---

## Typography System

**Font Families:**
- Headings: Playfair Display (serif) - Google Fonts
- Body/UI: Poppins (sans-serif) - Google Fonts

**Hierarchy:**
- Display Headlines: Playfair Display, 56px/64px, weight 600
- Section Headings: Playfair Display, 40px/48px, weight 600
- Subsection Titles: Playfair Display, 28px/36px, weight 500
- Product Names: Poppins, 20px/28px, weight 500
- Body Large: Poppins, 16px/26px, weight 400
- Body Standard: Poppins, 14px/22px, weight 400
- Small Text/Labels: Poppins, 12px/18px, weight 400
- Button Text: Poppins, 14px/20px, weight 500, letter-spacing 0.5px, uppercase

---

## Layout & Spacing System

**Tailwind Spacing Units:** 2, 4, 6, 8, 12, 16, 20, 24, 32

- Micro spacing: p-2, gap-2
- Component padding: p-4, p-6
- Section vertical: py-12 (mobile), py-20 (tablet), py-32 (desktop)
- Container horizontal: px-4 (mobile), px-8 (tablet), px-16 (desktop)
- Card spacing: gap-6 (mobile), gap-8 (desktop)
- Major breaks: mb-24, mb-32

**Container Widths:**
- Page max: max-w-7xl (1280px)
- Content blocks: max-w-6xl (1152px)
- Text content: max-w-4xl (896px)
- All centered with mx-auto

**Grid Patterns:**
- Products: grid-cols-1 (mobile) → grid-cols-2 (md) → grid-cols-3 (lg) → grid-cols-4 (xl)
- Features: grid-cols-1 (mobile) → grid-cols-2 (lg)
- Categories: grid-cols-2 (mobile) → grid-cols-3 (md) → grid-cols-4 (lg)

---

## Component Library

### Navigation
**Desktop Header:**
- Sticky, full-width, h-20, white background with subtle border-bottom
- Logo left-aligned (rose-gold treatment)
- Navigation links center: text-sm, uppercase, tracking-wider, gap-8, wine-red on hover
- Right icons: Search, Wishlist (rose-gold when items saved), Cart (with count badge), Profile
- Search expands into full-width overlay with backdrop blur

**Mobile Navigation:**
- Hamburger menu, slides from left
- Full-height white drawer with rose-gold accent line
- Menu items: text-lg, py-4, wine-red active state

### Hero Section
**Homepage Hero:**
- Large-scale lifestyle image: min-h-screen or h-[85vh]
- Centered content overlay with max-w-3xl
- Headline (Playfair Display, white text, drop-shadow for legibility)
- Subheadline + primary CTA
- CTA buttons with backdrop-blur-md, bg-white/30, rose-gold border, white text
- No hover effects on hero buttons (handled by component)

### Product Cards
**Grid Display:**
- Image: aspect-[3/4], rounded-lg, object-cover
- Hover: subtle image scale-105 (300ms ease-in-out)
- Wishlist heart: absolute top-4 right-4, outline (wine-red) when empty, filled rose-gold when saved
- Product name below: Poppins medium, text-left
- Price: rose-gold color, weight 500
- Quick view button appears on hover: wine-red background, white text
- Card padding: p-4

### Category Cards
**Large Format:**
- aspect-[4/3] or aspect-[16/9]
- Image with gradient overlay (bottom to top, transparent to wine-red/50)
- Category name: centered, large Playfair Display, white text
- "Explore Collection" link: rose-gold, centered below
- Rounded-xl corners

### Product Detail Page
**Layout:**
- Two-column: grid-cols-1 lg:grid-cols-2, gap-12
- Left: Image gallery with thumbnails (aspect-square main, 4-6 images)
- Right: Product info sticky top-24, space-y-6

**Information Blocks:**
- Product name: Playfair Display 40px
- Price: rose-gold, 28px
- Color swatches: circular (w-8 h-8), border-2 border-rose-gold when selected
- Size selector: pill buttons, rounded-full, rose-gold background when selected
- Add to cart: large rose-gold button, wine-red hover
- Wishlist: outline button, wine-red border
- Accordion sections: "Details", "Size Chart", "Care", wine-red expand icons
- Mobile: fixed bottom bar with CTA

### Shopping Cart
**Slide-out Drawer:**
- Slides from right, w-full md:w-96, white background
- Scrollable product list with thumbnails
- Item layout: horizontal, gap-4, thumbnail (w-20 h-24)
- Quantity controls: rose-gold borders, wine-red active
- Remove: wine-red text link
- Summary fixed bottom: subtotal, shipping, total (larger, rose-gold)
- Checkout CTA: full-width rose-gold button

### Checkout
**Multi-step Flow:**
- Progress dots top: wine-red active, rose-gold completed, gray upcoming
- Single column: max-w-2xl, centered
- Steps: Shipping → Payment → Review
- Form inputs: rounded-lg, border-gray, rose-gold focus ring
- Section spacing: space-y-8
- Continue buttons: rose-gold, full-width

### Profile & Account
**Tab Navigation:**
- Horizontal tabs (desktop), vertical (mobile)
- Active: rose-gold underline (border-b-2)
- Content: max-w-4xl

**Order History:**
- Card layout per order, rounded-lg, border-gray
- Order number, date, status badge (wine-red for processing, rose-gold for completed)
- Expandable item list
- Action buttons: "Track" (outline), "Reorder" (rose-gold)

### Special Features
**AI Style Recommender:**
- Prominent card: rounded-xl, subtle rose-gold/10 background
- Icon top-center (sparkle or wand)
- Headline: "Your Personal Style Guide"
- Description: 2-3 lines
- CTA: rose-gold button "Start Styling"
- Placement: Homepage after hero, subtle sidebar on product pages

**Size Chart Modal:**
- Centered overlay, max-w-3xl, white background
- Table with wine-red headers
- Close: top-right, wine-red hover
- Backdrop: blur-sm, dark overlay

---

## Images Strategy

**Hero Section:**
- Large hero image required for homepage
- Lifestyle photography: model in aspirational setting wearing featured collection
- Subtle dark overlay (opacity-20) for text legibility
- High-quality, professionally shot, 2400x1350px minimum

**Product Photography:**
- Clean white or subtle textured backgrounds
- 4-6 images per product: front, back, detail, styled, model shots
- Aspect-square for main, aspect-[3/4] for gallery
- Zoom on click/hover functionality

**Category Imagery:**
- Editorial campaign-style photography
- Lifestyle context showing accessories, textures, styling
- 1600x900px minimum for large cards

**Collection Pages:**
- Header banner: thematic lifestyle image representing collection mood
- Grid: consistent product photography style

**About/Editorial:**
- Featured blog images: aspect-[16/9]
- Designer portraits: aspect-square, rounded-full
- Behind-the-scenes: candid, aspirational workplace shots

**Image Treatment:**
- All rounded-lg except full-bleed sections
- Object-cover for consistency
- Lazy loading for performance
- Professional, high-resolution required

---

## Animations

**Minimal & Purposeful:**
- Page transitions: opacity fade, 200ms
- Button hover: subtle scale-105, 150ms
- Product card: image scale only, 300ms ease-in-out
- Drawer slides: transform, 250ms
- Dropdown menus: fade + slide, 200ms
- Wishlist heart fill: 200ms smooth
- No scroll-triggered animations
- No parallax effects
- Focus on 60fps performance

This design system creates a sophisticated, feminine luxury shopping experience through strategic use of rose-gold and wine-red accents against clean white spaces, refined typography, and editorial-quality imagery.