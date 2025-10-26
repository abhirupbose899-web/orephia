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

    for (const shopifyProduct of shopifyProducts) {
      try {
        // Extract product data
        const variants = shopifyProduct.variants?.edges || [];
        const images = shopifyProduct.images?.edges || [];
        
        if (variants.length === 0) {
          console.warn(`⚠️  Skipping ${shopifyProduct.title} - no variants found`);
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
        const orephiaProduct = {
          title: shopifyProduct.title,
          description: shopifyProduct.description || '',
          price: primaryVariant.price.amount,
          images: images.map((img: any) => img.node.url),
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

        // Check if product already exists (by Shopify ID)
        const existingProduct = await storage.getProductByShopifyId(shopifyProduct.id);

        if (existingProduct) {
          // Update existing product
          await storage.updateProduct(existingProduct.id, orephiaProduct);
          console.log(`🔄 Updated: ${shopifyProduct.title}`);
          results.updated++;
        } else {
          // Create new product
          await storage.createProduct(orephiaProduct);
          console.log(`✅ Synced: ${shopifyProduct.title}`);
          results.synced++;
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
