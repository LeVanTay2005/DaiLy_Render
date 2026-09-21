import {
  Product,
  Category,
  Order,
  Banner,
  Coupon,
  Review,
  AdminDashboardStats,
  InventoryItem,
  StoreSettings,
  User,
} from '../types';

const TOKEN_KEY = 'maison_auth_token';
const USER_KEY = 'maison_auth_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.getItem(TOKEN_KEY) !== token && localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getUser: (): User | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY),

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Phản hồi không hợp lệ từ máy chủ' }));

  if (!response.ok) {
    const error: any = new Error(data.message || `Lỗi yêu cầu: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (data: any) =>
      fetchWithAuth('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (credentials: { email: string; password: string }) =>
      fetchWithAuth('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    adminLogin: (credentials: { email: string; password: string }) =>
      fetchWithAuth('/api/auth/admin-login', { method: 'POST', body: JSON.stringify(credentials) }),
    me: () => fetchWithAuth('/api/auth/me'),
    updateProfile: (data: { name?: string; phone?: string; avatar?: string; address?: string }) =>
      fetchWithAuth('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Storefront Products
  products: {
    getAll: (params?: Record<string, any>) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            query.append(key, String(val));
          }
        });
      }
      const qs = query.toString();
      return fetchWithAuth(`/api/products${qs ? `?${qs}` : ''}`);
    },
    getByIdOrSlug: (idOrSlug: string) => fetchWithAuth(`/api/products/${idOrSlug}`),
  },

  // Categories
  categories: {
    getAll: () => fetchWithAuth('/api/categories'),
    getBySlug: (slug: string) => fetchWithAuth(`/api/categories/${slug}`),
  },

  // Orders
  orders: {
    create: (orderData: any) =>
      fetchWithAuth('/api/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: () => fetchWithAuth('/api/orders'),
    getById: (id: string) => fetchWithAuth(`/api/orders/${id}`),
    getByCode: (orderCode: string) => fetchWithAuth(`/api/orders/${orderCode}`),
  },

  // Coupons
  coupons: {
    validate: (code: string, subtotal: number) =>
      fetchWithAuth('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      }),
    apply: (code: string, subtotal: number) =>
      fetchWithAuth('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      }),
  },

  // Banners
  banners: {
    getAll: () => fetchWithAuth('/api/banners'),
  },

  // Reviews
  reviews: {
    getByProduct: (productId: string) => fetchWithAuth(`/api/reviews/${productId}`),
    create: (data: { productId: string; rating: number; comment: string; images?: string[] }) =>
      fetchWithAuth('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Upload
  uploadImage: (image: string, name?: string) =>
    fetchWithAuth('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image, name }),
    }),

  // Admin APIs
  admin: {
    dashboard: (): Promise<{ success: boolean; data: AdminDashboardStats }> =>
      fetchWithAuth('/api/admin/dashboard'),

    products: {
      getAll: (params?: Record<string, any>) => {
        const query = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              query.append(key, String(val));
            }
          });
        }
        const qs = query.toString();
        return fetchWithAuth(`/api/admin/products${qs ? `?${qs}` : ''}`);
      },
      getById: (id: string): Promise<{ success: boolean; data: Product }> =>
        fetchWithAuth(`/api/admin/products/${id}`),
      create: (data: any) =>
        fetchWithAuth('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) =>
        fetchWithAuth(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetchWithAuth(`/api/admin/products/${id}`, { method: 'DELETE' }),
    },

    categories: {
      getAll: (): Promise<{ success: boolean; data: Category[] }> =>
        fetchWithAuth('/api/admin/categories'),
      create: (data: any) =>
        fetchWithAuth('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) =>
        fetchWithAuth(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetchWithAuth(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    },

    orders: {
      getAll: (params?: { status?: string; search?: string }): Promise<{ success: boolean; data: Order[] }> => {
        const query = new URLSearchParams();
        if (params?.status) query.append('status', params.status);
        if (params?.search) query.append('search', params.search);
        const qs = query.toString();
        return fetchWithAuth(`/api/admin/orders${qs ? `?${qs}` : ''}`);
      },
      getById: (id: string): Promise<{ success: boolean; data: Order }> =>
        fetchWithAuth(`/api/admin/orders/${id}`),
      updateStatus: (id: string, status: string, paymentStatus?: string) =>
        fetchWithAuth(`/api/admin/orders/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ orderStatus: status, paymentStatus }),
        }),
    },

    users: {
      getAll: (): Promise<{ success: boolean; data: User[] }> =>
        fetchWithAuth('/api/admin/users'),
      toggleStatus: (id: string) =>
        fetchWithAuth(`/api/admin/users/${id}/status`, { method: 'PUT' }),
    },

    inventory: {
      getAll: (): Promise<{ success: boolean; data: InventoryItem[] }> =>
        fetchWithAuth('/api/admin/inventory'),
      updateStock: (productId: string, variantId: string, stock: number) =>
        fetchWithAuth(`/api/admin/inventory/${productId}/${variantId}`, {
          method: 'PUT',
          body: JSON.stringify({ stock }),
        }),
    },

    coupons: {
      getAll: (): Promise<{ success: boolean; data: Coupon[] }> =>
        fetchWithAuth('/api/admin/coupons'),
      create: (data: any) =>
        fetchWithAuth('/api/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) =>
        fetchWithAuth(`/api/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetchWithAuth(`/api/admin/coupons/${id}`, { method: 'DELETE' }),
    },

    banners: {
      getAll: (): Promise<{ success: boolean; data: Banner[] }> =>
        fetchWithAuth('/api/admin/banners'),
      create: (data: any) =>
        fetchWithAuth('/api/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) =>
        fetchWithAuth(`/api/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetchWithAuth(`/api/admin/banners/${id}`, { method: 'DELETE' }),
    },

    reviews: {
      getAll: (): Promise<{ success: boolean; data: Review[] }> =>
        fetchWithAuth('/api/admin/reviews'),
      toggleStatus: (id: string) =>
        fetchWithAuth(`/api/admin/reviews/${id}/toggle`, { method: 'PUT' }),
      delete: (id: string) =>
        fetchWithAuth(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
    },

    settings: {
      get: (): Promise<{ success: boolean; data: StoreSettings }> =>
        fetchWithAuth('/api/admin/settings'),
      update: (data: Partial<StoreSettings>) =>
        fetchWithAuth('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
    },
  },
};
