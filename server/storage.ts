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
  CartItem
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private wishlistItems: Map<string, WishlistItem>;
  private orders: Map<string, Order>;
  private addresses: Map<string, AddressRow>;
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.wishlistItems = new Map();
    this.orders = new Map();
    this.addresses = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Seed sample products
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: Omit<Product, "id" | "createdAt">[] = [
      {
        title: "Silk Evening Gown",
        description: "Elegant floor-length silk gown with a flattering silhouette. Perfect for formal occasions and special events.",
        price: "489.00",
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1200&fit=crop"],
        category: "dresses",
        designer: "Valentino",
        stock: 5,
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Navy", "Burgundy"],
        fabricDetails: "100% Silk Charmeuse",
        careInstructions: "Dry clean only",
        tags: ["evening", "formal", "luxury"],
        featured: true,
      },
      {
        title: "Cashmere Wrap Coat",
        description: "Luxurious cashmere coat with a timeless wrap design. Soft, warm, and effortlessly chic.",
        price: "895.00",
        images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1200&fit=crop"],
        category: "outerwear",
        designer: "Max Mara",
        stock: 3,
        sizes: ["S", "M", "L"],
        colors: ["Camel", "Black", "Grey"],
        fabricDetails: "100% Cashmere",
        careInstructions: "Dry clean only",
        tags: ["coat", "winter", "cashmere"],
        featured: true,
      },
      {
        title: "Leather Crossbody Bag",
        description: "Premium Italian leather crossbody bag with gold hardware. Compact yet spacious design.",
        price: "325.00",
        images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop"],
        category: "bags",
        designer: "Saint Laurent",
        stock: 8,
        sizes: [],
        colors: ["Black", "Tan", "Burgundy"],
        fabricDetails: "Italian Calfskin Leather",
        careInstructions: "Wipe clean with soft cloth",
        tags: ["bag", "leather", "accessories"],
        featured: false,
      },
      {
        title: "Satin Midi Skirt",
        description: "Flowing satin midi skirt with an elegant drape. Pairs beautifully with both casual and formal tops.",
        price: "185.00",
        images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=1200&fit=crop"],
        category: "skirts",
        designer: "Reformation",
        stock: 12,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Champagne", "Black", "Emerald"],
        fabricDetails: "Silk Satin",
        careInstructions: "Hand wash cold, hang dry",
        tags: ["skirt", "satin", "midi"],
        featured: false,
      },
      {
        title: "Diamond Stud Earrings",
        description: "Classic diamond stud earrings in 18k white gold. Timeless elegance for every occasion.",
        price: "1250.00",
        images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop"],
        category: "jewelry",
        designer: "Tiffany & Co.",
        stock: 4,
        sizes: [],
        colors: ["White Gold"],
        fabricDetails: "18k White Gold, 0.5ct Total Weight Diamonds",
        careInstructions: "Professional cleaning recommended",
        tags: ["jewelry", "diamonds", "earrings"],
        featured: true,
      },
      {
        title: "Pointed Toe Pumps",
        description: "Classic pointed-toe pumps with 4-inch heels. Sophisticated and versatile for any wardrobe.",
        price: "295.00",
        images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop"],
        category: "shoes",
        designer: "Manolo Blahnik",
        stock: 6,
        sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9"],
        colors: ["Black", "Nude", "Red"],
        fabricDetails: "Italian Leather",
        careInstructions: "Store in dust bag, avoid water",
        tags: ["shoes", "heels", "pumps"],
        featured: false,
      },
      {
        title: "Wool Blazer",
        description: "Tailored wool blazer with a modern fit. Perfect for the office or special occasions.",
        price: "425.00",
        images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&h=1200&fit=crop"],
        category: "blazers",
        designer: "The Row",
        stock: 7,
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Navy", "Grey"],
        fabricDetails: "100% Merino Wool",
        careInstructions: "Dry clean only",
        tags: ["blazer", "tailored", "professional"],
        featured: true,
      },
      {
        title: "Pleated Maxi Dress",
        description: "Flowing pleated maxi dress with delicate details. Romantic and effortlessly elegant.",
        price: "365.00",
        images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1200&fit=crop"],
        category: "dresses",
        designer: "Zimmermann",
        stock: 5,
        sizes: ["XS", "S", "M", "L"],
        colors: ["Blush", "Ivory", "Sage"],
        fabricDetails: "Silk Chiffon",
        careInstructions: "Dry clean only",
        tags: ["dress", "maxi", "pleated"],
        featured: false,
      },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      this.products.set(id, {
        ...product,
        id,
        createdAt: new Date(),
      } as Product);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date(),
    } as Product;
    this.products.set(id, newProduct);
    return newProduct;
  }

  async searchProducts(query: string, filters?: any): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (query) {
      const lowerQuery = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters?.category) {
      products = products.filter((p) => p.category === filters.category);
    }

    return products;
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const id = randomUUID();
    const wishlistItem: WishlistItem = {
      ...item,
      id,
      createdAt: new Date(),
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const items = Array.from(this.wishlistItems.entries());
    for (const [id, item] of items) {
      if (item.userId === userId && item.productId === productId) {
        this.wishlistItems.delete(id);
        break;
      }
    }
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date(),
    } as Order;
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  // Address methods
  async getUserAddresses(userId: string): Promise<AddressRow[]> {
    return Array.from(this.addresses.values()).filter(
      (addr) => addr.userId === userId
    );
  }

  async createAddress(userId: string, address: InsertAddress): Promise<AddressRow> {
    const id = randomUUID();
    const newAddress: AddressRow = {
      ...address,
      id,
      userId,
      isDefault: false,
    };
    this.addresses.set(id, newAddress);
    return newAddress;
  }
}

export const storage = new MemStorage();
