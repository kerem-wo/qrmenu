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
    (process.env.PLATFORM_ADMIN_EMAIL || "softwareofuture@gmail.com").trim().toLowerCase();
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
      categoryId: mainCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Tavuk Şiş',
      description: 'Tavuk göğsü, sebze',
      price: 300.00,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      isAvailable: true,
      order: 2,
      categoryId: mainCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Tavuk Kanat',
      description: 'Baharatlı tavuk kanat',
      price: 300.00,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      isAvailable: true,
      order: 3,
      categoryId: mainCategory.id,
    },
  });

  // Create products - Pizzalar
  await prisma.product.create({
    data: {
      name: 'Margherita Pizza',
      description: 'Domates, mozzarella, fesleğen',
      price: 85.00,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
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
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
      isAvailable: true,
      order: 2,
      categoryId: pizzaCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Karışık Pizza',
      description: 'Domates, mozzarella, sucuk, mantar, mısır',
      price: 120.00,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
      isAvailable: true,
      order: 3,
      categoryId: pizzaCategory.id,
    },
  });

  // Create products - Salatalar
  await prisma.product.create({
    data: {
      name: 'Mevsim Salatası',
      description: 'Taze yeşillik, domates, salatalık',
      price: 60.00,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      isAvailable: true,
      order: 1,
      categoryId: saladCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Çoban Salatası',
      description: 'Domates, salatalık, soğan, maydanoz',
      price: 70.00,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      isAvailable: true,
      order: 2,
      categoryId: saladCategory.id,
    },
  });

  // Create products - İçecekler
  await prisma.product.create({
    data: {
      name: 'Kola',
      description: '330ml',
      price: 15.00,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
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
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800',
      isAvailable: true,
      order: 2,
      categoryId: drinkCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Ayran',
      description: '500ml',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
      isAvailable: true,
      order: 3,
      categoryId: drinkCategory.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Çay',
      description: 'Türk çayı',
      price: 10.00,
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800',
      isAvailable: true,
      order: 4,
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

  // Create Themes
  const themes = [
    {
      name: "default",
      displayName: "Tema A - Standart",
      description: "Temel ve kullanışlı tasarım",
      monthlyPrice: 99.00,
      yearlyPrice: 990.00,
      yearlyDiscount: 17, // %17 indirim
      features: ["Temel menü görünümü", "QR kod desteği", "Mobil uyumlu"],
    },
    {
      name: "premium",
      displayName: "Tema B - Premium",
      description: "Gelişmiş özellikler ve modern tasarım",
      monthlyPrice: 199.00,
      yearlyPrice: 1990.00,
      yearlyDiscount: 17,
      features: ["Premium tasarım", "Gelişmiş animasyonlar", "Özel renk şemaları", "Sosyal medya entegrasyonu"],
    },
    {
      name: "pro",
      displayName: "Tema C - Pro",
      description: "En gelişmiş özellikler ve profesyonel tasarım",
      monthlyPrice: 299.00,
      yearlyPrice: 2990.00,
      yearlyDiscount: 17,
      features: ["Pro tasarım", "Tüm premium özellikler", "Özel logo desteği", "Öncelikli destek", "Gelişmiş analitik"],
    },
  ];

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { name: theme.name },
      update: theme,
      create: theme,
    });
  }

  // Create Package Pricing
  await prisma.packagePricing.upsert({
    where: { name: "monthly" },
    update: {
      displayName: "Aylık Paket",
      basePrice: 0, // Tema fiyatına göre belirlenir
      discountPercent: 0,
      isActive: true,
    },
    create: {
      name: "monthly",
      displayName: "Aylık Paket",
      basePrice: 0,
      discountPercent: 0,
      isActive: true,
    },
  });

  await prisma.packagePricing.upsert({
    where: { name: "yearly" },
    update: {
      displayName: "Yıllık Paket",
      basePrice: 0, // Tema fiyatına göre belirlenir
      discountPercent: 17, // %17 indirim
      isActive: true,
    },
    create: {
      name: "yearly",
      displayName: "Yıllık Paket",
      basePrice: 0,
      discountPercent: 17,
      isActive: true,
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Platform Admin: ${platformAdminEmail} / (password from env)`);
  console.log(`Demo Admin: ${demoAdminEmail} / (password from env)`);
  console.log('Themes and packages initialized!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
