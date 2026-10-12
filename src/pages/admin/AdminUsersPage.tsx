import React, { useState, useEffect } from 'react';
import {
  Users,
  Lock,
  Unlock,
  Search,
  Mail,
  Phone,
  Calendar,
  Activity,
  ShoppingBag,
  Star,
  MapPin,
  X,
  CreditCard,
  Clock,
  UserCheck,
  Package,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useNotification } from '../../context/NotificationContext';

interface ActivityItem {
  id: string;
  type: 'REGISTER' | 'ORDER' | 'REVIEW' | 'PROFILE_UPDATE';
  title: string;
  description: string;
  timestamp: string;
  meta?: any;
}

interface UserActivitiesData {
  user: User;
  orders: any[];
  reviews: any[];
  timeline: ActivityItem[];
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected customer for Activities Modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesData, setActivitiesData] = useState<UserActivitiesData | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'orders' | 'reviews'>('timeline');

  const { success, error } = useNotification();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.users.getAll();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenActivities = async (userId: string) => {
    setSelectedUserId(userId);
    setActivitiesLoading(true);
    setActiveTab('timeline');
    try {
      const res = await api.admin.users.getActivities(userId);
      if (res.success && res.data) {
        setActivitiesData(res.data);
      } else {
        error(res.message || 'Không thể tải lịch sử hoạt động của người dùng');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi khi tải lịch sử hoạt động');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleCloseActivities = () => {
    setSelectedUserId(null);
    setActivitiesData(null);
  };

  const handleToggleStatus = async (user: User) => {
    const actionName = user.status === 'BLOCKED' ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      const res = await api.admin.users.toggleStatus(user.id);
      if (res.success) {
        success(res.message || 'Cập nhật trạng thái thành công');
        loadUsers();
        if (selectedUserId === user.id && activitiesData) {
          setActivitiesData({
            ...activitiesData,
            user: {
              ...activitiesData.user,
              status: activitiesData.user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED',
            },
          });
        }
      }
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Chưa ghi nhận';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN')}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Khách Hàng & Hoạt Động</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng cộng <strong className="text-white">{users.length}</strong> tài khoản thành viên trong hệ thống (Đầy đủ lịch sử đơn hàng, đánh giá và nhật ký hoạt động)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Khách Hàng</th>
                <th className="px-4 py-3.5">Liên Hệ & Địa Chỉ</th>
                <th className="px-4 py-3.5">Đơn Hàng</th>
                <th className="px-4 py-3.5">Tổng Chi Tiêu</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Hoạt Động & Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Đang tải danh sách thành viên...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          <span className="text-[10px] text-zinc-500 font-mono">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-zinc-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" /> {u.email}
                      </p>
                      {u.phone ? (
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-500" /> {u.phone}
                        </p>
                      ) : (
                        <span className="text-[10px] text-zinc-600">Chưa cập nhật SĐT</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-white font-mono text-sm">
                        {u.totalOrders || 0}
                      </span>{' '}
                      đơn
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-emerald-400 font-mono text-sm">
                        {(u.totalSpent || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                          u.status === 'BLOCKED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {u.status === 'BLOCKED' ? 'Đã Khóa' : 'Hoạt Động'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Button Xem Hoạt Động */}
                        <button
                          onClick={() => handleOpenActivities(u.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors inline-flex items-center gap-1.5"
                          title="Xem lịch sử và hoạt động của tài khoản này"
                        >
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          <span>Xem hoạt động</span>
                        </button>

                        {/* Button Khóa / Mở Khóa */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                            u.status === 'BLOCKED'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/60'
                              : 'bg-rose-950/40 text-rose-300 border-rose-900/50 hover:bg-rose-900/60'
                          }`}
                        >
                          {u.status === 'BLOCKED' ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" /> Mở Khóa
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Khóa
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL / DRAWER: CHI TIẾT HOẠT ĐỘNG TÀI KHOẢN KHÁCH HÀNG */}
      {/* ======================================================== */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl font-bold uppercase shrink-0">
                  {activitiesData?.user?.name ? activitiesData.user.name[0] : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-white">
                      {activitiesData?.user?.name || 'Đang tải thông tin khách hàng...'}
                    </h2>
                    {activitiesData?.user && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          activitiesData.user.status === 'BLOCKED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {activitiesData.user.status === 'BLOCKED' ? 'Đã Khóa' : 'Hoạt Động'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {activitiesData?.user?.email} • ID: <span className="font-mono text-zinc-500">{selectedUserId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activitiesData?.user && (
                  <button
                    onClick={() => handleToggleStatus(activitiesData.user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                      activitiesData.user.status === 'BLOCKED'
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/60'
                        : 'bg-rose-950/40 text-rose-300 border-rose-900/50 hover:bg-rose-900/60'
                    }`}
                  >
                    {activitiesData.user.status === 'BLOCKED' ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Mở Khóa Tài Khoản
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Khóa Tài Khoản
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleCloseActivities}
                  className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activitiesLoading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400">Đang tổng hợp toàn bộ dữ liệu & hoạt động của khách hàng...</p>
                </div>
              ) : activitiesData ? (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                      <span className="text-[11px] text-zinc-400 block mb-1">Tổng Chi Tiêu</span>
                      <p className="text-lg font-bold text-emerald-400 font-mono">
                        {(activitiesData.user.totalSpent || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                      <span className="text-[11px] text-zinc-400 block mb-1">Đơn Hàng Đã Mua</span>
                      <p className="text-lg font-bold text-white font-mono">
                        {activitiesData.orders.length} <span className="text-xs font-normal text-zinc-500">đơn</span>
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                      <span className="text-[11px] text-zinc-400 block mb-1">Lượt Đánh Giá</span>
                      <p className="text-lg font-bold text-amber-400 font-mono">
                        {activitiesData.reviews.length} <span className="text-xs font-normal text-zinc-500">lượt</span>
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                      <span className="text-[11px] text-zinc-400 block mb-1">Ngày Đăng Ký</span>
                      <p className="text-xs font-bold text-zinc-300">
                        {formatDateTime(activitiesData.user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Contact Details Bar */}
                  <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Số điện thoại:</span>
                      <span className="text-zinc-200 font-medium">
                        {activitiesData.user.phone || 'Chưa cung cấp'}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500 block text-[11px]">Địa chỉ giao hàng đã lưu:</span>
                      <span className="text-zinc-200 font-medium">
                        {activitiesData.user.address || 'Chưa có địa chỉ mặc định'}
                      </span>
                    </div>
                  </div>

                  {/* Tabs Navigation */}
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'timeline'
                          ? 'bg-white text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Dòng Thời Gian Hoạt Động ({activitiesData.timeline.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'orders'
                          ? 'bg-white text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Đơn Hàng ({activitiesData.orders.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'reviews'
                          ? 'bg-white text-zinc-950 shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Đánh Giá ({activitiesData.reviews.length})</span>
                    </button>
                  </div>

                  {/* TAB 1: ACTIVITY TIMELINE */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-4">
                      {activitiesData.timeline.length === 0 ? (
                        <p className="text-center py-8 text-xs text-zinc-500">Chưa ghi nhận hoạt động nào</p>
                      ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                          {activitiesData.timeline.map((act) => {
                            let icon = <Activity className="w-3.5 h-3.5 text-zinc-400" />;
                            let badgeBg = 'bg-zinc-800 border-zinc-700';

                            if (act.type === 'ORDER') {
                              icon = <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
                              badgeBg = 'bg-emerald-950/60 border-emerald-800';
                            } else if (act.type === 'REVIEW') {
                              icon = <Star className="w-3.5 h-3.5 text-amber-400" />;
                              badgeBg = 'bg-amber-950/60 border-amber-800';
                            } else if (act.type === 'REGISTER') {
                              icon = <UserCheck className="w-3.5 h-3.5 text-sky-400" />;
                              badgeBg = 'bg-sky-950/60 border-sky-800';
                            }

                            return (
                              <div key={act.id} className="relative flex items-start gap-3">
                                <div
                                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border ${badgeBg} flex items-center justify-center shrink-0 shadow-sm`}
                                >
                                  {icon}
                                </div>
                                <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-bold text-xs text-white">{act.title}</h4>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      {formatDateTime(act.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-zinc-400 leading-relaxed">{act.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: ORDERS */}
                  {activeTab === 'orders' && (
                    <div className="space-y-3">
                      {activitiesData.orders.length === 0 ? (
                        <p className="text-center py-8 text-xs text-zinc-500">Khách hàng chưa đặt đơn hàng nào</p>
                      ) : (
                        activitiesData.orders.map((ord: any) => (
                          <div
                            key={ord.id}
                            className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-sm text-white">#{ord.orderCode}</span>
                                <span className="text-[11px] text-zinc-500">• {formatDateTime(ord.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-zinc-700 bg-zinc-800 text-zinc-300">
                                  {ord.paymentMethod}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                    ord.orderStatus === 'DELIVERED'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : ord.orderStatus === 'CANCELLED'
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}
                                >
                                  {ord.orderStatus}
                                </span>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-1.5 pt-1 border-t border-zinc-800/60 text-xs">
                              {ord.items?.map((it: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-zinc-300">
                                  <span className="truncate pr-2">
                                    • {it.productName} ({it.size || ''} {it.color || ''}) x{it.quantity}
                                  </span>
                                  <span className="font-mono text-zinc-400 shrink-0">
                                    {(it.total || it.price * it.quantity).toLocaleString('vi-VN')}đ
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                              <span className="text-zinc-500">
                                Địa chỉ giao: {ord.shippingAddress}, {ord.ward}, {ord.district}, {ord.province}
                              </span>
                              <span className="font-bold text-emerald-400 font-mono text-sm shrink-0">
                                Tổng: {ord.totalAmount.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 3: REVIEWS */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-3">
                      {activitiesData.reviews.length === 0 ? (
                        <p className="text-center py-8 text-xs text-zinc-500">Khách hàng chưa viết đánh giá nào</p>
                      ) : (
                        activitiesData.reviews.map((rev: any) => (
                          <div
                            key={rev.id}
                            className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                                    }`}
                                  />
                                ))}
                                <span className="font-bold text-white ml-1">{rev.rating}/5 sao</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {formatDateTime(rev.createdAt)}
                              </span>
                            </div>
                            <p className="text-zinc-300 italic bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60">
                              "{rev.comment}"
                            </p>
                            <span className="text-[11px] text-zinc-500 block">
                              Mã sản phẩm: <span className="font-mono text-zinc-400">{rev.productId}</span>
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 text-right">
              <button
                onClick={handleCloseActivities}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors"
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
