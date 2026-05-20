# Production Setup Guide
**Clear Seed Data & Start With Real Orders**

---

## 🎯 Goal
Remove all test/seed data and prepare your system for real customer orders.

---

## ⚠️ IMPORTANT: What Will Happen

### ✅ **WILL BE DELETED:**
- All test orders (with "SEED" prefix) → 23 orders
- All order items from test orders
- Supplier sales reset to RWF 0
- Test notifications (optional)

### ✅ **WILL BE KEPT:**
- All 55 products (your inventory)
- All categories
- All user accounts (9 customers)
- Suppliers (but their `total_sold` reset to 0)
- Database structure (tables, policies, etc.)

### 📊 **Dashboard After Cleanup:**
```
Total Revenue:     RWF 0
Total Orders:      0
My Net Profit:     RWF 0
Owed To Suppliers: RWF 0
```

---

## 🚀 Step-by-Step Cleanup Process

### Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/cysejrutcrfvopqjqknv
2. Click on **"SQL Editor"** in left sidebar
3. Click **"New Query"**

### Step 2: Run Cleanup Script

Copy and paste this SQL script:

```sql
-- CLEAR SEED DATA - PRODUCTION SETUP
BEGIN;

-- 1. Clear order items from seed orders
DELETE FROM public.order_items
WHERE order_id IN (
  SELECT id FROM public.orders WHERE order_number LIKE 'SEED%'
);

-- 2. Delete all seed orders
DELETE FROM public.orders WHERE order_number LIKE 'SEED%';

-- 3. Reset supplier sales to zero
UPDATE public.suppliers SET total_sold = 0;

-- 4. Optional: Clear test notifications
DELETE FROM public.notifications 
WHERE title LIKE '%Welcome%' OR title LIKE '%Flash Sale%';

COMMIT;

-- Verification
SELECT 'Orders' as table_name, COUNT(*) as count FROM public.orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'Suppliers (with sales)', COUNT(*) FROM public.suppliers WHERE total_sold > 0;
```

### Step 3: Click "RUN" Button

- The script executes in a transaction (safe)
- If any error occurs, nothing changes (rollback)
- You should see verification results at the bottom

### Step 4: Verify Cleanup

Check the verification results should show:
```
Orders: 0
Order Items: 0
Suppliers (with sales): 0
```

---

## ✅ Verify Dashboard

### Open Admin Dashboard
1. Go to: https://gisenyicpanel.vercel.app
2. Login with admin credentials
3. Check dashboard metrics:

**Expected Values:**
```
✅ Total Revenue:          RWF 0
✅ Total Orders:           0
✅ Total Users:            9 (kept)
✅ Total Products:         55 (kept)
✅ Active Suppliers:       2 (kept)
✅ My Net Profit:          RWF 0
✅ Owed To Suppliers:      RWF 0
```

**If you see these zeros, cleanup was successful!** ✅

---

## 📱 How Real Orders Will Work Now

### From Mobile App:

#### Customer Journey:
1. **Browse Products** → Customer sees your 55 products
2. **Add to Cart** → Items stored locally on their phone
3. **Checkout** → Customer proceeds to payment
4. **Select Payment Method:**
   - MTN MoMo
   - Airtel Money
   - Bank Transfer
   - Crypto
   - Cash on Delivery

5. **Payment Process:**
   - **Manual Payment (MoMo/Bank):**
     - Customer pays outside app
     - Upload payment screenshot
     - Order created with `payment_status = 'unpaid'`
     - You verify and mark as 'paid' in admin dashboard
   
   - **Cash on Delivery:**
     - Order created with `payment_status = 'unpaid'`
     - Mark as 'paid' when customer pays on delivery

6. **Order Created in Database** ✅

### Dashboard Updates Automatically:

When you mark an order as **PAID**:
- ✅ **Total Revenue** increases
- ✅ **Total Orders** count increases
- ✅ **My Net Profit** recalculates
- ✅ Order appears in "Recent Orders" list

---

## 🛍️ How to Process Your First Real Order

### Scenario: Customer Orders iPhone

#### Step 1: Customer Places Order (Mobile App)
- Customer: John Doe
- Product: iPhone 15 Pro
- Price: RWF 1,200,000
- Payment: MTN MoMo (manual)
- Screenshot uploaded

**Order automatically created in database:**
```
order_number: AUTO-GENERATED (e.g., "GG20240520001")
total: 1,200,000
payment_status: 'unpaid' (waiting for verification)
status: 'pending'
```

#### Step 2: You Verify Payment (Admin Dashboard)

1. Go to **Orders** page
2. Find the new order
3. View payment screenshot
4. Confirm payment received in your MoMo account
5. **Click "Mark as Paid"** button

#### Step 3: Dashboard Updates Instantly ✅

**Before:**
```
Total Revenue: RWF 0
My Net Profit: RWF 0
```

**After:**
```
Total Revenue: RWF 1,200,000 ✅
My Net Profit: RWF 1,200,000 ✅
```

#### Step 4: Fulfill Order
1. Update order status: `pending` → `processing` → `shipped` → `delivered`
2. Customer gets notifications at each stage
3. Order tracking updates in app

---

## 🤝 How Supplier Orders Work

### Scenario: Supplier Product Sells

#### If Product is from Supplier (Consignment):

**Example:**
- Supplier: Jean-Pierre Habimana
- Commission Rate: 15%
- Product: Samsung Galaxy S24
- Sale Price: RWF 800,000

**When order is marked as PAID:**

1. **Update Supplier in Admin Dashboard:**
   - Go to **Suppliers** page
   - Find Jean-Pierre Habimana
   - Update his `Total Sold` from RWF 0 to RWF 800,000

2. **Dashboard Recalculates:**
```
Total Revenue:          RWF 800,000
├─ Your Commission:     RWF 120,000 (15%)
└─ Owed To Supplier:    RWF 680,000 (85%)

My Net Profit:          RWF 120,000
Owed To Suppliers:      RWF 680,000
```

3. **You Pay Supplier:**
   - Transfer RWF 680,000 to Jean-Pierre
   - You keep RWF 120,000 as commission

---

## 📊 Example: First Week in Production

### Monday - Order #1 (Own Stock)
- Product: MacBook Pro
- Price: RWF 2,000,000
- **Your Profit:** RWF 2,000,000

**Dashboard:**
```
Total Revenue: RWF 2,000,000
My Net Profit: RWF 2,000,000
```

### Wednesday - Order #2 (Supplier Product)
- Product: AirPods (Supplier: Marie Claire, 20% commission)
- Price: RWF 300,000
- **Your Commission:** RWF 60,000
- **Owe Supplier:** RWF 240,000

**Dashboard:**
```
Total Revenue:       RWF 2,300,000
My Net Profit:       RWF 2,060,000
Owed To Suppliers:   RWF 240,000
```

### Friday - Order #3 (Own Stock)
- Product: Samsung TV
- Price: RWF 1,500,000
- **Your Profit:** RWF 1,500,000

**Dashboard:**
```
Total Revenue:       RWF 3,800,000
My Net Profit:       RWF 3,560,000
Owed To Suppliers:   RWF 240,000
```

---

## 🔧 Admin Tasks You'll Do Regularly

### Daily:
- ✅ Check new orders
- ✅ Verify payment screenshots
- ✅ Mark verified orders as "paid"
- ✅ Update order status (processing → shipped)

### Weekly:
- ✅ Review financial metrics
- ✅ Update supplier `total_sold` values
- ✅ Check inventory (products running low)

### Monthly:
- ✅ Pay suppliers their share
- ✅ Reset supplier `total_sold` to 0 (after payment)
- ✅ Review revenue trends
- ✅ Restock popular products

---

## 📱 Customer Experience (Mobile App)

### After Cleanup, Customers Can:

1. ✅ **Browse** all 55 products (unchanged)
2. ✅ **Search** and filter products
3. ✅ **Add to cart** and wishlist
4. ✅ **Checkout** with all payment methods
5. ✅ **Track orders** in Orders tab
6. ✅ **View profile** and order history
7. ✅ **Get notifications** about order status

**Nothing breaks for customers!** The app works exactly the same.

---

## ⚠️ Important Notes

### About Order Numbers:

**Test orders had:**
```
SEED3ACGT6, SEEDHXVRUE, etc.
```

**Real orders will have:**
```
GG20240520001, GG20240520002, etc.
```
(Auto-generated by database trigger)

### About Payment Verification:

**You MUST manually verify payments!**

1. Customer uploads screenshot
2. Check your MoMo/bank account
3. Confirm payment received
4. Mark order as "paid" in admin dashboard

**NEVER mark as paid without verification!**

### About Supplier Tracking:

**Update supplier sales ONLY for supplier products:**
- If product is yours → Don't update suppliers
- If product is consignment → Update supplier's `total_sold`

---

## 🎉 You're Ready for Production!

### Checklist Before Going Live:

- [x] Seed data cleared
- [x] Dashboard shows RWF 0
- [x] Mobile app still works
- [x] Admin dashboard accessible
- [x] Payment methods configured
- [x] Supabase email templates set up
- [x] Products inventory ready

### Next Steps:

1. ✅ **Run the cleanup script** (Step 2 above)
2. ✅ **Verify dashboard** shows zeros
3. ✅ **Test with a real order** (use your own phone)
4. ✅ **Process the test order** in admin dashboard
5. ✅ **Confirm everything works**
6. ✅ **Announce to customers!** 🚀

---

## 🆘 Troubleshooting

### "Dashboard still shows old data"
**Solution:** Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### "Orders table is empty but dashboard shows numbers"
**Solution:** Clear browser cache or open in incognito mode

### "Customer can't place order"
**Solution:** 
- Check mobile app is connected to Supabase
- Check `.env` file has correct credentials
- Check order creation permissions in RLS policies

### "Need to restore seed data"
**Solution:** Run the seed script again:
```bash
cd admin-dashboard
node seed_data.js
```

---

## 📞 Support

Need help?
- Check DEPLOYMENT_CHECKLIST.md
- Check AUDIT_REPORT.md
- Check FINANCIAL_AUDIT_REPORT.md

---

**Ready to start fresh?** Run the cleanup script and watch your first real order come in! 🎊

