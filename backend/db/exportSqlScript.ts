import fs from 'fs';
import path from 'path';

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'number') return val.toString();
  const str = String(val).replace(/'/g, "''");
  return `N'${str}'`;
}

function generate() {
  const storePath = path.join(process.cwd(), 'data', 'store.json');
  const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));

  let sql = `-- ==============================================================================
-- DATABASE SCHEMA & SEED DATA: MAISON FASHION STORE
-- Hệ quản trị cơ sở dữ liệu: Microsoft SQL Server (T-SQL)
-- Tương thích: SQL Server 2016, 2019, 2022, 2025, Azure SQL, SSMS
-- ==============================================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'maison_fashion')
BEGIN
    CREATE DATABASE [maison_fashion] COLLATE Vietnamese_CI_AS;
END
GO

USE [maison_fashion];
GO

-- XÓA BẢNG CŨ NẾU ĐÃ TỒN TẠI ĐỂ TẠO MỚI SẠCH SẼ (THEO THỨ TỰ KHÓA NGOẠI)
IF OBJECT_ID('dbo.order_items', 'U') IS NOT NULL DROP TABLE dbo.order_items;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.coupon_usages', 'U') IS NOT NULL DROP TABLE dbo.coupon_usages;
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.coupons', 'U') IS NOT NULL DROP TABLE dbo.coupons;
IF OBJECT_ID('dbo.reviews', 'U') IS NOT NULL DROP TABLE dbo.reviews;
IF OBJECT_ID('dbo.cart_items', 'U') IS NOT NULL DROP TABLE dbo.cart_items;
IF OBJECT_ID('dbo.carts', 'U') IS NOT NULL DROP TABLE dbo.carts;
IF OBJECT_ID('dbo.product_variants', 'U') IS NOT NULL DROP TABLE dbo.product_variants;
IF OBJECT_ID('dbo.product_images', 'U') IS NOT NULL DROP TABLE dbo.product_images;
IF OBJECT_ID('dbo.products', 'U') IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.sizes', 'U') IS NOT NULL DROP TABLE dbo.sizes;
IF OBJECT_ID('dbo.colors', 'U') IS NOT NULL DROP TABLE dbo.colors;
IF OBJECT_ID('dbo.banners', 'U') IS NOT NULL DROP TABLE dbo.banners;
IF OBJECT_ID('dbo.admins', 'U') IS NOT NULL DROP TABLE dbo.admins;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.store_settings', 'U') IS NOT NULL DROP TABLE dbo.store_settings;
GO

-- ==============================================================================
-- 2. TẠO CÁC BẢNG (TABLES) & RÀNG BUỘC (CONSTRAINTS)
-- ==============================================================================

-- Bảng người dùng (Khách hàng & Quản trị viên)
CREATE TABLE dbo.users (
    id VARCHAR(36) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    address NVARCHAR(500) NULL,
    avatar NVARCHAR(500) NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED')),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL DEFAULT GETDATE()
);
GO

-- Bảng quản trị viên
CREATE TABLE dbo.admins (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.users(id) ON DELETE CASCADE,
    department NVARCHAR(100) DEFAULT N'BAN QUAN TRI',
    permissions NVARCHAR(MAX) NULL,
    last_login DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Bảng danh mục sản phẩm
CREATE TABLE dbo.categories (
    id VARCHAR(36) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description NVARCHAR(MAX) NULL,
    image NVARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Bảng sản phẩm
CREATE TABLE dbo.products (
    id VARCHAR(36) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    category_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.categories(id) ON DELETE NO ACTION,
    brand NVARCHAR(100) DEFAULT N'DaiLy Spa',
    price DECIMAL(18, 2) NOT NULL,
    sale_price DECIMAL(18, 2) NULL,
    description NVARCHAR(MAX) NULL,
    details NVARCHAR(MAX) NULL,
    rating DECIMAL(3, 1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    is_featured BIT DEFAULT 0,
    is_new_arrival BIT DEFAULT 1,
    is_flash_sale BIT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL DEFAULT GETDATE()
);
GO

-- Bảng hình ảnh sản phẩm
CREATE TABLE dbo.product_images (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.products(id) ON DELETE CASCADE,
    image_url NVARCHAR(500) NOT NULL,
    is_primary BIT DEFAULT 0,
    display_order INT DEFAULT 0
);
GO

-- Bảng kích thước & màu sắc tham chiếu
CREATE TABLE dbo.sizes (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name NVARCHAR(50) NOT NULL
);
GO

CREATE TABLE dbo.colors (
    id VARCHAR(36) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    hex_code VARCHAR(20) NOT NULL
);
GO

-- Bảng biến thể sản phẩm (Size x Màu x Tồn kho)
CREATE TABLE dbo.product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.products(id) ON DELETE CASCADE,
    size NVARCHAR(50) NOT NULL,
    color NVARCHAR(50) NOT NULL,
    color_code VARCHAR(20) DEFAULT '#000000',
    stock INT NOT NULL DEFAULT 0,
    price DECIMAL(18, 2) NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Bảng giỏ hàng
CREATE TABLE dbo.carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL FOREIGN KEY REFERENCES dbo.users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.cart_items (
    id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.carts(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.products(id) ON DELETE CASCADE,
    variant_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.product_variants(id) ON DELETE NO ACTION,
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Bảng mã giảm giá
CREATE TABLE dbo.coupons (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
    discount_value DECIMAL(18, 2) NOT NULL,
    min_order_value DECIMAL(18, 2) DEFAULT 0,
    max_discount DECIMAL(18, 2) NULL,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Bảng đơn hàng
CREATE TABLE dbo.orders (
    id VARCHAR(36) PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(36) NULL FOREIGN KEY REFERENCES dbo.users(id) ON DELETE SET NULL,
    customer_name NVARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address NVARCHAR(500) NOT NULL,
    province NVARCHAR(100) NOT NULL,
    district NVARCHAR(100) NOT NULL,
    ward NVARCHAR(100) NOT NULL,
    note NVARCHAR(MAX) NULL,
    subtotal DECIMAL(18, 2) NOT NULL,
    shipping_fee DECIMAL(18, 2) DEFAULT 30000,
    discount_amount DECIMAL(18, 2) DEFAULT 0,
    total_amount DECIMAL(18, 2) NOT NULL,
    coupon_code VARCHAR(50) NULL,
    payment_method VARCHAR(50) DEFAULT 'COD' CHECK (payment_method IN ('COD', 'BANK_TRANSFER', 'VNPAY', 'MOMO')),
    payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    order_status VARCHAR(50) DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED')),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL DEFAULT GETDATE()
);
GO

-- Bảng chi tiết đơn hàng
CREATE TABLE dbo.order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.products(id) ON DELETE NO ACTION,
    variant_id VARCHAR(36) NULL,
    product_name NVARCHAR(255) NOT NULL,
    size NVARCHAR(50) NOT NULL,
    color NVARCHAR(50) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(18, 2) NOT NULL,
    image_url NVARCHAR(500) NULL
);
GO

-- Bảng lịch sử sử dụng mã giảm giá
CREATE TABLE dbo.coupon_usages (
    id VARCHAR(36) PRIMARY KEY,
    coupon_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.coupons(id) ON DELETE NO ACTION,
    user_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.users(id) ON DELETE CASCADE,
    order_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.orders(id) ON DELETE CASCADE,
    used_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng thanh toán
CREATE TABLE dbo.payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.orders(id) ON DELETE CASCADE,
    amount DECIMAL(18, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng đánh giá sản phẩm
CREATE TABLE dbo.reviews (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.products(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL FOREIGN KEY REFERENCES dbo.users(id) ON DELETE CASCADE,
    user_name NVARCHAR(150) NULL,
    user_avatar NVARCHAR(500) NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX) NOT NULL,
    images NVARCHAR(MAX) NULL,
    status VARCHAR(20) DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'HIDDEN')),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng banner quảng cáo
CREATE TABLE dbo.banners (
    id VARCHAR(36) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    subtitle NVARCHAR(MAX) NULL,
    badge NVARCHAR(100) NULL,
    link NVARCHAR(255) NOT NULL,
    image NVARCHAR(500) NOT NULL,
    button_text NVARCHAR(100) DEFAULT N'Xem ngay',
    position VARCHAR(50) DEFAULT 'HERO' CHECK (position IN ('HERO', 'PROMO', 'MIDDLE')),
    display_order INT DEFAULT 0,
    active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng cài đặt cửa hàng
CREATE TABLE dbo.store_settings (
    id VARCHAR(36) PRIMARY KEY,
    store_name NVARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    address NVARCHAR(500) NULL,
    opening_hours NVARCHAR(255) NULL,
    shipping_fee_standard DECIMAL(18, 2) DEFAULT 30000,
    free_shipping_threshold DECIMAL(18, 2) DEFAULT 500000,
    bank_name NVARCHAR(255) NULL,
    bank_account_number VARCHAR(50) NULL,
    bank_account_name NVARCHAR(255) NULL,
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- ==============================================================================
-- 3. NẠP DỮ LIỆU MẪU (SEED DATA)
-- ==============================================================================
`;

  // Users & Admins
  sql += `\n-- 3.1. Users\n`;
  for (const u of store.users) {
    const updatedAtVal = u.updatedAt || u.createdAt || new Date().toISOString();
    sql += `INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at) VALUES (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, ${escapeSql(u.passwordHash)}, ${escapeSql(u.phone)}, ${escapeSql(u.address)}, ${escapeSql(u.avatar)}, ${escapeSql(u.role)}, ${escapeSql(u.status)}, ${escapeSql(u.createdAt)}, ${escapeSql(updatedAtVal)});\n`;
    if (u.role === 'ADMIN') {
      sql += `INSERT INTO dbo.admins (id, user_id, department, permissions, created_at) VALUES (${escapeSql(`adm-${u.id}`)}, ${escapeSql(u.id)}, N'BAN QUAN TRI', N'["ALL"]', GETDATE());\n`;
    }
  }
  sql += `GO\n`;

  // Categories
  sql += `\n-- 3.2. Categories\n`;
  for (const c of store.categories) {
    sql += `INSERT INTO dbo.categories (id, name, slug, description, image, created_at) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.image)}, GETDATE());\n`;
  }
  sql += `GO\n`;

  // Products, Images & Variants
  sql += `\n-- 3.3. Products, Images & Variants\n`;
  for (const p of store.products) {
    sql += `INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (${escapeSql(p.id)}, ${escapeSql(p.name)}, ${escapeSql(p.slug)}, ${escapeSql(p.categoryId)}, ${escapeSql(p.brand || 'DaiLy Spa')}, ${p.price}, ${p.salePrice || 'NULL'}, ${escapeSql(p.description)}, ${escapeSql(p.details ? JSON.stringify(p.details) : null)}, ${p.rating || 5.0}, ${p.reviewCount || 0}, ${p.soldCount || 0}, ${p.isFeatured ? 1 : 0}, ${p.isNewArrival ? 1 : 0}, ${p.isFlashSale ? 1 : 0}, ${escapeSql(p.status || 'ACTIVE')}, ${escapeSql(p.createdAt)}, GETDATE());\n`;

    if (Array.isArray(p.images)) {
      for (let i = 0; i < p.images.length; i++) {
        sql += `INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (${escapeSql(`img-${p.id}-${i}`)}, ${escapeSql(p.id)}, ${escapeSql(p.images[i])}, ${i === 0 ? 1 : 0}, ${i});\n`;
      }
    }

    if (Array.isArray(p.variants)) {
      for (const v of p.variants) {
        sql += `INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (${escapeSql(v.id)}, ${escapeSql(p.id)}, ${escapeSql(v.size)}, ${escapeSql(v.color)}, ${escapeSql(v.colorCode || '#000000')}, ${v.stock}, ${v.price || 'NULL'}, ${escapeSql(v.sku)}, GETDATE());\n`;
      }
    }
  }
  sql += `GO\n`;

  // Coupons
  sql += `\n-- 3.4. Coupons\n`;
  if (store.coupons) {
    for (const cp of store.coupons) {
      sql += `INSERT INTO dbo.coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, start_date, end_date, status, created_at) VALUES (${escapeSql(cp.id)}, ${escapeSql(cp.code)}, ${escapeSql(cp.description)}, ${escapeSql(cp.discountType)}, ${cp.discountValue}, ${cp.minOrderValue || 0}, ${cp.maxDiscount || 'NULL'}, ${cp.usageLimit || 100}, ${cp.usedCount || 0}, ${escapeSql(cp.startDate)}, ${escapeSql(cp.endDate)}, ${escapeSql(cp.status || 'ACTIVE')}, GETDATE());\n`;
    }
    sql += `GO\n`;
  }

  // Banners
  sql += `\n-- 3.5. Banners\n`;
  if (store.banners) {
    for (const b of store.banners) {
      sql += `INSERT INTO dbo.banners (id, title, subtitle, badge, link, image, button_text, position, display_order, active, created_at) VALUES (${escapeSql(b.id)}, ${escapeSql(b.title)}, ${escapeSql(b.subtitle)}, ${escapeSql(b.badge)}, ${escapeSql(b.link || '/')}, ${escapeSql(b.image)}, ${escapeSql(b.buttonText || 'Xem ngay')}, ${escapeSql(b.position || 'HERO')}, ${b.order || 0}, ${b.active ? 1 : 0}, GETDATE());\n`;
    }
    sql += `GO\n`;
  }

  // Orders & Order Items
  sql += `\n-- 3.6. Orders & Order Items\n`;
  if (store.orders) {
    for (const o of store.orders) {
      const orderUpdatedAt = o.updatedAt || o.createdAt || new Date().toISOString();
      sql += `INSERT INTO dbo.orders (id, order_code, user_id, customer_name, customer_email, customer_phone, shipping_address, province, district, ward, note, subtotal, shipping_fee, discount_amount, total_amount, coupon_code, payment_method, payment_status, order_status, created_at, updated_at) VALUES (${escapeSql(o.id)}, ${escapeSql(o.orderCode)}, ${escapeSql(o.userId)}, ${escapeSql(o.customerName)}, ${escapeSql(o.customerEmail)}, ${escapeSql(o.customerPhone)}, ${escapeSql(o.shippingAddress)}, ${escapeSql(o.province)}, ${escapeSql(o.district)}, ${escapeSql(o.ward)}, ${escapeSql(o.note)}, ${o.subtotal}, ${o.shippingFee || 0}, ${o.discountAmount || 0}, ${o.totalAmount}, ${escapeSql(o.couponCode)}, ${escapeSql(o.paymentMethod || 'COD')}, ${escapeSql(o.paymentStatus || 'PENDING')}, ${escapeSql(o.orderStatus || 'PENDING')}, ${escapeSql(o.createdAt)}, ${escapeSql(orderUpdatedAt)});\n`;

      if (Array.isArray(o.items)) {
        for (const it of o.items) {
          sql += `INSERT INTO dbo.order_items (id, order_id, product_id, variant_id, product_name, size, color, price, quantity, total, image_url) VALUES (${escapeSql(it.id)}, ${escapeSql(o.id)}, ${escapeSql(it.productId)}, ${escapeSql(it.variantId)}, ${escapeSql(it.productName)}, ${escapeSql(it.size)}, ${escapeSql(it.color)}, ${it.price}, ${it.quantity}, ${it.total}, ${escapeSql(it.imageUrl)});\n`;
        }
      }
    }
    sql += `GO\n`;
  }

  // Reviews
  sql += `\n-- 3.7. Reviews\n`;
  if (store.reviews) {
    const userIds = new Set(store.users.map((u: any) => u.id));
    const defaultUserId = store.users[0]?.id;
    for (const rv of store.reviews) {
      const resolvedUserId = userIds.has(rv.userId) ? rv.userId : defaultUserId;
      sql += `INSERT INTO dbo.reviews (id, product_id, user_id, user_name, user_avatar, rating, comment, images, status, created_at) VALUES (${escapeSql(rv.id)}, ${escapeSql(rv.productId)}, ${escapeSql(resolvedUserId)}, ${escapeSql(rv.userName)}, ${escapeSql(rv.userAvatar)}, ${rv.rating}, ${escapeSql(rv.comment)}, ${escapeSql(rv.images ? JSON.stringify(rv.images) : null)}, ${escapeSql(rv.status || 'APPROVED')}, ${escapeSql(rv.createdAt)});\n`;
    }
    sql += `GO\n`;
  }

  // Store Settings
  sql += `\n-- 3.8. Store Settings\n`;
  if (store.settings) {
    const s = store.settings;
    sql += `INSERT INTO dbo.store_settings (id, store_name, phone, email, address, opening_hours, shipping_fee_standard, free_shipping_threshold, bank_name, bank_account_number, bank_account_name, updated_at) VALUES (${escapeSql('main-settings')}, ${escapeSql(s.storeName)}, ${escapeSql(s.phone)}, ${escapeSql(s.email)}, ${escapeSql(s.address)}, ${escapeSql(s.openingHours)}, ${s.shippingFeeStandard}, ${s.freeShippingThreshold}, ${escapeSql(s.bankName)}, ${escapeSql(s.bankAccountNumber)}, ${escapeSql(s.bankAccountName)}, GETDATE());\n`;
    sql += `GO\n`;
  }

  sql += `\nGO\nPRINT N'======================================================';\nPRINT N'HOAN TAT KHOI TAO CO SO DU LIEU MAISON FASHION VA SEED DATA THANH CONG!';\nPRINT N'======================================================';\nGO\n`;

  const outSqlServer = path.join(process.cwd(), 'database', 'schema_sqlserver.sql');
  const outSchema = path.join(process.cwd(), 'database', 'schema.sql');
  fs.writeFileSync(outSqlServer, '\uFEFF' + sql, 'utf-8');
  fs.writeFileSync(outSchema, '\uFEFF' + sql, 'utf-8');
  console.log(`Đã xuất file thành công (UTF-8 with BOM) ra:\n- ${outSqlServer}\n- ${outSchema}`);
}

generate();
