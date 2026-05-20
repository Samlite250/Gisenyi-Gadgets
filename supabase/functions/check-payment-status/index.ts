import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getPaypackToken(): Promise<string> {
  const res = await fetch('https://payments.paypack.rw/api/auth/agents/authorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: Deno.env.get('PAYPACK_CLIENT_ID'),
      client_secret: Deno.env.get('PAYPACK_CLIENT_SECRET'),
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access) throw new Error('Paypack auth failed');
  return data.access;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { reference } = await req.json();
    if (!reference) {
      return new Response(JSON.stringify({ error: 'Missing reference' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: txn, error: txnError } = await supabase
      .from('payment_transactions')
      .select('id, order_id, status')
      .eq('reference', reference)
      .single();

    if (txnError || !txn) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Already resolved
    if (txn.status === 'paid' || txn.status === 'failed') {
      return new Response(JSON.stringify({ status: txn.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Query Paypack for transaction status
    const token = await getPaypackToken();
    const res = await fetch(`https://payments.paypack.rw/api/transactions/find/${reference}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await res.json();
    console.log('Paypack status check:', JSON.stringify(data));

    // Paypack find endpoint returns the transaction object if it exists (= successful)
    // or a message/error if not found (= still pending or failed)
    let resolvedStatus: 'paid' | 'failed' | 'pending' = 'pending';
    if (res.ok && data?.ref) {
      // Transaction found on Paypack = payment was collected successfully
      resolvedStatus = 'paid';
    } else if (!res.ok && data?.message?.includes('not found')) {
      // Not found yet = still pending (user hasn't approved yet)
      resolvedStatus = 'pending';
    }

    if (resolvedStatus === 'paid' || resolvedStatus === 'failed') {
      await supabase
        .from('payment_transactions')
        .update({ status: resolvedStatus, updated_at: new Date().toISOString() })
        .eq('id', txn.id);

      if (resolvedStatus === 'paid') {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', txn.order_id);
      }
    }

    return new Response(JSON.stringify({ status: resolvedStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('check-payment-status error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
