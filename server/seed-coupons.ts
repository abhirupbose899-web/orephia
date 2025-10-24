import { db } from "./db";
import { coupons } from "@shared/schema";

async function seedCoupons() {
  console.log("Seeding coupons...");

  const sampleCoupons = [
    {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: "10.00",
      minPurchase: "50.00",
      maxDiscount: null,
      usageLimit: null,
      expiresAt: null,
      isActive: true,
    },
    {
      code: "LUXURY20",
      discountType: "percentage",
      discountValue: "20.00",
      minPurchase: "200.00",
      maxDiscount: "50.00",
      usageLimit: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: "FREESHIP",
      discountType: "fixed",
      discountValue: "10.00",
      minPurchase: null,
      maxDiscount: null,
      usageLimit: null,
      expiresAt: null,
      isActive: true,
    },
    {
      code: "VIP50",
      discountType: "fixed",
      discountValue: "50.00",
      minPurchase: "300.00",
      maxDiscount: null,
      usageLimit: 50,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  try {
    const existingCoupons = await db.select().from(coupons);
    if (existingCoupons.length > 0) {
      console.log("Coupons already seeded with", existingCoupons.length, "coupons");
      return;
    }

    await db.insert(coupons).values(sampleCoupons);
    console.log("Successfully seeded", sampleCoupons.length, "coupons");
  } catch (error) {
    console.error("Error seeding coupons:", error);
    throw error;
  }
}

seedCoupons()
  .then(() => {
    console.log("Coupon seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Coupon seed failed:", error);
    process.exit(1);
  });
