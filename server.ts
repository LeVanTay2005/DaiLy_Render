import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Body Parsers with generous size limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets from public/ folder with caching headers for smooth delivery
app.use(express.static(path.join(process.cwd(), 'public'), { maxAge: '1d' }));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images'), { maxAge: '7d' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), { maxAge: '30d' }));

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

// Phase 1.3 — Image Upload Endpoint with SHA-256 Deduplication (Khử trùng lặp file)
app.post('/api/upload', authenticateToken, requireAdmin, (req: any, res: Response) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp dữ liệu hình ảnh' });
    }

    // Check if input is Base64 data URL
    const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) {
      // If it's already a URL (e.g. Unsplash or external CDN), return as-is
      return res.json({
        success: true,
        url: image,
        name: name || 'uploaded-image',
        isDuplicate: false,
      });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Calculate SHA-256 Checksum (Fingerprint)
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // 2. Check if identical file already exists in database (Deduplication)
    const existingFile = db.findFileByHash(fileHash);
    if (existingFile) {
      return res.json({
        success: true,
        url: existingFile.url,
        fileName: existingFile.fileName,
        originalName: existingFile.originalName,
        size: existingFile.size,
        fileHash,
        isDuplicate: true,
        message: 'Khử trùng lặp: File này đã tồn tại trên hệ thống, tái sử dụng URL cũ để tiết kiệm dung lượng ổ cứng!',
      });
    }

    // 3. Determine file extension
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('svg')) ext = 'svg';

    // 4. Save to disk in public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${fileHash.slice(0, 16)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    // 5. Store record in database
    const stored = db.saveStoredFile({
      fileName,
      originalName: name || fileName,
      mimeType,
      size: buffer.length,
      url: publicUrl,
      fileHash,
      uploadedBy: req.user?.name || 'Admin',
    });

    return res.status(201).json({
      success: true,
      url: publicUrl,
      fileName,
      size: buffer.length,
      fileHash,
      isDuplicate: false,
      message: 'Tải ảnh lên thành công!',
      data: stored,
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
  const isRunningFromDist = Boolean(process.argv[1]?.includes('dist') || process.argv[1]?.endsWith('server.cjs'));
  const isProduction = process.env.NODE_ENV === 'production' || isRunningFromDist;

  if (!isProduction) {
    // Vite middleware for development (chỉ dùng khi chạy tsx server.ts)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files (phục vụ giao diện React đã build)
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : (typeof __dirname !== 'undefined' ? __dirname : path.join(process.cwd(), 'dist'));
    console.log(`[DaiLy Giuong Spa] Kích hoạt chế độ Production, phục vụ giao diện từ: ${distPath}`);
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
