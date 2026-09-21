import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminDashboardStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'day' | 'month'>('day');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.admin.dashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded-lg w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-zinc-800 rounded-2xl"></div>
      </div>
    );
  }

  const overview = stats?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockCount: 0,
  };

  const statCards = [
    {
      title: 'Tổng Doanh Thu',
      value: `${overview.totalRevenue.toLocaleString('vi-VN')}đ`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      change: '+14.2% so với tháng trước',
    },
    {
      title: 'Tổng Đơn Hàng',
      value: overview.totalOrders,
      icon: ShoppingBag,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
      change: `${overview.pendingOrders} đơn đang chờ xử lý`,
    },
    {
      title: 'Tổng Sản Phẩm',
      value: overview.totalProducts,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      change: '16 danh mục thời trang',
    },
    {
      title: 'Khách Hàng',
      value: overview.totalCustomers,
      icon: Users,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      change: 'Tài khoản hoạt động tốt',
    },
  ];

  // Max value for revenue bar charts calculation
  const dayData = stats?.revenueByDay || [];
  const monthData = stats?.revenueByMonth || [];
  const maxDayRevenue = Math.max(...dayData.map(d => d.revenue), 1000000);
  const maxMonthRevenue = Math.max(...monthData.map(m => m.revenue), 1000000);

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Tổng Quan
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Số liệu thống kê kinh doanh thời trang cập nhật theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/create"
            className="px-4 py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-md"
          >
            + Thêm Sản Phẩm Mới
          </Link>
        </div>
      </div>

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight mb-1">
                {card.value}
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Status Alert Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium">Đơn hàng chờ xử lý</p>
              <p className="text-lg font-bold text-white">{overview.pendingOrders} đơn</p>
            </div>
          </div>
          <Link
            to="/admin/orders?status=PENDING"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            Xem <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium">Đã giao thành công</p>
              <p className="text-lg font-bold text-white">{overview.completedOrders} đơn</p>
            </div>
          </div>
          <Link
            to="/admin/orders?status=DELIVERED"
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            Xem <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium">Sản phẩm sắp hết hàng</p>
              <p className="text-lg font-bold text-rose-300">{overview.lowStockCount} biến thể</p>
            </div>
          </div>
          <Link
            to="/admin/inventory"
            className="text-xs text-rose-400 hover:underline flex items-center gap-1"
          >
            Kho hàng <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Revenue Charts Section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Biểu Đồ Doanh Thu</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Theo dõi biến động dòng tiền và số lượng đơn hàng
            </p>
          </div>

          {/* Toggle Daily vs Monthly */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setChartMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMode === 'day' ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              7 Ngày Gần Nhất
            </button>
            <button
              onClick={() => setChartMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMode === 'month' ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              6 Tháng Gần Nhất
            </button>
          </div>
        </div>

        {/* Custom Visual Bar Chart */}
        <div className="pt-8">
          {chartMode === 'day' ? (
            <div className="grid grid-cols-7 gap-2 sm:gap-6 items-end h-64">
              {dayData.map((d, i) => {
                const heightPercent = Math.max(8, Math.round((d.revenue / maxDayRevenue) * 100));
                return (
                  <div key={i} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[11px] font-mono text-zinc-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.revenue > 0 ? `${(d.revenue / 1000).toFixed(0)}k` : '0đ'}
                    </div>
                    <div className="w-full bg-zinc-900 rounded-xl overflow-hidden flex flex-col justify-end p-1 hover:bg-zinc-800 transition-colors">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-lg transition-all duration-500 shadow-lg shadow-emerald-500/10"
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 mt-3">{d.label}</span>
                    <span className="text-[10px] text-zinc-500">{d.orders} đơn</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3 sm:gap-8 items-end h-64">
              {monthData.map((m, i) => {
                const heightPercent = Math.max(8, Math.round((m.revenue / maxMonthRevenue) * 100));
                return (
                  <div key={i} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[11px] font-mono text-zinc-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.revenue > 0 ? `${(m.revenue / 1000000).toFixed(1)}M` : '0'}
                    </div>
                    <div className="w-full bg-zinc-900 rounded-xl overflow-hidden flex flex-col justify-end p-1 hover:bg-zinc-800 transition-colors">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-lg transition-all duration-500 shadow-lg shadow-sky-500/10"
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 mt-3">{m.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Two Columns: Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
            <h2 className="font-bold text-base text-white">Top Sản Phẩm Bán Chạy</h2>
            <Link
              to="/admin/products"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {(stats?.topProducts || []).map((prod, idx) => (
              <div key={prod.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-zinc-500 w-4">{idx + 1}</span>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{prod.name}</p>
                    <p className="text-xs text-zinc-400">
                      {prod.price.toLocaleString('vi-VN')}đ • Đã bán: <strong className="text-emerald-400">{prod.soldCount}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white font-mono">
                    {prod.revenue.toLocaleString('vi-VN')}đ
                  </p>
                  <span className="text-[10px] text-zinc-500">Doanh số</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
            <h2 className="font-bold text-base text-white">Đơn Hàng Mới Nhất</h2>
            <Link
              to="/admin/orders"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              Tất cả đơn hàng <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {(stats?.recentOrders || []).map(order => {
              const statusBadgeClass =
                order.orderStatus === 'DELIVERED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : order.orderStatus === 'PENDING'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : order.orderStatus === 'CANCELLED'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20';

              return (
                <div key={order.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        #{order.orderCode}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${statusBadgeClass}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                      {order.customerName} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white font-mono">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </p>
                    <Link
                      to={`/admin/orders?search=${order.orderCode}`}
                      className="text-[11px] text-zinc-400 hover:text-white underline"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
