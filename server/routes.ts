import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getStyleRecommendations, getStyleJourneyRecommendations } from "./openai";
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
  insertCouponSchema,
  insertHomepageContentSchema,
  insertCategorySchema,
  addToCartSchema,
  insertStyleProfileSchema
} from "@shared/schema";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

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

  app.post("/api/products", requireAdmin, async (req, res) => {
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
      const { items, shippingAddress, status, paymentId, razorpayOrderId, couponCode, pointsRedeemed } = req.body;

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

      // Handle loyalty points redemption
      let pointsDiscountINR = 0;
      let pointsDiscountUSD = 0;
      let actualPointsRedeemed = 0;
      if (pointsRedeemed && pointsRedeemed > 0) {
        // Verify user has enough points
        const userPoints = await storage.getUserLoyaltyPoints(req.user!.id);
        if (pointsRedeemed > userPoints) {
          return res.status(400).json({ message: "Insufficient loyalty points" });
        }
        
        // Calculate discount from points (100 points = 1 INR)
        pointsDiscountINR = pointsRedeemed / 100;
        // Convert INR discount to USD (prices are in USD)
        const USD_TO_INR = 83;
        pointsDiscountUSD = pointsDiscountINR / USD_TO_INR;
        actualPointsRedeemed = pointsRedeemed;
        
        // Ensure total doesn't go negative
        const maxDiscountUSD = calculatedSubtotal - discount;
        if (pointsDiscountUSD > maxDiscountUSD) {
          pointsDiscountUSD = maxDiscountUSD;
          pointsDiscountINR = maxDiscountUSD * USD_TO_INR;
          actualPointsRedeemed = Math.floor(pointsDiscountINR * 100);
        }
      }

      const shipping = calculatedSubtotal > 100 ? 0 : 10;
      const tax = (calculatedSubtotal - discount - pointsDiscountUSD) * 0.08;
      const total = calculatedSubtotal - discount - pointsDiscountUSD + shipping + tax;

      // Calculate loyalty points to earn (1 point per 10 INR spent on final total)
      // Convert total to INR for points calculation
      const USD_TO_INR = 83;
      const totalINR = total * USD_TO_INR;
      const pointsToEarn = Math.floor(totalINR / 10);

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
        pointsRedeemed: actualPointsRedeemed,
        pointsEarned: pointsToEarn,
      };
      
      // Validate order data BEFORE redeeming points
      const validatedData = insertOrderSchema.parse(orderData);
      
      // Now redeem points and create order atomically
      let order;
      try {
        // Redeem loyalty points if applied
        if (actualPointsRedeemed > 0) {
          const redeemed = await storage.redeemLoyaltyPoints(
            req.user!.id,
            actualPointsRedeemed,
            `Redeemed for order`,
            null
          );
          if (!redeemed) {
            return res.status(400).json({ message: "Failed to redeem loyalty points" });
          }
        }

        // Create the order
        order = await storage.createOrder(validatedData);

        // Update loyalty transaction with actual order ID
        if (actualPointsRedeemed > 0) {
          await db.execute(sql`
            UPDATE loyalty_transactions 
            SET order_id = ${order.id}, description = ${`Redeemed for order #${order.id}`}
            WHERE user_id = ${req.user!.id} 
            AND type = 'redeemed' 
            AND points = ${actualPointsRedeemed}
            AND order_id IS NULL
            ORDER BY created_at DESC
            LIMIT 1
          `);
        }
      } catch (error) {
        // If order creation failed after redeeming points, refund them
        if (actualPointsRedeemed > 0) {
          try {
            await storage.addLoyaltyPoints(
              req.user!.id,
              actualPointsRedeemed,
              "Refund - order creation failed",
              null
            );
            // Delete the failed redemption transaction
            await db.execute(sql`
              DELETE FROM loyalty_transactions 
              WHERE user_id = ${req.user!.id} 
              AND type = 'redeemed' 
              AND points = ${actualPointsRedeemed}
              AND order_id IS NULL
              ORDER BY created_at DESC
              LIMIT 1
            `);
          } catch (refundError) {
            console.error("Error refunding loyalty points:", refundError);
          }
        }
        throw error;
      }

      if (validCoupon) {
        try {
          await db.update(coupons)
            .set({ usedCount: validCoupon.usedCount + 1 })
            .where(eq(coupons.id, validCoupon.id));
        } catch (couponError) {
          console.error("Error updating coupon usage:", couponError);
        }
      }

      // Award loyalty points if payment is successful
      if (status === "paid") {
        try {
          await storage.addLoyaltyPoints(
            req.user!.id,
            pointsToEarn,
            `Earned from order #${order.id}`,
            order.id
          );
        } catch (pointsError) {
          console.error("Error awarding loyalty points:", pointsError);
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

  // AI Style Journey - Comprehensive questionnaire-based recommendations
  app.post("/api/ai/style-journey", async (req, res) => {
    try {
      const { questionnaireAnswers } = req.body;
      
      if (!questionnaireAnswers) {
        return res.status(400).json({ message: "Questionnaire answers required" });
      }

      // Fetch available products from catalog
      const allProducts = await storage.getAllProducts();
      
      // Filter products based on budget range if specified
      let filteredProducts = allProducts;
      if (questionnaireAnswers.investmentLevel?.budgetRange) {
        const budgetRange = questionnaireAnswers.investmentLevel.budgetRange;
        filteredProducts = allProducts.filter(p => {
          const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
          if (budgetRange.includes('under')) return price < 5000;
          if (budgetRange.includes('mid')) return price >= 5000 && price < 15000;
          if (budgetRange.includes('luxury')) return price >= 15000;
          return true;
        });
      }

      // Get AI recommendations
      const aiInsights = await getStyleJourneyRecommendations(
        questionnaireAnswers,
        filteredProducts
      );

      res.json({
        success: true,
        aiInsights,
        questionnaireAnswers
      });
    } catch (error: any) {
      console.error("Style Journey error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Style Profile routes
  app.get("/api/style-profiles/me", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const profile = await storage.getStyleProfile(req.user!.id);
      res.json(profile || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/style-profiles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertStyleProfileSchema.parse(req.body);
      const profile = await storage.createOrUpdateStyleProfile(
        req.user!.id,
        validatedData
      );
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("Style profile save error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Razorpay order creation
  app.post("/api/razorpay/create-order", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { items, addressId, couponCode, pointsRedeemed } = req.body;
      
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

      // Handle loyalty points redemption
      let pointsDiscountINR = 0;
      let pointsDiscountUSD = 0;
      if (pointsRedeemed && pointsRedeemed > 0) {
        // Verify user has enough points
        const userPoints = await storage.getUserLoyaltyPoints(req.user!.id);
        if (pointsRedeemed > userPoints) {
          return res.status(400).json({ message: "Insufficient loyalty points" });
        }
        
        // Calculate discount from points (100 points = 1 INR)
        pointsDiscountINR = pointsRedeemed / 100;
        // Convert INR discount to USD (prices are in USD)
        const USD_TO_INR = 83;
        pointsDiscountUSD = pointsDiscountINR / USD_TO_INR;
        
        // Ensure total doesn't go negative
        const maxDiscountUSD = calculatedSubtotal - discount;
        if (pointsDiscountUSD > maxDiscountUSD) {
          pointsDiscountUSD = maxDiscountUSD;
          pointsDiscountINR = maxDiscountUSD * USD_TO_INR;
        }
      }

      const shipping = calculatedSubtotal > 100 ? 0 : 10;
      const tax = (calculatedSubtotal - discount - pointsDiscountUSD) * 0.08;
      const totalUSD = calculatedSubtotal - discount - pointsDiscountUSD + shipping + tax;
      
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
          pointsRedeemed: pointsRedeemed || 0,
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
        pointsDiscount: pointsDiscountUSD.toFixed(2),
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

  // Admin routes - Protected by requireAdmin middleware
  
  // Admin: Get all orders with filtering
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const orders = await storage.getAllOrders(status as string);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update order status
  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { orderStatus } = req.body;
      if (!orderStatus || typeof orderStatus !== "string") {
        return res.status(400).json({ message: "Invalid order status" });
      }
      const order = await storage.updateOrderStatus(req.params.id, orderStatus);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Update product
  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Delete product
  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Get dashboard statistics
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update product stock
  app.patch("/api/admin/products/:id/stock", requireAdmin, async (req, res) => {
    try {
      const { stock } = req.body;
      if (typeof stock !== "number" || stock < 0) {
        return res.status(400).json({ message: "Invalid stock value" });
      }
      const product = await storage.updateProductStock(req.params.id, stock);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Create coupon
  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Get all coupons
  app.get("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update coupon
  app.patch("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCouponSchema.partial().parse(req.body);
      const coupon = await storage.updateCoupon(req.params.id, validatedData);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Category management routes
  app.get("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public: Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Homepage content routes
  app.get("/api/homepage", async (req, res) => {
    try {
      const content = await storage.getHomepageContent();
      res.json(content || {
        heroTitle: null,
        heroSubtitle: null,
        heroImage: null,
        featuredProductIds: [],
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/homepage", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertHomepageContentSchema.parse(req.body);
      const content = await storage.updateHomepageContent(validatedData);
      res.json(content);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Loyalty Points routes
  app.get("/api/loyalty/balance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const points = await storage.getUserLoyaltyPoints(req.user!.id);
      res.json({ points });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/loyalty/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const transactions = await storage.getUserLoyaltyTransactions(req.user!.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/loyalty/redeem", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { points } = req.body;
      
      if (!points || points <= 0) {
        return res.status(400).json({ message: "Invalid points amount" });
      }

      // Points redemption rate: 100 points = 1 INR discount
      const success = await storage.redeemLoyaltyPoints(
        req.user!.id,
        points,
        `Redeemed ${points} points for discount`
      );

      if (!success) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }

      res.json({ message: "Points redeemed successfully", pointsRedeemed: points });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
