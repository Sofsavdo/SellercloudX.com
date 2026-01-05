// Initialize default partner for testing
import { db } from "./db";
import { users, partners } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

/**
 * Initialize default partner user
 */
export async function initializePartner() {
  try {
    console.log("🔍 Checking for partner user...");
    
    // Check if partner user already exists
    const existingPartner = await db
      .select()
      .from(users)
      .where(eq(users.username, "partner"))
      .limit(1);
    
    if (existingPartner.length > 0) {
      console.log("✅ Partner user already exists");
      return;
    }
    
    // Create partner user
    console.log("🔧 Creating partner user...");
    const partnerPassword = await bcrypt.hash("partner123", 10);
    
    const partnerUserId = nanoid();
    
    // Create user
    await db.insert(users).values({
      id: partnerUserId,
      username: "partner",
      email: "partner@sellercloudx.com",
      password: partnerPassword,
      firstName: "Test",
      lastName: "Partner",
      phone: "+998901234568",
      role: "partner",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create partner record
    const partnerId = nanoid();
    await db.insert(partners).values({
      id: partnerId,
      userId: partnerUserId,
      businessName: "SellerCloudX Test Partner",
      businessAddress: "Global E-commerce",
      businessCategory: "Marketplace Automation",
      phone: "+998901234568",
      approved: true,
      pricingTier: "free_starter",
      aiEnabled: true,
      anydeskId: null,
      anydeskPassword: null,
      createdAt: new Date(),
      lastActivityAt: new Date()
    });
    
    console.log("✅ Partner user created successfully!");
    console.log("🔑 Partner Login Credentials:");
    console.log("   Username: partner");
    console.log("   Password: partner123");
    console.log("   Email: partner@sellercloudx.com");
    
  } catch (error) {
    console.error("❌ Error initializing partner user:", error);
    // Don't throw - let server continue even if partner creation fails
  }
}

