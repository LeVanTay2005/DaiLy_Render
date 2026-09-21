import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, QrCode, ArrowRight, Package, Home, Copy, Check } from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState(!order);
  const [copied, setCopied] = useState(false);

  const { success } = useNotification();

  useEffect(() => {
    if (!order && orderCode) {
      const fetchOrder = async () => {
        try {
          const res = await api.orders.getByCode(orderCode);
          if (res.success && res.data) {
            setOrder(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderCode, order]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Đã sao chép vào bộ nhớ tạm');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-zinc-500 text-xs">
        Đang tải thông tin đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-zinc-700 font-semibold">Không tìm thấy thông tin đơn hàng #{orderCode}</p>
        <Link to="/" className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold inline-block">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const qrUrl = `https://api.vietqr.io/image/970407-19036888999888-06F7q7i.jpg?accountName=CONG%20TY%20TNHH%20MAISON%20VIETNAM&amount=${order.totalAmount}&addInfo=MAISON%20${order.orderCode}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-zinc-950">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Cảm ơn bạn đã tin tưởng lựa chọn Maison. Mã đơn hàng của bạn là{' '}
          <strong className="text-zinc-950 font-mono">#{order.orderCode}</strong>
        </p>
      </div>

      {/* Bank Transfer Instructions if Selected */}
      {order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus !== 'PAID' && (
        <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Thông Tin Chuyển Khoản Thanh Toán (VietQR 24/7)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* QR Image */}
            <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-inner">
              <img
                src={qrUrl}
                alt="VietQR Payment"
                className="w-48 h-auto object-contain rounded"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[10px] text-zinc-600 font-bold mt-2">
                Quét mã QR bằng App Ngân Hàng
              </span>
            </div>

            {/* Manual details */}
            <div className="space-y-2.5 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500 block text-[11px]">Ngân hàng:</span>
                <strong className="text-white">Techcombank (Ngân hàng Kỹ thương)</strong>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <strong className="font-mono text-base text-emerald-400">
                    19036888999888
                  </strong>
                  <button
                    onClick={() => copyToClipboard('19036888999888')}
                    className="p-1 hover:text-white text-zinc-400"
                    title="Sao chép STK"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Chủ tài khoản:</span>
                <strong className="text-white">CONG TY TNHH MAISON VIETNAM</strong>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Số tiền cần thanh toán:</span>
                <strong className="font-mono text-base text-white">
                  {order.totalAmount.toLocaleString('vi-VN')}đ
                </strong>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Nội dung chuyển khoản (bắt buộc):</span>
                <strong className="font-mono text-xs bg-zinc-900 px-2 py-1 rounded text-amber-300 border border-zinc-700 inline-block">
                  MAISON {order.orderCode}
                </strong>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 italic pt-2 border-t border-zinc-800">
            * Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận đơn hàng trong vòng 2-5 phút.
          </p>
        </div>
      )}

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3">
          Thông Tin Chi Tiết Đơn Hàng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-zinc-400 block">Người nhận hàng:</span>
            <p className="font-bold text-zinc-900">{order.customerName}</p>
            <p className="text-zinc-600">{order.customerPhone}</p>
            <p className="text-zinc-600">{order.customerEmail}</p>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-400 block">Địa chỉ giao hàng:</span>
            <p className="text-zinc-900 font-medium">{order.shippingAddress}</p>
            <p className="text-zinc-600">
              {order.ward}, {order.district}, {order.province}
            </p>
          </div>
        </div>

        {/* Ordered items */}
        <div className="pt-4 border-t border-zinc-100 space-y-3">
          <span className="text-xs font-bold text-zinc-900 block">Sản phẩm đã đặt:</span>
          <div className="divide-y divide-zinc-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-10 h-12 rounded-lg object-cover border border-zinc-200"
                    />
                  )}
                  <div>
                    <p className="font-bold text-zinc-900">{item.productName}</p>
                    <p className="text-[11px] text-zinc-500">
                      Size: {item.size} • Màu: {item.color} • SL: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-zinc-900">
                  {item.total.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total price */}
        <div className="pt-4 border-t border-zinc-200 flex justify-between items-baseline text-xs">
          <span className="font-bold text-sm text-zinc-950">Tổng thanh toán:</span>
          <span className="font-mono font-extrabold text-xl text-rose-600">
            {order.totalAmount.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/profile/orders"
          className="w-full sm:w-auto px-6 py-3 bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Package className="w-4 h-4" /> Xem Lịch Sử Đơn Hàng
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-8 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
        >
          Tiếp Tục Mua Sắm <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
