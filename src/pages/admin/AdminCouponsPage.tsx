import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Edit2, Calendar, Percent, DollarSign, X } from 'lucide-react';
import { api } from '../../services/api';
import { Coupon } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: 10,
    minOrderValue: 200000,
    maxDiscount: 50000,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const { success, error } = useNotification();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.admin.coupons.getAll();
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderValue: 200000,
      maxDiscount: 50000,
      usageLimit: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      error('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      if (editingCoupon) {
        const res = await api.admin.coupons.update(editingCoupon.id, formData);
        if (res.success) {
          success('Cập nhật mã giảm giá thành công!');
          setIsModalOpen(false);
          loadCoupons();
        }
      } else {
        const res = await api.admin.coupons.create(formData);
        if (res.success) {
          success('Tạo mã giảm giá mới thành công!');
          setIsModalOpen(false);
          loadCoupons();
        }
      }
    } catch (err: any) {
      error(err.message || 'Lỗi lưu mã giảm giá');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    try {
      const res = await api.admin.coupons.delete(id);
      if (res.success) {
        success('Đã xóa mã giảm giá thành công');
        loadCoupons();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi xóa mã');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Mã Giảm Giá</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Thiết lập voucher khuyến mãi, giảm theo % hoặc số tiền cố định
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Tạo Mã Giảm Giá Mới
        </button>
      </div>

      {/* Coupon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs">
            Đang tải danh sách coupon...
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs">
            Chưa có mã giảm giá nào được tạo
          </div>
        ) : (
          coupons.map(coupon => (
            <div
              key={coupon.id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Row */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-base font-extrabold text-white tracking-wider px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700">
                    {coupon.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      coupon.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {coupon.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-zinc-200 mb-1">
                  {coupon.description || 'Ưu đãi mua sắm thời trang'}
                </p>

                <div className="text-2xl font-extrabold text-emerald-400 my-2">
                  {coupon.discountType === 'PERCENT'
                    ? `Giảm ${coupon.discountValue}%`
                    : `Giảm ${coupon.discountValue.toLocaleString('vi-VN')}đ`}
                </div>

                <div className="text-xs text-zinc-400 space-y-1 pt-2 border-t border-zinc-800/80">
                  <p>
                    Đơn tối thiểu: <strong className="text-zinc-200">{coupon.minOrderValue.toLocaleString('vi-VN')}đ</strong>
                  </p>
                  {coupon.maxDiscount && (
                    <p>
                      Giảm tối đa: <strong className="text-zinc-200">{coupon.maxDiscount.toLocaleString('vi-VN')}đ</strong>
                    </p>
                  )}
                  <p>
                    Đã dùng: <strong className="text-zinc-200">{coupon.usedCount}</strong> / {coupon.usageLimit} lượt
                  </p>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1 pt-1">
                    <Calendar className="w-3.5 h-3.5" /> Hạn dùng: {coupon.startDate} đến {coupon.endDate}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <h3 className="text-lg font-bold text-white">Tạo Mã Giảm Giá Mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mã Voucher (Code) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VÍ DỤ: MAISON20, TET2025"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mô tả ưu đãi
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Giảm 20% cho bộ sưu tập xuân hè..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Loại giảm giá
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Giá trị giảm *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    placeholder={formData.discountType === 'PERCENT' ? '15' : '50000'}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Đơn hàng tối thiểu
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue}
                    onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Giảm tối đa (nếu có)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscount || ''}
                    onChange={e => setFormData({ ...formData, maxDiscount: Number(e.target.value) || undefined })}
                    placeholder="Không giới hạn"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Ngày hết hạn
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
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
                  Tạo Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
