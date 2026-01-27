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
    
    let restaurant: { id: string; slug: string; admin: { id: string; email: string } | null } | null = null;
    let admin;
    
    if (existingAdmin) {
      console.log("Admin account already exists!");
      console.log("Restaurant ID:", existingAdmin.restaurantId);
      console.log("Restaurant Slug:", existingAdmin.restaurant?.slug);
      
      // Check if products exist
      const productCount = await prisma.product.count({
        where: { category: { restaurantId: existingAdmin.restaurantId } },
      });
      
      if (productCount > 0) {
        console.log(`\n✅ Restaurant already has ${productCount} products.`);
        return;
      }
      
      // Restore products for existing restaurant
      console.log("\n📦 Restoring products and categories for existing restaurant...");
      restaurant = { id: existingAdmin.restaurantId, slug: existingAdmin.restaurant?.slug || "", admin: null };
      admin = existingAdmin;
    } else {
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
      
      restaurant = payments[0]?.restaurant || null;
      
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
        const foundRestaurant = await prisma.restaurant.findFirst({
          where: {
            admin: null,
          },
          include: { admin: true },
          orderBy: { createdAt: "desc" },
        });
        restaurant = foundRestaurant;
      }
      
      if (!restaurant) {
        console.log("\n⚠️  No existing restaurant found. Creating a new one...");
        // Create a new restaurant
        const newRestaurant = await prisma.restaurant.create({
          data: {
            name: "Restored Restaurant",
            slug: `restored-${Date.now()}`,
            description: "Restored restaurant account",
            status: "approved",
          },
          include: { admin: true },
        });
        restaurant = { id: newRestaurant.id, slug: newRestaurant.slug, admin: null };
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
      admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          restaurantId: restaurant.id,
        },
      });
      console.log(`\n✅ Admin account created successfully!`);
    }
    
    console.log(`Email: ${admin.email}`);
    console.log(`Restaurant ID: ${admin.restaurantId}`);
    console.log(`Restaurant Slug: ${restaurant.slug}`);
    
    console.log(`Email: ${admin.email}`);
    console.log(`Restaurant ID: ${admin.restaurantId}`);
    console.log(`Restaurant Slug: ${restaurant.slug}`);
    
    // Restore products and categories from seed data
    console.log(`\n📦 Restoring products and categories...`);
    
    // Check if categories already exist
    const existingCategories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id },
    });
    
    if (existingCategories.length > 0) {
      console.log(`⚠️  Restaurant already has ${existingCategories.length} categories. Skipping product restoration.`);
      console.log(`\nYou can now login at: /admin/login`);
      return;
    }
    
    // Create categories
    const startersCategory = await prisma.category.create({
      data: {
        name: 'Aperatifler',
        description: 'Başlangıç lezzetleri',
        order: 1,
        restaurantId: restaurant.id,
      },
    });

    const soupCategory = await prisma.category.create({
      data: {
        name: 'Çorbalar',
        description: 'Sıcak çorbalar',
        order: 2,
        restaurantId: restaurant.id,
      },
    });

    const mainCategory = await prisma.category.create({
      data: {
        name: 'Ana Yemekler',
        description: 'Doyurucu ana yemekler',
        order: 3,
        restaurantId: restaurant.id,
      },
    });

    const pizzaCategory = await prisma.category.create({
      data: {
        name: 'Pizzalar',
        description: 'Taze malzemelerle hazırlanmış pizzalar',
        order: 4,
        restaurantId: restaurant.id,
      },
    });

    const saladCategory = await prisma.category.create({
      data: {
        name: 'Salatalar',
        description: 'Taze ve sağlıklı salatalar',
        order: 5,
        restaurantId: restaurant.id,
      },
    });

    const drinkCategory = await prisma.category.create({
      data: {
        name: 'İçecekler',
        description: 'Soğuk ve sıcak içecekler',
        order: 6,
        restaurantId: restaurant.id,
      },
    });

    // Create products - Aperatifler
    await prisma.product.create({
      data: {
        name: 'Cacık',
        description: 'Yoğurt, salatalık, sarımsak',
        price: 80.00,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        isAvailable: true,
        order: 1,
        prepMinMinutes: 5,
        prepMaxMinutes: 10,
        categoryId: startersCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Fasulye Kavurması',
        description: 'Taze fasulye, domates, soğan',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        isAvailable: true,
        order: 2,
        prepMinMinutes: 15,
        prepMaxMinutes: 25,
        categoryId: startersCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Havuç Tarator',
        description: 'Havuç, yoğurt, ceviz',
        price: 80.00,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        isAvailable: true,
        order: 3,
        prepMinMinutes: 5,
        prepMaxMinutes: 10,
        categoryId: startersCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Patates Kızartması',
        description: 'Taze patates, tuz',
        price: 100.00,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
        isAvailable: true,
        order: 4,
        prepMinMinutes: 10,
        prepMaxMinutes: 15,
        categoryId: startersCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Sarma',
        description: 'Yaprak sarma, zeytinyağlı',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        isAvailable: true,
        order: 5,
        prepMinMinutes: 20,
        prepMaxMinutes: 30,
        categoryId: startersCategory.id,
      },
    });

    // Create products - Çorbalar
    await prisma.product.create({
      data: {
        name: 'Domates Çorbası',
        description: 'Taze domates, fesleğen',
        price: 80.00,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        isAvailable: true,
        order: 1,
        prepMinMinutes: 10,
        prepMaxMinutes: 15,
        categoryId: soupCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Ezogelin Çorba',
        description: 'Mercimek, bulgur, nane',
        price: 80.00,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        isAvailable: true,
        order: 2,
        prepMinMinutes: 15,
        prepMaxMinutes: 20,
        categoryId: soupCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Mercimek Çorba',
        description: 'Kırmızı mercimek, havuç',
        price: 80.00,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        isAvailable: true,
        order: 3,
        prepMinMinutes: 15,
        prepMaxMinutes: 20,
        categoryId: soupCategory.id,
      },
    });

    // Create products - Ana Yemekler
    await prisma.product.create({
      data: {
        name: 'Izgara Köfte',
        description: 'Kıyma, soğan, baharat',
        price: 300.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        isAvailable: true,
        order: 1,
        prepMinMinutes: 20,
        prepMaxMinutes: 30,
        categoryId: mainCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Tavuk Şiş',
        description: 'Tavuk göğsü, sebze',
        price: 280.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        isAvailable: true,
        order: 2,
        prepMinMinutes: 15,
        prepMaxMinutes: 25,
        categoryId: mainCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Kuzu Tandır',
        description: 'Kuzu eti, baharat',
        price: 450.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        isAvailable: true,
        order: 3,
        prepMinMinutes: 30,
        prepMaxMinutes: 45,
        categoryId: mainCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Balık Tava',
        description: 'Taze balık, un, limon',
        price: 350.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        isAvailable: true,
        order: 4,
        prepMinMinutes: 20,
        prepMaxMinutes: 30,
        categoryId: mainCategory.id,
      },
    });

    // Create products - Pizzalar
    await prisma.product.create({
      data: {
        name: 'Margherita',
        description: 'Domates, mozzarella, fesleğen',
        price: 200.00,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        isAvailable: true,
        order: 1,
        prepMinMinutes: 15,
        prepMaxMinutes: 20,
        categoryId: pizzaCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Pepperoni',
        description: 'Pepperoni, mozzarella',
        price: 250.00,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        isAvailable: true,
        order: 2,
        prepMinMinutes: 15,
        prepMaxMinutes: 20,
        categoryId: pizzaCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Karışık Pizza',
        description: 'Sucuk, sosis, mantar, zeytin',
        price: 280.00,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        isAvailable: true,
        order: 3,
        prepMinMinutes: 20,
        prepMaxMinutes: 25,
        categoryId: pizzaCategory.id,
      },
    });

    // Create products - Salatalar
    await prisma.product.create({
      data: {
        name: 'Çoban Salata',
        description: 'Domates, salatalık, soğan, maydanoz',
        price: 120.00,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        isAvailable: true,
        order: 1,
        prepMinMinutes: 5,
        prepMaxMinutes: 10,
        categoryId: saladCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Mevsim Salata',
        description: 'Karışık yeşillik, zeytinyağı',
        price: 100.00,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        isAvailable: true,
        order: 2,
        prepMinMinutes: 5,
        prepMaxMinutes: 10,
        categoryId: saladCategory.id,
      },
    });

    // Create products - İçecekler
    await prisma.product.create({
      data: {
        name: 'Ayran',
        description: 'Taze ayran',
        price: 30.00,
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800',
        isAvailable: true,
        order: 1,
        prepMinMinutes: 1,
        prepMaxMinutes: 2,
        categoryId: drinkCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Kola',
        description: 'Soğuk kola',
        price: 40.00,
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800',
        isAvailable: true,
        order: 2,
        prepMinMinutes: 1,
        prepMaxMinutes: 2,
        categoryId: drinkCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Su',
        description: 'Doğal kaynak suyu',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800',
        isAvailable: true,
        order: 3,
        prepMinMinutes: 1,
        prepMaxMinutes: 1,
        categoryId: drinkCategory.id,
      },
    });

    await prisma.product.create({
      data: {
        name: 'Türk Kahvesi',
        description: 'Geleneksel Türk kahvesi',
        price: 50.00,
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800',
        isAvailable: true,
        order: 4,
        prepMinMinutes: 5,
        prepMaxMinutes: 10,
        categoryId: drinkCategory.id,
      },
    });

    console.log(`✅ Restored ${await prisma.category.count({ where: { restaurantId: restaurant.id } })} categories`);
    console.log(`✅ Restored ${await prisma.product.count({ where: { category: { restaurantId: restaurant.id } } })} products`);
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
