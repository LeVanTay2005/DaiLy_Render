import React, { useState, useEffect } from 'react';
import { Settings, Save, Store, CreditCard, Truck, Phone, Mail, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { StoreSettings } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Maison Fashion Studio',
    phone: '1900 6868',
    email: 'contact@maisonfashion.vn',
    address: '158 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    openingHours: '08:30 - 22:00 hàng ngày',
    shippingFeeStandard: 30000,
    freeShippingThreshold: 500000,
    bankName: 'Techcombank (Ngân hàng TMCP Kỹ thương Việt Nam)',
    bankAccountNumber: '19036888999888',
    bankAccountName: 'CONG TY TNHH THOI TRANG MAISON VIETNAM',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error } = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.admin.settings.get();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err: any) {
        error(err.message || 'Lỗi tải thông tin cài đặt');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.admin.settings.update(settings);
      if (res.success) {
        success('Lưu cài đặt cửa hàng thành công!');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi lưu thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cài Đặt Cửa Hàng</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Cấu hình thông tin liên hệ, chính sách vận chuyển và tài khoản thanh toán chuyển khoản
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Store Info */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Store className="w-4 h-4 text-zinc-400" /> Thông Tin Thương Hiệu & Showroom
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tên cửa hàng / Thương hiệu
              </label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Hotline chăm sóc khách hàng
              </label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email liên hệ chính thức
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Thời gian làm việc
              </label>
              <input
                type="text"
                value={settings.openingHours}
                onChange={e => setSettings({ ...settings, openingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Địa chỉ showroom chính
            </label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Shipping settings */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Truck className="w-4 h-4 text-zinc-400" /> Cấu Hình Phí Giao Hàng Toàn Quốc
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Phí vận chuyển tiêu chuẩn (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                required
                value={settings.shippingFeeStandard}
                onChange={e => setSettings({ ...settings, shippingFeeStandard: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Đạt đơn hàng miễn phí vận chuyển (Freeship từ) (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                required
                value={settings.freeShippingThreshold}
                onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bank transfer settings */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <CreditCard className="w-4 h-4 text-zinc-400" /> Tài Khoản Ngân Hàng Nhận Chuyển Khoản
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Ngân hàng thụ hưởng
              </label>
              <input
                type="text"
                required
                value={settings.bankName}
                onChange={e => setSettings({ ...settings, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Số tài khoản (STK)
              </label>
              <input
                type="text"
                required
                value={settings.bankAccountNumber}
                onChange={e => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tên chủ tài khoản
              </label>
              <input
                type="text"
                required
                value={settings.bankAccountName}
                onChange={e => setSettings({ ...settings, bankAccountName: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white uppercase focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu cài đặt...' : 'Lưu Thay Đổi Cài Đặt'}
          </button>
        </div>
      </form>
    </div>
  );
};
