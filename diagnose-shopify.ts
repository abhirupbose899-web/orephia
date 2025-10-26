#!/usr/bin/env tsx

/**
 * Comprehensive Shopify Diagnostic Script
 * Diagnoses why products aren't syncing from Shopify
 */

import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_PRIVATE_ACCESS_TOKEN = process.env.SHOPIFY_PRIVATE_ACCESS_TOKEN;

console.log("🔍 Shopify Product Sync Diagnostic\n");
console.log("=" .repeat(70));
console.log("\n📋 Configuration:");
console.log(`  Store: ${SHOPIFY_STORE_DOMAIN}`);
console.log(`  Storefront Token: ${SHOPIFY_STOREFRONT_ACCESS_TOKEN?.substring(0, 15)}...`);
console.log(`  Admin Token: ${SHOPIFY_PRIVATE_ACCESS_TOKEN ? SHOPIFY_PRIVATE_ACCESS_TOKEN.substring(0, 15) + '...' : 'NOT SET'}`);

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.error("\n❌ Missing required Shopify credentials!");
  process.exit(1);
}

const storefrontClient = createStorefrontApiClient({
  storeDomain: SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-01',
  publicAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

async function testStorefrontAPI() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST 1: Storefront API - Published Products");
  console.log("=".repeat(70));
  
  try {
    const query = `
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              availableForSale
            }
          }
        }
      }
    `;
    
    const result = await storefrontClient.request(query);
    const products = result.data?.products?.edges || [];
    
    console.log(`\n✅ Storefront API Response:`);
    console.log(`   Products found: ${products.length}`);
    
    if (products.length > 0) {
      console.log(`\n   Products:`);
      products.forEach((edge: any, i: number) => {
        const p = edge.node;
        console.log(`   ${i + 1}. ${p.title}`);
        console.log(`      ID: ${p.id}`);
        console.log(`      Handle: ${p.handle}`);
        console.log(`      Available for sale: ${p.availableForSale}`);
      });
    } else {
      console.log(`\n   ⚠️  No products found via Storefront API`);
      console.log(`   This means products are NOT published to the "Online Store" channel`);
    }
    
    if (result.errors) {
      console.log(`\n   ❌ API Errors:`, JSON.stringify(result.errors, null, 2));
    }
    
  } catch (error: any) {
    console.error(`\n   ❌ Storefront API Error: ${error.message}`);
  }
}

async function testAdminAPI() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST 2: Admin API - All Products (including unpublished)");
  console.log("=".repeat(70));
  
  if (!SHOPIFY_PRIVATE_ACCESS_TOKEN) {
    console.log("\n   ⚠️  SHOPIFY_PRIVATE_ACCESS_TOKEN not set - skipping Admin API test");
    console.log("   To test Admin API, add your Admin API access token to secrets");
    return;
  }
  
  try {
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/products.json`;
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_PRIVATE_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`\n   ❌ Admin API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Response: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    const products = data.products || [];
    
    console.log(`\n✅ Admin API Response:`);
    console.log(`   Total products: ${products.length}`);
    
    if (products.length > 0) {
      console.log(`\n   Products found:`);
      products.forEach((p: any, i: number) => {
        console.log(`   ${i + 1}. ${p.title}`);
        console.log(`      ID: ${p.id}`);
        console.log(`      Status: ${p.status}`);
        console.log(`      Published: ${p.published_at || 'Not published'}`);
        console.log(`      Variants: ${p.variants?.length || 0}`);
        
        // Check publication status
        if (p.published_at) {
          console.log(`      ✅ Published to sales channels`);
        } else {
          console.log(`      ⚠️  NOT published - needs to be published to Online Store channel`);
        }
      });
    }
    
  } catch (error: any) {
    console.error(`\n   ❌ Admin API Error: ${error.message}`);
  }
}

async function provideSolution() {
  console.log("\n" + "=".repeat(70));
  console.log("💡 SOLUTION");
  console.log("=".repeat(70));
  
  console.log(`
The Storefront API only returns products that are:
  1. ✅ Published to the "Online Store" sales channel
  2. ✅ Status is "Active" (not Draft)
  3. ✅ Available for sale

To fix the sync issue:

📝 STEP 1: Publish your product in Shopify Admin
   1. Go to: https://${SHOPIFY_STORE_DOMAIN}/admin/products
   2. Click on your product
   3. Scroll to "Product availability" section (right sidebar)
   4. Click "Manage" next to Sales channels
   5. Check the "Online Store" checkbox
   6. Click "Done" then "Save"

📝 STEP 2: Verify product is Active
   1. Make sure product status is "Active" (not "Draft")
   2. At least one variant should be available

📝 STEP 3: Re-run sync in Orephia
   1. Log into Orephia admin panel
   2. Go to Products page
   3. Click "Sync from Shopify" button

Alternative: If you want to sync ALL products (including drafts):
   - Use the Admin API instead of Storefront API
   - Requires SHOPIFY_PRIVATE_ACCESS_TOKEN (Admin API access token)
   - Can access products regardless of publication status
  `);
}

async function runDiagnostics() {
  await testStorefrontAPI();
  await testAdminAPI();
  await provideSolution();
  
  console.log("\n" + "=".repeat(70));
  console.log("✅ Diagnostic Complete");
  console.log("=".repeat(70) + "\n");
}

runDiagnostics();
