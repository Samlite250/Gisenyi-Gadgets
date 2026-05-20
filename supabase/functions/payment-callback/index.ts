import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('Paypack webhook:', JSON.stringify(body));

    // Paypack webhook payload: { ref, status, amount, number, ... }
    const reference = body.ref || body.transaction?.ref;
    const rawStatus = body.status || body.transaction?.status || '';

    if (!reference) return new Response('Missing ref', { status: 400 });

    const isSuccess = rawStatus === 'successful';
    const isFailed = rawStatus === 'failed';

    if (!isSuccess && !isFailed) {
      return new Response('OK', { status: 200 }); // pending — ignore
    }

    const { data: txn } = await supabase
      .from('payment_transactions')
      .select('id, order_id, status')
      .eq('reference', reference)
      .single();

    if (!txn) return new Response('Transaction not found', { status: 404 });
    if (txn.status === 'paid') return new Response('Already processed', { status: 200 });

    const newStatus = isSuccess ? 'paid' : 'failed';

    await supabase
      .from('payment_transactions')
      .update({ status: newStatus, callback_payload: body, updated_at: new Date().toISOString() })
      .eq('id', txn.id);

    if (isSuccess) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', txn.order_id);
    }

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('payment-callback error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
