import { z } from "zod";

// Admin Validation Schemas
export const adminLoginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1, "Kampanya adı gereklidir").max(100),
  code: z.string().min(1, "Kupon kodu gereklidir").max(50).regex(/^[A-Z0-9]+$/, "Kupon kodu sadece büyük harf ve rakam içerebilir"),
  type: z.enum(["percentage", "fixed"], {
    errorMap: () => ({ message: "Tip 'percentage' veya 'fixed' olmalıdır" }),
  }),
  value: z.number().positive("İndirim değeri pozitif olmalıdır"),
  minAmount: z.number().positive().nullable().optional(),
  maxDiscount: z.number().positive().nullable().optional(),
  startDate: z.string().datetime("Geçerli bir tarih giriniz"),
  endDate: z.string().datetime("Geçerli bir tarih giriniz"),
  isActive: z.boolean().optional().default(true),
  usageLimit: z.number().int().positive().nullable().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "Bitiş tarihi başlangıç tarihinden önce olamaz",
  path: ["endDate"],
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir").max(100),
  description: z.string().max(500).nullable().optional(),
  image: z.string().url("Geçerli bir URL giriniz").nullable().optional().or(z.literal("")),
  order: z.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(1, "Ürün adı gereklidir").max(100),
  description: z.string().max(1000).nullable().optional(),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  image: z.string().url("Geçerli bir URL giriniz").nullable().optional().or(z.literal("")),
  isAvailable: z.boolean().optional().default(true),
  stock: z.number().int().min(0).nullable().optional(),
  order: z.number().int().min(0).optional().default(0),
  categoryId: z.string().min(1, "Kategori seçilmelidir"),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductVariantSchema = z.object({
  name: z.string().min(1, "Varyant adı gereklidir").max(50),
  price: z.number().min(0, "Fiyat negatif olamaz"),
});

export const updateProductVariantSchema = createProductVariantSchema.partial();

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  logo: z.string().url().nullable().optional().or(z.literal("")),
  theme: z.string().max(50).optional(),
  language: z.string().length(2).optional(),
});

// Customer Validation Schemas
export const customerRegisterSchema = z.object({
  name: z.string().min(1, "İsim gereklidir").max(100),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").nullable().optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, "Geçerli bir telefon numarası giriniz").nullable().optional().or(z.literal("")),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").nullable().optional().or(z.literal("")),
}).refine((data) => data.email || data.phone, {
  message: "E-posta veya telefon numarası gereklidir",
});

export const customerLoginSchema = z.object({
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional().or(z.literal("")),
  password: z.string().nullable().optional().or(z.literal("")),
}).refine((data) => (data.email || data.phone) && data.password, {
  message: "E-posta/telefon ve şifre gereklidir",
});

// Order Validation Schemas
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Ürün ID gereklidir"),
  quantity: z.number().int().positive("Miktar pozitif olmalıdır"),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  variants: z.array(z.string()).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1, "Restoran ID gereklidir"),
  tableNumber: z.string().max(20).nullable().optional(),
  customerName: z.string().max(100).nullable().optional(),
  customerPhone: z.string().max(20).nullable().optional(),
  customerId: z.string().nullable().optional(),
  items: z.array(orderItemSchema).min(1, "En az bir ürün seçilmelidir"),
  couponCode: z.string().max(50).nullable().optional(),
  paymentStatus: z.enum(["pending", "paid"]).optional().default("pending"),
  paymentMethod: z.enum(["cash", "card", "online"]).nullable().optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  paymentMethod: z.enum(["cash", "card", "online"]).nullable().optional(),
});

// Campaign Validation Schema
export const validateCampaignSchema = z.object({
  code: z.string().min(1, "Kupon kodu gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
});

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: "Dosya gereklidir" }),
}).refine((data) => data.file.type.startsWith("image/"), {
  message: "Sadece resim dosyaları yüklenebilir",
  path: ["file"],
}).refine((data) => data.file.size <= 10 * 1024 * 1024, {
  message: "Dosya boyutu 10MB'dan küçük olmalıdır",
  path: ["file"],
});

// Analytics Schema
export const analyticsQuerySchema = z.object({
  period: z.string().regex(/^\d+$/).optional().default("7"),
});
