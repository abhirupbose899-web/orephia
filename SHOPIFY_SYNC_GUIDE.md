# Shopify Product Sync - Setup Guide

## 🔍 Issue Identified

Your product in Shopify is **NOT published to the "Online Store" sales channel**. The Storefront API (which Orephia uses for syncing) only returns products that are actively published and available for sale on your online storefront.

## ✅ Solution: Publish Your Product

Follow these steps to make your product visible to Orephia's sync:

### Step 1: Log into Shopify Admin
Go to: **https://7ehjpp-c6.myshopify.com/admin/products**

### Step 2: Open Your Product
Click on the product you want to sync

### Step 3: Publish to Online Store Channel

1. **Scroll down** to the **"Product availability"** section (in the right sidebar)
   
2. **Click "Manage"** next to "Sales channels and apps"
   
3. **Check the "Online Store" checkbox**
   - This makes the product available via the Storefront API
   - The product will now appear on your online store
   
4. **Click "Done"**

5. **Click "Save"** (top right corner)

### Step 4: Verify Product Status

Make sure:
- ✅ Product status is **"Active"** (not "Draft")
- ✅ At least one variant exists and is available
- ✅ Product has a price set
- ✅ "Online Store" is checked in sales channels

### Step 5: Sync in Orephia

1. Go to **Orephia Admin Panel** (login as admin if not already)
2. Navigate to **Products** page
3. Click **"Sync from Shopify"** button
4. You should see: **"Synced: 1, Updated: 0"** ✅

---

## 🔄 How Shopify Sync Works

### What Gets Synced:
- ✅ Product title, description, and handle
- ✅ Product images (up to 10)
- ✅ Pricing information
- ✅ Variants (sizes, colors, etc.)
- ✅ Stock quantities
- ✅ Tags and vendor information

### Requirements:
- Product MUST be published to "Online Store" channel
- Product MUST have "Active" status
- Product MUST have at least one variant

### What Happens:
1. **First Sync**: Creates new product in Orephia database
2. **Subsequent Syncs**: Updates existing product with latest data from Shopify
3. **Checkout**: Customer redirected to Shopify for payment

---

## 🎯 Quick Checklist

Before syncing, ensure:
- [ ] Product is published to Online Store channel
- [ ] Product status is Active
- [ ] Product has images
- [ ] Product has price set
- [ ] At least one variant exists

---

## 🛠️ Troubleshooting

### Still seeing 0 products after publishing?
1. Wait 1-2 minutes after publishing (Shopify may have a delay)
2. Clear your browser cache
3. Log out and log back into Shopify admin
4. Try the sync again

### Want to sync draft products?
- Currently, only published products sync
- This is by design (using Storefront API for dropshipping)
- Publish products when ready for customers to see

### Need help?
Run the diagnostic script:
```bash
tsx diagnose-shopify.ts
```

This will show you exactly what Shopify is returning and help identify any issues.

---

## 📊 Expected Result

After following these steps, your sync should show:

```
✅ Shopify sync completed
Synced: 1, Updated: 0
```

Your product will now appear in:
- Orephia product catalog
- Orephia admin products page
- Customer-facing product pages

When customers checkout, they'll be redirected to Shopify for secure payment processing.
