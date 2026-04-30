import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PRICES } from '@/lib/constants';
import { generateCode } from '@/lib/codeGenerator';

export async function POST(req: Request) {
  const { transaction_id, expectedCurrency, userEmail } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );

  const data = await res.json();
  const tx = data.data;

  if (data.status !== 'success' || tx.status !== 'successful') {
    return NextResponse.json({ success: false, message: 'Payment verification failed' });
  }

  // Verification Logic
  const expectedAmount = PRICES[expectedCurrency as keyof typeof PRICES];
  
  if (
    tx.amount !== expectedAmount ||
    tx.currency !== expectedCurrency ||
    tx.customer.email !== userEmail
  ) {
    return NextResponse.json({ success: false, message: 'Payment mismatch' });
  }

  // Prevent Duplicates
  const { data: existingTx } = await supabase
    .from('purchases')
    .select('id')
    .eq('customer_email', tx.customer.email)
    .eq('amount_paid', tx.amount)
    .single();

  if (existingTx) {
    return NextResponse.json({ success: false, message: 'Transaction already processed' });
  }

  // Insert Purchase
  const { data: purchase, error: pErr } = await supabase
    .from('purchases')
    .insert({
      customer_email: tx.customer.email,
      amount_paid: tx.amount,
    })
    .select('id')
    .single();

  if (pErr) return NextResponse.json({ success: false, message: 'DB Error' });

  // Generate and assign code
  const newCode = generateCode();
  const { error: cErr } = await supabase
    .from('book_codes')
    .insert({
      code_string: newCode,
      purchase_id: purchase.id,
      is_used: false
    });

  if (cErr) return NextResponse.json({ success: false, message: 'Code generation error' });

  return NextResponse.json({ success: true, code: newCode });
}
