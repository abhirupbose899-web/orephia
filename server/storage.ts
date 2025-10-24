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
  users,
  products,
  wishlistItems,
  orders,
  addresses,
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
  
  // Wishlist methods
  getWishlist(userId: string): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  
  // Address methods
  getUserAddresses(userId: string): Promise<AddressRow[]>;
  createAddress(userId: string, address: InsertAddress): Promise<AddressRow>;
  
  // Session store
  sessionStore: session.SessionStore;
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
}

export const storage = new DatabaseStorage();
