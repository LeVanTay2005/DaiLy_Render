import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit2, Eye, EyeOff, X } from 'lucide-react';
import { api } from '../../services/api';
import { Banner } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'NEW COLLECTION 2025',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600',
    buttonText: 'Khám Phá Ngay',
    position: 'HERO' as 'HERO' | 'PROMO' | 'MIDDLE',
    order: 1,
    active: true,
  });

  const { success, error } = useNotification();

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await api.admin.banners.getAll();
      if (res.success && res.data) {
        setBanners(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'BỘ SƯU TẬP MỚI',
      link: '/products',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600',
      buttonText: 'Xem Sản Phẩm',
      position: 'HERO',
      order: banners.length + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      error('Vui lòng nhập tiêu đề và link ảnh');
      return;
    }

    try {
      if (editingBanner) {
        const res = await api.admin.banners.update(editingBanner.id, formData);
        if (res.success) {
          success('Cập nhật banner thành công!');
          setIsModalOpen(false);
          loadBanners();
        }
      } else {
        const res = await api.admin.banners.create(formData);
        if (res.success) {
          success('Tạo banner mới thành công!');
          setIsModalOpen(false);
          loadBanners();
        }
      }
    } catch (err: any) {
      error(err.message || 'Lỗi lưu banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      const res = await api.admin.banners.delete(id);
      if (res.success) {
        success('Đã xóa banner');
        loadBanners();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi xóa banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Banner & Slider</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Điều chỉnh các banner nổi bật ngoài trang chủ của khách hàng
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Thêm Banner Mới
        </button>
      </div>

      {/* Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs">
            Đang tải danh sách banner...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs">
            Chưa có banner nào
          </div>
        ) : (
          banners.map(banner => (
            <div
              key={banner.id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="h-52 relative overflow-hidden bg-zinc-900">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  {banner.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-zinc-950 inline-block mb-1">
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-white leading-snug">{banner.title}</h3>
                  <p className="text-xs text-zinc-300 line-clamp-1">{banner.subtitle}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      banner.active
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {banner.active ? 'Đang hiển thị' : 'Đang ẩn'}
                  </span>
                  <span>Vị trí: {banner.position}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <h3 className="text-lg font-bold text-white">Thêm Banner Trang Chủ</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tiêu đề banner *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: BST Thu Đông 2025: Bản Giao Hưởng Thời Gian"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Phụ đề / Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Tinh tế trong từng đường may, thanh lịch trong từng chuyển động..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Link ảnh Banner (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Thẻ gắn (Badge)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Đường dẫn liên kết (Link)
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
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
                  Tạo Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
