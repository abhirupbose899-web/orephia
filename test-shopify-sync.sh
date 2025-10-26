#!/bin/bash

# Test Shopify Sync
# This script logs in as admin and triggers Shopify product sync

BASE_URL="http://localhost:5000"
COOKIE_FILE="/tmp/admin-cookie.txt"

echo "🔐 Logging in as admin..."

# Login as admin (you'll need to know the password)
# For testing, let's assume the password is in the database
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"boss1","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"

echo ""
echo "🔄 Triggering Shopify sync..."

# Trigger sync
SYNC_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/admin/shopify/sync" \
  -H "Content-Type: application/json")

echo "Sync response:"
echo "$SYNC_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SYNC_RESPONSE"

# Clean up
rm -f "$COOKIE_FILE"

echo ""
echo "✅ Test complete!"
