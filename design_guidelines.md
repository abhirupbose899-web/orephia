# Orephia Design Guidelines

## Design Approach

**Reference-Based Luxury E-Commerce**

Drawing inspiration from premium fashion platforms like Net-a-Porter, Farfetch, and Matches Fashion, Orephia will embody sophisticated minimalism with editorial-quality presentation. The design prioritizes generous whitespace, large-scale imagery, and refined typography to create an aspirational shopping experience.

**Core Design Principles:**
- Editorial elegance: Magazine-quality layouts with breathing room
- Visual hierarchy: Product imagery takes center stage
- Sophisticated restraint: Purposeful use of design elements
- Luxurious spaciousness: Generous margins and padding communicate premium positioning

---

## Typography System

**Hierarchy:**
- Display Headlines (Hero sections): Playfair Display, 56px/64px, weight 600
- Section Headings: Playfair Display, 40px/48px, weight 600
- Subsection Titles: Playfair Display, 28px/36px, weight 500
- Product Names: Poppins, 20px/28px, weight 500
- Body Text Large: Poppins, 16px/26px, weight 400
- Body Text Standard: Poppins, 14px/22px, weight 400
- Small Text/Labels: Poppins, 12px/18px, weight 400
- Button Text: Poppins, 14px/20px, weight 500, letter-spacing 0.5px

**Implementation Notes:**
- Use serif (Playfair Display) exclusively for headings to establish luxury positioning
- Maintain consistent line-height ratios for readability
- Reserve Playfair Display for emotional moments; use Poppins for functional content

---

## Layout & Spacing System

**Tailwind Spacing Primitives:**
We'll use a consistent set of spacing units: **2, 4, 6, 8, 12, 16, 20, 24, 32**

- Micro spacing (component internals): p-2, gap-2, m-2
- Standard component padding: p-4, p-6
- Section vertical spacing: py-12 (mobile), py-20 (tablet), py-32 (desktop)
- Container horizontal padding: px-4 (mobile), px-8 (tablet), px-16 (desktop)
- Card/product spacing: gap-6 (mobile), gap-8 (desktop)
- Major section breaks: mb-24, mb-32

**Container System:**
- Page max-width: max-w-7xl (1280px)
- Content blocks: max-w-6xl (1152px)
- Text content: max-w-4xl (896px)
- Centered alignment with mx-auto for all containers

**Grid Systems:**
- Product grids: grid-cols-1 (mobile), grid-cols-2 (md), grid-cols-3 (lg), grid-cols-4 (xl)
- Feature sections: grid-cols-1 (mobile), grid-cols-2 (lg)
- Category cards: grid-cols-2 (mobile), grid-cols-3 (md), grid-cols-4 (lg)

---

## Component Library

### Navigation
**Desktop Header:**
- Full-width, sticky positioning
- Logo centered or left-aligned
- Navigation links: text-sm, uppercase, tracking-wider, spacing between items: gap-8
- Icons for Search, Wishlist, Cart, Profile aligned right
- Thin divider line underneath
- Height: h-20

**Mobile Navigation:**
- Hamburger menu icon
- Slide-in drawer from left
- Full-height overlay
- Menu items: text-lg, py-4 spacing

### Hero Section
**Homepage Hero:**
- Full-viewport height: min-h-screen or h-[85vh]
- Large-scale lifestyle imagery with subtle overlay for text legibility
- Centered content with max-w-3xl
- Headline + subheadline + primary CTA
- Buttons with blurred background (backdrop-blur-md, bg-opacity-30) when over imagery

### Product Cards
**Grid Cards:**
- Aspect ratio: aspect-[3/4] for product images
- Rounded corners: rounded-lg
- Image fills container with object-cover
- Hover effect: subtle scale (scale-105) on image only
- Product name below image, aligned left
- Price below name, slightly smaller
- Quick actions (wishlist heart icon) positioned absolute top-right on card
- Padding between elements: p-4

### Category Cards
**Large Format:**
- Aspect ratio: aspect-[16/9] or aspect-[4/3]
- Overlay with gradient for text visibility
- Category name: centered, large Playfair Display
- "Shop Now" link underneath
- Rounded corners: rounded-xl

### Product Detail Page
**Layout:**
- Two-column split: grid-cols-1 lg:grid-cols-2
- Left: Image gallery with thumbnails (4-6 images), main image aspect-square
- Right: Product information, sticky positioning (sticky top-24)
- Generous vertical spacing between information blocks: space-y-6

**Information Blocks:**
- Product name: Large Playfair Display
- Price: Medium size, prominent
- Size selector: Pill-style buttons, rounded-full, gap-2
- Color swatches: Circular, border when selected
- Description: max-w-prose, body text
- Accordion sections for "Fabric Details", "Size Chart", "Care Instructions"
- Fixed bottom bar on mobile with "Add to Cart" and "Wishlist"

### Shopping Cart
**Drawer/Slide-out:**
- Slides from right, w-full md:w-96
- Fixed height with scrollable product list
- Each item: horizontal layout, thumbnail + details + quantity controls + remove
- Summary section fixed at bottom: subtotal, shipping, total
- Large CTA button: "Proceed to Checkout"

### Checkout
**Multi-step Form:**
- Progress indicator at top: dots or numbered steps
- Single column layout: max-w-2xl, centered
- Sections: Shipping Address, Payment Method, Order Review
- Form inputs with labels above, rounded-lg borders
- Large spacing between form groups: space-y-6

### Profile Pages
**Tab Navigation:**
- Horizontal tabs on desktop, stacked on mobile
- Active tab: underline treatment
- Content area: max-w-4xl

**Order History:**
- Card-based layout for each order
- Order number, date, status badge, total
- Expandable to show items
- "Track Order" and "View Details" buttons

---

## Image Strategy

**Homepage:**
- Hero: Large-scale lifestyle image (model wearing featured collection in aspirational setting)
- Category carousel: 4-6 category images (close-ups of accessories, fabric textures, styled looks)
- New arrivals grid: Product photography on neutral background
- Featured collection: Editorial-style campaign imagery

**Product Pages:**
- Gallery: 4-6 images minimum (front, back, detail shots, styled look, model wearing)
- Zoom functionality on hover/click
- 360° view indicator if available

**Collection Pages:**
- Header banner: Lifestyle imagery representing collection theme
- Grid: Clean product photography, consistent styling

**About/Blog:**
- Featured images for blog posts: aspect-[16/9]
- Designer portraits: aspect-square, rounded-full for small versions
- Behind-the-scenes imagery for brand storytelling

**Image Treatment:**
- All images: rounded-lg
- Maintain aspect ratios, use object-cover
- Lazy loading for performance
- High-quality, professionally shot imagery

---

## Animations

**Minimal & Purposeful:**
- Page transitions: Smooth fade (opacity), 200ms duration
- Button hover: Subtle scale (scale-105), 150ms duration
- Product card hover: Image scale only, 300ms ease-in-out
- Cart drawer: Slide-in transform, 250ms
- Dropdown menus: Fade + slide down, 200ms
- NO scroll-triggered animations
- NO parallax effects
- NO excessive micro-interactions

**Focus on Performance:**
- Use CSS transforms for smooth 60fps animations
- Limit simultaneous animations
- Prefer opacity and transform over position changes

---

## Special Features

### AI Style Recommender Widget
- Card format with rounded-xl
- Icon or small illustration at top
- "Get Your Personal Style Guide" headline
- Brief description
- CTA button: "Start Styling"
- Positioned prominently on homepage, subtle on product pages

### Wishlist Heart Icon
- Outline when not saved, filled when saved
- Positioned top-right on product cards
- Smooth fill animation (200ms) on click
- No background, relies on icon visibility

### Size Chart Modal
- Centered overlay, max-w-3xl
- Table layout for measurements
- Close button top-right
- Backdrop blur effect

### Search
- Expandable search bar in header
- Overlay results dropdown with product suggestions
- Recent searches section
- Category filters within search results

This design system creates a sophisticated, aspirational shopping experience that reflects Orephia's luxury positioning while maintaining usability and performance.