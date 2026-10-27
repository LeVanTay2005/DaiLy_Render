import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Check,
  Search,
  Filter,
  ArrowUpDown,
  History,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { InventoryItem, InventoryLog, InventoryLogReason } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminInventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'logs'>('current');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [logFilterReason, setLogFilterReason] = useState<string>('ALL');
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal State for Import / Stock Adjust
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustData, setAdjustData] = useState<{
    quantityChange: number;
    reason: InventoryLogReason;
    reasonLabel: string;
    note: string;
  }>({
    quantityChange: 10,
    reason: 'IMPORT_STOCK',
    reasonLabel: 'Nhập hàng từ xưởng sản xuất',
    note: '',
  });

  const { success, error } = useNotification();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.admin.inventory.getAll();
      if (res.success && res.data) {
        setInventory(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải danh sách kho hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.admin.inventory.getLogs({
        reason: logFilterReason !== 'ALL' ? logFilterReason : undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setLogs(res.data.logs);
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải lịch sử biến động kho');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, logFilterReason]);

  const handleStockChange = (key: string, value: number) => {
    setEditingStock(prev => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  const handleSaveStock = async (item: InventoryItem) => {
    const key = `${item.productId}_${item.variantId}`;
    const newStock = editingStock[key] !== undefined ? editingStock[key] : item.stock;

    setUpdatingId(key);
    try {
      const res = await api.admin.inventory.updateStock(item.productId, item.variantId, newStock);
      if (res.success) {
        success(`Đã cập nhật tồn kho SKU ${item.sku} thành ${newStock} cái`);
        loadInventory();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi cập nhật số lượng tồn kho');
    } finally {
      setUpdatingId(null);
    }
  };

  const openAdjustModal = (item?: InventoryItem) => {
    const target = item || inventory[0] || null;
    setAdjustTarget(target);
    setAdjustData({
      quantityChange: 10,
      reason: 'IMPORT_STOCK',
      reasonLabel: 'Nhập hàng từ xưởng sản xuất',
      note: 'Nhập lô hàng mới từ xưởng sản xuất',
    });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    try {
      const res = await api.admin.inventory.adjustStock({
        productId: adjustTarget.productId,
        variantId: adjustTarget.variantId,
        quantityChange: Number(adjustData.quantityChange),
        reason: adjustData.reason,
        reasonLabel: adjustData.reasonLabel,
        note: adjustData.note,
      });

      if (res.success) {
        success(res.message || 'Cập nhật kho thành công!');
        setIsAdjustModalOpen(false);
        loadInventory();
        if (activeTab === 'logs') {
          loadLogs();
        }
      }
    } catch (err: any) {
      error(err.message || 'Lỗi điều chỉnh tồn kho');
    }
  };

  const filteredItems = inventory.filter(item => {
    const matchSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.color.toLowerCase().includes(search.toLowerCase());

    if (filterLowStockOnly) {
      return matchSearch && item.isLowStock;
    }
    return matchSearch;
  });

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.productName.toLowerCase().includes(s) ||
      log.sku.toLowerCase().includes(s) ||
      (log.orderCode && log.orderCode.toLowerCase().includes(s)) ||
      (log.note && log.note.toLowerCase().includes(s))
    );
  });

  const lowStockCount = inventory.filter(i => i.isLowStock).length;
  const totalStockCount = inventory.reduce((sum, i) => sum + i.stock, 0);

  const getReasonBadge = (reason: InventoryLogReason, label: string) => {
    switch (reason) {
      case 'IMPORT_STOCK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Nhập xưởng</span>;
      case 'ORDER_PLACED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">Xuất bán đơn</span>;
      case 'ORDER_CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Huỷ đơn hoàn kho</span>;
      case 'RETURN_GOODS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">Đổi trả hàng</span>;
      case 'STOCKTAKE_FIX':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Kiểm kê kho</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-700 text-zinc-300">{label || 'Điều chỉnh'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-emerald-400" />
            Quản Lý Kho Hàng & Thẻ Kho
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Theo dõi tồn kho theo SKU, cảnh báo thiếu hàng và toàn bộ nhật ký nhập/xuất kho minh bạch
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openAdjustModal()}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Nhập Hàng Từ Xưởng
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Tổng số lượng trong kho</span>
            <div className="text-2xl font-extrabold text-white mt-1">{totalStockCount} cái</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">{inventory.length} biến thể SKU đang quản lý</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Cảnh báo sắp hết hàng</span>
            <div className={`text-2xl font-extrabold mt-1 ${lowStockCount > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
              {lowStockCount} SKU
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Biến thể có tồn dưới 10 cái</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Nhật ký biến động (Thẻ kho)</span>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">Đã kích hoạt</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Ghi vết tự động mọi lần nhập / xuất</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'current'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Tồn Kho Theo Biến Thể ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-4 h-4" />
          Thẻ Kho / Lịch Sử Biến Động
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Phase 1.2
          </span>
        </button>
      </div>

      {/* Tab 1: Current Inventory */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo mã SKU, tên sản phẩm, màu..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 font-medium">
              <input
                type="checkbox"
                checked={filterLowStockOnly}
                onChange={e => setFilterLowStockOnly(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-800 text-rose-500 focus:ring-0 w-4 h-4"
              />
              <span>Chỉ hiện sản phẩm sắp hết hàng (&lt; 10)</span>
            </label>
          </div>

          {/* Inventory Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-5 py-3.5">Mã SKU</th>
                    <th className="px-4 py-3.5">Sản Phẩm</th>
                    <th className="px-4 py-3.5">Phân Loại</th>
                    <th className="px-4 py-3.5">Giá Bán</th>
                    <th className="px-4 py-3.5">Số Lượng Tồn Kho</th>
                    <th className="px-5 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-500">
                        Đang tải dữ liệu kho hàng...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-500">
                        Không có bản ghi tồn kho nào
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const key = `${item.productId}_${item.variantId}`;
                      const currentVal = editingStock[key] !== undefined ? editingStock[key] : item.stock;
                      const hasChanged = editingStock[key] !== undefined && editingStock[key] !== item.stock;

                      return (
                        <tr key={key} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-zinc-300">
                            {item.sku}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-white text-sm truncate max-w-xs">
                                  {item.productName}
                                </p>
                                <span className="text-[10px] text-zinc-500">{item.categoryName}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-semibold text-zinc-200">
                              {item.size} • {item.color}
                            </span>
                          </td>

                          <td className="px-4 py-4 font-mono font-bold text-white">
                            {item.price.toLocaleString('vi-VN')}đ
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={currentVal}
                                onChange={e => handleStockChange(key, Number(e.target.value))}
                                className={`w-20 px-2.5 py-1.5 rounded-lg border text-center font-bold text-xs bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-white ${
                                  item.isLowStock
                                    ? 'text-rose-400 border-rose-900/60'
                                    : 'text-emerald-400 border-zinc-700'
                                }`}
                              />
                              {item.isLowStock && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                                  Sắp hết
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right space-x-2">
                            <button
                              onClick={() => openAdjustModal(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
                            >
                              Nhập/Xuất
                            </button>

                            <button
                              disabled={!hasChanged || updatingId === key}
                              onClick={() => handleSaveStock(item)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 ${
                                hasChanged
                                  ? 'bg-white text-zinc-950 font-bold hover:bg-zinc-200 shadow-md'
                                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              {updatingId === key ? 'Đang lưu...' : 'Lưu'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stock Logs (Thẻ Kho) */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Logs Filter Bar */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn, SKU, ghi chú..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={logFilterReason}
                onChange={e => setLogFilterReason(e.target.value)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none"
              >
                <option value="ALL">Tất cả lý do biến động</option>
                <option value="IMPORT_STOCK">Nhập từ xưởng sản xuất</option>
                <option value="ORDER_PLACED">Xuất đơn hàng cho khách</option>
                <option value="ORDER_CANCELLED">Huỷ đơn hoàn kho</option>
                <option value="RETURN_GOODS">Đổi / Trả hàng</option>
                <option value="STOCKTAKE_FIX">Cân bằng sau kiểm kê</option>
                <option value="MANUAL_ADJUST">Admin điều chỉnh tay</option>
              </select>

              <button
                onClick={loadLogs}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="Làm mới nhật ký"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-5 py-3.5">Thời Gian</th>
                    <th className="px-4 py-3.5">Mã SKU / Sản Phẩm</th>
                    <th className="px-4 py-3.5">Lý Do</th>
                    <th className="px-4 py-3.5 text-center">Biến Động</th>
                    <th className="px-4 py-3.5 text-center">Tồn Sau</th>
                    <th className="px-4 py-3.5">Người Thao Tác</th>
                    <th className="px-5 py-3.5">Ghi Chú / Mã Đơn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-zinc-500">
                        Đang tải thẻ kho...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-zinc-500">
                        Chưa có nhật ký biến động kho nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => {
                      const isPositive = log.quantityChange > 0;
                      const dateObj = new Date(log.createdAt);
                      const timeStr = `${dateObj.toLocaleDateString('vi-VN')} ${dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

                      return (
                        <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                            {timeStr}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-white block">{log.sku}</span>
                            <span className="text-[11px] text-zinc-500 truncate max-w-xs block">
                              {log.productName}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {getReasonBadge(log.reason, log.reasonLabel)}
                          </td>

                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-0.5 font-bold font-mono px-2 py-0.5 rounded ${
                                isPositive
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : 'text-rose-400 bg-rose-500/10'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              )}
                              {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center font-mono font-semibold text-zinc-200">
                            <span className="text-zinc-500">{log.quantityBefore}</span>
                            <span className="text-zinc-600 mx-1">→</span>
                            <strong className="text-white">{log.quantityAfter}</strong>
                          </td>

                          <td className="px-4 py-3.5 text-zinc-300 font-medium whitespace-nowrap">
                            {log.performedBy || 'Hệ thống'}
                          </td>

                          <td className="px-5 py-3.5 text-zinc-400 max-w-xs truncate">
                            {log.orderCode && (
                              <span className="font-mono font-bold text-sky-400 mr-1.5">
                                #{log.orderCode}
                              </span>
                            )}
                            {log.note || '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Adjust / Import Stock Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Nhập Hàng / Cân Bằng Kho
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Hệ thống sẽ tự động cập nhật số lượng tồn kho và lưu vết vào Thẻ kho (Inventory Logs)
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Chọn biến thể SKU *
                </label>
                <select
                  value={`${adjustTarget?.productId}_${adjustTarget?.variantId}`}
                  onChange={e => {
                    const found = inventory.find(
                      i => `${i.productId}_${i.variantId}` === e.target.value
                    );
                    if (found) setAdjustTarget(found);
                  }}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  {inventory.map(item => (
                    <option
                      key={`${item.productId}_${item.variantId}`}
                      value={`${item.productId}_${item.variantId}`}
                    >
                      {item.sku} - {item.productName.slice(0, 30)}... ({item.color}, tồn: {item.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Lý do thay đổi *
                </label>
                <select
                  value={adjustData.reason}
                  onChange={e => {
                    const r = e.target.value as InventoryLogReason;
                    let label = 'Nhập hàng từ xưởng sản xuất';
                    if (r === 'STOCKTAKE_FIX') label = 'Cân bằng kho sau kiểm kê';
                    if (r === 'RETURN_GOODS') label = 'Khách trả hàng về kho';
                    if (r === 'MANUAL_ADJUST') label = 'Admin điều chỉnh số lượng';
                    setAdjustData({ ...adjustData, reason: r, reasonLabel: label });
                  }}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="IMPORT_STOCK">Nhập hàng mới từ xưởng sản xuất (+)</option>
                  <option value="RETURN_GOODS">Khách hoàn trả hàng về kho (+)</option>
                  <option value="STOCKTAKE_FIX">Cân bằng sau đợt kiểm kê (+/-)</option>
                  <option value="MANUAL_ADJUST">Điều chỉnh số lượng thủ công (+/-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Số lượng thay đổi (dương = thêm, âm = xuất) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustData.quantityChange}
                  onChange={e => setAdjustData({ ...adjustData, quantityChange: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
                />
                {adjustTarget && (
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Tồn hiện tại: <strong className="text-zinc-200">{adjustTarget.stock}</strong> → Tồn mới dự kiến:{' '}
                    <strong className="text-emerald-400">
                      {Math.max(0, adjustTarget.stock + Number(adjustData.quantityChange))}
                    </strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Ghi chú chứng từ / nguồn gốc
                </label>
                <input
                  type="text"
                  value={adjustData.note}
                  onChange={e => setAdjustData({ ...adjustData, note: e.target.value })}
                  placeholder="Ví dụ: Nhập 15 chiếc lô xưởng Bình Dương đợt 1"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Xác Nhận Cập Nhật Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
