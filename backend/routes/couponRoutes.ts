import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

// POST /api/coupons/validate
router.post('/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
    }

    const coupon = db.findCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.startDate > today || coupon.endDate < today) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã quá hạn sử dụng' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Mã chỉ áp dụng cho đơn hàng từ ${coupon.minOrderValue.toLocaleString('vi-VN')}đ`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return res.json({
      success: true,
      message: `Áp dụng mã giảm giá ${coupon.code} thành công`,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi kiểm tra mã giảm giá', error: error.message });
  }
});

export default router;
