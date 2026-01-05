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
    
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, "Medik"))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("✅ Admin user already exists");
      return;
    }
    
    // Create admin user
    console.log("🔧 Creating admin user...");
    const adminPassword = await bcrypt.hash("Medik9298", 10);
    
    await db.insert(users).values({
      id: nanoid(),
      username: "Medik",
      email: "medik@sellercloudx.com",
      password: adminPassword,
      firstName: "Medik",
      lastName: "Admin",
      phone: "+998901234567",
      role: "admin",
      isActive: true
      // createdAt and updatedAt use database defaults
    });
    
    console.log("✅ Admin user created successfully!");
    console.log("🔑 Admin Login Credentials:");
    console.log("   Username: Medik");
    console.log("   Password: Medik9298");
    console.log("   Email: medik@sellercloudx.com");
    
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
    // Don't throw - let server continue even if admin creation fails
  }
}
