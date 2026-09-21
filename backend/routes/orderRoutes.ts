import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/orders (Create order)
router.post('/', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      province,
      district,
      ward,
      note,
      paymentMethod,
      items,
      couponCode,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !province || !district || !ward) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống' });
    }

    // Validate item stock & prices
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = db.findProductById(item.productId);
      if (!prod) {
        return res.status(400).json({ success: false, message: `Sản phẩm ${item.productName || item.productId} không tồn tại` });
      }

      if (item.variantId) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (!variant) {
          return res.status(400).json({ success: false, message: `Phân loại ${item.size} - ${item.color} của sản phẩm ${prod.name} không tồn tại` });
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm ${prod.name} (${variant.size}, ${variant.color}) chỉ còn ${variant.stock} chiếc trong kho, không đủ số lượng đặt (${item.quantity})`,
          });
        }
      }

      const unitPrice = prod.salePrice || prod.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        orderId: '',
        productId: prod.id,
        variantId: item.variantId,
        productName: prod.name,
        size: item.size || 'FreeSize',
        color: item.color || 'Tiêu chuẩn',
        price: unitPrice,
        quantity: item.quantity,
        total: itemTotal,
        imageUrl: prod.images[0] || '',
      });
    }

    // Shipping fee
    const settings = db.getSettings();
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFeeStandard;

    // Coupon calculation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.findCouponByCode(couponCode);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENT') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    const newOrder = db.createOrder({
      userId: req.user?.id,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      province,
      district,
      ward,
      note: note ? note.trim() : '',
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'PENDING',
      orderStatus: 'PENDING',
      items: validatedItems,
    });

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: newOrder,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xử lý đơn hàng', error: error.message });
  }
});

// GET /api/orders (Customer order history)
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const orders = db.listOrders({ userId: req.user!.id });
    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử đơn hàng', error: error.message });
  }
});

// GET /api/orders/:id (Order details)
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.findOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải chi tiết đơn hàng', error: error.message });
  }
});

export default router;
