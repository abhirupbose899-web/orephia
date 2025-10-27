import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Validate Shopify environment variables
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn("⚠️  Shopify environment variables not configured. Shopify features will not work.");
  console.warn("   Required: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN");
}

// Initialize Shopify Storefront API client
const client = createStorefrontApiClient({
  storeDomain: SHOPIFY_STORE_DOMAIN || 'placeholder.myshopify.com',
  apiVersion: '2025-01',
  publicAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'placeholder',
});

export interface ShopifyCartLine {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyCheckoutResponse {
  checkoutUrl: string;
  cartId: string;
}

/**
 * Create a Shopify cart and return checkout URL
 * This enables dropshipping by using Shopify's checkout while maintaining custom frontend
 */
export async function createShopifyCheckout(
  cartLines: ShopifyCartLine[]
): Promise<ShopifyCheckoutResponse> {
  const mutation = `
    mutation createCart($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    lines: cartLines,
  };

  const { data, errors } = await client.request(mutation, { variables });

  if (errors || data?.cartCreate?.userErrors?.length > 0) {
    const errorMessage = (errors && Array.isArray(errors) && errors[0]?.message) || 
                        data?.cartCreate?.userErrors?.[0]?.message || 
                        'Failed to create Shopify checkout';
    throw new Error(`Shopify Checkout Error: ${errorMessage}`);
  }

  return {
    checkoutUrl: data.cartCreate.cart.checkoutUrl,
    cartId: data.cartCreate.cart.id,
  };
}

/**
 * Map Orephia product to Shopify variant ID
 * Uses stored shopifyVariantId from database
 */
export function mapOrephiaProductToShopifyVariant(
  product: any,
  size?: string,
  color?: string
): string {
  // If product has a stored Shopify variant ID, use it
  if (product.shopifyVariantId) {
    return product.shopifyVariantId;
  }
  
  // Fallback: log warning if no Shopify ID is found
  console.warn(`⚠️  Product "${product.title}" (${product.id}) has no Shopify variant ID. Please sync products from Shopify.`);
  
  // Return a placeholder - this will likely fail at checkout
  return `gid://shopify/ProductVariant/UNKNOWN`;
}

/**
 * Query Shopify products to sync with Orephia catalog
 */
export async function getShopifyProducts(first: number = 50) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first, query: "status:active") {
        edges {
          node {
            id
            title
            handle
            description
            vendor
            tags
            availableForSale
            publishedOnPublication(publicationId: "gid://shopify/Publication/1")
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const variables = { first };

  const { data, errors } = await client.request(query, { variables });

  if (errors && Array.isArray(errors) && errors.length > 0) {
    throw new Error(`Failed to fetch Shopify products: ${errors[0]?.message || 'Unknown error'}`);
  }

  return data.products.edges.map((edge: any) => edge.node);
}
