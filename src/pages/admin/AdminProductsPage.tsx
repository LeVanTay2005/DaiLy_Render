import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Layers,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category, ProductVariant } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    brand: 'Maison',
    price: 0,
    salePrice: 0,
    description: '',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    variants: [
      { id: '1', size: 'S', color: 'Đen', colorCode: '#000000', stock: 20, sku: 'MSN-S-BLK' },
      { id: '2', size: 'M', color: 'Đen', colorCode: '#000000', stock: 35, sku: 'MSN-M-BLK' },
      { id: '3', size: 'L', color: 'Đen', colorCode: '#000000', stock: 25, sku: 'MSN-L-BLK' },
    ],
  });

  const { success, error } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.admin.products.getAll({
          search,
          categoryId: selectedCategory,
          status: selectedStatus,
          limit: 100,
        }),
        api.admin.categories.getAll(),
      ]);

      if (prodRes.success && prodRes.data?.products) {
        setProducts(prodRes.data.products);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedStatus]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      brand: 'Maison',
      price: 350000,
      salePrice: 0,
      description: '',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
      isFeatured: false,
      isNewArrival: true,
      isFlashSale: false,
      status: 'ACTIVE',
      variants: [
        { id: 'v1', size: 'S', color: 'Đen', colorCode: '#111827', stock: 20, sku: 'VAR-S' },
        { id: 'v2', size: 'M', color: 'Đen', colorCode: '#111827', stock: 30, sku: 'VAR-M' },
        { id: 'v3', size: 'L', color: 'Đen', colorCode: '#111827', stock: 15, sku: 'VAR-L' },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      categoryId: p.categoryId,
      brand: p.brand || 'Maison',
      price: p.price,
      salePrice: p.salePrice || 0,
      description: p.description,
      images: p.images.length ? p.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
      isFlashSale: Boolean(p.isFlashSale),
      status: p.status,
      variants: p.variants.map((v, i) => ({
        id: v.id || `var-${i}`,
        size: v.size,
        color: v.color,
        colorCode: v.colorCode || '#000000',
        stock: v.stock,
        sku: v.sku,
      })),
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!formData.categoryId) {
      error('Vui lòng chọn danh mục');
      return;
    }

    try {
      if (editingProduct) {
        const res = await api.admin.products.update(editingProduct.id, formData);
        if (res.success) {
          success('Cập nhật sản phẩm thành công!');
          setIsModalOpen(false);
          loadData();
        }
      } else {
        const res = await api.admin.products.create(formData);
        if (res.success) {
          success('Thêm sản phẩm mới thành công!');
          setIsModalOpen(false);
          loadData();
        }
      }
    } catch (err: any) {
      error(err.message || 'Lỗi lưu sản phẩm');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await api.admin.products.delete(id);
      if (res.success) {
        success('Đã xóa sản phẩm thành công');
        setDeleteConfirmId(null);
        loadData();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi xóa sản phẩm');
    }
  };

  const addVariantRow = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `var-${Date.now()}`,
          size: 'XL',
          color: 'Trắng',
          colorCode: '#FFFFFF',
          stock: 10,
          sku: `SKU-${Date.now().toString().slice(-4)}`,
        },
      ],
    }));
  };

  const removeVariantRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Sản Phẩm</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng cộng <strong className="text-white">{products.length}</strong> sản phẩm thời trang trong kho
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán (ACTIVE)</option>
            <option value="INACTIVE">Tạm dừng (INACTIVE)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Sản Phẩm</th>
                <th className="px-4 py-3.5">Danh Mục</th>
                <th className="px-4 py-3.5">Giá Bán</th>
                <th className="px-4 py-3.5">Tồn Kho</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Không tìm thấy sản phẩm nào phù hợp
                  </td>
                </tr>
              ) : (
                products.map(p => {
                  const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                  const cat = categories.find(c => c.id === p.categoryId);

                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-white text-sm truncate">{p.name}</p>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {p.variants?.length || 0} phân loại • {p.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-zinc-300 font-medium">
                        {cat?.name || 'Chung'}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-white font-mono">
                          {(p.salePrice || p.price).toLocaleString('vi-VN')}đ
                        </p>
                        {p.salePrice && p.salePrice < p.price && (
                          <p className="text-[10px] text-zinc-500 line-through font-mono">
                            {p.price.toLocaleString('vi-VN')}đ
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold ${
                            totalStock < 10 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {totalStock} cái
                        </span>
                        {totalStock < 10 && (
                          <span className="block text-[10px] text-rose-500 font-medium">Sắp hết hàng</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {p.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Xác nhận xóa sản phẩm?</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Hành động này sẽ xóa vĩnh viễn sản phẩm và các biến thể phân loại khỏi hệ thống cửa hàng.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full my-8 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Áo Sơ Mi Lụa Cổ V Maison"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Danh mục *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Maison"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Price & Sale Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Giá gốc (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Giá khuyến mãi (VNĐ) (để 0 nếu không giảm)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.salePrice}
                    onChange={e => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Link ảnh chính (URL)
                </label>
                <input
                  type="url"
                  required
                  value={formData.images[0] || ''}
                  onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mô tả chi tiết sản phẩm
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Chất liệu 100% sợi dệt tự nhiên thoáng mát, co giãn nhẹ nhàng, phù hợp mặc công sở và dạo phố..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Variants Section */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-200">
                    Phân loại biến thể (Size / Màu / Tồn kho)
                  </span>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    + Thêm phân loại
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs">
                      <input
                        type="text"
                        value={v.size}
                        placeholder="Size"
                        onChange={e => {
                          const updated = [...formData.variants];
                          updated[i].size = e.target.value;
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-center text-white"
                      />
                      <input
                        type="text"
                        value={v.color}
                        placeholder="Màu sắc"
                        onChange={e => {
                          const updated = [...formData.variants];
                          updated[i].color = e.target.value;
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="w-24 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white"
                      />
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        placeholder="Kho"
                        onChange={e => {
                          const updated = [...formData.variants];
                          updated[i].stock = Number(e.target.value);
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="w-20 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-center text-white"
                      />
                      <input
                        type="text"
                        value={v.sku}
                        placeholder="Mã SKU"
                        onChange={e => {
                          const updated = [...formData.variants];
                          updated[i].sku = e.target.value;
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white font-mono text-[11px]"
                      />
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantRow(i)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Options */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.status === 'ACTIVE'}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })
                    }
                    className="rounded bg-zinc-950 border-zinc-800 text-white w-4 h-4"
                  />
                  <span>Đăng bán ngay lập tức (Status: ACTIVE)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded bg-zinc-950 border-zinc-800 text-white w-4 h-4"
                  />
                  <span>Sản phẩm nổi bật</span>
                </label>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  {editingProduct ? 'Cập Nhật' : 'Tạo Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
