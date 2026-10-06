import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const res = await api.auth.login({
        email: email.trim(),
        password,
      });

      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;

      if (res.success && token && user) {
        login(token, user);
        success(`Chào mừng bạn trở lại, ${user.name}!`);
        navigate(from, { replace: true });
      } else {
        const msg = res.message || 'Đăng nhập không thành công';
        setErrorMsg(msg);
        error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Email hoặc mật khẩu không chính xác';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCustomer = () => {
    setEmail('khachhang@example.com');
    setPassword('Customer@123456');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-zinc-50 to-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 text-white font-serif-title text-xl font-bold mb-1 shadow-md">
            D
          </div>
          <h1 className="font-serif-title text-3xl font-bold text-zinc-950 tracking-tight">
            Đăng Nhập Khách Hàng
          </h1>
          <p className="text-xs text-zinc-500">
            Đăng nhập để theo dõi lịch sử đơn hàng, tích điểm và nhận ưu đãi riêng
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block">Đăng nhập thất bại:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="khachhang@example.com"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-600 hover:text-zinc-900 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 active:scale-[0.99] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng Nhập</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Box */}
        <div className="pt-2">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tài khoản Demo thử nghiệm</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemoCustomer}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
              >
                Điền tự động
              </button>
            </div>
            <div className="text-[11px] text-zinc-600 font-mono bg-white p-2 rounded-xl border border-zinc-200/80 space-y-0.5">
              <p><span className="text-zinc-400">Email:</span> khachhang@example.com</p>
              <p><span className="text-zinc-400">Mật khẩu:</span> Customer@123456</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2 text-center pt-2 text-xs text-zinc-500 border-t border-zinc-100">
          <div>
            Chưa có tài khoản thành viên?{' '}
            <Link to="/register" className="font-bold text-zinc-950 underline hover:text-zinc-700">
              Đăng ký tài khoản mới
            </Link>
          </div>
          <div className="pt-1">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <Shield className="w-3 h-3 text-zinc-400" /> Cổng quản trị Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
