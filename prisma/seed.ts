import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a demo restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-restoran' },
    update: {},
    create: {
      name: 'Demo Restoran',
      slug: 'demo-restoran',
      description: 'Lezzetli yemekler için doğru adres',
      theme: 'default',
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      restaurantId: restaurant.id,
    },
  });

  // Delete existing categories and products first
  await prisma.product.deleteMany({ 
    where: { 
      category: {
        restaurantId: restaurant.id
      }
    } 
  });
  await prisma.category.deleteMany({ where: { restaurantId: restaurant.id } });

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

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
