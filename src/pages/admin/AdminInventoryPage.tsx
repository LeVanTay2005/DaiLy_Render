import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check, Search, Filter, ArrowUpDown } from 'lucide-react';
import { api } from '../../services/api';
import { InventoryItem } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  useEffect(() => {
    loadInventory();
  }, []);

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

  const lowStockCount = inventory.filter(i => i.isLowStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Tồn Kho</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng hợp các biến thể phân loại hàng hóa, mã SKU và cảnh báo hết hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" /> Có {lowStockCount} biến thể sắp hết hàng (&lt; 10 cái)
            </div>
          )}
        </div>
      </div>

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
                <th className="px-5 py-3.5 text-right">Lưu Thay Đổi</th>
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

                      <td className="px-5 py-4 text-right">
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
  );
};
