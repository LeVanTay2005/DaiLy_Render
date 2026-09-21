import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/products
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      categorySlug,
      categoryId,
      search,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      sort,
      page,
      limit,
      sale,
    } = req.query;

    const result = db.listProducts({
      categorySlug: categorySlug as string,
      categoryId: categoryId as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      brand: brand as string,
      size: size as string,
      color: color as string,
      sort: sort as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 16,
      status: 'ACTIVE',
    });

    // If sale filter is active
    let products = result.products;
    if (sale === 'true') {
      products = products.filter(p => p.salePrice && p.salePrice < p.price);
    }

    return res.json({
      success: true,
      data: {
        products,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách sản phẩm', error: error.message });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    let product = db.findProductById(idOrSlug);
    if (!product) {
      product = db.findProductBySlug(idOrSlug);
    }

    if (!product || product.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh' });
    }

    // Get product reviews
    const reviews = db.listReviews(product.id);

    // Get related products (same category)
    const related = db.listProducts({
      categoryId: product.categoryId,
      limit: 4,
    }).products.filter(p => p.id !== product!.id);

    return res.json({
      success: true,
      data: {
        product,
        reviews,
        related,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải chi tiết sản phẩm', error: error.message });
  }
});

export default router;
