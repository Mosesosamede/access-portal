import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PRICES } from '@/lib/constants';

export async function POST(req: Request) {
  const { transaction_id, expectedCurrency, userEmail } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Verify with Flutterwave
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

  // 2. Verify existence
  const { data: existingTx, error: selectError } = await supabase
    .from('purchases')
    .select('id')
    .eq('transaction_id', transaction_id)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ success: false, message: 'Database lookup error' }, { status: 500 });
  }

  if (existingTx) {
    return NextResponse.json({ success: false, message: 'Transaction already processed' });
  }

  // 3. Insert Purchase
  const { data: purchase, error: pErr } = await supabase
    .from('purchases')
    .insert({
      transaction_id: transaction_id,
      customer_email: tx.customer.email,
      amount_paid: tx.amount,
    })
    .select('id')
    .single();

  if (pErr) {
      console.error('Insert error:', pErr);
      return NextResponse.json({ success: false, message: 'Database insertion error' }, { status: 500 });
  }

  // 4. Retrieve generated code from database (handled by trigger)
  const { data: codeData, error: cErr } = await supabase
    .from('book_codes')
    .select('code_string')
    .eq('purchase_id', purchase.id)
    .single();

  if (cErr) {
      console.error('Code retrieval error:', cErr);
      return NextResponse.json({ success: false, message: 'Code retrieval error' }, { status: 500 });
  }

  return NextResponse.json({ success: true, code: codeData.code_string });
}
