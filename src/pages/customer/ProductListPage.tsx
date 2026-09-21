import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  Star,
  Check,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { useCart } from '../../context/CartContext';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || searchParams.get('category') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  );
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [isSaleOnly, setIsSaleOnly] = useState(searchParams.get('sale') === 'true');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.products.getAll({
          categorySlug: selectedCategory || undefined,
          search: search || undefined,
          sort: selectedSort,
          minPrice,
          maxPrice,
          size: selectedSize || undefined,
          color: selectedColor || undefined,
          sale: isSaleOnly ? 'true' : undefined,
          limit: 36,
        }),
        api.categories.getAll(),
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data.products);
        setTotal(prodRes.data.total);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSort, minPrice, maxPrice, selectedSize, selectedColor, isSaleOnly, search]);

  const handleQuickAdd = (p: Product) => {
    if (p.variants.length > 0) {
      addToCart(p, p.variants[0], 1);
    }
  };

  const currentCategoryObj = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);

  const availableSizes = ['S', 'M', 'L', 'XL', '2XL', 'FreeSize'];
  const availableColors = [
    { name: 'Đen', hex: '#000000' },
    { name: 'Trắng', hex: '#FFFFFF' },
    { name: 'Xám', hex: '#6B7280' },
    { name: 'Xanh Navy', hex: '#1E3A8A' },
    { name: 'Be', hex: '#D2B48C' },
    { name: 'Nâu', hex: '#78350F' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & Description */}
      <div className="mb-8">
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-zinc-950">
          {currentCategoryObj ? currentCategoryObj.name : 'Tất Cả Sản Phẩm'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
          {currentCategoryObj
            ? currentCategoryObj.description
            : `Khám phá hơn ${total} thiết kế thời trang hiện đại, thanh lịch và cao cấp`}
        </p>
      </div>

      {/* Top Bar: Search, Mobile Toggle & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 flex items-center gap-2 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Bộ lọc ({total})
          </button>
          <span className="text-xs text-zinc-500 font-medium">
            Hiển thị <strong className="text-zinc-900">{products.length}</strong> sản phẩm
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">Sắp xếp:</span>
          <select
            value={selectedSort}
            onChange={e => setSelectedSort(e.target.value)}
            className="px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="popular">Bán chạy nhất</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8">
          {/* Categories */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-950 mb-3">
              Danh Mục Sản Phẩm
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-zinc-950 text-white font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                }`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-zinc-950 text-white font-bold'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] opacity-70">({cat.itemCount || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sale Toggle */}
          <div className="pt-4 border-t border-zinc-200">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-rose-600">
              <input
                type="checkbox"
                checked={isSaleOnly}
                onChange={e => setIsSaleOnly(e.target.checked)}
                className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>Chỉ hiển thị sản phẩm giảm giá 🔥</span>
            </label>
          </div>

          {/* Size Filter */}
          <div className="pt-6 border-t border-zinc-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-950 mb-3">
              Kích Cỡ (Size)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedSize('')}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  !selectedSize
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                }`}
              >
                Tất cả
              </button>
              {availableSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSize === size
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-6 border-t border-zinc-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-950 mb-3">
              Khoảng Giá (VNĐ)
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Tất cả mức giá', min: undefined, max: undefined },
                { label: 'Dưới 300.000đ', min: 0, max: 300000 },
                { label: '300.000đ - 600.000đ', min: 300000, max: 600000 },
                { label: '600.000đ - 1.000.000đ', min: 600000, max: 1000000 },
                { label: 'Trên 1.000.000đ', min: 1000000, max: undefined },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMinPrice(p.min);
                    setMaxPrice(p.max);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    minPrice === p.min && maxPrice === p.max
                      ? 'text-zinc-950 font-bold bg-zinc-100'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-zinc-200/60 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-base font-semibold text-zinc-700 mb-2">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc
              </p>
              <p className="text-xs text-zinc-500 mb-6">
                Vui lòng thử điều chỉnh lại mức giá hoặc chọn danh mục khác
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                  setSelectedSize('');
                  setSelectedColor('');
                  setIsSaleOnly(false);
                }}
                className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-md hover:bg-zinc-800 transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
              {products.map(prod => {
                const discount =
                  prod.salePrice && prod.salePrice < prod.price
                    ? Math.round(((prod.price - prod.salePrice) / prod.price) * 100)
                    : null;

                return (
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
                      {discount && (
                        <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                          {prod.brand}
                        </span>
                        <Link to={`/products/${prod.slug}`}>
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-black transition-colors line-clamp-1 mt-0.5">
                            {prod.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 mt-1 text-amber-400 text-xs">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-zinc-700 text-xs">{prod.rating}</span>
                          <span className="text-zinc-400 text-[10px]">({prod.soldCount})</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
                        <div>
                          <p className="font-mono font-bold text-xs sm:text-sm text-zinc-950">
                            {(prod.salePrice || prod.price).toLocaleString('vi-VN')}đ
                          </p>
                          {prod.salePrice && (
                            <p className="font-mono text-[10px] text-zinc-400 line-through">
                              {prod.price.toLocaleString('vi-VN')}đ
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleQuickAdd(prod)}
                          className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-800 transition-colors"
                          title="Thêm vào giỏ"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
