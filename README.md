# Gisenyi Gadgets 🛍️

A production-ready mobile eCommerce platform with a React Native mobile app and a React/Vite Admin Dashboard.

---

## 🏗️ Project Structure

```
Gisenyi Gadgets/
├── mobile-app/          # React Native (Expo) app
├── admin-dashboard/     # React + Vite admin panel
├── supabase/
│   └── schema.sql       # Full database schema
└── README.md
```

---

## 📱 Mobile App Features

| Screen               | Description                                      |
|----------------------|--------------------------------------------------|
| Splash               | Logo + "Shop Smart. Live Better." animation      |
| Onboarding           | 3-step carousel                                  |
| Login / Register     | Supabase auth, validation, password toggle       |
| Forgot Password      | Email reset + success confirmation state         |
| Home                 | Banners, categories, featured/new products       |
| Search               | Debounced Supabase search, sort filter           |
| Product Details      | Gallery, variants, wishlist, Add to Cart / Buy Now |
| Cart                 | Persistent cart, qty controls, shipping calc     |
| Checkout             | Address, payment method, real Supabase order     |
| Order Success        | Animated ✓, clears cart, delivery steps         |
| My Orders            | Real orders from Supabase, filter tabs, refresh  |
| Order Tracking       | Step-by-step delivery tracker                    |
| Wishlist             | Persistent, add-to-cart from wishlist            |
| Profile              | Real user data, stats, sign-out confirmation     |

**State Management:**
- `AuthContext` — Supabase persistent login, profile management
- `CartContext` — AsyncStorage persistence, shipping calc
- `WishlistContext` — AsyncStorage persistence, toggle

---

## 🖥️ Admin Dashboard Features

| Page         | Features                                                         |
|--------------|------------------------------------------------------------------|
| Dashboard    | 5 stat cards, SVG bar chart, SVG donut chart, recent orders, top products |
| Products     | DataTable, search, add/edit modal, delete, featured/active flags |
| Orders       | Filter tabs, status dropdown (live Supabase update), detail modal |
| Users        | Role filter, block/unblock toggle, user detail modal             |
| Vendors      | Verify/revoke, detail modal, summary stats                       |
| Reviews      | Star filter, rating distribution bar, delete moderation          |
| Settings     | Tabbed: General, Shipping, Notifications, Security, Appearance   |

**Running:** `http://localhost:5173` (start with `node .\node_modules\vite\bin\vite.js`)

---

## 🚀 Quick Start

### 1. Setup Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste `supabase/schema.sql` → **Run**
3. Copy your **Project URL** and **Anon Key**

### 2. Mobile App
```bash
cd mobile-app
cp .env.example .env
# Add your Supabase URL and Anon Key to .env
npm install
npx expo start
# Scan QR code with Expo Go on your phone
```

### 3. Admin Dashboard
```bash
cd admin-dashboard
cp .env.example .env
# Add your Supabase URL and Anon Key to .env

# Option A (standard)
npm run dev

# Option B (if cmd.exe issue on Windows)
node .\node_modules\vite\bin\vite.js

# Open http://localhost:5173
```

---

## 🗄️ Database Tables

| Table          | Description                              |
|----------------|------------------------------------------|
| `profiles`     | User profiles (auto-created on signup)   |
| `vendors`      | Vendor shops                             |
| `categories`   | 8 seeded categories                      |
| `products`     | Product catalog                          |
| `orders`       | Customer orders                          |
| `order_items`  | Order line items (computed subtotal)     |
| `reviews`      | Product reviews                          |
| `wishlists`    | Saved products per user                  |
| `notifications`| User notifications                       |

All tables have: **RLS policies**, **indexes**, **auto `updated_at` triggers**

---

## 📦 Build for Production

### Android APK / AAB (via EAS)
```bash
npm install -g eas-cli
cd mobile-app
eas login
eas build:configure
eas build -p android --profile preview    # APK for testing
eas build -p android --profile production # AAB for Play Store
```

### Admin Dashboard
```bash
cd admin-dashboard
node .\node_modules\vite\bin\vite.js build
# Deploy ./dist to any static host (Netlify, Vercel, etc.)
```

---

## 🎨 Design System

| Token          | Value     |
|----------------|-----------|
| Primary Blue   | `#4285F4` |
| Primary Green  | `#34A853` |
| Dark BG        | `#0F172A` |
| Card BG        | `#1E293B` |
| Error          | `#EA4335` |
| Border Radius  | 16px      |
| Grid           | 8pt       |

---

*Built with ❤️ using React Native (Expo) + Vite (React) + Supabase*
