import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.auth.adminLogin({
        email: email.trim(),
        password: password.trim(),
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.message || 'Xác thực tài khoản quản trị thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Email hoặc mật khẩu quản trị không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-zinc-950 font-serif-title text-2xl font-bold mb-4 shadow-xl">
            M
          </div>
          <h1 className="font-serif-title text-3xl font-bold tracking-tight text-white uppercase">
            ADMIN LOGIN
          </h1>
          <p className="mt-2 text-xs text-zinc-400 font-medium tracking-wide uppercase">
            Cổng Đăng Nhập Quản Trị Hệ Thống Maison Fashion
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold block mb-0.5">Đăng nhập thất bại</strong>
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Email hoặc Tên Đăng Nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="block w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Mật Khẩu Quản Trị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-white focus:ring-0 w-4 h-4"
                />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>
              <span className="text-zinc-500 text-[11px]">Bảo mật JWT 24h</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xác thực hệ thống...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Seed Testing Account Information Badge */}
          <div className="mt-8 pt-6 border-t border-zinc-800 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-zinc-400">
              <div className="flex items-center gap-2 font-semibold text-zinc-200 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tài khoản Admin mặc định để kiểm thử:</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-zinc-300">
                <p>Email: <span className="text-white">admin@example.com</span></p>
                <p>Password: <span className="text-white">Admin@123456</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Warning Notice */}
        <p className="mt-6 text-center text-[11px] text-zinc-600">
          Khu vực quản trị chỉ dành riêng cho nhân viên được ủy quyền. Mọi hành vi cố tình xâm nhập sẽ bị ghi lại địa chỉ IP và xử lý theo quy định.
        </p>
      </div>
    </div>
  );
};
