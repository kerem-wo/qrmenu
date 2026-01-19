// Database Types (extended from Prisma)

import { 
  Restaurant, 
  Category, 
  Product, 
  ProductVariant, 
  Order, 
  OrderItem, 
  OrderItemVariant,
  Campaign,
  Admin,
  Customer
} from "@prisma/client";

export type RestaurantWithRelations = Restaurant & {
  categories?: Category[];
  orders?: Order[];
  campaigns?: Campaign[];
  admin?: Admin | null;
};

export type CategoryWithProducts = Category & {
  products?: Product[];
};

export type ProductWithVariants = Product & {
  category?: Category;
  variants?: ProductVariant[];
};

export type OrderWithItems = Order & {
  items?: OrderItemWithVariants[];
  customer?: Customer | null;
  restaurant?: Restaurant;
};

export type OrderItemWithVariants = OrderItem & {
  product?: Product;
  variants?: OrderItemVariant[];
};

export type CampaignWithRestaurant = Campaign & {
  restaurant?: Restaurant;
};

export type CustomerWithOrders = Customer & {
  orders?: Order[];
};

// Enums
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cash" | "card" | "online";
export type CampaignType = "percentage" | "fixed";
