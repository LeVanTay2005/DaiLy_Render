export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
}

export interface ProductVariantData {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorCode: string;
  stock: number;
  price?: number;
  sku: string;
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  brand: string;
  price: number;
  salePrice?: number;
  description: string;
  details: string[];
  images: string[];
  variants: ProductVariantData[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  link: string;
  image: string;
  buttonText: string;
  position: 'HERO' | 'PROMO' | 'MIDDLE';
  order: number;
  active: boolean;
}

export interface CouponData {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ReviewData {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'APPROVED' | 'HIDDEN';
  createdAt: string;
}

export const INITIAL_CATEGORIES: CategoryData[] = [
  {
    id: 'cat-1',
    name: 'Áo Nam & Nữ',
    slug: 'ao',
    description: 'Bộ sưu tập áo thun, sơ mi, polo cao cấp chất liệu cotton thoáng mát',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-2',
    name: 'Quần Thời Trang',
    slug: 'quan',
    description: 'Quần jeans, quần âu, kaki form chuẩn tôn dáng thời thượng',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-3',
    name: 'Váy & Đầm Nữ',
    slug: 'vay',
    description: 'Thiết kế váy midi, đầm suông thanh lịch cho nàng công sở và dạo phố',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-4',
    name: 'Áo Khoác & Blazer',
    slug: 'ao-khoac',
    description: 'Blazer may đo tinh tế, áo khoác bomber ấm áp và phong cách',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-5',
    name: 'Hoodie & Sweater',
    slug: 'hoodie',
    description: 'Áo nỉ phong cách streetwear trẻ trung năng động giữ ấm mùa thu đông',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-6',
    name: 'Phụ Kiện Cao Cấp',
    slug: 'phu-kien',
    description: 'Túi xách da, thắt lưng, nón và phụ kiện thời trang tạo điểm nhấn phong cách',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_BANNERS: BannerData[] = [
  {
    id: 'ban-1',
    title: 'BỘ SƯU TẬP THU ĐÔNG 2025',
    subtitle: 'Đẳng cấp thời trang tối giản với chất liệu Organic Cotton và Linen cao cấp.',
    badge: 'NEW ARRIVALS',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Khám Phá Ngay',
    position: 'HERO',
    order: 1,
    active: true,
  },
  {
    id: 'ban-2',
    title: 'FLASH SALE CUỐI TUẦN',
    subtitle: 'Giảm giá lên đến 40% cho các dòng sản phẩm Áo Khoác & Blazer độc quyền.',
    badge: 'GIẢM ĐẾN 40%',
    link: '/products?sale=true',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Săn Deal Ngay',
    position: 'HERO',
    order: 2,
    active: true,
  },
  {
    id: 'ban-3',
    title: 'MINIMALIST ELEGANCE',
    subtitle: 'Phong cách tối giản vượt thời gian dành cho người yêu thích sự tinh tế.',
    badge: 'EDITOR\'S PICK',
    link: '/category/ao',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Xem Chi Tiết',
    position: 'MIDDLE',
    order: 3,
    active: true,
  },
];

export const INITIAL_COUPONS: CouponData[] = [
  {
    id: 'coup-1',
    code: 'WELCOME50',
    description: 'Giảm 50.000đ cho đơn hàng đầu tiên từ 399.000đ',
    discountType: 'FIXED',
    discountValue: 50000,
    minOrderValue: 399000,
    usageLimit: 500,
    usedCount: 84,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: 'coup-2',
    code: 'MAISON10',
    description: 'Giảm 10% cho toàn bộ giỏ hàng từ 600.000đ',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderValue: 600000,
    maxDiscount: 150000,
    usageLimit: 300,
    usedCount: 42,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: 'coup-3',
    code: 'VIP100',
    description: 'Giảm ngay 100.000đ cho đơn hàng từ 1.000.000đ',
    discountType: 'FIXED',
    discountValue: 100000,
    minOrderValue: 1000000,
    usageLimit: 100,
    usedCount: 19,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
  },
];

export const INITIAL_PRODUCTS: ProductData[] = [
  {
    id: 'prod-1',
    name: 'Áo Thun Basic Heavyweight Cotton',
    slug: 'ao-thun-basic-heavyweight-cotton',
    categoryId: 'cat-1',
    brand: 'Maison Studio',
    price: 320000,
    salePrice: 249000,
    description: 'Áo thun form relaxed-fit từ chất liệu 100% cotton định lượng 260gsm dày dặn, thấm hút mồ hôi tốt, giữ form dáng hoàn hảo sau nhiều lần giặt.',
    details: ['100% Cotton chải kỹ cao cấp', 'Định lượng 260gsm dày dặn', 'Cổ bo dệt chắc chắn, không bai nhão', 'Công nghệ nhuộm reactive bền màu'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v1-1', productId: 'prod-1', size: 'S', color: 'Trắng', colorCode: '#ffffff', stock: 25, sku: 'TSHIRT-WHT-S' },
      { id: 'v1-2', productId: 'prod-1', size: 'M', color: 'Trắng', colorCode: '#ffffff', stock: 34, sku: 'TSHIRT-WHT-M' },
      { id: 'v1-3', productId: 'prod-1', size: 'L', color: 'Trắng', colorCode: '#ffffff', stock: 18, sku: 'TSHIRT-WHT-L' },
      { id: 'v1-4', productId: 'prod-1', size: 'M', color: 'Đen', colorCode: '#111827', stock: 28, sku: 'TSHIRT-BLK-M' },
      { id: 'v1-5', productId: 'prod-1', size: 'L', color: 'Đen', colorCode: '#111827', stock: 12, sku: 'TSHIRT-BLK-L' },
      { id: 'v1-6', productId: 'prod-1', size: 'XL', color: 'Xám Khói', colorCode: '#6b7280', stock: 7, sku: 'TSHIRT-GRY-XL' },
    ],
    rating: 4.9,
    reviewCount: 48,
    soldCount: 320,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: true,
    status: 'ACTIVE',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Áo Sơ Mi Oxford Slimfit Dài Tay',
    slug: 'ao-so-mi-oxford-slimfit-dai-tay',
    categoryId: 'cat-1',
    brand: 'Maison Bespoke',
    price: 490000,
    salePrice: 389000,
    description: 'Áo sơ mi vải Oxford dệt thoi dầy dặn, thoáng khí, cổ áo đứng form chuẩn phong cách lịch lãm, phù hợp môi trường công sở lẫn các sự kiện thường nhật.',
    details: ['Vải Oxford Cotton 100%', 'Nút cài ngọc trai cao cấp', 'Đường may chỉ đôi tinh tế', 'Chống nhăn tự nhiên khi ủi nhẹ'],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v2-1', productId: 'prod-2', size: 'M', color: 'Xanh Nhạt', colorCode: '#93c5fd', stock: 15, sku: 'OXFORD-BLU-M' },
      { id: 'v2-2', productId: 'prod-2', size: 'L', color: 'Xanh Nhạt', colorCode: '#93c5fd', stock: 8, sku: 'OXFORD-BLU-L' },
      { id: 'v2-3', productId: 'prod-2', size: 'M', color: 'Trắng Sữa', colorCode: '#f8fafc', stock: 22, sku: 'OXFORD-WHT-M' },
      { id: 'v2-4', productId: 'prod-2', size: 'L', color: 'Trắng Sữa', colorCode: '#f8fafc', stock: 16, sku: 'OXFORD-WHT-L' },
    ],
    rating: 4.8,
    reviewCount: 36,
    soldCount: 195,
    isFeatured: true,
    isNewArrival: true,
    isFlashSale: false,
    status: 'ACTIVE',
    createdAt: '2025-01-14T09:30:00Z',
  },
  {
    id: 'prod-3',
    name: 'Quần Tây Âu May Đo Classic Tapered',
    slug: 'quan-tay-au-may-do-classic-tapered',
    categoryId: 'cat-2',
    brand: 'Maison Tailored',
    price: 580000,
    salePrice: 479000,
    description: 'Quần âu xếp ly nhẹ, dáng tapered ôm dần xuống cổ chân tạo nét hiện đại. Vải wool pha co giãn nhẹ, giữ ly phẳng phiu suốt cả ngày dài.',
    details: ['Poly Rayon pha Spandex 5%', 'Cạp quần tăng đơ co giãn ẩn 3cm', 'Túi chéo sâu tiện lợi', 'Khóa kéo YKK kim loại'],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v3-1', productId: 'prod-3', size: '29', color: 'Đen Tuyển', colorCode: '#0f172a', stock: 14, sku: 'PANTS-BLK-29' },
      { id: 'v3-2', productId: 'prod-3', size: '30', color: 'Đen Tuyển', colorCode: '#0f172a', stock: 19, sku: 'PANTS-BLK-30' },
      { id: 'v3-3', productId: 'prod-3', size: '31', color: 'Xám Đậm', colorCode: '#334155', stock: 9, sku: 'PANTS-GRY-31' },
      { id: 'v3-4', productId: 'prod-3', size: '32', color: 'Beige', colorCode: '#d6c7b2', stock: 6, sku: 'PANTS-BEI-32' },
    ],
    rating: 4.7,
    reviewCount: 29,
    soldCount: 140,
    isFeatured: true,
    isNewArrival: false,
    status: 'ACTIVE',
    createdAt: '2025-01-08T14:20:00Z',
  },
  {
    id: 'prod-4',
    name: 'Quần Jeans Denim Vintage Straight Leg',
    slug: 'quan-jeans-denim-vintage-straight-leg',
    categoryId: 'cat-2',
    brand: 'Maison Denim',
    price: 650000,
    salePrice: 539000,
    description: 'Chất liệu vải denim 13.5oz dệt thoi mộc mạc, wash màu thủ công tạo hiệu ứng vintage tự nhiên. Form ống đứng tôn chân và cực kỳ dễ phối đồ.',
    details: ['100% Cotton Denim 13.5oz', 'Wash màu axit thủ công', 'Đinh tán đồng chống rách góc túi', 'Đường chỉ vàng nổi bật'],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v4-1', productId: 'prod-4', size: '29', color: 'Xanh Chàm', colorCode: '#1e3a8a', stock: 11, sku: 'JEANS-IND-29' },
      { id: 'v4-2', productId: 'prod-4', size: '30', color: 'Xanh Chàm', colorCode: '#1e3a8a', stock: 24, sku: 'JEANS-IND-30' },
      { id: 'v4-3', productId: 'prod-4', size: '31', color: 'Xanh Nhạt Wash', colorCode: '#60a5fa', stock: 17, sku: 'JEANS-LGT-31' },
      { id: 'v4-4', productId: 'prod-4', size: '32', color: 'Xanh Nhạt Wash', colorCode: '#60a5fa', stock: 8, sku: 'JEANS-LGT-32' },
    ],
    rating: 4.9,
    reviewCount: 52,
    soldCount: 280,
    isFeatured: true,
    isNewArrival: true,
    isFlashSale: true,
    status: 'ACTIVE',
    createdAt: '2025-01-16T11:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Đầm Midi Linen Thắt Eo Thanh Lịch',
    slug: 'dam-midi-linen-that-eo-thanh-lich',
    categoryId: 'cat-3',
    brand: 'Maison Femme',
    price: 720000,
    salePrice: 590000,
    description: 'Thiết kế đầm dáng xòe nhẹ nhàng từ sợi lanh tự nhiên cao cấp, thoáng khí và thân thiện với làn da. Đai thắt eo tôn dáng hoàn hảo cho phái đẹp.',
    details: ['100% Linen dệt tự nhiên', 'Đai thắt eo rời tùy chỉnh', 'Túi sườn giấu kín tiện lợi', 'Khóa giọt lệ sau lưng mượt mà'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v5-1', productId: 'prod-5', size: 'S', color: 'Trắng Ngà', colorCode: '#fef3c7', stock: 18, sku: 'DRESS-IVY-S' },
      { id: 'v5-2', productId: 'prod-5', size: 'M', color: 'Trắng Ngà', colorCode: '#fef3c7', stock: 12, sku: 'DRESS-IVY-M' },
      { id: 'v5-3', productId: 'prod-5', size: 'S', color: 'Xanh Olive', colorCode: '#65a30d', stock: 9, sku: 'DRESS-OLV-S' },
      { id: 'v5-4', productId: 'prod-5', size: 'M', color: 'Xanh Olive', colorCode: '#65a30d', stock: 5, sku: 'DRESS-OLV-M' },
    ],
    rating: 4.9,
    reviewCount: 41,
    soldCount: 160,
    isFeatured: true,
    isNewArrival: true,
    status: 'ACTIVE',
    createdAt: '2025-01-18T16:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Chân Váy Chữ A Xếp Ly Tinh Tế',
    slug: 'chan-vay-chu-a-xep-ly-tinh-te',
    categoryId: 'cat-3',
    brand: 'Maison Femme',
    price: 450000,
    salePrice: 359000,
    description: 'Chân váy chữ A midi xếp ly chuẩn mực, dễ phối cùng áo sơ mi hoặc áo thun cho phong cách thanh lịch hàng ngày.',
    details: ['Chất liệu Tuyết Mưa cao cấp', 'Không nhăn, giữ nếp ly vĩnh viễn', 'Lớp lót quần bảo hộ bên trong'],
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v6-1', productId: 'prod-6', size: 'S', color: 'Đen', colorCode: '#000000', stock: 20, sku: 'SKIRT-BLK-S' },
      { id: 'v6-2', productId: 'prod-6', size: 'M', color: 'Đen', colorCode: '#000000', stock: 15, sku: 'SKIRT-BLK-M' },
      { id: 'v6-3', productId: 'prod-6', size: 'S', color: 'Beige Kem', colorCode: '#f5ebe0', stock: 14, sku: 'SKIRT-BEI-S' },
      { id: 'v6-4', productId: 'prod-6', size: 'M', color: 'Beige Kem', colorCode: '#f5ebe0', stock: 8, sku: 'SKIRT-BEI-M' },
    ],
    rating: 4.7,
    reviewCount: 22,
    soldCount: 110,
    isFeatured: false,
    isNewArrival: false,
    status: 'ACTIVE',
    createdAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Áo Blazer Relaxed-Fit Unisex',
    slug: 'ao-blazer-relaxed-fit-unisex',
    categoryId: 'cat-4',
    brand: 'Maison Studio',
    price: 990000,
    salePrice: 849000,
    description: 'Áo khoác blazer phom rộng phóng khoáng, ve áo cổ điển, lót lụa mềm mượt bên trong mang đến cảm giác thoải mái và diện mạo chuẩn thời trang cao cấp.',
    details: ['Wool Blend cao cấp nhẹ', 'Lót lụa habutai êm ái', 'Đệm vai mỏng tạo phom chuẩn', '2 túi có nắp ngoài và 1 túi ngực'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v7-1', productId: 'prod-7', size: 'M', color: 'Nâu Cà Phê', colorCode: '#78350f', stock: 8, sku: 'BLAZER-BRN-M' },
      { id: 'v7-2', productId: 'prod-7', size: 'L', color: 'Nâu Cà Phê', colorCode: '#78350f', stock: 5, sku: 'BLAZER-BRN-L' },
      { id: 'v7-3', productId: 'prod-7', size: 'M', color: 'Đen Than', colorCode: '#18181b', stock: 12, sku: 'BLAZER-BLK-M' },
      { id: 'v7-4', productId: 'prod-7', size: 'L', color: 'Đen Than', colorCode: '#18181b', stock: 10, sku: 'BLAZER-BLK-L' },
    ],
    rating: 5.0,
    reviewCount: 38,
    soldCount: 145,
    isFeatured: true,
    isNewArrival: true,
    status: 'ACTIVE',
    createdAt: '2025-01-20T12:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Áo Khoác Bomber Minimalist Lót Gió',
    slug: 'ao-khoac-bomber-minimalist-lot-gio',
    categoryId: 'cat-4',
    brand: 'Maison Sport',
    price: 790000,
    salePrice: 650000,
    description: 'Bomber jacket chất liệu trượt nước nhẹ, bo chun cổ và tay áo co giãn êm ái, thích hợp cho thời tiết se lạnh và những chuyến vi vu dạo phố.',
    details: ['Nylon trượt nước DWR', 'Khóa kéo kim loại 2 chiều trơn tru', 'Lớp lót chống tĩnh điện', 'Bo cổ dệt kim dày dặn'],
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v8-1', productId: 'prod-8', size: 'M', color: 'Xanh Rêu Đậm', colorCode: '#365314', stock: 16, sku: 'BOMBER-GRN-M' },
      { id: 'v8-2', productId: 'prod-8', size: 'L', color: 'Xanh Rêu Đậm', colorCode: '#365314', stock: 11, sku: 'BOMBER-GRN-L' },
      { id: 'v8-3', productId: 'prod-8', size: 'XL', color: 'Đen Mờ', colorCode: '#27272a', stock: 7, sku: 'BOMBER-BLK-XL' },
    ],
    rating: 4.8,
    reviewCount: 19,
    soldCount: 92,
    isFeatured: false,
    isNewArrival: true,
    status: 'ACTIVE',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'prod-9',
    name: 'Áo Hoodie Oversize Nỉ Bông Cotton',
    slug: 'ao-hoodie-oversize-ni-bong-cotton',
    categoryId: 'cat-5',
    brand: 'Maison Street',
    price: 550000,
    salePrice: 429000,
    description: 'Áo hoodie phom rộng đường phố chất vải nỉ chân cua 380gsm siêu dày dặn, lớp lót mịn màng giữ ấm cơ thể trong những ngày mùa đông.',
    details: ['Vải nỉ chân cua 380gsm dầy', 'Mũ trùm đầu 2 lớp đứng form', 'Túi kangaroo rộng rãi', 'Dây rút cotton dẹt cùng màu'],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v9-1', productId: 'prod-9', size: 'M', color: 'Xám Tiêu', colorCode: '#9ca3af', stock: 20, sku: 'HOODIE-GRY-M' },
      { id: 'v9-2', productId: 'prod-9', size: 'L', color: 'Xám Tiêu', colorCode: '#9ca3af', stock: 14, sku: 'HOODIE-GRY-L' },
      { id: 'v9-3', productId: 'prod-9', size: 'M', color: 'Beige Ấm', colorCode: '#f5ebe0', stock: 18, sku: 'HOODIE-BEI-M' },
      { id: 'v9-4', productId: 'prod-9', size: 'L', color: 'Beige Ấm', colorCode: '#f5ebe0', stock: 9, sku: 'HOODIE-BEI-L' },
    ],
    rating: 4.9,
    reviewCount: 65,
    soldCount: 410,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: true,
    status: 'ACTIVE',
    createdAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'prod-10',
    name: 'Áo Sweater Cổ Tròn Dệt Kim Tối Giản',
    slug: 'ao-sweater-co-tron-det-kim-toi-gian',
    categoryId: 'cat-5',
    brand: 'Maison Studio',
    price: 480000,
    salePrice: 390000,
    description: 'Sweater dệt kim sợi len pha cotton mềm mượt, không ngứa, phom dáng thanh mảnh thích hợp mặc đơn hoặc mặc layer bên trong áo sơ mi/blazer.',
    details: ['Sợi dệt 50% Cotton, 50% Acrylic mềm mại', 'Cổ tròn co giãn linh hoạt', 'Đường dệt rib ở gấu và tay áo'],
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v10-1', productId: 'prod-10', size: 'M', color: 'Xanh Navy', colorCode: '#172554', stock: 15, sku: 'SWEATER-NVY-M' },
      { id: 'v10-2', productId: 'prod-10', size: 'L', color: 'Xanh Navy', colorCode: '#172554', stock: 10, sku: 'SWEATER-NVY-L' },
      { id: 'v10-3', productId: 'prod-10', size: 'M', color: 'Trắng Sữa', colorCode: '#fafaf9', stock: 22, sku: 'SWEATER-CRM-M' },
      { id: 'v10-4', productId: 'prod-10', size: 'L', color: 'Trắng Sữa', colorCode: '#fafaf9', stock: 6, sku: 'SWEATER-CRM-L' },
    ],
    rating: 4.8,
    reviewCount: 28,
    soldCount: 175,
    isFeatured: false,
    isNewArrival: true,
    status: 'ACTIVE',
    createdAt: '2025-01-17T15:00:00Z',
  },
  {
    id: 'prod-11',
    name: 'Túi Xách Da Minimalist Tote Bag',
    slug: 'tui-xach-da-minimalist-tote-bag',
    categoryId: 'cat-6',
    brand: 'Maison Leather',
    price: 850000,
    salePrice: 699000,
    description: 'Túi tote da PU vi sợi hạt mịn chống trầy cao cấp, ngăn chứa rộng đựng vừa laptop 14 inch cùng sổ tay, tài liệu cho ngày làm việc năng động.',
    details: ['Da tổng hợp sợi siêu mịn Microfiber', 'Ngăn chống sốc đựng laptop 14"', 'Khóa nam châm hít chắc chắn', 'Quai đeo chịu lực 8kg'],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v11-1', productId: 'prod-11', size: 'FreeSize', color: 'Nâu Da Bò', colorCode: '#78350f', stock: 15, sku: 'TOTE-BRN' },
      { id: 'v11-2', productId: 'prod-11', size: 'FreeSize', color: 'Đen Huyền', colorCode: '#000000', stock: 20, sku: 'TOTE-BLK' },
    ],
    rating: 4.9,
    reviewCount: 33,
    soldCount: 150,
    isFeatured: true,
    isNewArrival: false,
    status: 'ACTIVE',
    createdAt: '2025-01-12T13:00:00Z',
  },
  {
    id: 'prod-12',
    name: 'Thắt Lưng Da Bò Khóa Kim Loại Phay Xước',
    slug: 'that-lung-da-bo-khoa-kim-loai-phay-xuoc',
    categoryId: 'cat-6',
    brand: 'Maison Leather',
    price: 350000,
    salePrice: 280000,
    description: 'Dây nịt da bò thật 100% nguyên tấm bền bỉ, mặt khóa hợp kim mạ titan phay xước chống gỉ tạo phong cách nam tính sang trọng.',
    details: ['100% Da bò thật nguyên tấm', 'Bản rộng 3.4cm tiêu chuẩn', 'Khóa kim loại chống hoen gỉ'],
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v12-1', productId: 'prod-12', size: '110cm', color: 'Đen Mờ', colorCode: '#18181b', stock: 30, sku: 'BELT-BLK-110' },
      { id: 'v12-2', productId: 'prod-12', size: '115cm', color: 'Nâu Đậm', colorCode: '#451a03', stock: 18, sku: 'BELT-BRN-115' },
    ],
    rating: 4.8,
    reviewCount: 17,
    soldCount: 95,
    isFeatured: false,
    isNewArrival: false,
    status: 'ACTIVE',
    createdAt: '2025-01-09T10:00:00Z',
  },
  {
    id: 'prod-13',
    name: 'Áo Polo Pique Cotton Dệt Tổ Ong',
    slug: 'ao-polo-pique-cotton-det-to-ong',
    categoryId: 'cat-1',
    brand: 'Maison Studio',
    price: 390000,
    salePrice: 320000,
    description: 'Polo pique mắt chim dệt tổ ong thấm hút mồ hôi tối đa, cổ dệt jacquard bền đẹp giúp giữ vẻ lịch sự trong cả công việc lẫn các buổi gặp gỡ bạn bè.',
    details: ['Vải pique cá sấu dệt tổ ong', 'Thành phần 95% cotton 5% spandex', 'Cúc áo khắc laser thương hiệu'],
    images: [
      'https://images.unsplash.com/photo-1625910513413-568393527a20?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v13-1', productId: 'prod-13', size: 'M', color: 'Trắng', colorCode: '#ffffff', stock: 18, sku: 'POLO-WHT-M' },
      { id: 'v13-2', productId: 'prod-13', size: 'L', color: 'Trắng', colorCode: '#ffffff', stock: 12, sku: 'POLO-WHT-L' },
      { id: 'v13-3', productId: 'prod-13', size: 'M', color: 'Xanh Rêu', colorCode: '#365314', stock: 14, sku: 'POLO-GRN-M' },
      { id: 'v13-4', productId: 'prod-13', size: 'L', color: 'Xanh Rêu', colorCode: '#365314', stock: 8, sku: 'POLO-GRN-L' },
    ],
    rating: 4.7,
    reviewCount: 25,
    soldCount: 140,
    isFeatured: false,
    isNewArrival: true,
    status: 'ACTIVE',
    createdAt: '2025-01-19T08:00:00Z',
  },
  {
    id: 'prod-14',
    name: 'Quần Khaki Chino Dáng Suông Hiện Đại',
    slug: 'quan-khaki-chino-dang-suong-hien-dai',
    categoryId: 'cat-2',
    brand: 'Maison Casual',
    price: 490000,
    salePrice: 410000,
    description: 'Chino chất vải kaki cotton chéo dầy, co giãn nhẹ. Thiết kế phom suông vừa vặn, dễ dàng phối cùng sneaker và áo thun hoặc áo sơ mi.',
    details: ['Kaki dệt chéo 100% cotton', 'Wash mềm chống nhăn và chống co rút', 'Túi mổ sau có khuy gài thanh lịch'],
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v14-1', productId: 'prod-14', size: '30', color: 'Beige Cát', colorCode: '#e7d8c9', stock: 15, sku: 'CHINO-BEI-30' },
      { id: 'v14-2', productId: 'prod-14', size: '31', color: 'Beige Cát', colorCode: '#e7d8c9', stock: 11, sku: 'CHINO-BEI-31' },
      { id: 'v14-3', productId: 'prod-14', size: '32', color: 'Xanh Đen', colorCode: '#0f172a', stock: 16, sku: 'CHINO-NVY-32' },
    ],
    rating: 4.8,
    reviewCount: 31,
    soldCount: 180,
    isFeatured: false,
    isNewArrival: false,
    status: 'ACTIVE',
    createdAt: '2025-01-11T11:00:00Z',
  },
  {
    id: 'prod-15',
    name: 'Áo Khoác Trench Coat Dáng Dài Thu Đông',
    slug: 'ao-khoac-trench-coat-dang-dai-thu-dong',
    categoryId: 'cat-4',
    brand: 'Maison Bespoke',
    price: 1450000,
    salePrice: 1190000,
    description: 'Chiếc áo khoác trench coat kinh điển với đai thắt eo và ve cổ lớn sang trọng. Vải gabardine cản gió và chống thấm nước mưa nhẹ xuất sắc.',
    details: ['Vải cotton gabardine tráng cản gió', 'Khuy cài sừng tự nhiên', 'Đai lưng và đai cổ tay điều chỉnh linh hoạt'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v15-1', productId: 'prod-15', size: 'M', color: 'Beige Cổ Điển', colorCode: '#d4b996', stock: 6, sku: 'TRENCH-BEI-M' },
      { id: 'v15-2', productId: 'prod-15', size: 'L', color: 'Beige Cổ Điển', colorCode: '#d4b996', stock: 4, sku: 'TRENCH-BEI-L' },
      { id: 'v15-3', productId: 'prod-15', size: 'M', color: 'Đen Quý Phái', colorCode: '#111827', stock: 5, sku: 'TRENCH-BLK-M' },
    ],
    rating: 4.9,
    reviewCount: 16,
    soldCount: 55,
    isFeatured: true,
    isNewArrival: true,
    status: 'ACTIVE',
    createdAt: '2025-01-21T10:00:00Z',
  },
  {
    id: 'prod-16',
    name: 'Mũ Beanie Len Dệt Kim Ấm Áp',
    slug: 'mu-beanie-len-det-kim-am-ap',
    categoryId: 'cat-6',
    brand: 'Maison Street',
    price: 190000,
    salePrice: 149000,
    description: 'Nón len dệt kim gân co giãn 4 chiều vừa vặn mọi cỡ đầu, giữ ấm đầu và tạo điểm nhấn cực chất cho outfit mùa lạnh.',
    details: ['Len Merino pha acrylic cao cấp không xù', 'Logo dệt tag Maison dập nổi'],
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v16-1', productId: 'prod-16', size: 'FreeSize', color: 'Đen', colorCode: '#000000', stock: 25, sku: 'BEANIE-BLK' },
      { id: 'v16-2', productId: 'prod-16', size: 'FreeSize', color: 'Xám Ghi', colorCode: '#6b7280', stock: 22, sku: 'BEANIE-GRY' },
      { id: 'v16-3', productId: 'prod-16', size: 'FreeSize', color: 'Vàng Mù Tạt', colorCode: '#ca8a04', stock: 14, sku: 'BEANIE-YEL' },
    ],
    rating: 4.8,
    reviewCount: 24,
    soldCount: 188,
    isFeatured: false,
    isNewArrival: false,
    status: 'ACTIVE',
    createdAt: '2025-01-07T12:00:00Z',
  }
];

export const INITIAL_REVIEWS: ReviewData[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'Áo Thun Basic Heavyweight Cotton',
    userId: 'user-2',
    userName: 'Minh Hoàng',
    rating: 5,
    comment: 'Chất vải thun rất dày dặn, giặt máy 3 lần rồi vẫn không hề bị giãn cổ. Form áo mặc lên rất đứng dáng!',
    status: 'APPROVED',
    createdAt: '2025-01-15T14:20:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    productName: 'Áo Thun Basic Heavyweight Cotton',
    userId: 'user-3',
    userName: 'Thùy Trang',
    rating: 5,
    comment: 'Giao hàng siêu nhanh, đóng gói hộp cứng rất sang xịn mịn. Màu đen rất tuyền, vải mát không bị nóng.',
    status: 'APPROVED',
    createdAt: '2025-01-18T10:15:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-4',
    productName: 'Quần Jeans Denim Vintage Straight Leg',
    userId: 'user-2',
    userName: 'Minh Hoàng',
    rating: 5,
    comment: 'Quần lên dáng chuẩn straight leg che khuyết điểm chân tốt, màu wash chàm cực kỳ thời trang.',
    status: 'APPROVED',
    createdAt: '2025-01-20T16:45:00Z',
  },
  {
    id: 'rev-4',
    productId: 'prod-7',
    productName: 'Áo Blazer Relaxed-Fit Unisex',
    userId: 'user-4',
    userName: 'Thanh Nhã',
    rating: 5,
    comment: 'Mặc đi làm hay đi tiệc nhẹ đều rất sang. Lớp lót lụa mềm mượt, ve áo sắc nét chuẩn may đo.',
    status: 'APPROVED',
    createdAt: '2025-01-22T08:30:00Z',
  },
];
