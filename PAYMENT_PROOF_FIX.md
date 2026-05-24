# Payment Proof Upload Fix

## Problem
Users cannot submit payment proof screenshots during checkout because the `payment-screenshots` storage bucket doesn't exist in Supabase.

## Root Cause
The Supabase storage bucket for payment screenshots was never created. The code references `payment-screenshots` bucket but no migration exists to create it.

## Solution

### Step 1: Create the Storage Bucket

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Storage** → **Buckets**
4. Click **"New bucket"**
5. Fill in the details:
   - **Name**: `payment-screenshots`
   - **Public bucket**: ✅ Enabled (checked)
   - **File size limit**: 10 MB (10485760 bytes)
   - **Allowed MIME types**: 
     - image/jpeg
     - image/jpg
     - image/png
     - image/webp
6. Click **Create bucket**

**Option B: Using SQL Migration**

1. Go to: **SQL Editor** → **New Query**
2. Copy and paste the entire contents of: `supabase/migrations/007_payment_screenshots_bucket.sql`
3. Click **Run**
4. Verify success message appears

### Step 2: Set Storage Policies

The migration file includes proper RLS policies, but if you created the bucket manually, run this SQL:

```sql
-- Allow authenticated users to upload payment proofs
CREATE POLICY "payment_screenshots_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

-- Allow viewing payment screenshots
CREATE POLICY "payment_screenshots_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');
```

### Step 3: Verify the Fix

1. **In Supabase Dashboard:**
   - Go to Storage → Buckets
   - Confirm `payment-screenshots` bucket exists
   - Check that it's marked as "Public"

2. **In the App:**
   - Navigate to Checkout screen
   - Select MTN MoMo or Airtel Money
   - Choose "Manual" payment mode
   - Fill in your name and phone number
   - Click "Tap to upload payment screenshot"
   - Select an image from your gallery
   - The image should appear in the preview
   - Click "Place Order & Submit Proof"
   - Order should be created successfully with the screenshot attached

### Step 4: Test Payment Proof Submission

1. Create a test order with manual payment
2. Upload a screenshot
3. Submit the order
4. Check in Supabase Dashboard:
   - **Storage** → **payment-screenshots** → You should see the uploaded file
   - **Table Editor** → **orders** → Find your order
   - The `manual_payment_screenshot` column should contain the public URL

## Files Changed

- ✅ `supabase/migrations/007_payment_screenshots_bucket.sql` - New migration to create bucket
- ✅ `setup_payment_screenshots_bucket.js` - Helper script with instructions
- ✅ `PAYMENT_PROOF_FIX.md` - This documentation

## Technical Details

### Storage Bucket Configuration

```
Bucket ID: payment-screenshots
Public: true
File Size Limit: 10 MB
Allowed MIME Types: image/jpeg, image/jpg, image/png, image/webp
```

### RLS Policies

- **SELECT**: Public can view (so admins can verify proofs)
- **INSERT**: Authenticated users can upload
- **UPDATE**: Authenticated users can update their uploads
- **DELETE**: Authenticated users can delete (consider restricting to admins in production)

### Code Flow

1. User selects manual payment mode
2. User uploads screenshot via `expo-image-picker`
3. Image is stored locally in state
4. On order submission:
   - Order is created in database
   - Screenshot is uploaded to `payment-screenshots` bucket
   - Public URL is generated
   - Order is updated with screenshot URL and payment details
5. Admin can view payment proof in order management

## Troubleshooting

### Error: "Bucket not found"
- **Solution**: Create the bucket using Step 1 above

### Error: "Permission denied"
- **Solution**: Check RLS policies are created (Step 2)

### Error: "File too large"
- **Solution**: Image exceeds 10MB limit. Compress image or increase bucket limit

### Screenshot doesn't appear after upload
- **Solution**: Check browser console for errors. Verify permissions were granted for photo library access.

## Production Recommendations

1. **Restrict deletion**: Only admins should delete payment proofs
2. **Add image optimization**: Compress images before upload to save storage
3. **Add virus scanning**: Scan uploaded files for security
4. **Implement retention policy**: Archive or delete old payment proofs after X months
5. **Add admin notification**: Send notification to admin when new payment proof is submitted
6. **Add watermark**: Optionally watermark uploaded screenshots with order ID

## Status

- [x] Migration file created
- [x] Setup script created
- [x] Documentation created
- [ ] **ACTION REQUIRED**: Run migration in Supabase Dashboard
- [ ] **ACTION REQUIRED**: Test payment proof submission

Once you run the migration, payment proof uploads will work immediately!
