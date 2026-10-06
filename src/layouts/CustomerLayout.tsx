import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  PhoneCall,
  LogOut,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CustomerLayout: React.FC = () => {
  const { totalQuantity } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tất cả sản phẩm', path: '/products' },
    { label: 'Giường Tiêm Điện', path: '/category/giuong-tiem-tham-my' },
    { label: 'Giường Gội Dưỡng Sinh', path: '/category/giuong-goi-duong-sinh' },
    { label: 'Giường Massage Gỗ', path: '/category/giuong-massage-go' },
    { label: 'Giường Vali Gấp', path: '/category/giuong-vali-gap-gon' },
    { label: 'Ưu đãi setup', path: '/products?sale=true', highlight: true },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Tư vấn & Báo giá', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hỗ trợ vận chuyển & lắp đặt tận nơi cho cơ sở Spa & Thẩm mỹ viện toàn quốc</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-zinc-400">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <PhoneCall className="w-3.5 h-3.5" /> Hotline tư vấn: 1900 6868
            </span>
            <span>•</span>
            <span>Bảo hành chính hãng 24 tháng</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-black focus:outline-none"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-initial flex items-center justify-center lg:justify-start">
            <Link to="/" className="flex flex-col items-center lg:items-start group">
              <span className="font-serif-title text-xl sm:text-2xl tracking-[0.14em] font-extrabold text-zinc-950 uppercase group-hover:tracking-[0.16em] transition-all leading-tight">
                DAILY GIƯỜNG SPA
              </span>
              <span className="text-[9px] tracking-[0.14em] font-semibold text-zinc-500 uppercase mt-0.5">
                CHUYÊN CÁC LOẠI GIƯỜNG SPA & CLINIC
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.slice(0, 7).map(item => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative py-1 transition-colors ${
                    item.highlight
                      ? 'text-rose-600 font-semibold hover:text-rose-700'
                      : isActive
                      ? 'text-zinc-950 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-950 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-full transition-colors"
              title="Tìm kiếm sản phẩm"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account / Profile Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors border border-transparent hover:border-zinc-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                    <span className="hidden md:inline max-w-[110px] truncate text-xs font-semibold">
                      {user.name.split(' ').slice(-1)[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden md:inline" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-zinc-100">
                        <p className="text-xs text-zinc-400">Đăng nhập với</p>
                        <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-400" /> Tài khoản của tôi
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
                      >
                        <Package className="w-4 h-4 text-zinc-400" /> Đơn hàng đã mua
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 font-medium transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-500" /> Trang quản trị Admin
                        </Link>
                      )}
                      <div className="border-t border-zinc-100 my-1"></div>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2.5 text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-full transition-colors flex items-center gap-1.5"
                  title="Đăng nhập tài khoản"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline text-xs font-semibold">Đăng nhập</span>
                </Link>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors flex items-center"
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-zinc-950 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="border-t border-zinc-200 bg-zinc-50 py-3 px-4 transition-all">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm giường tiêm điện, giường gội dưỡng sinh, giường gỗ massage..."
                  className="w-full pl-11 pr-24 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all shadow-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
            {navLinks.map(item => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  item.highlight
                    ? 'text-rose-600 font-bold bg-rose-50'
                    : location.pathname === item.path
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'text-zinc-700 hover:bg-zinc-50 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-sm font-semibold border border-zinc-300 rounded-lg text-zinc-800 hover:bg-zinc-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-sm font-semibold bg-zinc-950 text-white rounded-lg hover:bg-zinc-800"
                  >
                    Đăng ký
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-zinc-700 font-medium"
                  >
                    Thông tin tài khoản ({user?.name})
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-zinc-700 font-medium"
                  >
                    Lịch sử đơn hàng
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-rose-600 font-semibold"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Customer Trust Badges */}
      <section className="bg-white border-t border-b border-zinc-200 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-900">Giao & Lắp Đặt Tận Nơi</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Hỗ trợ setup trọn gói toàn quốc</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-900">Bảo Hành Động Cơ 24T</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Bảo trì trọn đời, linh kiện sẵn có</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-900">Tiêu Chuẩn Y Khoa</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Khung chịu tải 350kg, da kháng khuẩn</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-900">Tư Vấn Setup 24/7</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Thiết kế công năng chuẩn không gian spa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Footer (NO ADMIN LINKS!) */}
      <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <span className="font-serif-title text-2xl tracking-[0.15em] font-bold text-white uppercase">
                  DAILY GIƯỜNG SPA
                </span>
                <span className="block text-[10px] tracking-[0.2em] font-medium text-zinc-500 uppercase">
                  HỆ THỐNG GIƯỜNG SPA & CLINIC VIỆT NAM
                </span>
              </Link>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
                Thương hiệu DaiLy Giường Spa chuyên sản xuất và phân phối giường tiêm thẩm mỹ, giường gội đầu dưỡng sinh, giường massage body gỗ tự nhiên và thiết bị thẩm mỹ cao cấp chuẩn y khoa.
              </p>
              <div className="pt-2 text-xs space-y-1.5 text-zinc-400">
                <p><strong className="text-zinc-200">Showroom:</strong> 158 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                <p><strong className="text-zinc-200">Xưởng sản xuất:</strong> KCN Tân Bình, P. Tây Thạnh, Q. Tân Phú, TP. HCM</p>
                <p><strong className="text-zinc-200">Hotline setup:</strong> 1900 6868 (08:30 - 22:00)</p>
                <p><strong className="text-zinc-200">Email:</strong> contact@dailygiuongspa.vn</p>
              </div>
            </div>

            {/* Links - Categories */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-4">Các Loại Giường Spa</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/category/giuong-tiem-tham-my" className="hover:text-white transition-colors">Giường Tiêm Thẩm Mỹ Điện</Link></li>
                <li><Link to="/category/giuong-goi-duong-sinh" className="hover:text-white transition-colors">Giường Gội Dưỡng Sinh</Link></li>
                <li><Link to="/category/giuong-massage-go" className="hover:text-white transition-colors">Giường Massage Gỗ Sồi</Link></li>
                <li><Link to="/category/giuong-spa-kim-loai" className="hover:text-white transition-colors">Giường Spa Inox & Thép</Link></li>
                <li><Link to="/category/giuong-vali-gap-gon" className="hover:text-white transition-colors">Giường Vali Gấp Gọn</Link></li>
                <li><Link to="/category/giuong-phun-xam-noi-mi" className="hover:text-white transition-colors">Ghế Phun Xăm & Nối Mi</Link></li>
              </ul>
            </div>

            {/* Links - Customer Care */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-4">Hỗ Trợ & Chính Sách</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">Giới Thiệu Về DaiLy Giường Spa</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Tư Vấn & Báo Giá Trọn Gói</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">Tra Cứu Đơn Hàng</Link></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Chính Sách Bảo Hành 24T</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Quy Trình Lắp Đặt Tận Nơi</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Bảo Trì & Linh Kiện Sẵn Có</span></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-white mb-4">Nhận Báo Giá Setup</h4>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                Đăng ký email để nhận ngay trọn bộ Catalogue và voucher giảm giá 500k cho đơn hàng setup.
              </p>
              <form onSubmit={e => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký nhận tư vấn và báo giá thiết bị Spa!'); }} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-zinc-950 font-semibold text-xs rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  Nhận Báo Giá <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Copyright & Payment methods */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© 2025 DAILY GIƯỜNG SPA Vietnam. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-4 text-zinc-400">
              <span>Hóa Đơn VAT Đầy Đủ</span>
              <span>•</span>
              <span>Lắp Đặt Tận Nơi</span>
              <span>•</span>
              <span>Chuyển Khoản / Trả Góp 0%</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
