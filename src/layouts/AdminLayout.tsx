import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  Users,
  Boxes,
  Ticket,
  Image as ImageIcon,
  Star,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Security Check: If not logged in, redirect to /admin/login
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-zinc-400">Đang xác thực bảo mật Quản trị...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user is logged in as customer, deny access with 403
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-5 border border-rose-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">403 - Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Tài khoản <strong className="text-zinc-200">{user?.email}</strong> hiện có quyền{' '}
            <span className="text-rose-400 uppercase font-semibold">Khách Hàng</span>. Bạn cần đăng nhập bằng tài khoản Quản trị viên (Admin) để truy cập Dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="w-full py-3 bg-white text-zinc-950 font-semibold text-sm rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Đăng Nhập Tài Khoản Admin
            </button>
            <Link
              to="/"
              className="text-xs text-zinc-400 hover:text-white transition-colors py-2"
            >
              Quay về trang khách hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Sản phẩm', path: '/admin/products', icon: ShoppingBag },
    { label: 'Danh mục', path: '/admin/categories', icon: FolderTree },
    { label: 'Đơn hàng', path: '/admin/orders', icon: ClipboardList },
    { label: 'Khách hàng', path: '/admin/users', icon: Users },
    { label: 'Tồn kho', path: '/admin/inventory', icon: Boxes },
    { label: 'Mã giảm giá', path: '/admin/coupons', icon: Ticket },
    { label: 'Banner', path: '/admin/banners', icon: ImageIcon },
    { label: 'Đánh giá', path: '/admin/reviews', icon: Star },
    { label: 'Cài đặt', path: '/admin/settings', icon: Settings },
  ];

  // Helper for breadcrumb
  const currentPathSegment = location.pathname.split('/')[2] || 'dashboard';
  const currentMenuItem = menuItems.find(m => m.path.includes(currentPathSegment));

  const handleAdminLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 px-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold text-lg font-serif-title shadow-md">
              M
            </div>
            <div>
              <span className="font-bold text-sm tracking-wider text-white uppercase block">
                Maison Admin
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Hệ thống quản trị
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin/dashboard'
                ? location.pathname === '/admin' || location.pathname === '/admin/dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold shadow-md'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User & Logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors border border-zinc-800"
              title="Mở website khách hàng trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Xem Web
            </a>
            <button
              onClick={handleAdminLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-xs font-semibold transition-colors border border-rose-900/40"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
              aria-label="Mở menu admin"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <span className="hidden sm:inline">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="text-zinc-100 font-semibold uppercase tracking-wider">
                {currentMenuItem ? currentMenuItem.label : 'Quản trị'}
              </span>
            </div>
          </div>

          {/* Right: Notifications & Quick Profile */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl relative transition-colors border border-zinc-800"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500"></span>
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="font-bold text-sm text-white">Thông báo hệ thống</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Đang hoạt động</span>
                  </div>
                  <div className="divide-y divide-zinc-800/60 my-2">
                    <div className="py-2.5 space-y-1">
                      <p className="font-semibold text-zinc-200">Đơn hàng mới #MS-250103</p>
                      <p className="text-zinc-400">Khách hàng Phạm Phương Linh vừa đặt hàng qua COD.</p>
                      <span className="text-[10px] text-zinc-500">Vừa xong</span>
                    </div>
                    <div className="py-2.5 space-y-1">
                      <p className="font-semibold text-amber-400">Cảnh báo tồn kho</p>
                      <p className="text-zinc-400">Áo Thun Basic (XL, Xám Khói) chỉ còn 7 sản phẩm trong kho.</p>
                      <span className="text-[10px] text-zinc-500">Hôm nay</span>
                    </div>
                  </div>
                  <Link
                    to="/admin/orders"
                    className="block text-center py-2 text-xs font-semibold text-white hover:underline pt-2 border-t border-zinc-800"
                  >
                    Xem tất cả đơn hàng →
                  </Link>
                </div>
              )}
            </div>

            {/* Admin Tag */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-[11px]">
                Super Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
