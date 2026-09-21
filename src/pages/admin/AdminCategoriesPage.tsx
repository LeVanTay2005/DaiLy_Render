import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import { Category } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const { success, error } = useNotification();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.admin.categories.getAll();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      if (editingCategory) {
        const res = await api.admin.categories.update(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
        });
        if (res.success) {
          success('Cập nhật danh mục thành công!');
          setIsModalOpen(false);
          loadCategories();
        }
      } else {
        const res = await api.admin.categories.create({
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
        });
        if (res.success) {
          success('Thêm danh mục mới thành công!');
          setIsModalOpen(false);
          loadCategories();
        }
      }
    } catch (err: any) {
      error(err.message || 'Lỗi lưu danh mục');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này? Nếu còn sản phẩm thuộc danh mục, việc xóa sẽ bị chặn để bảo vệ dữ liệu.')) {
      return;
    }

    try {
      const res = await api.admin.categories.delete(id);
      if (res.success) {
        success('Đã xóa danh mục thành công');
        loadCategories();
      }
    } catch (err: any) {
      error(err.message || 'Không thể xóa danh mục');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Danh Mục</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng cộng <strong className="text-white">{categories.length}</strong> danh mục phân loại thời trang
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Thêm Danh Mục
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs">
            Đang tải danh mục...
          </div>
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="h-44 relative overflow-hidden bg-zinc-900">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700">
                      /{cat.slug}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{cat.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/90 text-zinc-950 text-xs font-bold shadow">
                    {cat.itemCount || 0} SP
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                  {cat.description || 'Chưa có mô tả chi tiết cho danh mục này.'}
                </p>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Áo Sơ Mi Nam"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Hình ảnh đại diện (URL)
                </label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mô tả ngắn gọn
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả phong cách và chất liệu tiêu biểu của nhóm hàng..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  {editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
