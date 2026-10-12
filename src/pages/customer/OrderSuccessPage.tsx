import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  QrCode,
  ArrowRight,
  Package,
  Home,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Truck,
  PhoneCall,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  FileText,
} from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { getSafeProductImage, handleImageError } from '../../utils/imageHelper';

export const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState(!order);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success('Đã sao chép vào bộ nhớ tạm');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-500 text-xs">Đang đồng bộ dữ liệu đơn hàng...</p>
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

  // VietQR Dynamic image url
  const qrUrl = `https://api.vietqr.io/image/970407-19036888999888-06F7q7i.jpg?accountName=CONG%20TY%20TNHH%20DAILY%20GIUONG%20SPA&amount=${order.totalAmount}&addInfo=DAILY%20${order.orderCode}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 print:p-0 print:m-0">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Giao dịch hoàn tất thành công
        </span>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-zinc-950">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
          Cảm ơn bạn đã tin tưởng lựa chọn <strong>DaiLy Giường Spa</strong>. Bộ phận điều phối & kỹ thuật đang tiến hành kiểm tra và chuẩn bị thiết bị cho bạn.
        </p>
        <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-xl border border-zinc-200">
          <span className="text-xs text-zinc-500">Mã đơn hàng:</span>
          <strong className="font-mono text-base text-zinc-950">#{order.orderCode}</strong>
          <button
            onClick={() => copyToClipboard(order.orderCode, 'orderCode')}
            className="text-zinc-500 hover:text-zinc-950 p-1"
            title="Sao chép mã đơn"
          >
            {copiedKey === 'orderCode' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Order Progress Stepper (Lộ trình đơn hàng chuẩn Shopee / Lazada) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-zinc-600" /> Trạng Thái Vận Chuyển Đơn Hàng
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[11px]">✓</span>
            <p className="font-bold text-emerald-950">1. Chờ Xác Nhận</p>
            <p className="text-[10px] text-emerald-700">Đơn hàng đã được ghi nhận</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-zinc-950 text-white font-bold inline-flex items-center justify-center text-[11px]">2</span>
            <p className="font-bold text-zinc-900">2. Chờ Lấy Hàng</p>
            <p className="text-[10px] text-zinc-500">Đang chuẩn bị kiện hàng</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-600 font-bold inline-flex items-center justify-center text-[11px]">3</span>
            <p className="font-bold text-zinc-700">3. Đang Giao Hàng</p>
            <p className="text-[10px] text-zinc-400">ĐVVC đang vận chuyển</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-600 font-bold inline-flex items-center justify-center text-[11px]">4</span>
            <p className="font-bold text-zinc-700">4. Đã Giao Hàng</p>
            <p className="text-[10px] text-zinc-400">Khách nhận & đồng kiểm</p>
          </div>
        </div>
      </div>

      {/* VietQR Bank Transfer Box if selected */}
      {order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus !== 'PAID' && (
        <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base text-white">
                  Thanh Toán VietQR 24/7 (Xác Nhận Tự Động)
                </h3>
                <p className="text-xs text-zinc-400">
                  Mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán tức thì
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
              Đang chờ chuyển khoản
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Dynamic QR Code Card */}
            <div className="md:col-span-5 bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg text-center">
              <img
                src={qrUrl}
                alt="VietQR Chuyển Khoản"
                className="w-56 h-auto object-contain rounded-lg"
                onError={e => {
                  // Fallback if external image service has delay
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-xs font-bold text-zinc-900 mt-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quét bằng mọi App Ngân Hàng
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5">
                (Techcombank, Vietcombank, MB, BIDV, VPBank...)
              </span>
            </div>

            {/* Manual Details with Fast Copy */}
            <div className="md:col-span-7 space-y-3.5 text-xs text-zinc-300">
              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Ngân hàng nhận:</span>
                  <strong className="text-white text-sm">Techcombank (Ngân hàng Kỹ thương)</strong>
                </div>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Số tài khoản:</span>
                  <strong className="font-mono text-lg text-emerald-400 tracking-wider">
                    19036888999888
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('19036888999888', 'stk')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'stk' ? 'Đã chép' : 'Sao chép STK'}
                </button>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Chủ tài khoản:</span>
                  <strong className="text-white uppercase font-semibold">
                    CONG TY TNHH DAILY GIUONG SPA
                  </strong>
                </div>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Số tiền cần thanh toán:</span>
                  <strong className="font-mono text-lg text-rose-400 font-extrabold">
                    {order.totalAmount.toLocaleString('vi-VN')}đ
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.totalAmount.toString(), 'amount')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'amount' ? 'Đã chép' : 'Sao chép số tiền'}
                </button>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Nội dung chuyển khoản (Bắt buộc):</span>
                  <strong className="font-mono text-sm text-amber-300">
                    DAILY {order.orderCode}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`DAILY ${order.orderCode}`, 'memo')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'memo' ? 'Đã chép' : 'Sao chép nội dung'}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 italic pt-2 border-t border-zinc-800">
            * Sau khi quý khách chuyển khoản thành công, hệ thống thông minh sẽ tự động xác nhận đơn hàng trong vòng 2-5 phút và kỹ thuật viên sẽ liên hệ sắp xếp giờ giao.
          </p>
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-bold text-base text-zinc-950 border-b border-zinc-100 pb-3 flex items-center justify-between">
          <span>Thông Tin Chi Tiết Đơn Hàng</span>
          <span className="text-xs text-zinc-500 font-normal">
            Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </span>
        </h3>

        {/* Shipping address & customer details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <span className="text-zinc-500 font-semibold block flex items-center gap-1">
              Người nhận hàng:
            </span>
            <p className="font-bold text-sm text-zinc-950">{order.customerName}</p>
            <p className="text-zinc-700 font-mono font-medium">{order.customerPhone}</p>
            <p className="text-zinc-600">{order.customerEmail}</p>
          </div>

          <div className="space-y-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <span className="text-zinc-500 font-semibold block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" /> Địa chỉ giao hàng & lắp đặt:
            </span>
            <p className="text-zinc-950 font-bold leading-relaxed">{order.shippingAddress}</p>
            <p className="text-zinc-700">
              {order.ward}, {order.district}, {order.province}
            </p>
            <p className="text-zinc-500 text-[11px] pt-1">
              Phương thức thanh toán: <strong>{order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}</strong>
            </p>
          </div>
        </div>

        {order.note && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span className="font-semibold">Ghi chú & yêu cầu:</span> {order.note}
          </div>
        )}

        {/* Ordered items list with guaranteed safe images */}
        <div className="pt-4 border-t border-zinc-100 space-y-3">
          <span className="text-xs font-bold text-zinc-900 block">Sản phẩm đã đặt ({order.items.length}):</span>
          <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden bg-white">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 relative">
                    <img
                      src={getSafeProductImage(item.imageUrl, item.productName)}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={e => handleImageError(e, item.productName)}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-zinc-950">{item.productName}</p>
                    <p className="text-[11px] text-zinc-500">
                      Cấu hình: <strong className="text-zinc-800">{item.size}</strong> • Màu đệm da: <strong className="text-zinc-800">{item.color}</strong> • Số lượng: <strong className="text-zinc-950">x{item.quantity}</strong>
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Đơn giá: {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-zinc-950 shrink-0">
                  {item.total.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial summary */}
        <div className="pt-4 border-t border-zinc-200 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>Tạm tính tiền hàng:</span>
            <span className="font-mono text-zinc-900 font-bold">{order.subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Phí vận chuyển & lắp đặt:</span>
            <span className="font-mono text-emerald-600 font-bold">
              {order.shippingFee === 0 ? 'Miễn phí toàn quốc' : `${order.shippingFee.toLocaleString('vi-VN')}đ`}
            </span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <span>Mã giảm giá ({order.couponCode}):</span>
              <span className="font-mono font-bold">-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
            <span className="font-bold text-sm text-zinc-950">Tổng thanh toán:</span>
            <span className="font-mono font-extrabold text-2xl text-rose-600">
              {order.totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/profile/orders"
          className="w-full sm:w-auto px-7 py-3.5 bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Package className="w-4 h-4" /> Xem Lịch Sử Đơn Hàng
        </Link>

        <Link
          to="/products"
          className="w-full sm:w-auto px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
        >
          Tiếp Tục Mua Sắm <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
