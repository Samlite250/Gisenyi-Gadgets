-- ============================================================
-- GISENYI GADGETS — SEED DATA
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ─── SMARTPHONES (5) ─────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('iPhone 15 Pro Max',       'Titanium design, A17 Pro chip, 48MP camera, USB-C, Action Button. The most powerful iPhone ever made.',                              1450000, 1600000, 12, ARRAY['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=600','https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=600'], 'Apple',   4.9, 215, true ),
  ('Samsung Galaxy S24 Ultra','6.8" QHD+ display, 200MP camera, S Pen included, Snapdragon 8 Gen 3, 5000mAh battery.',                                             1300000, 1450000, 8,  ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600','https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600'], 'Samsung', 4.8, 187, true ),
  ('Google Pixel 8 Pro',      '6.7" LTPO OLED, Google Tensor G3, 50MP triple camera with AI Magic Eraser, 7 years of OS updates.',                                 950000,  null,    15, ARRAY['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600','https://images.unsplash.com/photo-1611604548018-d56bbd85d681?q=80&w=600'], 'Google',  4.7, 98,  false),
  ('OnePlus 12',              '6.82" LTPO3 AMOLED, Snapdragon 8 Gen 3, 50MP Hasselblad triple cam, 100W SuperVOOC charging.',                                      850000,  950000,  20, ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=600'], 'OnePlus', 4.6, 76,  false),
  ('Xiaomi 14 Ultra',         'Leica-tuned 1-inch main sensor, 6.73" LTPO AMOLED, Snapdragon 8 Gen 3, 90W wired charging.',                                        1100000, 1200000, 10, ARRAY['https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=600','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600'], 'Xiaomi',  4.7, 54,  false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'smartphones';

-- ─── LAPTOPS (5) ─────────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('MacBook Pro M3 Max',      '16-inch Liquid Retina XDR, M3 Max chip, 36GB RAM, 1TB SSD. Built for the most demanding professionals.',                             3500000, 3800000, 5,  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600','https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600'], 'Apple',     5.0, 89,  true ),
  ('Dell XPS 15 OLED',        '15.6" 3.5K OLED, Intel Core i9-13900H, RTX 4070, 32GB RAM, 1TB NVMe. Premium ultrabook for creators.',                              2100000, 2300000, 7,  ARRAY['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600','https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600'], 'Dell',      4.8, 65,  true ),
  ('Asus ROG Zephyrus G14',   '14" QHD+ 165Hz, AMD Ryzen 9, RTX 4060, 16GB DDR5. Compact gaming powerhouse with AniMe Matrix lid.',                               1800000, null,    10, ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600','https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=600'], 'Asus',      4.7, 112, false),
  ('HP Spectre x360 14',      '14" 2.8K OLED touch, Intel Evo i7, Intel Arc, 32GB RAM, 360° hinge. The most versatile premium laptop.',                            1600000, 1750000, 12, ARRAY['https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=600','https://images.unsplash.com/photo-1589561253898-768105ca91a8?q=80&w=600'], 'HP',        4.6, 58,  false),
  ('Lenovo Legion 5i Pro',    '16" QHD 240Hz, Intel Core i7-13700HX, RTX 4070, 32GB RAM. Serious gaming without the serious price.',                               1900000, 2100000, 8,  ARRAY['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600','https://images.unsplash.com/photo-1537498425277-c23e922af812?q=80&w=600'], 'Lenovo',    4.8, 143, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'laptops';

-- ─── HEADPHONES (5) ──────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Sony WH-1000XM5',        'Industry-leading noise cancellation, 30hr battery, Multipoint connection, Speak-to-Chat, crystal clear calls.',                       380000, 450000, 25, ARRAY['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600','https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600'], 'Sony',       4.9, 320, true ),
  ('AirPods Pro (3rd Gen)',  'Active Noise Cancellation, Transparency mode, Adaptive Audio, H2 chip, 30hr total battery with case.',                                320000, 360000, 30, ARRAY['https://images.unsplash.com/photo-1588423771073-b8903fead2eb?q=80&w=600','https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=600'], 'Apple',      4.8, 445, true ),
  ('Bose QuietComfort Ultra', 'World-class ANC, Immersive Audio with spatial sound, CustomTune technology, 24hr battery.',                                           420000, null,   18, ARRAY['https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=600','https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=600'], 'Bose',       4.8, 178, false),
  ('Sennheiser Momentum 4',  'Adaptive ANC, 60hr playtime, Crystal-clear Sennheiser sound, foldable design, touch controls.',                                       350000, 400000, 15, ARRAY['https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600','https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600'], 'Sennheiser', 4.7, 96,  false),
  ('Beats Studio Pro',       'Personalized Spatial Audio, ANC + Transparency, USB-C & 3.5mm, 40hr battery, compatible with Apple & Android.',                      280000, 320000, 22, ARRAY['https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=600','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600'], 'Beats',      4.5, 201, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'headphones';

-- ─── SMARTWATCHES (5) ────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Apple Watch Ultra 2',     'Titanium case, 49mm always-on Retina, precision dual-frequency GPS, depth gauge, 60hr battery life.',                                850000, 900000, 8,  ARRAY['https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600','https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600'], 'Apple',   4.9, 187, true ),
  ('Samsung Galaxy Watch 6 Classic', '47mm rotating bezel, BioActive Sensor, sleep coaching, Advanced GPS, 40hr battery.',                                         350000, 400000, 15, ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600','https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600'], 'Samsung', 4.7, 124, true ),
  ('Garmin Epix Gen 2',       'AMOLED display, multi-band GPS, 16-day battery, advanced training metrics, titanium bezel.',                                         950000, null,   6,  ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600','https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600'], 'Garmin',  4.8, 73,  false),
  ('Google Pixel Watch 2',    'Wear OS 4, Fitbit health suite, 24hr heart rate, emergency SOS, fast charging, 24hr battery.',                                       320000, 360000, 20, ARRAY['https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600','https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600'], 'Google',  4.6, 89,  false),
  ('Huawei Watch GT 4',       '46mm dual-chip, 14-day battery, professional health monitoring, GPS, stylish design.',                                               250000, 280000, 25, ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc603507?q=80&w=600','https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600'], 'Huawei',  4.5, 102, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'smartwatches';

-- ─── TABLETS (5) ─────────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('iPad Pro 13" M4',         'Ultra Retina XDR OLED, M4 chip, Apple Pencil Pro support, landscape front camera, thinnest Apple product ever.',                    1400000, 1550000, 7,  ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600','https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600'], 'Apple',     4.9, 156, true ),
  ('Samsung Galaxy Tab S9 Ultra','14.6" Super AMOLED, Snapdragon 8 Gen 2, IP68, S Pen included, 12GB RAM, 11200mAh battery.',                                       1100000, 1250000, 9,  ARRAY['https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600'], 'Samsung',   4.8, 98,  true ),
  ('Microsoft Surface Pro 9', '13" PixelSense Flow, Intel Core i7 Evo, 16GB RAM, detachable keyboard, Surface Pen support.',                                        950000, null,   11, ARRAY['https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=600','https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600'], 'Microsoft', 4.7, 67,  false),
  ('Xiaomi Pad 6 Pro',        '11" 144Hz display, Snapdragon 8+ Gen 1, Xiaomi Stylus 2, Dolby Atmos quad speakers, 8600mAh.',                                       450000, 500000, 18, ARRAY['https://images.unsplash.com/photo-1542751110-9764648393fb?q=80&w=600','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600'], 'Xiaomi',    4.6, 134, false),
  ('Lenovo Tab P12 Pro',      '12.6" Super AMOLED 2K, Snapdragon 870, JBL quad speakers, 10200mAh, Lenovo Precision Pen 3.',                                        650000, 720000, 14, ARRAY['https://images.unsplash.com/photo-1527690789675-4ea7d8da4fe3?q=80&w=600','https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=600'], 'Lenovo',    4.5, 81,  false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'tablets';

-- ─── CAMERAS (5) ─────────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Sony Alpha A7 IV',        '33MP full-frame BSI sensor, 4K 60p video, 759 phase-detect AF points, 5-axis IBIS, dual card slots.',                               2500000, 2700000, 5,  ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600'], 'Sony',    4.9, 134, true ),
  ('Canon EOS R6 Mark II',    '24.2MP full-frame CMOS, 6K RAW video, 40fps burst, AI subject detection AF, 5-axis IS.',                                             2400000, 2600000, 4,  ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600','https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600'], 'Canon',   4.9, 98,  true ),
  ('Fujifilm X-T5',           '40MP APS-C X-Trans sensor, 6.2K video, IBIS, film simulations, compact retro body.',                                                 1800000, null,   7,  ARRAY['https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=600','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'], 'Fujifilm', 4.8, 77,  false),
  ('GoPro Hero 12 Black',     '5.3K60 + 4K120 video, HyperSmooth 6.0, Max Lens Mod 2.0, waterproof to 10m, HDR photo & video.',                                    450000, 500000, 22, ARRAY['https://images.unsplash.com/photo-1562184120-da3e884fbf34?q=80&w=600','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'], 'GoPro',   4.7, 298, false),
  ('DJI Osmo Pocket 3',       '1-inch CMOS sensor, 4K/120fps, 3-axis gimbal, face & subject tracking, 166-minute battery.',                                         550000, 620000, 12, ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600'], 'DJI',     4.8, 167, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'cameras';

-- ─── GAMING (5) ──────────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('PlayStation 5 Slim',      'Ultra-HD Blu-ray, 1TB SSD, DualSense wireless controller, 4K@120fps gaming, backward compatible.',                                   650000, 700000, 10, ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600','https://images.unsplash.com/photo-1606813907291-d86ebb9c74ad?q=80&w=600'], 'Sony',      4.9, 520, true ),
  ('Xbox Series X',           '4K@120fps, 12 TFLOPS GPU, 1TB NVMe SSD, Quick Resume, Game Pass compatibility, Smart Delivery.',                                     620000, null,   8,  ARRAY['https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?q=80&w=600','https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=600'], 'Microsoft', 4.8, 380, true ),
  ('Nintendo Switch OLED',    '7-inch OLED screen, enhanced audio, 64GB storage, wired LAN port, wide adjustable stand.',                                           420000, 460000, 15, ARRAY['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=600','https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600'], 'Nintendo',  4.8, 312, false),
  ('Steam Deck OLED 512GB',   '7.4-inch OLED HDR display, AMD Zen 2 + RDNA 2, 50Whr battery, PC gaming in your hands.',                                             750000, 820000, 6,  ARRAY['https://images.unsplash.com/photo-1660076294523-28846c4f749a?q=80&w=600','https://images.unsplash.com/photo-1660076282307-e85501869e5d?q=80&w=600'], 'Valve',     4.7, 218, false),
  ('Razer Kishi V2 Pro',      'Console-quality gaming controller for Android, clickable triggers, haptic feedback, USB-C passthrough.',                              85000,  null,   30, ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600','https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?q=80&w=600'], 'Razer',     4.6, 145, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'gaming';

-- ─── ACCESSORIES (5) ─────────────────────────────────────────
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT
  p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Logitech MX Master 3S',   '8K DPI sensor, ultra-quiet clicks, MagSpeed wheel, Bluetooth + USB, works on any surface including glass.',                          120000, 140000, 35, ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=600','https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600'], 'Logitech', 4.9, 620, true ),
  ('Anker 737 Power Bank',    '24000mAh, 140W total output, dual USB-C + USB-A, charges MacBook Pro in 1.5hrs, smart display.',                                     150000, 170000, 28, ARRAY['https://images.unsplash.com/photo-1609091839311-d5364f512c58?q=80&w=600','https://images.unsplash.com/photo-1609091839311-d5364f512c58?q=80&w=600'], 'Anker',    4.9, 445, true ),
  ('Keychron Q1 Pro',         '75% layout, QMK/Via compatible, hot-swappable, aluminum body, RGB backlight, wireless & wired.',                                     250000, 280000, 15, ARRAY['https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600','https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=600'], 'Keychron', 4.8, 187, false),
  ('Samsung T7 Shield 2TB',   'IP65 rated, shock resistant, USB 3.2 Gen 2, 1050MB/s read, AES-256 encryption, rugged portable SSD.',                                180000, 210000, 20, ARRAY['https://images.unsplash.com/photo-1593642634315-48f541e24a64?q=80&w=600','https://images.unsplash.com/photo-1593642634315-48f541e24a64?q=80&w=600'], 'Samsung',  4.8, 234, false),
  ('Belkin MagSafe 3-in-1',   'Charge iPhone + Apple Watch + AirPods simultaneously, MagSafe 15W, foldable travel-friendly design.',                                 95000,  null,   40, ARRAY['https://images.unsplash.com/photo-1609091839311-d5364f512c58?q=80&w=600','https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600'], 'Belkin',   4.6, 312, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'accessories';

-- Verify
SELECT c.name AS category, COUNT(p.id) AS products FROM public.categories c LEFT JOIN public.products p ON p.category_id = c.id GROUP BY c.name ORDER BY c.name;
