import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const CustomerOrdersPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const { error } = useNotification();

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      try {
        const res = await api.orders.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err: any) {
        error(err.message || 'Lỗi tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-title text-2xl font-bold text-zinc-900">
          Vui Lòng Đăng Nhập
        </h2>
        <p className="text-xs text-zinc-500">
          Đăng nhập vào tài khoản để theo dõi lộ trình và trạng thái các đơn hàng đã đặt
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold"
        >
          Đăng Nhập Ngay
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">Đã xác nhận</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">Đang chuẩn bị hàng</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">Đang vận chuyển</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Giao thành công</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-serif-title text-3xl font-bold text-zinc-950">
          Lịch Sử Đơn Hàng
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Theo dõi tiến độ vận chuyển và chi tiết các đơn hàng của bạn
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-400">
          Đang tải lịch sử đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-bold text-base text-zinc-800">Bạn chưa có đơn hàng nào</h3>
          <p className="text-xs text-zinc-500">
            Khám phá bộ sưu tập thời trang cao cấp và đặt đơn hàng đầu tiên của bạn ngay hôm nay.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-md hover:bg-zinc-800"
          >
            Mua Sắm Ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-zinc-950">
                    #{order.orderCode}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-zinc-50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-12 h-14 object-cover rounded-lg border border-zinc-100"
                        />
                      )}
                      <div>
                        <p className="font-bold text-zinc-900">{item.productName}</p>
                        <span className="text-[11px] text-zinc-500">
                          {item.size} • {item.color} • x{item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-zinc-900">
                      {item.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Action */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500">Tổng tiền:</span>{' '}
                  <strong className="font-mono font-bold text-base text-zinc-950">
                    {order.totalAmount.toLocaleString('vi-VN')}đ
                  </strong>
                </div>

                <Link
                  to={`/order-success/${order.orderCode}`}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Chi Tiết Đơn
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
