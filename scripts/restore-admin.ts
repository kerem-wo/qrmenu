import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local if it exists
config({ path: resolve(process.cwd(), ".env.local") });
// Also load .env as fallback
config();

const prisma = new PrismaClient();

async function restoreAdmin() {
  try {
    const email = "softwareofuture@gmail.com";
    const password = "MerveKerem1.1";
    
    console.log(`Restoring admin account: ${email}`);
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
      include: { restaurant: true },
    });
    
    if (existingAdmin) {
      console.log("Admin account already exists!");
      console.log("Restaurant ID:", existingAdmin.restaurantId);
      console.log("Restaurant Slug:", existingAdmin.restaurant?.slug);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if restaurant exists (by slug or name)
    // First, let's try to find any restaurant that might be related
    const restaurants = await prisma.restaurant.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { admin: true },
    });
    
    console.log("\nAvailable restaurants:");
    restaurants.forEach((r, i) => {
      console.log(`${i + 1}. ${r.name} (${r.slug}) - Admin: ${r.admin?.email || "None"}`);
    });
    
    // Try to find restaurant by checking recent orders or payments
    // Check payments first (most reliable)
    const payments = await prisma.payment.findMany({
      where: {
        customerEmail: email,
      },
      take: 1,
      include: { restaurant: { include: { admin: true } } },
      orderBy: { createdAt: "desc" },
    });
    
    let restaurant = payments[0]?.restaurant || null;
    
    // If no restaurant found via payments, check orders
    if (!restaurant) {
      const orders = await prisma.order.findMany({
        where: {
          customerPhone: { contains: email.split("@")[0] },
        },
        take: 1,
        include: { restaurant: { include: { admin: true } } },
        orderBy: { createdAt: "desc" },
      });
      restaurant = orders[0]?.restaurant || null;
    }
    
    // If still no restaurant found, check for restaurants without admin
    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst({
        where: {
          admin: null,
        },
        orderBy: { createdAt: "desc" },
      });
    }
    
    if (!restaurant) {
      console.log("\n⚠️  No existing restaurant found. Creating a new one...");
      // Create a new restaurant
      restaurant = await prisma.restaurant.create({
        data: {
          name: "Restored Restaurant",
          slug: `restored-${Date.now()}`,
          description: "Restored restaurant account",
          status: "approved",
        },
      });
      console.log(`✅ Created new restaurant: ${restaurant.id} (${restaurant.slug})`);
    } else {
      console.log(`✅ Using existing restaurant: ${restaurant.id} (${restaurant.slug})`);
      if (restaurant.admin) {
        console.log(`⚠️  Warning: This restaurant already has an admin: ${restaurant.admin.email}`);
        console.log("   The new admin will replace the existing one.");
        // Delete existing admin
        await prisma.admin.delete({
          where: { id: restaurant.admin.id },
        });
        console.log("   Old admin removed.");
      }
    }
    
    // Create admin account
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        restaurantId: restaurant.id,
      },
    });
    
    console.log(`\n✅ Admin account restored successfully!`);
    console.log(`Email: ${admin.email}`);
    console.log(`Restaurant ID: ${admin.restaurantId}`);
    console.log(`Restaurant Slug: ${restaurant.slug}`);
    console.log(`\nYou can now login at: /admin/login`);
    
  } catch (error: any) {
    console.error("Error restoring admin:", error);
    if (error.code === "P2002") {
      console.error("Account already exists with this email!");
    }
  } finally {
    await prisma.$disconnect();
  }
}

restoreAdmin();
