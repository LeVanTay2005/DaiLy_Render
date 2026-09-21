import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.auth.login({ email: email.trim(), password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        success(`Chào mừng bạn trở lại, ${res.data.user.name}!`);
        navigate(from, { replace: true });
      } else {
        error(res.message || 'Đăng nhập không thành công');
      }
    } catch (err: any) {
      error(err.message || 'Sai thông tin đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('customer@example.com');
    setPassword('customer123');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif-title text-3xl font-bold text-zinc-950">
            Đăng Nhập Khách Hàng
          </h1>
          <p className="text-xs text-zinc-500">
            Đăng nhập để theo dõi lịch sử đơn hàng và nhận ưu đãi riêng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Email đăng ký
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Tự động điền tài khoản Khách hàng Demo
          </button>
        </div>

        <div className="text-center pt-2 text-xs text-zinc-500 border-t border-zinc-100">
          Chưa có tài khoản thành viên?{' '}
          <Link to="/register" className="font-bold text-zinc-950 underline hover:text-zinc-700">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};
