export const DEMO_CATEGORIES = [
  { id: 'smartphones', name: 'Phones', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=100', slug: 'smartphones' },
  { id: 'laptops', name: 'Laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=100', slug: 'laptops' },
  { id: 'tablets', name: 'Tablets', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=100', slug: 'tablets' },
  { id: 'headphones', name: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100', slug: 'headphones' },
  { id: 'smartwatches', name: 'Watches', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100', slug: 'smartwatches' },
  { id: 'gaming', name: 'Gaming', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=100', slug: 'gaming' },
  { id: 'accessories', name: 'Tech', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=100', slug: 'accessories' },
  { id: 'cameras', name: 'Photo', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=100', slug: 'cameras' },
];

export const BANNERS = [
  { id: 1, title: 'Big Sale Up to\n40% OFF', subtitle: 'On all electronics', color: '#1E293B', buttonText: 'Shop Now', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300' },
  { id: 2, title: 'Apple Days\nSave $200', subtitle: 'MacBooks & iPads', color: '#475569', buttonText: 'Explore', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300' },
  { id: 3, title: 'Smart Wear\nTrending', subtitle: 'Upgrade your style', color: '#64748B', buttonText: 'View Deals', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300' },
];

export const SPECIAL_OFFERS = [
  { id: 'o1', label: 'Smartphones', discount: '30% OFF', tagline: 'Top picks this week', color: '#3B82F6', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=150', category: 'smartphones' },
  { id: 'o2', label: 'Laptops', discount: '20% OFF', tagline: 'Work smarter, save more', color: '#0EA5E9', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=150', category: 'laptops' },
  { id: 'o3', label: 'Headphones', discount: '40% OFF', tagline: 'Sound deals today', color: '#0891B2', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=150', category: 'headphones' },
  { id: 'o4', label: 'Smartwatches', discount: '25% OFF', tagline: 'Style meets tech', color: '#10B981', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=150', category: 'smartwatches' },
  { id: 'o5', label: 'Cameras', discount: '15% OFF', tagline: 'Capture every moment', color: '#F59E0B', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=150', category: 'cameras' },
];

export const DEMO_REVIEWS = [
  { id: 'r1', user: 'Jean Pierre', rating: 5, date: '2024-03-15', comment: 'Excellent product! The delivery was very fast to Gisenyi.', avatar: 'https://i.pravatar.cc/150?u=jp' },
  { id: 'r2', user: 'Marie Claire', rating: 4, date: '2024-03-10', comment: 'Good quality but the price is a bit high. Still worth it.', avatar: 'https://i.pravatar.cc/150?u=mc' },
  { id: 'r3', user: 'Eric Habimana', rating: 5, date: '2024-03-05', comment: 'Best gadget store in Rwanda! Authentic items always.', avatar: 'https://i.pravatar.cc/150?u=eh' },
  { id: 'r4', user: 'Divine Uwase', rating: 3, date: '2024-02-28', comment: 'The item is okay, but it took 3 days to arrive.', avatar: 'https://i.pravatar.cc/150?u=du' },
];

export const DEMO_PRODUCTS = [
  // Smartphones
  { id: 'p1', name: 'iPhone 15 Pro', price: 1200000, compare_price: 1350000, rating: '4.9', review_count: 120, brand: 'Apple', category_id: 'smartphones', is_featured: true, images: [
    'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=600',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=600',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=600'
  ] },
  { id: 'p2', name: 'Samsung Galaxy S24 Ultra', price: 1300000, compare_price: 1450000, rating: '4.8', review_count: 85, brand: 'Samsung', category_id: 'smartphones', is_featured: true, images: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600',
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=600',
    'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=600'
  ] },
  { id: 'p3', name: 'Google Pixel 8 Pro', price: 950000, rating: '4.7', review_count: 45, brand: 'Google', category_id: 'smartphones', images: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600',
    'https://images.unsplash.com/photo-1611604548018-d56bbd85d681?q=80&w=600'
  ] },
  { id: 'p4', name: 'OnePlus 12', price: 850000, rating: '4.6', review_count: 32, brand: 'OnePlus', category_id: 'smartphones', images: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=600'
  ] },
  { id: 'p5', name: 'Nothing Phone (2)', price: 650000, rating: '4.5', review_count: 28, brand: 'Nothing', category_id: 'smartphones', images: [
    'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=600',
    'https://images.unsplash.com/photo-1678911790861-f09b9f71c484?q=80&w=600'
  ] },

  // Laptops
  { id: 'p6', name: 'MacBook Pro M3 Max', price: 3500000, compare_price: 3800000, rating: '5.0', review_count: 50, brand: 'Apple', category_id: 'laptops', is_featured: true, images: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600'
  ] },
  { id: 'p7', name: 'Dell XPS 15', price: 2100000, rating: '4.8', review_count: 75, brand: 'Dell', category_id: 'laptops', images: [
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600'
  ] },
  { id: 'p8', name: 'Razer Blade 16', price: 3200000, rating: '4.9', review_count: 40, brand: 'Razer', category_id: 'laptops', images: [
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600',
    'https://images.unsplash.com/photo-1537498425277-c23e922af812?q=80&w=600'
  ] },
  { id: 'p9', name: 'Asus ROG Zephyrus G14', price: 1800000, rating: '4.7', review_count: 60, brand: 'Asus', category_id: 'laptops', images: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600',
    'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=600'
  ] },
  { id: 'p10', name: 'HP Spectre x360', price: 1600000, rating: '4.6', review_count: 38, brand: 'HP', category_id: 'laptops', images: [
    'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=600',
    'https://images.unsplash.com/photo-1589561253898-768105ca91a8?q=80&w=600'
  ] },

  // Headphones
  { id: 'p11', name: 'Sony WH-1000XM5', price: 380000, compare_price: 450000, rating: '4.9', review_count: 210, brand: 'Sony', category_id: 'headphones', is_featured: true, images: [
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600',
    'https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',
    'https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=600',
    'https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=600'
  ] },
  { id: 'p12', name: 'AirPods Max', price: 550000, rating: '4.7', review_count: 150, brand: 'Apple', category_id: 'headphones', images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',
    'https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600'
  ] },
  { id: 'p13', name: 'Bose QC Ultra', price: 420000, rating: '4.8', review_count: 90, brand: 'Bose', category_id: 'headphones', images: [
    'https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=600',
    'https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=600'
  ] },
  { id: 'p14', name: 'Sennheiser Momentum 4', price: 350000, rating: '4.7', review_count: 65, brand: 'Sennheiser', category_id: 'headphones', images: [
    'https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600'
  ] },
  { id: 'p15', name: 'Beats Studio Pro', price: 280000, rating: '4.5', review_count: 110, brand: 'Beats', category_id: 'headphones', images: [
    'https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=600',
    'https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600'
  ] },

  // Smartwatches
  { id: 'p16', name: 'Apple Watch Ultra 2', price: 850000, compare_price: 900000, rating: '4.9', review_count: 130, brand: 'Apple', category_id: 'smartwatches', is_featured: true, images: [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600'
  ] },
  { id: 'p17', name: 'Galaxy Watch 6 Classic', price: 350000, rating: '4.7', review_count: 85, brand: 'Samsung', category_id: 'smartwatches', images: [
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600'
  ] },
  { id: 'p18', name: 'Garmin Epix Gen 2', price: 950000, rating: '4.8', review_count: 45, brand: 'Garmin', category_id: 'smartwatches', images: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
    'https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600'
  ] },
  { id: 'p19', name: 'Pixel Watch 2', price: 320000, rating: '4.6', review_count: 55, brand: 'Google', category_id: 'smartwatches', images: [
    'https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600'
  ] },
  { id: 'p20', name: 'HUAWEI Watch GT 4', price: 250000, rating: '4.5', review_count: 70, brand: 'HUAWEI', category_id: 'smartwatches', images: [
    'https://images.unsplash.com/photo-1434493789847-2f02dc603507?q=80&w=600',
    'https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600'
  ] },

  // Tablets
  { id: 'p21', name: 'iPad Pro 12.9" M2', price: 1200000, compare_price: 1300000, rating: '4.9', review_count: 140, brand: 'Apple', category_id: 'tablets', is_featured: true, images: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600',
    'https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600'
  ] },
  { id: 'p22', name: 'Samsung Galaxy Tab S9 Ultra', price: 1100000, rating: '4.8', review_count: 65, brand: 'Samsung', category_id: 'tablets', images: [
    'https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600'
  ] },
  { id: 'p23', name: 'Microsoft Surface Pro 9', price: 950000, rating: '4.7', review_count: 80, brand: 'Microsoft', category_id: 'tablets', images: [
    'https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=600',
    'https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600'
  ] },
  { id: 'p24', name: 'Xiaomi Pad 6 Pro', price: 450000, rating: '4.6', review_count: 45, brand: 'Xiaomi', category_id: 'tablets', images: [
    'https://images.unsplash.com/photo-1542751110-9764648393fb?q=80&w=600',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600'
  ] },
  { id: 'p25', name: 'Lenovo Tab P12 Pro', price: 650000, rating: '4.5', review_count: 50, brand: 'Lenovo', category_id: 'tablets', images: [
    'https://images.unsplash.com/photo-1527690789675-4ea7d8da4fe3?q=80&w=600',
    'https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=600'
  ] },

  // Cameras
  { id: 'p26', name: 'Sony A7 IV', price: 2500000, compare_price: 2700000, rating: '4.9', review_count: 95, brand: 'Sony', category_id: 'cameras', is_featured: true, images: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600'
  ] },
  { id: 'p27', name: 'Fujifilm X-T5', price: 1800000, rating: '4.8', review_count: 60, brand: 'Fujifilm', category_id: 'cameras', images: [
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=600',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'
  ] },
  { id: 'p28', name: 'Canon EOS R6 Mark II', price: 2400000, rating: '4.9', review_count: 75, brand: 'Canon', category_id: 'cameras', images: [
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600'
  ] },
  { id: 'p29', name: 'Nikon Z8', price: 4200000, rating: '5.0', review_count: 35, brand: 'Nikon', category_id: 'cameras', images: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600'
  ] },
  { id: 'p30', name: 'GoPro Hero 12', price: 450000, rating: '4.7', review_count: 220, brand: 'GoPro', category_id: 'cameras', images: [
    'https://images.unsplash.com/photo-1562184120-da3e884fbf34?q=80&w=600',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'
  ] },

  // Gaming
  { id: 'p31', name: 'PlayStation 5 Slim', price: 650000, rating: '4.9', review_count: 450, brand: 'Sony', category_id: 'gaming', is_featured: true, images: [
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600',
    'https://images.unsplash.com/photo-1606813907291-d86ebb9c74ad?q=80&w=600'
  ] },
  { id: 'p32', name: 'Xbox Series X', price: 620000, rating: '4.8', review_count: 320, brand: 'Microsoft', category_id: 'gaming', images: [
    'https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?q=80&w=600',
    'https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=600'
  ] },
  { id: 'p33', name: 'Nintendo Switch OLED', price: 420000, rating: '4.8', review_count: 280, brand: 'Nintendo', category_id: 'gaming', images: [
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=600',
    'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600'
  ] },
  { id: 'p34', name: 'Steam Deck 512GB', price: 750000, rating: '4.7', review_count: 150, brand: 'Valve', category_id: 'gaming', images: [
    'https://images.unsplash.com/photo-1660076294523-28846c4f749a?q=80&w=600',
    'https://images.unsplash.com/photo-1660076282307-e85501869e5d?q=80&w=600'
  ] },

  // Accessories
  { id: 'p35', name: 'Logitech MX Master 3S', price: 120000, rating: '4.9', review_count: 520, brand: 'Logitech', category_id: 'accessories', is_featured: true, images: [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=600',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600'
  ] },
  { id: 'p36', name: 'Keychron Q1 Pro', price: 250000, rating: '4.8', review_count: 85, brand: 'Keychron', category_id: 'accessories', images: [
    'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600',
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=600'
  ] },
  { id: 'p37', name: 'Anker 737 Power Bank', price: 150000, rating: '4.9', review_count: 120, brand: 'Anker', category_id: 'accessories', images: [
    'https://images.unsplash.com/photo-1609091839311-d5364f512c58?q=80&w=600'
  ] },
  { id: 'p38', name: 'Samsung T7 Shield 2TB', price: 180000, rating: '4.8', review_count: 95, brand: 'Samsung', category_id: 'accessories', images: [
    'https://images.unsplash.com/photo-1593642634315-48f541e24a64?q=80&w=600'
  ] },

  // Audio Extra
  { id: 'p39', name: 'Marshall Emberton II', price: 180000, rating: '4.7', review_count: 110, brand: 'Marshall', category_id: 'audio', images: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600',
    'https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=600'
  ] },
  { id: 'p40', name: 'Sonos Era 100', price: 320000, rating: '4.8', review_count: 65, brand: 'Sonos', category_id: 'audio', images: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600'
  ] },

  // More Smartphones
  { id: 'p41', name: 'Xiaomi 14 Ultra', price: 1100000, rating: '4.7', review_count: 45, brand: 'Xiaomi', category_id: 'smartphones', images: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600'
  ] },
  { id: 'p42', name: 'Samsung Galaxy Z Fold 5', price: 1800000, rating: '4.6', review_count: 80, brand: 'Samsung', category_id: 'smartphones', images: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600'
  ] },
  { id: 'p43', name: 'iPhone 13', price: 650000, rating: '4.8', review_count: 900, brand: 'Apple', category_id: 'smartphones', images: [
    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=600'
  ] },
  { id: 'p44', name: 'Google Pixel 7a', price: 450000, rating: '4.7', review_count: 320, brand: 'Google', category_id: 'smartphones', images: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600'
  ] },

  // More Laptops
  { id: 'p45', name: 'Surface Laptop 5', price: 1200000, rating: '4.6', review_count: 55, brand: 'Microsoft', category_id: 'laptops', images: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600'
  ] },
  { id: 'p46', name: 'Lenovo Legion 5i', price: 1400000, rating: '4.8', review_count: 140, brand: 'Lenovo', category_id: 'laptops', images: [
    'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=600'
  ] },
  { id: 'p47', name: 'MacBook Air M2', price: 1100000, rating: '4.9', review_count: 850, brand: 'Apple', category_id: 'laptops', images: [
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600'
  ] },

  // Wearables
  { id: 'p48', name: 'Fitbit Charge 6', price: 180000, rating: '4.5', review_count: 210, brand: 'Fitbit', category_id: 'smartwatches', images: [
    'https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600'
  ] },
  { id: 'p49', name: 'Amazfit GTR 4', price: 220000, rating: '4.6', review_count: 85, brand: 'Amazfit', category_id: 'smartwatches', images: [
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600'
  ] },
  { id: 'p50', name: 'Oura Ring Gen 3', price: 350000, rating: '4.7', review_count: 120, brand: 'Oura', category_id: 'smartwatches', images: [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600'
  ] },
];
