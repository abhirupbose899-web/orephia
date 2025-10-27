# Orephia - Luxury Women's Fashion E-Commerce Platform

## Overview

Orephia is a luxury women's fashion and accessories e-commerce platform that combines sophisticated design with AI-powered styling recommendations. The application provides a premium shopping experience with features including product browsing, wishlist management, secure checkout via Razorpay, loyalty points rewards program, and personalized AI styling assistance powered by OpenAI's GPT-5 model.

The platform emphasizes editorial elegance inspired by premium fashion retailers like Net-a-Porter and Farfetch, featuring magazine-quality layouts, generous spacing, and a refined aesthetic using Playfair Display for headings and Poppins for body text.

**Loyalty Points Program**: Customers earn 1 loyalty point for every ₹10 spent (calculated on final total after discounts). Points can be redeemed at checkout for discounts (100 points = ₹1 discount). All point transactions are tracked in the database with complete audit trail.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 27, 2025
- **Admin Panel Enhancements**: 
  - Created comprehensive inventory management page (/admin/inventory) with stock tracking, low stock alerts, bulk updates, and inventory analytics dashboard
  - Enhanced orders page with detailed order view modal showing complete customer information, shipping address, order items with size/color variants, payment details, and order summary including discounts and loyalty points
  - Added "View" button to each order for opening detailed modal view
  - Added inventory tracking section to admin navigation sidebar with Warehouse icon
  - Implemented real-time inventory statistics with color-coded alerts for low stock items

- **Network & Device Compatibility Improvements**:
  - Added CORS middleware for cross-origin requests (allows all origins, methods, and credentials)
  - Implemented Helmet security headers for secure network compatibility
  - Added compression middleware for improved mobile performance
  - Configured session cookies for cross-platform compatibility (secure in production, SameSite=none for mobile apps)
  - Added trust proxy configuration for HTTPS behind load balancers/proxies
  - Implemented health check endpoints (/health, /api/health) for network diagnostics
  - Added preflight OPTIONS request handling for mobile apps
  - Fixed product update bug where missing category field caused failures

- **Shopify Integration Enhancements**:
  - Removed Razorpay payment integration completely - now using Shopify checkout exclusively
  - Enhanced Shopify product sync to capture ALL product media (including variant-specific images)
  - Intelligent category detection from product tags for better organization
  - Auto-detection of "new arrival" status from Shopify product tags
  - Improved designer/vendor mapping from Shopify data
  - Fixed admin panel product update validation with better error handling
  - Added comprehensive logging for debugging product updates and sync operations
  - Checkout flow now redirects directly to Shopify's secure checkout page

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast hot module replacement
- Wouter for lightweight client-side routing instead of React Router
- Single-page application (SPA) architecture with code splitting capabilities

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom design system following the "new-york" style variant with specific color palette (primary: #B76E79, accent: #722F37)
- Typography system using Google Fonts (Playfair Display for headings, Poppins for body text)
- Consistent spacing primitives (2, 4, 6, 8, 12, 16, 20, 24, 32) for layout harmony

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Context API for global state (authentication, shopping cart, currency conversion)
- Local storage for cart persistence across sessions and currency preferences
- Session-based wishlist tied to authenticated users

**Key Design Patterns**
- Custom hooks pattern for reusable logic (useAuth, useCart, useToast, useMobile, useCurrency)
- Protected route wrapper component for authentication-required pages
- Centralized API request handling with error boundaries
- Toast notifications for user feedback on actions
- Reusable Price component for consistent multi-currency display throughout the app
- Modal dialogs for detailed data views (order details, product images, etc.)

**Admin Panel Features**
- Comprehensive product management with CRUD operations and Shopify sync
- Inventory tracking with stock levels, low stock alerts (threshold: 10 items), and bulk update capabilities
- Order processing with detailed order views showing customer info, shipping address, order items, payment details, and order timeline
- Category management for hierarchical product categorization
- Homepage content management for curated hero section and featured products
- Coupon management system for discount codes and promotions
- Analytics dashboard with sales insights and product performance metrics

### Backend Architecture

**Server Framework**
- Express.js as the Node.js web server
- TypeScript for type safety across the stack
- ESM (ES Modules) module system throughout the codebase
- Session-based authentication using Passport.js with local strategy

**API Design**
- RESTful API endpoints organized by resource (products, orders, wishlist, addresses, coupons, loyalty points)
- Consistent error handling with appropriate HTTP status codes
- Request logging middleware for debugging and monitoring
- CORS and security middleware for production deployment
- Loyalty points API endpoints:
  - GET /api/loyalty/balance - Fetch user's current points balance
  - GET /api/loyalty/transactions - Retrieve complete transaction history
  - POST /api/loyalty/redeem - Redeem points (used internally during order creation)

**Authentication & Authorization**
- Passport.js with LocalStrategy for username/password authentication
- Scrypt for password hashing with salt for security
- Express session management with configurable session store
- Protected API endpoints requiring authentication
- User serialization/deserialization for session persistence
- Password reset via email with secure token-based flow:
  - POST /api/password-reset/request - Initiates password reset by sending email with reset link
  - POST /api/password-reset/verify - Validates reset token before showing reset form
  - POST /api/password-reset/reset - Completes password reset with new password
  - Tokens expire after 1 hour for security
  - Email delivery via Resend integration with branded HTML templates

**Business Logic Layers**
- Storage abstraction layer (IStorage interface) for database operations
- Separation of route handlers from business logic
- Validation using Zod schemas defined in shared schema file
- Seeding scripts for initial data population (products and coupons)

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver for scalable cloud database
- Drizzle ORM for type-safe database queries and migrations
- WebSocket connection support for Neon's serverless architecture
- Connection pooling for efficient database resource usage

**Schema Design**
- Users table: Authentication and profile information with country and preferred currency fields for multi-currency support, loyaltyPoints balance field
- Products table: Complete product catalog with JSON fields for arrays (images, sizes, colors, tags), hierarchical categorization with mainCategory and subCategory fields, newArrival boolean for featured products
- Wishlist items table: Many-to-many relationship between users and products
- Orders table: Transaction records with JSON fields for order items and shipping details, includes discount and couponCode fields, pointsEarned and pointsRedeemed for loyalty program tracking
- Addresses table: User shipping/billing addresses
- Coupons table: Discount codes with validation rules (expiration, usage limits, minimum purchase), tracks usage count
- Loyalty transactions table: Complete audit trail of all points earned and redeemed with type, points amount, description, and optional order ID linkage
- Categories table: Hierarchical category management with mainCategory and optional subCategory fields for dynamic product categorization
- Homepage content table: Curated homepage content including hero section (title, subtitle, image) and featured product IDs for admin-controlled homepage customization
- Password reset tokens table: Secure token storage for password reset flow with expiration timestamps
- Session store table: Server-side session persistence

**Data Modeling Decisions**
- UUID primary keys using PostgreSQL's gen_random_uuid()
- JSONB columns for flexible array storage (images, sizes, colors, tags) avoiding complex joins
- Decimal type for monetary values to prevent floating-point precision issues
- Hierarchical category system with mainCategory (Apparels, Shoes, Bags, Accessories) and subCategory for detailed classification
  - Apparels subcategories: Dresses, Skirts, Blazers, Jackets, Shirts, T-Shirts, Sweatshirts, Hoodies, Long Sleeves, Tank Tops
  - Other main categories can have subcategories as needed
- Timestamps for audit trails on all major entities
- Shared schema definitions between client and server for type consistency

### External Dependencies

**Shopify Integration (Dropshipping Model)**
- Orephia serves as custom frontend while Shopify handles backend product management and checkout
- Shopify Storefront API integration via @shopify/storefront-api-client library
- Product sync functionality pulls products from Shopify store (7ehjpp-c6.myshopify.com) into local database
- Products table includes shopifyProductId and shopifyVariantId fields for mapping
- Checkout flow redirects customers to Shopify checkout page for payment processing
- Admin panel includes "Sync from Shopify" button for manual product synchronization
- API endpoints:
  - POST /api/admin/shopify/sync - Triggers product sync from Shopify (admin-only)
  - POST /api/shopify/checkout - Creates Shopify checkout session and redirects to Shopify
- Environment secrets: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_PRIVATE_ACCESS_TOKEN

**Payment Processing (Shopify Checkout)**
- Primary payment method: Shopify checkout redirect
- Checkout flow redirects customers directly to Shopify's secure checkout page
- Shopify handles all payment processing, order creation, and fulfillment
- Supports all Shopify payment methods (credit/debit cards, Apple Pay, Google Pay, etc.)
- No Razorpay integration - completely replaced by Shopify
- Cart items are sent to Shopify with product variant IDs for accurate checkout
- Customers complete purchase on Shopify, then receive confirmation from Shopify
- API endpoint: POST /api/shopify/checkout - Creates Shopify cart and returns checkout URL

**Multi-Currency Support**
- Dynamic currency conversion using Open Exchange Rates API with free tier (no API key required)
- Support for 50+ currencies including USD, EUR, GBP, JPY, AUD, CAD, SGD, AED, and more
- Country selection during user signup with automatic currency assignment
- **Default currency**: Countries with supported currencies (India→INR, UK→GBP, etc.) use their native currency; all other countries default to USD
- Currency selector in mobile menu for easy switching between currencies
- Real-time exchange rate fetching with 1-hour caching to minimize API calls
- All prices stored in database in INR (base currency), converted at display time
- Consistent price formatting using reusable Price component throughout the application
- Payments processed in INR via Razorpay regardless of display currency

**Coupon/Discount System**
- Server-side coupon validation endpoint that recalculates discounts from cart items
- Supports percentage and fixed-amount discounts with optional maximum discount caps
- Enforces minimum purchase requirements, usage limits, and expiration dates
- Coupon state persisted in localStorage and carried through checkout flow
- Usage count incremented only when valid coupon creates an order
- Complete server-side verification: no trust of client-provided prices, totals, or discounts

**AI Services**
- OpenAI GPT-5 via Replit AI Integrations for styling recommendations
- JSON-structured responses for predictable parsing
- Fallback recommendations for error scenarios
- Context-aware prompts based on user preferences and product details

**Email Services**
- Resend integration for transactional email delivery
- Branded HTML email templates for password reset notifications
- Secure API key management via Replit Connectors
- Email sent from configured "from" email address with proper DKIM/SPF verification

**Session Management**
- Connect-pg-simple for PostgreSQL-backed session storage
- In-memory fallback (memorystore) for development
- Configurable session secrets via environment variables
- Production security warnings for missing configuration

**Third-Party Libraries**
- Stripe components (@stripe/react-stripe-js, @stripe/stripe-js) prepared for alternative payment integration
- Date-fns for date formatting and manipulation
- Nanoid for generating unique identifiers
- Zod for runtime type validation and schema parsing

**Development Tools**
- Replit-specific plugins for development experience (cartographer, dev-banner, runtime-error-modal)
- ESBuild for production server bundling
- Drizzle Kit for database migrations and schema management
- TSX for running TypeScript in development without compilation step