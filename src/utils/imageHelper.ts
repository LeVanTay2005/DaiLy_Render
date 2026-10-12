import React from 'react';

export const DEFAULT_PRODUCT_IMAGE = '/images/products/giuong-tiem-dien.jpg';

export const PRODUCT_FALLBACK_IMAGES: Record<string, string> = {
  tiem: '/images/products/giuong-tiem-dien.jpg',
  dien: '/images/products/giuong-tiem-dien.jpg',
  goi: '/images/products/giuong-goi-duong-sinh.jpg',
  duongsinh: '/images/products/giuong-goi-duong-sinh.jpg',
  massage: '/images/products/giuong-massage-go.png',
  go: '/images/products/giuong-massage-go.png',
  inox: '/images/products/giuong-spa-inox.jpg',
  vali: '/images/products/giuong-vali-gap.jpg',
  gap: '/images/products/giuong-vali-gap.jpg',
  xam: '/images/products/ghe-phun-xam.jpg',
  ghe: '/images/products/ghe-phun-xam.jpg',
};

/**
 * Normalizes and guarantees a valid, existing product image URL.
 * Automatically resolves dead or blocked Unsplash URLs to local high-res assets.
 */
export function getSafeProductImage(url?: string | null, nameOrSlug?: string | null): string {
  // If the image is already a verified local asset
  if (url && (url.startsWith('/images/products/') || url.startsWith('http://') || url.startsWith('https://'))) {
    if (!url.includes('images.unsplash.com')) {
      return url;
    }
  }

  const key = (nameOrSlug || '').toLowerCase();

  if (key.includes('tiêm') || key.includes('điện') || key.includes('master') || key.includes('hi-tech') || key.includes('luxury')) {
    return '/images/products/giuong-tiem-dien.jpg';
  }
  if (key.includes('gội') || key.includes('dưỡng sinh') || key.includes('tai thỏ') || key.includes('tuyết tùng') || key.includes('bồn')) {
    return '/images/products/giuong-goi-duong-sinh.jpg';
  }
  if (key.includes('massage') || key.includes('sồi') || key.includes('tràm') || key.includes('đá muối') || key.includes('chiro') || key.includes('gỗ')) {
    return '/images/products/giuong-massage-go.png';
  }
  if (key.includes('vali') || key.includes('gấp') || key.includes('nhôm') || key.includes('mobile')) {
    return '/images/products/giuong-vali-gap.jpg';
  }
  if (key.includes('phun xăm') || key.includes('ghế') || key.includes('pedicure') || key.includes('tattoo') || key.includes('xoay')) {
    return '/images/products/ghe-phun-xam.jpg';
  }
  if (key.includes('inox') || key.includes('sắt') || key.includes('pro-iron') || key.includes('chống gỉ')) {
    return '/images/products/giuong-spa-inox.jpg';
  }

  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Image onError handler to prevent broken image icons completely.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackTitle?: string
): void {
  const target = e.currentTarget;
  const safeFallback = getSafeProductImage(null, fallbackTitle);
  if (target.src !== safeFallback && !target.src.endsWith(safeFallback)) {
    target.src = safeFallback;
  }
}
