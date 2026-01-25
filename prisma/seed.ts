import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local if it exists
config({ path: resolve(process.cwd(), '.env.local') });
// Also load .env as fallback
config();

const prisma = new PrismaClient();

async function main() {
  const platformAdminEmail =
    (process.env.PLATFORM_ADMIN_EMAIL || "admin@platform.com").trim().toLowerCase();
  const platformAdminPassword = process.env.PLATFORM_ADMIN_PASSWORD || "";

  const demoAdminEmail =
    (process.env.DEMO_ADMIN_EMAIL || platformAdminEmail).trim().toLowerCase();
  const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD || platformAdminPassword || "";

  if (!platformAdminPassword) {
    throw new Error("Missing PLATFORM_ADMIN_PASSWORD. Set it in .env.local (not committed).");
  }
  if (!demoAdminPassword) {
    throw new Error("Missing DEMO_ADMIN_PASSWORD (or PLATFORM_ADMIN_PASSWORD). Set it in .env.local (not committed).");
  }

  // Create a demo restaurant (approved for demo purposes)
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-restoran' },
    update: {},
    create: {
      name: 'Demo Restoran',
      slug: 'demo-restoran',
      description: 'Lezzetli yemekler için doğru adres',
      theme: 'default',
      status: 'approved', // Demo için onaylandı
    },
  });

  // Remove legacy demo credentials
  await prisma.admin.deleteMany({
    where: { email: { in: ["admin@demo.com", "admin@demo"] } },
  });

  // Create demo restaurant admin user
  const demoAdminHashedPassword = await bcrypt.hash(demoAdminPassword, 10);
  await prisma.admin.upsert({
    where: { email: demoAdminEmail },
    update: {
      password: demoAdminHashedPassword,
      restaurantId: restaurant.id,
    },
    create: {
      email: demoAdminEmail,
      password: demoAdminHashedPassword,
      restaurantId: restaurant.id,
    },
  });

  // Delete existing data in correct order (respecting foreign key constraints)
  // First delete OrderItemVariant (if exists)
  await prisma.orderItemVariant.deleteMany({
    where: {
      orderItem: {
        order: {
          restaurantId: restaurant.id
        }
      }
    }
  }).catch(() => {}); // Ignore if table doesn't exist
  
  // Delete OrderItem
  await prisma.orderItem.deleteMany({
    where: {
      order: {
        restaurantId: restaurant.id
      }
    }
  });
  
  // Delete Orders
  await prisma.order.deleteMany({
    where: {
      restaurantId: restaurant.id
    }
  });
  
  // Delete Campaigns
  await prisma.campaign.deleteMany({
    where: {
      restaurantId: restaurant.id
    }
  });
  
  // Delete Customers
  await prisma.customer.deleteMany({
    where: {
      restaurantId: restaurant.id
    }
  });
  
  // Delete ProductVariants
  await prisma.productVariant.deleteMany({
    where: {
      product: {
        category: {
          restaurantId: restaurant.id
        }
      }
    }
  });
  
  // Delete Products
  await prisma.product.deleteMany({ 
    where: { 
      category: {
        restaurantId: restaurant.id
      }
    } 
  });
  
  // Finally delete Categories
  await prisma.category.deleteMany({ 
    where: { 
      restaurantId: restaurant.id 
    } 
  });

  // Create categories
  const pizzaCategory = await prisma.category.create({
    data: {
      name: 'Pizzalar',
      description: 'Taze malzemelerle hazırlanmış pizzalar',
      order: 1,
      restaurantId: restaurant.id,
    },
  });

  const drinkCategory = await prisma.category.create({
    data: {
      name: 'İçecekler',
      description: 'Soğuk ve sıcak içecekler',
      order: 2,
      restaurantId: restaurant.id,
    },
  });

  // Create products
  await prisma.product.create({
    data: {
      name: 'Margherita Pizza',
      description: 'Domates, mozzarella, fesleğen',
      price: 85.00,
      isAvailable: true,
      order: 1,
      categoryId: pizzaCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Pepperoni Pizza',
      description: 'Domates, mozzarella, pepperoni',
      price: 95.00,
      isAvailable: true,
      order: 2,
      categoryId: pizzaCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Kola',
      description: '330ml',
      price: 15.00,
      isAvailable: true,
      order: 1,
      categoryId: drinkCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Türk Kahvesi',
      description: 'Geleneksel Türk kahvesi',
      price: 25.00,
      isAvailable: true,
      order: 2,
      categoryId: drinkCategory.id,
    },
  });

  // Remove legacy platform credentials
  await prisma.platformAdmin.deleteMany({
    where: { email: { in: ["admin@platform.com", "admin@platform"] } },
  });

  // Create platform admin
  const platformAdminHashedPassword = await bcrypt.hash(platformAdminPassword, 10);
  await prisma.platformAdmin.upsert({
    where: { email: platformAdminEmail },
    update: {
      password: platformAdminHashedPassword,
      name: "Platform Yöneticisi",
    },
    create: {
      email: platformAdminEmail,
      password: platformAdminHashedPassword,
      name: "Platform Yöneticisi",
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Platform Admin: ${platformAdminEmail} / (password from env)`);
  console.log(`Demo Admin: ${demoAdminEmail} / (password from env)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
