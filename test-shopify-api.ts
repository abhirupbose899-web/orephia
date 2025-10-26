#!/usr/bin/env tsx

/**
 * Diagnostic script to test Shopify API connection
 * Run with: tsx test-shopify-api.ts
 */

import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log("🧪 Shopify API Diagnostic Test\n");
console.log("Configuration:");
console.log(`  Store Domain: ${SHOPIFY_STORE_DOMAIN}`);
console.log(`  Access Token: ${SHOPIFY_STOREFRONT_ACCESS_TOKEN?.substring(0, 10)}...`);
console.log("");

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.error("❌ Missing Shopify credentials!");
  process.exit(1);
}

const client = createStorefrontApiClient({
  storeDomain: SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-01',
  publicAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

async function testConnection() {
  try {
    // Test 1: Fetch shop info
    console.log("📡 Test 1: Fetching shop information...");
    const shopQuery = `
      query {
        shop {
          name
          description
          primaryDomain {
            url
          }
        }
      }
    `;
    
    const shopResult = await client.request(shopQuery);
    console.log("✅ Shop info:", JSON.stringify(shopResult.data, null, 2));
    
    // Test 2: Count products
    console.log("\n📦 Test 2: Counting products...");
    const countQuery = `
      query {
        products(first: 1) {
          edges {
            node {
              id
              title
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
    
    const countResult = await client.request(countQuery);
    console.log("✅ Product query result:", JSON.stringify(countResult.data, null, 2));
    
    if (countResult.data?.products?.edges?.length > 0) {
      console.log(`\n✅ Found at least one product!`);
    } else {
      console.log(`\n⚠️  No products found in the store.`);
      console.log("   This could mean:");
      console.log("   1. The store has no products yet");
      console.log("   2. Products are not published to the storefront sales channel");
      console.log("   3. The access token doesn't have permission to read products");
    }
    
    if (countResult.errors) {
      console.log("\n❌ API Errors:", countResult.errors);
    }
    
  } catch (error: any) {
    console.error("\n❌ Connection test failed:");
    console.error(`  Error: ${error.message}`);
    if (error.response) {
      console.error(`  Response:`, error.response);
    }
  }
}

testConnection();
