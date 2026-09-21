import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/banners (Active banners for storefront)
router.get('/', (req: Request, res: Response) => {
  try {
    const banners = db.listBanners(true);
    return res.json({ success: true, data: banners });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách banner', error: error.message });
  }
});

export default router;
