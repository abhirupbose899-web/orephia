import type { Express } from "express";
import { createShopifyCheckout, type ShopifyCartLine, mapOrephiaProductToShopifyVariant } from "./shopify";
import { storage } from "./storage";

/**
 * Shopify Checkout API Routes
 * Handles cart-to-Shopify checkout conversion for dropshipping
 */
export function registerShopifyCheckoutRoutes(app: Express) {
  /**
   * Create Shopify checkout from Orephia cart
   * POST /api/shopify/checkout
   * Body: { items: Array<{productId, quantity, size?, color?}> }
   */
  app.post("/api/shopify/checkout", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }

      // Verify products exist and build Shopify cart lines
      const shopifyCartLines: ShopifyCartLine[] = [];

      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }

        // Map Orephia product to Shopify variant ID
        const shopifyVariantId = mapOrephiaProductToShopifyVariant(
          product,
          item.size,
          item.color
        );

        shopifyCartLines.push({
          merchandiseId: shopifyVariantId,
          quantity: item.quantity,
        });
      }

      // Create Shopify checkout
      const { checkoutUrl, cartId } = await createShopifyCheckout(shopifyCartLines);

      res.json({
        checkoutUrl,
        cartId,
        message: "Shopify checkout created successfully",
      });
    } catch (error: any) {
      console.error("Shopify checkout creation error:", error);
      res.status(500).json({ 
        message: "Failed to create Shopify checkout", 
        error: error.message 
      });
    }
  });
}
