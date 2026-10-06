import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './backend/routes/authRoutes.js';
import productRoutes from './backend/routes/productRoutes.js';
import categoryRoutes from './backend/routes/categoryRoutes.js';
import orderRoutes from './backend/routes/orderRoutes.js';
import couponRoutes from './backend/routes/couponRoutes.js';
import bannerRoutes from './backend/routes/bannerRoutes.js';
import reviewRoutes from './backend/routes/reviewRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import { authenticateToken, requireAdmin } from './backend/middleware/auth.js';
import { poolPromise, db } from './backend/db/database.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Body Parsers with generous size limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets from public/ folder (images, logos, etc.)
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'DAILY GIƯỜNG SPA',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Database status & metrics
app.get('/api/database/status', async (_req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.json({
        success: false,
        connected: false,
        engine: 'Microsoft SQL Server',
        mode: 'JSON Fallback Storage',
        message: 'Đang hoạt động ở chế độ lưu trữ JSON dự phòng (không thể kết nối SQL Server)',
      });
    }

    const testQuery = await pool.request().query(`
      SELECT 
        @@VERSION AS version, 
        DB_NAME() AS dbName,
        (SELECT COUNT(*) FROM dbo.users) AS userCount,
        (SELECT COUNT(*) FROM dbo.products) AS productCount,
        (SELECT COUNT(*) FROM dbo.categories) AS categoryCount,
        (SELECT COUNT(*) FROM dbo.orders) AS orderCount,
        (SELECT COUNT(*) FROM dbo.reviews) AS reviewCount,
        (SELECT COUNT(*) FROM dbo.banners) AS bannerCount,
        (SELECT COUNT(*) FROM dbo.coupons) AS couponCount
    `);

    const row = testQuery.recordset[0];
    return res.json({
      success: true,
      connected: true,
      engine: 'Microsoft SQL Server',
      server: process.env.DB_SERVER || 'localhost',
      instance: process.env.DB_INSTANCE || 'SQLEXPRESS2025',
      database: row.dbName,
      serverVersion: row.version.split('\n')[0].trim(),
      counts: {
        users: row.userCount,
        products: row.productCount,
        categories: row.categoryCount,
        orders: row.orderCount,
        reviews: row.reviewCount,
        banners: row.bannerCount,
        coupons: row.couponCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, connected: false, error: err.message });
  }
});

app.post('/api/database/sync', async (_req: Request, res: Response) => {
  try {
    const success = await db.syncFromSqlServer();
    return res.json({
      success,
      message: success ? 'Đồng bộ dữ liệu từ SQL Server thành công!' : 'Không thể đồng bộ từ SQL Server',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi đồng bộ', error: err.message });
  }
});

// Image Upload Endpoint (supports Base64 data URL & quick upload)
app.post('/api/upload', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp dữ liệu hình ảnh' });
    }
    // Return image url (supports base64 data url directly or provided url)
    return res.json({
      success: true,
      url: image,
      name: name || 'uploaded-image',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải ảnh', error: err.message });
  }
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware for API
app.use('/api', (err: any, _req: Request, res: Response, _next: any) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống nội bộ máy chủ',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Vite middleware for development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DaiLy Giuong Spa] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
