import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

/**
 * Initialize admin user for production
 * This runs on every server start to ensure admin exists
 */
export async function initializeAdmin() {
  try {
    console.log("🔍 Checking for admin user...");
    
    // Get admin credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@sellercloudx.com";
    
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, adminUsername))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("✅ Admin user already exists");
      return;
    }
    
    // Create admin user
    console.log("🔧 Creating admin user...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await db.insert(users).values({
      id: nanoid(),
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      phone: "+998900000000",
      role: "admin",
      isActive: true
      // createdAt and updatedAt use database defaults
    });
    
    console.log("✅ Admin user created successfully!");
    console.log("🔑 Admin Login Credentials:");
    console.log("   Username:", adminUsername);
    console.log("   Password: [Set via ADMIN_PASSWORD env var]");
    console.log("   Email:", adminEmail);
    
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
    // Don't throw - let server continue even if admin creation fails
  }
}
