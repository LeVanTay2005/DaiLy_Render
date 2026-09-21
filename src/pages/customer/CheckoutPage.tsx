import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  ChevronLeft,
  Lock,
  Building,
  QrCode,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { PaymentMethod } from '../../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, couponCode, shippingFee, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotification();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    shippingAddress: user?.address || '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-title text-2xl font-bold text-zinc-900">
          Chưa có sản phẩm nào để thanh toán
        </h2>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.shippingAddress.trim()) {
      error('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim(),
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        shippingAddress: formData.shippingAddress.trim(),
        note: formData.note.trim(),
        paymentMethod,
        couponCode: couponCode || undefined,
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.name,
          sku: i.sku,
          size: i.size,
          color: i.color,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.image,
        })),
      };

      const res = await api.orders.create(orderPayload);
      if (res.success && res.data) {
        clearCart();
        success('Đặt hàng thành công!');
        navigate(`/order-success/${res.data.orderCode}`, {
          state: { order: res.data },
        });
      } else {
        error(res.message || 'Lỗi xử lý đơn hàng');
      }
    } catch (err: any) {
      error(err.message || 'Không thể tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <Link
          to="/cart"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại giỏ hàng
        </Link>
        <span className="text-xs text-zinc-500 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-600" /> Thanh toán bảo mật SSL 256-bit
        </span>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Shipping & Payment form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Customer details */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Truck className="w-4 h-4 text-zinc-600" /> 1. Thông Tin Nhận Hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Số điện thoại nhận hàng *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="0987 654 321"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email nhận hóa đơn & cập nhật lộ trình
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tỉnh / Thành phố *</label>
                <select
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
                >
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Quận / Huyện *</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
                >
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận Bình Thạnh">Bình Thạnh</option>
                  <option value="Quận Ba Đình">Ba Đình</option>
                  <option value="Quận Hoàn Kiếm">Hoàn Kiếm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Phường / Xã *</label>
                <input
                  type="text"
                  required
                  value={formData.ward}
                  onChange={e => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà...) *
              </label>
              <input
                type="text"
                required
                value={formData.shippingAddress}
                onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                placeholder="Ví dụ: Tòa nhà Landmark 81, 720A Điện Biên Phủ"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Ghi chú cho shipper (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                placeholder="Giao hàng giờ hành chính, gọi trước khi giao..."
                className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <CreditCard className="w-4 h-4 text-zinc-600" /> 2. Phương Thức Thanh Toán
            </h2>

            <div className="space-y-3">
              {/* COD */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-zinc-950 bg-zinc-50 shadow-sm'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-zinc-950 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-xs text-zinc-950 block">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận và kiểm tra kiện hàng.
                  </p>
                </div>
              </label>

              {/* BANK TRANSFER */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-zinc-950 bg-zinc-50 shadow-sm'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                  className="mt-1 text-zinc-950 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-950">
                      Chuyển khoản Ngân hàng (VietQR 24/7)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Quét mã QR qua ứng dụng ngân hàng Techcombank, Vietcombank, MB, BIDV... Đơn hàng sẽ được duyệt tự động.
                  </p>

                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-zinc-200 text-xs space-y-1 text-zinc-700">
                      <p>
                        Ngân hàng: <strong>Techcombank</strong>
                      </p>
                      <p>
                        Số tài khoản: <strong className="font-mono text-zinc-900 font-bold">19036888999888</strong>
                      </p>
                      <p>
                        Chủ tài khoản: <strong>CONG TY TNHH MAISON VIETNAM</strong>
                      </p>
                      <p className="text-[11px] text-zinc-500 italic pt-1">
                        * Bạn sẽ nhận được mã QR quét nhanh tại trang hoàn tất đơn hàng.
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* VNPAY / MOMO */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'VNPAY'
                    ? 'border-zinc-950 bg-zinc-50 shadow-sm'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'VNPAY'}
                  onChange={() => setPaymentMethod('VNPAY')}
                  className="mt-1 text-zinc-950 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-xs text-zinc-950 block">
                    Ví điện tử MoMo / VNPay / Thẻ ATM / Thẻ Quốc Tế (Visa/Master)
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Cổng thanh toán điện tử trực tuyến an toàn.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Review Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3">
              Đơn Hàng Của Bạn ({items.length} món)
            </h3>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map(item => (
                <div key={item.variantId} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 rounded-lg object-cover border border-zinc-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 line-clamp-1">{item.name}</p>
                      <span className="text-[11px] text-zinc-500">
                        {item.size} • {item.color} • x{item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-zinc-950">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Tiền hàng:</span>
                <span className="font-mono font-bold text-zinc-900">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển:</span>
                <span className="font-mono">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  ) : (
                    `${shippingFee.toLocaleString('vi-VN')}đ`
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Mã khuyến mãi ({couponCode}):</span>
                  <span className="font-mono font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-zinc-950">Tổng thanh toán:</span>
                <span className="font-mono font-extrabold text-xl text-rose-600">
                  {total.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-xl disabled:opacity-50"
            >
              {submitting ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng Ngay'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
