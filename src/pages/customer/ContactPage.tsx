import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const { success } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    success('Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong 24 giờ.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-zinc-950">
          Tư Vấn & Báo Giá Setup Spa
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Chuyên gia tư vấn kỹ thuật giường spa sẵn sàng hỗ trợ thiết kế không gian & báo giá dự toán 24/7
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="bg-zinc-950 text-white rounded-3xl p-8 space-y-8 shadow-xl">
          <div>
            <h3 className="font-serif-title text-xl font-bold">DAILY GIƯỜNG SPA Showroom & Factory</h3>
            <p className="text-xs text-zinc-400 mt-1">Trải nghiệm trực tiếp 50+ mẫu giường spa và thiết bị</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <strong className="text-white block">Showroom trưng bày:</strong>
                <p className="text-zinc-300">158 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <strong className="text-white block">Xưởng mộc & bọc đệm da:</strong>
                <p className="text-zinc-300">KCN Tân Bình, Tây Thạnh, Quận Tân Phú, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <strong className="text-white block">Hotline kỹ thuật & báo giá:</strong>
                <p className="text-zinc-300">1900 6868 (08:30 - 22:00 hàng ngày)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <strong className="text-white block">Email nhận hồ sơ dự thầu & báo giá:</strong>
                <p className="text-zinc-300">contact@dailygiuongspa.vn</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <strong className="text-white block">Giờ mở cửa đón tiếp:</strong>
                <p className="text-zinc-300">08:30 - 20:30 hàng ngày (Kể cả Thứ 7 & Chủ Nhật)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Họ tên của bạn *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Địa chỉ Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Tư vấn kích cỡ, chính sách đổi trả..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Nội dung tin nhắn *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Vui lòng để lại lời nhắn chi tiết..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Gửi Tin Nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
