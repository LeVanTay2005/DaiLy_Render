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

dotenv.config();

const app = express();
const PORT = 3000;

// Body Parsers with generous size limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'Maison Fashion E-Commerce',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
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
    console.log(`[Maison Fashion] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
