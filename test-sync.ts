#!/usr/bin/env tsx

/**
 * Test script to trigger Shopify product sync
 * Run with: tsx test-sync.ts
 */

import { syncProductsFromShopify } from "./server/shopify-sync.js";

async function testSync() {
  console.log("🧪 Testing Shopify Product Sync...\n");
  
  try {
    console.log("🔄 Starting sync from Shopify store: 7ehjpp-c6.myshopify.com");
    console.log("=" .repeat(60));
    
    const results = await syncProductsFromShopify();
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Sync completed successfully!");
    console.log("\n📊 Results:");
    console.log(`  - Products synced: ${results.synced}`);
    console.log(`  - Products updated: ${results.updated}`);
    console.log(`  - Total processed: ${results.total}`);
    
    if (results.errors.length > 0) {
      console.log(`\n⚠️  Errors (${results.errors.length}):`);
      results.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    console.log("\n✨ You can now view the synced products in the admin panel!");
    
  } catch (error: any) {
    console.error("\n❌ Sync failed:");
    console.error(`  Error: ${error.message}`);
    if (error.stack) {
      console.error(`\n  Stack trace:\n${error.stack}`);
    }
    process.exit(1);
  }
}

testSync();
