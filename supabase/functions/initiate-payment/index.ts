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
  if (!res.ok || !data.access) {
    throw new Error(`Paypack auth failed: ${JSON.stringify(data)}`);
  }
  return data.access;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { order_id, phone, provider } = await req.json();
    if (!order_id || !phone || !provider) {
      return new Response(JSON.stringify({ error: 'Missing order_id, phone, or provider' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total, payment_status')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (order.payment_status === 'paid') {
      return new Response(JSON.stringify({ error: 'Order already paid' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const amountRwf = Math.round(Number(order.total));

    // Normalize phone: strip non-digits, ensure 07X format (Paypack uses local format)
    const digits = phone.replace(/\D/g, '');
    let localPhone = digits;
    if (digits.startsWith('250')) localPhone = '0' + digits.slice(3);
    else if (!digits.startsWith('0')) localPhone = '0' + digits;

    const token = await getPaypackToken();

    // Paypack cashin = collect money FROM customer
    const payRes = await fetch('https://payments.paypack.rw/api/transactions/cashin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        amount: amountRwf,
        number: localPhone,
      }),
    });

    const payData = await payRes.json();
    console.log('Paypack cashin response:', JSON.stringify(payData));

    if (!payRes.ok || payData.error) {
      throw new Error(payData.message || payData.error || 'Paypack cashin failed');
    }

    const reference = payData.ref || payData.transaction?.ref || crypto.randomUUID();

    await supabase.from('payment_transactions').insert({
      order_id: order.id,
      provider,
      phone: localPhone,
      amount: amountRwf,
      reference,
      status: 'pending',
    });

    const providerName = provider === 'mtn' ? 'MTN MoMo' : 'Airtel Money';
    return new Response(JSON.stringify({
      success: true,
      reference,
      message: `Check your phone and approve the ${providerName} prompt.`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('initiate-payment error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
