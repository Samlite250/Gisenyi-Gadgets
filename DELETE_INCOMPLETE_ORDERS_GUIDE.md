# Delete Incomplete Automatic Orders

## ⚠️ IMPORTANT: Run Migration 008 First!

**This guide assumes you have ALREADY run migration 008** (`supabase/migrations/008_add_payment_fields.sql`).

If you haven't run migration 008 yet, use **`delete_automatic_orders_corrected.sql`** instead, which works with the current schema.

## What This Does

**Permanently deletes** automatic payment orders that are NOT completed, while **keeping** completed/delivered orders.

### Will Be DELETED:
- ❌ Pending automatic orders
- ❌ Processing automatic orders  
- ❌ Cancelled automatic orders
- ❌ Failed automatic orders
- ❌ Any automatic order with status NOT 'completed' or 'delivered'

### Will Be KEPT:
- ✅ Completed automatic orders (status = 'completed')
- ✅ Delivered automatic orders (status = 'delivered')
- ✅ ALL manual payment orders (MTN MoMo manual, Airtel manual)
- ✅ ALL cash on delivery orders

## Prerequisites

✅ Migration 008 must be run first (adds `payment_type` field)

If migration 008 is NOT run yet:
- Use `delete_automatic_orders_corrected.sql` instead
- It uses `payment_method` field which exists in current schema

## Quick Instructions

### Step 1: Review Before Deleting

Go to Supabase Dashboard → SQL Editor → New Query

**Run this first to see what will be deleted:**

```sql
SELECT
  id,
  order_number,
  status,
  payment_status,
  total_amount,
  created_at
FROM orders
WHERE payment_type = 'automatic'
  AND status NOT IN ('completed', 'delivered')
ORDER BY created_at DESC;
```

### Step 2: Permanent Deletion

**Copy and paste this SQL:**

```sql
-- Delete incomplete automatic orders
-- (No transactions table exists in this schema)
DELETE FROM orders
WHERE payment_type = 'automatic'
  AND status NOT IN ('completed', 'delivered');
```

**Click "Run"** or press **Ctrl+Enter**

### Step 3: Verify

**Check what remains:**

```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(total_amount) as revenue
FROM orders
WHERE payment_type = 'automatic'
GROUP BY status;
```

Should only show 'completed' and/or 'delivered' automatic orders.

## Expected Results

### Before:
- 3 Paid orders (completed)
- 12 Pending Review orders
- 0 Failed orders

### After:
- 3 Paid orders (completed) - **KEPT** ✅
- 0 Pending Review orders - **DELETED** ❌
- Revenue from completed orders - **PRESERVED** ✅

## Why Keep Completed Orders?

- **Financial records**: Completed orders represent actual revenue
- **Audit trail**: Need records of successful transactions
- **Customer history**: Users should see their completed orders
- **Legal compliance**: May be required to keep completed transaction records

## Impact on Dashboard

After deletion:
- **Paid orders**: Unchanged (still 3)
- **Pending Review**: Will become 0 (deleted)
- **Failed/Unpaid**: Will become 0 (deleted)
- **Total Revenue**: May decrease if incomplete orders were counting

## Safety Notes

⚠️ **This is permanent deletion**
- Cannot be undone
- Data is gone forever
- Make sure you want to delete

✅ **Safe to delete if:**
- These are test orders
- Incomplete orders are abandoned
- You only want successful transactions

❌ **Don't delete if:**
- Orders might still be processed
- You need incomplete order data for analysis
- Legal requirements to keep all order attempts

## Rollback

**There is NO rollback** - deletion is permanent.

If you want a safer option, use the soft delete script instead (marks as cancelled but keeps data).

## Testing First

**Test in a safe environment:**

1. Create a database backup first
2. Or run on a test/staging database
3. Verify results before running on production

## After Deletion

1. **Refresh Admin Dashboard** - Statistics will update
2. **Check orders table** - Should only see completed automatic orders
3. **Verify revenue** - Should match completed orders only
4. **Test new orders** - Ensure new orders still work

## Files

- ✅ `delete_incomplete_automatic_orders.sql` - Full script with verification
- ✅ `DELETE_INCOMPLETE_ORDERS_GUIDE.md` - This guide
