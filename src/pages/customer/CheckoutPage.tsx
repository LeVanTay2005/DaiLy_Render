import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  ChevronLeft,
  Lock,
  Building,
  QrCode,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Phone,
  User,
  MapPin,
  Check,
  Copy,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { PaymentMethod } from '../../types';
import {
  VIETNAM_PROVINCES,
  validateFullName,
  validateVietnamesePhone,
  validateSpecificAddress,
  validateEmail,
  validateTaxId,
} from '../../data/vietnamAddressData';
import { getSafeProductImage, handleImageError } from '../../utils/imageHelper';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, couponCode, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useNotification();

  // Address cascading state
  const [selectedProvinceName, setSelectedProvinceName] = useState('TP. Hồ Chí Minh');
  const [selectedDistrictName, setSelectedDistrictName] = useState('Quận 1');
  const [selectedWardName, setSelectedWardName] = useState('Phường Bến Nghé');

  // Customer form fields
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    shippingAddress: user?.address || '',
    note: '',
  });

  // Touched state for inline validation
  const [touched, setTouched] = useState({
    customerName: false,
    customerPhone: false,
    customerEmail: false,
    shippingAddress: false,
    companyTaxId: false,
  });

  // Delivery method
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS_INSTALL'>('EXPRESS_INSTALL');

  // VAT Invoice options
  const [needVatInvoice, setNeedVatInvoice] = useState(false);
  const [vatData, setVatData] = useState({
    companyName: '',
    taxId: '',
    companyAddress: '',
    vatEmail: '',
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fake card details state for CREDIT_CARD
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Find districts for chosen province
  const currentProvince = useMemo(() => {
    return VIETNAM_PROVINCES.find(p => p.name === selectedProvinceName) || VIETNAM_PROVINCES[0];
  }, [selectedProvinceName]);

  // Find wards for chosen district
  const currentDistrict = useMemo(() => {
    return (
      currentProvince.districts.find(d => d.name === selectedDistrictName) ||
      currentProvince.districts[0]
    );
  }, [currentProvince, selectedDistrictName]);

  const availableWards = currentDistrict.wards;

  // Handle province change
  const handleProvinceChange = (provinceName: string) => {
    setSelectedProvinceName(provinceName);
    const newProv = VIETNAM_PROVINCES.find(p => p.name === provinceName);
    if (newProv && newProv.districts.length > 0) {
      const firstDistrict = newProv.districts[0];
      setSelectedDistrictName(firstDistrict.name);
      if (firstDistrict.wards.length > 0) {
        setSelectedWardName(firstDistrict.wards[0]);
      } else {
        setSelectedWardName('');
      }
    }
  };

  // Handle district change
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrictName(districtName);
    const dist = currentProvince.districts.find(d => d.name === districtName);
    if (dist && dist.wards.length > 0) {
      setSelectedWardName(dist.wards[0]);
    } else {
      setSelectedWardName('');
    }
  };

  // Validation results
  const nameValidation = useMemo(() => validateFullName(formData.customerName), [formData.customerName]);
  const phoneValidation = useMemo(() => validateVietnamesePhone(formData.customerPhone), [formData.customerPhone]);
  const addressValidation = useMemo(() => validateSpecificAddress(formData.shippingAddress), [formData.shippingAddress]);
  const emailValidation = useMemo(() => validateEmail(formData.customerEmail), [formData.customerEmail]);
  const vatTaxValidation = useMemo(() => {
    if (!needVatInvoice) return { isValid: true, message: '' };
    return validateTaxId(vatData.taxId);
  }, [needVatInvoice, vatData.taxId]);

  const isFormValid =
    nameValidation.isValid &&
    phoneValidation.isValid &&
    addressValidation.isValid &&
    emailValidation.isValid &&
    (!needVatInvoice || (vatTaxValidation.isValid && vatData.companyName.trim() !== ''));

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    success('Đã sao chép vào bộ nhớ tạm');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-title text-2xl font-bold text-zinc-900">
          Chưa có sản phẩm nào để thanh toán
        </h2>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all touched
    setTouched({
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      shippingAddress: true,
      companyTaxId: true,
    });

    if (!nameValidation.isValid) {
      error(nameValidation.message);
      return;
    }
    if (!phoneValidation.isValid) {
      error(phoneValidation.message);
      return;
    }
    if (!addressValidation.isValid) {
      error(addressValidation.message);
      return;
    }
    if (formData.customerEmail && !emailValidation.isValid) {
      error(emailValidation.message);
      return;
    }
    if (needVatInvoice) {
      if (!vatData.companyName.trim()) {
        error('Vui lòng nhập tên công ty/cơ sở spa xuất hóa đơn');
        return;
      }
      if (!vatTaxValidation.isValid) {
        error(vatTaxValidation.message);
        return;
      }
    }

    setSubmitting(true);
    try {
      const fullShippingAddress = `${formData.shippingAddress.trim()}`;
      const noteDetails = [
        formData.note.trim(),
        shippingMethod === 'EXPRESS_INSTALL' ? '[Yêu cầu: Kỹ thuật viên giao hỏa tốc & lắp đặt tại Clinic]' : '',
        needVatInvoice
          ? `[Xuất HĐ VAT: Cty: ${vatData.companyName} - MST: ${vatData.taxId} - ĐC: ${vatData.companyAddress} - Email HĐ: ${vatData.vatEmail}]`
          : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const orderPayload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim() || `${formData.customerPhone.trim()}@dailygiuongspa.com`,
        province: selectedProvinceName,
        district: selectedDistrictName,
        ward: selectedWardName,
        shippingAddress: fullShippingAddress,
        note: noteDetails,
        paymentMethod,
        couponCode: couponCode || undefined,
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.name || i.productName,
          sku: i.sku,
          size: i.size,
          color: i.color,
          price: i.price,
          quantity: i.quantity,
          imageUrl: getSafeProductImage(i.image, i.name || i.productName),
        })),
      };

      const res = await api.orders.create(orderPayload);
      if (res.success && res.data) {
        clearCart();
        success('Đặt hàng thành công!');
        navigate(`/order-success/${res.data.orderCode}`, {
          state: { order: res.data },
        });
      } else {
        error(res.message || 'Lỗi xử lý đơn hàng');
      }
    } catch (err: any) {
      error(err.message || 'Không thể tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-zinc-200 pb-5 gap-4">
        <Link
          to="/cart"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại giỏ hàng
        </Link>

        {/* Stepper */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-[10px] font-bold">1</span>
            Giỏ Hàng
          </span>
          <span className="text-zinc-300">→</span>
          <span className="flex items-center gap-1.5 text-zinc-950 font-bold">
            <span className="w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            Giao Hàng & Thanh Toán
          </span>
          <span className="text-zinc-300">→</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center text-[10px]">3</span>
            Hoàn Tất
          </span>
        </div>

        <span className="text-xs text-zinc-500 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" /> Mã hóa SSL 256-Bit
        </span>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Form: Shipping & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Thông tin người nhận hàng */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <Truck className="w-5 h-5 text-zinc-800" /> 1. Thông Tin Nhận Hàng & Địa Chỉ
              </h2>
              <span className="text-[11px] text-zinc-400 font-medium">* Bắt buộc điền chính xác</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-zinc-500" /> Họ và tên người nhận <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onBlur={() => setTouched(t => ({ ...t, customerName: true }))}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Ví dụ: Lê Văn Tây"
                  className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-xl text-xs text-zinc-900 focus:outline-none transition-all ${
                    touched.customerName && !nameValidation.isValid
                      ? 'border-rose-400 bg-rose-50/30 focus:ring-1 focus:ring-rose-500'
                      : 'border-zinc-300 focus:border-zinc-900 focus:bg-white'
                  }`}
                />
                {touched.customerName && !nameValidation.isValid && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {nameValidation.message}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" /> Số điện thoại người nhận <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={formData.customerPhone}
                  onBlur={() => setTouched(t => ({ ...t, customerPhone: true }))}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Ví dụ: 0932 436 080"
                  className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-xl text-xs text-zinc-900 focus:outline-none transition-all font-mono ${
                    touched.customerPhone && !phoneValidation.isValid
                      ? 'border-rose-400 bg-rose-50/30 focus:ring-1 focus:ring-rose-500'
                      : 'border-zinc-300 focus:border-zinc-900 focus:bg-white'
                  }`}
                />
                {touched.customerPhone && !phoneValidation.isValid && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {phoneValidation.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Email nhận hóa đơn & cập nhật lộ trình giao hàng (Tùy chọn)
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onBlur={() => setTouched(t => ({ ...t, customerEmail: true }))}
                onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="Ví dụ: spa.clinic@gmail.com"
                className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-xl text-xs text-zinc-900 focus:outline-none transition-all ${
                  touched.customerEmail && !emailValidation.isValid
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-zinc-300 focus:border-zinc-900 focus:bg-white'
                }`}
              />
              {touched.customerEmail && !emailValidation.isValid && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {emailValidation.message}
                </p>
              )}
            </div>

            {/* Cascading Address Selectors: Tỉnh -> Quận -> Phường */}
            <div className="pt-2 border-t border-zinc-100 space-y-3">
              <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-600" /> Khu vực hành chính nhận hàng:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tỉnh / TP */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    value={selectedProvinceName}
                    onChange={e => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all cursor-pointer"
                  >
                    {VIETNAM_PROVINCES.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quận / Huyện */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Quận / Huyện *
                  </label>
                  <select
                    value={selectedDistrictName}
                    onChange={e => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all cursor-pointer"
                  >
                    {currentProvince.districts.map(d => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phường / Xã */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Phường / Xã *
                  </label>
                  <select
                    value={selectedWardName}
                    onChange={e => setSelectedWardName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all cursor-pointer"
                  >
                    {availableWards.map(w => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Địa chỉ chi tiết (Chống gõ tầm bậy dsadsd) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Địa chỉ chi tiết (Số nhà, tên đường, toà nhà / Cơ sở Spa) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shippingAddress}
                onBlur={() => setTouched(t => ({ ...t, shippingAddress: true }))}
                onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                placeholder="Ví dụ: 125/4 Nguyễn Thị Minh Khai hoặc Viện Thẩm Mỹ SeoulSpa, 120 Hai Bà Trưng"
                className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-xl text-xs text-zinc-900 focus:outline-none transition-all ${
                  touched.shippingAddress && !addressValidation.isValid
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-1 focus:ring-rose-500'
                    : 'border-zinc-300 focus:border-zinc-900 focus:bg-white'
                }`}
              />
              {touched.shippingAddress && !addressValidation.isValid ? (
                <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1.5 leading-snug">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {addressValidation.message}
                </p>
              ) : (
                <p className="text-[11px] text-zinc-400 mt-1">
                  Đầy đủ: {formData.shippingAddress ? `${formData.shippingAddress}, ` : ''}{selectedWardName}, {selectedDistrictName}, {selectedProvinceName}
                </p>
              )}
            </div>

            {/* Ghi chú đơn hàng */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Ghi chú giao hàng & căn chỉnh (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                placeholder="Ví dụ: Giao lên lầu 2 có thang máy, gọi trước khi đến 30 phút..."
                className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 2: Hình thức giao hàng & Lắp đặt */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Clock className="w-5 h-5 text-zinc-800" /> 2. Hình Thức Vận Chuyển & Bàn Giao
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Standard */}
              <label
                onClick={() => setShippingMethod('STANDARD')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  shippingMethod === 'STANDARD'
                    ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-900">
                    <Truck className="w-4 h-4 text-zinc-700" /> Vận Chuyển Tiêu Chuẩn
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Miễn phí
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Giao hàng toàn quốc trong 2 - 4 ngày làm việc. Hỗ trợ bốc xếp tầng trệt an toàn.
                </p>
              </label>

              {/* Option 2: Express + Clinic Technician */}
              <label
                onClick={() => setShippingMethod('EXPRESS_INSTALL')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                  shippingMethod === 'EXPRESS_INSTALL'
                    ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-900">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Hỏa Tốc & Kỹ Thuật Viên Lắp Đặt
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Ưu đãi 0đ
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Kỹ thuật viên bàn giao tận nơi, đấu nối điện 4 động cơ, căn chỉnh cân bằng và hướng dẫn nhân viên spa vận hành.
                </p>
              </label>
            </div>
          </div>

          {/* Section 3: Phương thức thanh toán chuẩn chỉ */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <CreditCard className="w-5 h-5 text-zinc-800" /> 3. Phương Thức Thanh Toán
            </h2>

            <div className="space-y-3">
              {/* Method 1: Chuyển khoản VietQR */}
              <div
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-2">
                        Chuyển Khoản Ngân Hàng (VietQR 24/7)
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Khuyên dùng
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Quét mã QR tự động điền số tiền và nội dung, xác nhận đơn trong 2 phút
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center shrink-0">
                    {paymentMethod === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />}
                  </div>
                </div>

                {/* Bank transfer preview box when active */}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-4 pt-4 border-t border-zinc-200/80 bg-white p-4 rounded-xl border border-zinc-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium">Ngân hàng:</span>
                      <strong className="text-zinc-900">Techcombank (Ngân hàng Kỹ thương)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          19036888999888
                        </strong>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            copyToClipboard('19036888999888', 'stk');
                          }}
                          className="text-zinc-500 hover:text-zinc-900 p-1"
                          title="Sao chép STK"
                        >
                          {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium">Chủ tài khoản:</span>
                      <strong className="text-zinc-900 uppercase">CÔNG TY TNHH DAILY GIƯỜNG SPA</strong>
                    </div>
                    <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-100">
                      * Sau khi hoàn tất đặt hàng, mã QR VietQR động và cú pháp chi tiết sẽ hiển thị ngay tại trang tiếp theo.
                    </p>
                  </div>
                )}
              </div>

              {/* Method 2: COD Đồng kiểm */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900">
                        Thanh Toán Khi Nhận Hàng & Đồng Kiểm (COD)
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Kiểm tra thiết bị, cắm điện thử nâng hạ mô-tơ trước khi thanh toán cho nhân viên
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center shrink-0">
                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />}
                  </div>
                </div>
              </div>

              {/* Method 3: Ví Điện Tử MoMo / VNPay */}
              <div
                onClick={() => setPaymentMethod('MOMO')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'MOMO'
                    ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                      M
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900">
                        Ví Điện Tử MoMo / VNPay QR
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Thanh toán bảo mật tức thì qua ví MoMo hoặc ứng dụng ngân hàng có quét QR
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center shrink-0">
                    {paymentMethod === 'MOMO' && <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />}
                  </div>
                </div>
              </div>

              {/* Method 4: Thẻ Quốc Tế Visa / Mastercard */}
              <div
                onClick={() => setPaymentMethod('VNPAY')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'VNPAY'
                    ? 'border-zinc-950 bg-zinc-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900">
                        Thẻ Quốc Tế (Visa / MasterCard / JCB)
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Cổng thanh toán thẻ tín dụng quốc tế bảo mật 3D Secure
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-400 flex items-center justify-center shrink-0">
                    {paymentMethod === 'VNPAY' && <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Yêu cầu xuất hóa đơn VAT điện tử cho Spa / Clinic */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={needVatInvoice}
                onChange={e => setNeedVatInvoice(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-950"
              />
              <span className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-600" /> Yêu cầu xuất hóa đơn Giá Trị Gia Tăng (VAT điện tử) cho Cơ sở Spa / Doanh nghiệp
              </span>
            </label>

            {needVatInvoice && (
              <div className="pt-3 border-t border-zinc-100 space-y-3.5 text-xs animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Tên doanh nghiệp / Công ty *
                    </label>
                    <input
                      type="text"
                      value={vatData.companyName}
                      onChange={e => setVatData({ ...vatData, companyName: e.target.value })}
                      placeholder="Công ty TNHH Thẩm Mỹ Viện..."
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Mã số thuế (10 hoặc 13 số) *
                    </label>
                    <input
                      type="text"
                      value={vatData.taxId}
                      onBlur={() => setTouched(t => ({ ...t, companyTaxId: true }))}
                      onChange={e => setVatData({ ...vatData, taxId: e.target.value })}
                      placeholder="0312345678"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                    />
                    {touched.companyTaxId && !vatTaxValidation.isValid && (
                      <p className="text-[10px] text-rose-600 mt-1">{vatTaxValidation.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Địa chỉ theo giấy ĐKKD
                    </label>
                    <input
                      type="text"
                      value={vatData.companyAddress}
                      onChange={e => setVatData({ ...vatData, companyAddress: e.target.value })}
                      placeholder="Địa chỉ trụ sở công ty..."
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Email nhận hóa đơn điện tử
                    </label>
                    <input
                      type="email"
                      value={vatData.vatEmail}
                      onChange={e => setVatData({ ...vatData, vatEmail: e.target.value })}
                      placeholder="ketoan.spa@gmail.com"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-5 sticky top-28">
            <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3 flex items-center justify-between">
              <span>Đơn Hàng Của Bạn ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <Link to="/cart" className="text-xs text-zinc-500 hover:text-zinc-950 font-normal">
                Sửa giỏ hàng
              </Link>
            </h3>

            {/* Product items preview */}
            <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id || item.variantId} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0 relative">
                      <img
                        src={getSafeProductImage(item.image, item.name || item.productName)}
                        alt={item.name || item.productName}
                        className="w-full h-full object-cover"
                        onError={e => handleImageError(e, item.name || item.productName)}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-950 line-clamp-1">{item.name || item.productName}</p>
                      <p className="text-[11px] text-zinc-500">
                        {item.size} • {item.color} • SL: <strong className="text-zinc-800">{item.quantity}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-zinc-950 shrink-0">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing details */}
            <div className="space-y-2.5 text-xs pt-4 border-t border-zinc-100">
              <div className="flex justify-between text-zinc-600">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-mono text-zinc-950 font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển & lắp đặt:</span>
                <span className="font-mono text-emerald-600 font-bold">
                  {shippingFee === 0 ? 'Miễn phí toàn quốc' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <span>Mã giảm giá ({couponCode}):</span>
                  <span className="font-mono font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-sm text-zinc-950 block">Tổng thanh toán:</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Đã bao gồm VAT & Freeship</span>
                </div>
                <span className="font-mono font-extrabold text-2xl text-rose-600">
                  {total.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs uppercase tracking-widest font-extrabold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang Xử Lý Đơn Hàng...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Xác Nhận & Đặt Hàng Ngay
                </>
              )}
            </button>

            {/* Safety Promises */}
            <div className="pt-4 border-t border-zinc-100 space-y-2 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bảo hành chính hãng 24 tháng cho mô tơ & khung sườn</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bảo mật thông tin khách hàng tuyệt đối</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Hotline hỗ trợ kỹ thuật 24/7: <strong>0932.436.080</strong></span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
