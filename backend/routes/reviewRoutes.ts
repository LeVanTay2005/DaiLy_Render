import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/reviews/:productId
router.get('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = db.listReviews(productId);
    return res.json({ success: true, data: reviews });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải đánh giá sản phẩm', error: error.message });
  }
});

// POST /api/reviews (Customer submits review)
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment, images } = req.body;
    const user = req.user!;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ số sao và nội dung đánh giá' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Đánh giá phải từ 1 đến 5 sao' });
    }

    const product = db.findProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const newReview = db.createReview({
      productId,
      productName: product.name,
      userId: user.id,
      userName: user.name,
      rating: numRating,
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Gửi đánh giá thành công! Cảm ơn bạn đã phản hồi.',
      data: newReview,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi gửi đánh giá', error: error.message });
  }
});

export default router;
