import React from 'react';
import { Sparkles, Shield, Heart, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">
          CÂU CHUYỆN THƯƠNG HIỆU
        </span>
        <h1 className="font-serif-title text-3xl sm:text-5xl font-bold text-zinc-950">
          DAILY GIƯỜNG SPA VIỆT NAM
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Được thành lập với sứ mệnh mang đến giải pháp giường thẩm mỹ, giường gội đầu dưỡng sinh và giường massage tiêu chuẩn y khoa hàng đầu. DaiLy Giường Spa tự hào đồng hành cùng hơn 2.500+ viện thẩm mỹ, spa và clinic nâng tầm đẳng cấp thương hiệu.
        </p>
      </div>

      {/* Hero Image */}
      <div className="rounded-3xl overflow-hidden aspect-[21/9] bg-zinc-100 shadow-xl">
        <img
          src="/images/products/giuong-tiem-dien.jpg"
          alt="DaiLy Giường Spa Showroom"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-950">Động Cơ Điện & Khung Chịu Tải</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Hệ thống động cơ điện tử tiêu chuẩn CE Châu Âu vận hành êm ái, nâng hạ mượt mà cùng khung thép tĩnh điện & gỗ sồi tự nhiên chịu tải lên đến 350kg.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-950">Da PU Y Tế & Mút D40</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Chất liệu da PU y tế kháng khuẩn, chống thấm tinh dầu và cồn sát khuẩn. Đệm mút D40 đúc nguyên khối chống xẹp lún hoàn hảo sau nhiều năm trị liệu.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-950">Bảo Hành 24T & Bảo Trì Trọn Đời</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Cam kết bảo hành chính hãng 24 tháng cho động cơ điện tử, hỗ trợ linh kiện thay thế chính hãng và đội ngũ kỹ thuật viên lắp đặt tận nơi toàn quốc.
          </p>
        </div>
      </div>
    </div>
  );
};
