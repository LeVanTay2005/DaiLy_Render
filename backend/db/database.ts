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
  address?: string;
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
  inventoryLogs: InventoryLogEntry[];  // Phase 1.2
  storedFiles: StoredFileEntry[];      // Phase 1.3
}

// In-memory structures for Phase 1
interface InventoryLogEntry {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  sku: string;
  reason: string;
  reasonLabel: string;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  orderId?: string;
  orderCode?: string;
  note?: string;
  performedBy: string;
  createdAt: string;
}

interface StoredFileEntry {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  fileHash: string;
  uploadedBy?: string;
  createdAt: string;
}

import dotenv from 'dotenv';
dotenv.config();

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const sqlConfig: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123123',
  server: process.env.DB_SERVER || 'localhost',
  options: {
    instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS2025',
    database: process.env.DB_NAME || 'maison_fashion',
    encrypt: false,
    trustServerCertificate: true,
  },
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433,
};

export const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log('[Maison Fashion] Kết nối SQL Server (SQLEXPRESS2025) thành công!');
    db.syncFromSqlServer().catch(err => {
      console.warn('[Maison Fashion] Đồng bộ ban đầu từ SQL Server gặp thông báo:', err?.message || err);
    });
    return pool;
  })
  .catch(err => {
    console.warn('[Maison Fashion] Không kết nối được SQL Server (sử dụng chế độ lưu trữ JSON dự phòng):', err.message);
    return null;
  });

export async function querySql<T = any>(queryText: string): Promise<T[]> {
  const pool = await poolPromise;
  if (!pool) {
    throw new Error('Chưa kết nối được tới SQL Server');
  }
  const result = await pool.request().query(queryText);
  return result.recordset as T[];
}

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
        if (parsed.users && parsed.users.length > 0 && parsed.products && parsed.products.length > 0) {
          let needsSave = false;
          // Phase 1.1: Auto-migrate costPrice for products if missing
          for (const p of parsed.products) {
            if (p.costPrice === undefined || p.costPrice === null) {
              const seedProd = INITIAL_PRODUCTS.find(sp => sp.id === p.id);
              p.costPrice = seedProd?.costPrice || Math.round((p.salePrice || p.price) * 0.60);
              needsSave = true;
            }
          }
          // Phase 1.2: Ensure initial inventory logs exist
          if (!parsed.inventoryLogs || parsed.inventoryLogs.length === 0) {
            parsed.inventoryLogs = this.getDefaultInventoryLogs();
            needsSave = true;
          }
          // Phase 1.3: Ensure storedFiles exists
          if (!parsed.storedFiles) {
            parsed.storedFiles = [];
            needsSave = true;
          }
          if (needsSave) {
            this.saveState(parsed as DatabaseState);
          }
          return parsed as DatabaseState;
        }
      }
    } catch (err) {
      console.warn('Notice: Loading fresh database seed due to parse/read notice:', err);
    }

    return this.createSeedState();
  }

  private getDefaultInventoryLogs(): InventoryLogEntry[] {
    return [
      {
        id: 'log-seed-1',
        productId: 'prod-1',
        productName: 'Giường Tiêm Thẩm Mỹ Chỉnh Điện 3 Động Cơ Cao Cấp Hi-Tech S3',
        variantId: 'v-101',
        sku: 'MS-S3-WHT',
        reason: 'IMPORT_STOCK',
        reasonLabel: 'Nhập hàng từ xưởng sản xuất',
        quantityBefore: 0,
        quantityChange: 15,
        quantityAfter: 15,
        note: 'Nhập lô hàng đầu tháng từ xưởng Bình Dương',
        performedBy: 'Trần Văn Quản Trị (Admin)',
        createdAt: '2025-01-15T08:30:00Z',
      },
      {
        id: 'log-seed-2',
        productId: 'prod-1',
        productName: 'Giường Tiêm Thẩm Mỹ Chỉnh Điện 3 Động Cơ Cao Cấp Hi-Tech S3',
        variantId: 'v-101',
        sku: 'MS-S3-WHT',
        reason: 'ORDER_PLACED',
        reasonLabel: 'Khách đặt đơn hàng',
        quantityBefore: 15,
        quantityChange: -1,
        quantityAfter: 14,
        orderId: 'ord-1001',
        orderCode: 'ORD-250101',
        note: 'Đơn hàng ORD-250101 khách Nguyễn Thúy Vy',
        performedBy: 'Hệ thống tự động',
        createdAt: '2025-01-18T10:30:00Z',
      },
      {
        id: 'log-seed-3',
        productId: 'prod-3',
        productName: 'Giường Gội Đầu Dưỡng Sinh Tai Thỏ Bồn Sứ Vòm Tuần Hoàn Nước',
        variantId: 'v-301',
        sku: 'MS-GDS-CFE',
        reason: 'IMPORT_STOCK',
        reasonLabel: 'Nhập hàng từ xưởng sản xuất',
        quantityBefore: 0,
        quantityChange: 20,
        quantityAfter: 20,
        note: 'Lô bồn sứ Đài Loan nhập khẩu',
        performedBy: 'Trần Văn Quản Trị (Admin)',
        createdAt: '2025-01-16T09:00:00Z',
      },
      {
        id: 'log-seed-4',
        productId: 'prod-3',
        productName: 'Giường Gội Đầu Dưỡng Sinh Tai Thỏ Bồn Sứ Vòm Tuần Hoàn Nước',
        variantId: 'v-301',
        sku: 'MS-GDS-CFE',
        reason: 'ORDER_PLACED',
        reasonLabel: 'Khách đặt đơn hàng',
        quantityBefore: 20,
        quantityChange: -2,
        quantityAfter: 18,
        orderId: 'ord-1002',
        orderCode: 'ORD-250102',
        note: 'Đơn hàng ORD-250102 khách Lê Minh Tuấn',
        performedBy: 'Hệ thống tự động',
        createdAt: '2025-01-21T09:15:00Z',
      },
    ];
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
        address: '158 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
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
        address: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: '2025-01-05T10:00:00Z',
        totalOrders: 3,
        totalSpent: 1847000,
      },
      {
        id: 'usr-cust-demo',
        name: 'Khách Hàng Demo',
        email: 'customer@example.com',
        passwordHash: customerPasswordHash,
        phone: '0901234567',
        address: 'Quận 1, TP. Hồ Chí Minh',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: '2025-01-01T10:00:00Z',
        totalOrders: 1,
        totalSpent: 499000,
      },
      {
        id: 'usr-cust-2',
        name: 'Lê Minh Tuấn',
        email: 'minhtuan@gmail.com',
        passwordHash: customerPasswordHash,
        phone: '0987654321',
        address: 'Số 45 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
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
        address: '124 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: '2025-01-12T09:15:00Z',
        totalOrders: 1,
        totalSpent: 590000,
      }
    ];

    // Seed realistic sample orders for spa beds dashboard stats & charts
    const initialOrders: Order[] = [
      {
        id: 'ord-1001',
        orderCode: 'ORD-250101',
        userId: 'usr-cust-1',
        customerName: 'Nguyễn Thúy Vy (Aesthetic Clinic)',
        customerEmail: 'khachhang@example.com',
        customerPhone: '0918765432',
        shippingAddress: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22',
        province: 'Hồ Chí Minh',
        district: 'Quận Bình Thạnh',
        ward: 'Phường 22',
        note: 'Giao tầng 12, có thang máy chuyển hàng, lắp đặt hoàn thiện giúp mình',
        subtotal: 13900000,
        shippingFee: 0,
        discountAmount: 500000,
        totalAmount: 13400000,
        couponCode: 'SETUP500',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        items: [
          {
            id: 'item-1',
            orderId: 'ord-1001',
            productId: 'prod-1',
            productName: 'Giường Tiêm Thẩm Mỹ Chỉnh Điện 3 Động Cơ Cao Cấp Hi-Tech S3',
            size: '190x65cm',
            color: 'Trắng Sữa',
            price: 13900000,
            quantity: 1,
            total: 13900000,
            imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&auto=format&fit=crop&q=80',
          }
        ],
        createdAt: '2025-01-18T10:30:00Z',
        updatedAt: '2025-01-20T15:00:00Z',
      },
      {
        id: 'ord-1002',
        orderCode: 'ORD-250102',
        userId: 'usr-cust-2',
        customerName: 'Lê Minh Tuấn (Spa Dưỡng Sinh)',
        customerEmail: 'minhtuan@gmail.com',
        customerPhone: '0987654321',
        shippingAddress: 'Số 45 Tràng Tiền, Phường Tràng Tiền',
        province: 'Hà Nội',
        district: 'Quận Hoàn Kiếm',
        ward: 'Phường Tràng Tiền',
        note: 'Gọi trước 30 phút để chuẩn bị phòng lắp ráp',
        subtotal: 9900000,
        shippingFee: 0,
        discountAmount: 990000,
        totalAmount: 8910000,
        couponCode: 'SPA10',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        items: [
          {
            id: 'item-2',
            orderId: 'ord-1002',
            productId: 'prod-3',
            productName: 'Giường Gội Đầu Dưỡng Sinh Tai Thỏ Bồn Sứ Vòm Tuần Hoàn Nước',
            size: '200x68cm',
            color: 'Nâu Cà Phê',
            price: 4950000,
            quantity: 2,
            total: 9900000,
            imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop&q=80',
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
        shippingAddress: '124 Nguyễn Văn Linh, Phường Nam Dương',
        province: 'Đà Nẵng',
        district: 'Quận Hải Châu',
        ward: 'Phường Nam Dương',
        note: 'Giao giờ hành chính',
        subtotal: 3690000,
        shippingFee: 0,
        discountAmount: 0,
        totalAmount: 3690000,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: [
          {
            id: 'item-3',
            orderId: 'ord-1003',
            productId: 'prod-5',
            productName: 'Giường Massage Body Khung Gỗ Sồi Tự Nhiên Cao Cấp Oak-Royal',
            size: '190x80cm',
            color: 'Trắng Kem',
            price: 3690000,
            quantity: 1,
            total: 3690000,
            imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&auto=format&fit=crop&q=80',
          }
        ],
        createdAt: '2025-01-22T14:40:00Z',
        updatedAt: '2025-01-22T14:40:00Z',
      }
    ];

    const initialSettings: StoreSettings = {
      storeName: 'DaiLy Giường Spa - Hệ Thống Giường Spa & Thiết Bị Thẩm Mỹ',
      phone: '1900 6868',
      email: 'contact@dailygiuongspa.vn',
      address: '158 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      openingHours: '08:00 - 21:00 (Mở cửa tất cả các ngày trong tuần)',
      shippingFeeStandard: 150000,
      freeShippingThreshold: 5000000,
      bankName: 'Techcombank (Ngân hàng TMCP Kỹ thương Việt Nam)',
      bankAccountNumber: '19036888999888',
      bankAccountName: 'CONG TY TNHH DAILY GIUONG SPA',
    };

    const initialInventoryLogs = this.getDefaultInventoryLogs();

    const newState: DatabaseState = {
      users: initialUsers,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: initialOrders,
      coupons: INITIAL_COUPONS,
      banners: INITIAL_BANNERS,
      reviews: INITIAL_REVIEWS,
      settings: initialSettings,
      inventoryLogs: initialInventoryLogs,
      storedFiles: [],
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

  public async syncFromSqlServer(): Promise<boolean> {
    const pool = await poolPromise;
    if (!pool) return false;

    try {
      // 1. Users
      const usersRes = await pool.request().query('SELECT * FROM dbo.users');
      if (usersRes.recordset && usersRes.recordset.length > 0) {
        this.state.users = usersRes.recordset.map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          passwordHash: r.password_hash,
          phone: r.phone || '',
          address: r.address || '',
          avatar: r.avatar || '',
          role: r.role,
          status: r.status,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
        }));
      }

      // 2. Categories
      const catRes = await pool.request().query('SELECT * FROM dbo.categories');
      if (catRes.recordset && catRes.recordset.length > 0) {
        this.state.categories = catRes.recordset.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description || '',
          image: r.image || '',
        }));
      }

      // 3. Products & Images & Variants
      const prodRes = await pool.request().query('SELECT * FROM dbo.products');
      const imgRes = await pool.request().query('SELECT * FROM dbo.product_images ORDER BY display_order ASC');
      const varRes = await pool.request().query('SELECT * FROM dbo.product_variants');
      if (prodRes.recordset && prodRes.recordset.length > 0) {
        this.state.products = prodRes.recordset.map((p: any) => {
          const prodImages = imgRes.recordset.filter((img: any) => img.product_id === p.id).map((img: any) => img.image_url);
          const prodVariants = varRes.recordset.filter((v: any) => v.product_id === p.id).map((v: any) => ({
            id: v.id,
            productId: v.product_id,
            size: v.size,
            color: v.color,
            colorCode: v.color_code || '#000000',
            stock: v.stock,
            price: v.price !== null ? Number(v.price) : undefined,
            sku: v.sku,
          }));
          let detailsArr: string[] = [];
          try {
            if (p.details) detailsArr = JSON.parse(p.details);
          } catch {
            detailsArr = [];
          }
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            categoryId: p.category_id,
            brand: p.brand || 'DaiLy Spa',
            price: Number(p.price),
            salePrice: p.sale_price !== null ? Number(p.sale_price) : undefined,
            costPrice: (p.cost_price && Number(p.cost_price) > 0)
              ? Number(p.cost_price)
              : (INITIAL_PRODUCTS.find(sp => sp.id === p.id)?.costPrice || Math.round(Number(p.sale_price || p.price) * 0.60)),
            description: p.description || '',
            details: detailsArr,
            images: prodImages,
            variants: prodVariants,
            rating: Number(p.rating || 5.0),
            reviewCount: Number(p.review_count || 0),
            soldCount: Number(p.sold_count || 0),
            isFeatured: Boolean(p.is_featured),
            isNewArrival: Boolean(p.is_new_arrival),
            isFlashSale: Boolean(p.is_flash_sale),
            status: p.status || 'ACTIVE',
            createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
          };
        });
      }

      // 4. Coupons
      const coupRes = await pool.request().query('SELECT * FROM dbo.coupons');
      if (coupRes.recordset && coupRes.recordset.length > 0) {
        this.state.coupons = coupRes.recordset.map((c: any) => ({
          id: c.id,
          code: c.code,
          description: c.description || '',
          discountType: c.discount_type,
          discountValue: Number(c.discount_value),
          minOrderValue: Number(c.min_order_value || 0),
          maxDiscount: c.max_discount !== null ? Number(c.max_discount) : undefined,
          usageLimit: Number(c.usage_limit || 100),
          usedCount: Number(c.used_count || 0),
          startDate: c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : '',
          endDate: c.end_date ? new Date(c.end_date).toISOString().split('T')[0] : '',
          status: c.status,
        }));
      }

      // 5. Banners
      const banRes = await pool.request().query('SELECT * FROM dbo.banners ORDER BY display_order ASC');
      if (banRes.recordset && banRes.recordset.length > 0) {
        this.state.banners = banRes.recordset.map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          badge: b.badge || '',
          link: b.link || '/',
          image: b.image,
          buttonText: b.button_text || 'Xem ngay',
          position: b.position || 'HERO',
          order: Number(b.display_order || 0),
          active: Boolean(b.active),
        }));
      }

      // 6. Orders
      const ordRes = await pool.request().query('SELECT * FROM dbo.orders');
      const ordItemRes = await pool.request().query('SELECT * FROM dbo.order_items');
      if (ordRes.recordset && ordRes.recordset.length > 0) {
        this.state.orders = ordRes.recordset.map((o: any) => {
          const items = ordItemRes.recordset.filter((it: any) => it.order_id === o.id).map((it: any) => ({
            id: it.id,
            orderId: it.order_id,
            productId: it.product_id,
            variantId: it.variant_id || undefined,
            productName: it.product_name,
            size: it.size,
            color: it.color,
            price: Number(it.price),
            quantity: Number(it.quantity),
            total: Number(it.total),
            imageUrl: it.image_url || undefined,
          }));
          return {
            id: o.id,
            orderCode: o.order_code,
            userId: o.user_id || undefined,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: o.customer_phone,
            shippingAddress: o.shipping_address,
            province: o.province,
            district: o.district,
            ward: o.ward,
            note: o.note || undefined,
            subtotal: Number(o.subtotal),
            shippingFee: Number(o.shipping_fee || 0),
            discountAmount: Number(o.discount_amount || 0),
            totalAmount: Number(o.total_amount),
            couponCode: o.coupon_code || undefined,
            paymentMethod: o.payment_method,
            paymentStatus: o.payment_status,
            orderStatus: o.order_status,
            items,
            createdAt: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
            updatedAt: o.updated_at ? new Date(o.updated_at).toISOString() : new Date().toISOString(),
          };
        });
      }

      // 7. Reviews
      const revRes = await pool.request().query('SELECT * FROM dbo.reviews');
      if (revRes.recordset && revRes.recordset.length > 0) {
        this.state.reviews = revRes.recordset.map((r: any) => {
          let imgs: string[] = [];
          try {
            if (r.images) imgs = JSON.parse(r.images);
          } catch {
            imgs = [];
          }
          return {
            id: r.id,
            productId: r.product_id,
            userId: r.user_id,
            userName: r.user_name || 'Khách hàng',
            userAvatar: r.user_avatar || '',
            rating: Number(r.rating),
            comment: r.comment,
            images: imgs,
            status: r.status,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          };
        });
      }

      // 8. Store settings
      const setRes = await pool.request().query('SELECT TOP 1 * FROM dbo.store_settings');
      if (setRes.recordset && setRes.recordset.length > 0) {
        const s = setRes.recordset[0];
        this.state.settings = {
          storeName: s.store_name,
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || '',
          openingHours: s.opening_hours || '',
          shippingFeeStandard: Number(s.shipping_fee_standard || 30000),
          freeShippingThreshold: Number(s.free_shipping_threshold || 500000),
          bankName: s.bank_name || '',
          bankAccountNumber: s.bank_account_number || '',
          bankAccountName: s.bank_account_name || '',
        };
      }

      // 9. Inventory Logs (Phase 1.2)
      try {
        const logRes = await pool.request().query('SELECT * FROM dbo.inventory_logs ORDER BY created_at DESC');
        if (logRes.recordset && logRes.recordset.length > 0) {
          this.state.inventoryLogs = logRes.recordset.map((l: any) => ({
            id: l.id,
            productId: l.product_id,
            productName: l.product_name,
            variantId: l.variant_id || undefined,
            sku: l.sku,
            reason: l.reason,
            reasonLabel: l.reason_label,
            quantityBefore: Number(l.quantity_before),
            quantityChange: Number(l.quantity_change),
            quantityAfter: Number(l.quantity_after),
            orderId: l.order_id || undefined,
            orderCode: l.order_code || undefined,
            note: l.note || undefined,
            performedBy: l.performed_by,
            createdAt: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch {
        // Table may not exist yet in older SQL Server instances
      }

      this.saveState();
      console.log('🔄 [Maison Fashion] Đã đồng bộ toàn bộ dữ liệu từ SQL Server vào bộ nhớ máy chủ!');
      return true;
    } catch (err) {
      console.error('[Maison Fashion] Lỗi đồng bộ từ SQL Server:', err);
      return false;
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

    // Async sync to SQL Server if connected
    poolPromise.then(pool => {
      if (pool) {
        pool.request()
          .input('id', sql.NVarChar(64), newUser.id)
          .input('name', sql.NVarChar(128), newUser.name)
          .input('email', sql.NVarChar(128), newUser.email)
          .input('password_hash', sql.NVarChar(255), newUser.passwordHash)
          .input('phone', sql.NVarChar(32), newUser.phone || '')
          .input('address', sql.NVarChar(255), newUser.address || '')
          .input('avatar', sql.NVarChar(500), newUser.avatar || '')
          .input('role', sql.NVarChar(32), newUser.role)
          .input('status', sql.NVarChar(32), newUser.status)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = @email)
            INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at)
            VALUES (@id, @name, @email, @password_hash, @phone, @address, @avatar, @role, @status, GETDATE())
          `).catch(err => console.warn('[SQL Server] Error inserting user:', err.message));
      }
    }).catch(() => {});

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

    const u = this.state.users[index];
    poolPromise.then(pool => {
      if (pool) {
        pool.request()
          .input('id', sql.NVarChar(64), id)
          .input('name', sql.NVarChar(128), u.name)
          .input('phone', sql.NVarChar(32), u.phone || '')
          .input('address', sql.NVarChar(255), u.address || '')
          .input('avatar', sql.NVarChar(500), u.avatar || '')
          .input('status', sql.NVarChar(32), u.status)
          .query(`
            UPDATE dbo.users 
            SET name = @name, phone = @phone, address = @address, avatar = @avatar, status = @status, updated_at = GETDATE()
            WHERE id = @id
          `).catch(err => console.warn('[SQL Server] Error updating user:', err.message));
      }
    }).catch(() => {});

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

  public getCustomerActivities(userId: string) {
    const user = this.findUserById(userId);
    if (!user) return null;

    const orders = this.state.orders.filter(
      o => o.userId === userId || (user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
    const reviews = this.state.reviews.filter(r => r.userId === userId);

    const timeline: Array<{
      id: string;
      type: 'REGISTER' | 'ORDER' | 'REVIEW' | 'PROFILE_UPDATE';
      title: string;
      description: string;
      timestamp: string;
      meta?: any;
    }> = [];

    // 1. Account registration
    timeline.push({
      id: `act-reg-${user.id}`,
      type: 'REGISTER',
      title: 'Đăng ký tài khoản thành viên',
      description: `Khách hàng tạo tài khoản với email ${user.email}`,
      timestamp: user.createdAt,
    });

    // 2. Profile updates
    if (user.updatedAt && user.updatedAt !== user.createdAt) {
      timeline.push({
        id: `act-upd-${user.id}`,
        type: 'PROFILE_UPDATE',
        title: 'Cập nhật hồ sơ tài khoản',
        description: 'Thông tin cá nhân, địa chỉ hoặc mật khẩu đã được cập nhật',
        timestamp: user.updatedAt,
      });
    }

    // 3. Orders placed
    for (const ord of orders) {
      timeline.push({
        id: `act-ord-${ord.id}`,
        type: 'ORDER',
        title: `Đặt đơn hàng #${ord.orderCode}`,
        description: `Mua ${ord.items.length} món - Tổng: ${ord.totalAmount.toLocaleString('vi-VN')}đ - Trạng thái: ${ord.orderStatus}`,
        timestamp: ord.createdAt,
        meta: {
          orderId: ord.id,
          orderCode: ord.orderCode,
          totalAmount: ord.totalAmount,
          orderStatus: ord.orderStatus,
          paymentStatus: ord.paymentStatus,
          paymentMethod: ord.paymentMethod,
          itemsCount: ord.items.length,
        },
      });
    }

    // 4. Product reviews
    for (const rev of reviews) {
      const prod = this.findProductById(rev.productId);
      timeline.push({
        id: `act-rev-${rev.id}`,
        type: 'REVIEW',
        title: `Đánh giá sản phẩm (${rev.rating} sao)`,
        description: `Bình luận trên "${prod?.name || 'Sản phẩm'}": "${rev.comment.substring(0, 90)}${rev.comment.length > 90 ? '...' : ''}"`,
        timestamp: rev.createdAt,
        meta: {
          productId: rev.productId,
          productName: prod?.name,
          rating: rev.rating,
        },
      });
    }

    // Sort timeline newest first
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const { passwordHash, ...safeUser } = user;
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      user: {
        ...safeUser,
        totalOrders: orders.length,
        totalSpent,
      },
      orders,
      reviews,
      timeline,
    };
  }

  public changePassword(userId: string, oldPasswordPlain: string, newPasswordPlain: string): { success: boolean; message: string } {
    const user = this.findUserById(userId);
    if (!user) {
      return { success: false, message: 'Không tìm thấy thông tin tài khoản' };
    }

    const isMatch = bcrypt.compareSync(oldPasswordPlain, user.passwordHash);
    if (!isMatch) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác' };
    }

    if (newPasswordPlain.length < 8) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' };
    }

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPasswordPlain, salt);
    user.updatedAt = new Date().toISOString();
    this.saveState();

    poolPromise.then(pool => {
      if (pool) {
        pool.request()
          .input('id', sql.NVarChar(64), user.id)
          .input('hash', sql.NVarChar(255), user.passwordHash)
          .query(`UPDATE dbo.users SET password_hash = @hash, updated_at = GETDATE() WHERE id = @id`)
          .catch(err => console.warn('[SQL Server] Error updating password:', err.message));
      }
    }).catch(() => {});

    return { success: true, message: 'Đổi mật khẩu thành công' };
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
        case 'price_asc':
          list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
          break;
        case 'price-desc':
        case 'price_desc':
          list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
          break;
        case 'bestseller':
        case 'popular':
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

    // Async sync to SQL Server if connected
    poolPromise.then(async (pool) => {
      if (pool) {
        try {
          const r = pool.request();
          r.input('id', sql.VarChar(36), newOrder.id);
          r.input('order_code', sql.VarChar(50), newOrder.orderCode);
          r.input('user_id', sql.VarChar(36), newOrder.userId || null);
          r.input('customer_name', sql.NVarChar(150), newOrder.customerName);
          r.input('customer_email', sql.VarChar(150), newOrder.customerEmail);
          r.input('customer_phone', sql.VarChar(20), newOrder.customerPhone);
          r.input('shipping_address', sql.NVarChar(500), newOrder.shippingAddress);
          r.input('province', sql.NVarChar(100), newOrder.province);
          r.input('district', sql.NVarChar(100), newOrder.district);
          r.input('ward', sql.NVarChar(100), newOrder.ward);
          r.input('note', sql.NVarChar(sql.MAX), newOrder.note || null);
          r.input('subtotal', sql.Decimal(18, 2), newOrder.subtotal);
          r.input('shipping_fee', sql.Decimal(18, 2), newOrder.shippingFee || 0);
          r.input('discount_amount', sql.Decimal(18, 2), newOrder.discountAmount || 0);
          r.input('total_amount', sql.Decimal(18, 2), newOrder.totalAmount);
          r.input('coupon_code', sql.VarChar(50), newOrder.couponCode || null);
          r.input('payment_method', sql.VarChar(50), newOrder.paymentMethod || 'COD');
          r.input('payment_status', sql.VarChar(50), newOrder.paymentStatus || 'PENDING');
          r.input('order_status', sql.VarChar(50), newOrder.orderStatus || 'PENDING');
          await r.query(`
            INSERT INTO dbo.orders (id, order_code, user_id, customer_name, customer_email, customer_phone, shipping_address, province, district, ward, note, subtotal, shipping_fee, discount_amount, total_amount, coupon_code, payment_method, payment_status, order_status, created_at, updated_at)
            VALUES (@id, @order_code, @user_id, @customer_name, @customer_email, @customer_phone, @shipping_address, @province, @district, @ward, @note, @subtotal, @shipping_fee, @discount_amount, @total_amount, @coupon_code, @payment_method, @payment_status, @order_status, GETDATE(), GETDATE())
          `);

          for (const it of newOrder.items) {
            const itemReq = pool.request();
            itemReq.input('id', sql.VarChar(36), it.id);
            itemReq.input('order_id', sql.VarChar(36), newOrder.id);
            itemReq.input('product_id', sql.VarChar(36), it.productId);
            itemReq.input('variant_id', sql.VarChar(36), it.variantId || null);
            itemReq.input('product_name', sql.NVarChar(255), it.productName);
            itemReq.input('size', sql.NVarChar(50), it.size);
            itemReq.input('color', sql.NVarChar(50), it.color);
            itemReq.input('price', sql.Decimal(18, 2), it.price);
            itemReq.input('quantity', sql.Int, it.quantity);
            itemReq.input('total', sql.Decimal(18, 2), it.total);
            itemReq.input('image_url', sql.NVarChar(500), it.imageUrl || null);
            await itemReq.query(`
              INSERT INTO dbo.order_items (id, order_id, product_id, variant_id, product_name, size, color, price, quantity, total, image_url)
              VALUES (@id, @order_id, @product_id, @variant_id, @product_name, @size, @color, @price, @quantity, @total, @image_url)
            `);
          }
        } catch (err: any) {
          console.warn('[SQL Server] Error inserting order:', err?.message || err);
        }
      }
    }).catch(() => {});

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

    const currentOrder = order;
    poolPromise.then(async (pool) => {
      if (pool) {
        try {
          const r = pool.request();
          r.input('id', sql.VarChar(36), id);
          r.input('order_status', sql.VarChar(50), status);
          r.input('payment_status', sql.VarChar(50), currentOrder.paymentStatus);
          await r.query(`
            UPDATE dbo.orders 
            SET order_status = @order_status, payment_status = @payment_status, updated_at = GETDATE()
            WHERE id = @id OR order_code = @id
          `);
        } catch (err: any) {
          console.warn('[SQL Server] Error updating order status:', err?.message || err);
        }
      }
    }).catch(() => {});

    return order;
  }

  public findOrderByCode(code: string): Order | undefined {
    const cleanCode = code.trim().toUpperCase();
    return this.state.orders.find(o => o.orderCode.toUpperCase() === cleanCode || o.id === code);
  }

  public cancelOrder(id: string, userId?: string): { success: boolean; message: string; order?: Order } {
    const order = this.state.orders.find(o => o.id === id || o.orderCode.toUpperCase() === id.toUpperCase());
    if (!order) {
      return { success: false, message: 'Không tìm thấy đơn hàng' };
    }

    if (userId && order.userId && order.userId !== userId) {
      return { success: false, message: 'Bạn không có quyền thao tác trên đơn hàng này' };
    }

    if (order.orderStatus === 'DELIVERED') {
      return { success: false, message: 'Đơn hàng đã được giao thành công, không thể hủy' };
    }

    if (order.orderStatus === 'CANCELLED') {
      return { success: false, message: 'Đơn hàng này đã ở trạng thái hủy trước đó' };
    }

    if (order.orderStatus === 'SHIPPING') {
      return { success: false, message: 'Đơn hàng đang trong quá trình vận chuyển, vui lòng liên hệ tổng đài 1900 6868' };
    }

    // Restore stock & decrement soldCount
    for (const item of order.items) {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.soldCount = Math.max(0, prod.soldCount - item.quantity);
        if (item.variantId) {
          const variant = prod.variants.find(v => v.id === item.variantId);
          if (variant) {
            variant.stock += item.quantity;
          }
        }
      }
    }

    // Restore coupon usage count
    if (order.couponCode) {
      const coupon = this.state.coupons.find(c => c.code.toUpperCase() === order.couponCode?.toUpperCase());
      if (coupon && coupon.usedCount > 0) {
        coupon.usedCount -= 1;
      }
    }

    order.orderStatus = 'CANCELLED';
    order.updatedAt = new Date().toISOString();
    this.saveState();

    poolPromise.then(async (pool) => {
      if (pool) {
        try {
          const r = pool.request();
          r.input('id', sql.VarChar(36), order.id);
          await r.query(`
            UPDATE dbo.orders 
            SET order_status = 'CANCELLED', updated_at = GETDATE()
            WHERE id = @id OR order_code = @id
          `);
        } catch (err: any) {
          console.warn('[SQL Server] Error cancelling order:', err?.message || err);
        }
      }
    }).catch(() => {});

    return { success: true, message: `Hủy đơn hàng #${order.orderCode} thành công`, order };
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

    poolPromise.then(async (pool) => {
      if (pool) {
        try {
          const r = pool.request();
          r.input('id', sql.VarChar(36), newRev.id);
          r.input('product_id', sql.VarChar(36), newRev.productId);
          r.input('user_id', sql.VarChar(36), newRev.userId);
          r.input('user_name', sql.NVarChar(150), newRev.userName || 'Khách hàng');
          r.input('user_avatar', sql.NVarChar(500), newRev.userAvatar || null);
          r.input('rating', sql.Int, newRev.rating);
          r.input('comment', sql.NVarChar(sql.MAX), newRev.comment);
          r.input('images', sql.NVarChar(sql.MAX), JSON.stringify(newRev.images || []));
          r.input('status', sql.VarChar(20), newRev.status);
          await r.query(`
            INSERT INTO dbo.reviews (id, product_id, user_id, user_name, user_avatar, rating, comment, images, status, created_at)
            VALUES (@id, @product_id, @user_id, @user_name, @user_avatar, @rating, @comment, @images, @status, GETDATE())
          `);
        } catch (err: any) {
          console.warn('[SQL Server] Error inserting review:', err?.message || err);
        }
      }
    }).catch(() => {});

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

  public updateVariantStock(
    productId: string,
    variantId: string,
    newStock: number,
    opts?: { reason?: string; reasonLabel?: string; note?: string; orderId?: string; orderCode?: string; performedBy?: string }
  ): boolean {
    const prod = this.state.products.find(p => p.id === productId);
    if (!prod) return false;
    const variant = prod.variants.find(v => v.id === variantId);
    if (!variant) return false;
    const before = variant.stock;
    variant.stock = Math.max(0, newStock);
    const after = variant.stock;

    // Phase 1.2 — Auto-log inventory change
    this.addInventoryLog({
      productId: prod.id,
      productName: prod.name,
      variantId: variant.id,
      sku: variant.sku,
      reason: opts?.reason || 'MANUAL_ADJUST',
      reasonLabel: opts?.reasonLabel || 'Admin điều chỉnh tồn kho',
      quantityBefore: before,
      quantityChange: after - before,
      quantityAfter: after,
      orderId: opts?.orderId,
      orderCode: opts?.orderCode,
      note: opts?.note,
      performedBy: opts?.performedBy || 'Admin',
    });

    this.saveState();
    return true;
  }

  // ============================================================
  // Phase 1.2 — INVENTORY LOGS (Stock Card / Thẻ kho)
  // ============================================================
  public addInventoryLog(entry: Omit<InventoryLogEntry, 'id' | 'createdAt'>): InventoryLogEntry {
    if (!this.state.inventoryLogs) this.state.inventoryLogs = [];
    const log: InventoryLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.inventoryLogs.unshift(log); // newest first
    // keep last 1000 entries to avoid memory bloat
    if (this.state.inventoryLogs.length > 1000) {
      this.state.inventoryLogs = this.state.inventoryLogs.slice(0, 1000);
    }
    this.saveState();
    return log;
  }

  public getInventoryLogs(opts?: {
    productId?: string;
    variantId?: string;
    reason?: string;
    limit?: number;
    page?: number;
  }): { logs: InventoryLogEntry[]; total: number; page: number; totalPages: number } {
    if (!this.state.inventoryLogs) this.state.inventoryLogs = [];
    let logs = [...this.state.inventoryLogs];

    if (opts?.productId) logs = logs.filter(l => l.productId === opts.productId);
    if (opts?.variantId) logs = logs.filter(l => l.variantId === opts.variantId);
    if (opts?.reason)    logs = logs.filter(l => l.reason === opts.reason);

    const total = logs.length;
    const page = opts?.page || 1;
    const limit = opts?.limit || 30;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = logs.slice((page - 1) * limit, page * limit);
    return { logs: paginated, total, page, totalPages };
  }

  // ============================================================
  // Phase 1.3 — STORED FILES (Upload ảnh + SHA-256)
  // ============================================================
  public findFileByHash(hash: string): StoredFileEntry | undefined {
    if (!this.state.storedFiles) this.state.storedFiles = [];
    return this.state.storedFiles.find(f => f.fileHash === hash);
  }

  public saveStoredFile(file: Omit<StoredFileEntry, 'id' | 'createdAt'>): StoredFileEntry {
    if (!this.state.storedFiles) this.state.storedFiles = [];
    const stored: StoredFileEntry = {
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.storedFiles.unshift(stored);
    this.saveState();
    return stored;
  }

  public listStoredFiles(limit = 50): StoredFileEntry[] {
    if (!this.state.storedFiles) return [];
    return this.state.storedFiles.slice(0, limit);
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

    // Phase 1.1 — Profit metrics
    // Estimate cost of delivered orders based on product.costPrice
    const deliveredOrders = this.state.orders.filter(o => o.orderStatus === 'DELIVERED');
    let totalCostPrice = 0;
    for (const ord of deliveredOrders) {
      for (const item of ord.items) {
        const prod = this.state.products.find(p => p.id === item.productId);
        if (prod && prod.costPrice) {
          totalCostPrice += prod.costPrice * item.quantity;
        } else {
          // Fallback: estimate cost at 60% of sale price
          totalCostPrice += item.price * item.quantity * 0.60;
        }
      }
    }
    const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const grossProfit = deliveredRevenue - totalCostPrice;
    const profitMarginPct = deliveredRevenue > 0 ? Math.round((grossProfit / deliveredRevenue) * 1000) / 10 : 0;

    return {
      overview: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        completedOrders,
        lowStockCount,
        // Phase 1.1 — Profit metrics
        totalCostPrice,
        grossProfit,
        profitMarginPct,
      },
      revenueByDay: days,
      revenueByMonth: months,
      topProducts,
      recentOrders,
    };
  }
}

export const db = new DatabaseEngine();
