import { db } from "./db";
import { products } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const sampleProducts = [
    {
      title: "Silk Evening Gown",
      description: "Elegant floor-length silk gown with a flattering silhouette. Perfect for formal occasions and special events.",
      price: "489.00",
      images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1200&fit=crop"],
      category: "dresses",
      mainCategory: "Apparels",
      subCategory: "Dresses",
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
      mainCategory: "Apparels",
      subCategory: "Jackets",
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
      mainCategory: "Bags",
      subCategory: null,
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
      mainCategory: "Apparels",
      subCategory: "Skirts",
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
      mainCategory: "Accessories",
      subCategory: "Jewelry",
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
      mainCategory: "Shoes",
      subCategory: "Heels",
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
      mainCategory: "Apparels",
      subCategory: "Blazers",
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
      mainCategory: "Apparels",
      subCategory: "Dresses",
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

  try {
    // Check if products already exist
    const existingProducts = await db.select().from(products);
    if (existingProducts.length > 0) {
      console.log("Database already seeded with", existingProducts.length, "products");
      return;
    }

    // Insert products
    await db.insert(products).values(sampleProducts);
    console.log("Successfully seeded", sampleProducts.length, "products");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
