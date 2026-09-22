import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import sql from 'mssql';
import {
  CategoryData,
  ProductData,
  ProductVariantData,
  BannerData,
  CouponData,
  ReviewData,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from './seedData.js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
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
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
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

interface DatabaseState {
  users: User[];
  categories: CategoryData[];
  products: ProductData[];
  orders: Order[];
  coupons: CouponData[];
  banners: BannerData[];
  reviews: ReviewData[];
  settings: StoreSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const sqlConfig: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123123', // ⚠️ Thay mật khẩu sa của bạn vào đây
  server: process.env.DB_SERVER || 'localhost',
  options: {
    instanceName: 'SQLEXPRESS2025',
    database: 'maison_fashion',
    encrypt: false,
    trustServerCertificate: true,
  },
  port: 1433,
};

export const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log('[Maison Fashion] Kết nối SQL Server (SQLEXPRESS2025) thành công!');
    return pool;
  })
  .catch(err => {
    console.error('Lỗi kết nối SQL Server:', err);
    // throw err;
    return null;
  });

class DatabaseEngine {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // ensure default admin exists and seed if empty
        if (parsed.users && parsed.users.length > 0 && parsed.products && parsed.products.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Notice: Loading fresh database seed due to parse/read notice:', err);
    }

    return this.createSeedState();
  }

  private createSeedState(): DatabaseState {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('Admin@123456', salt);
    const customerPasswordHash = bcrypt.hashSync('Customer@123456', salt);

    const initialUsers: User[] = [
      {
        id: 'usr-admin-1',
        name: 'Trần Văn Quản Trị',
        email: 'admin@example.com',
        passwordHash: adminPasswordHash,
        phone: '0909123456',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-cust-1',
        name: 'Nguyễn Thúy Vy',
        email: 'khachhang@example.com',
        passwordHash: customerPasswordHash,
        phone: '0918765432',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: '2025-01-05T10:00:00Z',
        totalOrders: 3,
        totalSpent: 1847000,
      },
      {
        id: 'usr-cust-2',
        name: 'Lê Minh Tuấn',
        email: 'minhtuan@gmail.com',
        passwordHash: customerPasswordHash,
        phone: '0987654321',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: '2025-01-08T14:30:00Z',
        totalOrders: 2,
        totalSpent: 1240000,
      },
      {
        id: 'usr-cust-3',
        name: 'Phạm Phương Linh',
        email: 'phuonglinh@gmail.com',
        passwordHash: customerPasswordHash,
        phone: '0933221100',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: '2025-01-12T09:15:00Z',
        totalOrders: 1,
        totalSpent: 590000,
      }
    ];

    // Seed realistic sample orders for dashboard stats & charts
    const initialOrders: Order[] = [
      {
        id: 'ord-1001',
        orderCode: 'ORD-250101',
        userId: 'usr-cust-1',
        customerName: 'Nguyễn Thúy Vy',
        customerEmail: 'khachhang@example.com',
        customerPhone: '0918765432',
        shippingAddress: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ',
        province: 'Hồ Chí Minh',
        district: 'Quận Bình Thạnh',
        ward: 'Phường 22',
        note: 'Giao trong giờ hành chính giúp mình',
        subtotal: 728000,
        shippingFee: 30000,
        discountAmount: 50000,
        totalAmount: 708000,
        couponCode: 'WELCOME50',
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        items: [
          {
            id: 'item-1',
            orderId: 'ord-1001',
            productId: 'prod-1',
            productName: 'Áo Thun Basic Heavyweight Cotton',
            size: 'M',
            color: 'Trắng',
            price: 249000,
            quantity: 2,
            total: 498000,
            imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80',
          },
          {
            id: 'item-2',
            orderId: 'ord-1001',
            productId: 'prod-13',
            productName: 'Áo Polo Pique Cotton Dệt Tổ Ong',
            size: 'M',
            color: 'Trắng',
            price: 320000,
            quantity: 1,
            total: 320000,
            imageUrl: 'https://images.unsplash.com/photo-1625910513413-568393527a20?w=400&auto=format&fit=crop&q=80',
          }
        ],
        createdAt: '2025-01-18T10:30:00Z',
        updatedAt: '2025-01-20T15:00:00Z',
      },
      {
        id: 'ord-1002',
        orderCode: 'ORD-250102',
        userId: 'usr-cust-2',
        customerName: 'Lê Minh Tuấn',
        customerEmail: 'minhtuan@gmail.com',
        customerPhone: '0987654321',
        shippingAddress: 'Số 45 Tràng Tiền',
        province: 'Hà Nội',
        district: 'Quận Hoàn Kiếm',
        ward: 'Phường Tràng Tiền',
        note: 'Gọi trước khi giao',
        subtotal: 1388000,
        shippingFee: 0,
        discountAmount: 138800,
        totalAmount: 1249200,
        couponCode: 'MAISON10',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        items: [
          {
            id: 'item-3',
            orderId: 'ord-1002',
            productId: 'prod-7',
            productName: 'Áo Blazer Relaxed-Fit Unisex',
            size: 'L',
            color: 'Đen Than',
            price: 849000,
            quantity: 1,
            total: 849000,
            imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80',
          },
          {
            id: 'item-4',
            orderId: 'ord-1002',
            productId: 'prod-4',
            productName: 'Quần Jeans Denim Vintage Straight Leg',
            size: '31',
            color: 'Xanh Chàm',
            price: 539000,
            quantity: 1,
            total: 539000,
            imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&auto=format&fit=crop&q=80',
          }
        ],
        createdAt: '2025-01-21T09:15:00Z',
        updatedAt: '2025-01-21T11:00:00Z',
      },
      {
        id: 'ord-1003',
        orderCode: 'ORD-250103',
        userId: 'usr-cust-3',
        customerName: 'Phạm Phương Linh',
        customerEmail: 'phuonglinh@gmail.com',
        customerPhone: '0933221100',
        shippingAddress: '124 Nguyễn Văn Linh',
        province: 'Đà Nẵng',
        district: 'Quận Hải Châu',
        ward: 'Phường Nam Dương',
        note: '',
        subtotal: 590000,
        shippingFee: 30000,
        discountAmount: 0,
        totalAmount: 620000,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: [
          {
            id: 'item-5',
            orderId: 'ord-1003',
            productId: 'prod-5',
            productName: 'Đầm Midi Linen Thắt Eo Thanh Lịch',
            size: 'M',
            color: 'Trắng Ngà',
            price: 590000,
            quantity: 1,
            total: 590000,
            imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop&q=80',
          }
        ],
        createdAt: '2025-01-22T14:40:00Z',
        updatedAt: '2025-01-22T14:40:00Z',
      }
    ];

    const initialSettings: StoreSettings = {
      storeName: 'Maison Fashion Studio',
      phone: '1900 6868',
      email: 'contact@maisonfashion.vn',
      address: '158 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      openingHours: '08:30 - 22:00 (Tất cả các ngày trong tuần)',
      shippingFeeStandard: 30000,
      freeShippingThreshold: 500000,
      bankName: 'Vietcombank - Chi nhánh TP.HCM',
      bankAccountNumber: '0071001234567',
      bankAccountName: 'CONG TY TNHH MAISON FASHION VIET NAM',
    };

    const newState: DatabaseState = {
      users: initialUsers,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: initialOrders,
      coupons: INITIAL_COUPONS,
      banners: INITIAL_BANNERS,
      reviews: INITIAL_REVIEWS,
      settings: initialSettings,
    };

    this.saveState(newState);
    return newState;
  }

  private saveState(stateToSave?: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = stateToSave || this.state;
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- USERS ---
  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.saveState();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.state.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.state.users[index] = {
      ...this.state.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.users[index];
  }

  public listCustomers(): User[] {
    return this.state.users
      .filter(u => u.role === 'CUSTOMER')
      .map(({ passwordHash, ...safeUser }) => {
        // compute real order totals
        const userOrders = this.state.orders.filter(o => o.userId === safeUser.id);
        const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        return {
          ...safeUser,
          passwordHash: '',
          totalOrders: userOrders.length,
          totalSpent,
        } as User;
      });
  }

  public toggleCustomerStatus(id: string): User | null {
    const user = this.findUserById(id);
    if (!user || user.role === 'ADMIN') return null;
    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    user.updatedAt = new Date().toISOString();
    this.saveState();
    return user;
  }

  // --- PRODUCTS ---
  public listProducts(options?: {
    categorySlug?: string;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    size?: string;
    color?: string;
    sort?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    let list = [...this.state.products];

    // Filter by status (default to ACTIVE for public unless status specified)
    if (options?.status) {
      if (options.status !== 'ALL') {
        list = list.filter(p => p.status === options.status);
      }
    } else {
      list = list.filter(p => p.status === 'ACTIVE');
    }

    // Category filter
    if (options?.categoryId) {
      list = list.filter(p => p.categoryId === options.categoryId);
    } else if (options?.categorySlug) {
      const cat = this.state.categories.find(c => c.slug === options.categorySlug);
      if (cat) {
        list = list.filter(p => p.categoryId === cat.id);
      }
    }

    // Search
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Price
    if (options?.minPrice !== undefined) {
      list = list.filter(p => (p.salePrice || p.price) >= options.minPrice!);
    }
    if (options?.maxPrice !== undefined) {
      list = list.filter(p => (p.salePrice || p.price) <= options.maxPrice!);
    }

    // Brand
    if (options?.brand) {
      list = list.filter(p => p.brand.toLowerCase() === options.brand!.toLowerCase());
    }

    // Size
    if (options?.size) {
      list = list.filter(p => p.variants.some(v => v.size.toLowerCase() === options.size!.toLowerCase()));
    }

    // Color
    if (options?.color) {
      list = list.filter(p => p.variants.some(v => v.color.toLowerCase() === options.color!.toLowerCase()));
    }

    // Sort
    if (options?.sort) {
      switch (options.sort) {
        case 'price-asc':
          list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
          break;
        case 'price-desc':
          list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
          break;
        case 'bestseller':
          list.sort((a, b) => b.soldCount - a.soldCount);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'newest':
        default:
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Attach category name
    const enriched = list.map(p => {
      const cat = this.state.categories.find(c => c.id === p.categoryId);
      return {
        ...p,
        categoryName: cat?.name || 'Khác',
      };
    });

    const total = enriched.length;
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = enriched.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public findProductById(id: string): ProductData | undefined {
    const prod = this.state.products.find(p => p.id === id);
    if (!prod) return undefined;
    const cat = this.state.categories.find(c => c.id === prod.categoryId);
    return {
      ...prod,
      categoryName: cat?.name || '',
    };
  }

  public findProductBySlug(slug: string): ProductData | undefined {
    const prod = this.state.products.find(p => p.slug === slug);
    if (!prod) return undefined;
    const cat = this.state.categories.find(c => c.id === prod.categoryId);
    return {
      ...prod,
      categoryName: cat?.name || '',
    };
  }

  public createProduct(productData: Omit<ProductData, 'id' | 'createdAt' | 'soldCount' | 'rating' | 'reviewCount'>): ProductData {
    const id = `prod-${Date.now()}`;
    const newProduct: ProductData = {
      ...productData,
      id,
      soldCount: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.products.unshift(newProduct);
    this.saveState();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<ProductData>): ProductData | null {
    const index = this.state.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.state.products[index] = {
      ...this.state.products[index],
      ...updates,
    };
    this.saveState();
    return this.state.products[index];
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.state.products.length;
    this.state.products = this.state.products.filter(p => p.id !== id);
    if (this.state.products.length !== prevLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  public listCategories(): CategoryData[] {
    return this.state.categories.map(c => {
      const count = this.state.products.filter(p => p.categoryId === c.id && p.status === 'ACTIVE').length;
      return {
        ...c,
        itemCount: count,
      };
    });
  }

  public findCategoryById(id: string): CategoryData | undefined {
    return this.state.categories.find(c => c.id === id);
  }

  public createCategory(cat: Omit<CategoryData, 'id'>): CategoryData {
    const id = `cat-${Date.now()}`;
    const newCat: CategoryData = { ...cat, id };
    this.state.categories.push(newCat);
    this.saveState();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<CategoryData>): CategoryData | null {
    const index = this.state.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.state.categories[index] = { ...this.state.categories[index], ...updates };
    this.saveState();
    return this.state.categories[index];
  }

  public deleteCategory(id: string): boolean {
    const hasProducts = this.state.products.some(p => p.categoryId === id);
    if (hasProducts) {
      throw new Error('Không thể xóa danh mục đang có sản phẩm thuộc về');
    }
    this.state.categories = this.state.categories.filter(c => c.id !== id);
    this.saveState();
    return true;
  }

  // --- ORDERS ---
  public listOrders(filter?: { status?: string; search?: string; userId?: string }): Order[] {
    let list = [...this.state.orders];
    if (filter?.userId) {
      list = list.filter(o => o.userId === filter.userId);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(o => o.orderStatus === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(o =>
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findOrderById(id: string): Order | undefined {
    return this.state.orders.find(o => o.id === id || o.orderCode === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderCode' | 'createdAt' | 'updatedAt'>): Order {
    const codeNum = Math.floor(100000 + Math.random() * 900000);
    const orderCode = `MS-${codeNum}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock from product variants & increment soldCount
    for (const item of newOrder.items) {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.soldCount += item.quantity;
        if (item.variantId) {
          const variant = prod.variants.find(v => v.id === item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        }
      }
    }

    // Increment coupon used count if used
    if (newOrder.couponCode) {
      const coupon = this.state.coupons.find(c => c.code.toUpperCase() === newOrder.couponCode?.toUpperCase());
      if (coupon) {
        coupon.usedCount += 1;
      }
    }

    this.state.orders.unshift(newOrder);
    this.saveState();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): Order | null {
    const order = this.state.orders.find(o => o.id === id);
    if (!order) return null;
    order.orderStatus = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }
    order.updatedAt = new Date().toISOString();
    this.saveState();
    return order;
  }

  // --- COUPONS ---
  public listCoupons(): CouponData[] {
    return this.state.coupons;
  }

  public findCouponByCode(code: string): CouponData | undefined {
    return this.state.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.status === 'ACTIVE');
  }

  public createCoupon(data: Omit<CouponData, 'id' | 'usedCount'>): CouponData {
    const newCoupon: CouponData = {
      ...data,
      id: `coup-${Date.now()}`,
      usedCount: 0,
    };
    this.state.coupons.push(newCoupon);
    this.saveState();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<CouponData>): CouponData | null {
    const index = this.state.coupons.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.state.coupons[index] = { ...this.state.coupons[index], ...updates };
    this.saveState();
    return this.state.coupons[index];
  }

  public deleteCoupon(id: string): boolean {
    this.state.coupons = this.state.coupons.filter(c => c.id !== id);
    this.saveState();
    return true;
  }

  // --- BANNERS ---
  public listBanners(onlyActive = false): BannerData[] {
    let list = [...this.state.banners];
    if (onlyActive) {
      list = list.filter(b => b.active);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  public createBanner(banner: Omit<BannerData, 'id'>): BannerData {
    const newBanner: BannerData = {
      ...banner,
      id: `ban-${Date.now()}`,
    };
    this.state.banners.push(newBanner);
    this.saveState();
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<BannerData>): BannerData | null {
    const index = this.state.banners.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.state.banners[index] = { ...this.state.banners[index], ...updates };
    this.saveState();
    return this.state.banners[index];
  }

  public deleteBanner(id: string): boolean {
    this.state.banners = this.state.banners.filter(b => b.id !== id);
    this.saveState();
    return true;
  }

  // --- REVIEWS ---
  public listReviews(productId?: string): ReviewData[] {
    if (productId) {
      return this.state.reviews.filter(r => r.productId === productId && r.status === 'APPROVED');
    }
    return this.state.reviews;
  }

  public createReview(review: Omit<ReviewData, 'id' | 'createdAt' | 'status'>): ReviewData {
    const newRev: ReviewData = {
      ...review,
      id: `rev-${Date.now()}`,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    };
    this.state.reviews.unshift(newRev);

    // Update product rating & reviewCount
    const prod = this.state.products.find(p => p.id === review.productId);
    if (prod) {
      const prodRevs = this.state.reviews.filter(r => r.productId === prod.id && r.status === 'APPROVED');
      const avg = prodRevs.reduce((sum, r) => sum + r.rating, 0) / prodRevs.length;
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodRevs.length;
    }

    this.saveState();
    return newRev;
  }

  public toggleReviewStatus(id: string): ReviewData | null {
    const rev = this.state.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.status = rev.status === 'APPROVED' ? 'HIDDEN' : 'APPROVED';
    this.saveState();
    return rev;
  }

  public deleteReview(id: string): boolean {
    this.state.reviews = this.state.reviews.filter(r => r.id !== id);
    this.saveState();
    return true;
  }

  // --- INVENTORY MANAGEMENT ---
  public getInventory() {
    const items: Array<{
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
    }> = [];

    for (const prod of this.state.products) {
      const cat = this.state.categories.find(c => c.id === prod.categoryId);
      for (const variant of prod.variants) {
        items.push({
          productId: prod.id,
          productName: prod.name,
          productImage: prod.images[0] || '',
          categoryName: cat?.name || 'Khác',
          variantId: variant.id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          price: variant.price || prod.salePrice || prod.price,
          isLowStock: variant.stock < 10,
        });
      }
    }

    return items;
  }

  public updateVariantStock(productId: string, variantId: string, newStock: number): boolean {
    const prod = this.state.products.find(p => p.id === productId);
    if (!prod) return false;
    const variant = prod.variants.find(v => v.id === variantId);
    if (!variant) return false;
    variant.stock = Math.max(0, newStock);
    this.saveState();
    return true;
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    return this.state.settings;
  }

  public updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    this.state.settings = { ...this.state.settings, ...settings };
    this.saveState();
    return this.state.settings;
  }

  // --- DASHBOARD ANALYTICS ---
  public getDashboardStats() {
    const totalOrders = this.state.orders.length;
    const completedOrders = this.state.orders.filter(o => o.orderStatus === 'DELIVERED').length;
    const pendingOrders = this.state.orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING').length;
    const totalRevenue = this.state.orders
      .filter(o => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalProducts = this.state.products.length;
    const totalCustomers = this.state.users.filter(u => u.role === 'CUSTOMER').length;

    // Count variants with stock < 10
    let lowStockCount = 0;
    for (const p of this.state.products) {
      for (const v of p.variants) {
        if (v.stock < 10) {
          lowStockCount++;
        }
      }
    }

    // Revenue by day (last 7 days)
    const days: { date: string; label: string; revenue: number; orders: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = this.state.orders.filter(o => o.createdAt.startsWith(dateStr) && o.orderStatus !== 'CANCELLED');
      const dayRev = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      days.push({
        date: dateStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        revenue: dayRev,
        orders: dayOrders.length,
      });
    }

    // Revenue by month (last 6 months)
    const months: { month: string; label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthOrders = this.state.orders.filter(o => o.createdAt.startsWith(yearMonth) && o.orderStatus !== 'CANCELLED');
      const monthRev = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      months.push({
        month: yearMonth,
        label: `Th${d.getMonth() + 1}`,
        revenue: monthRev,
      });
    }

    // Top selling products
    const topProducts = [...this.state.products]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        image: p.images[0] || '',
        price: p.salePrice || p.price,
        soldCount: p.soldCount,
        revenue: p.soldCount * (p.salePrice || p.price),
      }));

    // Recent 5 orders
    const recentOrders = [...this.state.orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      overview: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        completedOrders,
        lowStockCount,
      },
      revenueByDay: days,
      revenueByMonth: months,
      topProducts,
      recentOrders,
    };
  }
}

export const db = new DatabaseEngine();
