import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Package,
  X,
  CreditCard,
  User,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'ALL');
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');

  // Detail Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { success, error } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.admin.orders.getAll({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, search]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, newPaymentStatus?: PaymentStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await api.admin.orders.updateStatus(orderId, newStatus, newPaymentStatus);
      if (res.success && res.data) {
        success(`Đã chuyển đơn #${res.data.orderCode} sang trạng thái ${newStatus}`);
        setActiveOrder(res.data);
        loadOrders();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Chờ Xử Lý</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Đã Xác Nhận</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Đóng Gói</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Đang Giao Hàng</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Đã Giao Thành Công</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Đã Hủy Đơn</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Theo dõi, cập nhật tiến độ giao hàng và xác thực thanh toán
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã đơn (#MS-...), khách hàng, SĐT..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { label: 'Tất cả', value: 'ALL' },
            { label: 'Chờ xử lý', value: 'PENDING' },
            { label: 'Đã xác nhận', value: 'CONFIRMED' },
            { label: 'Đang giao', value: 'SHIPPING' },
            { label: 'Đã giao', value: 'DELIVERED' },
            { label: 'Đã hủy', value: 'CANCELLED' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.value
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Mã Đơn</th>
                <th className="px-4 py-3.5">Khách Hàng</th>
                <th className="px-4 py-3.5">Sản Phẩm</th>
                <th className="px-4 py-3.5">Tổng Tiền</th>
                <th className="px-4 py-3.5">Thanh Toán</th>
                <th className="px-4 py-3.5">Trạng Thái Đơn</th>
                <th className="px-5 py-3.5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-white text-sm">
                        #{order.orderCode}
                      </span>
                      <span className="block text-[11px] text-zinc-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-zinc-200">{order.customerName}</p>
                      <p className="text-[11px] text-zinc-500">{order.customerPhone}</p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-zinc-300">
                        {order.items.length} món hàng
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate max-w-xs">
                        {order.items.map(i => `${i.productName} (${i.size})`).join(', ')}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-white font-mono text-sm">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </p>
                      <span className="text-[10px] text-zinc-500 uppercase">{order.paymentMethod}</span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thu tiền'}
                      </span>
                    </td>

                    <td className="px-4 py-4">{getStatusBadge(order.orderStatus)}</td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setActiveOrder(order)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold border border-zinc-800 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Drawer */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full my-8 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <div>
                <span className="text-xs text-zinc-400">Chi tiết đơn hàng</span>
                <h3 className="text-xl font-bold text-white font-mono">
                  #{activeOrder.orderCode}
                </h3>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Control Row */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-400 block mb-1">Cập nhật trạng thái đơn hàng:</span>
                <div className="flex items-center gap-2">
                  <select
                    disabled={updatingStatus}
                    value={activeOrder.orderStatus}
                    onChange={e => handleUpdateStatus(activeOrder.id, e.target.value as OrderStatus)}
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="PENDING">Chờ Xử Lý (PENDING)</option>
                    <option value="CONFIRMED">Đã Xác Nhận (CONFIRMED)</option>
                    <option value="PROCESSING">Đang Đóng Gói (PROCESSING)</option>
                    <option value="SHIPPING">Đang Vận Chuyển (SHIPPING)</option>
                    <option value="DELIVERED">Đã Giao Hàng (DELIVERED)</option>
                    <option value="CANCELLED">Hủy Đơn Hàng (CANCELLED)</option>
                  </select>

                  <button
                    disabled={updatingStatus}
                    onClick={() =>
                      handleUpdateStatus(
                        activeOrder.id,
                        activeOrder.orderStatus,
                        activeOrder.paymentStatus === 'PAID' ? 'PENDING' : 'PAID'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      activeOrder.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    {activeOrder.paymentStatus === 'PAID' ? '✓ Đã Thu Tiền' : 'Đánh dấu Đã Thu Tiền'}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-500">Thời gian tạo</span>
                <p className="text-xs font-semibold text-zinc-300">
                  {new Date(activeOrder.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" /> Thông Tin Người Nhận
                </h4>
                <p className="text-zinc-200 font-semibold">{activeOrder.customerName}</p>
                <p className="text-zinc-400 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" /> {activeOrder.customerPhone}
                </p>
                <p className="text-zinc-400">{activeOrder.customerEmail}</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Địa Chỉ Giao Hàng
                </h4>
                <p className="text-zinc-300 leading-relaxed">
                  {activeOrder.shippingAddress}
                </p>
                <p className="text-zinc-400 font-medium">
                  {activeOrder.ward}, {activeOrder.district}, {activeOrder.province}
                </p>
                {activeOrder.note && (
                  <p className="text-amber-400 italic pt-1">
                    Ghi chú: "{activeOrder.note}"
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-zinc-400" /> Danh Sách Sản Phẩm Đã Đặt
              </h4>
              <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-white">{item.productName}</p>
                        <p className="text-zinc-400 text-[11px]">
                          Size: {item.size} • Màu: {item.color} • SL: <strong className="text-white">{item.quantity}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-white">{item.total.toLocaleString('vi-VN')}đ</p>
                      <span className="text-[10px] text-zinc-500">
                        ({item.price.toLocaleString('vi-VN')}đ / cái)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-mono text-zinc-200">{activeOrder.subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Phí vận chuyển:</span>
                <span className="font-mono text-zinc-200">{activeOrder.shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>
              {activeOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Mã giảm giá ({activeOrder.couponCode || 'VOUCHER'}):</span>
                  <span className="font-mono">-{activeOrder.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                <span>Tổng tiền thanh toán:</span>
                <span className="font-mono text-base text-emerald-400">
                  {activeOrder.totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
