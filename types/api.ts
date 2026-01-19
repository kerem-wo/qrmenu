// API Request/Response Types

// Admin API Types
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  admin: {
    id: string;
    email: string;
    restaurantId: string;
  };
}

export interface CreateCampaignRequest {
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount?: number | null;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  usageLimit?: number | null;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  image?: string | null;
  order?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  isAvailable?: boolean;
  stock?: number | null;
  order?: number;
  categoryId: string;
}

export interface CreateProductVariantRequest {
  name: string;
  price: number;
}

export interface UpdateRestaurantRequest {
  name?: string;
  description?: string | null;
  logo?: string | null;
  theme?: string;
  language?: string;
}

export interface UpdateOrderRequest {
  status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: "cash" | "card" | "online";
}

// Customer API Types
export interface CustomerRegisterRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  password?: string | null;
}

export interface CustomerLoginRequest {
  email?: string | null;
  phone?: string | null;
  password?: string | null;
}

// Order API Types
export interface CreateOrderRequest {
  restaurantId: string;
  tableNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerId?: string | null;
  items: OrderItemRequest[];
  couponCode?: string | null;
  paymentStatus?: "pending" | "paid";
  paymentMethod?: "cash" | "card" | "online";
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  price: number;
  variants?: string[];
  notes?: string | null;
}

export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  total: number;
}

// Campaign Validation Types
export interface ValidateCampaignRequest {
  code: string;
  amount: number;
}

export interface ValidateCampaignResponse {
  valid: boolean;
  discount: number;
  campaign: {
    name: string;
    type: string;
    value: number;
  };
}

// Upload API Types
export interface UploadResponse {
  url: string;
  publicId?: string;
  message?: string;
}

// Analytics Types
export interface AnalyticsResponse {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersByStatus: Array<{
    status: string;
    _count: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
}

// Standard API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error Response
export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}
