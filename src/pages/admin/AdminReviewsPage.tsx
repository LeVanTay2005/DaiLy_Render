import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Trash2, Search, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Review } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const { success, error } = useNotification();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.admin.reviews.getAll();
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.admin.reviews.toggleStatus(id);
      if (res.success) {
        success(res.message || 'Đã cập nhật trạng thái');
        loadReviews();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Xác nhận xóa đánh giá này vĩnh viễn?')) return;
    try {
      const res = await api.admin.reviews.delete(id);
      if (res.success) {
        success('Đã xóa đánh giá');
        loadReviews();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi xóa đánh giá');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kiểm Duyệt Đánh Giá</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Duyệt nhận xét và xếp hạng sao của khách hàng về sản phẩm
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Khách Hàng</th>
                <th className="px-4 py-3.5">Sản Phẩm</th>
                <th className="px-4 py-3.5">Số Sao</th>
                <th className="px-4 py-3.5">Nội Dung Đánh Giá</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Đang tải đánh giá...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Chưa có đánh giá nào từ khách hàng
                  </td>
                </tr>
              ) : (
                reviews.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-xs">
                          {r.userName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{r.userName}</p>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-semibold text-zinc-200 max-w-xs truncate">
                      {r.productName || r.productId}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-zinc-300 italic max-w-md line-clamp-2">
                        "{r.comment}"
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                          r.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}
                      >
                        {r.status === 'APPROVED' ? 'Đã duyệt' : 'Đang ẩn'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(r.id)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                          title={r.status === 'APPROVED' ? 'Ẩn đánh giá' : 'Hiển thị đánh giá'}
                        >
                          {r.status === 'APPROVED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
