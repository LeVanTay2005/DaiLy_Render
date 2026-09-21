export type UserRole = 'CUSTOMER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
