-- ==============================================================================
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

-- 3.1. Users
INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at) VALUES (N'usr-1791268844060-fck2', N'Lê Văn Tây', N'levantay1812005@gmail.com', N'$2b$10$EG6DaaWpPgWoS01D8Onm0.tNnhqOmbgkTy2fK9IXYW6OoFpEattMu', N'0932436080', N'', N'', N'CUSTOMER', N'ACTIVE', N'2026-10-06T06:40:44.060Z', N'2026-10-06T07:16:49.876Z');
INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at) VALUES (N'usr-admin-1', N'Trần Văn Quản Trị', N'admin@example.com', N'$2b$10$EG6DaaWpPgWoS01D8Onm0.6tLfe3hSYhSrkY89h6g0PPWh0pH.lQ6', N'0909123456', N'158 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', N'ADMIN', N'ACTIVE', N'2025-01-01T00:00:00.000Z', N'2026-10-06T07:16:49.852Z');
INSERT INTO dbo.admins (id, user_id, department, permissions, created_at) VALUES (N'adm-usr-admin-1', N'usr-admin-1', N'BAN QUAN TRI', N'["ALL"]', GETDATE());
INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at) VALUES (N'usr-cust-1', N'Nguyễn Thúy Vy (Aesthetic Clinic)', N'khachhang@example.com', N'$2b$10$EG6DaaWpPgWoS01D8Onm0.tNnhqOmbgkTy2fK9IXYW6OoFpEattMu', N'0918765432', N'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh', N'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', N'CUSTOMER', N'ACTIVE', N'2025-01-05T10:00:00.000Z', N'2026-10-06T07:16:49.871Z');
INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at) VALUES (N'usr-cust-2', N'Lê Minh Tuấn (Spa Dưỡng Sinh)', N'minhtuan@gmail.com', N'$2b$10$EG6DaaWpPgWoS01D8Onm0.tNnhqOmbgkTy2fK9IXYW6OoFpEattMu', N'0987654321', N'Số 45 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', N'CUSTOMER', N'ACTIVE', N'2025-01-08T14:30:00.000Z', N'2026-10-06T07:16:49.874Z');
INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at) VALUES (N'usr-cust-3', N'Phạm Phương Linh (Resort Spa)', N'phuonglinh@gmail.com', N'$2b$10$EG6DaaWpPgWoS01D8Onm0.tNnhqOmbgkTy2fK9IXYW6OoFpEattMu', N'0933221100', N'124 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', N'CUSTOMER', N'ACTIVE', N'2025-01-12T09:15:00.000Z', N'2026-10-06T07:16:49.875Z');
INSERT INTO dbo.users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at) VALUES (N'usr-cust-demo', N'Khách Hàng Demo', N'customer@example.com', N'$2b$10$EG6DaaWpPgWoS01D8Onm0.tNnhqOmbgkTy2fK9IXYW6OoFpEattMu', N'0901234567', N'Quận 1, TP. Hồ Chí Minh', N'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', N'CUSTOMER', N'ACTIVE', N'2025-01-01T10:00:00.000Z', N'2026-10-06T07:16:49.873Z');
GO

-- 3.2. Categories
INSERT INTO dbo.categories (id, name, slug, description, image, created_at) VALUES (N'cat-1', N'Giường Tiêm Thẩm Mỹ & Phẫu Thuật', N'giuong-tiem-tham-my', N'Giường thẩm mỹ cao cấp 1 - 4 động cơ điện tử, bọc da PU y tế kháng khuẩn, ngả lưng và nâng chân đa góc mượt mà.', N'/images/products/giuong-tiem-dien.jpg', GETDATE());
INSERT INTO dbo.categories (id, name, slug, description, image, created_at) VALUES (N'cat-2', N'Giường Gội Đầu Dưỡng Sinh Tai Thỏ', N'giuong-goi-duong-sinh', N'Giường gội dưỡng sinh 2 trong 1 tích hợp bồn sứ / bồn tai thỏ, vòm tuần hoàn nước nóng ấm và thùng xông thảo dược.', N'/images/products/giuong-goi-duong-sinh.jpg', GETDATE());
INSERT INTO dbo.categories (id, name, slug, description, image, created_at) VALUES (N'cat-3', N'Giường Massage Body Gỗ Tự Nhiên', N'giuong-massage-go', N'Khung gỗ sồi, gỗ tràm tự nhiên chịu tải 350kg, đệm mút D40 chống xẹp lún, khoét lỗ thở chuẩn kỹ thuật spa trị liệu.', N'/images/products/giuong-massage-go.png', GETDATE());
INSERT INTO dbo.categories (id, name, slug, description, image, created_at) VALUES (N'cat-4', N'Giường Spa Khung Kim Loại & Inox', N'giuong-spa-kim-loai', N'Khung thép sơn tĩnh điện chống rỉ và inox 304 sáng bóng, tích hợp tầng kệ khăn và cơ chế nâng đầu tiện dụng.', N'/images/products/giuong-spa-inox.jpg', GETDATE());
INSERT INTO dbo.categories (id, name, slug, description, image, created_at) VALUES (N'cat-5', N'Giường Vali Gấp Gọn Di Động', N'giuong-vali-gap-gon', N'Giường gấp vali chân nhôm siêu nhẹ 12kg, dễ dàng xếp gọn mang đi trị liệu, phun xăm, nối mi tận nơi khách hàng.', N'/images/products/giuong-vali-gap.jpg', GETDATE());
INSERT INTO dbo.categories (id, name, slug, description, image, created_at) VALUES (N'cat-6', N'Ghế & Giường Phun Xăm, Nối Mi', N'giuong-phun-xam-noi-mi', N'Ghế giường xoay 360 độ ngả phẳng, tựa tay và gối rời giúp kỹ thuật viên thao tác chuẩn xác, chống mỏi lưng.', N'/images/products/ghe-phun-xam.jpg', GETDATE());
GO

-- 3.3. Products, Images & Variants
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-1', N'Giường Tiêm Thẩm Mỹ Chỉnh Điện 3 Động Cơ Cao Cấp Hi-Tech S3', N'giuong-tiem-tham-my-chinh-dien-3-dong-co-hi-tech-s3', N'cat-1', N'DaiLy Spa', 15800000, 13900000, N'Mẫu giường tiêm filler, botox và phẫu thuật thẩm mỹ bán chạy số 1. Trang bị 3 động cơ điện tử tiêu chuẩn CE độc lập nâng hạ chiều cao, tựa lưng và phần chân cực êm ái. Bọc da PU y tế kháng khuẩn, đệm mút D40 đúc nguyên khối chống lún bền bỉ.', N'["3 động cơ điện tử độc lập siêu êm tiêu chuẩn CE Châu Âu","Điều khiển remote cầm tay đa chức năng linh hoạt","Tải trọng tĩnh 300kg, tải trọng nâng động 200kg","Da PU y tế cao cấp kháng khuẩn, chống thấm cồn sát khuẩn","Gối đầu tháo rời để lộ lỗ thở silicon khi úp mặt","Bảo hành động cơ chính hãng 24 tháng tận nơi"]', 4.9, 42, 86, 1, 1, 1, N'ACTIVE', N'2025-01-10T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-1-0', N'prod-1', N'/images/products/giuong-tiem-dien.jpg', 1, 0);
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-1-1', N'prod-1', N'/images/products/giuong-spa-inox.jpg', 0, 1);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-101', N'prod-1', N'190x65cm', N'Trắng Sữa', N'#F5F5F0', 15, NULL, N'MS-S3-WHT', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-102', N'prod-1', N'190x65cm', N'Đen Sang Trọng', N'#1E1E1E', 12, NULL, N'MS-S3-BLK', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-103', N'prod-1', N'190x65cm', N'Xám Ghi', N'#808080', 8, NULL, N'MS-S3-GRY', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-10', N'Giường Vali Chân Gỗ Gấp Gọn 3 Khúc Kèm Tựa Tay & Tựa Đầu Rời', N'giuong-vali-chan-go-gap-gon-3-khuc', N'cat-5', N'DaiLy Spa', 2400000, 2050000, N'Giường vali chân gỗ sồi sang trọng có thể nâng phần chân tạo tư thế nằm thư giãn, trang bị đầy đủ bộ tựa tay bên hông, giá đỡ mặt rời và túi xách vải dù cao cấp chống bám bụi.', N'["Khung chân gỗ sồi sang trọng tự nhiên","Thiết kế 3 khúc nâng đầu và nâng chân linh hoạt","Tặng kèm bộ giá đỡ mặt, gối chữ U và tựa tay rời","Gấp lại thành vali có khóa chốt cài an toàn"]', 4.9, 31, 88, 0, 1, 0, N'ACTIVE', N'2025-01-15T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-10-0', N'prod-10', N'/images/products/giuong-vali-gap.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1001', N'prod-10', N'185x70cm', N'Nâu Gỗ', N'#A0522D', 25, NULL, N'MS-VALI3-BRN', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1002', N'prod-10', N'185x70cm', N'Trắng Kem', N'#FFF8DC', 30, NULL, N'MS-VALI3-WHT', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-11', N'Ghế Giường Xoay Phun Xăm & Nối Mi Đa Năng Chỉnh Cơ Tattoo-Bed 360', N'ghe-giuong-xoay-phun-xam-noi-mi-da-nang-tattoo-bed-360', N'cat-6', N'DaiLy Spa', 3500000, 2990000, N'Mẫu ghế giường xoay 360 độ chuyên dụng cho tiệm phun xăm thẩm mỹ, nối mi và chăm sóc da mặt. Chân trụ mâm mạ crom sáng bóng, nâng hạ ben hơi thủy lực êm ru, tựa lưng ngả phẳng 180 độ.', N'["Xoay tròn 360 độ có khóa hãm cố định vị trí","Ben hơi thủy lực nâng hạ độ cao bằng bàn đạp chân","Ngả lưng và nâng chân độc lập từ ghế ngồi thành giường phẳng","Đệm mút đúc dày 12cm không xẹp lún","Tay vịn tháo lắp dễ dàng"]', 4.8, 45, 96, 1, 0, 0, N'ACTIVE', N'2025-01-09T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-11-0', N'prod-11', N'/images/products/ghe-phun-xam.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1101', N'prod-11', N'180x65cm', N'Đen Da Mờ', N'#1F1F1F', 18, NULL, N'MS-TAT-BLK', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1102', N'prod-11', N'180x65cm', N'Trắng Tinh Khôi', N'#FDFDFD', 14, NULL, N'MS-TAT-WHT', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-12', N'Giường Tiêm Thẩm Mỹ Chỉnh Điện 1 Động Cơ Nâng Hạ Chiều Cao', N'giuong-tiem-tham-my-chinh-dien-1-dong-co', N'cat-1', N'DaiLy Spa', 9800000, 8600000, N'Giường tiêm giá tốt trang bị 1 động cơ điện tử nâng hạ chiều cao tự động từ 60cm đến 85cm bằng remote, tựa lưng và chân chỉnh bằng cơ tay tiện dụng, tiết kiệm điện năng và kinh tế.', N'["1 động cơ điện tử nâng hạ độ cao nhẹ nhàng","Tựa lưng chỉnh góc từ 0 đến 75 độ","Chân đế sắt bọc ốp nhựa ABS thẩm mỹ","Bọc da PU cao cấp chống thấm"]', 4.8, 17, 62, 0, 0, 1, N'ACTIVE', N'2025-01-11T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-12-0', N'prod-12', N'/images/products/giuong-tiem-dien.jpg', 1, 0);
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-12-1', N'prod-12', N'/images/products/giuong-spa-inox.jpg', 0, 1);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1201', N'prod-12', N'185x65cm', N'Trắng Sữa', N'#F5F5F0', 16, NULL, N'MS-1M-WHT', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1202', N'prod-12', N'185x65cm', N'Đen', N'#000000', 12, NULL, N'MS-1M-BLK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-13', N'Giường Massage Trị Liệu Đá Muối Himalaya Đèn Hồng Ngoại', N'giuong-massage-tri-lieu-da-muoi-himalaya', N'cat-3', N'DaiLy Spa', 8500000, 7500000, N'Thiết kế cao cấp lót 24 viên đá muối Himalaya nguyên khối dưới lưng nằm, tích hợp hệ thống gia nhiệt đèn hồng ngoại sưởi ấm lưu thông khí huyết cho spa Đông Y và trung tâm chăm sóc sức khỏe.', N'["24 viên đá muối khoáng Himalaya nguyên khối tự nhiên","Hệ thống điều khiển nhiệt độ điện tử an toàn tuyệt đối","Khung gỗ thông tự nhiên cách nhiệt tốt","Tác dụng đào thải độc tố và xoa dịu đau mỏi cột sống"]', 5, 14, 30, 1, 1, 0, N'ACTIVE', N'2025-01-16T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-13-0', N'prod-13', N'/images/products/giuong-massage-go.png', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1301', N'prod-13', N'190x75cm', N'Nâu Trầm Sang Trọng', N'#4E3629', 8, NULL, N'MS-HIMA-BRN', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-14', N'Giường Gội Đầu Dưỡng Sinh Mini Tiết Kiệm Diện Tích Bồn Nhựa ABS', N'giuong-goi-dau-duong-sinh-mini-bon-nhua-abs', N'cat-2', N'DaiLy Spa', 3200000, 2750000, N'Giải pháp cho salon tóc và spa diện tích nhỏ. Chiều dài chỉ 175cm, bồn gội nhựa ABS siêu bền chống nứt vỡ, đệm êm ái xả nước nhanh chóng, dễ dàng lắp đặt.', N'["Chiều dài tối ưu 175cm vừa vặn phòng nhỏ","Bồn gội nhựa ABS đúc nguyên khối chống va đập","Ống thoát nước ren xoắn thoát nước cực nhanh","Đệm simili cao cấp không đọng nước"]', 4.6, 20, 78, 0, 0, 1, N'ACTIVE', N'2025-01-07T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-14-0', N'prod-14', N'/images/products/giuong-goi-duong-sinh.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1401', N'prod-14', N'175x65cm', N'Đen', N'#111111', 22, NULL, N'MS-MINI-BLK', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1402', N'prod-14', N'175x65cm', N'Xám Tro', N'#708090', 18, NULL, N'MS-MINI-GRY', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-15', N'Giường Chỉnh Hình Trị Liệu Chiropractic Thả Đoạn Tự Động', N'giuong-chinh-hinh-tri-lieu-chiropractic', N'cat-3', N'DaiLy Spa', 22000000, 19800000, N'Giường nắn chỉnh xương khớp chuyên sâu chuẩn y khoa Chiropractic. Cơ chế thả đoạn Drop Piece chính xác hỗ trợ trị liệu thoái hóa cột sống cổ, ngực và thắt lưng hiệu quả cao.', N'["Cơ chế thả đoạn Drop Piece chuẩn y khoa Hoa Kỳ","Điều chỉnh lực căng lò xo theo cân nặng từng bệnh nhân","Khung thép đặc đúc chịu lực tải trên 400kg","Đệm mút chuyên dụng y tế không gây tổn thương mô mềm"]', 5, 9, 18, 1, 1, 0, N'ACTIVE', N'2025-01-18T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-15-0', N'prod-15', N'/images/products/giuong-massage-go.png', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1501', N'prod-15', N'180x55cm', N'Đen Y Tế', N'#1A1A1A', 5, NULL, N'MS-CHIRO-BLK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-16', N'Ghế Spa Thư Giãn Pedicure Bồn Ngâm Chân Massage Thủy Lực', N'ghe-spa-pedicure-ngam-chan-thuy-luc', N'cat-6', N'DaiLy Spa', 12500000, 11200000, N'Ghế làm móng và ngâm chân dưỡng sinh thư giãn cao cấp cho tiệm nail & spa. Bồn ngâm sục massage nước nam châm từ tính, đèn LED đổi màu, ghế ngả lưng có con lăn massage lưng thư giãn.', N'["Bồn sục thủy lực nam châm chống tràn nước","Hệ thống con lăn massage lưng đa điểm","Đèn LED 7 màu trị liệu ánh sáng trong bồn ngâm","Bọc da PU cao cấp chống bám hóa chất acetone"]', 4.9, 19, 42, 0, 0, 0, N'ACTIVE', N'2025-01-13T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-16-0', N'prod-16', N'/images/products/ghe-phun-xam.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1601', N'prod-16', N'140x70cm', N'Trắng Vàng Gold', N'#F5E6D3', 7, NULL, N'MS-PEDI-GLD', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-1602', N'prod-16', N'140x70cm', N'Đen Sang Trọng', N'#1C1C1C', 6, NULL, N'MS-PEDI-BLK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-2', N'Giường Tiêm Thẩm Mỹ Chỉnh Điện 4 Động Cơ Luxury Master 4M', N'giuong-tiem-tham-my-chinh-dien-4-dong-co-luxury-master-4m', N'cat-1', N'DaiLy Spa', 19500000, 17500000, N'Dòng giường phẫu thuật tạo hình và tiêm thẩm mỹ 5 sao. Tích hợp 4 động cơ điện tử công nghệ Đức hỗ trợ nghiêng toàn thân góc Trendelenburg 15 độ, bọc da Microfiber cao cấp mềm mại như da thật.', N'["4 động cơ điện tử mạnh mẽ đạt chuẩn phòng mổ quốc tế","Chức năng nghiêng toàn thân Trendelenburg hỗ trợ tuần hoàn máu","Đệm bọt biển mật độ cao đàn hồi tuyệt hảo không xẹp lún","Tay vịn hạ tự động theo góc ngả lưng","Tải trọng tối đa 350kg"]', 5, 28, 45, 1, 1, 0, N'ACTIVE', N'2025-01-12T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-2-0', N'prod-2', N'/images/products/giuong-tiem-dien.jpg', 1, 0);
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-2-1', N'prod-2', N'/images/products/giuong-spa-inox.jpg', 0, 1);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-201', N'prod-2', N'195x70cm', N'Trắng Sữa', N'#F5F5F0', 10, NULL, N'MS-4M-WHT', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-202', N'prod-2', N'195x70cm', N'Nâu Bò Cao Cấp', N'#8B4513', 6, NULL, N'MS-4M-BRN', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-3', N'Giường Gội Đầu Dưỡng Sinh Tai Thỏ Bồn Sứ Vòm Tuần Hoàn Nước', N'giuong-goi-dau-duong-sinh-tai-tho-bon-su-vom-tuan-hoan', N'cat-2', N'DaiLy Spa', 5800000, 4950000, N'Giường gội đầu dưỡng sinh 2 trong 1 tích hợp vòm tuần hoàn nước ấm massage da đầu thư giãn trị liệu. Bồn gội tai thỏ chất liệu sứ tráng men nano chống ố vàng, kèm kệ để dầu gội và đệm bọc da chống thấm nước.', N'["Bồn sứ tai thỏ cao cấp tráng men tuyết chống ố vàng","Vòm tuần hoàn nước massage da đầu bằng inox 304 không rỉ","Gối đỡ cổ silicon mềm mại không gây đau mỏi gáy","Hệ thống vòi sen nóng lạnh tăng áp tiện dụng","Nắp đậy bồn gội biến thành giường massage body phẳng tiện lợi"]', 4.8, 35, 110, 1, 0, 1, N'ACTIVE', N'2025-01-08T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-3-0', N'prod-3', N'/images/products/giuong-goi-duong-sinh.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-301', N'prod-3', N'200x68cm', N'Nâu Cà Phê', N'#4A2E18', 20, NULL, N'MS-GDS-CFE', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-302', N'prod-3', N'200x68cm', N'Đen Nhám', N'#222222', 15, NULL, N'MS-GDS-BLK', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-303', N'prod-3', N'200x68cm', N'Be Kem', N'#D2B48C', 18, NULL, N'MS-GDS-BGE', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-4', N'Giường Gội Dưỡng Sinh Thùng Xông Đầu Gỗ Tuyết Tùng Thảo Dược', N'giuong-goi-duong-sinh-thung-xong-dau-go-tuyet-tung', N'cat-2', N'DaiLy Spa', 7200000, 6400000, N'Thiết kế cao cấp độc quyền kết hợp thùng xông đầu thảo dược bằng gỗ tuyết tùng tỏa hương thơm ngát tự nhiên. Hỗ trợ giảm đau nửa đầu, lưu thông khí huyết và trị liệu chứng mất ngủ cho khách hàng.', N'["Thùng xông hơi đầu gỗ tuyết tùng nguyên khối tự nhiên","Nồi xông hơi thông minh 2L điều chỉnh nhiệt độ và thời gian","Bồn gội tai thỏ phủ nano chống trầy xước","Khung giường gỗ tràm chịu lực 300kg"]', 4.9, 22, 54, 0, 1, 0, N'ACTIVE', N'2025-01-14T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-4-0', N'prod-4', N'/images/products/giuong-goi-duong-sinh.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-401', N'prod-4', N'205x70cm', N'Gỗ Tự Nhiên', N'#8B5A2B', 10, NULL, N'MS-XONG-NAT', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-402', N'prod-4', N'205x70cm', N'Nâu Trầm', N'#3E2723', 8, NULL, N'MS-XONG-DK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-5', N'Giường Massage Body Khung Gỗ Sồi Tự Nhiên Cao Cấp Oak-Royal', N'giuong-massage-body-khung-go-soi-tu-nhien-oak-royal', N'cat-3', N'DaiLy Spa', 4200000, 3690000, N'Khung giường gỗ sồi tự nhiên nhập khẩu sấy tẩm công nghệ cao chống co ngót cong vênh. Mộng ghép khóa đôi vững chãi, đệm mút D40 dày 10cm êm ái bọc da PU bóng bẩy, có lỗ thở chuẩn spa massage trị liệu.', N'["Khung 100% gỗ sồi tự nhiên chịu tải 350kg","Mộng gỗ truyền thống không rung lắc khi thao tác lực mạnh","Đệm mút D40 đúc nguyên khối chống xẹp lún","Khoét lỗ thở úp mặt bọc viền da êm ái","Kệ đan nan gỗ bên dưới để khăn và dầu massage"]', 4.9, 51, 140, 1, 0, 1, N'ACTIVE', N'2025-01-05T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-5-0', N'prod-5', N'/images/products/giuong-massage-go.png', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-501', N'prod-5', N'190x80cm', N'Nâu Cà Phê', N'#5C4033', 25, NULL, N'MS-OAK-CFE', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-502', N'prod-5', N'190x80cm', N'Trắng Kem', N'#FFF8DC', 20, NULL, N'MS-OAK-WHT', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-503', N'prod-5', N'190x80cm', N'Đen Huyền', N'#1A1A1A', 18, NULL, N'MS-OAK-BLK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-6', N'Giường Massage Gỗ Tràm Sơn PU Đệm Dày 10cm Chuyên Dụng Spa', N'giuong-massage-go-tram-son-pu-dem-day-10cm', N'cat-3', N'DaiLy Spa', 2800000, 2450000, N'Lựa chọn tiết kiệm chi phí số 1 cho các spa, thẩm mỹ viện mới setup. Khung gỗ tràm chắc nịch sơn PU 3 lớp bóng bẩy, chân vuông 10x10cm có thanh giằng ngang chịu lực cao, độ bền trên 10 năm.', N'["Khung gỗ tràm tự nhiên sơn PU màu cánh gián / đen","Chân vuông 10x10cm cứng cáp","Đệm mút xốp ép tỷ trọng cao bọc simili chống thấm","Kích thước chuẩn nhân trắc học Á Đông"]', 4.7, 38, 95, 0, 0, 0, N'ACTIVE', N'2025-01-06T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-6-0', N'prod-6', N'/images/products/giuong-massage-go.png', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-601', N'prod-6', N'185x75cm', N'Nâu Cánh Gián', N'#8B3A3A', 30, NULL, N'MS-TRAM-CG', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-602', N'prod-6', N'185x75cm', N'Đen', N'#000000', 25, NULL, N'MS-TRAM-BLK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-7', N'Giường Spa Khung Sắt Sơn Tĩnh Điện Chân Tròn Kệ Khăn Pro-Iron', N'giuong-spa-khung-sat-son-tinh-dien-pro-iron', N'cat-4', N'DaiLy Spa', 1850000, 1590000, N'Khung sắt ống phi 42 dày 1.4mm sơn tĩnh điện chống rỉ sét, có tầng để khăn và dụng cụ thẩm mỹ bên dưới. Đệm bọc da simili cao cấp có lỗ úp mặt thoáng khí, gọn gàng và bền bỉ.', N'["Khung sắt ống tròn phi 42 sơn tĩnh điện bền màu","Tầng kệ lưới để đồ rộng rãi tiện dụng","Đệm dày 8cm bọc da chống trầy xước","Chân bọc nút cao su chống trơn trượt sàn gạch"]', 4.7, 19, 120, 0, 0, 1, N'ACTIVE', N'2025-01-07T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-7-0', N'prod-7', N'/images/products/giuong-spa-inox.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-701', N'prod-7', N'180x60cm', N'Trắng Sữa', N'#FAFAFA', 40, NULL, N'MS-IRON-WHT', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-702', N'prod-7', N'180x60cm', N'Đen Mờ', N'#282828', 35, NULL, N'MS-IRON-BLK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-8', N'Giường Spa Khung Inox 304 Nâng Đầu Cơ Học Chống Gỉ Tuyệt Đối', N'giuong-spa-khung-inox-304-nang-dau-co-hoc', N'cat-4', N'DaiLy Spa', 2600000, 2290000, N'Khung inox 304 sáng bóng vĩnh viễn không hoen rỉ, đầu giường trang bị thanh răng trợ lực nâng gập từ 0 đến 60 độ, phù hợp chăm sóc da mặt, nối mi, tiêm filler và massage cổ vai gáy.', N'["Inox 304 chuẩn y tế dày 1.2mm sáng bóng","Cơ cấu nâng đầu cơ học 5 nấc điều chỉnh","Đệm mút êm ái chống thấm nước và dung dịch sát khuẩn","Dễ dàng vệ sinh lau chùi"]', 4.8, 26, 88, 0, 1, 0, N'ACTIVE', N'2025-01-11T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-8-0', N'prod-8', N'/images/products/giuong-spa-inox.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-801', N'prod-8', N'185x70cm', N'Trắng', N'#FFFFFF', 22, NULL, N'MS-INX-WHT', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-802', N'prod-8', N'185x70cm', N'Hồng Pastel', N'#FFB6C1', 15, NULL, N'MS-INX-PNK', GETDATE());
INSERT INTO dbo.products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at) VALUES (N'prod-9', N'Giường Vali Gấp Gọn Chân Hợp Kim Nhôm Siêu Nhẹ 12kg Mobile-Bed', N'giuong-vali-gap-gon-chan-nhom-sieu-nhe-12kg-mobile-bed', N'cat-5', N'DaiLy Spa', 1950000, 1650000, N'Giường spa xếp gọn dạng vali tiện lợi nhất cho thợ làm đẹp di động. Chân hợp kim nhôm máy bay siêu nhẹ chỉ nặng 12kg nhưng chịu tải trọng tới 200kg, gập lại chỉ bằng một chiếc vali du lịch.', N'["Chân hợp kim nhôm siêu nhẹ, trọng lượng toàn giường chỉ 12kg","Xếp gọn 2 khúc nhanh chóng trong 30 giây","Chịu tải trọng tĩnh lên đến 200kg","Dây cáp chịu lực bằng thép không gỉ gia cường","Tặng kèm túi xách dù có quai đeo vai tiện lợi"]', 4.8, 64, 230, 1, 0, 1, N'ACTIVE', N'2025-01-04T00:00:00.000Z', GETDATE());
INSERT INTO dbo.product_images (id, product_id, image_url, is_primary, display_order) VALUES (N'img-prod-9-0', N'prod-9', N'/images/products/giuong-vali-gap.jpg', 1, 0);
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-901', N'prod-9', N'180x60cm', N'Đen Tuyền', N'#111111', 50, NULL, N'MS-VALI-BLK', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-902', N'prod-9', N'180x60cm', N'Hồng Baby', N'#FFC0CB', 35, NULL, N'MS-VALI-PNK', GETDATE());
INSERT INTO dbo.product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at) VALUES (N'v-903', N'prod-9', N'180x60cm', N'Xanh Dương Nhạt', N'#ADD8E6', 20, NULL, N'MS-VALI-BLU', GETDATE());
GO

-- 3.4. Coupons
INSERT INTO dbo.coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, start_date, end_date, status, created_at) VALUES (N'coup-1', N'SETUP500', N'Giảm ngay 500.000đ cho đơn hàng mua giường từ 5.000.000đ', N'FIXED', 500000, 5000000, 500000, 200, 38, N'2025-01-01', N'2026-12-31', N'ACTIVE', GETDATE());
INSERT INTO dbo.coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, start_date, end_date, status, created_at) VALUES (N'coup-2', N'SPA10', N'Giảm 10% tối đa 1.500.000đ cho đơn hàng setup từ 10.000.000đ', N'PERCENT', 10, 10000000, 1500000, 100, 19, N'2025-01-01', N'2026-12-31', N'ACTIVE', GETDATE());
INSERT INTO dbo.coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, start_date, end_date, status, created_at) VALUES (N'coup-3', N'FREESHIP', N'Miễn phí vận chuyển và lắp đặt giường spa toàn quốc', N'FIXED', 150000, 3000000, 150000, 500, 92, N'2025-01-01', N'2026-12-31', N'ACTIVE', GETDATE());
GO

-- 3.5. Banners
INSERT INTO dbo.banners (id, title, subtitle, badge, link, image, button_text, position, display_order, active, created_at) VALUES (N'ban-1', N'BST GIƯỜNG SPA & THIẾT BỊ THẨM MỸ CAO CẤP 2025', N'Đỉnh cao thư giãn & chuẩn mực an toàn y khoa cho spa, viện thẩm mỹ và clinic 5 sao trên toàn quốc.', N'CHÍNH HÃNG DAILY SPA', N'/products', N'/images/products/giuong-tiem-dien.jpg', N'Khám Phá Danh Mục Giường', N'HERO', 1, 1, GETDATE());
INSERT INTO dbo.banners (id, title, subtitle, badge, link, image, button_text, position, display_order, active, created_at) VALUES (N'ban-2', N'GIƯỜNG TIÊM ĐIỆN 3 - 4 ĐỘNG CƠ: NÂNG TẦM ĐẲNG CẤP CLINIC', N'Động cơ siêu êm chuẩn CE, bọc da PU y tế kháng khuẩn, ngả nghiêng đa góc, bảo hành 24 tháng tận giường.', N'BÁN CHẠY NHẤT', N'/category/giuong-tiem-tham-my', N'/images/products/giuong-goi-duong-sinh.jpg', N'Xem Giường Tiêm Điện', N'HERO', 2, 1, GETDATE());
INSERT INTO dbo.banners (id, title, subtitle, badge, link, image, button_text, position, display_order, active, created_at) VALUES (N'ban-3', N'COMBO GIƯỜNG GỘI DƯỠNG SINH TAI THỎ VÒM NƯỚC TUẦN HOÀN', N'Tặng kèm trọn bộ phụ kiện xông đầu thảo dược và vòi vòm massage nước nóng khi đặt hàng trong tuần này.', N'ƯU ĐÃI SETUP TRỌN GÓI', N'/category/giuong-goi-duong-sinh', N'/images/products/giuong-massage-go.png', N'Xem Giường Gội Dưỡng Sinh', N'HERO', 3, 1, GETDATE());
GO

-- 3.6. Orders & Order Items
INSERT INTO dbo.orders (id, order_code, user_id, customer_name, customer_email, customer_phone, shipping_address, province, district, ward, note, subtotal, shipping_fee, discount_amount, total_amount, coupon_code, payment_method, payment_status, order_status, created_at, updated_at) VALUES (N'ord-1001', N'ORD-250101', N'usr-cust-1', N'Nguyễn Thúy Vy (Aesthetic Clinic)', N'khachhang@example.com', N'0918765432', N'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22', N'Hồ Chí Minh', N'Quận Bình Thạnh', N'Phường 22', N'Giao tầng 12, có thang máy chuyển hàng, lắp đặt hoàn thiện giúp mình', 13900000, 0, 500000, 13400000, N'SETUP500', N'BANK_TRANSFER', N'PAID', N'DELIVERED', N'2025-01-18T10:30:00.000Z', N'2025-01-20T15:00:00.000Z');
INSERT INTO dbo.order_items (id, order_id, product_id, variant_id, product_name, size, color, price, quantity, total, image_url) VALUES (N'item-1', N'ord-1001', N'prod-1', NULL, N'Giường Tiêm Thẩm Mỹ Chỉnh Điện 3 Động Cơ Cao Cấp Hi-Tech S3', N'190x65cm', N'Trắng Sữa', 13900000, 1, 13900000, N'/images/products/giuong-tiem-dien.jpg');
INSERT INTO dbo.orders (id, order_code, user_id, customer_name, customer_email, customer_phone, shipping_address, province, district, ward, note, subtotal, shipping_fee, discount_amount, total_amount, coupon_code, payment_method, payment_status, order_status, created_at, updated_at) VALUES (N'ord-1002', N'ORD-250102', N'usr-cust-2', N'Lê Minh Tuấn (Spa Dưỡng Sinh)', N'minhtuan@gmail.com', N'0987654321', N'Số 45 Tràng Tiền, Phường Tràng Tiền', N'Hà Nội', N'Quận Hoàn Kiếm', N'Phường Tràng Tiền', N'Gọi trước 30 phút để chuẩn bị phòng lắp ráp', 9900000, 0, 990000, 8910000, N'SPA10', N'BANK_TRANSFER', N'PAID', N'PROCESSING', N'2025-01-21T09:15:00.000Z', N'2025-01-21T11:00:00.000Z');
INSERT INTO dbo.order_items (id, order_id, product_id, variant_id, product_name, size, color, price, quantity, total, image_url) VALUES (N'item-2', N'ord-1002', N'prod-3', NULL, N'Giường Gội Đầu Dưỡng Sinh Tai Thỏ Bồn Sứ Vòm Tuần Hoàn Nước', N'200x68cm', N'Nâu Cà Phê', 4950000, 2, 9900000, N'/images/products/giuong-goi-duong-sinh.jpg');
INSERT INTO dbo.orders (id, order_code, user_id, customer_name, customer_email, customer_phone, shipping_address, province, district, ward, note, subtotal, shipping_fee, discount_amount, total_amount, coupon_code, payment_method, payment_status, order_status, created_at, updated_at) VALUES (N'ord-1003', N'ORD-250103', N'usr-cust-3', N'Phạm Phương Linh', N'phuonglinh@gmail.com', N'0933221100', N'124 Nguyễn Văn Linh, Phường Nam Dương', N'Đà Nẵng', N'Quận Hải Châu', N'Phường Nam Dương', N'Giao giờ hành chính', 3690000, 0, 0, 3690000, NULL, N'COD', N'PENDING', N'PENDING', N'2025-01-22T14:40:00.000Z', N'2025-01-22T14:40:00.000Z');
INSERT INTO dbo.order_items (id, order_id, product_id, variant_id, product_name, size, color, price, quantity, total, image_url) VALUES (N'item-3', N'ord-1003', N'prod-5', NULL, N'Giường Massage Body Khung Gỗ Sồi Tự Nhiên Cao Cấp Oak-Royal', N'190x80cm', N'Trắng Kem', 3690000, 1, 3690000, N'/images/products/giuong-massage-go.png');
GO

-- 3.7. Reviews
INSERT INTO dbo.reviews (id, product_id, user_id, user_name, user_avatar, rating, comment, images, status, created_at) VALUES (N'rev-1', N'prod-1', N'usr-cust-1', N'Bác sĩ Thúy Vy (Aesthetic Clinic Q1)', N'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 5, N'Phòng khám mình vừa setup 4 chiếc giường tiêm điện S3 của DaiLy Giường Spa. Động cơ nâng hạ cực êm không hề rung lắc, da PU lau cồn thoải mái không sợ bong tróc. Khách hàng khen nằm rất êm lưng!', N'[]', N'APPROVED', N'2025-01-18T10:00:00.000Z');
INSERT INTO dbo.reviews (id, product_id, user_id, user_name, user_avatar, rating, comment, images, status, created_at) VALUES (N'rev-2', N'prod-3', N'usr-cust-2', N'Chị Minh Tuấn (Chủ Spa Dưỡng Sinh Hà Nội)', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 5, N'Bồn sứ trắng sáng bóng, vòm tuần hoàn nước chảy đều và êm ru. Khách đến gội đầu dưỡng sinh ngủ say sưa luôn. Giao hàng lắp đặt tận nơi rất nhiệt tình.', N'[]', N'APPROVED', N'2025-01-20T14:30:00.000Z');
INSERT INTO dbo.reviews (id, product_id, user_id, user_name, user_avatar, rating, comment, images, status, created_at) VALUES (N'rev-3', N'prod-5', N'usr-cust-3', N'Phương Linh (Quản Lý Resort & Spa Đà Nẵng)', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 5, N'Gỗ sồi nặng trịch và chắc chắn tuyệt đối, kỹ thuật viên nhấn lực body mạnh mà giường không hề kêu cót két. Đệm dày nằm rất thích. Đáng tiền!', N'[]', N'APPROVED', N'2025-01-22T09:15:00.000Z');
INSERT INTO dbo.reviews (id, product_id, user_id, user_name, user_avatar, rating, comment, images, status, created_at) VALUES (N'rev-4', N'prod-9', N'usr-cust-1', N'Hồng Ánh (Master Phun Xăm)', N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 5, N'Mình hay đi làm phun xăm tận nhà cho khách VIP, chiếc giường vali chân nhôm này nhẹ tênh xách lên cốp xe ô tô gọn gàng. Mở ra trong 30 giây là xong.', N'[]', N'APPROVED', N'2025-01-25T11:20:00.000Z');
GO

-- 3.8. Store Settings
INSERT INTO dbo.store_settings (id, store_name, phone, email, address, opening_hours, shipping_fee_standard, free_shipping_threshold, bank_name, bank_account_number, bank_account_name, updated_at) VALUES (N'main-settings', N'DaiLy Giường Spa - Hệ Thống Giường Spa & Thiết Bị Thẩm Mỹ', N'1900 6868', N'contact@dailygiuongspa.vn', N'158 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', N'08:00 - 21:00 (Mở cửa tất cả các ngày trong tuần)', 150000, 5000000, N'Techcombank (Ngân hàng TMCP Kỹ thương Việt Nam)', N'19036888999888', N'CONG TY TNHH DAILY GIUONG SPA', GETDATE());
GO

GO
PRINT N'======================================================';
PRINT N'HOAN TAT KHOI TAO CO SO DU LIEU MAISON FASHION VA SEED DATA THANH CONG!';
PRINT N'======================================================';
GO
