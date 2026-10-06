import fs from 'fs';
import path from 'path';

const categoryImages: Record<string, string[]> = {
  'cat-1': ['/images/products/giuong-tiem-dien.jpg', '/images/products/giuong-spa-inox.jpg'],
  'cat-2': ['/images/products/giuong-goi-duong-sinh.jpg'],
  'cat-3': ['/images/products/giuong-massage-go.png'],
  'cat-4': ['/images/products/giuong-spa-inox.jpg'],
  'cat-5': ['/images/products/giuong-vali-gap.jpg'],
  'cat-6': ['/images/products/ghe-phun-xam.jpg'],
};

const categorySingleImages: Record<string, string> = {
  'cat-1': '/images/products/giuong-tiem-dien.jpg',
  'cat-2': '/images/products/giuong-goi-duong-sinh.jpg',
  'cat-3': '/images/products/giuong-massage-go.png',
  'cat-4': '/images/products/giuong-spa-inox.jpg',
  'cat-5': '/images/products/giuong-vali-gap.jpg',
  'cat-6': '/images/products/ghe-phun-xam.jpg',
};

// 1. Update data/store.json
const storeFile = path.join(process.cwd(), 'data', 'store.json');
if (fs.existsSync(storeFile)) {
  const store = JSON.parse(fs.readFileSync(storeFile, 'utf-8'));

  // Update categories
  for (const c of store.categories) {
    if (categorySingleImages[c.id]) {
      c.image = categorySingleImages[c.id];
    }
  }

  // Update products
  for (const p of store.products) {
    if (categoryImages[p.categoryId]) {
      p.images = categoryImages[p.categoryId];
    }
  }

  // Update banners
  if (store.banners && store.banners.length >= 3) {
    store.banners[0].image = '/images/products/giuong-tiem-dien.jpg';
    store.banners[1].image = '/images/products/giuong-goi-duong-sinh.jpg';
    store.banners[2].image = '/images/products/giuong-massage-go.png';
  }

  // Update sample orders items
  if (store.orders) {
    for (const o of store.orders) {
      for (const item of o.items) {
        if (item.productId === 'prod-1') item.imageUrl = '/images/products/giuong-tiem-dien.jpg';
        else if (item.productId === 'prod-3') item.imageUrl = '/images/products/giuong-goi-duong-sinh.jpg';
        else item.imageUrl = '/images/products/giuong-massage-go.png';
      }
    }
  }

  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8');
  console.log('✅ Updated data/store.json with local images');
}

// 2. Update backend/db/seedData.ts
const seedDataFile = path.join(process.cwd(), 'backend', 'db', 'seedData.ts');
if (fs.existsSync(seedDataFile)) {
  let content = fs.readFileSync(seedDataFile, 'utf-8');

  // Replace category images
  content = content.replace(
    /id: 'cat-1'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-tiem-dien.jpg'")
  );
  content = content.replace(
    /id: 'cat-2'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-goi-duong-sinh.jpg'")
  );
  content = content.replace(
    /id: 'cat-3'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-massage-go.png'")
  );
  content = content.replace(
    /id: 'cat-4'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-spa-inox.jpg'")
  );
  content = content.replace(
    /id: 'cat-5'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-vali-gap.jpg'")
  );
  content = content.replace(
    /id: 'cat-6'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/ghe-phun-xam.jpg'")
  );

  // Replace banners
  content = content.replace(
    /id: 'ban-1'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-tiem-dien.jpg'")
  );
  content = content.replace(
    /id: 'ban-2'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-goi-duong-sinh.jpg'")
  );
  content = content.replace(
    /id: 'ban-3'[\s\S]*?image: '.*?'/m,
    (m) => m.replace(/image: '.*?'/, "image: '/images/products/giuong-massage-go.png'")
  );

  fs.writeFileSync(seedDataFile, content, 'utf-8');
  console.log('✅ Updated backend/db/seedData.ts categories and banners with local images');
}
