import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  Ticket,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    couponCode,
    shippingFee,
    total,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [applying, setApplying] = useState(false);
  const { success, error } = useNotification();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setApplying(true);
    try {
      const res = await api.coupons.apply(inputCoupon.trim(), subtotal);
      if (res.success && res.data) {
        applyCoupon(res.data.code, res.data.discountAmount);
        success(`Áp dụng mã giảm giá ${res.data.code} thành công! Giảm ${res.data.discountAmount.toLocaleString('vi-VN')}đ`);
        setInputCoupon('');
      } else {
        error(res.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (err: any) {
      error(err.message || 'Không thể áp dụng mã');
    } finally {
      setApplying(false);
    }
  };

  const freeShippingThreshold = 500000;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const freeShipPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-serif-title text-2xl font-bold text-zinc-900">
            Giỏ Hàng Của Bạn Đang Trống
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Hãy khám phá các thiết kế thời trang mới nhất để tìm thấy phong cách phù hợp với bạn
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md"
        >
          Khám Phá Sản Phẩm Ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-serif-title text-3xl font-bold text-zinc-950">
          Giỏ Hàng ({items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm)
        </h1>
      </div>

      {/* Free shipping banner */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 mb-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          {remainingForFreeShip === 0 ? (
            <span className="text-emerald-600">
              Chúc mừng! Bạn đã đủ điều kiện nhận <strong>Miễn phí vận chuyển toàn quốc</strong>.
            </span>
          ) : (
            <span>
              Mua thêm <strong className="text-rose-600">{remainingForFreeShip.toLocaleString('vi-VN')}đ</strong> để được <strong>Freeship</strong> (Đơn từ 500k)
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${freeShipPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Cart layout: Table + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm divide-y divide-zinc-100">
            {items.map(item => (
              <div
                key={item.variantId}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xl border border-zinc-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.slug}`}
                      className="font-bold text-sm text-zinc-950 hover:underline line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-zinc-500">
                      Phân loại: <strong className="text-zinc-800">{item.size}</strong> • <strong className="text-zinc-800">{item.color}</strong>
                    </p>
                    <p className="font-mono font-bold text-xs text-zinc-900">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-zinc-300 rounded-xl bg-white overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono font-bold text-zinc-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right w-24 hidden sm:block">
                    <p className="font-mono font-bold text-sm text-zinc-950">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/products"
              className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Tiếp tục chọn sản phẩm
            </Link>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          {/* Voucher input */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-zinc-500" /> Mã Khuyến Mãi (Voucher)
            </h3>

            {couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div>
                  <span className="font-bold font-mono text-emerald-800">{couponCode}</span>
                  <p className="text-emerald-700 text-[11px]">
                    Giảm -{discountAmount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-emerald-900 hover:text-rose-600 text-xs font-bold"
                >
                  Gỡ bỏ
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={e => setInputCoupon(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (MAISON20...)"
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                <button
                  type="submit"
                  disabled={applying || !inputCoupon}
                  className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {applying ? '...' : 'Áp Dụng'}
                </button>
              </form>
            )}
          </div>

          {/* Breakdown Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Tiền hàng:</span>
                <span className="font-mono text-zinc-900 font-bold">
                  {subtotal.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển:</span>
                <span className="font-mono text-zinc-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  ) : (
                    `${shippingFee.toLocaleString('vi-VN')}đ`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá voucher:</span>
                  <span className="font-mono font-bold">
                    -{discountAmount.toLocaleString('vi-VN')}đ
                  </span>
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
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Tiến Hành Thanh Toán <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
