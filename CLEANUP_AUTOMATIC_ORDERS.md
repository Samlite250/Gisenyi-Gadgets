# Cleanup Automatic Payment Orders

## Overview
This guide helps you remove all orders made via automatic payment (Paypack integration) and their corresponding transactions.

## ⚠️ WARNING
**Permanent deletion cannot be undone!** Consider using the soft delete option first.

## Two Options Available

### Option 1: Soft Delete (RECOMMENDED) ✅
Marks orders as 'cancelled' but keeps the data for record-keeping.

**File:** `soft_delete_automatic_orders.sql`

**What it does:**
- Changes order status to 'cancelled'
- Changes payment_status to 'failed'
- Updates transaction status to 'failed'
- Preserves all data for audit purposes
- Orders won't appear in active order lists

**To Run:**
1. Go to Supabase Dashboard → SQL Editor
2. Open `soft_delete_automatic_orders.sql`
3. Copy and paste the SQL
4. Click **Run**

### Option 2: Permanent Delete (DESTRUCTIVE) ⚠️
Permanently removes automatic orders and transactions from database.

**File:** `cleanup_automatic_orders.sql`

**What it does:**
- **PERMANENTLY** deletes all transactions linked to automatic orders
- **PERMANENTLY** deletes all automatic orders
- Cannot be recovered after deletion

**To Run:**
1. Go to Supabase Dashboard → SQL Editor
2. Open `cleanup_automatic_orders.sql`
3. **Review the verification query first** (Step 1)
4. If you're sure, copy and paste the SQL
5. Click **Run**

## Step-by-Step Instructions

### Using Soft Delete (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your Gisenyi Gadgets project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Copy the SQL**
   - Open `soft_delete_automatic_orders.sql`
   - Copy all contents

4. **Paste and Run**
   - Paste into SQL Editor
   - Click **Run** or press **Ctrl+Enter**

5. **Verify Results**
   - Check the output tables
   - Automatic orders should now show status='cancelled'

### Using Permanent Delete (Destructive)

1. **BACKUP FIRST** (Optional but recommended)
   - Go to Database → Backups
   - Create a manual backup

2. **Review Orders First**
   - Run only Step 1 from `cleanup_automatic_orders.sql`
   - Review the orders that will be deleted
   - Make sure you want to delete them

3. **Delete Transactions**
   - Run Step 2 (deletes transactions)

4. **Delete Orders**
   - Run Step 3 (deletes orders)

5. **Verify Deletion**
   - Run Steps 4 and 5 to confirm

## What Gets Affected

### Tables Modified:
- **orders** table - automatic payment orders
- **transactions** table - linked transactions

### Criteria:
- All orders where `payment_type = 'automatic'`
- All transactions linked to those orders

### Data Preserved (in soft delete):
- Order history
- Transaction records
- User data
- Product data

### Data Deleted (in permanent delete):
- Order records with payment_type='automatic'
- All associated transaction records

## Verification Queries

**Check automatic orders count:**
```sql
SELECT COUNT(*) 
FROM orders 
WHERE payment_type = 'automatic';
```

**Check cancelled orders (after soft delete):**
```sql
SELECT COUNT(*) 
FROM orders 
WHERE payment_type = 'automatic' AND status = 'cancelled';
```

**View remaining active orders:**
```sql
SELECT 
  payment_type,
  COUNT(*) as count,
  SUM(total_amount) as revenue
FROM orders
WHERE status != 'cancelled'
GROUP BY payment_type;
```

## Rollback (Only for Soft Delete)

If you used soft delete and want to restore orders:

```sql
-- Restore cancelled automatic orders
UPDATE orders
SET
  status = 'pending',
  payment_status = 'unpaid',
  updated_at = NOW()
WHERE payment_type = 'automatic' AND status = 'cancelled';

-- Restore transactions
UPDATE transactions
SET
  status = 'pending',
  updated_at = NOW()
WHERE order_id IN (
  SELECT id
  FROM orders
  WHERE payment_type = 'automatic'
);
```

## Impact on Dashboard

After cleanup:
- **Total Revenue**: Will decrease (automatic orders removed)
- **Order Counts**: Will show fewer orders
- **Transaction History**: Will not show automatic transactions (soft delete) or they'll be gone (hard delete)
- **User Order History**: Automatic orders won't appear (soft delete) or will be gone (hard delete)

## Manual Payment Orders

**Not affected** - Only automatic payment orders are removed. Orders with:
- `payment_type = 'manual'` (MTN MoMo, Airtel manual uploads)
- `payment_type = 'cash'` (Cash on Delivery)

These will remain intact.

## Recommendation

**Use Soft Delete** unless you have a specific reason to permanently delete data:
- ✅ Keeps audit trail
- ✅ Can be reversed
- ✅ Preserves financial records
- ✅ Maintains data integrity
- ✅ Complies with record-keeping requirements

**Use Permanent Delete** only if:
- You need to comply with data deletion requests (GDPR)
- Database storage is critical
- Test data needs to be completely removed

## After Cleanup

1. **Refresh Admin Dashboard**
   - Reload the page
   - Statistics should update

2. **Verify Order Counts**
   - Check total orders
   - Check revenue totals

3. **Test Manual Payments**
   - Ensure manual payment orders still work
   - Verify cash on delivery still works

## Questions?

- **Where are automatic orders?** Orders placed via Paypack automatic payment integration
- **Will this affect users?** No, user accounts and profiles remain intact
- **What about manual MoMo?** Not affected - only automatic payments
- **Can I undo?** Yes, if you used soft delete. No, if you permanently deleted.

## Files in This Package

- ✅ `soft_delete_automatic_orders.sql` - Safe soft delete
- ✅ `cleanup_automatic_orders.sql` - Permanent deletion
- ✅ `CLEANUP_AUTOMATIC_ORDERS.md` - This guide
