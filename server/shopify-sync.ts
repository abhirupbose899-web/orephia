import { getShopifyProducts } from "./shopify";
import { storage } from "./storage";

/**
 * Sync products from Shopify to Orephia database
 * This enables displaying Shopify products while maintaining custom frontend
 */
export async function syncProductsFromShopify(): Promise<{
  synced: number;
  updated: number;
  errors: string[];
}> {
  const results = {
    synced: 0,
    updated: 0,
    errors: [] as string[],
  };

  try {
    console.log("🔄 Starting Shopify product sync...");
    
    // Fetch products from Shopify
    const shopifyProducts = await getShopifyProducts(250); // Fetch up to 250 products
    
    console.log(`📦 Found ${shopifyProducts.length} products in Shopify store`);
    
    if (shopifyProducts.length === 0) {
      console.warn("⚠️  No products found in Shopify store.");
      console.warn("   Make sure your products are:");
      console.warn("   1. Published to the 'Online Store' sales channel");
      console.warn("   2. Set to 'Active' status");
      console.warn("   3. Available for sale");
      results.errors.push("No products found in Shopify. Check that products are published to Online Store sales channel.");
      return results;
    }

    for (const shopifyProduct of shopifyProducts) {
      try {
        // Extract product data
        const variants = shopifyProduct.variants?.edges || [];
        const images = shopifyProduct.images?.edges || [];
        
        console.log(`\n📝 Processing: ${shopifyProduct.title}`);
        console.log(`   Variants: ${variants.length}, Images: ${images.length}`);
        
        if (variants.length === 0) {
          console.warn(`⚠️  Skipping ${shopifyProduct.title} - no variants found`);
          results.errors.push(`${shopifyProduct.title}: No variants found`);
          continue;
        }

        // Get primary variant (first one)
        const primaryVariant = variants[0].node;
        
        // Extract all available sizes and colors from variants
        const sizes: string[] = [];
        const colors: string[] = [];
        
        variants.forEach((variant: any) => {
          const options = variant.node.selectedOptions || [];
          options.forEach((option: any) => {
            if (option.name.toLowerCase() === 'size' && !sizes.includes(option.value)) {
              sizes.push(option.value);
            }
            if (option.name.toLowerCase() === 'color' && !colors.includes(option.value)) {
              colors.push(option.value);
            }
          });
        });

        // Map Shopify product to Orephia product format
        const imageUrls = images.map((img: any) => img.node.url);
        const orephiaProduct = {
          title: shopifyProduct.title,
          description: shopifyProduct.description || 'No description available',
          price: primaryVariant.price.amount,
          images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1200&fit=crop'],
          category: shopifyProduct.vendor || 'Uncategorized',
          mainCategory: 'Apparels', // Default, can be customized
          subCategory: null,
          sizes: sizes.length > 0 ? sizes : ['One Size'],
          colors: colors.length > 0 ? colors : ['Default'],
          tags: shopifyProduct.tags || [],
          stock: primaryVariant.quantityAvailable || 0,
          featured: false,
          newArrival: false,
          shopifyProductId: shopifyProduct.id,
          shopifyVariantId: primaryVariant.id,
        };
        
        console.log(`   Price: $${orephiaProduct.price}, Stock: ${orephiaProduct.stock}`);
        console.log(`   Images: ${orephiaProduct.images.length} found`);

        // Check if product already exists (by Shopify ID)
        const existingProduct = await storage.getProductByShopifyId(shopifyProduct.id);

        if (existingProduct) {
          // Update existing product - make sure to update ALL fields
          const updated = await storage.updateProduct(existingProduct.id, orephiaProduct);
          if (updated) {
            console.log(`✅ Updated: ${shopifyProduct.title} (ID: ${existingProduct.id})`);
            results.updated++;
          } else {
            console.error(`❌ Failed to update: ${shopifyProduct.title}`);
            results.errors.push(`${shopifyProduct.title}: Update failed`);
          }
        } else {
          // Create new product
          const created = await storage.createProduct(orephiaProduct);
          if (created) {
            console.log(`✅ Created: ${shopifyProduct.title} (ID: ${created.id})`);
            results.synced++;
          } else {
            console.error(`❌ Failed to create: ${shopifyProduct.title}`);
            results.errors.push(`${shopifyProduct.title}: Creation failed`);
          }
        }
      } catch (error: any) {
        console.error(`❌ Error syncing product ${shopifyProduct.title}:`, error.message);
        results.errors.push(`${shopifyProduct.title}: ${error.message}`);
      }
    }

    console.log(`\n✨ Sync complete!`);
    console.log(`   Synced: ${results.synced} new products`);
    console.log(`   Updated: ${results.updated} existing products`);
    if (results.errors.length > 0) {
      console.log(`   Errors: ${results.errors.length}`);
    }

    return results;
  } catch (error: any) {
    console.error("❌ Shopify sync failed:", error);
    results.errors.push(`Sync failed: ${error.message}`);
    return results;
  }
}
