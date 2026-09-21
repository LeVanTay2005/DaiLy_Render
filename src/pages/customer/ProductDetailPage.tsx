import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, ProductVariant, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const ProductDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected State
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { success, error } = useNotification();

  useEffect(() => {
    const fetchDetail = async () => {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const res = await api.products.getByIdOrSlug(idOrSlug);
        if (res.success && res.data?.product) {
          const p = res.data.product;
          setProduct(p);
          setSelectedImage(p.images[0] || '');
          if (p.variants && p.variants.length > 0) {
            setSelectedVariant(p.variants[0]);
          }
          setReviews(res.data.reviews || []);
          setRelatedProducts(res.data.related || []);
        } else {
          navigate('/products', { replace: true });
        }
      } catch (err: any) {
        error(err.message || 'Lỗi tải chi tiết sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [idOrSlug]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-zinc-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-zinc-200 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
            <div className="h-24 bg-zinc-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Color options & Size options derived from variants
  const uniqueSizes: string[] = Array.from(new Set(product.variants.map(v => v.size)));
  const uniqueColors: { color: string; colorCode?: string }[] = Array.from(
    new Set(product.variants.map(v => JSON.stringify({ color: v.color, colorCode: v.colorCode })))
  ).map((s: string) => JSON.parse(s));

  const handleSizeClick = (size: string) => {
    const currentColor = selectedVariant?.color;
    // Find variant with same color and new size, or first variant with that size
    const match =
      product.variants.find(v => v.size === size && v.color === currentColor) ||
      product.variants.find(v => v.size === size);
    if (match) setSelectedVariant(match);
  };

  const handleColorClick = (color: string) => {
    const currentSize = selectedVariant?.size;
    const match =
      product.variants.find(v => v.color === color && v.size === currentSize) ||
      product.variants.find(v => v.color === color);
    if (match) setSelectedVariant(match);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      error('Vui lòng đăng nhập để gửi đánh giá sản phẩm');
      return;
    }
    if (!reviewComment.trim()) {
      error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.reviews.create({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.success && res.data) {
        success('Cảm ơn bạn! Đánh giá đã được gửi thành công.');
        setReviews(prev => [res.data, ...prev]);
        setReviewComment('');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const discount =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link to="/" className="hover:text-black">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-black">Sản phẩm</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discount && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg">
                TIẾT KIỆM {discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-zinc-950 shadow-md scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
              {product.brand}
            </span>
            <h1 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-950 mt-1 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200'
                    }`}
                  />
                ))}
                <span className="font-bold text-zinc-800 ml-1">{product.rating}</span>
              </div>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-500">{reviews.length} đánh giá</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-500">{product.soldCount} đã bán</span>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-baseline gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-zinc-950">
              {(product.salePrice || product.price).toLocaleString('vi-VN')}đ
            </span>
            {product.salePrice && (
              <span className="font-mono text-sm text-zinc-400 line-through">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Màu sắc: <strong className="text-zinc-600 font-normal">{selectedVariant?.color}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {uniqueColors.map((c, i) => {
                const isSelected = selectedVariant?.color === c.color;
                return (
                  <button
                    key={i}
                    onClick={() => handleColorClick(c.color)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: c.colorCode || '#000000' }}
                    />
                    <span>{c.color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Kích thước (Size): <strong className="text-zinc-600 font-normal">{selectedVariant?.size}</strong>
              </span>
              <span className="text-xs text-zinc-500 hover:underline cursor-pointer">
                Bảng quy đổi size
              </span>
            </div>
            <div className="flex items-center gap-2">
              {uniqueSizes.map(size => {
                const isSelected = selectedVariant?.size === size;
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeClick(size)}
                    className={`w-12 h-11 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock status */}
          <div className="text-xs">
            {selectedVariant ? (
              selectedVariant.stock > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Còn hàng ({selectedVariant.stock} sản phẩm trong kho)
                </span>
              ) : (
                <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Tạm hết hàng kích thước này
                </span>
              )
            ) : null}
          </div>

          {/* Quantity Stepper & Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-zinc-300 rounded-xl bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3.5 py-2.5 text-zinc-600 hover:bg-zinc-100 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold font-mono text-zinc-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(prev =>
                      selectedVariant ? Math.min(selectedVariant.stock, prev + 1) : prev + 1
                    )
                  }
                  className="px-3.5 py-2.5 text-zinc-600 hover:bg-zinc-100 text-sm font-bold"
                >
                  +
                </button>
              </div>

              <button
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 bg-zinc-950 hover:bg-zinc-800 text-white text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" /> Thêm Vào Giỏ
              </button>
            </div>

            <button
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mua Ngay - Thanh Toán Nhanh
            </button>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-zinc-200 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900">
              Mô Tả Sản Phẩm
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {product.description ||
                'Thiết kế chuẩn may đo phong cách Haute Couture hiện đại. Đường may tinh tế, chất liệu cao cấp mang lại sự thoải mái tối ưu cả ngày dài.'}
            </p>

            {product.details && product.details.length > 0 && (
              <ul className="space-y-1.5 pt-2 text-xs text-zinc-600">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-12 border-t border-zinc-200">
        <div className="max-w-3xl">
          <h2 className="font-serif-title text-2xl font-bold text-zinc-950 mb-6">
            Đánh Giá Từ Khách Hàng ({reviews.length})
          </h2>

          {/* Add Review Form */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm mb-8">
            <h3 className="font-bold text-sm text-zinc-900 mb-3">
              Viết nhận xét của bạn về sản phẩm này
            </h3>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-700">Đánh giá số sao:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-amber-400' : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về chất vải, form dáng, độ vừa vặn..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi Đánh Giá
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
                <span>Bạn cần đăng nhập để gửi đánh giá cho sản phẩm này.</span>
                <Link
                  to="/login"
                  className="font-bold text-zinc-950 underline hover:text-zinc-700"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và chia sẻ!
              </p>
            ) : (
              reviews.map(r => (
                <div
                  key={r.id}
                  className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-2 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                        {r.userName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 block">{r.userName}</span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-amber-400' : 'text-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-zinc-700 leading-relaxed pt-1">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-zinc-200">
          <h2 className="font-serif-title text-2xl font-bold text-zinc-950 mb-6">
            Có Thể Bạn Cũng Thích
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <div
                key={p.id}
                className="group flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
                  <Link to={`/products/${p.slug}`}>
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>
                <div className="p-3.5">
                  <Link to={`/products/${p.slug}`}>
                    <h3 className="font-bold text-xs text-zinc-900 group-hover:text-black line-clamp-1">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="font-mono font-bold text-xs text-zinc-950 mt-1">
                    {(p.salePrice || p.price).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
