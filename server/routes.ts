import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getStyleRecommendations } from "./openai";
import Razorpay from "razorpay";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { coupons } from "@shared/schema";
import { 
  insertProductSchema, 
  insertWishlistItemSchema,
  insertOrderSchema,
  insertAddressSchema,
  addToCartSchema
} from "@shared/schema";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/products/search", async (req, res) => {
    try {
      const { query, filters } = req.body;
      const products = await storage.searchProducts(query, filters);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const wishlist = await storage.getWishlist(req.user!.id);
      res.json(wishlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertWishlistItemSchema.parse({
        userId: req.user!.id,
        productId: req.body.productId,
      });
      const wishlistItem = await storage.addToWishlist(validatedData);
      res.status(201).json(wishlistItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      await storage.removeFromWishlist(req.user!.id, req.params.productId);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const orders = await storage.getUserOrders(req.user!.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { items, shippingAddress, status, paymentId, razorpayOrderId, couponCode } = req.body;

      let calculatedSubtotal = 0;
      const verifiedItems = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        const trustedPrice = typeof product.price === "string" ? parseFloat(product.price) : product.price;
        calculatedSubtotal += trustedPrice * item.quantity;
        
        verifiedItems.push({
          ...item,
          price: trustedPrice,
        });
      }

      let discount = 0;
      let validCoupon = null;

      if (couponCode) {
        const coupon = await db.select().from(coupons).where(eq(coupons.code, couponCode.toUpperCase())).limit(1);
        
        if (coupon.length > 0) {
          const couponData = coupon[0];
          
          const isValid = couponData.isActive &&
            (!couponData.expiresAt || new Date(couponData.expiresAt) >= new Date()) &&
            (!couponData.usageLimit || couponData.usedCount < couponData.usageLimit);

          if (isValid) {
            const minPurchase = couponData.minPurchase ? parseFloat(couponData.minPurchase as string) : 0;
            if (calculatedSubtotal >= minPurchase) {
              const discountValue = parseFloat(couponData.discountValue as string);
              
              if (couponData.discountType === "percentage") {
                discount = (calculatedSubtotal * discountValue) / 100;
                const maxDiscount = couponData.maxDiscount ? parseFloat(couponData.maxDiscount as string) : null;
                if (maxDiscount && discount > maxDiscount) {
                  discount = maxDiscount;
                }
              } else if (couponData.discountType === "fixed") {
                discount = discountValue;
              }
              validCoupon = couponData;
            }
          }
        }
      }

      const shipping = calculatedSubtotal > 100 ? 0 : 10;
      const tax = (calculatedSubtotal - discount) * 0.08;
      const total = calculatedSubtotal - discount + shipping + tax;

      const orderData = {
        userId: req.user!.id,
        items: verifiedItems,
        shippingAddress,
        subtotal: calculatedSubtotal.toFixed(2),
        discount: discount.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        couponCode: validCoupon ? validCoupon.code : null,
        paymentStatus: status || "pending",
        orderStatus: "processing",
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: paymentId || null,
      };
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);

      if (validCoupon) {
        try {
          await db.update(coupons)
            .set({ usedCount: validCoupon.usedCount + 1 })
            .where(eq(coupons.id, validCoupon.id));
        } catch (couponError) {
          console.error("Error updating coupon usage:", couponError);
        }
      }

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Address routes
  app.get("/api/addresses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const addresses = await storage.getUserAddresses(req.user!.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(req.user!.id, validatedData);
      res.status(201).json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Style Recommendations
  app.post("/api/ai/style-recommendations", async (req, res) => {
    try {
      const preferences = req.body;
      const recommendations = await getStyleRecommendations(preferences);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Razorpay order creation
  app.post("/api/razorpay/create-order", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { items, addressId, couponCode } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid cart items" });
      }

      let calculatedSubtotal = 0;
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
        calculatedSubtotal += price * item.quantity;
      }

      let discount = 0;
      let couponData = null;

      if (couponCode) {
        const coupon = await db.select().from(coupons).where(eq(coupons.code, couponCode.toUpperCase())).limit(1);
        
        if (coupon.length > 0) {
          couponData = coupon[0];
          
          const isValid = couponData.isActive &&
            (!couponData.expiresAt || new Date(couponData.expiresAt) >= new Date()) &&
            (!couponData.usageLimit || couponData.usedCount < couponData.usageLimit);

          if (isValid) {
            const minPurchase = couponData.minPurchase ? parseFloat(couponData.minPurchase as string) : 0;
            if (calculatedSubtotal >= minPurchase) {
              const discountValue = parseFloat(couponData.discountValue as string);
              
              if (couponData.discountType === "percentage") {
                discount = (calculatedSubtotal * discountValue) / 100;
                const maxDiscount = couponData.maxDiscount ? parseFloat(couponData.maxDiscount as string) : null;
                if (maxDiscount && discount > maxDiscount) {
                  discount = maxDiscount;
                }
              } else if (couponData.discountType === "fixed") {
                discount = discountValue;
              }
            }
          }
        }
      }

      const shipping = calculatedSubtotal > 100 ? 0 : 10;
      const tax = (calculatedSubtotal - discount) * 0.08;
      const totalUSD = calculatedSubtotal - discount + shipping + tax;
      
      const USD_TO_INR = 83;
      const totalINR = Math.round(totalUSD * USD_TO_INR * 100);

      const options = {
        amount: totalINR,
        currency: "INR",
        receipt: `receipt_${Date.now()}_${req.user!.id}`,
        notes: {
          userId: req.user!.id,
          itemCount: items.length,
          couponCode: couponCode || "none",
        }
      };

      const razorpayOrder = await razorpay.orders.create(options);
      
      res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        calculatedTotalUSD: totalUSD.toFixed(2),
        calculatedTotalINR: (totalINR / 100).toFixed(2),
        discount: discount.toFixed(2),
        couponApplied: couponCode || null,
      });
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ message: error.message || "Failed to create payment order" });
    }
  });

  // Razorpay payment verification
  app.post("/api/razorpay/verify-payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ 
          success: true, 
          message: "Payment verified successfully",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Invalid signature" 
        });
      }
    } catch (error: any) {
      console.error("Razorpay payment verification error:", error);
      res.status(500).json({ message: error.message || "Payment verification failed" });
    }
  });

  // Coupon validation
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, items } = req.body;

      if (!code || typeof code !== "string") {
        return res.status(400).json({ 
          success: false,
          message: "Invalid coupon code" 
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid cart items" 
        });
      }

      const coupon = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);

      if (coupon.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: "Invalid coupon code" 
        });
      }

      const couponData = coupon[0];

      if (!couponData.isActive) {
        return res.status(400).json({ 
          success: false,
          message: "This coupon is no longer active" 
        });
      }

      if (couponData.expiresAt && new Date(couponData.expiresAt) < new Date()) {
        return res.status(400).json({ 
          success: false,
          message: "This coupon has expired" 
        });
      }

      if (couponData.usageLimit && couponData.usedCount >= couponData.usageLimit) {
        return res.status(400).json({ 
          success: false,
          message: "This coupon has reached its usage limit" 
        });
      }

      let calculatedSubtotal = 0;
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ 
            success: false,
            message: `Product ${item.productId} not found` 
          });
        }
        const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
        calculatedSubtotal += price * item.quantity;
      }

      const minPurchase = couponData.minPurchase ? parseFloat(couponData.minPurchase as string) : 0;
      if (minPurchase > 0 && calculatedSubtotal < minPurchase) {
        return res.status(400).json({ 
          success: false,
          message: `Minimum purchase of $${minPurchase.toFixed(2)} required for this coupon` 
        });
      }

      let discountAmount = 0;
      const discountValue = parseFloat(couponData.discountValue as string);

      if (couponData.discountType === "percentage") {
        discountAmount = (calculatedSubtotal * discountValue) / 100;
        const maxDiscount = couponData.maxDiscount ? parseFloat(couponData.maxDiscount as string) : null;
        if (maxDiscount && discountAmount > maxDiscount) {
          discountAmount = maxDiscount;
        }
      } else if (couponData.discountType === "fixed") {
        discountAmount = discountValue;
      }

      res.json({ 
        success: true,
        coupon: {
          code: couponData.code,
          discountType: couponData.discountType,
          discountValue: discountValue,
          discountAmount: discountAmount.toFixed(2),
        },
        message: `Coupon applied! You save $${discountAmount.toFixed(2)}` 
      });
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to validate coupon" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
