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
          Maison Fashion Studio
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Được thành lập từ niềm đam mê dành cho nghệ thuật cắt may chuẩn xác và chất liệu sợi tự nhiên nguyên bản, Maison mang đến giải pháp thời trang thanh lịch, tối giản và bền bỉ qua năm tháng.
        </p>
      </div>

      {/* Hero Image */}
      <div className="rounded-3xl overflow-hidden aspect-[21/9] bg-zinc-100 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600"
          alt="Maison Atelier"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-950">Chất Liệu Thượng Hạng</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            100% sợi len merino, lụa Mulberry và cotton Pima được tuyển chọn khắt khe từ các xưởng dệt truyền thống uy tín.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-950">May Đo Tinh Xảo</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Mỗi phom dáng được nghiên cứu dựa trên tỷ lệ hình thể người Á Đông, đảm bảo sự vừa vặn tự nhiên và linh hoạt tối đa.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-950">Bền Vững & Nhân Văn</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Nói không với thời trang nhanh dùng một lần. Chúng tôi kiến tạo những bộ trang phục đồng hành cùng bạn qua nhiều mùa.
          </p>
        </div>
      </div>
    </div>
  );
};
