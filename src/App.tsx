/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auto Scroll To Top on Route Change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Elegant Page Loader fallback for route transitions
function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xs font-medium text-zinc-500 uppercase tracking-widest animate-pulse">
        Đang tải trang...
      </p>
    </div>
  );
}

// Lazy loaded Customer Pages for blazing fast initial load
const HomePage = lazy(() => import('./pages/customer/HomePage').then(m => ({ default: m.HomePage })));
const ProductListPage = lazy(() => import('./pages/customer/ProductListPage').then(m => ({ default: m.ProductListPage })));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/customer/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const CustomerOrdersPage = lazy(() => import('./pages/customer/CustomerOrdersPage').then(m => ({ default: m.CustomerOrdersPage })));
const CustomerProfilePage = lazy(() => import('./pages/customer/CustomerProfilePage').then(m => ({ default: m.CustomerProfilePage })));
const CustomerLoginPage = lazy(() => import('./pages/customer/CustomerLoginPage').then(m => ({ default: m.CustomerLoginPage })));
const CustomerRegisterPage = lazy(() => import('./pages/customer/CustomerRegisterPage').then(m => ({ default: m.CustomerRegisterPage })));
const AboutPage = lazy(() => import('./pages/customer/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/customer/ContactPage').then(m => ({ default: m.ContactPage })));

// Lazy loaded Admin Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage').then(m => ({ default: m.AdminInventoryPage })));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage').then(m => ({ default: m.AdminCouponsPage })));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage').then(m => ({ default: m.AdminBannersPage })));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage').then(m => ({ default: m.AdminReviewsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* 1. Website Khách Hàng (Customer Area) */}
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/category/:categorySlug" element={<ProductListPage />} />
                  <Route path="/products/:idOrSlug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:orderCode" element={<OrderSuccessPage />} />
                  <Route path="/profile" element={<CustomerProfilePage />} />
                  <Route path="/profile/orders" element={<CustomerOrdersPage />} />
                  <Route path="/login" element={<CustomerLoginPage />} />
                  <Route path="/register" element={<CustomerRegisterPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Route>

                {/* 2. Admin Login (Direct URL only - No button on customer site) */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* 3. Trang Quản Trị Admin (Protected) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

