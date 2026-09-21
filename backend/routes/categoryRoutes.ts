import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const categories = db.listCategories();
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh mục', error: error.message });
  }
});

router.get('/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cat = db.listCategories().find(c => c.slug === slug || c.id === slug);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    return res.json({ success: true, data: cat });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải thông tin danh mục', error: error.message });
  }
});

export default router;
