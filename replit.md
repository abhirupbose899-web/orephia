# Orephia - Luxury Women's Fashion E-Commerce Platform

## Overview

Orephia is a luxury women's fashion and accessories e-commerce platform that combines sophisticated design with AI-powered styling recommendations. The application provides a premium shopping experience with features including product browsing, wishlist management, secure checkout via Razorpay, and personalized AI styling assistance powered by OpenAI's GPT-5 model.

The platform emphasizes editorial elegance inspired by premium fashion retailers like Net-a-Porter and Farfetch, featuring magazine-quality layouts, generous spacing, and a refined aesthetic using Playfair Display for headings and Poppins for body text.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- Context API for global state (authentication, shopping cart)
- Local storage for cart persistence across sessions
- Session-based wishlist tied to authenticated users

**Key Design Patterns**
- Custom hooks pattern for reusable logic (useAuth, useCart, useToast, useMobile)
- Protected route wrapper component for authentication-required pages
- Centralized API request handling with error boundaries
- Toast notifications for user feedback on actions

### Backend Architecture

**Server Framework**
- Express.js as the Node.js web server
- TypeScript for type safety across the stack
- ESM (ES Modules) module system throughout the codebase
- Session-based authentication using Passport.js with local strategy

**API Design**
- RESTful API endpoints organized by resource (products, orders, wishlist, addresses, coupons)
- Consistent error handling with appropriate HTTP status codes
- Request logging middleware for debugging and monitoring
- CORS and security middleware for production deployment

**Authentication & Authorization**
- Passport.js with LocalStrategy for username/password authentication
- Scrypt for password hashing with salt for security
- Express session management with configurable session store
- Protected API endpoints requiring authentication
- User serialization/deserialization for session persistence

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
- Users table: Authentication and profile information
- Products table: Complete product catalog with JSON fields for arrays (images, sizes, colors, tags)
- Wishlist items table: Many-to-many relationship between users and products
- Orders table: Transaction records with JSON fields for order items and shipping details, includes discount and couponCode fields
- Addresses table: User shipping/billing addresses
- Coupons table: Discount codes with validation rules (expiration, usage limits, minimum purchase), tracks usage count
- Session store table: Server-side session persistence

**Data Modeling Decisions**
- UUID primary keys using PostgreSQL's gen_random_uuid()
- JSONB columns for flexible array storage (images, sizes, colors, tags) avoiding complex joins
- Decimal type for monetary values to prevent floating-point precision issues
- Timestamps for audit trails on all major entities
- Shared schema definitions between client and server for type consistency

### External Dependencies

**Payment Processing**
- Razorpay integration for secure payment processing (INR currency with 83x USD conversion)
- Server-side order creation with trusted product pricing (fetched from database, never client-provided)
- Payment verification using signature validation with crypto
- Coupon discounts applied to payment amounts server-side
- Support for both test and production environments via environment variables

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