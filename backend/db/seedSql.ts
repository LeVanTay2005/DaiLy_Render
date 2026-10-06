import sql from 'mssql';
import fs from 'fs';
import path from 'path';

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
  port: 1433,
};

async function seed() {
  console.log('[Seed] Đang kết nối tới SQL Server...');
  const pool = await sql.connect(sqlConfig);
  console.log('[Seed] Kết nối thành công! Đang đọc dữ liệu từ store.json...');

  const storePath = path.join(process.cwd(), 'data', 'store.json');
  if (!fs.existsSync(storePath)) {
    throw new Error(`Không tìm thấy file ${storePath}`);
  }

  const rawData = fs.readFileSync(storePath, 'utf-8');
  const store = JSON.parse(rawData);

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const request = new sql.Request(transaction);

    console.log('[Seed] Xoá dữ liệu cũ theo thứ tự khoá ngoại...');
    await request.query(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM coupon_usages;
      DELETE FROM coupons;
      DELETE FROM reviews;
      DELETE FROM cart_items;
      DELETE FROM carts;
      DELETE FROM product_variants;
      DELETE FROM product_images;
      DELETE FROM products;
      DELETE FROM categories;
      DELETE FROM banners;
      DELETE FROM admins;
      DELETE FROM users;
      DELETE FROM store_settings;
    `);

    // 1. Users
    console.log(`[Seed] Nạp ${store.users.length} người dùng...`);
    for (const u of store.users) {
      const r = new sql.Request(transaction);
      r.input('id', sql.VarChar(36), u.id);
      r.input('name', sql.NVarChar(150), u.name);
      r.input('email', sql.VarChar(150), u.email);
      r.input('password_hash', sql.VarChar(255), u.passwordHash);
      r.input('phone', sql.VarChar(20), u.phone || null);
      r.input('address', sql.NVarChar(500), u.address || null);
      r.input('avatar', sql.NVarChar(500), u.avatar || null);
      r.input('role', sql.VarChar(20), u.role);
      r.input('status', sql.VarChar(20), u.status);
      r.input('created_at', sql.DateTime2, u.createdAt ? new Date(u.createdAt) : new Date());
      r.input('updated_at', sql.DateTime2, u.updatedAt ? new Date(u.updatedAt) : new Date());

      await r.query(`
        INSERT INTO users (id, name, email, password_hash, phone, address, avatar, role, status, created_at, updated_at)
        VALUES (@id, @name, @email, @password_hash, @phone, @address, @avatar, @role, @status, @created_at, @updated_at)
      `);

      if (u.role === 'ADMIN') {
        const adminReq = new sql.Request(transaction);
        adminReq.input('id', sql.VarChar(36), `adm-${u.id}`);
        adminReq.input('user_id', sql.VarChar(36), u.id);
        adminReq.input('department', sql.NVarChar(100), 'BAN QUAN TRI');
        adminReq.input('permissions', sql.NVarChar(sql.MAX), JSON.stringify(['ALL']));
        await adminReq.query(`
          INSERT INTO admins (id, user_id, department, permissions, created_at)
          VALUES (@id, @user_id, @department, @permissions, GETDATE())
        `);
      }
    }

    // 2. Categories
    console.log(`[Seed] Nạp ${store.categories.length} danh mục sản phẩm...`);
    for (const c of store.categories) {
      const r = new sql.Request(transaction);
      r.input('id', sql.VarChar(36), c.id);
      r.input('name', sql.NVarChar(150), c.name);
      r.input('slug', sql.VarChar(150), c.slug);
      r.input('description', sql.NVarChar(sql.MAX), c.description || null);
      r.input('image', sql.NVarChar(500), c.image || null);
      await r.query(`
        INSERT INTO categories (id, name, slug, description, image, created_at)
        VALUES (@id, @name, @slug, @description, @image, GETDATE())
      `);
    }

    // 3. Products, Images & Variants
    console.log(`[Seed] Nạp ${store.products.length} sản phẩm và biến thể...`);
    for (const p of store.products) {
      const r = new sql.Request(transaction);
      r.input('id', sql.VarChar(36), p.id);
      r.input('name', sql.NVarChar(255), p.name);
      r.input('slug', sql.VarChar(255), p.slug);
      r.input('category_id', sql.VarChar(36), p.categoryId);
      r.input('brand', sql.NVarChar(100), p.brand || 'DaiLy Spa');
      r.input('price', sql.Decimal(18, 2), p.price);
      r.input('sale_price', sql.Decimal(18, 2), p.salePrice || null);
      r.input('description', sql.NVarChar(sql.MAX), p.description || null);
      r.input('details', sql.NVarChar(sql.MAX), p.details ? JSON.stringify(p.details) : null);
      r.input('rating', sql.Decimal(3, 1), p.rating || 5.0);
      r.input('review_count', sql.Int, p.reviewCount || 0);
      r.input('sold_count', sql.Int, p.soldCount || 0);
      r.input('is_featured', sql.Bit, p.isFeatured ? 1 : 0);
      r.input('is_new_arrival', sql.Bit, p.isNewArrival ? 1 : 0);
      r.input('is_flash_sale', sql.Bit, p.isFlashSale ? 1 : 0);
      r.input('status', sql.VarChar(20), p.status || 'ACTIVE');
      r.input('created_at', sql.DateTime2, p.createdAt ? new Date(p.createdAt) : new Date());
      r.input('updated_at', sql.DateTime2, new Date());

      await r.query(`
        INSERT INTO products (id, name, slug, category_id, brand, price, sale_price, description, details, rating, review_count, sold_count, is_featured, is_new_arrival, is_flash_sale, status, created_at, updated_at)
        VALUES (@id, @name, @slug, @category_id, @brand, @price, @sale_price, @description, @details, @rating, @review_count, @sold_count, @is_featured, @is_new_arrival, @is_flash_sale, @status, @created_at, @updated_at)
      `);

      // Images
      if (Array.isArray(p.images)) {
        for (let i = 0; i < p.images.length; i++) {
          const imgReq = new sql.Request(transaction);
          imgReq.input('id', sql.VarChar(36), `img-${p.id}-${i}`);
          imgReq.input('product_id', sql.VarChar(36), p.id);
          imgReq.input('image_url', sql.NVarChar(500), p.images[i]);
          imgReq.input('is_primary', sql.Bit, i === 0 ? 1 : 0);
          imgReq.input('display_order', sql.Int, i);
          await imgReq.query(`
            INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
            VALUES (@id, @product_id, @image_url, @is_primary, @display_order)
          `);
        }
      }

      // Variants
      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          const varReq = new sql.Request(transaction);
          varReq.input('id', sql.VarChar(36), v.id);
          varReq.input('product_id', sql.VarChar(36), p.id);
          varReq.input('size', sql.NVarChar(50), v.size);
          varReq.input('color', sql.NVarChar(50), v.color);
          varReq.input('color_code', sql.VarChar(20), v.colorCode || '#000000');
          varReq.input('stock', sql.Int, v.stock);
          varReq.input('price', sql.Decimal(18, 2), v.price || null);
          varReq.input('sku', sql.VarChar(100), v.sku);
          await varReq.query(`
            INSERT INTO product_variants (id, product_id, size, color, color_code, stock, price, sku, created_at)
            VALUES (@id, @product_id, @size, @color, @color_code, @stock, @price, @sku, GETDATE())
          `);
        }
      }
    }

    // 4. Coupons
    console.log(`[Seed] Nạp ${store.coupons?.length || 0} mã giảm giá...`);
    if (store.coupons) {
      for (const cp of store.coupons) {
        const r = new sql.Request(transaction);
        r.input('id', sql.VarChar(36), cp.id);
        r.input('code', sql.VarChar(50), cp.code);
        r.input('description', sql.NVarChar(255), cp.description || null);
        r.input('discount_type', sql.VarChar(20), cp.discountType);
        r.input('discount_value', sql.Decimal(18, 2), cp.discountValue);
        r.input('min_order_value', sql.Decimal(18, 2), cp.minOrderValue || 0);
        r.input('max_discount', sql.Decimal(18, 2), cp.maxDiscount || null);
        r.input('usage_limit', sql.Int, cp.usageLimit || 100);
        r.input('used_count', sql.Int, cp.usedCount || 0);
        r.input('start_date', sql.Date, new Date(cp.startDate));
        r.input('end_date', sql.Date, new Date(cp.endDate));
        r.input('status', sql.VarChar(20), cp.status || 'ACTIVE');
        await r.query(`
          INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, start_date, end_date, status, created_at)
          VALUES (@id, @code, @description, @discount_type, @discount_value, @min_order_value, @max_discount, @usage_limit, @used_count, @start_date, @end_date, @status, GETDATE())
        `);
      }
    }

    // 5. Banners
    console.log(`[Seed] Nạp ${store.banners?.length || 0} banner quảng cáo...`);
    if (store.banners) {
      for (const b of store.banners) {
        const r = new sql.Request(transaction);
        r.input('id', sql.VarChar(36), b.id);
        r.input('title', sql.NVarChar(255), b.title);
        r.input('subtitle', sql.NVarChar(sql.MAX), b.subtitle || null);
        r.input('badge', sql.NVarChar(100), b.badge || null);
        r.input('link', sql.NVarChar(255), b.link || '/');
        r.input('image', sql.NVarChar(500), b.image);
        r.input('button_text', sql.NVarChar(100), b.buttonText || 'Xem ngay');
        r.input('position', sql.VarChar(50), b.position || 'HERO');
        r.input('display_order', sql.Int, b.order || 0);
        r.input('active', sql.Bit, b.active ? 1 : 0);
        await r.query(`
          INSERT INTO banners (id, title, subtitle, badge, link, image, button_text, position, display_order, active, created_at)
          VALUES (@id, @title, @subtitle, @badge, @link, @image, @button_text, @position, @display_order, @active, GETDATE())
        `);
      }
    }

    // 6. Orders & Order Items
    console.log(`[Seed] Nạp ${store.orders?.length || 0} đơn hàng mẫu...`);
    if (store.orders) {
      for (const o of store.orders) {
        const r = new sql.Request(transaction);
        r.input('id', sql.VarChar(36), o.id);
        r.input('order_code', sql.VarChar(50), o.orderCode);
        r.input('user_id', sql.VarChar(36), o.userId || null);
        r.input('customer_name', sql.NVarChar(150), o.customerName);
        r.input('customer_email', sql.VarChar(150), o.customerEmail);
        r.input('customer_phone', sql.VarChar(20), o.customerPhone);
        r.input('shipping_address', sql.NVarChar(500), o.shippingAddress);
        r.input('province', sql.NVarChar(100), o.province);
        r.input('district', sql.NVarChar(100), o.district);
        r.input('ward', sql.NVarChar(100), o.ward);
        r.input('note', sql.NVarChar(sql.MAX), o.note || null);
        r.input('subtotal', sql.Decimal(18, 2), o.subtotal);
        r.input('shipping_fee', sql.Decimal(18, 2), o.shippingFee || 0);
        r.input('discount_amount', sql.Decimal(18, 2), o.discountAmount || 0);
        r.input('total_amount', sql.Decimal(18, 2), o.totalAmount);
        r.input('coupon_code', sql.VarChar(50), o.couponCode || null);
        r.input('payment_method', sql.VarChar(50), o.paymentMethod || 'COD');
        r.input('payment_status', sql.VarChar(50), o.paymentStatus || 'PENDING');
        r.input('order_status', sql.VarChar(50), o.orderStatus || 'PENDING');
        r.input('created_at', sql.DateTime2, o.createdAt ? new Date(o.createdAt) : new Date());
        r.input('updated_at', sql.DateTime2, o.updatedAt ? new Date(o.updatedAt) : new Date());

        await r.query(`
          INSERT INTO orders (id, order_code, user_id, customer_name, customer_email, customer_phone, shipping_address, province, district, ward, note, subtotal, shipping_fee, discount_amount, total_amount, coupon_code, payment_method, payment_status, order_status, created_at, updated_at)
          VALUES (@id, @order_code, @user_id, @customer_name, @customer_email, @customer_phone, @shipping_address, @province, @district, @ward, @note, @subtotal, @shipping_fee, @discount_amount, @total_amount, @coupon_code, @payment_method, @payment_status, @order_status, @created_at, @updated_at)
        `);

        if (Array.isArray(o.items)) {
          for (const it of o.items) {
            const itemReq = new sql.Request(transaction);
            itemReq.input('id', sql.VarChar(36), it.id);
            itemReq.input('order_id', sql.VarChar(36), o.id);
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
              INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, size, color, price, quantity, total, image_url)
              VALUES (@id, @order_id, @product_id, @variant_id, @product_name, @size, @color, @price, @quantity, @total, @image_url)
            `);
          }
        }
      }
    }

    // 7. Reviews
    console.log(`[Seed] Nạp ${store.reviews?.length || 0} đánh giá sản phẩm...`);
    if (store.reviews) {
      const userIds = new Set(store.users.map((u: any) => u.id));
      const defaultUserId = store.users[0]?.id;

      for (const rv of store.reviews) {
        const r = new sql.Request(transaction);
        r.input('id', sql.VarChar(36), rv.id);
        r.input('product_id', sql.VarChar(36), rv.productId);
        const resolvedUserId = userIds.has(rv.userId) ? rv.userId : defaultUserId;
        r.input('user_id', sql.VarChar(36), resolvedUserId);
        r.input('user_name', sql.NVarChar(150), rv.userName || null);
        r.input('user_avatar', sql.NVarChar(500), rv.userAvatar || null);
        r.input('rating', sql.Int, rv.rating);
        r.input('comment', sql.NVarChar(sql.MAX), rv.comment);
        r.input('images', sql.NVarChar(sql.MAX), rv.images ? JSON.stringify(rv.images) : null);
        r.input('status', sql.VarChar(20), rv.status || 'APPROVED');
        r.input('created_at', sql.DateTime2, rv.createdAt ? new Date(rv.createdAt) : new Date());

        await r.query(`
          INSERT INTO reviews (id, product_id, user_id, user_name, user_avatar, rating, comment, images, status, created_at)
          VALUES (@id, @product_id, @user_id, @user_name, @user_avatar, @rating, @comment, @images, @status, @created_at)
        `);
      }
    }

    // 8. Store Settings
    console.log(`[Seed] Nạp cài đặt cửa hàng...`);
    if (store.settings) {
      const s = store.settings;
      const r = new sql.Request(transaction);
      r.input('id', sql.VarChar(36), 'main-settings');
      r.input('store_name', sql.NVarChar(255), s.storeName);
      r.input('phone', sql.VarChar(50), s.phone);
      r.input('email', sql.VarChar(150), s.email);
      r.input('address', sql.NVarChar(500), s.address);
      r.input('opening_hours', sql.NVarChar(255), s.openingHours);
      r.input('shipping_fee_standard', sql.Decimal(18, 2), s.shippingFeeStandard);
      r.input('free_shipping_threshold', sql.Decimal(18, 2), s.freeShippingThreshold);
      r.input('bank_name', sql.NVarChar(255), s.bankName);
      r.input('bank_account_number', sql.VarChar(50), s.bankAccountNumber);
      r.input('bank_account_name', sql.NVarChar(255), s.bankAccountName);

      await r.query(`
        INSERT INTO store_settings (id, store_name, phone, email, address, opening_hours, shipping_fee_standard, free_shipping_threshold, bank_name, bank_account_number, bank_account_name, updated_at)
        VALUES (@id, @store_name, @phone, @email, @address, @opening_hours, @shipping_fee_standard, @free_shipping_threshold, @bank_name, @bank_account_number, @bank_account_name, GETDATE())
      `);
    }

    await transaction.commit();
    console.log('🎉 [Seed] HOÀN TẤT NẠP DỮ LIỆU VÀO SQL SERVER THÀNH CÔNG RỰC RỠ!');
  } catch (err) {
    await transaction.rollback();
    console.error('❌ [Seed] Lỗi nạp dữ liệu vào SQL Server:', err);
    throw err;
  } finally {
    await pool.close();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
