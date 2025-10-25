import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct,
  Order,
  InsertOrder,
  WishlistItem,
  InsertWishlistItem,
  AddressRow,
  InsertAddress,
  Coupon,
  InsertCoupon,
  HomepageContent,
  InsertHomepageContent,
  Category,
  InsertCategory,
  LoyaltyTransaction,
  InsertLoyaltyTransaction,
  StyleProfile,
  InsertStyleProfile,
  PasswordResetToken,
  InsertPasswordResetToken,
  users,
  products,
  wishlistItems,
  orders,
  addresses,
  coupons,
  homepageContent,
  categories,
  loyaltyTransactions,
  styleProfiles,
  passwordResetTokens,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, like, or, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  searchProducts(query: string, filters?: any): Promise<Product[]>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductStock(id: string, stock: number): Promise<Product | undefined>;
  
  // Wishlist methods
  getWishlist(userId: string): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(statusFilter?: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Address methods
  getUserAddresses(userId: string): Promise<AddressRow[]>;
  createAddress(userId: string, address: InsertAddress): Promise<AddressRow>;
  
  // Coupon methods
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getAllCoupons(): Promise<Coupon[]>;
  updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  
  // Homepage content methods
  getHomepageContent(): Promise<HomepageContent | undefined>;
  updateHomepageContent(data: InsertHomepageContent): Promise<HomepageContent>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Admin methods
  getAdminStats(): Promise<any>;
  
  // Loyalty Points methods
  getUserLoyaltyPoints(userId: string): Promise<number>;
  addLoyaltyPoints(userId: string, points: number, description: string, orderId?: string): Promise<void>;
  redeemLoyaltyPoints(userId: string, points: number, description: string, orderId?: string): Promise<boolean>;
  getUserLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]>;
  
  // Style Profile methods
  getStyleProfile(userId: string): Promise<StyleProfile | undefined>;
  createOrUpdateStyleProfile(userId: string, data: InsertStyleProfile): Promise<StyleProfile>;
  
  // Password Reset methods
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async searchProducts(query: string, filters?: any): Promise<Product[]> {
    const conditions = [];

    // Search query
    if (query) {
      conditions.push(
        or(
          like(products.title, `%${query}%`),
          like(products.description, `%${query}%`)
        )
      );
    }

    // Category filter
    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }

    // Designer filter
    if (filters?.designer) {
      conditions.push(eq(products.designer, filters.designer));
    }

    // Price range filter
    if (filters?.minPrice !== undefined) {
      conditions.push(sql`CAST(${products.price} AS DECIMAL) >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`CAST(${products.price} AS DECIMAL) <= ${filters.maxPrice}`);
    }

    // Build final query
    if (conditions.length === 0) {
      return await db.select().from(products);
    }

    return await db.select().from(products).where(and(...conditions));
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const [wishlistItem] = await db.insert(wishlistItems).values(item).returning();
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await db.delete(wishlistItems).where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      )
    );
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(sql`${orders.createdAt} DESC`);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  // Address methods
  async getUserAddresses(userId: string): Promise<AddressRow[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(userId: string, address: InsertAddress): Promise<AddressRow> {
    const [newAddress] = await db.insert(addresses).values({
      ...address,
      userId,
    }).returning();
    return newAddress;
  }

  // Admin product methods
  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateProductStock(id: string, stock: number): Promise<Product | undefined> {
    const [product] = await db.update(products).set({ stock }).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  // Admin order methods
  async getAllOrders(statusFilter?: string): Promise<Order[]> {
    if (statusFilter) {
      return await db.select().from(orders).where(eq(orders.orderStatus, statusFilter)).orderBy(sql`${orders.createdAt} DESC`);
    }
    return await db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  // Coupon methods
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(sql`${coupons.createdAt} DESC`);
  }

  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const [coupon] = await db.update(coupons).set(data).where(eq(coupons.id, id)).returning();
    return coupon || undefined;
  }

  // Homepage content methods
  async getHomepageContent(): Promise<HomepageContent | undefined> {
    const [content] = await db.select().from(homepageContent).limit(1);
    return content || undefined;
  }

  async updateHomepageContent(data: InsertHomepageContent): Promise<HomepageContent> {
    const existing = await this.getHomepageContent();
    
    if (existing) {
      const [updated] = await db.update(homepageContent)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(homepageContent.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(homepageContent).values(data).returning();
      return created;
    }
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.mainCategory, categories.subCategory);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Admin statistics
  async getAdminStats(): Promise<any> {
    const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [lowStockProducts] = await db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.stock} < 10`);
    
    const [revenueData] = await db.select({ 
      total: sql<string>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)` 
    }).from(orders).where(eq(orders.paymentStatus, 'paid'));

    const pendingOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.orderStatus, 'processing'));
    
    return {
      totalOrders: totalOrders?.count || 0,
      totalProducts: totalProducts?.count || 0,
      lowStockProducts: lowStockProducts?.count || 0,
      totalRevenue: revenueData?.total || "0",
      pendingOrders: pendingOrders[0]?.count || 0,
    };
  }

  // Loyalty Points methods
  async getUserLoyaltyPoints(userId: string): Promise<number> {
    const [user] = await db.select({ loyaltyPoints: users.loyaltyPoints }).from(users).where(eq(users.id, userId));
    return user?.loyaltyPoints || 0;
  }

  async addLoyaltyPoints(userId: string, points: number, description: string, orderId?: string): Promise<void> {
    // Add transaction record
    await db.insert(loyaltyTransactions).values({
      userId,
      type: 'earned',
      points,
      description,
      orderId,
    });

    // Update user's loyalty points balance
    await db.update(users)
      .set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${points}` })
      .where(eq(users.id, userId));
  }

  async redeemLoyaltyPoints(userId: string, points: number, description: string, orderId?: string): Promise<boolean> {
    // Check if user has enough points
    const currentPoints = await this.getUserLoyaltyPoints(userId);
    if (currentPoints < points) {
      return false;
    }

    // Add transaction record
    await db.insert(loyaltyTransactions).values({
      userId,
      type: 'redeemed',
      points,
      description,
      orderId,
    });

    // Update user's loyalty points balance
    await db.update(users)
      .set({ loyaltyPoints: sql`${users.loyaltyPoints} - ${points}` })
      .where(eq(users.id, userId));

    return true;
  }

  async getUserLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]> {
    return await db.select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.userId, userId))
      .orderBy(sql`${loyaltyTransactions.createdAt} DESC`);
  }

  // Style Profile methods
  async getStyleProfile(userId: string): Promise<StyleProfile | undefined> {
    const [profile] = await db.select().from(styleProfiles).where(eq(styleProfiles.userId, userId));
    return profile || undefined;
  }

  async createOrUpdateStyleProfile(userId: string, data: InsertStyleProfile): Promise<StyleProfile> {
    const existing = await this.getStyleProfile(userId);
    
    if (existing) {
      const [updated] = await db.update(styleProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(styleProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(styleProfiles).values({ ...data, userId }).returning();
      return created;
    }
  }

  // Password Reset methods
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(tokenData).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken || undefined;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
