export type UserRole = 'CUSTOMER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: UserRole;
  status?: UserStatus;
  createdAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  size: string;
  color: string;
  colorCode: string;
  stock: number;
  price?: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  brand: string;
  price: number;
  salePrice?: number;
  costPrice?: number;       // ← Giá vốn nhập xưởng (Phase 1.1)
  description: string;
  details?: string[];
  images: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isFlashSale?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CartItem {
  id: string; // unique cart entry key
  productId: string;
  variantId?: string;
  productName: string;
  name?: string; // alias for productName
  slug: string;
  size: string;
  color: string;
  colorCode?: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  maxStock: number;
  sku?: string;
}

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  total: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  province: string;
  district: string;
  ward: string;
  note?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  link: string;
  image: string;
  buttonText: string;
  position: 'HERO' | 'PROMO' | 'MIDDLE';
  order: number;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'APPROVED' | 'HIDDEN';
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  shippingFeeStandard: number;
  freeShippingThreshold: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface AdminDashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockCount: number;
  // Phase 1.1 — Profit metrics
  totalCostPrice: number;       // Tổng giá vốn tất cả đơn đã giao
  grossProfit: number;          // Lợi nhuận gộp = Doanh thu - Giá vốn
  profitMarginPct: number;      // Tỷ suất lợi nhuận (%) = grossProfit / totalRevenue * 100
}

export interface RevenueDayPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface RevenueMonthPoint {
  month: string;
  label: string;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  soldCount: number;
  revenue: number;
}

export interface AdminDashboardStats {
  overview: AdminDashboardOverview;
  revenueByDay: RevenueDayPoint[];
  revenueByMonth: RevenueMonthPoint[];
  topProducts: TopProduct[];
  recentOrders: Order[];
}

export interface InventoryItem {
  productId: string;
  productName: string;
  productImage: string;
  categoryName: string;
  variantId: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  isLowStock: boolean;
}

// Phase 1.2 — Inventory Log (Stock Card / Thẻ kho)
export type InventoryLogReason =
  | 'ORDER_PLACED'       // Khách đặt hàng → trừ kho
  | 'ORDER_CANCELLED'    // Huỷ đơn → hoàn kho
  | 'MANUAL_ADJUST'      // Admin điều chỉnh tay
  | 'IMPORT_STOCK'       // Nhập hàng từ xưởng
  | 'RETURN_GOODS'       // Đổi/trả hàng
  | 'STOCKTAKE_FIX';     // Kiểm kê cân bằng kho

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  sku: string;
  reason: InventoryLogReason;
  reasonLabel: string;
  quantityBefore: number;
  quantityChange: number;   // Dương = nhập thêm, Âm = xuất ra
  quantityAfter: number;
  orderId?: string;
  orderCode?: string;
  note?: string;
  performedBy: string;      // Tên hoặc ID người thực hiện
  createdAt: string;
}

// Phase 1.3 — Stored File (Upload ảnh + SHA-256)
export interface StoredFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;             // URL truy cập công khai
  fileHash: string;        // SHA-256 để chống trùng lặp
  isDuplicate?: boolean;   // true = file đã tồn tại, tái sử dụng
  uploadedBy?: string;
  createdAt: string;
}
