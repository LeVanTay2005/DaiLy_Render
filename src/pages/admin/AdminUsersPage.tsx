import React, { useState, useEffect } from 'react';
import { Users, Lock, Unlock, ShieldAlert, CheckCircle, Search, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { success, error } = useNotification();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.users.getAll();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const actionName = user.status === 'BLOCKED' ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      const res = await api.admin.users.toggleStatus(user.id);
      if (res.success) {
        success(res.message || 'Cập nhật trạng thái thành công');
        loadUsers();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Khách Hàng</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng cộng <strong className="text-white">{users.length}</strong> tài khoản thành viên trong hệ thống
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Khách Hàng</th>
                <th className="px-4 py-3.5">Liên Hệ</th>
                <th className="px-4 py-3.5">Đơn Hàng</th>
                <th className="px-4 py-3.5">Tổng Chi Tiêu</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Khóa / Mở Khóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Đang tải danh sách thành viên...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          <span className="text-[10px] text-zinc-500 font-mono">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-zinc-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" /> {u.email}
                      </p>
                      {u.phone && (
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-500" /> {u.phone}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-white font-mono text-sm">
                        {u.totalOrders || 0}
                      </span>{' '}
                      đơn
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-emerald-400 font-mono text-sm">
                        {(u.totalSpent || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                          u.status === 'BLOCKED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {u.status === 'BLOCKED' ? 'Đã Khóa' : 'Hoạt Động'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                          u.status === 'BLOCKED'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/60'
                            : 'bg-rose-950/40 text-rose-300 border-rose-900/50 hover:bg-rose-900/60'
                        }`}
                      >
                        {u.status === 'BLOCKED' ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" /> Mở Khóa
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Khóa Tài Khoản
                          </>
                        )}
                      </button>
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
