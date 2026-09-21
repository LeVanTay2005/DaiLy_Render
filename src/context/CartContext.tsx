import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { api } from '../services/api';
import { useNotification } from './NotificationContext';

const CART_STORAGE_KEY = 'maison_shopping_cart';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  appliedCoupon: {
    code: string;
    description: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    discountAmount: number;
  } | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    discountAmount: number;
  } | null>(null);

  const { success, error } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [items]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (variant.stock <= 0) {
      error(`Rất tiếc, size ${variant.size} - màu ${variant.color} hiện đã hết hàng`);
      return;
    }

    setItems(prevItems => {
      const itemKey = `${product.id}_${variant.id}`;
      const existingIndex = prevItems.findIndex(i => i.id === itemKey);

      if (existingIndex > -1) {
        const existing = prevItems[existingIndex];
        const updatedQty = Math.min(variant.stock, existing.quantity + quantity);
        if (existing.quantity >= variant.stock) {
          error(`Số lượng trong giỏ đã đạt mức tối đa hiện có (${variant.stock} sản phẩm)`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existing,
          quantity: updatedQty,
        };
        success(`Đã cập nhật số lượng ${product.name} trong giỏ hàng`);
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemKey,
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          slug: product.slug,
          size: variant.size,
          color: variant.color,
          colorCode: variant.colorCode,
          price: variant.price || product.salePrice || product.price,
          originalPrice: product.price,
          quantity: Math.min(variant.stock, quantity),
          image: product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
          maxStock: variant.stock,
          sku: variant.sku,
        };
        success(`Đã thêm ${product.name} (${variant.size}, ${variant.color}) vào giỏ hàng`);
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.id !== cartItemId));
    success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.id === cartItemId) {
          if (newQuantity > item.maxStock) {
            error(`Số lượng vượt quá tồn kho hiện có (${item.maxStock})`);
            return { ...item, quantity: item.maxStock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= 500000 ? 0 : 30000;
  }, [subtotal, items.length]);

  // Recalculate coupon discount whenever subtotal changes
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || items.length === 0) return 0;
    if (appliedCoupon.discountType === 'PERCENT') {
      return Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, subtotal, items.length]);

  const totalAmount = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(0, subtotal + shippingFee - discountAmount);
  }, [subtotal, shippingFee, discountAmount, items.length]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      error('Vui lòng nhập mã giảm giá');
      return false;
    }
    if (items.length === 0) {
      error('Giỏ hàng của bạn đang trống');
      return false;
    }

    try {
      const res = await api.coupons.validate(code.trim().toUpperCase(), subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        success(`Áp dụng mã ${res.data.code} thành công! Tiết kiệm ${res.data.discountAmount.toLocaleString('vi-VN')}đ`);
        return true;
      } else {
        error(res.message || 'Mã giảm giá không hợp lệ');
        return false;
      }
    } catch (err: any) {
      error(err.message || 'Mã giảm giá không thể áp dụng');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    success('Đã hủy mã giảm giá');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
