import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  ShieldCheck,
  RotateCcw,
  Truck,
  Heart,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category, Banner, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { success } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, catRes, prodRes] = await Promise.all([
          api.banners.getAll(),
          api.categories.getAll(),
          api.products.getAll({ limit: 24 }),
        ]);

        if (bannerRes.success && bannerRes.data) setBanners(bannerRes.data);
        if (catRes.success && catRes.data) setCategories(catRes.data);
        if (prodRes.success && prodRes.data?.products) {
          const prods: Product[] = prodRes.data.products;
          setFeaturedProducts(prods.filter(p => p.isFeatured));
          setNewArrivals(prods.filter(p => p.isNewArrival));
          setFlashSaleProducts(prods.filter(p => p.isFlashSale || (p.salePrice && p.salePrice < p.price)));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Banner auto slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[activeBannerIdx] || {
    title: 'BST Thu Đông 2025: Bản Giao Hưởng Thời Gian',
    subtitle: 'Nét tối giản giao thoa cùng chất liệu cashmere và lụa tơ tằm thượng hạng.',
    badge: 'NEW COLLECTION 2025',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600',
    buttonText: 'Khám Phá Bộ Sưu Tập',
  };

  const handleQuickAdd = (p: Product) => {
    const firstVariant = p.variants[0];
    if (firstVariant) {
      addToCart(p, firstVariant, 1);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SLIDER */}
      <section className="relative w-full h-[520px] sm:h-[640px] lg:h-[720px] overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          <img
            src={activeBanner.image}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center transform scale-105 animate-fade-in transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl text-white space-y-5 animate-in fade-in slide-in-from-left duration-700">
            {activeBanner.badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md text-white border border-white/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {activeBanner.badge}
              </span>
            )}
            <h1 className="font-serif-title text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-white">
              {activeBanner.title}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-lg">
              {activeBanner.subtitle}
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                to={activeBanner.link || '/products'}
                className="px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 group"
              >
                <span>{activeBanner.buttonText || 'Khám Phá Ngay'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products?sale=true"
                className="px-6 py-4 bg-black/40 hover:bg-black/60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-white/30 backdrop-blur-sm"
              >
                Xem Khuyến Mãi
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel arrows */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
            <button
              onClick={() =>
                setActiveBannerIdx(prev => (prev - 1 + banners.length) % banners.length)
              }
              className="p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors backdrop-blur-sm border border-white/20"
              aria-label="Banner trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveBannerIdx(prev => (prev + 1) % banners.length)}
              className="p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors backdrop-blur-sm border border-white/20"
              aria-label="Banner sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 2. CATEGORIES BROWSER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-bold">
              DANH MỤC TIÊU BIỂU
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
              Khám Phá Theo Phong Cách
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs uppercase tracking-wider font-bold text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1 group"
          >
            Tất cả danh mục <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-zinc-100 aspect-[3/4] flex flex-col justify-end p-4 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="relative z-10 text-white">
                <h3 className="font-bold text-sm tracking-wide group-hover:text-zinc-200 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-zinc-300 font-medium">
                  {cat.itemCount || 0} sản phẩm
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALE / HOT DEALS */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-zinc-950 text-white py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-zinc-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight">
                    FLASH SALE HÔM NAY
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Số lượng giới hạn • Tiết kiệm lên đến 30% giá gốc
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-zinc-400">Kết thúc sau:</span>
                <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 font-bold text-rose-400">
                  08
                </span>
                <span>:</span>
                <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 font-bold text-rose-400">
                  45
                </span>
                <span>:</span>
                <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 font-bold text-rose-400">
                  19
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flashSaleProducts.slice(0, 4).map(prod => {
                const discountPercent =
                  prod.salePrice && prod.salePrice < prod.price
                    ? Math.round(((prod.price - prod.salePrice) / prod.price) * 100)
                    : null;

                return (
                  <div
                    key={prod.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-800">
                      <Link to={`/products/${prod.slug}`}>
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      {discountPercent && (
                        <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                          {prod.brand}
                        </span>
                        <Link to={`/products/${prod.slug}`}>
                          <h3 className="text-sm font-bold text-white group-hover:text-zinc-300 transition-colors line-clamp-1 mt-0.5">
                            {prod.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-mono font-bold text-base text-rose-400">
                            {(prod.salePrice || prod.price).toLocaleString('vi-VN')}đ
                          </span>
                          {prod.salePrice && (
                            <span className="font-mono text-xs text-zinc-500 line-through">
                              {prod.price.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickAdd(prod)}
                        className="w-full mt-4 py-2.5 bg-zinc-800 hover:bg-white hover:text-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Thêm Vào Giỏ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-bold">
              MỚI LÊN KỆ
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
              Sản Phẩm Mới Nhất
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs uppercase tracking-wider font-bold text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1 group"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.slice(0, 8).map(prod => (
            <div
              key={prod.id}
              className="group flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                <Link to={`/products/${prod.slug}`}>
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                {prod.isNewArrival && (
                  <span className="absolute top-3 left-3 bg-zinc-950 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md">
                    NEW
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                    {prod.brand}
                  </span>
                  <Link to={`/products/${prod.slug}`}>
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-black transition-colors line-clamp-1 mt-0.5">
                      {prod.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1.5 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-zinc-700 text-xs">{prod.rating}</span>
                    <span className="text-zinc-400 text-[11px]">({prod.soldCount} đã bán)</span>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
                  <div className="font-mono font-bold text-sm text-zinc-950">
                    {(prod.salePrice || prod.price).toLocaleString('vi-VN')}đ
                  </div>
                  <button
                    onClick={() => handleQuickAdd(prod)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-800 transition-colors"
                    title="Thêm nhanh vào giỏ"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BRAND STORY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden bg-zinc-950 text-white relative p-8 sm:p-14 lg:p-20 shadow-2xl flex flex-col justify-center items-center text-center">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">
              TRIẾT LÝ THIẾT KẾ
            </span>
            <h2 className="font-serif-title text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Thời Trang Tối Giản, Đẳng Cấp Vượt Thời Gian
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Maison tin rằng cái đẹp thực sự không cần phô trương. Chúng tôi chọn lọc những thước vải linen, lụa và cashmere tự nhiên cao cấp nhất, chăm chút từng mũi khâu để mang đến cho bạn trải nghiệm mặc êm ái và tôn vinh phong thái tự tin.
            </p>
            <div className="pt-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all shadow-xl"
              >
                Về Chúng Tôi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
