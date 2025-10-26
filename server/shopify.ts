import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Initialize Shopify Storefront API client
const client = createStorefrontApiClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN || '',
  apiVersion: '2025-01',
  publicAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
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
 * Map Orephia product variant to Shopify product variant ID
 * This requires matching products between Orephia database and Shopify store
 */
export function mapOrephiaProductToShopifyVariant(
  productId: string,
  size?: string,
  color?: string
): string {
  // TODO: Implement mapping logic based on your Shopify product setup
  // For now, this is a placeholder that needs to be configured
  // You'll need to store Shopify variant IDs in your database or use SKU matching
  
  // Example format: gid://shopify/ProductVariant/123456789
  // This should be replaced with actual mapping from your Shopify store
  console.warn('⚠️  Shopify product mapping not yet configured. Please map Orephia products to Shopify variants.');
  
  return `gid://shopify/ProductVariant/${productId}`;
}

/**
 * Query Shopify products to sync with Orephia catalog
 */
export async function getShopifyProducts(first: number = 50) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            vendor
            tags
            availableForSale
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
                }
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
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
